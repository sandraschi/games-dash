use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::AppHandle;

pub struct BackendProcess(pub Mutex<Option<Child>>);

const BACKEND_NAME: &str = "ai-games-collection-backend.exe";
const BACKEND_PORT: u16 = 10987;
const LOG_FILE: &str = "backend-spawn.log";

fn dev_backend_path() -> Option<PathBuf> {
    if !cfg!(debug_assertions) {
        return None;
    }
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("binaries")
        .join("ai-games-collection-backend-x86_64-pc-windows-msvc.exe");
    path.exists().then_some(path)
}

fn resolve_bundled_backend(app: &AppHandle) -> Result<PathBuf, String> {
    if let Some(p) = dev_backend_path() {
        return Ok(p);
    }

    // Try resources/ subfolder next to exe first (NSIS install layout)
    if let Ok(exe_dir) = std::env::current_exe() {
        if let Some(parent) = exe_dir.parent() {
            let resources_path = parent.join("resources").join(BACKEND_NAME);
            if resources_path.exists() {
                return Ok(resources_path);
            }
        }
    }

    // Fall back to Tauri resource resolver
    app.path()
        .resolve(BACKEND_NAME, tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("bundled backend missing: {e}"))
}

fn free_port() {
    #[cfg(windows)]
    {
        let _ = Command::new("powershell")
            .args([
                "-NoProfile",
                "-Command",
                &format!(
                    "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | \
                     ForEach-Object {{ taskkill /F /PID $_.OwningProcess /T 2>$null }}",
                    port = BACKEND_PORT,
                ),
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .and_then(|mut c| c.wait());
        std::thread::sleep(std::time::Duration::from_millis(300));
    }
}

fn stop_managed_child(state: &BackendProcess) {
    if let Ok(mut locked) = state.0.lock() {
        if let Some(mut child) = locked.take() {
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

fn log_line(app: &AppHandle, message: &str) {
    eprintln!("[backend] {message}");
    if let Ok(dir) = app.path().app_log_dir() {
        let _ = fs::create_dir_all(&dir);
        let log_path = dir.join("backend-spawn.log");
        if let Ok(mut file) = fs::OpenOptions::new().create(true).append(true).open(log_path) {
            use std::io::Write;
            let _ = writeln!(file, "{message}");
        }
    }
}

fn materialize_backend(app: &AppHandle) -> Result<PathBuf, String> {
    if let Some(dev_path) = dev_backend_path() {
        log_line(app, &format!("using dev backend: {}", dev_path.display()));
        return Ok(dev_path);
    }
    let bundled = resolve_bundled_backend(app)?;
    log_line(app, &format!("using bundled backend: {}", bundled.display()));
    Ok(bundled)
}

fn watch_backend_stream(stdout: std::process::ChildStdout, log_path: PathBuf, app: AppHandle) {
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(text) = line {
                if text.contains("Uvicorn running") || text.contains("Application startup complete") {
                    let _ = app.emit("backend-status", "ready");
                }
            }
        }
        if let Ok(mut f) = fs::OpenOptions::new().append(true).create(true).open(&log_path) {
            use std::io::Write;
            let _ = writeln!(f, "[backend] stream ended");
        }
    });
}

pub fn spawn_backend(app: AppHandle, state: &BackendProcess) -> Result<String, String> {
    stop_managed_child(state);
    free_port();

    let path = materialize_backend(&app)?;

    let log_dir = app
        .path()
        .app_log_dir()
        .map_err(|e| format!("log dir: {e}"))?;
    fs::create_dir_all(&log_dir).map_err(|e| format!("create log dir: {e}"))?;
    let log_path = log_dir.join(LOG_FILE);

    let mut cmd = Command::new(&path);
    cmd.env("AI_GAMES_COLLECTION_BACKEND_PORT", BACKEND_PORT.to_string())
        .env("AI_GAMES_COLLECTION_TAURI", "1")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = cmd.spawn().map_err(|e| format!("spawn failed: {e}"))?;

    if let Some(stdout) = child.stdout.take() {
        watch_backend_stream(stdout, log_path, app);
    }

    if let Ok(mut locked) = state.0.lock() {
        locked.replace(child);
    }

    Ok("Backend starting".into())
}
