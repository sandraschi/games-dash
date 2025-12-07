// Hnefatafl - Viking Strategy Game (Complete Implementation)
// Asymmetric game: Defenders (blue) try to get King to corner, Attackers (red) try to capture King

const BOARD_SIZE = 11;
const CENTER = Math.floor(BOARD_SIZE / 2); // 5
const CORNERS = [[0, 0], [0, 10], [10, 0], [10, 10]];
const THRONE = [CENTER, CENTER]; // [5, 5]

// Sacred squares: throne and corners (can block captures)
function isSacredSquare(row, col) {
    if (row === CENTER && col === CENTER) return true; // Throne
    return CORNERS.some(([cr, cc]) => cr === row && cc === col);
}

// Game state
let gameState = {
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    currentPlayer: 'defender', // 'defender' or 'attacker'
    selectedPiece: null,
    validMoves: [],
    gameActive: true
};

// Initialize board (standard 11x11 Hnefatafl setup)
function initBoard() {
    // Clear board
    gameState.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    
    // King on throne (center)
    gameState.board[CENTER][CENTER] = { type: 'king', player: 'defender' };
    
    // Defenders around king (12 defenders in standard setup)
    const defenderPositions = [
        // Adjacent to king
        [CENTER-1, CENTER], [CENTER+1, CENTER], [CENTER, CENTER-1], [CENTER, CENTER+1],
        // One square away
        [CENTER-2, CENTER], [CENTER+2, CENTER], [CENTER, CENTER-2], [CENTER, CENTER+2],
        // Diagonal
        [CENTER-1, CENTER-1], [CENTER+1, CENTER+1], [CENTER-1, CENTER+1], [CENTER+1, CENTER-1]
    ];
    defenderPositions.forEach(([r, c]) => {
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            gameState.board[r][c] = { type: 'defender', player: 'defender' };
        }
    });
    
    // Attackers on edges (24 attackers in standard setup)
    for (let i = 0; i < BOARD_SIZE; i++) {
        // Top row (except corners and center column)
        if (i !== CENTER && i !== 0 && i !== BOARD_SIZE - 1) {
            gameState.board[0][i] = { type: 'attacker', player: 'attacker' };
        }
        // Bottom row
        if (i !== CENTER && i !== 0 && i !== BOARD_SIZE - 1) {
            gameState.board[BOARD_SIZE - 1][i] = { type: 'attacker', player: 'attacker' };
        }
        // Left column (except corners and center row)
        if (i !== CENTER && i !== 0 && i !== BOARD_SIZE - 1) {
            gameState.board[i][0] = { type: 'attacker', player: 'attacker' };
        }
        // Right column
        if (i !== CENTER && i !== 0 && i !== BOARD_SIZE - 1) {
            gameState.board[i][BOARD_SIZE - 1] = { type: 'attacker', player: 'attacker' };
        }
    }
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Orthogonal only
    
    directions.forEach(([dr, dc]) => {
        for (let dist = 1; dist < BOARD_SIZE; dist++) {
            const newRow = row + dr * dist;
            const newCol = col + dc * dist;
            
            if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) break;
            
            // Can't move through pieces
            if (gameState.board[newRow][newCol] !== null) break;
            
            // Can't move to throne (except king returning to it)
            if (newRow === CENTER && newCol === CENTER && piece.type !== 'king') break;
            
            // Can't move to corners (except king)
            if (isSacredSquare(newRow, newCol) && !CORNERS.some(([cr, cc]) => cr === newRow && cc === newCol)) {
                // This is the throne, only king can go here
                if (piece.type !== 'king') break;
            }
            
            // King can't be on throne after leaving it (can't return)
            if (piece.type === 'king' && newRow === CENTER && newCol === CENTER) {
                // Only allow if king is currently on throne
                if (row !== CENTER || col !== CENTER) break;
            }
            
            moves.push([newRow, newCol]);
        }
    });
    
    return moves;
}

