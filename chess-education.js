// Chess Education System
// **Timestamp**: 2025-12-03

let famousGames = [];
let currentGame = null;
let currentMoveIndex = 0;
let gameBoardState = null;
let gameMoves = [];
let blunders = [];
let currentBlunder = null;
let blunderBoardState = null;
let encyclopediaContent = {};
let lessons = [];
let currentPuzzle = null;
let puzzleBoard = null;
let puzzleBoardState = null;
let puzzleSelectedSquare = null;
let puzzleMoves = [];
let puzzleCurrentMoveIndex = 0;
let openings = [];
let currentOpening = null;
let openingMoveIndex = 0;
let openingBoardState = null;
let openingMoves = [];
let allOpenings = [];
let endgames = [];
let allEndgames = [];
let currentEndgame = null;
let endgameMoveIndex = 0;
let endgameBoardState = null;
let endgameMoves = [];

// Load famous games
async function loadFamousGames() {
    try {
        console.log('Fetching famous games...');
        const response = await fetch('data/chess/famous-games.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Famous games loaded:', data.games.length);
        famousGames = data.games;
        renderGamesList();
    } catch (error) {
        console.error('Failed to load famous games:', error);
        const list = document.getElementById('gamesList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error: ${error.message}<br>Check browser console for details.</p>`;
        }
    }
}

