// Xiangqi - Chinese Chess (Complete Implementation)
// 9x10 board, river in middle (row 5), palaces for generals

const PIECES = {
    'R': '車', 'H': '馬', 'E': '象', 'A': '士', 'G': '將', 'C': '炮', 'P': '兵'
};

const PIECE_NAMES = {
    'R': 'Chariot', 'H': 'Horse', 'E': 'Elephant', 'A': 'Advisor', 
    'G': 'General', 'C': 'Cannon', 'P': 'Pawn'
};

// River is between rows 4 and 5 (0-indexed: rows 0-4 are above, 5-9 are below)
const RIVER_ROW = 5;
const RED_PALACE = { minRow: 7, maxRow: 9, minCol: 3, maxCol: 5 };
const BLACK_PALACE = { minRow: 0, maxRow: 2, minCol: 3, maxCol: 5 };

// Game state
let gameState = {
    board: Array(10).fill(null).map(() => Array(9).fill(null)),
    currentPlayer: 'red',
    selectedPiece: null,
    gameActive: true,
    inCheck: { red: false, black: false },
    aiPlayer: 'black' // AI plays black
};

// Initialize board
function initBoard() {
    // Red pieces (bottom)
    gameState.board[9][0] = { type: 'R', player: 'red' };
    gameState.board[9][1] = { type: 'H', player: 'red' };
    gameState.board[9][2] = { type: 'E', player: 'red' };
    gameState.board[9][3] = { type: 'A', player: 'red' };
    gameState.board[9][4] = { type: 'G', player: 'red' };
    gameState.board[9][5] = { type: 'A', player: 'red' };
    gameState.board[9][6] = { type: 'E', player: 'red' };
    gameState.board[9][7] = { type: 'H', player: 'red' };
    gameState.board[9][8] = { type: 'R', player: 'red' };
    gameState.board[7][1] = { type: 'C', player: 'red' };
    gameState.board[7][7] = { type: 'C', player: 'red' };
    for (let i = 0; i < 9; i += 2) {
        gameState.board[6][i] = { type: 'P', player: 'red' };
    }
    
    // Black pieces (top)
    gameState.board[0][0] = { type: 'R', player: 'black' };
    gameState.board[0][1] = { type: 'H', player: 'black' };
    gameState.board[0][2] = { type: 'E', player: 'black' };
    gameState.board[0][3] = { type: 'A', player: 'black' };
    gameState.board[0][4] = { type: 'G', player: 'black' };
    gameState.board[0][5] = { type: 'A', player: 'black' };
    gameState.board[0][6] = { type: 'E', player: 'black' };
    gameState.board[0][7] = { type: 'H', player: 'black' };
    gameState.board[0][8] = { type: 'R', player: 'black' };
    gameState.board[2][1] = { type: 'C', player: 'black' };
    gameState.board[2][7] = { type: 'C', player: 'black' };
    for (let i = 0; i < 9; i += 2) {
        gameState.board[3][i] = { type: 'P', player: 'black' };
    }
}