// Check if a piece is captured (sandwiched between enemy pieces or enemy + sacred square)
function isPieceCaptured(row, col) {
    const piece = gameState.board[row][col];
    if (!piece) return false;
    
    // King can't be captured on throne
    if (piece.type === 'king' && row === CENTER && col === CENTER) return false;
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const enemyPlayer = piece.player === 'defender' ? 'attacker' : 'defender';
    let blockedSides = 0;
    
    directions.forEach(([dr, dc]) => {
        const adjRow = row + dr;
        const adjCol = col + dc;
        
        // Check if this side is blocked by enemy piece or sacred square
        if (adjRow < 0 || adjRow >= BOARD_SIZE || adjCol < 0 || adjCol >= BOARD_SIZE) {
            // Off board - counts as blocked for regular pieces, but not for king
            if (piece.type !== 'king') blockedSides++;
            return;
        }
        
        const adjPiece = gameState.board[adjRow][adjCol];
        if (adjPiece && adjPiece.player === enemyPlayer) {
            // Enemy piece blocks this side
            blockedSides++;
        } else if (isSacredSquare(adjRow, adjCol)) {
            // Sacred square (throne/corner) blocks this side
            blockedSides++;
        }
    });
    
    // Regular pieces: captured if sandwiched on opposite sides (2 sides blocked)
    if (piece.type !== 'king') {
        // Check if piece is between two enemy pieces (opposite sides)
        for (let i = 0; i < directions.length; i += 2) {
            const [dr1, dc1] = directions[i];
            const [dr2, dc2] = directions[i + 1];
            
            const side1Row = row + dr1;
            const side1Col = col + dc1;
            const side2Row = row + dr2;
            const side2Col = col + dc2;
            
            let side1Blocked = false;
            let side2Blocked = false;
            
            // Check side 1
            if (side1Row >= 0 && side1Row < BOARD_SIZE && side1Col >= 0 && side1Col < BOARD_SIZE) {
                const p1 = gameState.board[side1Row][side1Col];
                side1Blocked = (p1 && p1.player === enemyPlayer) || isSacredSquare(side1Row, side1Col);
            } else {
                side1Blocked = true; // Off board counts as blocked
            }
            
            // Check side 2
            if (side2Row >= 0 && side2Row < BOARD_SIZE && side2Col >= 0 && side2Col < BOARD_SIZE) {
                const p2 = gameState.board[side2Row][side2Col];
                side2Blocked = (p2 && p2.player === enemyPlayer) || isSacredSquare(side2Row, side2Col);
            } else {
                side2Blocked = true; // Off board counts as blocked
            }
            
            if (side1Blocked && side2Blocked) {
                return true; // Captured!
            }
        }
        return false;
    } else {
        // King: captured if surrounded on all 4 sides
        // All 4 sides must be blocked by attackers or sacred squares
        // At least 2 sides must be attackers (not just sacred squares)
        if (blockedSides === 4) {
            // Count how many sides are attackers (not just sacred squares)
            let attackerSides = 0;
            directions.forEach(([dr, dc]) => {
                const adjRow = row + dr;
                const adjCol = col + dc;
                if (adjRow >= 0 && adjRow < BOARD_SIZE && adjCol >= 0 && adjCol < BOARD_SIZE) {
                    const adjPiece = gameState.board[adjRow][adjCol];
                    if (adjPiece && adjPiece.player === 'attacker') {
                        attackerSides++;
                    }
                } else {
                    // Off board counts as blocked but not as attacker
                    // (shouldn't happen for king, but handle it)
                }
            });
            // King is captured if all 4 sides blocked AND at least 2 are attackers
            return attackerSides >= 2;
        }
        return false;
    }
}

// Check captures after a move (check the moved piece and adjacent pieces)
function checkCaptures(moveRow, moveCol, player) {
    const captured = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    // Check if the moved piece captured anything adjacent
    directions.forEach(([dr, dc]) => {
        const checkRow = moveRow + dr;
        const checkCol = moveCol + dc;
        
        if (checkRow >= 0 && checkRow < BOARD_SIZE && checkCol >= 0 && checkCol < BOARD_SIZE) {
            if (isPieceCaptured(checkRow, checkCol)) {
                captured.push([checkRow, checkCol]);
            }
        }
    });
    
    // Also check if the moved piece itself is captured
    if (isPieceCaptured(moveRow, moveCol)) {
        captured.push([moveRow, moveCol]);
    }
    
    return captured;
}

// Handle cell click
function handleCellClick(row, col) {
    if (!gameState.gameActive) return;
    
    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
        const [selRow, selCol] = gameState.selectedPiece;
        
        // Check if clicking valid move
        if (gameState.validMoves.some(([r, c]) => r === row && c === col)) {
            const movedPiece = gameState.board[selRow][selCol];
            
            // Move piece
            gameState.board[row][col] = movedPiece;
            gameState.board[selRow][selCol] = null;
            
            // Check win: King in corner (defenders win)
            if (movedPiece.type === 'king' && CORNERS.some(([cr, cc]) => cr === row && cc === col)) {
                endGame('defender');
                return;
            }
            
            // Check captures
            const captured = checkCaptures(row, col, gameState.currentPlayer);
            let kingCaptured = false;
            
            captured.forEach(([r, c]) => {
                const capturedPiece = gameState.board[r][c];
                if (capturedPiece && capturedPiece.type === 'king') {
                    kingCaptured = true;
                }
                gameState.board[r][c] = null;
            });
            
            if (kingCaptured) {
                endGame('attacker');
                return;
            }
            
            gameState.selectedPiece = null;
            gameState.validMoves = [];
            gameState.currentPlayer = gameState.currentPlayer === 'defender' ? 'attacker' : 'defender';
            
            if (gameState.currentPlayer === 'attacker') {
                setTimeout(() => aiTurn(), 500);
            }
        } else {
            // Deselect or select new piece
            gameState.selectedPiece = null;
            gameState.validMoves = [];
            if (piece && piece.player === gameState.currentPlayer) {
                gameState.selectedPiece = [row, col];
                gameState.validMoves = getValidMoves(row, col);
            }
        }
    } else {
        // Select piece
        if (piece && piece.player === gameState.currentPlayer) {
            gameState.selectedPiece = [row, col];
            gameState.validMoves = getValidMoves(row, col);
        }
    }
    
    updateDisplay();
}

