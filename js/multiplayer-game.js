// Multiplayer Game Integration for Turn-Based Games
// **Timestamp**: 2025-12-03

class MultiplayerGame {
    constructor(gameType) {
        this.gameType = gameType;
        this.gameId = null;
        this.isMultiplayer = false;
        this.myRole = null; // 'player1' or 'player2'
        this.currentTurn = null;
        this.opponentName = 'Opponent';
    }

    // Check if this is a multiplayer game
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        this.isMultiplayer = urlParams.get('multiplayer') === 'true';
        this.gameId = urlParams.get('gameId');
        
        if (this.isMultiplayer && this.gameId) {
            console.log(`🌐 Multiplayer ${this.gameType} game: ${this.gameId}`);
            this.setupMultiplayer();
            return true;
        }
        
        return false;
    }

    async setupMultiplayer() {
        if (!firebase || !firebase.database) {
            alert('Firebase not initialized! Using local mode.');
            this.isMultiplayer = false;
            return;
        }

        const db = firebase.database();
        const gameRef = db.ref(`games/${this.gameId}`);
        
        // Get game data
        const snapshot = await gameRef.once('value');
        const game = snapshot.val();
        
        if (!game) {
            alert('Game not found!');
            window.location.href = 'multiplayer.html';
            return;
        }
        
        // Determine player role
        const currentUser = firebase.auth().currentUser;
        if (game.players.player1 === currentUser.uid) {
            this.myRole = 'player1';
            this.opponentName = game.player2Name || 'Opponent';
        } else {
            this.myRole = 'player2';
            this.opponentName = game.hostName || 'Opponent';
        }
        
        console.log(`✅ You are ${this.myRole}`);
        console.log(`✅ Playing against: ${this.opponentName}`);
        
        // Listen for game state changes
        gameRef.child('gameState').on('value', snapshot => {
            const gameState = snapshot.val();
            if (gameState) {
                this.onGameStateUpdate(gameState);
            }
        });
        
        // Initialize game state if player1
        if (this.myRole === 'player1') {
            await this.initializeGameState(gameRef);
        }
        
        this.showMultiplayerUI();
    }

    async initializeGameState(gameRef) {
        await gameRef.update({
            'gameState': {
                board: this.getInitialBoard(),
                currentTurn: 'player1',
                moves: [],
                status: 'active'
            },
            status: 'active'
        });
    }

    getInitialBoard() {
        // Override in game-specific code
        return null;
    }

    showMultiplayerUI() {
        // Add multiplayer info to UI
        const statusElement = document.getElementById('status');
        if (statusElement) {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'multiplayerInfo';
            infoDiv.style.cssText = 'background: rgba(76, 175, 80, 0.2); padding: 15px; border-radius: 10px; margin: 10px 0; border: 2px solid #4CAF50;';
            infoDiv.innerHTML = `
                <strong style="color: #4CAF50;">🌐 Online Match</strong><br>
                <p style="margin: 5px 0;">Playing against: <strong>${this.opponentName}</strong></p>
                <p style="margin: 5px 0;">Game Code: <strong>${this.gameId}</strong></p>
                <p id="turnIndicator" style="margin: 5px 0; color: #FFD700;"></p>
            `;
            statusElement.parentElement.insertBefore(infoDiv, statusElement);
        }
        
        this.updateTurnIndicator();
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turnIndicator');
        if (indicator && this.currentTurn) {
            const isMyTurn = this.currentTurn === this.myRole;
            indicator.textContent = isMyTurn ? 
                '✅ Your Turn!' : 
                `⏳ Waiting for ${this.opponentName}...`;
            indicator.style.color = isMyTurn ? '#4CAF50' : '#FFD700';
        }
    }

    async makeMove(moveData) {
        if (!this.isMultiplayer) return true; // Local mode
        
        if (this.currentTurn !== this.myRole) {
            alert('Not your turn!');
            return false;
        }
        
        try {
            const db = firebase.database();
            const gameRef = db.ref(`games/${this.gameId}/gameState`);
            const snapshot = await gameRef.once('value');
            const gameState = snapshot.val();
            
            // Update game state
            gameState.moves.push(moveData);
            gameState.currentTurn = this.myRole === 'player1' ? 'player2' : 'player1';
            
            // Apply move to board (game-specific)
            this.applyMoveToState(gameState, moveData);
            
            await gameRef.set(gameState);
            
            this.currentTurn = gameState.currentTurn;
            this.updateTurnIndicator();
            
            return true;
        } catch (error) {
            console.error('Failed to make move:', error);
            alert('Failed to send move!');
            return false;
        }
    }

    applyMoveToState(gameState, moveData) {
        // Override in game-specific code
    }

    onGameStateUpdate(gameState) {
        // Override in game-specific code
        this.currentTurn = gameState.currentTurn;
        this.updateTurnIndicator();
    }
}

// Export for use in game files
if (typeof module !== 'undefined') {
    module.exports = MultiplayerGame;
}

