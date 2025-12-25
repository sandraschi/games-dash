// Simple WebSocket Multiplayer Client
// No Firebase required - uses local WebSocket server!
// **Timestamp**: 2025-12-04

let ws = null;
let playerId = null;
let playerName = null;
let currentGame = null;
let reconnectAttempts = 0;
const MAX_RECONNECTS = 5;

// Initialize connection
function initMultiplayer() {
    const name = prompt("Enter your name:", `Player${Math.floor(Math.random() * 1000)}`);
    if (!name) return;
    
    playerName = name;
    connect();
}

function connect() {
    // Auto-detect WebSocket URL: use current hostname (works for localhost and Tailscale)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const wsUrl = `${protocol}//${hostname}:9877`;
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    
    try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            console.log('✅ Connected to multiplayer server');
            reconnectAttempts = 0;
            showStatus('Connected! Registering...', 'info');
            
            // Register with server
            try {
                ws.send(JSON.stringify({
                    type: 'register',
                    name: playerName
                }));
            } catch (error) {
                console.error('Error sending registration:', error);
                showStatus('Error registering with server', 'error');
            }
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            showStatus('Connection error. Make sure multiplayer server is running!', 'error');
        };
        
        ws.onclose = () => {
            console.log('⚠️  Disconnected from server');
            showStatus('Disconnected from server', 'warning');
            
            // Attempt to reconnect
            if (reconnectAttempts < MAX_RECONNECTS) {
                reconnectAttempts++;
                setTimeout(() => {
                    console.log(`Reconnecting... (attempt ${reconnectAttempts})`);
                    connect();
                }, 2000);
            }
        };
        
    } catch (error) {
        console.error('Failed to connect:', error);
        showStatus('Failed to connect. Start multiplayer-server.py first!', 'error');
    }
}

function handleServerMessage(data) {
    console.log('Server message:', data);
    
    switch (data.type) {
        case 'registered':
            playerId = data.player_id;
            playerName = data.name;
            showStatus(`Connected as ${data.name}`, 'success');
            updateUI();
            showLobby();
            break;
            
        case 'waiting':
            showStatus('Waiting for opponent...', 'info');
            break;
            
        case 'game_started':
            currentGame = {
                game_id: data.game_id,
                game_type: data.game_type,
                opponent: data.opponent,
                opponent_id: data.opponent_id,
                my_color: data.your_color,
                my_turn: data.your_turn
            };
            showStatus(`Game started! Playing ${data.game_type} vs ${data.opponent}`, 'success');
            updateUI();
            
            // If this is chess, redirect to chess page with multiplayer mode
            if (data.game_type === 'chess') {
                window.location.href = `chess.html?multiplayer=true&game_id=${data.game_id}&color=${data.your_color}`;
            }
            break;
            
        case 'opponent_move':
            if (window.handleOpponentMove) {
                window.handleOpponentMove(data.move);
            }
            showStatus(`Opponent moved: ${data.move}`, 'info');
            break;
            
        case 'move_applied':
            showStatus('Move applied!', 'success');
            break;
            
        case 'opponent_disconnected':
            showStatus('Opponent disconnected', 'warning');
            currentGame = null;
            updateUI();
            break;
            
        case 'chat':
            if (window.handleChatMessage) {
                window.handleChatMessage(data.from, data.message);
            }
            break;
            
        case 'error':
            showStatus(`Error: ${data.message}`, 'error');
            break;
            
        case 'pong':
            // Keep-alive response
            break;
    }
}

function joinGame(gameType) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        showStatus('Not connected to server!', 'error');
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'join',
        game_type: gameType
    }));
}

function sendMove(gameId, move) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error('Not connected!');
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'move',
        game_id: gameId,
        move: move
    }));
}

function sendChat(gameId, message) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        return;
    }
    
    ws.send(JSON.stringify({
        type: 'chat',
        game_id: gameId,
        message: message
    }));
}

function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('multiplayerStatus');
    if (statusEl) {
        statusEl.textContent = message;
        // Update background color based on status type
        if (type === 'success') {
            statusEl.style.background = 'rgba(76, 175, 80, 0.3)';
            statusEl.style.color = 'white';
        } else if (type === 'error') {
            statusEl.style.background = 'rgba(255, 107, 107, 0.3)';
            statusEl.style.color = 'white';
        } else if (type === 'warning') {
            statusEl.style.background = 'rgba(255, 193, 7, 0.3)';
            statusEl.style.color = 'white';
        } else {
            statusEl.style.background = 'rgba(33, 150, 243, 0.3)';
            statusEl.style.color = 'white';
        }
    }
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function updateUI() {
    // Update UI elements based on connection state
    const statusEl = document.getElementById('multiplayerStatus');
    if (statusEl) {
        if (playerId && ws && ws.readyState === WebSocket.OPEN) {
            statusEl.textContent = `✅ Connected as ${playerName}`;
            statusEl.style.background = 'rgba(76, 175, 80, 0.3)';
            statusEl.style.color = 'white';
        } else if (ws && ws.readyState === WebSocket.CONNECTING) {
            statusEl.textContent = '🔄 Connecting...';
            statusEl.style.background = 'rgba(255, 193, 7, 0.3)';
            statusEl.style.color = 'white';
        } else {
            statusEl.textContent = '❌ Not connected';
            statusEl.style.background = 'rgba(255, 107, 107, 0.3)';
            statusEl.style.color = 'white';
        }
    }
}

function showLobby() {
    const authScreen = document.getElementById('authScreen');
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (authScreen) authScreen.style.display = 'none';
    if (lobbyScreen) lobbyScreen.style.display = 'block';
    if (playerName) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) usernameEl.textContent = playerName;
    }
    updateUI();
}

// Make functions globally accessible
window.initMultiplayer = initMultiplayer;
window.joinGame = joinGame;
window.sendMove = sendMove;
window.sendChat = sendChat;
window.currentGame = () => currentGame;
window.playerId = () => playerId;
window.showLobby = showLobby;

// Initialize UI on page load
window.addEventListener('load', () => {
    updateUI();
    // Periodically update UI to reflect connection status
    setInterval(updateUI, 1000);
});

console.log('✅ Simple multiplayer client loaded');