// Load encyclopedia content
async function loadEncyclopedia() {
    console.log('Loading encyclopedia...');
    const files = [
        'rules-basics',
        'ai-history', 
        'tournament-history',
        'hollywood-mistakes',
        'literature-media'
    ];
    
    for (const file of files) {
        try {
            const response = await fetch(`data/chess/encyclopedia/${file}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            encyclopediaContent[file] = data;
            console.log(`Loaded ${file}:`, data.title);
        } catch (error) {
            console.error(`Failed to load ${file}:`, error);
        }
    }
    
    console.log('Encyclopedia articles loaded:', Object.keys(encyclopediaContent).length);
    renderEncyclopedia();
}

function renderEncyclopedia() {
    const content = document.getElementById('encyclopediaList');
    
    if (Object.keys(encyclopediaContent).length === 0) {
        content.innerHTML = '<p style="color: #FF6B6B;">Encyclopedia content not found. Check data/chess/encyclopedia/ folder.</p>';
        return;
    }
    
    content.innerHTML = '';
    
    Object.entries(encyclopediaContent).forEach(([key, data]) => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${data.title}</h3>
            <p>Click to read full article</p>
            <span class="badge">${data.sections ? data.sections.length : 0} sections</span>
        `;
        card.onclick = () => showEncyclopediaArticle(key);
        content.appendChild(card);
    });
}

function showEncyclopediaArticle(key) {
    const data = encyclopediaContent[key];
    if (!data) return;
    
    const tab = document.getElementById('encyclopedia-tab');
    tab.innerHTML = `
        <button onclick="loadEncyclopedia(); renderEncyclopedia();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(76, 175, 80, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Encyclopedia</button>
        <h2>${data.title}</h2>
        ${data.sections.map(section => `
            <div style="margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">${section.title}</h3>
                <div style="white-space: pre-line; line-height: 1.8; color: #FFF;">${section.content}</div>
            </div>
        `).join('')}
    `;
}

function renderGamesList() {
    const list = document.getElementById('gamesList');
    list.innerHTML = '';
    
    famousGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${game.name}</h3>
            <p><strong>${game.white}</strong> vs <strong>${game.black}</strong></p>
            <p>${game.date} | ${game.event}</p>
            <p>${game.description}</p>
            <div class="status">
                <span class="badge">${game.difficulty}</span>
                ${game.themes.map(t => `<span class="badge">#${t}</span>`).join(' ')}
            </div>
        `;
        card.onclick = () => viewGame(game);
        list.appendChild(card);
    });
}

function viewGame(game) {
    currentGame = game;
    currentMoveIndex = 0;
    
    document.getElementById('gamesList').style.display = 'none';
    document.getElementById('gameViewer').style.display = 'block';
    document.getElementById('gameTitle').textContent = game.name;
    
    // Initialize board
    initializeGameBoard();
    parsePGNAndRender();
    renderGameBoard();
}

function initializeGameBoard() {
    // Initialize board to starting position
    gameBoardState = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up starting position
    const startingPosition = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = startingPosition[row][col];
            if (piece) {
                const isWhite = piece === piece.toUpperCase();
                gameBoardState[row][col] = {
                    type: getPieceTypeFromChar(piece),
                    color: isWhite ? 'white' : 'black'
                };
            }
        }
    }
    
    // Don't clear gameMoves here - they're set in parsePGNAndRender
    // gameMoves = [];
}

function getPieceTypeFromChar(char) {
    const lower = char.toLowerCase();
    const types = {
        'p': 'pawn', 'r': 'rook', 'n': 'knight',
        'b': 'bishop', 'q': 'queen', 'k': 'king'
    };
    return types[lower] || 'pawn';
}

function parsePGNAndRender() {
    // Parse PGN into individual moves
    if (!currentGame || !currentGame.pgn) {
        console.error('No game or PGN found!');
        gameMoves = [];
        return;
    }
    
    const pgn = currentGame.pgn;
    console.log('Parsing PGN:', pgn.substring(0, 100) + '...');
    
    // Split by move numbers and extract moves
    const movePairs = pgn.split(/\d+\./).filter(m => m.trim());
    gameMoves = [];
    
    movePairs.forEach(pair => {
        const moves = pair.trim().split(/\s+/).filter(m => m && !m.includes('.'));
        moves.forEach(move => {
            // Filter out comments, results, and other annotations
            if (move && !move.includes('{') && !move.includes('}') && 
                move !== '1-0' && move !== '0-1' && move !== '1/2-1/2' &&
                !move.match(/^\d+$/)) {
                gameMoves.push(move.trim());
            }
        });
    });
    
    console.log('Parsed gameMoves:', gameMoves.length, 'moves:', gameMoves);
    
    // Render move list
    const moveList = document.getElementById('moveList');
    if (!moveList) {
        console.error('moveList element not found!');
        return;
    }
    
    moveList.innerHTML = '';
    
    for (let i = 0; i < gameMoves.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = gameMoves[i] || '';
        const blackMove = gameMoves[i + 1] || '';
        
        const item = document.createElement('div');
        item.className = 'move-item';
        item.textContent = `${moveNum}. ${whiteMove} ${blackMove}`.trim();
        item.onclick = () => jumpToMove(moveNum - 1);
        if (moveNum - 1 === currentMoveIndex) {
            item.style.background = 'rgba(76, 175, 80, 0.3)';
        }
        moveList.appendChild(item);
    }
    
    updateCommentBox();
    renderGameBoard();
}

function nextMove() {
    console.log('nextMove called, currentMoveIndex:', currentMoveIndex, 'gameMoves.length:', gameMoves.length);
    if (!gameMoves || gameMoves.length === 0) {
        console.error('No game moves available!');
        return;
    }
    const maxMoves = Math.ceil(gameMoves.length / 2);
    if (currentMoveIndex < maxMoves) {
        currentMoveIndex++;
        console.log('Moved to move index:', currentMoveIndex);
        applyMovesToBoard();
        updateCommentBox();
        renderGameBoard();
        highlightCurrentMove();
    } else {
        console.log('Already at last move');
    }
}

function prevMove() {
    console.log('prevMove called, currentMoveIndex:', currentMoveIndex);
    if (currentMoveIndex > 0) {
        currentMoveIndex--;
        console.log('Moved to move index:', currentMoveIndex);
        applyMovesToBoard();
        updateCommentBox();
        renderGameBoard();
        highlightCurrentMove();
    } else {
        console.log('Already at first move');
    }
}

function firstMove() {
    console.log('firstMove called');
    currentMoveIndex = 0;
    applyMovesToBoard();
    updateCommentBox();
    renderGameBoard();
    highlightCurrentMove();
}

function lastMove() {
    console.log('lastMove called, gameMoves.length:', gameMoves.length);
    if (!gameMoves || gameMoves.length === 0) {
        console.error('No game moves available!');
        return;
    }
    currentMoveIndex = Math.ceil(gameMoves.length / 2);
    console.log('Moved to move index:', currentMoveIndex);
    applyMovesToBoard();
    updateCommentBox();
    renderGameBoard();
    highlightCurrentMove();
}

function jumpToMove(index) {
    currentMoveIndex = index;
    applyMovesToBoard();
    updateCommentBox();
    renderGameBoard();
    highlightCurrentMove();
}

function highlightCurrentMove() {
    const moveItems = document.querySelectorAll('#moveList .move-item');
    moveItems.forEach((item, index) => {
        if (index === currentMoveIndex) {
            item.style.background = 'rgba(76, 175, 80, 0.3)';
        } else {
            item.style.background = '';
        }
    });
}

function applyMovesToBoard() {
    // Reset to starting position
    initializeGameBoard();
    
    // Apply moves up to currentMoveIndex
    const movesToApply = currentMoveIndex * 2; // Each move number has white and black
    for (let i = 0; i < movesToApply && i < gameMoves.length; i++) {
        applyPGNMove(gameMoves[i], i % 2 === 0 ? 'white' : 'black');
    }
}

function applyPGNMove(moveNotation, color) {
    // Simplified PGN move parser - handles basic moves
    // Remove check/checkmate symbols
    moveNotation = moveNotation.replace(/[+#]/, '').trim();
    
    // Handle castling
    if (moveNotation === 'O-O' || moveNotation === '0-0') {
        applyCastle(color, 'kingside');
        return;
    }
    if (moveNotation === 'O-O-O' || moveNotation === '0-0-0') {
        applyCastle(color, 'queenside');
        return;
    }
    
    // Handle captures
    const isCapture = moveNotation.includes('x');
    moveNotation = moveNotation.replace('x', '');
    
    // Extract destination
    const destMatch = moveNotation.match(/([a-h])([1-8])$/);
    if (!destMatch) return;
    
    const destCol = destMatch[1].charCodeAt(0) - 97;
    const destRow = 8 - parseInt(destMatch[2]);
    
    // Determine piece type
    let pieceType = 'pawn';
    if (moveNotation[0] && moveNotation[0].toUpperCase() !== moveNotation[0].toLowerCase()) {
        const pieceChar = moveNotation[0].toUpperCase();
        const types = { 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king' };
        pieceType = types[pieceChar] || 'pawn';
        moveNotation = moveNotation.substring(1);
    }
    
    // Find the piece that can make this move
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameBoardState[row][col];
            if (piece && piece.type === pieceType && piece.color === color) {
                // Simple validation - check if move is possible
                if (canPieceMoveTo(row, col, destRow, destCol, pieceType, color)) {
                    gameBoardState[destRow][destCol] = piece;
                    gameBoardState[row][col] = null;
                    return;
                }
            }
        }
    }
}

function canPieceMoveTo(fromRow, fromCol, toRow, toCol, pieceType, color) {
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    switch (pieceType) {
        case 'pawn':
            const direction = color === 'white' ? -1 : 1;
            return (colDiff === 0 && rowDiff === direction) || 
                   (Math.abs(colDiff) === 1 && rowDiff === direction);
        case 'rook':
            return (rowDiff === 0 || colDiff === 0);
        case 'knight':
            return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                   (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
        case 'bishop':
            return Math.abs(rowDiff) === Math.abs(colDiff);
        case 'queen':
            return (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff));
        case 'king':
            return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
        default:
            return false;
    }
}

function applyCastle(color, side) {
    const row = color === 'white' ? 7 : 0;
    if (side === 'kingside') {
        // Move king
        gameBoardState[row][6] = gameBoardState[row][4];
        gameBoardState[row][4] = null;
        // Move rook
        gameBoardState[row][5] = gameBoardState[row][7];
        gameBoardState[row][7] = null;
    } else {
        // Move king
        gameBoardState[row][2] = gameBoardState[row][4];
        gameBoardState[row][4] = null;
        // Move rook
        gameBoardState[row][3] = gameBoardState[row][0];
        gameBoardState[row][0] = null;
    }
}

function renderGameBoard() {
    const boardElement = document.getElementById('chessboard');
    if (!boardElement) return;
    
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    boardElement.style.margin = '20px auto';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.style.width = '60px';
            square.style.height = '60px';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '40px';
            square.style.background = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
            
            const piece = gameBoardState[row][col];
            if (piece) {
                square.textContent = getPieceSymbol(piece);
            }
            
            boardElement.appendChild(square);
        }
    }
}

function updateCommentBox() {
    const commentBox = document.getElementById('commentBox');
    const moveKey = `move_${currentMoveIndex + 1}`;
    
    if (currentGame.comments[moveKey]) {
        commentBox.innerHTML = `
            <div class="comment-box">
                <strong>Move ${currentMoveIndex + 1}:</strong><br>
                ${currentGame.comments[moveKey]}
            </div>
        `;
    } else {
        commentBox.innerHTML = '';
    }
}

function closeViewer() {
    document.getElementById('gamesList').style.display = 'grid';
    document.getElementById('gameViewer').style.display = 'none';
}

// Make famous games navigation functions globally accessible
window.firstMove = firstMove;
window.prevMove = prevMove;
window.nextMove = nextMove;
window.lastMove = lastMove;
window.closeViewer = closeViewer;

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Load lessons
async function loadLessons() {
    try {
        console.log('Fetching lessons...');
        const response = await fetch('data/chess/lessons.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Lessons loaded:', data.lessons.length);
        lessons = data.lessons;
        renderLessons();
    } catch (error) {
        console.error('Failed to load lessons:', error);
        const list = document.getElementById('lessonsList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error: ${error.message}</p>`;
        }
    }
}

