// Mensch ärgere dich nicht! - German Ludo variant
// **Timestamp**: 2025-12-04

// Game state
let stage, layer;
let players = ['red', 'yellow', 'green', 'blue'];
let currentPlayer = 0;
let diceValue = 0;
let gameActive = false;
let aiEnabled = true;

// Pieces: pos = -1 (home), 0-39 (main path), 40-44 (home stretch), 100 (finished)
let pieces = {
    red: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}],
    yellow: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}],
    green: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}],
    blue: [{pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}, {pos: -1, circle: null}]
};

// Board configuration
const BOARD_SIZE = 750;
const CELL_SIZE = 50;
const COLORS = {
    red: '#F44336',
    yellow: '#FFEB3B',
    green: '#4CAF50',
    blue: '#2196F3',
    white: '#FFFFFF',
    beige: '#E8E8E8'
};

// Board matrix: 15x15 grid, 1 = circle, 0 = empty
let boardMatrix = Array(15).fill(0).map(() => Array(15).fill(0));

// Initialize matrix with circles
function initMatrix() {
    // Left vertical arm (column 6): rows 0-14, skip row 7
    for (let row = 0; row < 15; row++) {
        if (row !== 7) boardMatrix[row][6] = 1;
    }
    
    // Top horizontal arm (row 6): columns 0-14, skip column 7
    for (let col = 0; col < 15; col++) {
        if (col !== 7) boardMatrix[6][col] = 1;
    }
    
    // Right vertical arm (column 8): rows 0-14, skip row 7
    for (let row = 0; row < 15; row++) {
        if (row !== 7) boardMatrix[row][8] = 1;
    }
    
    // Bottom horizontal arm (row 8): columns 0-14, skip columns 7 and 9
    for (let col = 0; col < 15; col++) {
        if (col !== 7 && col !== 9) boardMatrix[8][col] = 1;
    }
    
    // Add 4 missing corner circles (1-based: r8c1, r15c8, r8c15, r1c8)
    boardMatrix[7][0] = 1;  // r8c1
    boardMatrix[14][7] = 1; // r15c8
    boardMatrix[7][14] = 1; // r8c15
    boardMatrix[0][7] = 1;  // r1c8
    
    // Add missing path circle
    boardMatrix[6][9] = 1;  // r6c9
    
    // Debug: print matrix with start positions marked
    const starts = {
        green: [14, 6],
        red: [6, 0],
        yellow: [0, 8],
        blue: [8, 14]
    };
    
    console.log('Board Matrix (O=circle, g/r/y/b=start):');
    console.log('   0 1 2 3 4 5 6 7 8 9 A B C D E');
    boardMatrix.forEach((row, i) => {
        const rowStr = row.map((v, j) => {
            if (!v) return '.';
            // Check if start position
            for (let color in starts) {
                if (starts[color][0] === i && starts[color][1] === j) {
                    return color[0]; // First letter
                }
            }
            return 'O';
        }).join(' ');
        console.log(`${i.toString().padStart(2)}: ${rowStr}`);
    });
}

// Path coordinates
let mainPathCoords = [];
let homeStretchCoords = {red: [], yellow: [], green: [], blue: []};

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
    initBoard();
});

function initBoard() {
    stage = new Konva.Stage({
        container: 'container',
        width: BOARD_SIZE,
        height: BOARD_SIZE
    });

    layer = new Konva.Layer();
    stage.add(layer);

    // Initialize matrix
    initMatrix();
    
    // Generate path coordinates
    mainPathCoords = generateMainPath();
    homeStretchCoords = generateHomeStretches();
    
    console.log(`Main path has ${mainPathCoords.length} positions`);

    // Draw board
    drawBackground();
    drawHomeBases();
    drawMainPath();
    drawHomeStretches();
    drawCenter();

    layer.draw();
    
    console.log('Board initialized, starting new game...');
    newGame();
}

function drawBackground() {
    const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        fill: COLORS.beige
    });
    layer.add(bg);
}

function drawHomeBases() {
    // Red home (top-left)
    drawHomeBase(0, 0, 'red');
    
    // Yellow home (top-right)
    drawHomeBase(9 * CELL_SIZE, 0, 'yellow');
    
    // Green home (bottom-left)
    drawHomeBase(0, 9 * CELL_SIZE, 'green');
    
    // Blue home (bottom-right)
    drawHomeBase(9 * CELL_SIZE, 9 * CELL_SIZE, 'blue');
}