// Check if player is in check
function isInCheck(player) {
    const general = findGeneral(player);
    if (!general) return true; // General captured = checkmate
    
    const opponent = player === 'red' ? 'black' : 'red';
    
    // Check if any opponent piece can capture the general
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.player === opponent) {
                if (canMove(row, col, general.row, general.col)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Handle cell click
function handleCellClick(row, col) {
    if (!gameState.gameActive) return;
    
    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
        const [selRow, selCol] = gameState.selectedPiece;
        
        // Try to move
        if (canMove(selRow, selCol, row, col)) {
            // Check multiplayer mode
            const urlParams = new URLSearchParams(window.location.search);
            const isMultiplayer = urlParams.get('multiplayer') === 'true';
            const myColor = urlParams.get('color');
            
            // In multiplayer, only allow moves on your turn
            if (isMultiplayer && gameState.currentPlayer !== myColor) {
                gameState.selectedPiece = null;
                renderBoard();
                return;
            }
            
            // Make move
            const capturedPiece = gameState.board[row][col];
            gameState.board[row][col] = gameState.board[selRow][selCol];
            gameState.board[selRow][selCol] = null;
            
            // Send move in multiplayer mode
            if (isMultiplayer && window.sendMove && window.currentGame) {
                const game = window.currentGame();
                if (game && game.game_id) {
                    window.sendMove(game.game_id, JSON.stringify({fromRow: selRow, fromCol: selCol, toRow: row, toCol: col}));
                }
            }
            
            // Check if this move puts own general in check (illegal)
            if (isInCheck(gameState.currentPlayer)) {
                // Undo move
                gameState.board[selRow][selCol] = gameState.board[row][col];
                gameState.board[row][col] = capturedPiece;
                updateStatus('Illegal move - cannot leave your general in check!');
                renderBoard();
                return;
            }
            
            // Check win (captured general)
            if (capturedPiece && capturedPiece.type === 'G') {
                endGame(gameState.currentPlayer);
                return;
            }
            
            // Check if opponent is in check
            const opponent = gameState.currentPlayer === 'red' ? 'black' : 'red';
            gameState.inCheck[opponent] = isInCheck(opponent);
            
            gameState.selectedPiece = null;
            gameState.currentPlayer = opponent;
            
            renderBoard();
            
            // Check if AI's turn
            if (gameState.currentPlayer === gameState.aiPlayer && gameState.gameActive) {
                setTimeout(() => aiTurn(), 500);
                return;
            }
            
            let statusMsg = `${gameState.currentPlayer === 'red' ? 'Red' : 'Black'} player's turn!`;
            if (gameState.inCheck[gameState.currentPlayer]) {
                statusMsg += ' CHECK!';
            }
            updateStatus(statusMsg);
        } else {
            // Deselect or select new piece
            gameState.selectedPiece = null;
            if (piece && piece.player === gameState.currentPlayer) {
                gameState.selectedPiece = [row, col];
            }
        }
    } else {
        // Select piece
        if (piece && piece.player === gameState.currentPlayer) {
            gameState.selectedPiece = [row, col];
        }
    }
    
    renderBoard();
}

// Check if position is in palace
function isInPalace(row, col, player) {
    const palace = player === 'red' ? RED_PALACE : BLACK_PALACE;
    return row >= palace.minRow && row <= palace.maxRow &&
           col >= palace.minCol && col <= palace.maxCol;
}

// Check if position is across river
function isAcrossRiver(row, player) {
    if (player === 'red') {
        return row < RIVER_ROW; // Red pieces cross when row < 5
    } else {
        return row >= RIVER_ROW; // Black pieces cross when row >= 5
    }
}

// Can move (complete rules)
function canMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    if (!piece) return false;
    
    const target = gameState.board[toRow][toCol];
    if (target && target.player === piece.player) return false;
    
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    switch (piece.type) {
        case 'R': // Chariot (Rook) - moves orthogonally, no jumping
            if (rowDiff !== 0 && colDiff !== 0) return false;
            return !isBlocked(fromRow, fromCol, toRow, toCol);
            
        case 'H': // Horse (Knight) - moves 2+1, blocked if first step blocked
            if (!((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2))) {
                return false;
            }
            // Check if first step is blocked
            const hBlockRow = fromRow + (rowDiff > 0 ? 1 : rowDiff < 0 ? -1 : 0);
            const hBlockCol = fromCol + (colDiff > 0 ? 1 : colDiff < 0 ? -1 : 0);
            if (absRowDiff === 2) {
                // Moving 2 rows, check if first row step is blocked
                if (gameState.board[hBlockRow][fromCol] !== null) return false;
            } else {
                // Moving 2 cols, check if first col step is blocked
                if (gameState.board[fromRow][hBlockCol] !== null) return false;
            }
            return true;
            
        case 'E': // Elephant - moves 2 diagonally, can't cross river, blocked if first step blocked
            if (absRowDiff !== 2 || absColDiff !== 2) return false;
            // Can't cross river
            if (piece.player === 'red' && toRow < RIVER_ROW) return false;
            if (piece.player === 'black' && toRow >= RIVER_ROW) return false;
            // Check if first diagonal step is blocked
            const eBlockRow = fromRow + (rowDiff > 0 ? 1 : -1);
            const eBlockCol = fromCol + (colDiff > 0 ? 1 : -1);
            if (gameState.board[eBlockRow][eBlockCol] !== null) return false;
            return true;
            
        case 'A': // Advisor - moves 1 diagonal, must stay in palace
            if (absRowDiff !== 1 || absColDiff !== 1) return false;
            if (!isInPalace(toRow, toCol, piece.player)) return false;
            return true;
            
        case 'G': // General - moves 1 orthogonally, must stay in palace, can't face opponent general
            if ((absRowDiff === 1 && colDiff === 0) || (absRowDiff === 0 && absColDiff === 1)) {
                if (!isInPalace(toRow, toCol, piece.player)) return false;
                // Check if generals face each other (same column, no pieces between)
                if (toCol === fromCol) {
                    const otherGeneral = findGeneral(piece.player === 'red' ? 'black' : 'red');
                    if (otherGeneral && otherGeneral.col === toCol) {
                        // Check if path is clear
                        const minRow = Math.min(toRow, otherGeneral.row);
                        const maxRow = Math.max(toRow, otherGeneral.row);
                        let piecesBetween = 0;
                        for (let r = minRow + 1; r < maxRow; r++) {
                            if (gameState.board[r][toCol] !== null) piecesBetween++;
                        }
                        if (piecesBetween === 0) return false; // Can't face each other
                    }
                }
                return true;
            }
            return false;
            
        case 'C': // Cannon - moves like rook, but captures by jumping over exactly one piece
            if (rowDiff !== 0 && colDiff !== 0) return false;
            const piecesInPath = countPiecesInPath(fromRow, fromCol, toRow, toCol);
            if (target === null) {
                // Moving to empty square - no pieces allowed in path
                return piecesInPath === 0;
            } else {
                // Capturing - must jump over exactly one piece
                return piecesInPath === 1;
            }
            
        case 'P': // Pawn - forward only, sideways after crossing river
            if (piece.player === 'red') {
                // Red moves up (decreasing row)
                if (toRow > fromRow) return false; // Can't move backward
                if (isAcrossRiver(fromRow, 'red')) {
                    // Across river - can move forward or sideways
                    return (rowDiff === -1 && colDiff === 0) || (rowDiff === 0 && absColDiff === 1);
                } else {
                    // Not across river - forward only
                    return rowDiff === -1 && colDiff === 0;
                }
            } else {
                // Black moves down (increasing row)
                if (toRow < fromRow) return false; // Can't move backward
                if (isAcrossRiver(fromRow, 'black')) {
                    // Across river - can move forward or sideways
                    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && absColDiff === 1);
                } else {
                    // Not across river - forward only
                    return rowDiff === 1 && colDiff === 0;
                }
            }
            
        default:
            return false;
    }
}

