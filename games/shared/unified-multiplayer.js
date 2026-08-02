/**
 * Unified Multiplayer System - Automatic Local/Internet Detection
 *
 * Features:
 * - Automatic detection of local vs internet play
 * - WebSocket for local network (same WiFi)
 * - Firebase fallback for internet play (different locations)
 * - Seamless switching between modes
 * - Game state synchronization
 * - Chat support
 * - Disconnection handling
 *
 * **Timestamp**: 2025-12-20
 */

class UnifiedMultiplayer {
    constructor() {
        this.mode = null; // 'websocket' or 'firebase'
        this.websocket = null;
        this.firebaseApp = null;
        this.firebaseDb = null;
        this.playerId = this.generatePlayerId();
        this.gameId = null;
        this.playerName = 'Player_' + this.playerId.slice(0, 6);
        this.isConnected = false;
        this.onConnectionChange = null;
        this.onGameUpdate = null;
        this.onChatMessage = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.pendingGameCreation = null;
    }

    /**
     * Initialize multiplayer system with automatic mode detection
     */
    async initialize() {
        console.log('[UNIFIED] Initializing multiplayer system...');

        // Try WebSocket first (local network)
        const websocketSuccess = await this.tryWebSocketConnection();

        if (websocketSuccess) {
            this.mode = 'websocket';
            console.log('[UNIFIED] Using WebSocket mode (local network)');
            return true;
        }

        // Fall back to Firebase (internet)
        console.log('[UNIFIED] WebSocket failed, trying Firebase...');
        const firebaseSuccess = await this.tryFirebaseConnection();

        if (firebaseSuccess) {
            this.mode = 'firebase';
            console.log('[UNIFIED] Using Firebase mode (internet)');
            return true;
        }

        console.error('[UNIFIED] Both WebSocket and Firebase failed');
        return false;
    }

    /**
     * Initialize with WebSocket only (for local play)
     */
    async initializeWebSocketOnly() {
        console.log('[UNIFIED] Initializing WebSocket-only mode...');

        const websocketSuccess = await this.tryWebSocketConnection();

        if (websocketSuccess) {
            this.mode = 'websocket';
            console.log('[UNIFIED] WebSocket-only mode initialized');
            return true;
        }

        console.error('[UNIFIED] WebSocket connection failed');
        return false;
    }

    /**
     * Initialize with Firebase only (for internet play)
     */
    async initializeFirebaseOnly() {
        console.log('[UNIFIED] Initializing Firebase-only mode...');

        const firebaseSuccess = await this.tryFirebaseConnection();

        if (firebaseSuccess) {
            this.mode = 'firebase';
            console.log('[UNIFIED] Firebase-only mode initialized');
            return true;
        }

        console.error('[UNIFIED] Firebase connection failed');
        return false;
    }

    /**
     * Attempt WebSocket connection (local network)
     */
    async tryWebSocketConnection() {
        return new Promise((resolve) => {
            try {
                // Try multiple possible WebSocket URLs
                const urls = [
                    'ws://localhost:9881',
                    'ws://127.0.0.1:9881',
                    `ws://${window.location.hostname}:9881`
                ];

                let attempts = 0;

                const tryNextUrl = () => {
                    if (attempts >= urls.length) {
                        resolve(false);
                        return;
                    }

                    const url = urls[attempts];
                    attempts++;

                    console.log(`[UNIFIED] Trying WebSocket: ${url}`);

                    const ws = new WebSocket(url);

                    ws.onopen = () => {
                        console.log(`[UNIFIED] WebSocket connected to ${url}`);
                        this.websocket = ws;
                        this.setupWebSocketHandlers();
                        this.isConnected = true;
                        if (this.onConnectionChange) this.onConnectionChange(true, 'websocket');
                        resolve(true);
                    };

                    ws.onerror = () => {
                        console.log(`[UNIFIED] WebSocket failed: ${url}`);
                        setTimeout(tryNextUrl, 500); // Try next URL
                    };

                    ws.onclose = () => {
                        console.log(`[UNIFIED] WebSocket closed: ${url}`);
                    };

                    // Timeout after 2 seconds
                    setTimeout(() => {
                        if (ws.readyState === WebSocket.CONNECTING) {
                            ws.close();
                            tryNextUrl();
                        }
                    }, 2000);
                };

                tryNextUrl();

            } catch (error) {
                console.error('[UNIFIED] WebSocket error:', error);
                resolve(false);
            }
        });
    }