function renderLessons() {
    const container = document.getElementById('lessonsList');
    
    if (lessons.length === 0) {
        container.innerHTML = '<p style="color: #FF6B6B;">Lessons not found. Check data/chess/lessons.json file.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    lessons.forEach(lesson => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.description}</p>
            <div class="status">
                <span class="badge">${lesson.difficulty}</span>
                <span class="badge">⏱️ ${lesson.duration}</span>
            </div>
        `;
        card.onclick = () => showLesson(lesson);
        container.appendChild(card);
    });
}

function showLesson(lesson) {
    const lessonsTab = document.getElementById('lessons-tab');
    lessonsTab.innerHTML = `
        <button onclick="loadLessons(); renderLessons();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(76, 175, 80, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Lessons</button>
        <h2>${lesson.title}</h2>
        <div class="status">
            <span class="badge">${lesson.difficulty}</span>
            <span class="badge">⏱️ ${lesson.duration}</span>
        </div>
        <div style="margin-top: 30px; white-space: pre-line; line-height: 1.8; color: #FFF;">
            ${lesson.content}
        </div>
    `;
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Puzzle functionality
async function loadDailyPuzzle() {
    try {
        // Try Chess.com first since it provides FEN directly
        console.log('Fetching puzzle from Chess.com...');
        await loadChessComPuzzle();
    } catch (error) {
        console.error('Failed to load Chess.com puzzle, trying Lichess...', error);
        try {
            const response = await fetch('https://lichess.org/api/puzzle/daily');
            if (!response.ok) {
                throw new Error('Lichess API error');
            }
            
            const data = await response.json();
            console.log('Lichess puzzle loaded:', data);
            
            // Lichess API structure: { game: {...}, puzzle: {...} }
            const puzzle = data.puzzle || data;
            const game = data.game || {};
            
            // Store the full game data for FEN extraction
            currentPuzzle = {
                ...puzzle,
                game: game,
                source: 'Lichess'
            };
            
            // Extract FEN from game PGN if available
            if (game.pgn && puzzle.initialPly !== undefined) {
                currentPuzzle.fen = extractFENFromPGN(game.pgn, puzzle.initialPly);
            }
            
            // Also check if game has initialFen or fen field
            if (!currentPuzzle.fen && game.initialFen) {
                currentPuzzle.fen = game.initialFen;
            }
            if (!currentPuzzle.fen && game.fen) {
                currentPuzzle.fen = game.fen;
            }
            
            // If still no FEN, use starting position
            if (!currentPuzzle.fen) {
                console.warn('No FEN found, using starting position');
                currentPuzzle.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
            }
            
            displayPuzzle();
        } catch (lichessError) {
            console.error('Failed to load Lichess puzzle:', lichessError);
            // Use a default puzzle with starting position
            currentPuzzle = {
                id: 'default',
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                solution: [],
                rating: 1200,
                source: 'Default',
                themes: ['tactics']
            };
            displayPuzzle();
        }
    }
}

async function loadChessComPuzzle() {
    try {
        console.log('Fetching puzzle from Chess.com...');
        const response = await fetch('https://api.chess.com/pub/puzzle');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Chess.com puzzle loaded:', data);
        
        // Chess.com provides FEN directly
        if (!data.fen) {
            throw new Error('No FEN in Chess.com response');
        }
        
        // Parse solution moves from PGN if available
        let solutionMoves = [];
        if (data.pgn) {
            // Extract moves from PGN (simplified - just split by spaces and filter)
            solutionMoves = data.pgn.split(/\s+/).filter(m => 
                m && !m.match(/^\d+\./) && m !== '1-0' && m !== '0-1' && m !== '1/2-1/2'
            );
        }
        
        currentPuzzle = {
            id: data.id || 'daily',
            fen: data.fen,
            solution: solutionMoves,
            rating: data.rating || 1500,
            source: 'Chess.com',
            title: data.title || 'Daily Puzzle'
        };
        
        console.log('Puzzle FEN:', currentPuzzle.fen);
        displayPuzzle();
        
    } catch (error) {
        console.error('Failed to load Chess.com puzzle:', error);
        throw error; // Re-throw to allow fallback
    }
}

async function loadNewPuzzle() {
    try {
        // Get random puzzle from Lichess
        const response = await fetch('https://lichess.org/api/puzzle/daily');
        const data = await response.json();
        
        // Lichess API structure: { game: {...}, puzzle: {...} }
        const puzzle = data.puzzle || data;
        const game = data.game || {};
        
        // Store the full game data for FEN extraction
        currentPuzzle = {
            ...puzzle,
            game: game,
            source: 'Lichess'
        };
        
        // Extract FEN from game PGN if available
        if (game.pgn && puzzle.initialPly !== undefined) {
            currentPuzzle.fen = extractFENFromPGN(game.pgn, puzzle.initialPly);
        }
        
        // Also check if game has initialFen or fen field
        if (!currentPuzzle.fen && game.initialFen) {
            currentPuzzle.fen = game.initialFen;
        }
        if (!currentPuzzle.fen && game.fen) {
            currentPuzzle.fen = game.fen;
        }
        
        displayPuzzle();
    } catch (error) {
        console.error('Failed to load puzzle:', error);
    }
}

function displayPuzzle() {
    if (!currentPuzzle) return;
    
    const puzzle = currentPuzzle;
    
    // Display puzzle info with source
    document.getElementById('puzzleTitle').textContent = 
        `${puzzle.source || 'Lichess'} Puzzle ${puzzle.id || 'Daily'}`;
    document.getElementById('puzzleRating').textContent = 
        `⭐ Rating: ${puzzle.rating || 'N/A'} | 🎮 Played: ${puzzle.plays || 0} times`;
    
    // Task description
    const initialPly = puzzle.initialPly || 0;
    const toMove = initialPly % 2 === 0 ? 'White' : 'Black';
    document.getElementById('puzzleTask').innerHTML = `
        <strong>${toMove} to move</strong><br>
        Find the winning continuation!<br>
        <em>Hint: Look for forcing moves (checks, captures, threats)</em>
    `;
    
    // Display themes
    if (puzzle.themes && puzzle.themes.length > 0) {
        document.getElementById('puzzleThemes').textContent = 
            '🏷️ Themes: ' + puzzle.themes.join(', ');
    } else {
        document.getElementById('puzzleThemes').textContent = '';
    }
    
    // Popularity
    document.getElementById('puzzlePopularity').textContent = 
        `👍 ${puzzle.likes || 0} likes | 🎯 ${puzzle.plays || 0} attempts | 📊 Source: ${puzzle.source}`;
    
    // Solution (hidden initially)
    document.getElementById('puzzleSolution').style.display = 'none';
    if (puzzle.solution && puzzle.solution.length > 0) {
        document.getElementById('solutionMoves').textContent = 
            'Moves: ' + puzzle.solution.join(' → ');
    }
    
    // Render board
    renderPuzzleBoard(puzzle);
}

// Extract FEN position from PGN at a specific move number
// Note: This is a simplified implementation. For full accuracy, use a chess library like chess.js
function extractFENFromPGN(pgn, targetPly) {
    if (!pgn) return null;
    
    try {
        // Check if PGN contains FEN tag (some formats include it)
        const fenMatch = pgn.match(/\[FEN\s+"([^"]+)"/);
        if (fenMatch) {
            return fenMatch[1];
        }
        
        // For Lichess puzzles, we'd need to parse the PGN and apply moves
        // This is complex without a chess library, so we'll return null
        // and let the code use a fallback or try to get FEN from another source
        console.warn('Cannot extract FEN from PGN without chess engine. Using fallback.');
        return null;
        
    } catch (error) {
        console.error('Error extracting FEN from PGN:', error);
        return null;
    }
}

function renderPuzzleBoard(puzzle) {
    const boardElement = document.getElementById('puzzleBoard');
    if (!boardElement) {
        console.error('puzzleBoard element not found!');
        return;
    }
    
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    boardElement.style.cursor = 'pointer';
    
    // Parse FEN if available - try multiple possible field names
    let fen = puzzle.fen || puzzle.position || puzzle.game?.fen;
    
    // If no FEN, try to get it from the game PGN
    if (!fen && puzzle.game?.pgn && puzzle.initialPly !== undefined) {
        fen = extractFENFromPGN(puzzle.game.pgn, puzzle.initialPly);
    }
    
    // For Lichess puzzles, try to use the game's initial position
    // Lichess API sometimes includes the position in a different format
    if (!fen && puzzle.game) {
        // Check if there's position data in the game object
        if (puzzle.game.initialFen) {
            fen = puzzle.game.initialFen;
        } else if (puzzle.game.fen) {
            fen = puzzle.game.fen;
        }
    }
    
    // Fallback to starting position if still no FEN
    if (!fen) {
        console.warn('No FEN found in puzzle data:', puzzle);
        console.warn('Using starting position as fallback');
        fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    
    console.log('Rendering puzzle board with FEN:', fen);
    puzzleBoardState = parseFENToBoard(fen);
    
    if (!puzzleBoardState) {
        console.error('Failed to parse FEN:', fen);
        console.error('Using default starting position');
        puzzleBoardState = parseFENToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
    
    // Verify board was created correctly
    if (!puzzleBoardState || puzzleBoardState.length !== 8) {
        console.error('Invalid board state created, reinitializing...');
        puzzleBoardState = parseFENToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
    
    puzzleMoves = [];
    puzzleCurrentMoveIndex = 0;
    puzzleSelectedSquare = null;
    
    // Determine whose turn it is from FEN
    const fenParts = fen.split(' ');
    const activeColor = fenParts[1] || 'w';
    
    // Render the board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.style.width = '60px';
            square.style.height = '60px';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '40px';
            square.style.background = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
            square.style.cursor = 'pointer';
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = puzzleBoardState[row][col];
            if (piece) {
                square.textContent = getPieceSymbol(piece);
            }
            
            // Make squares clickable
            square.onclick = () => handlePuzzleSquareClick(row, col, activeColor);
            
            boardElement.appendChild(square);
        }
    }
}

function parseFEN(fen) {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const rows = fen.split(' ')[0].split('/');
    
    const pieceMap = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    
    for (let row = 0; row < 8; row++) {
        let col = 0;
        for (const char of rows[row]) {
            if (char >= '1' && char <= '8') {
                col += parseInt(char);
            } else {
                board[row][col] = pieceMap[char] || char;
                col++;
            }
        }
    }
    
    return board;
}

function parseFENToBoard(fen) {
    if (!fen || typeof fen !== 'string') {
        console.error('Invalid FEN string:', fen);
        return null;
    }
    
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const fenPart = fen.split(' ')[0]; // Get just the board position part
    const rows = fenPart.split('/');
    
    if (rows.length !== 8) {
        console.error('Invalid FEN format - expected 8 rows, got:', rows.length);
        return null;
    }
    
    const pieceTypes = {
        'K': 'king', 'Q': 'queen', 'R': 'rook', 'B': 'bishop', 'N': 'knight', 'P': 'pawn',
        'k': 'king', 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight', 'p': 'pawn'
    };
    
    for (let row = 0; row < 8; row++) {
        let col = 0;
        for (const char of rows[row]) {
            if (char >= '1' && char <= '8') {
                // Empty squares
                col += parseInt(char);
            } else if (pieceTypes[char.toLowerCase()]) {
                // Piece
                const isWhite = char === char.toUpperCase();
                board[row][col] = {
                    type: pieceTypes[char.toLowerCase()],
                    color: isWhite ? 'white' : 'black'
                };
                col++;
            } else {
                // Invalid character, skip
                console.warn('Invalid FEN character:', char, 'at row', row);
            }
            
            if (col > 8) {
                console.error('Column overflow at row', row);
                break;
            }
        }
        
        if (col !== 8) {
            console.warn('Row', row, 'has', col, 'columns instead of 8');
        }
    }
    
    return board;
}

function getPieceSymbol(piece) {
    const symbols = {
        white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
        black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
    };
    return symbols[piece.color][piece.type];
}

function handlePuzzleSquareClick(row, col, activeColor) {
    if (!puzzleBoardState) return;
    
    const piece = puzzleBoardState[row][col];
    const expectedColor = activeColor === 'w' ? 'white' : 'black';
    
    if (puzzleSelectedSquare) {
        const [fromRow, fromCol] = puzzleSelectedSquare;
        // Try to make move
        if (fromRow !== row || fromCol !== col) {
            makePuzzleMove(fromRow, fromCol, row, col, expectedColor);
        }
        clearPuzzleSelection();
    } else {
        // Select piece if it's the active color's turn
        if (piece && piece.color === expectedColor) {
            puzzleSelectedSquare = [row, col];
            highlightPuzzleSquare(row, col);
        }
    }
}

function highlightPuzzleSquare(row, col) {
    const squares = document.querySelectorAll('#puzzleBoard > div');
    squares.forEach(square => {
        square.style.boxShadow = '';
        const r = parseInt(square.dataset.row);
        const c = parseInt(square.dataset.col);
        if (r === row && c === col) {
            square.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.8)';
        }
    });
}

function clearPuzzleSelection() {
    puzzleSelectedSquare = null;
    const squares = document.querySelectorAll('#puzzleBoard > div');
    squares.forEach(square => {
        square.style.boxShadow = '';
    });
}

function makePuzzleMove(fromRow, fromCol, toRow, toCol, expectedColor) {
    const piece = puzzleBoardState[fromRow][fromCol];
    if (!piece || piece.color !== expectedColor) return;
    
    // Make the move
    puzzleBoardState[toRow][toCol] = piece;
    puzzleBoardState[fromRow][fromCol] = null;
    
    // Record move
    const moveNotation = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}${String.fromCharCode(97 + toCol)}${8 - toRow}`;
    puzzleMoves.push(moveNotation);
    
    // Re-render board
    renderPuzzleBoardState();
    
    // Check if move matches solution
    if (currentPuzzle && currentPuzzle.solution) {
        const solutionMoves = currentPuzzle.solution;
        if (puzzleMoves.length <= solutionMoves.length) {
            const expectedMove = solutionMoves[puzzleMoves.length - 1];
            if (moveNotation === expectedMove || moveNotation.toLowerCase() === expectedMove.toLowerCase()) {
                // Correct move!
                if (puzzleMoves.length === solutionMoves.length) {
                    alert('🎉 Puzzle solved!');
                }
            } else {
                alert('❌ Incorrect move. Try again!');
                // Reset to initial position
                resetPuzzle();
            }
        }
    }
}

function renderPuzzleBoardState() {
    const boardElement = document.getElementById('puzzleBoard');
    if (!boardElement || !puzzleBoardState) return;
    
    const squares = boardElement.querySelectorAll('div');
    squares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = puzzleBoardState[row][col];
        
        if (piece) {
            square.textContent = getPieceSymbol(piece);
        } else {
            square.textContent = '';
        }
    });
}