// Count pieces in path (for cannon)
function countPiecesInPath(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let count = 0;
    let r = fromRow + rowStep;
    let c = fromCol + colStep;
    
    while (r !== toRow || c !== toCol) {
        if (gameState.board[r][c] !== null) count++;
        r += rowStep;
        c += colStep;
    }
    
    return count;
}

// Find general position
function findGeneral(player) {
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.type === 'G' && piece.player === player) {
                return { row, col };
            }
        }
    }
    return null;
}

// Check if path is blocked
function isBlocked(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let r = fromRow + rowStep;
    let c = fromCol + colStep;
    
    while (r !== toRow || c !== toCol) {
        if (gameState.board[r][c] !== null) return true;
        r += rowStep;
        c += colStep;
    }
    
    return false;
}

// Render board
function renderBoard() {
    try {
        const boardEl = document.getElementById('board');
        if (!boardEl) {
            console.error('Board element not found!');
            return;
        }
        
        console.log('Rendering board...');
        boardEl.innerHTML = '';
    
    // Ensure board has proper dimensions - use !important via setProperty
    // Total size: 9 columns * 60px + 8 gaps * 2px = 540px + 16px = 556px, plus 20px padding = 576px
    // But we'll use 586px to account for borders
    boardEl.style.setProperty('display', 'grid', 'important');
    boardEl.style.setProperty('grid-template-columns', 'repeat(9, 60px)', 'important');
    boardEl.style.setProperty('grid-template-rows', 'repeat(10, 60px)', 'important');
    boardEl.style.setProperty('width', '586px', 'important');
    boardEl.style.setProperty('height', '644px', 'important');
    boardEl.style.setProperty('min-width', '586px', 'important');
    boardEl.style.setProperty('min-height', '644px', 'important');
    boardEl.style.setProperty('max-width', '586px', 'important');
    boardEl.style.setProperty('max-height', '644px', 'important');
    boardEl.style.setProperty('gap', '2px', 'important');
    boardEl.style.setProperty('margin', '0', 'important');
    boardEl.style.setProperty('flex-shrink', '0', 'important');
    boardEl.style.setProperty('box-sizing', 'border-box', 'important');
    boardEl.style.setProperty('grid-auto-flow', 'row', 'important');
    boardEl.style.setProperty('padding', '10px', 'important');
    boardEl.style.setProperty('background', '#8B4513', 'important');
    boardEl.style.setProperty('position', 'relative', 'important');
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            // Explicitly set grid position (1-indexed for CSS Grid)
            cell.style.setProperty('grid-row', `${row + 1}`, 'important');
            cell.style.setProperty('grid-column', `${col + 1}`, 'important');
            cell.style.setProperty('width', '60px', 'important');
            cell.style.setProperty('height', '60px', 'important');
            cell.style.setProperty('min-width', '60px', 'important');
            cell.style.setProperty('min-height', '60px', 'important');
            cell.style.setProperty('max-width', '60px', 'important');
            cell.style.setProperty('max-height', '60px', 'important');
            cell.style.setProperty('flex-shrink', '0', 'important');
            cell.style.setProperty('flex-grow', '0', 'important');
            cell.style.setProperty('flex-basis', '60px', 'important');
            cell.style.setProperty('box-sizing', 'border-box', 'important');
            cell.style.setProperty('display', 'flex', 'important');
            cell.style.setProperty('position', 'relative', 'important');
            cell.style.setProperty('z-index', '1', 'important');
            
            // Set default cell background first
            let cellBg = '#DEB887'; // Default beige
            
            // River (row 4-5 boundary, show on row 4 and 5)
            if (row === 4 || row === 5) {
                cell.classList.add('river');
                cellBg = '#4682B4'; // Blue for river
            }
            
            // Palace (overrides river if in palace)
            if (isInPalace(row, col, 'red') || isInPalace(row, col, 'black')) {
                cell.classList.add('palace');
                cellBg = '#D2691E'; // Orange for palace
            }
            
            cell.style.setProperty('background', cellBg, 'important');
            cell.style.setProperty('border', '1px solid #8B4513', 'important');
            
            // Selected piece highlight
            if (gameState.selectedPiece && gameState.selectedPiece[0] === row && gameState.selectedPiece[1] === col) {
                cell.style.border = '3px solid #FFD700';
                cell.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.8)';
            }
            
            // Show valid moves
            if (gameState.selectedPiece) {
                const [selRow, selCol] = gameState.selectedPiece;
                if (canMove(selRow, selCol, row, col)) {
                    cell.style.border = '2px dashed #00FF00';
                    cell.style.opacity = '0.9';
                }
            }
            
            // Pieces
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.player}`;
                pieceEl.textContent = PIECES[piece.type];
                pieceEl.title = `${PIECE_NAMES[piece.type]} (${piece.player})`;
                pieceEl.style.setProperty('position', 'relative', 'important');
                pieceEl.style.setProperty('z-index', '2', 'important');
                cell.appendChild(pieceEl);
            }
            
            cell.onclick = () => handleCellClick(row, col);
            boardEl.appendChild(cell);
        }
    }
    
        console.log(`Board rendered: ${boardEl.children.length} cells created`);
        console.log(`Board dimensions: ${boardEl.offsetWidth}x${boardEl.offsetHeight}`);
    } catch (error) {
        console.error('Error rendering board:', error);
        const boardEl = document.getElementById('board');
        if (boardEl) {
            boardEl.innerHTML = '<div style="color: red; padding: 20px;">Error rendering board. Check console for details.</div>';
        }
    }
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    updateStatus(`${winner === 'red' ? 'Red' : 'Black'} player wins!`);
}

// Get all valid moves for a piece
function getAllValidMoves(row, col) {
    const moves = [];
    for (let toRow = 0; toRow < 10; toRow++) {
        for (let toCol = 0; toCol < 9; toCol++) {
            if (canMove(row, col, toRow, toCol)) {
                // Check if move is legal (doesn't leave own general in check)
                const piece = gameState.board[row][col];
                const target = gameState.board[toRow][toCol];
                
                // Make move temporarily
                gameState.board[toRow][toCol] = piece;
                gameState.board[row][col] = null;
                
                const wasInCheck = isInCheck(piece.player);
                
                // Restore
                gameState.board[row][col] = piece;
                gameState.board[toRow][toCol] = target;
                
                if (!wasInCheck) {
                    moves.push([toRow, toCol]);
                }
            }
        }
    }
    return moves;
}

// Evaluate move quality (higher is better)
function evaluateMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    const target = gameState.board[toRow][toCol];
    let score = 0;
    
    // Capture is very valuable
    if (target) {
        const pieceValues = { 'G': 1000, 'R': 9, 'H': 4, 'C': 4.5, 'E': 2, 'A': 2, 'P': 1 };
        score += pieceValues[target.type] || 1;
    }
    
    // Check is valuable
    const opponent = piece.player === 'red' ? 'black' : 'red';
    const tempTarget = gameState.board[toRow][toCol];
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = null;
    if (isInCheck(opponent)) {
        score += 50;
    }
    gameState.board[fromRow][fromCol] = piece;
    gameState.board[toRow][toCol] = tempTarget;
    
    // Center control (for pieces that can move there)
    if (toRow >= 3 && toRow <= 6 && toCol >= 2 && toCol <= 6) {
        score += 0.5;
    }
    
    // Pawn advancement (for pawns)
    if (piece.type === 'P') {
        if (piece.player === 'red') {
            score += (9 - toRow) * 0.2; // Closer to top (enemy side) is better
        } else {
            score += toRow * 0.2; // Closer to bottom (enemy side) is better
        }
    }
    
    return score;
}

// AI turn
function aiTurn() {
    if (!gameState.gameActive || gameState.currentPlayer !== gameState.aiPlayer) return;
    
    updateStatus('AI is thinking...');
    
    // Find all AI pieces with valid moves
    const allMoves = [];
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 9; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.player === gameState.aiPlayer) {
                const moves = getAllValidMoves(row, col);
                for (const move of moves) {
                    const score = evaluateMove(row, col, move[0], move[1]);
                    allMoves.push({
                        fromRow: row,
                        fromCol: col,
                        toRow: move[0],
                        toCol: move[1],
                        score: score
                    });
                }
            }
        }
    }
    
    if (allMoves.length === 0) {
        // No moves available - stalemate or checkmate
        updateStatus('No moves available for AI!');
        return;
    }
    
    // Sort by score (best first)
    allMoves.sort((a, b) => b.score - a.score);
    
    // Pick from top moves (add some randomness to top 3)
    const topMoves = allMoves.slice(0, Math.min(3, allMoves.length));
    const bestMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    
    // Make the move
    setTimeout(() => {
        const { fromRow, fromCol, toRow, toCol } = bestMove;
        const piece = gameState.board[fromRow][fromCol];
        const capturedPiece = gameState.board[toRow][toCol];
        
        // Make move
        gameState.board[toRow][toCol] = piece;
        gameState.board[fromRow][fromCol] = null;
        
        // Check win (captured general)
        if (capturedPiece && capturedPiece.type === 'G') {
            endGame(gameState.aiPlayer);
            return;
        }
        
        // Check if player is in check
        const player = gameState.currentPlayer === 'red' ? 'black' : 'red';
        gameState.inCheck[player] = isInCheck(player);
        
        gameState.currentPlayer = player;
        
        let statusMsg = "Your turn!";
        if (gameState.inCheck[player]) {
            statusMsg += ' CHECK!';
        }
        updateStatus(statusMsg);
        renderBoard();
    }, 300);
}

// New game
function newGame() {
    gameState.currentPlayer = 'red';
    gameState.selectedPiece = null;
    gameState.gameActive = true;
    gameState.inCheck = { red: false, black: false };
    initBoard();
    renderBoard();
    updateStatus("Red player's turn! Click a piece to move.");
}

// Initialize
function initializeGame() {
    try {
        console.log('Xiangqi: Initializing game...');
        const boardEl = document.getElementById('board');
        if (!boardEl) {
            console.error('Xiangqi: Board element not found in DOM!');
            return false;
        }
        console.log('Xiangqi: Board element found, starting game...');
        newGame();
        return true;
    } catch (error) {
        console.error('Xiangqi: Error during initialization:', error);
        return false;
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        if (!initializeGame()) {
            setTimeout(initializeGame, 100);
        }
    });
} else {
    // DOM already loaded
    if (!initializeGame()) {
        setTimeout(initializeGame, 100);
    }
}
