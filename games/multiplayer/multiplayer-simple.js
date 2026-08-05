// Multiplayer client for board games - Firebase Realtime Database edition
// Replaces the old local WebSocket server (port 9877), which is gone.
// Games play via shared links: ?multiplayer=true&game_id=X&color=Y
// **Timestamp**: 2026-08-05

let db = null;
let playerId = null;
let playerName = null;
let currentGame = null;
// Note: pages declare their own `myColor` from the URL - do not declare one here.

function _uid() {
    return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function _loadScripts(srcs, done) {
    if (!srcs.length) { done(); return; }
    const script = document.createElement('script');
    script.src = srcs[0];
    script.onload = () => _loadScripts(srcs.slice(1), done);
    script.onerror = () => _loadScripts(srcs.slice(1), done);
    document.head.appendChild(script);
}

// Ensure the Firebase SDK + config are loaded (pages historically had neither)
function ensureFirebase(cb) {
    if (db) { cb(); return; }
    const srcs = [];
    if (typeof firebase === 'undefined' || !firebase.app) srcs.push('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
    if (typeof firebase === 'undefined' || typeof firebase.database !== 'function') srcs.push('https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js');
    if (typeof firebase === 'undefined' || typeof firebase.auth !== 'function') srcs.push('https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js');
    srcs.push('/games/shared/firebase-config.js');
    _loadScripts(srcs, () => {
        if (typeof firebase === 'undefined' || !firebase.database || !window.firebaseConfig) {
            showStatus('Firebase unavailable - multiplayer offline.', 'error');
            return;
        }
        if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
        db = firebase.database();

        // The RTDB rules require an authenticated session (anonymous is allowed).
        const finish = () => cb();
        if (firebase.auth) {
            firebase.auth().signInAnonymously()
                .then(finish)
                .catch((err) => {
                    console.error('Anonymous sign-in failed:', err);
                    showStatus('Multiplayer needs Firebase sign-in - offline.', 'error');
                });
        } else {
            finish();
        }
    });
}

// Attach listeners for a game identified by URL params (?multiplayer=true&game_id=...)
function initFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('multiplayer') !== 'true') return;
    const gameId = urlParams.get('game_id');
    const color = urlParams.get('color');
    if (!gameId) return;

    ensureFirebase(() => {
        playerId = _uid();
        playerName = localStorage.getItem('mp-name') || ('Player' + Math.floor(Math.random() * 1000));
        currentGame = { game_id: gameId, my_color: color };

        const gameRef = db.ref('games/' + gameId);

        // Presence: mark myself online, clear on disconnect
        const presenceRef = gameRef.child('presence/' + playerId);
        presenceRef.set(true);
        presenceRef.onDisconnect().set(false);

        // Opponent moves
        gameRef.child('moves').orderByChild('ts').on('child_added', (snap) => {
            const m = snap.val();
            if (m && m.uid !== playerId && window.handleOpponentMove) {
                window.handleOpponentMove(m.move);
                showStatus('Opponent moved', 'info');
            }
        });

        // Chat
        gameRef.child('messages').on('child_added', (snap) => {
            const m = snap.val();
            if (m && m.uid !== playerId && window.handleChatMessage) {
                window.handleChatMessage(m.from || 'Opponent', m.message);
            }
        });

        // Opponent presence
        gameRef.child('presence').on('value', (snap) => {
            const presence = snap.val() || {};
            const othersOnline = Object.keys(presence).some(k => k !== playerId && presence[k] === true);
            if (!othersOnline && currentGame) {
                showStatus('Opponent disconnected', 'warning');
                currentGame = null;
                updateUI();
            }
        });

        showStatus('Connected. Waiting for opponent moves...', 'info');
        updateUI();
    });
}

function sendMove(gameId, move) {
    if (!db || !gameId) {
        console.error('Not connected to multiplayer!');
        return;
    }
    db.ref('games/' + gameId + '/moves').push({ uid: playerId, move: move, ts: Date.now() });
}

function sendChat(gameId, message) {
    if (!db || !gameId) return;
    db.ref('games/' + gameId + '/messages').push({
        uid: playerId, from: playerName, message: message, ts: Date.now()
    });
}

// Legacy matchmaking entry points (the old WebSocket lobby). Games are now
// joined via shared links (?multiplayer=true&game_id=...), so these inform
// the user instead of failing silently.
function initMultiplayer() {
    showStatus('Multiplayer is joined via a shared game link (Firebase).', 'info');
}

function joinGame(gameType) {
    showStatus('Matchmaking moved to game links (Firebase).', 'info');
}

function showLobby() {
    // No lobby UI in the modern flow - the game page itself is the lobby.
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('multiplayerStatus');
    if (statusEl) {
        statusEl.textContent = message;
        if (type === 'success') {
            statusEl.style.background = 'rgba(76, 175, 80, 0.3)';
        } else if (type === 'error') {
            statusEl.style.background = 'rgba(255, 107, 107, 0.3)';
        } else if (type === 'warning') {
            statusEl.style.background = 'rgba(255, 193, 7, 0.3)';
        } else {
            statusEl.style.background = 'rgba(33, 150, 243, 0.3)';
        }
        statusEl.style.color = 'white';
    }
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function updateUI() {
    const statusEl = document.getElementById('multiplayerStatus');
    if (!statusEl) return;
    if (currentGame) {
        statusEl.textContent = `✅ Multiplayer active - game ${currentGame.game_id}`;
        statusEl.style.background = 'rgba(76, 175, 80, 0.3)';
        statusEl.style.color = 'white';
    } else {
        statusEl.textContent = '❌ Not connected';
        statusEl.style.background = 'rgba(255, 107, 107, 0.3)';
        statusEl.style.color = 'white';
    }
}

// Expose the API used by game pages
window.initMultiplayer = initMultiplayer;
window.joinGame = joinGame;
window.sendMove = sendMove;
window.sendChat = sendChat;
window.currentGame = () => currentGame;
window.playerId = () => playerId;
window.showLobby = showLobby;

window.addEventListener('load', () => {
    initFromUrl();
    setInterval(updateUI, 1000);
});

console.log('✅ Multiplayer client loaded (Firebase)');
