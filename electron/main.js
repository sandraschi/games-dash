const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { installMultiMcp, revertMultiMcp } = require('./mcp-installer');
const http = require('http');

let mainWindow;
let backgroundProcesses = [];
const forceStandalone = process.argv.includes('--standalone');
const forceFull = process.argv.includes('--full');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        title: "Games Collection",
        backgroundColor: '#1a1a1a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, '..', 'icon-192.png')
    });

    // Load the dashboard with retry logic to wait for the web-server to boot
    const loadDashboard = () => {
        mainWindow.loadURL('http://localhost:9876').catch(() => {
            console.log('[ORCHESTRATOR] Web server not ready yet, retrying in 1s...');
            setTimeout(loadDashboard, 1000);
        });
    };

    loadDashboard();

    // Open DevTools in dev mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

const fs = require('fs');

function getAppRoot() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app.asar.unpacked');
    }
    return path.join(__dirname, '..');
}

function getBundledPythonExe() {
    const root = getAppRoot();
    const exe = path.join(root, 'python-embed', 'python.exe');
    return fs.existsSync(exe) ? exe : null;
}

function getPythonExecutable() {
    const bundled = getBundledPythonExe();
    if (bundled) return bundled;
    return process.platform === 'win32' ? 'python' : 'python3';
}

function checkPython(cb) {
    const bundled = getBundledPythonExe();
    if (bundled) {
        const proc = spawn(bundled, ['--version'], { stdio: 'pipe' });
        proc.on('error', () => cb(false));
        proc.on('close', (code) => cb(code === 0));
        return;
    }
    const candidates = process.platform === 'win32' ? ['python', 'py'] : ['python3', 'python'];
    let i = 0;
    function tryNext() {
        if (i >= candidates.length) { cb(false); return; }
        const proc = spawn(candidates[i], ['--version'], { stdio: 'pipe' });
        proc.on('error', () => { i++; tryNext(); });
        proc.on('close', (code) => { if (code === 0) cb(true); else { i++; tryNext(); } });
    }
    tryNext();
}

function spawnPythonServer(scriptPath, port, name, envOverrides = {}) {
    const root = getAppRoot();
    const fullScriptPath = path.join(root, scriptPath);
    const scriptDir = path.dirname(scriptPath);
    const cwd = scriptDir ? path.join(root, scriptDir) : root;
    if (!fs.existsSync(fullScriptPath)) {
        console.error(`[ORCHESTRATOR] Script not found: ${fullScriptPath}`);
        return null;
    }
    console.log(`[ORCHESTRATOR] Starting ${name} on port ${port}...`);

    const env = { ...process.env, ...envOverrides };
    const proc = spawn(getPythonExecutable(), [fullScriptPath], {
        cwd, env, stdio: 'pipe', windowsHide: true
    });

    proc.stdout.on('data', (data) => console.log(`[${name}] ${data}`));
    proc.stderr.on('data', (data) => console.error(`[${name}] ERR: ${data}`));
    proc.on('close', (code) => console.log(`[${name}] Process exited with code ${code}`));

    backgroundProcesses.push(proc);
    return proc;
}

function startStandaloneServer(cb) {
    require('./serve-standalone.js');
    setTimeout(cb, 300);
}

function checkExistingServer(cb) {
    const req = http.get('http://127.0.0.1:9876/api/test', (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
            cb(true);
        });
    });
    req.on('error', () => cb(false));
    req.setTimeout(500, () => { req.destroy(); cb(false); });
}

function spawnEngines() {
    if (forceStandalone) {
        console.log('[ORCHESTRATOR] Standalone mode (--standalone)');
        startStandaloneServer(createWindow);
        return;
    }
    if (forceFull) {
        console.log('[ORCHESTRATOR] Full mode - spawning Python backend...');
        spawnPythonServer('backend/web-server.py', 9876, 'WEB-SERVER', {
            STOCKFISH_PORT: '10001',
            SHOGI_PORT: '10003',
            GO_PORT: '10002'
        });
        spawnPythonServer('backend/stockfish-server.py', 10001, 'STOCKFISH');
        spawnPythonServer('backend/go-server.py', 10002, 'KATAGO');
        spawnPythonServer('backend/shogi-server.py', 10003, 'SHOGI');
        createWindow();
        return;
    }
    checkExistingServer((exists) => {
        if (exists) {
            console.log('[ORCHESTRATOR] Using existing server on :9876');
            createWindow();
        } else {
            console.log('[ORCHESTRATOR] No server found - starting standalone (no Python/Docker)');
            startStandaloneServer(createWindow);
        }
    });
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Start AI Servers',
                    click: async () => {
                        checkPython((ok) => {
                            if (!ok) {
                                dialog.showMessageBox(mainWindow, {
                                    type: 'warning',
                                    title: 'Python Required',
                                    message: 'Python not found in PATH',
                                    detail: 'AI servers (Stockfish, KataGo, Shogi) require Python 3.\n\nInstall from: https://www.python.org/downloads/\n\nEnsure "Add Python to PATH" is checked during installation.'
                                });
                                return;
                            }
                            spawnPythonServer('backend/stockfish-server.py', 10001, 'STOCKFISH');
                            spawnPythonServer('backend/go-server.py', 10002, 'KATAGO');
                            spawnPythonServer('backend/shogi-server.py', 10003, 'SHOGI');
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'AI Servers Started',
                                message: 'Stockfish, KataGo, and Shogi servers are starting.',
                                detail: 'Chess, Go, and Shogi AI will be available after a few seconds. Reload the app (Ctrl+R) if games do not detect them.'
                            });
                        });
                    }
                },
                {
                    label: 'Install Games MCP in All IDEs',
                    click: async () => {
                        const results = installMultiMcp();
                        const summary = results.map(r => `${r.name}: ${r.success ? '✅ Success' : '❌ Failed (' + r.error + ')'}`).join('\n');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Multi-IDE Installation Result',
                            message: 'MCP Installation Summary',
                            detail: summary + '\n\nPlease restart your IDEs for changes to take effect.'
                        });
                    }
                },
                {
                    label: 'Revert Last Installation (All IDEs)',
                    click: async () => {
                        const results = revertMultiMcp();
                        const summary = results.map(r => `${r.name}: ${r.success ? '✅ Reverted' : '❌ Failed (' + r.error + ')'}`).join('\n');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'Revert Result',
                            message: 'MCP Revert Summary',
                            detail: summary
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Debug Mode',
                    type: 'checkbox',
                    checked: process.argv.includes('--dev'),
                    click: (menuItem) => {
                        if (menuItem.checked) {
                            mainWindow.webContents.openDevTools();
                        } else {
                            mainWindow.webContents.closeDevTools();
                        }
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About Games Collection',
                    click: async () => {
                        dialog.showMessageBox(mainWindow, {
                            title: 'About',
                            message: 'Games Collection Desktop',
                            detail: 'Version 0.1.0-alpha (Vienna SOTA 2026)\nBuilt by sandraschi\n\nSupports: Claude, Windsurf, Cursor, Antigravity, Zen.'
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
    createMenu();
    spawnEngines();
});

app.on('window-all-closed', function () {
    // Kill all background processes on exit
    backgroundProcesses.forEach(proc => proc.kill());
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

// IPC communication
ipcMain.on('get-system-status', (event) => {
    event.reply('system-status', {
        status: 'ALPHA',
        engines: backgroundProcesses.length,
        platform: process.platform
    });
});