function showSolution() {
    document.getElementById('puzzleSolution').style.display = 'block';
}

function resetPuzzle() {
    document.getElementById('puzzleSolution').style.display = 'none';
    displayPuzzle();
}

// Load openings
async function loadOpenings() {
    try {
        console.log('Fetching chess openings...');
        const response = await fetch('data/chess/openings.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Openings loaded:', data.openings.length);
        openings = data.openings;
        allOpenings = [...openings];
        renderOpenings();
    } catch (error) {
        console.error('Failed to load openings:', error);
        const list = document.getElementById('openingsList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error loading openings: ${error.message}</p>`;
        }
    }
}

function renderOpenings() {
    const list = document.getElementById('openingsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    openings.forEach(opening => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${opening.name}</h3>
            <p><strong>ECO:</strong> ${opening.eco}</p>
            <p>${opening.description}</p>
            <div class="status">
                <span class="badge">${opening.difficulty}</span>
                <span class="badge">${opening.popularity.replace('_', ' ')}</span>
            </div>
        `;
        card.onclick = () => viewOpening(opening);
        list.appendChild(card);
    });
}

function filterOpenings() {
    const difficulty = document.getElementById('difficultyFilter').value;
    const search = document.getElementById('openingSearch').value.toLowerCase();
    
    openings = allOpenings.filter(opening => {
        const matchesDifficulty = difficulty === 'all' || opening.difficulty === difficulty;
        const matchesSearch = search === '' || 
            opening.name.toLowerCase().includes(search) ||
            opening.eco.toLowerCase().includes(search) ||
            opening.description.toLowerCase().includes(search);
        return matchesDifficulty && matchesSearch;
    });
    
    renderOpenings();
}

function viewOpening(opening) {
    currentOpening = opening;
    openingMoveIndex = 0;
    
    document.getElementById('openingsList').parentElement.querySelector('div:first-of-type').style.display = 'none';
    document.getElementById('openingsList').style.display = 'none';
    document.getElementById('openingViewer').style.display = 'block';
    
    // Initialize opening board and parse moves
    console.log('Viewing opening:', currentOpening);
    initializeOpeningBoard();
    parseOpeningMoves();
    displayOpeningDetails();
    renderOpeningBoard();
    updateOpeningMoveDisplay();
}

function closeOpeningViewer() {
    document.getElementById('openingsList').parentElement.querySelector('div:first-of-type').style.display = 'block';
    document.getElementById('openingsList').style.display = 'grid';
    document.getElementById('openingViewer').style.display = 'none';
}

function displayOpeningDetails() {
    if (!currentOpening) return;
    
    document.getElementById('openingName').textContent = currentOpening.name;
    document.getElementById('openingECO').textContent = `ECO Code: ${currentOpening.eco} | Difficulty: ${currentOpening.difficulty}`;
    document.getElementById('openingDescription').textContent = currentOpening.description;
    
    if (currentOpening.variations) {
        document.getElementById('openingVariations').innerHTML = `
            <strong>Common Variations:</strong><br>
            ${currentOpening.variations.map(v => `• ${v}`).join('<br>')}
        `;
    } else {
        document.getElementById('openingVariations').innerHTML = '';
    }
    
    updateOpeningMoveDisplay();
}

function initializeOpeningBoard() {
    // Initialize board to starting position
    openingBoardState = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Set up starting position
    const startingPosition = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = startingPosition[row][col];
            if (piece) {
                const isWhite = piece === piece.toUpperCase();
                openingBoardState[row][col] = {
                    type: getPieceTypeFromChar(piece),
                    color: isWhite ? 'white' : 'black'
                };
            }
        }
    }
}

function parseOpeningMoves() {
    if (!currentOpening || !currentOpening.moves) {
        console.warn('No opening or moves found');
        openingMoves = [];
        return;
    }
    
    // Parse moves from the opening's moves array
    // Moves are typically in format like "e4", "Nf3", "d4", etc.
    openingMoves = currentOpening.moves.map(move => move.trim());
    console.log('Parsed opening moves:', openingMoves);
}

function renderOpeningBoard() {
    const boardElement = document.getElementById('openingBoard');
    if (!boardElement) {
        console.error('openingBoard element not found!');
        return;
    }
    
    console.log('renderOpeningBoard called, moveIndex:', openingMoveIndex, 'moves:', openingMoves.length);
    
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    boardElement.style.margin = '20px auto';
    
    // Reset to starting position
    initializeOpeningBoard();
    
    // Apply moves up to current index
    for (let i = 0; i < openingMoveIndex && i < openingMoves.length; i++) {
        const move = openingMoves[i];
        const color = i % 2 === 0 ? 'white' : 'black';
        console.log(`Applying move ${i}: ${move} (${color})`);
        applyOpeningMove(move, color);
    }
    
    // Render the board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.style.width = '60px';
            square.style.height = '60px';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '40px';
            square.style.background = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
            
            const piece = openingBoardState[row][col];
            if (piece) {
                square.textContent = getPieceSymbol(piece);
            }
            
            boardElement.appendChild(square);
        }
    }
}

function applyOpeningMove(moveNotation, color) {
    if (!moveNotation) return;
    
    // Remove check/checkmate symbols
    moveNotation = moveNotation.replace(/[+#]/, '').trim();
    
    // Handle castling
    if (moveNotation === 'O-O' || moveNotation === '0-0') {
        applyOpeningCastle(color, 'kingside');
        return;
    }
    if (moveNotation === 'O-O-O' || moveNotation === '0-0-0') {
        applyOpeningCastle(color, 'queenside');
        return;
    }
    
    // Handle captures
    const isCapture = moveNotation.includes('x');
    moveNotation = moveNotation.replace('x', '');
    
    // Extract destination
    const destMatch = moveNotation.match(/([a-h])([1-8])$/);
    if (!destMatch) return;
    
    const destCol = destMatch[1].charCodeAt(0) - 97;
    const destRow = 8 - parseInt(destMatch[2]);
    
    // Determine piece type (default to pawn)
    let pieceType = 'pawn';
    let sourceHint = null;
    
    if (moveNotation[0] && moveNotation[0].toUpperCase() !== moveNotation[0].toLowerCase()) {
        const pieceChar = moveNotation[0].toUpperCase();
        const types = { 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king' };
        pieceType = types[pieceChar] || 'pawn';
        moveNotation = moveNotation.substring(1);
    }
    
    // Check for source file/rank hints (e.g., "Nbd2", "R1a3")
    if (moveNotation.length > 2) {
        const hint = moveNotation[0];
        if (hint >= 'a' && hint <= 'h') {
            sourceHint = { type: 'file', value: hint.charCodeAt(0) - 97 };
            moveNotation = moveNotation.substring(1);
        } else if (hint >= '1' && hint <= '8') {
            sourceHint = { type: 'rank', value: 8 - parseInt(hint) };
            moveNotation = moveNotation.substring(1);
        }
    }
    
    // Find the piece that can make this move
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = openingBoardState[row][col];
            if (piece && piece.type === pieceType && piece.color === color) {
                // Check source hint
                if (sourceHint) {
                    if (sourceHint.type === 'file' && col !== sourceHint.value) continue;
                    if (sourceHint.type === 'rank' && row !== sourceHint.value) continue;
                }
                
                // Simple validation - check if move is possible
                if (canPieceMoveTo(row, col, destRow, destCol, pieceType, color)) {
                    openingBoardState[destRow][destCol] = piece;
                    openingBoardState[row][col] = null;
                    return;
                }
            }
        }
    }
}

function applyOpeningCastle(color, side) {
    const row = color === 'white' ? 7 : 0;
    if (side === 'kingside') {
        // Move king
        openingBoardState[row][6] = openingBoardState[row][4];
        openingBoardState[row][4] = null;
        // Move rook
        openingBoardState[row][5] = openingBoardState[row][7];
        openingBoardState[row][7] = null;
    } else {
        // Move king
        openingBoardState[row][2] = openingBoardState[row][4];
        openingBoardState[row][4] = null;
        // Move rook
        openingBoardState[row][3] = openingBoardState[row][0];
        openingBoardState[row][0] = null;
    }
}

function prevOpeningMove() {
    console.log('prevOpeningMove called, current index:', openingMoveIndex);
    if (openingMoveIndex > 0) {
        openingMoveIndex--;
        console.log('Decremented to:', openingMoveIndex);
        renderOpeningBoard();
        updateOpeningMoveDisplay();
    } else {
        console.log('Already at first move');
    }
}

function nextOpeningMove() {
    console.log('nextOpeningMove called, current index:', openingMoveIndex, 'total moves:', openingMoves.length);
    console.log('openingMoves:', openingMoves);
    
    if (!openingMoves || openingMoves.length === 0) {
        console.error('No opening moves available!');
        return;
    }
    
    if (openingMoveIndex < openingMoves.length) {
        openingMoveIndex++;
        console.log('Incremented to:', openingMoveIndex);
        renderOpeningBoard();
        updateOpeningMoveDisplay();
    } else {
        console.log('Already at last move');
    }
}

function resetOpening() {
    console.log('resetOpening called');
    openingMoveIndex = 0;
    renderOpeningBoard();
    updateOpeningMoveDisplay();
}

// Make functions globally accessible
window.prevOpeningMove = prevOpeningMove;
window.nextOpeningMove = nextOpeningMove;
window.resetOpening = resetOpening;

function updateOpeningMoveDisplay() {
    const movesElement = document.getElementById('openingMoves');
    if (!movesElement || !currentOpening) return;
    
    let movesText = '<strong>Moves:</strong><br>';
    for (let i = 0; i < currentOpening.moves.length; i++) {
        const moveNum = Math.floor(i / 2) + 1;
        const isWhite = i % 2 === 0;
        
        if (isWhite) {
            movesText += `${moveNum}. `;
        }
        
        let moveText = currentOpening.moves[i];
        if (i < openingMoveIndex) {
            moveText = `<span style="color: #4CAF50; font-weight: bold;">${moveText}</span>`;
        } else if (i === openingMoveIndex) {
            moveText = `<span style="background: rgba(76, 175, 80, 0.3); padding: 2px 4px; border-radius: 3px;">${moveText}</span>`;
        }
        
        movesText += moveText + ' ';
        
        if (!isWhite || i === currentOpening.moves.length - 1) {
            movesText += '<br>';
        }
    }
    
    movesElement.innerHTML = movesText;
}

// Load blunders
async function loadBlunders() {
    try {
        console.log('Fetching chess blunders...');
        const response = await fetch('data/chess/blunders.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Blunders loaded:', data.blunders.length);
        blunders = data.blunders;
        renderBlundersList();
    } catch (error) {
        console.error('Failed to load blunders:', error);
        const list = document.getElementById('blundersList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error: ${error.message}</p>`;
        }
    }
}

