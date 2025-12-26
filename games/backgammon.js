// Backgammon - Ancient Strategy Game
// **Timestamp**: 2025-12-26

// Game state
let gameState = {
    board: Array(24).fill(null).map(() => ({ white: 0, black: 0 })), // 24 points
    bar: { white: 0, black: 0 }, // Pieces on bar
    borneOff: { white: 0, black: 0 }, // Pieces borne off
    currentPlayer: 'white',
    dice: [0, 0],
    availableMoves: [],
    gameActive: true,
    aiEnabled: false,
    moveHistory: []
};

// Standard backgammon setup
function initializeBoard() {
    // Reset board
    gameState.board = Array(24).fill(null).map(() => ({ white: 0, black: 0 }));

    // White pieces (bottom side - clockwise numbering)
    gameState.board[0] = { white: 2, black: 0 };   // Point 1
    gameState.board[11] = { white: 5, black: 0 };  // Point 12
    gameState.board[16] = { white: 3, black: 0 };  // Point 17
    gameState.board[18] = { white: 5, black: 0 };  // Point 19

    // Black pieces (top side - counterclockwise numbering)
    gameState.board[23] = { white: 0, black: 2 };  // Point 24
    gameState.board[12] = { white: 0, black: 5 };  // Point 13
    gameState.board[7] = { white: 0, black: 3 };   // Point 8
    gameState.board[5] = { white: 0, black: 5 };   // Point 6
}

// Render the board
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    // Create bar in the center
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = '40px';
    bar.style.height = '640px'; // Full height of board
    boardEl.appendChild(bar);

    // Create top row (points 12-23, black's side)
    const topRow = document.createElement('div');
    topRow.className = 'board-row';
    for (let i = 12; i < 24; i++) {
        const point = createPoint(i);
        topRow.appendChild(point);
    }
    boardEl.insertBefore(topRow, bar);

    // Create bottom row (points 0-11, white's side)
    const bottomRow = document.createElement('div');
    bottomRow.className = 'board-row';
    for (let i = 11; i >= 0; i--) {
        const point = createPoint(i);
        bottomRow.appendChild(point);
    }
    boardEl.appendChild(bottomRow);

    // Update bar display
    updateBarDisplay();
}

function createPoint(pointIndex) {
    const point = document.createElement('div');
    point.className = `point ${pointIndex % 2 === 0 ? 'dark' : 'light'}`;
    point.dataset.point = pointIndex;

    const pieces = gameState.board[pointIndex];
    const totalPieces = pieces.white + pieces.black;

    if (totalPieces > 0) {
        const color = pieces.white > 0 ? 'white' : 'black';
        const count = pieces.white > 0 ? pieces.white : pieces.black;

        for (let i = 0; i < Math.min(count, 5); i++) {
            const piece = document.createElement('div');
            piece.className = `piece ${color}`;
            piece.dataset.point = pointIndex;
            piece.dataset.color = color;

            // Stack pieces with offset
            if (pointIndex < 12) {
                // Bottom row - pieces at bottom
                piece.style.bottom = `${5 + i * 8}px`;
            } else {
                // Top row - pieces at top
                piece.style.top = `${5 + i * 8}px`;
                piece.style.bottom = 'auto';
            }

            // Left or right position based on point index
            if (pointIndex < 12) {
                piece.style.left = pointIndex < 6 ? '2px' : 'auto';
                piece.style.right = pointIndex < 6 ? 'auto' : '2px';
            } else {
                piece.style.left = pointIndex < 18 ? '2px' : 'auto';
                piece.style.right = pointIndex < 18 ? 'auto' : '2px';
            }

            point.appendChild(piece);
        }

        // Show count if more than 5 pieces
        if (count > 5) {
            const countLabel = document.createElement('div');
            countLabel.textContent = count;
            countLabel.style.position = 'absolute';
            countLabel.style.fontSize = '12px';
            countLabel.style.fontWeight = 'bold';
            countLabel.style.color = color === 'white' ? '#000' : '#fff';
            countLabel.style.top = pointIndex < 12 ? '2px' : 'auto';
            countLabel.style.bottom = pointIndex < 12 ? 'auto' : '2px';
            countLabel.style.left = '2px';
            point.appendChild(countLabel);
        }
    }

    point.addEventListener('click', () => handlePointClick(pointIndex));
    return point;
}

function updateBarDisplay() {
    // This would update visual representation of pieces on bar
    // For now, we'll just update the info panel
    document.getElementById('white-bar').textContent = gameState.bar.white;
    document.getElementById('black-bar').textContent = gameState.bar.black;
    document.getElementById('white-borne-off').textContent = gameState.borneOff.white;
    document.getElementById('black-borne-off').textContent = gameState.borneOff.black;
}

