// WebRTC Integration for Real-Time Multiplayer Games
// **Timestamp**: 2025-12-03
// Uses simple-peer for easy WebRTC

class WebRTCGame {
    constructor(gameType) {
        this.gameType = gameType;
        this.gameId = null;
        this.isHost = false;
        this.peer = null;
        this.connected = false;
        this.opponentName = 'Opponent';
    }

    async init(gameId, isHost) {
        this.gameId = gameId;
        this.isHost = isHost;
        
        if (typeof SimplePeer === 'undefined') {
            console.error('SimplePeer not loaded! Add: <script src="https://cdn.jsdelivr.net/npm/simple-peer@9.11.1/simplepeer.min.js"></script>');
            return false;
        }
        
        if (!firebase || !firebase.database) {
            console.error('Firebase not initialized!');
            return false;
        }
        
        await this.setupPeerConnection();
        return true;
    }

    async setupPeerConnection() {
        const db = firebase.database();
        const signalRef = db.ref(`rtc_signals/${this.gameId}`);
        
        // Create peer
        this.peer = new SimplePeer({
            initiator: this.isHost,
            trickle: false
        });
        
        // When we have a signal, send it via Firebase
        this.peer.on('signal', signal => {
            const key = this.isHost ? 'offer' : 'answer';
            signalRef.child(key).set(signal);
            console.log(`📡 Sent ${key} signal`);
        });
        
        // Listen for opponent's signal
        const opponentKey = this.isHost ? 'answer' : 'offer';
        signalRef.child(opponentKey).on('value', snapshot => {
            const signal = snapshot.val();
            if (signal && !this.connected) {
                console.log(`📡 Received ${opponentKey} signal`);
                this.peer.signal(signal);
            }
        });
        
        // Connection established
        this.peer.on('connect', () => {
            console.log('✅ WebRTC connection established!');
            this.connected = true;
            this.onConnected();
        });
        
        // Receive data
        this.peer.on('data', data => {
            try {
                const message = JSON.parse(data.toString());
                this.onMessage(message);
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        });
        
        // Handle errors
        this.peer.on('error', error => {
            console.error('WebRTC error:', error);
            alert('Connection error! Try recreating the game.');
        });
    }

    sendGameState(state) {
        if (this.connected && this.peer) {
            this.peer.send(JSON.stringify(state));
        }
    }

    // Override in game-specific code
    onConnected() {
        alert('🎮 Connected to opponent! Game starting...');
    }

    // Override in game-specific code
    onMessage(message) {
        console.log('Received:', message);
    }

    disconnect() {
        if (this.peer) {
            this.peer.destroy();
        }
        
        if (firebase && this.gameId) {
            firebase.database().ref(`rtc_signals/${this.gameId}`).remove();
        }
    }
}

// Example usage for Pong:
/*
// In pong.html:
<script src="https://cdn.jsdelivr.net/npm/simple-peer@9.11.1/simplepeer.min.js"></script>
<script src="js/webrtc-game.js"></script>

// In pong.js:
const rtc = new WebRTCGame('pong');
if (await rtc.init(gameId, isHost)) {
    // Multiplayer mode
    rtc.onMessage = (message) => {
        if (message.type === 'paddle') {
            opponentPaddleY = message.y;
        }
    };
    
    // Send paddle position every frame
    rtc.sendGameState({type: 'paddle', y: myPaddleY});
}
*/

if (typeof module !== 'undefined') {
    module.exports = WebRTCGame;
}