    /**
     * Attempt Firebase connection (internet)
     */
    async tryFirebaseConnection() {
        return new Promise(async (resolve) => {
            try {
                // Check if Firebase config exists
                if (typeof firebase === 'undefined' || !window.firebaseConfig) {
                    console.log('[UNIFIED] Firebase not available');
                    resolve(false);
                    return;
                }

                // Initialize Firebase
                if (!this.firebaseApp) {
                    this.firebaseApp = firebase.initializeApp(window.firebaseConfig);
                    this.firebaseDb = firebase.database();
                }

                // Test connection
                const connectedRef = this.firebaseDb.ref('.info/connected');
                connectedRef.on('value', (snap) => {
                    if (snap.val() === true) {
                        console.log('[UNIFIED] Firebase connected');
                        this.setupFirebaseHandlers();
                        this.isConnected = true;
                        if (this.onConnectionChange) this.onConnectionChange(true, 'firebase');
                        resolve(true);
                    } else {
                        console.log('[UNIFIED] Firebase connection lost');
                        this.isConnected = false;
                        if (this.onConnectionChange) this.onConnectionChange(false, 'firebase');
                    }
                });

                // Timeout after 5 seconds
                setTimeout(() => {
                    if (!this.isConnected) {
                        console.log('[UNIFIED] Firebase connection timeout');
                        resolve(false);
                    }
                }, 5000);

            } catch (error) {
                console.error('[UNIFIED] Firebase error:', error);
                resolve(false);
            }
        });
    }