function drawHomeBase(x, y, color) {
    const homeSize = 6 * CELL_SIZE;
    
    // Outer colored square
    const outerSquare = new Konva.Rect({
        x: x,
        y: y,
        width: homeSize,
        height: homeSize,
        fill: COLORS[color],
        stroke: '#000',
        strokeWidth: 3
    });
    layer.add(outerSquare);

    // Inner white square
    const innerSize = 4 * CELL_SIZE;
    const innerSquare = new Konva.Rect({
        x: x + CELL_SIZE,
        y: y + CELL_SIZE,
        width: innerSize,
        height: innerSize,
        fill: COLORS.white,
        stroke: '#000',
        strokeWidth: 2
    });
    layer.add(innerSquare);

    // Four circular slots (2x2 grid)
    const slotPositions = [
        {x: x + 1.5 * CELL_SIZE, y: y + 1.5 * CELL_SIZE},
        {x: x + 3.5 * CELL_SIZE, y: y + 1.5 * CELL_SIZE},
        {x: x + 1.5 * CELL_SIZE, y: y + 3.5 * CELL_SIZE},
        {x: x + 3.5 * CELL_SIZE, y: y + 3.5 * CELL_SIZE}
    ];

    slotPositions.forEach((pos, index) => {
        const slot = new Konva.Circle({
            x: pos.x,
            y: pos.y,
            radius: CELL_SIZE * 0.35,
            fill: COLORS[color],
            stroke: '#000',
            strokeWidth: 2
        });
        layer.add(slot);

        pieces[color][index].homeX = pos.x;
        pieces[color][index].homeY = pos.y;
    });
}

function generateMainPath() {
    // Build 40-position path by reading directly from boardMatrix
    const path = [];
    
    // Start at red's start and trace clockwise around the board
    // Red start: r6c0
    path.push({x: 0 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2}); // 0
    
    // Go RIGHT along row 6: cols 1-14
    for (let col = 1; col <= 14; col++) {
        if (col === 7) continue; // Skip center gap
        path.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2});
    }
    // Now at r6c14, positions 0-13 (14 total including start)
    
    // Go DOWN col 14: rows 7-8
    path.push({x: 14 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2}); // 14
    path.push({x: 14 * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2}); // 15 (Blue start)
    
    // Go LEFT along row 8: cols 13-0
    for (let col = 13; col >= 0; col--) {
        if (col === 7) continue; // Skip center gap
        path.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2});
    }
    // Now at r8c0, positions 16-29 (14 more)
    
    // Go UP col 0: row 7-6
    path.push({x: 0 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2}); // 30
    // Position 31 would be r6c0 which is position 0 (loop complete)
    
    console.log(`Generated path with ${path.length} positions`);
    
    // Pad to exactly 40 if needed
    while (path.length < 40) {
        path.push(path[path.length % path.length]);
    }
    
    return path.slice(0, 40);
}

function generateHomeStretches() {
    const stretches = {};
    
    // Each color's home stretch goes from their side towards center
    // Home stretch has 4 positions (not counting the white entrance field)
    // Red (top-left): goes RIGHT along row 7 (moved one down)
    stretches.red = [];
    for (let col = 1; col <= 4; col++) {
        stretches.red.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2});
    }
    
    // Yellow (top-right): goes DOWN along column 7
    stretches.yellow = [];
    for (let row = 1; row <= 4; row++) {
        stretches.yellow.push({x: 7 * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2});
    }
    
    // Green (bottom-left): goes UP along column 7
    stretches.green = [];
    for (let row = 13; row >= 10; row--) {
        stretches.green.push({x: 7 * CELL_SIZE + CELL_SIZE / 2, y: row * CELL_SIZE + CELL_SIZE / 2});
    }
    
    // Blue (bottom-right): goes LEFT along row 7 (moved one up)
    stretches.blue = [];
    for (let col = 13; col >= 10; col--) {
        stretches.blue.push({x: col * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2});
    }
    
    return stretches;
}