function renderBlundersList() {
    const list = document.getElementById('blundersList');
    if (!list) return;
    
    list.innerHTML = '';
    
    blunders.forEach(blunder => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${blunder.title}</h3>
            <p><strong>${blunder.player}</strong> vs ${blunder.opponent}</p>
            <p>${blunder.date} | ${blunder.event}</p>
            <p>Move ${blunder.move_number}: ${blunder.blunder_move} ❌</p>
            <p style="color: #FFD700; margin-top: 10px;">${blunder.description.substring(0, 100)}...</p>
            <div class="status" style="margin-top: 10px;">
                <span class="badge">${blunder.difficulty}</span>
                ${blunder.themes.map(t => `<span class="badge">#${t}</span>`).join(' ')}
            </div>
        `;
        card.onclick = () => viewBlunder(blunder);
        list.appendChild(card);
    });
}

function viewBlunder(blunder) {
    currentBlunder = blunder;
    
    document.getElementById('blundersList').style.display = 'none';
    document.getElementById('blunderViewer').style.display = 'block';
    
    document.getElementById('blunderTitle').textContent = blunder.title;
    document.getElementById('blunderPlayer').innerHTML = `<strong>Player:</strong> ${blunder.player}<br><strong>Opponent:</strong> ${blunder.opponent}<br><strong>Event:</strong> ${blunder.event} (${blunder.date})`;
    document.getElementById('blunderMove').innerHTML = `<strong>Blunder Move:</strong> ${blunder.blunder_move} ❌<br><strong>Correct Move:</strong> ${blunder.correct_move} ✅<br><strong>Move Number:</strong> ${blunder.move_number}`;
    document.getElementById('blunderDescription').textContent = blunder.description;
    document.getElementById('blunderAnalysisText').textContent = blunder.analysis;
    document.getElementById('blunderLessonText').textContent = blunder.lesson;
    
    // Initialize board from FEN
    initializeBlunderBoard(blunder.position_fen);
    renderBlunderBoard();
}

function closeBlunderViewer() {
    document.getElementById('blundersList').style.display = 'grid';
    document.getElementById('blunderViewer').style.display = 'none';
}

function initializeBlunderBoard(fen) {
    blunderBoardState = parseFENToBoard(fen);
}

function showBlunderPosition() {
    if (!currentBlunder) return;
    initializeBlunderBoard(currentBlunder.position_fen);
    renderBlunderBoard();
}

function showBlunderMove() {
    if (!currentBlunder || !blunderBoardState) return;
    // Apply the blunder move to show the mistake
    // This is simplified - would need full move parsing
    renderBlunderBoard();
    alert(`Blunder: ${currentBlunder.blunder_move}\n\n${currentBlunder.analysis}`);
}

function showCorrectMove() {
    if (!currentBlunder || !blunderBoardState) return;
    // Show the correct move
    renderBlunderBoard();
    alert(`Correct Move: ${currentBlunder.correct_move}\n\nThis maintains the advantage and avoids the blunder.`);
}

function renderBlunderBoard() {
    const boardElement = document.getElementById('blunderBoard');
    if (!boardElement) return;
    
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    boardElement.style.margin = '20px auto';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.style.width = '60px';
            square.style.height = '60px';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '40px';
            square.style.background = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
            
            const piece = blunderBoardState[row][col];
            if (piece) {
                square.textContent = getPieceSymbol(piece);
            }
            
            boardElement.appendChild(square);
        }
    }
}

// Load endgames
async function loadEndgames() {
    try {
        console.log('Fetching chess endgames...');
        const response = await fetch('data/chess/endgames.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Endgames loaded:', data.endgames.length);
        endgames = data.endgames;
        allEndgames = [...endgames];
        renderEndgames();
    } catch (error) {
        console.error('Failed to load endgames:', error);
        const list = document.getElementById('endgamesList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error loading endgames: ${error.message}</p>`;
        }
    }
}