// AI turn (attacker)
function aiTurn() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'attacker') return;
    
    // Find all attacker pieces
    const pieces = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameState.board[r][c];
            if (piece && piece.player === 'attacker') {
                const moves = getValidMoves(r, c);
                if (moves.length > 0) {
                    pieces.push({ row: r, col: c, moves });
                }
            }
        }
    }
    
    if (pieces.length === 0) {
        endGame('defender');
        return;
    }
    
    // Try to find a capturing move first
    let bestMove = null;
    for (const piece of pieces) {
        for (const move of piece.moves) {
            // Simulate move
            const originalPiece = gameState.board[move[0]][move[1]];
            gameState.board[move[0]][move[1]] = gameState.board[piece.row][piece.col];
            gameState.board[piece.row][piece.col] = null;
            
            // Check if this captures anything
            const captured = checkCaptures(move[0], move[1], 'attacker');
            
            // Restore
            gameState.board[piece.row][piece.col] = gameState.board[move[0]][move[1]];
            gameState.board[move[0]][move[1]] = originalPiece;
            
            if (captured.length > 0) {
                bestMove = { piece, move };
                break;
            }
        }
        if (bestMove) break;
    }
    
    // If no capturing move, pick random
    if (!bestMove) {
        const piece = pieces[Math.floor(Math.random() * pieces.length)];
        const move = piece.moves[Math.floor(Math.random() * piece.moves.length)];
        bestMove = { piece, move };
    }
    
    const { piece, move } = bestMove;
    const movedPiece = gameState.board[piece.row][piece.col];
    
    // Move
    gameState.board[move[0]][move[1]] = movedPiece;
    gameState.board[piece.row][piece.col] = null;
    
    // Check captures
    const captured = checkCaptures(move[0], move[1], 'attacker');
    let kingCaptured = false;
    
    captured.forEach(([r, c]) => {
        const capturedPiece = gameState.board[r][c];
        if (capturedPiece && capturedPiece.type === 'king') {
            kingCaptured = true;
        }
        gameState.board[r][c] = null;
    });
    
    if (kingCaptured) {
        endGame('attacker');
        return;
    }
    
    gameState.currentPlayer = 'defender';
    updateDisplay();
    updateStatus('Your turn! Move the King to a corner!');
}

// Render board
function renderBoard() {
    const boardEl = document.getElementById('board');
    if (!boardEl) {
        console.error('Board element not found!');
        return;
    }
    boardEl.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = '50px';
            cell.style.height = '50px';
            cell.style.minWidth = '50px';
            cell.style.minHeight = '50px';
            cell.style.flexShrink = '0';
            
            // Throne
            if (row === Math.floor(BOARD_SIZE / 2) && col === Math.floor(BOARD_SIZE / 2)) {
                cell.classList.add('throne');
            }
            
            // Corners
            if (CORNERS.some(([cr, cc]) => cr === row && cc === col)) {
                cell.classList.add('corner');
            }
            
            // Selected
            if (gameState.selectedPiece && gameState.selectedPiece[0] === row && gameState.selectedPiece[1] === col) {
                cell.classList.add('selected');
            }
            
            // Valid moves
            if (gameState.validMoves.some(([r, c]) => r === row && c === col)) {
                cell.classList.add('valid-move');
            }
            
            // Pieces
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.type}`;
                if (piece.type === 'king') {
                    pieceEl.textContent = '👑';
                } else if (piece.type === 'defender') {
                    pieceEl.textContent = '🛡️';
                } else {
                    pieceEl.textContent = '⚔️';
                }
                cell.appendChild(pieceEl);
            }
            
            cell.onclick = () => handleCellClick(row, col);
            boardEl.appendChild(cell);
        }
    }
}

// Update display
function updateDisplay() {
    renderBoard();
    
    if (gameState.currentPlayer === 'defender') {
        updateStatus('Your turn! Move the King to a corner!');
    } else {
        updateStatus('AI (Attackers) turn...');
    }
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// End game
function endGame(winner) {
    gameState.gameActive = false;
    if (winner === 'defender') {
        updateStatus('🎉 Victory! The King escaped to safety!');
    } else {
        updateStatus('💀 Defeat! The King was captured!');
    }
}

// New game
function newGame() {
    gameState.currentPlayer = 'defender';
    gameState.selectedPiece = null;
    gameState.validMoves = [];
    gameState.gameActive = true;
    initBoard();
    updateDisplay();
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