function drawMainPath() {
    // Start positions
    const startPositions = {
        green: {row: 14, col: 6, arrow: '↑', color: COLORS.green},
        red: {row: 6, col: 0, arrow: '→', color: COLORS.red},
        yellow: {row: 0, col: 8, arrow: '↓', color: COLORS.yellow},
        blue: {row: 8, col: 14, arrow: '←', color: COLORS.blue}
    };
    
    // Draw circles based on matrix
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            if (boardMatrix[row][col] === 1) {
                // Check if this is a start position
                let isStart = null;
                for (let color in startPositions) {
                    if (startPositions[color].row === row && startPositions[color].col === col) {
                        isStart = color;
                        break;
                    }
                }
                
                const circle = new Konva.Circle({
                    x: col * CELL_SIZE + CELL_SIZE / 2,
                    y: row * CELL_SIZE + CELL_SIZE / 2,
                    radius: CELL_SIZE * 0.4,
                    fill: isStart ? startPositions[isStart].color : COLORS.white,
                    stroke: '#000',
                    strokeWidth: 2
                });
                layer.add(circle);
                
                // Add arrow for start positions
                if (isStart) {
                    const arrow = new Konva.Text({
                        x: col * CELL_SIZE + CELL_SIZE / 2 - 12,
                        y: row * CELL_SIZE + CELL_SIZE / 2 - 15,
                        text: startPositions[isStart].arrow,
                        fontSize: 24,
                        fontStyle: 'bold',
                        fill: '#000'
                    });
                    layer.add(arrow);
                }
            }
        }
    }
}

function drawHomeStretches() {
    Object.keys(homeStretchCoords).forEach(color => {
        homeStretchCoords[color].forEach(coord => {
            const circle = new Konva.Circle({
                x: coord.x,
                y: coord.y,
                radius: CELL_SIZE * 0.4,
                fill: COLORS[color],
                stroke: '#000',
                strokeWidth: 2
            });
            layer.add(circle);
        });
    });
}

function drawCenter() {
    // No center field in Mensch ärgere dich nicht - pieces just finish at end of home stretch
}