function renderEndgames() {
    const list = document.getElementById('endgamesList');
    if (!list) return;
    
    list.innerHTML = '';
    
    endgames.forEach(endgame => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${endgame.name}</h3>
            <p><strong>Category:</strong> ${endgame.category}</p>
            <p>${endgame.description}</p>
            <div class="status">
                <span class="badge">${endgame.difficulty}</span>
            </div>
        `;
        card.onclick = () => viewEndgame(endgame);
        list.appendChild(card);
    });
}

function filterEndgames() {
    const category = document.getElementById('endgameCategoryFilter').value;
    const difficulty = document.getElementById('endgameDifficultyFilter').value;
    const search = document.getElementById('endgameSearch').value.toLowerCase();
    
    endgames = allEndgames.filter(endgame => {
        const matchesCategory = category === 'all' || endgame.category === category;
        const matchesDifficulty = difficulty === 'all' || endgame.difficulty === difficulty;
        const matchesSearch = search === '' || 
            endgame.name.toLowerCase().includes(search) ||
            endgame.description.toLowerCase().includes(search) ||
            endgame.category.toLowerCase().includes(search);
        return matchesCategory && matchesDifficulty && matchesSearch;
    });
    
    renderEndgames();
}

function viewEndgame(endgame) {
    currentEndgame = endgame;
    endgameMoveIndex = 0;
    
    document.getElementById('endgamesList').parentElement.querySelector('div:first-of-type').style.display = 'none';
    document.getElementById('endgamesList').style.display = 'none';
    document.getElementById('endgameViewer').style.display = 'block';
    
    console.log('Viewing endgame:', currentEndgame);
    initializeEndgameBoard();
    parseEndgameMoves();
    displayEndgameDetails();
    renderEndgameBoard();
    updateEndgameMoveDisplay();
}

function closeEndgameViewer() {
    document.getElementById('endgamesList').parentElement.querySelector('div:first-of-type').style.display = 'block';
    document.getElementById('endgamesList').style.display = 'grid';
    document.getElementById('endgameViewer').style.display = 'none';
}

function displayEndgameDetails() {
    if (!currentEndgame) return;
    
    document.getElementById('endgameName').textContent = currentEndgame.name;
    document.getElementById('endgameCategory').textContent = `Category: ${currentEndgame.category} | Difficulty: ${currentEndgame.difficulty}`;
    document.getElementById('endgameDescription').textContent = currentEndgame.description;
    
    if (currentEndgame.keyPoints && currentEndgame.keyPoints.length > 0) {
        document.getElementById('endgameKeyPoints').innerHTML = `
            <strong>Key Points:</strong><br>
            ${currentEndgame.keyPoints.map(point => `• ${point}`).join('<br>')}
        `;
    } else {
        document.getElementById('endgameKeyPoints').innerHTML = '';
    }
    
    updateEndgameMoveDisplay();
}

function initializeEndgameBoard() {
    if (!currentEndgame || !currentEndgame.fen) {
        console.error('No endgame or FEN found');
        return;
    }
    
    endgameBoardState = parseFENToBoard(currentEndgame.fen);
}

function parseEndgameMoves() {
    if (!currentEndgame || !currentEndgame.solution) {
        console.warn('No endgame or solution found');
        endgameMoves = [];
        return;
    }
    
    if (Array.isArray(currentEndgame.solution)) {
        endgameMoves = currentEndgame.solution.map(move => String(move).trim()).filter(m => m);
    } else if (typeof currentEndgame.solution === 'string') {
        endgameMoves = currentEndgame.solution.split(/\s+/).map(m => m.trim()).filter(m => m);
    } else {
        console.error('Invalid solution format:', typeof currentEndgame.solution, currentEndgame.solution);
        endgameMoves = [];
    }
    
    console.log('Parsed endgame moves:', endgameMoves, 'from:', currentEndgame.solution);
}

function renderEndgameBoard() {
    const boardElement = document.getElementById('endgameBoard');
    if (!boardElement) {
        console.error('endgameBoard element not found!');
        return;
    }
    
    console.log('renderEndgameBoard called, moveIndex:', endgameMoveIndex, 'moves:', endgameMoves.length);
    
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    boardElement.style.margin = '20px auto';
    
    // Reset to starting position
    initializeEndgameBoard();
    
    // Apply moves up to current index
    if (endgameMoves && endgameMoves.length > 0) {
        for (let i = 0; i < endgameMoveIndex && i < endgameMoves.length; i++) {
            const move = endgameMoves[i];
            if (!move) {
                console.warn(`Skipping empty move at index ${i}`);
                continue;
            }
            const color = i % 2 === 0 ? 'white' : 'black';
            console.log(`Applying move ${i}: ${move} (${color})`);
            const success = applyEndgameMove(move, color);
            if (!success) {
                console.warn(`Failed to apply move ${i}: ${move}`);
            }
        }
    } else {
        console.warn('No moves to apply!');
    }
    
    // Render the board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.style.width = '60px';
            square.style.height = '60px';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '40px';
            square.style.background = (row + col) % 2 === 0 ? '#F0D9B5' : '#B58863';
            
            const piece = endgameBoardState[row][col];
            if (piece) {
                square.textContent = getPieceSymbol(piece);
            }
            
            boardElement.appendChild(square);
        }
    }
}

function applyEndgameMove(moveNotation, color) {
    if (!moveNotation) {
        console.warn('Empty move notation');
        return false;
    }
    
    if (!endgameBoardState) {
        console.error('endgameBoardState is null!');
        return false;
    }
    
    // Remove check/checkmate symbols
    moveNotation = String(moveNotation).replace(/[+#]/, '').trim();
    
    console.log(`Attempting to apply endgame move: ${moveNotation} for ${color}`);
    
    // Handle castling
    if (moveNotation === 'O-O' || moveNotation === '0-0') {
        applyEndgameCastle(color, 'kingside');
        return true;
    }
    if (moveNotation === 'O-O-O' || moveNotation === '0-0-0') {
        applyEndgameCastle(color, 'queenside');
        return true;
    }
    
    // Handle pawn promotion
    if (moveNotation.includes('=')) {
        moveNotation = moveNotation.split('=')[0];
    }
    
    // Handle captures
    const isCapture = moveNotation.includes('x');
    moveNotation = moveNotation.replace('x', '');
    
    // Extract destination
    const destMatch = moveNotation.match(/([a-h])([1-8])$/);
    if (!destMatch) {
        console.warn(`Could not parse destination from move: ${moveNotation}`);
        return false;
    }
    
    const destCol = destMatch[1].charCodeAt(0) - 97;
    const destRow = 8 - parseInt(destMatch[2]);
    
    // Determine piece type (default to pawn)
    let pieceType = 'pawn';
    let sourceHint = null;
    
    if (moveNotation[0] && moveNotation[0].toUpperCase() !== moveNotation[0].toLowerCase()) {
        const pieceChar = moveNotation[0].toUpperCase();
        const types = { 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king' };
        pieceType = types[pieceChar] || 'pawn';
        moveNotation = moveNotation.substring(1);
    }
    
    // Check for source file/rank hints
    if (moveNotation.length > 2) {
        const hint = moveNotation[0];
        if (hint >= 'a' && hint <= 'h') {
            sourceHint = { type: 'file', value: hint.charCodeAt(0) - 97 };
            moveNotation = moveNotation.substring(1);
        } else if (hint >= '1' && hint <= '8') {
            sourceHint = { type: 'rank', value: 8 - parseInt(hint) };
            moveNotation = moveNotation.substring(1);
        }
    }
    
    // Find the piece that can make this move
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = endgameBoardState[row][col];
            if (piece && piece.type === pieceType && piece.color === color) {
                // Check source hint
                if (sourceHint) {
                    if (sourceHint.type === 'file' && col !== sourceHint.value) continue;
                    if (sourceHint.type === 'rank' && row !== sourceHint.value) continue;
                }
                
                // Simple validation
                if (canPieceMoveTo(row, col, destRow, destCol, pieceType, color)) {
                    endgameBoardState[destRow][destCol] = piece;
                    endgameBoardState[row][col] = null;
                    console.log(`Successfully applied endgame move: ${moveNotation} from [${row},${col}] to [${destRow},${destCol}]`);
                    return true;
                }
            }
        }
    }
    
    console.warn(`Could not find piece to make move: ${moveNotation} for ${color}`);
    return false;
}

function applyEndgameCastle(color, side) {
    const row = color === 'white' ? 7 : 0;
    
    if (side === 'kingside') {
        endgameBoardState[row][6] = endgameBoardState[row][4];
        endgameBoardState[row][5] = endgameBoardState[row][7];
        endgameBoardState[row][4] = null;
        endgameBoardState[row][7] = null;
    } else {
        endgameBoardState[row][2] = endgameBoardState[row][4];
        endgameBoardState[row][3] = endgameBoardState[row][0];
        endgameBoardState[row][4] = null;
        endgameBoardState[row][0] = null;
    }
}

function prevEndgameMove() {
    console.log('prevEndgameMove called, current index:', endgameMoveIndex);
    if (endgameMoveIndex > 0) {
        endgameMoveIndex--;
        console.log('Decremented to:', endgameMoveIndex);
        renderEndgameBoard();
        updateEndgameMoveDisplay();
    } else {
        console.log('Already at first move');
    }
}

function nextEndgameMove() {
    console.log('nextEndgameMove called, current index:', endgameMoveIndex, 'total moves:', endgameMoves.length);
    
    if (!endgameMoves || endgameMoves.length === 0) {
        console.error('No endgame moves available!');
        return;
    }
    
    if (endgameMoveIndex < endgameMoves.length) {
        endgameMoveIndex++;
        console.log('Incremented to:', endgameMoveIndex);
        renderEndgameBoard();
        updateEndgameMoveDisplay();
    } else {
        console.log('Already at last move');
    }
}

function resetEndgame() {
    console.log('resetEndgame called');
    endgameMoveIndex = 0;
    renderEndgameBoard();
    updateEndgameMoveDisplay();
}

function updateEndgameMoveDisplay() {
    const movesElement = document.getElementById('endgameMoves');
    if (!movesElement || !endgameMoves || endgameMoves.length === 0) return;
    
    let moveText = '';
    for (let i = 0; i < endgameMoves.length; i++) {
        const moveNum = Math.floor(i / 2) + 1;
        const isWhite = i % 2 === 0;
        const move = endgameMoves[i];
        
        if (isWhite) {
            moveText += `${moveNum}. ${move} `;
        } else {
            moveText += `${move} `;
        }
        
        if (i < endgameMoves.length - 1 && isWhite) {
            moveText += ' ';
        }
    }
    
    // Highlight applied moves
    let highlightedText = '';
    let moveCount = 0;
    for (let i = 0; i < endgameMoves.length; i++) {
        const moveNum = Math.floor(i / 2) + 1;
        const isWhite = i % 2 === 0;
        const move = endgameMoves[i];
        let moveText = '';
        
        if (isWhite) {
            moveText = `${moveNum}. ${move} `;
        } else {
            moveText = `${move} `;
        }
        
        if (i < endgameMoveIndex) {
            moveText = `<span style="color: #4CAF50; font-weight: bold;">${moveText}</span>`;
        } else if (i === endgameMoveIndex) {
            moveText = `<span style="background: rgba(76, 175, 80, 0.3); padding: 2px 4px; border-radius: 3px;">${moveText}</span>`;
        }
        
        highlightedText += moveText;
    }
    
    movesElement.innerHTML = highlightedText;
}

// Make functions globally accessible
window.prevEndgameMove = prevEndgameMove;
window.nextEndgameMove = nextEndgameMove;
window.resetEndgame = resetEndgame;
window.viewEndgame = viewEndgame;
window.closeEndgameViewer = closeEndgameViewer;
window.filterEndgames = filterEndgames;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading chess education content...');
    loadFamousGames();
    loadEncyclopedia();
    loadLessons();
    loadDailyPuzzle();
    loadOpenings();
    loadBlunders();
    loadEndgames();
});

