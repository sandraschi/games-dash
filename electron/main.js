const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { installMultiMcp, revertMultiMcp } = require('./mcp-installer');

let mainWindow;
let backgroundProcesses = [];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        title: "Games Collection (ALPHA)",
        backgroundColor: '#1a1a1a',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'assets/icon.ico')
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

// Helper to spawn a python process safely
function spawnPythonServer(scriptPath, port, name) {
    const fullScriptPath = path.join(__dirname, '..', scriptPath);
    console.log(`[ORCHESTRATOR] Starting ${name} on port ${port}...`);

    const process = spawn('python', [fullScriptPath], {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
        windowsHide: true // Hide console window on Windows
    });

    process.stdout.on('data', (data) => {
        console.log(`[${name}] ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[${name}] ERR: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`[${name}] Process exited with code ${code}`);
    });

    backgroundProcesses.push(process);
    return process;
}

// Spawn all required AI engines and the web server
function spawnEngines() {
    console.log('[ORCHESTRATOR] Initializing backend stack...');

    // 1. Web Server (Main UI logic)
    spawnPythonServer('backend/web-server.py', 9876, 'WEB-SERVER');

    // 2. Stockfish (Chess)
    spawnPythonServer('backend/stockfish-server.py', 10001, 'STOCKFISH');

    // 3. KataGo (Go)
    spawnPythonServer('backend/go-server.py', 10002, 'KATAGO');

    // 4. YaneuraOu (Shogi)
    spawnPythonServer('backend/shogi-server.py', 10003, 'SHOGI');

    console.log('[ORCHESTRATOR] All engines spawned.');
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
    spawnEngines();
    createMenu();
    createWindow();
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