function newGame() {
    console.log('newGame() called');
    gameActive = true;
    currentPlayer = 0;
    diceValue = 0;
    console.log(`gameActive set to ${gameActive}, currentPlayer=${currentPlayer}`);

    Object.keys(pieces).forEach(color => {
        pieces[color].forEach(piece => {
            piece.pos = -1;
            if (piece.circle) {
                piece.circle.destroy();
                piece.circle = null;
            }
        });
    });

    Object.keys(pieces).forEach(color => {
        pieces[color].forEach((piece, index) => {
            drawPiece(color, index);
        });
    });

    layer.draw();
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn - Roll the dice!`);
}

function drawPiece(color, index) {
    const piece = pieces[color][index];
    
    if (piece.circle) {
        piece.circle.destroy();
    }

    let x, y;
    
    if (piece.pos === -1) {
        x = piece.homeX;
        y = piece.homeY;
        console.log(`drawPiece: ${color}[${index}] at HOME (${x}, ${y})`);
    } else if (piece.pos >= 0 && piece.pos < 40) {
        const coord = mainPathCoords[piece.pos];
        if (!coord) {
            console.error(`ERROR: No coordinate for ${color}[${index}] at mainPath position ${piece.pos}!`);
            return;
        }
        x = coord.x;
        y = coord.y;
        console.log(`drawPiece: ${color}[${index}] at PATH pos ${piece.pos} (${x}, ${y})`);
    } else if (piece.pos >= 40 && piece.pos < 44) {
        // In home stretch (positions 40-43, 4 spaces total)
        const stretchIndex = piece.pos - 40;
        const coord = homeStretchCoords[color][stretchIndex];
        x = coord.x;
        y = coord.y;
        console.log(`drawPiece: ${color}[${index}] at STRETCH ${stretchIndex} (${x}, ${y})`);
    }

    const circle = new Konva.Circle({
        x: x,
        y: y,
        radius: 18,
        fill: COLORS[color],
        stroke: '#000',
        strokeWidth: 3,
        shadowColor: '#000',
        shadowBlur: 5,
        shadowOpacity: 0.5
    });

    circle.on('click', function() {
        console.log(`Piece clicked: color=${color}, index=${index}, currentPlayer=${players[currentPlayer]}, diceValue=${diceValue}, gameActive=${gameActive}`);
        if (gameActive && players[currentPlayer] === color && diceValue > 0) {
            movePiece(color, index);
        } else {
            if (!gameActive) console.log('Game not active');
            if (players[currentPlayer] !== color) console.log(`Not your turn (current: ${players[currentPlayer]})`);
            if (diceValue === 0) console.log('No dice rolled yet');
        }
    });

    circle.on('mouseenter', function() {
        if (gameActive && players[currentPlayer] === color && diceValue > 0) {
            // Check if this piece can actually move
            let canMove = false;
            
            // Special rule: If rolled 6 and have pieces in base, MUST move one out
            const piecesInBase = pieces[color].filter(p => p.pos === -1).length;
            const mustMoveOut = (diceValue === 6 && piecesInBase > 0);
            
            if (piece.pos === -1) {
                // In base - need 6 to get out, and must move out if rolled 6
                canMove = (diceValue === 6);
            } else if (mustMoveOut) {
                // Must move out, but this piece is already out - invalid
                canMove = false;
            } else if (piece.pos < 40) {
                // On main path - check if move is valid
                const entryToHomeStretch = getHomeStretchEntry(color);
                const newPos = piece.pos + diceValue;
                if (newPos > entryToHomeStretch) {
                    const overshoot = newPos - entryToHomeStretch;
                    if (overshoot <= 4) {
                        // Can enter home stretch (4 positions: 40-43) - check if space is free (no stacking)
                        const homeStretchPos = overshoot - 1;
                        const targetPos = 40 + homeStretchPos;
                        const spaceOccupied = pieces[color].some(p => p.pos === targetPos && p !== piece);
                        canMove = !spaceOccupied;
                    } else {
                        canMove = false; // Overshoots
                    }
                } else {
                    // Normal move on main path - check if space is free
                    const spaceOccupied = pieces[color].some(p => p.pos === newPos && p !== piece);
                    canMove = !spaceOccupied;
                }
            } else if (piece.pos >= 40 && piece.pos < 44) {
                // On home stretch (positions 40-43, 4 spaces) - check if can move without overshooting
                const newPos = piece.pos + diceValue;
                if (newPos < 44) {
                    // Check if target space is free (no stacking)
                    const spaceOccupied = pieces[color].some(p => p.pos === newPos && p !== piece);
                    canMove = !spaceOccupied;
                } else {
                    canMove = false; // Overshoots last space
                }
            }
            
            if (canMove) {
                circle.scale({x: 1.3, y: 1.3});
                circle.stroke('#FFD700'); // Gold highlight
                circle.strokeWidth(5);
                document.body.style.cursor = 'pointer';
                layer.draw();
            }
        }
    });

    circle.on('mouseleave', function() {
        circle.scale({x: 1, y: 1});
        circle.stroke('#000');
        circle.strokeWidth(3);
        document.body.style.cursor = 'default';
        layer.draw();
    });

    layer.add(circle);
    piece.circle = circle;
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiToggle').textContent = aiEnabled ? '🤖 2-4 Players (AI)' : '👤 Play vs AI OFF';
}

function rollDice() {
    console.log(`>>> rollDice() called: gameActive=${gameActive}, diceValue=${diceValue}`);
    if (!gameActive) {
        console.log(`>>> Dice roll blocked: game not active`);
        return;
    }
    if (diceValue !== 0) {
        console.log(`>>> Dice roll blocked: dice already rolled (diceValue=${diceValue})`);
        return;
    }

    const dice = document.getElementById('dice');
    dice.classList.add('rolling');

    setTimeout(() => {
        diceValue = Math.floor(Math.random() * 6) + 1;
        dice.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue - 1];
        dice.classList.remove('rolling');

        const color = players[currentPlayer];
        
        // Check if player has any valid moves
        // Special rule: If rolled 6 and have pieces in base, MUST move one out
        const piecesInBase = pieces[color].filter(p => p.pos === -1).length;
        const mustMoveOut = (diceValue === 6 && piecesInBase > 0);
        
        const hasValidMove = pieces[color].some(p => {
            // Pieces in home stretch (40-43) can't move further
            if (p.pos >= 40 && p.pos < 44) return false;
            
            // If must move out, only pieces in base are valid
            if (mustMoveOut) {
                return p.pos === -1;
            }
            
            if (p.pos === -1) return false; // Can't move out if not 6
            if (p.pos < 40) {
                const entryToHomeStretch = getHomeStretchEntry(color);
                const newPos = p.pos + diceValue;
                if (newPos > entryToHomeStretch) {
                    const overshoot = newPos - entryToHomeStretch;
                    if (overshoot > 4) return false; // Overshoots (home stretch has only 4 positions: 40-43)
                    const homeStretchPos = overshoot - 1;
                    // Check if target space is already occupied (no stacking)
                    const targetPos = 40 + homeStretchPos;
                    const spaceOccupied = pieces[color].some(pp => pp.pos === targetPos);
                    if (spaceOccupied) return false; // Space already taken
                    return true;
                }
                // Check if target space on main path is occupied by own piece
                const spaceOccupied = pieces[color].some(pp => pp.pos === newPos && pp !== p);
                return !spaceOccupied;
            }
            if (p.pos >= 40 && p.pos < 44) {
                // On home stretch (positions 40-43, 4 spaces)
                const newPos = p.pos + diceValue;
                if (newPos >= 44) return false; // Overshoots last space
                // Check if target space is already occupied (no stacking)
                const spaceOccupied = pieces[color].some(pp => pp.pos === newPos && pp !== p);
                if (spaceOccupied) return false; // Space already taken
                return true;
            }
            return false;
        });
        
        if (!hasValidMove) {
            updateStatus(`${color.toUpperCase()} rolled ${diceValue} - No valid moves!`);
            setTimeout(() => nextTurn(), 1500);
            return;
        }

        // Special rule: If rolled 6 and have pieces in base, MUST move one out
        const piecesInBase = pieces[color].filter(p => p.pos === -1).length;
        if (diceValue === 6 && piecesInBase > 0) {
            updateStatus(`${color.toUpperCase()} rolled 6! You MUST move a piece out of base!`);
        } else {
            updateStatus(`${color.toUpperCase()} rolled ${diceValue}! Click a piece to move.`);
        }

        if (aiEnabled && currentPlayer > 0) {
            setTimeout(aiMove, 1000);
        }
    }, 500);
}

function aiMove() {
    const color = players[currentPlayer];
    // Special rule: If rolled 6 and have pieces in base, MUST move one out
    const piecesInBase = pieces[color].filter(p => p.pos === -1).length;
    const mustMoveOut = (diceValue === 6 && piecesInBase > 0);
    
    const validPieces = pieces[color]
        .map((p, i) => ({piece: p, index: i}))
        .filter(({piece}) => {
            // Pieces in home stretch (40-43) can't move further
            if (piece.pos >= 40 && piece.pos < 44) return false;
            
            // If must move out, only pieces in base are valid
            if (mustMoveOut) {
                return piece.pos === -1;
            }
            
            if (piece.pos === -1) return false; // Can't move out if not 6
            if (piece.pos < 40) {
                const entryToHomeStretch = getHomeStretchEntry(color);
                const newPos = piece.pos + diceValue;
                if (newPos > entryToHomeStretch) {
                    const overshoot = newPos - entryToHomeStretch;
                    if (overshoot > 4) return false; // Overshoots (home stretch has only 4 positions: 40-43)
                    const homeStretchPos = overshoot - 1;
                    const targetPos = 40 + homeStretchPos;
                    // Check if target space is already occupied (no stacking)
                    const spaceOccupied = pieces[color].some(pp => pp.pos === targetPos && pp !== piece);
                    return !spaceOccupied;
                }
                // Check if target space on main path is occupied by own piece
                const spaceOccupied = pieces[color].some(pp => pp.pos === newPos && pp !== piece);
                return !spaceOccupied;
            }
            if (piece.pos >= 40 && piece.pos < 44) {
                // On home stretch (positions 40-43, 4 spaces)
                const newPos = piece.pos + diceValue;
                if (newPos >= 44) return false; // Overshoots last space
                // Check if target space is already occupied (no stacking)
                const spaceOccupied = pieces[color].some(pp => pp.pos === newPos && pp !== piece);
                return !spaceOccupied;
            }
            return false;
        });

    if (validPieces.length > 0) {
        const choice = validPieces[Math.floor(Math.random() * validPieces.length)];
        setTimeout(() => movePiece(color, choice.index), 500);
    } else {
        nextTurn();
    }
}

function movePiece(color, index) {
    if (!gameActive || diceValue === 0) return;

    const piece = pieces[color][index];
    
    console.log(`movePiece: color=${color}, index=${index}, pos=${piece.pos}, diceValue=${diceValue}`);

    // Pieces in home stretch (40-43) can't move further
    if (piece.pos >= 40 && piece.pos < 44) return;

    // Special rule: If rolled 6 and have pieces in base, MUST move one out
    const piecesInBase = pieces[color].filter(p => p.pos === -1).length;
    const mustMoveOut = (diceValue === 6 && piecesInBase > 0);
    
    if (mustMoveOut && piece.pos !== -1) {
        // Must move out, but this piece is already out - invalid
        console.log(`Invalid move: must move piece out of base first`);
        return;
    }

    if (piece.pos === -1) {
        // Piece is in base/home
        if (diceValue === 6) {
            // Rolled 6: move piece from base to start position
            piece.pos = getStartPos(color);
            console.log(`Moved ${color} piece ${index} from home to start position ${piece.pos}`);
        } else {
            // Need a 6 to get out
            return;
        }
    } else if (piece.pos < 40) {
        // On main path
        const entryToHomeStretch = getHomeStretchEntry(color);
        const newPos = piece.pos + diceValue;
        
        // Check if this move would enter or pass the home stretch entry point
        if (newPos > entryToHomeStretch) {
            // Would enter home stretch
            const overshoot = newPos - entryToHomeStretch;
            if (overshoot > 4) {
                // Overshoots home stretch (only 4 positions: 40-43) - invalid move
                console.log(`Invalid move: would overshoot home stretch by ${overshoot - 4}`);
                return;
            }
            // Entering home stretch (4 positions: 40-43)
            const homeStretchPos = overshoot - 1; // -1 because entry point is position 0 in home stretch
            const targetPos = 40 + homeStretchPos;
            
            // Check if target space is already occupied (no stacking allowed)
            const spaceOccupied = pieces[color].some(p => p.pos === targetPos && p !== piece);
            if (spaceOccupied) {
                console.log(`Invalid move: space already occupied in home stretch at position ${homeStretchPos}`);
                return;
            }
            
            piece.pos = targetPos;
        } else {
            // Normal move on main path
            // Check if target space is occupied by own piece (no stacking)
            const spaceOccupied = pieces[color].some(p => p.pos === newPos && p !== piece);
            if (spaceOccupied) {
                console.log(`Invalid move: space already occupied on main path`);
                return;
            }
            
            piece.pos = newPos;
            if (piece.pos >= 40) {
                piece.pos = piece.pos % 40; // Loop around if needed
            }
        }
    } else if (piece.pos >= 40 && piece.pos < 44) {
        // On home stretch (positions 40-43, 4 spaces total)
        const newPos = piece.pos + diceValue;
        if (newPos >= 44) {
            // Overshoots last space (position 43) - invalid move
            console.log(`Invalid move: would overshoot last space in home stretch`);
            return;
        }
        
        // Check if target space is already occupied (no stacking allowed)
        const spaceOccupied = pieces[color].some(p => p.pos === newPos && p !== piece);
        if (spaceOccupied) {
            console.log(`Invalid move: space already occupied in home stretch`);
            return;
        }
        
        piece.pos = newPos;
        // Win condition is all 4 pieces in home stretch (positions 40-43)
    }

    // Check for captures (only on main path)
    checkCapture(color, piece, index);

    drawPiece(color, index);
    layer.draw();

    // Win condition: all 4 pieces must be in the home stretch (positions 40-43, 4 spaces)
    if (pieces[color].every(p => p.pos >= 40 && p.pos < 44)) {
        gameActive = false;
        updateStatus(`🎉 ${color.toUpperCase()} WINS! Mensch, das war gut! 😄`);
        return;
    }

    if (diceValue === 6) {
        diceValue = 0;
        updateStatus(`${color.toUpperCase()} rolled 6! Go again!`);
    } else {
        nextTurn();
    }
}

function checkCapture(color, piece, index) {
    if (piece.pos < 0 || piece.pos >= 40) return; // Only capture on main path
    
    Object.keys(pieces).forEach(otherColor => {
        if (otherColor === color) return;
        
        pieces[otherColor].forEach((otherPiece, otherIndex) => {
            if (otherPiece.pos === piece.pos) {
                updateStatus(`${color.toUpperCase()} captured ${otherColor.toUpperCase()}! Mensch, ärgere dich nicht! 😄`);
                otherPiece.pos = -1;
                drawPiece(otherColor, otherIndex);
            }
        });
    });
}

function getStartPos(color) {
    // Start positions on main path after rolling 6
    // Path starts at red position 0, then goes around
    const positions = {
        red: 0,      // Red start at r6c0 (path position 0)
        blue: 15,    // Blue start at r8c14 (path position 15)
        yellow: 25,  // Yellow start (needs to be calculated)
        green: 35    // Green start (needs to be calculated)
    };
    const pos = positions[color];
    console.log(`getStartPos(${color}) = ${pos}, mainPathCoords length = ${mainPathCoords.length}`);
    if (pos >= mainPathCoords.length) {
        console.error(`ERROR: Start position ${pos} for ${color} exceeds path length ${mainPathCoords.length}!`);
    }
    return pos;
}

function getHomeStretchEntry(color) {
    // Position where each color enters their home stretch
    // These are the last positions before entering colored path
    return {red: 39, green: 9, blue: 19, yellow: 29}[color];
}

function nextTurn() {
    console.log(`--- nextTurn() called, resetting diceValue from ${diceValue} to 0`);
    diceValue = 0;
    currentPlayer = (currentPlayer + 1) % 4;
    renderPlayerInfo();
    updateStatus(`${players[currentPlayer].toUpperCase()}'s turn!`);

    if (aiEnabled && currentPlayer > 0) {
        console.log(`AI player ${players[currentPlayer]}, auto-rolling in 1 second...`);
        setTimeout(rollDice, 1000);
    }
}