// Roll dice
function rollDice() {
    if (!gameState.gameActive) return;

    // Play dice roll sound
    if (window.gameSound) {
        window.gameSound.playSound('dice_roll', { gameType: 'general' });
    }

    // Roll two dice
    gameState.dice[0] = Math.floor(Math.random() * 6) + 1;
    gameState.dice[1] = Math.floor(Math.random() * 6) + 1;

    // Update dice display with animation
    const die1El = document.getElementById('die1');
    const die2El = document.getElementById('die2');

    die1El.classList.add('rolling');
    die2El.classList.add('rolling');

    setTimeout(() => {
        die1El.textContent = getDieFace(gameState.dice[0]);
        die2El.textContent = getDieFace(gameState.dice[1]);
        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');

        // Calculate available moves
        calculateAvailableMoves();

        updateStatus(`${gameState.currentPlayer.toUpperCase()} rolled ${gameState.dice[0]} and ${gameState.dice[1]}!`);

        // If doubles, player gets 4 moves of that number
        if (gameState.dice[0] === gameState.dice[1]) {
            updateStatus(`${gameState.currentPlayer.toUpperCase()} rolled doubles! 4 moves of ${gameState.dice[0]}.`);
        }

        // AI move if enabled
        if (gameState.aiEnabled && gameState.currentPlayer === 'black') {
            setTimeout(aiMove, 1000);
        }
    }, 500);
}

function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

// Calculate available moves
function calculateAvailableMoves() {
    gameState.availableMoves = [];
    const player = gameState.currentPlayer;
    const opponent = player === 'white' ? 'black' : 'white';

    // Get all possible moves for each die
    const moves = [];

    // If player has pieces on bar, they must move those first
    if (gameState.bar[player] > 0) {
        // Can only enter on opponent's home board (points 18-23 for white, 0-5 for black)
        const homeBoard = player === 'white' ? [18, 19, 20, 21, 22, 23] : [0, 1, 2, 3, 4, 5];

        gameState.dice.forEach(die => {
            if (die > 0) {
                homeBoard.forEach(point => {
                    if (canEnterFromBar(player, opponent, point, die)) {
                        moves.push({
                            type: 'enter',
                            from: 'bar',
                            to: point,
                            die: die
                        });
                    }
                });
            }
        });
    } else {
        // Normal moves
        gameState.dice.forEach(die => {
            if (die > 0) {
                for (let from = 0; from < 24; from++) {
                    if (gameState.board[from][player] > 0) {
                        const to = player === 'white' ? from + die : from - die;
                        if (canMove(player, opponent, from, to)) {
                            moves.push({
                                type: 'move',
                                from: from,
                                to: to,
                                die: die
                            });
                        }
                    }
                }
            }
        });
    }

    gameState.availableMoves = moves;

    // Update available moves display
    const movesText = moves.length > 0 ?
        `${moves.length} possible moves` :
        'No moves available';
    document.getElementById('available-moves').textContent = movesText;
}

// Check if can enter from bar
function canEnterFromBar(player, opponent, to, die) {
    // Check if point is open (not blocked by 2+ opponent pieces)
    if (gameState.board[to][opponent] >= 2) return false;

    // Check if this die allows entry to this point
    const entryPoint = player === 'white' ? 24 - die : die - 1;
    return to === entryPoint;
}

// Check if can move
function canMove(player, opponent, from, to) {
    // Check bounds
    if (to < 0 || to > 23) return false;

    // Check if destination is blocked
    if (gameState.board[to][opponent] >= 2) return false;

    // Check if all pieces are in home board for bearing off
    if (isBearingOff(player) && !isValidBearingOff(player, from, to)) {
        return false;
    }

    return true;
}

// Check if player is bearing off
function isBearingOff(player) {
    const homeBoard = player === 'white' ? [0, 1, 2, 3, 4, 5] : [18, 19, 20, 21, 22, 23];
    let totalPieces = 0;

    // Count pieces outside home board
    for (let i = 0; i < 24; i++) {
        if (!homeBoard.includes(i)) {
            totalPieces += gameState.board[i][player];
        }
    }

    return totalPieces === 0;
}

// Check if bearing off move is valid
function isValidBearingOff(player, from, to) {
    if (player === 'white') {
        // Must move exactly or overshoot home point (point 0)
        return to <= 0;
    } else {
        // Must move exactly or overshoot home point (point 23)
        return to >= 23;
    }
}

// Handle point click
function handlePointClick(pointIndex) {
    if (!gameState.gameActive || gameState.availableMoves.length === 0) return;

    const player = gameState.currentPlayer;
    const opponent = player === 'white' ? 'black' : 'white';

    // Find valid moves from this point
    const validMoves = gameState.availableMoves.filter(move =>
        move.from === pointIndex || (move.type === 'enter' && move.from === 'bar')
    );

    if (validMoves.length === 0) return;

    // For now, auto-select first valid move
    const move = validMoves[0];
    executeMove(move);
}

