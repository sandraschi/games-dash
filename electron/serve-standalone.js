/**
 * Minimal static file server for standalone Electron mode (no Python/Docker).
 * Serves games-app content and provides API stubs for offline/arcade-only use.
 */
const express = require('express');
const path = require('path');

const PORT = 9876;
const app = express();

const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir, {
    maxAge: 0,
    etag: true,
    index: false
}));

app.get('/api/test', (req, res) => {
    res.json({ test: 'working', mode: 'standalone', timestamp: Date.now() });
});

app.get('/api/config', (req, res) => {
    res.json({
        ai_server_host: 'localhost',
        is_remote: false,
        ports: {
            stockfish: 10001,
            katago: 10002,
            yaneuraou: 10003,
            multiplayer: 9877,
            kanji_api: 5003,
            jlpt_api: 5001
        },
        remote_access_enabled: false,
        competitive_play: { enabled: false, note: 'Standalone mode - run START_GAMES.ps1 for full AI' }
    });
});

app.get('/api/servers', (req, res) => {
    res.json({ servers: [], mode: 'standalone' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found' });
    } else {
        res.status(404).sendFile(path.join(rootDir, 'index.html'));
    }
});

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`[STANDALONE] Serving at http://localhost:${PORT}`);
});

module.exports = server;