function renderPlayerInfo() {
    const infoDiv = document.getElementById('playerInfo');
    infoDiv.innerHTML = '';

    players.forEach((color, index) => {
        const box = document.createElement('div');
        box.className = `player-box ${color}`;
        if (index === currentPlayer) box.classList.add('active');

        const inHomeStretch = pieces[color].filter(p => p.pos >= 40 && p.pos < 44).length;
        const onBoard = pieces[color].filter(p => p.pos >= 0 && p.pos < 40).length;
        const inBase = pieces[color].filter(p => p.pos === -1).length;

        box.innerHTML = `
            <h3 style="margin: 0;">${color.toUpperCase()} ${index === 0 ? '(You)' : '(AI)'}</h3>
            <p style="margin: 5px 0;">Base: ${inBase}</p>
            <p style="margin: 5px 0;">On Board: ${onBoard}</p>
            <p style="margin: 5px 0; color: #4CAF50;">Home Stretch: ${inHomeStretch}/4</p>
        `;

        infoDiv.appendChild(box);
    });
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Test mode: auto-move pieces along path
let testMode = false;
let testInterval = null;

// Test function: force roll a 6 for red player
window.testRoll6 = function() {
    console.log('=== testRoll6() START ===');
    console.log(`gameActive: ${gameActive}`);
    console.log(`currentPlayer: ${currentPlayer} (${players[currentPlayer]})`);
    console.log(`diceValue before: ${diceValue}`);
    
    if (!gameActive) {
        console.log('ERROR: Game not active!');
        return 'Game not active';
    }
    
    diceValue = 6;
    console.log(`diceValue after setting: ${diceValue}`);
    
    document.getElementById('dice').textContent = '⚅';
    updateStatus(`${players[currentPlayer].toUpperCase()} rolled 6! Click a piece to move.`);
    
    console.log(`=== testRoll6() END - diceValue is now ${diceValue} ===`);
    return `Rolled 6 for ${players[currentPlayer]}. Click a piece to move.`;
};

function startPathTest() {
    if (testMode) {
        // Stop test
        testMode = false;
        if (testInterval) clearInterval(testInterval);
        updateStatus('Test stopped');
        return;
    }
    
    // Start test
    testMode = true;
    newGame();
    
    // Put one piece of each color on the board at start positions
    players.forEach(color => {
        pieces[color][0].pos = 0;
    });
    
    drawAllPieces();
    updateStatus('Test mode: Auto-moving pieces...');
    
    // Auto-move every 1 second
    let colorIndex = 0;
    testInterval = setInterval(() => {
        if (!testMode) {
            clearInterval(testInterval);
            return;
        }
        
        const color = players[colorIndex];
        const piece = pieces[color][0];
        
        // Random steps 1-6
        const steps = Math.floor(Math.random() * 6) + 1;
        
        // Move piece
        if (piece.pos >= 0 && piece.pos < 100) {
            piece.pos += steps;
            if (piece.pos > 44) piece.pos = 44; // Cap at finish
        }
        
        drawAllPieces();
        updateStatus(`${color.toUpperCase()} moved ${steps} steps (pos: ${piece.pos})`);
        
        // Next color
        colorIndex = (colorIndex + 1) % players.length;
    }, 1000);
}