// Execute move
function executeMove(move) {
    const player = gameState.currentPlayer;
    const opponent = player === 'white' ? 'black' : 'white';

    // Record move for undo
    gameState.moveHistory.push({
        ...move,
        board: JSON.parse(JSON.stringify(gameState.board)),
        bar: { ...gameState.bar },
        borneOff: { ...gameState.borneOff }
    });

    if (move.type === 'enter') {
        // Enter from bar
        gameState.bar[player]--;
        gameState.board[move.to][player]++;

        // Hit opponent's piece if there
        if (gameState.board[move.to][opponent] === 1) {
            gameState.board[move.to][opponent]--;
            gameState.bar[opponent]++;
        }
    } else if (move.type === 'move') {
        // Normal move
        gameState.board[move.from][player]--;

        if (move.to >= 0 && move.to <= 23) {
            // Normal move
            gameState.board[move.to][player]++;

            // Hit opponent's piece if there
            if (gameState.board[move.to][opponent] === 1) {
                gameState.board[move.to][opponent]--;
                gameState.bar[opponent]++;
            }
        } else {
            // Bearing off
            gameState.borneOff[player]++;
        }
    }

    // Remove used die
    const dieIndex = gameState.dice.indexOf(move.die);
    if (dieIndex !== -1) {
        gameState.dice[dieIndex] = 0;
    }

    renderBoard();

    // Check for win
    if (gameState.borneOff[player] === 15) {
        updateStatus(`${player.toUpperCase()} wins! All pieces borne off.`);
        gameState.gameActive = false;
        return;
    }

    // Check if more moves available
    calculateAvailableMoves();

    if (gameState.availableMoves.length === 0) {
        // No more moves, switch turns
        nextTurn();
    }
}

// Next turn
function nextTurn() {
    gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
    gameState.dice = [0, 0];
    gameState.availableMoves = [];

    document.getElementById('die1').textContent = '⚀';
    document.getElementById('die2').textContent = '⚀';
    document.getElementById('current-roll').textContent = 'Roll dice first';
    document.getElementById('available-moves').textContent = 'Roll dice first';

    updateStatus(`${gameState.currentPlayer.toUpperCase()}'s turn - Roll the dice!`);

    // AI move if enabled
    if (gameState.aiEnabled && gameState.currentPlayer === 'black') {
        setTimeout(() => rollDice(), 1000);
    }
}

// AI move
function aiMove() {
    if (gameState.availableMoves.length === 0) return;

    // Simple AI: just pick first available move
    const move = gameState.availableMoves[0];
    setTimeout(() => executeMove(move), 500);
}

// Undo move
function undoMove() {
    if (gameState.moveHistory.length === 0) return;

    const lastMove = gameState.moveHistory.pop();

    gameState.board = lastMove.board;
    gameState.bar = lastMove.bar;
    gameState.borneOff = lastMove.borneOff;

    // Restore dice
    if (lastMove.die > 0) {
        const dieIndex = gameState.dice.findIndex(d => d === 0);
        if (dieIndex !== -1) {
            gameState.dice[dieIndex] = lastMove.die;
        }
    }

    renderBoard();
    calculateAvailableMoves();
    updateStatus('Move undone.');
}

// Toggle AI
function toggleAI() {
    gameState.aiEnabled = !gameState.aiEnabled;
    const btn = document.getElementById('aiToggle');
    btn.textContent = gameState.aiEnabled ? '👤 Play vs Human' : '🤖 Play vs AI';
}

// Show hint
function showHint() {
    if (gameState.availableMoves.length === 0) {
        updateStatus('Roll dice first to see available moves.');
        return;
    }

    const hint = gameState.availableMoves[0];
    let hintText = '';

    if (hint.type === 'enter') {
        hintText = `Hint: Move piece from bar to point ${hint.to}`;
    } else {
        hintText = `Hint: Move from point ${hint.from} to point ${hint.to}`;
    }

    updateStatus(hintText);
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// New game
function newGame() {
    gameState.board = Array(24).fill(null).map(() => ({ white: 0, black: 0 }));
    gameState.bar = { white: 0, black: 0 };
    gameState.borneOff = { white: 0, black: 0 };
    gameState.currentPlayer = 'white';
    gameState.dice = [0, 0];
    gameState.availableMoves = [];
    gameState.gameActive = true;
    gameState.moveHistory = [];

    initializeBoard();
    renderBoard();

    document.getElementById('die1').textContent = '⚀';
    document.getElementById('die2').textContent = '⚀';
    document.getElementById('current-roll').textContent = 'Roll dice first';
    document.getElementById('available-moves').textContent = 'Roll dice first';

    updateStatus("White's turn - Roll the dice!");
}

// Sound toggle function
function toggleSound() {
    if (window.gameSound) {
        const isEnabled = window.gameSound.isEnabled;
        if (isEnabled) {
            window.gameSound.disable();
            document.getElementById('soundToggle').textContent = '🔇 Sound: Off';
        } else {
            window.gameSound.enable();
            document.getElementById('soundToggle').textContent = '🔊 Sound: On';
        }
    } else {
        alert('Sound system not available. Make sure the sound service is running.');
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});