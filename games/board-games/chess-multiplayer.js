/**
 * Chess Multiplayer Synchronization
 * Handles real-time board syncing using Firebase Realtime Database
 * **Timestamp**: 2026-01-26
 */

(function () {
    console.log('Chess Multiplayer: Initializing...');

    let gameId = null;
    let myColor = null; // 'white' or 'black'
    let isMultiplayer = false;

    // Initialize when page loads and Firebase is ready
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        isMultiplayer = urlParams.get('multiplayer') === 'true';
        gameId = urlParams.get('gameId');

        if (isMultiplayer && gameId) {
            console.log('Chess Multiplayer: Active - Game ID:', gameId);
            initMultiplayerSync();
        }
    });

    async function initMultiplayerSync() {
        // Wait for Firebase to be initialized (usually by firebase-config.js)
        if (typeof firebase === 'undefined' || !window.firebaseConfig) {
            console.warn('Chess Multiplayer: Firebase SDK or config not found. Retrying in 1s...');
            setTimeout(initMultiplayerSync, 1000);
            return;
        }

        // Initialize Firebase if not already done
        if (!firebase.apps.length) {
            firebase.initializeApp(window.firebaseConfig);
        }

        const auth = firebase.auth();
        const database = firebase.database();

        // Ensure user is logged in
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log('Chess Multiplayer: User logged in', user.uid);
                setupGameSync(database, user.uid);
            } else {
                console.log('Chess Multiplayer: No user, signing in anonymously...');
                auth.signInAnonymously();
            }
        });
    }

    async function setupGameSync(database, uid) {
        const gameRef = database.ref(`games/${gameId}`);
        const snapshot = await gameRef.once('value');
        const game = snapshot.val();

        if (!game) {
            console.error('Chess Multiplayer: Game not found in database!');
            alert('Game session not found.');
            return;
        }

        // Determine player color
        if (game.players.player1 === uid) {
            myColor = 'white';
        } else if (game.players.player2 === uid) {
            myColor = 'black';
        } else {
            console.warn('Chess Multiplayer: Spectator mode (unauthorized user)');
            alert('You are not a player in this game.');
            return;
        }

        console.log('Chess Multiplayer: You are playing as', myColor);
        updateStatusWithColor();
        disableSinglePlayerFeatures();

        // Flip board for black player for better perspective
        if (myColor === 'black' && typeof flipBoard === 'function') {
            flipBoard();
        }

        // 1. Initial Load of Board State
        if (game.fen && typeof loadFEN === 'function') {
            loadFEN(game.fen);
        }

        // 2. Listen for Remote Updates
        gameRef.on('value', snapshot => {
            const updatedGame = snapshot.val();
            if (!updatedGame) return;

            // Update board if FEN changed from external source
            if (updatedGame.fen && updatedGame.fen !== boardToFEN()) {
                console.log('Chess Multiplayer: Remote state change detected');
                if (typeof loadFEN === 'function') {
                    loadFEN(updatedGame.fen);
                }
            }

            // Sync turn status
            if (updatedGame.turn) {
                currentPlayer = updatedGame.turn; // Update chess.js global
                updateStatusWithTurn(updatedGame.turn);

                // Lock board if it's not our turn
                if (typeof isBoardLocked !== 'undefined') {
                    isBoardLocked = (updatedGame.turn !== myColor);
                }
            }
        });

        // 3. Register Local Move Callback
        onMoveCallback = (moveData) => {
            console.log('Chess Multiplayer: Local move detected, syncing to Firebase');
            gameRef.update({
                fen: moveData.fen,
                turn: moveData.turn,
                lastMove: {
                    fromRow: moveData.from.row,
                    fromCol: moveData.from.col,
                    toRow: moveData.to.row,
                    toCol: moveData.to.col,
                    timestamp: Date.now()
                }
            });
        };
    }

    function updateStatusWithColor() {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            const colorCircle = myColor === 'white' ? '⚪' : '⚫';
            statusEl.innerHTML += `<div style="margin-top: 5px; color: gold; font-size: 0.9em;">${colorCircle} Playing as <strong>${myColor.toUpperCase()}</strong></div>`;
        }
    }

    function updateStatusWithTurn(turn) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            const isMyTurn = turn === myColor;
            const turnText = isMyTurn ? `Your Turn (${myColor})` : `Opponent's Turn (${turn})`;
            const turnColor = isMyTurn ? '#4CAF50' : '#FF9800';

            // Clear or update specific turn status
            let multiplayerStatus = document.getElementById('multiplayer-turn-status');
            if (!multiplayerStatus) {
                multiplayerStatus = document.createElement('div');
                multiplayerStatus.id = 'multiplayer-turn-status';
                statusEl.appendChild(multiplayerStatus);
            }

            multiplayerStatus.style.color = turnColor;
            multiplayerStatus.style.fontWeight = 'bold';
            multiplayerStatus.style.marginTop = '5px';
            multiplayerStatus.textContent = turnText;
        }
    }

    function disableSinglePlayerFeatures() {
        // Hide AI and Cheat controls in multiplayer
        const buttonsToHide = [
            'aiToggle', 'aiVsAiToggle', 'aiControls', 'aiVsAiControls'
        ];

        buttonsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        // Disable "New Game" and "Undo Move" which are local-only
        const newGameBtn = document.querySelector('button[onclick*="safeCallNewGame"]');
        if (newGameBtn) newGameBtn.disabled = true;

        const undoBtn = document.querySelector('button[onclick*="undoMove"]');
        if (undoBtn) undoBtn.disabled = true;

        // Hide Cheat Mode section
        const labels = document.querySelectorAll('h3');
        labels.forEach(h => {
            if (h.textContent.includes('Cheat Mode')) {
                h.parentElement.style.display = 'none';
            }
        });
    }

})();