    /**
     * Setup WebSocket event handlers
     */
    setupWebSocketHandlers() {
        if (!this.websocket) return;

        this.websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('[UNIFIED] WebSocket message parse error:', error);
            }
        };

        this.websocket.onclose = () => {
            console.log('[UNIFIED] WebSocket disconnected');
            this.isConnected = false;
            if (this.onConnectionChange) this.onConnectionChange(false, 'websocket');
            this.attemptReconnect();
        };

        this.websocket.onerror = (error) => {
            console.error('[UNIFIED] WebSocket error:', error);
        };
    }

    /**
     * Setup Firebase event handlers
     */
    setupFirebaseHandlers() {
        // Per-room listeners are attached in createGame/joinGame via
        // attachFirebaseGameListener().
    }

    /**
     * Attach a Realtime Database listener for a game room node.
     * Every snapshot is routed through handleMessage() like a WS message.
     */
    attachFirebaseGameListener(gameId) {
        if (!this.firebaseDb || !gameId) return;
        const gameRef = this.firebaseDb.ref(`games/${gameId}`);
        // Drop any previous listener first (idempotent re-attach).
        gameRef.off('value');
        gameRef.on('value', (snapshot) => {
            const game = snapshot.val();
            if (!game) return;
            this.handleMessage({
                type: 'game_update',
                data: {
                    gameId: gameId,
                    state: game.state || {},
                    status: game.status || 'active',
                    players: game.players || {},
                    lastMove: game.lastMove || game.last_move || null,
                    moves: game.moves || [],
                    hostName: game.hostName || 'Player'
                }
            });
        });

        // Chat + moves arrive under the same node as child additions.
        const chatRef = this.firebaseDb.ref(`games/${gameId}/messages`);
        chatRef.off('child_added');
        chatRef.on('child_added', (snapshot) => {
            const msg = snapshot.val();
            if (!msg) return;
            this.handleMessage({
                type: 'chat_message',
                data: {
                    gameId: gameId,
                    text: msg.text,
                    playerId: msg.playerId,
                    playerName: msg.playerName,
                    timestamp: msg.timestamp
                }
            });
        });
    }

    /**
     * Generate a 6-char room code (same alphabet as multiplayer.js).
     */
    generateGameCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    /**
     * Create a game room in Firebase Realtime Database (games/{code}).
     * Browser-compatible shape: {id, type, host, hostName, status, createdAt,
     * players, state, moves}.
     */
    async createFirebaseGame(gameType, roomName) {
        const gameId = (roomName || this.generateGameCode()).toUpperCase();
        const gameRef = this.firebaseDb.ref(`games/${gameId}`);
        const now = Date.now();
        await gameRef.set({
            id: gameId,
            type: gameType,
            host: this.playerId,
            hostName: this.playerName,
            status: 'waiting',
            createdAt: now,
            players: { [this.playerId]: this.playerName },
            state: {},
            moves: {},
            lastMove: null
        });
        this.gameId = gameId;
        this.attachFirebaseGameListener(gameId);
        if (this.pendingGameCreation) {
            this.pendingGameCreation(gameId);
            this.pendingGameCreation = null;
        }
        return gameId;
    }

    /**
     * Handle incoming messages (both WebSocket and Firebase)
     */
    handleMessage(message) {
        console.log('[UNIFIED] Received message:', message);

        switch (message.type) {
            case 'game_created':
                console.log(`[UNIFIED] Game created: ${message.data.gameId}`);
                this.gameId = message.data.gameId;
                if (this.pendingGameCreation) {
                    this.pendingGameCreation(message.data.gameId);
                    this.pendingGameCreation = null;
                }
                break;
            case 'game_update':
                if (this.onGameUpdate) this.onGameUpdate(message.data);
                break;
            case 'chat_message':
                if (this.onChatMessage) this.onChatMessage(message.data);
                break;
            case 'player_joined':
                console.log(`[UNIFIED] Player joined: ${message.data.playerName}`);
                break;
            case 'player_left':
                console.log(`[UNIFIED] Player left: ${message.data.playerName}`);
                break;
            case 'game_started':
                console.log(`[UNIFIED] Game started: ${message.data.gameId}`);
                this.gameId = message.data.gameId;
                break;
            case 'error':
                console.error('[UNIFIED] Server error:', message.data);
                break;
        }
    }

    /**
     * Send message via current connection mode
     */
    sendMessage(message) {
        if (!this.isConnected) {
            console.error('[UNIFIED] Not connected - cannot send message');
            return false;
        }

        const fullMessage = {
            ...message,
            playerId: this.playerId,
            playerName: this.playerName,
            timestamp: Date.now()
        };

        if (this.mode === 'websocket') {
            this.websocket.send(JSON.stringify(fullMessage));
            return true;
        } else if (this.mode === 'firebase' && this.firebaseDb && this.gameId) {
            // Persist the message under games/{gameId}/messages so the other
            // player receives it via the child_added listener.
            const ref = this.firebaseDb.ref(`games/${this.gameId}/messages`);
            ref.push(fullMessage).catch((err) => {
                console.error('[UNIFIED] Firebase send failed:', err);
            });
            return true;
        } else if (this.mode === 'firebase') {
            console.warn('[UNIFIED] Firebase mode: no active game - cannot send');
            return false;
        }

        return false;
    }

    /**
     * Create a new game room
     */
    async createGame(gameType = 'chess', roomName = null) {
        if (!this.isConnected) {
            console.error('[UNIFIED] Not connected - cannot create game');
            return null;
        }

        if (this.mode === 'websocket') {
            this.sendMessage({
                type: 'create_game',
                data: {
                    gameType: gameType,
                    roomName: roomName || 'auto'
                }
            });
            
            // Return a promise that resolves with the game ID when the server responds
            return new Promise((resolve) => {
                this.pendingGameCreation = resolve;
            });
        } else if (this.mode === 'firebase') {
            // Create the room in Realtime Database and listen for updates.
            return this.createFirebaseGame(gameType, roomName);
        }

        return null;
    }

    /**
     * Join or create a game room
     */
    async joinGame(gameType = 'chess', roomName = null) {
        if (!this.isConnected) {
            console.error('[UNIFIED] Not connected - cannot join game');
            return false;
        }

        if (this.mode === 'websocket') {
            this.sendMessage({
                type: 'join_game',
                data: {
                    gameType: gameType,
                    roomName: roomName || 'auto'
                }
            });
            return true;
        } else if (this.mode === 'firebase') {
            // Join an existing room: normalize the code and listen for updates.
            const gameId = (roomName || gameType).toUpperCase();
            this.gameId = gameId;
            this.attachFirebaseGameListener(gameId);
            return true;
        }

        return false;
    }

    /**
     * Make a move in the current game
     */
    makeMove(move) {
        if (!this.isConnected || !this.gameId) {
            console.error('[UNIFIED] Not in a game - cannot make move');
            return false;
        }

        // In Firebase mode the move also updates the shared game node so the
        // opponent's value listener sees it (not just the message log).
        if (this.mode === 'firebase' && this.firebaseDb) {
            const gameRef = this.firebaseDb.ref(`games/${this.gameId}`);
            gameRef.update({ lastMove: move, last_move: move });
            gameRef.child('moves').push({
                move: move,
                playerId: this.playerId,
                playerName: this.playerName,
                timestamp: Date.now()
            }).catch((err) => console.error('[UNIFIED] Firebase move push failed:', err));
        }

        this.sendMessage({
            type: 'make_move',
            data: {
                gameId: this.gameId,
                move: move
            }
        });

        return true;
    }

    /**
     * Send chat message
     */
    sendChatMessage(text) {
        if (!this.isConnected || !this.gameId) {
            console.error('[UNIFIED] Not in a game - cannot send chat');
            return false;
        }

        this.sendMessage({
            type: 'chat_message',
            data: {
                gameId: this.gameId,
                text: text
            }
        });

        return true;
    }

    /**
     * Leave current game
     */
    leaveGame() {
        if (this.gameId) {
            this.sendMessage({
                type: 'leave_game',
                data: {
                    gameId: this.gameId
                }
            });
            this.gameId = null;
        }
    }

    /**
     * Attempt to reconnect after disconnection
     */
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('[UNIFIED] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[UNIFIED] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(async () => {
            const success = await this.initialize();
            if (success) {
                this.reconnectAttempts = 0;
                console.log('[UNIFIED] Reconnected successfully');
            } else {
                this.attemptReconnect();
            }
        }, 2000 * this.reconnectAttempts); // Exponential backoff
    }

    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            mode: this.mode,
            gameId: this.gameId,
            playerId: this.playerId,
            playerName: this.playerName
        };
    }

    /**
     * Generate unique player ID
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * Set player name
     */
    setPlayerName(name) {
        this.playerName = name;
    }

    /**
     * Set event handlers
     */
    setEventHandlers(handlers) {
        this.onConnectionChange = handlers.onConnectionChange;
        this.onGameUpdate = handlers.onGameUpdate;
        this.onChatMessage = handlers.onChatMessage;
    }

    /**
     * Cleanup and disconnect
     */
    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        if (this.firebaseApp) {
            // Firebase cleanup if needed
        }

        this.isConnected = false;
        this.gameId = null;
        this.mode = null;

        if (this.onConnectionChange) this.onConnectionChange(false, null);
    }
}

// Global instance
window.unifiedMultiplayer = new UnifiedMultiplayer();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[UNIFIED] DOM ready, initializing multiplayer...');
    await window.unifiedMultiplayer.initialize();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedMultiplayer;
}
