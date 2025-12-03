// Chess Education System
// **Timestamp**: 2025-12-03

let famousGames = [];
let currentGame = null;
let currentMoveIndex = 0;
let encyclopediaContent = {};
let lessons = [];
let currentPuzzle = null;
let puzzleBoard = null;
let openings = [];
let currentOpening = null;
let openingMoveIndex = 0;
let allOpenings = [];

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
    
    parsePGNAndRender();
}

function parsePGNAndRender() {
    // Simple PGN parser (simplified for demo)
    const moves = currentGame.pgn.split(/\d+\./).filter(m => m.trim());
    const moveList = document.getElementById('moveList');
    moveList.innerHTML = '';
    
    moves.forEach((move, index) => {
        const item = document.createElement('div');
        item.className = 'move-item';
        item.textContent = `${index + 1}. ${move.trim()}`;
        item.onclick = () => jumpToMove(index);
        moveList.appendChild(item);
    });
    
    updateCommentBox();
}

function nextMove() {
    if (currentMoveIndex < currentGame.pgn.split(/\d+\./).length - 1) {
        currentMoveIndex++;
        updateCommentBox();
    }
}

function prevMove() {
    if (currentMoveIndex > 0) {
        currentMoveIndex--;
        updateCommentBox();
    }
}

function firstMove() {
    currentMoveIndex = 0;
    updateCommentBox();
}

function lastMove() {
    currentMoveIndex = currentGame.pgn.split(/\d+\./).length - 1;
    updateCommentBox();
}

function jumpToMove(index) {
    currentMoveIndex = index;
    updateCommentBox();
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
        console.log('Fetching daily puzzle from Lichess...');
        const response = await fetch('https://lichess.org/api/puzzle/daily');
        
        if (!response.ok) {
            // Try Chess.com as fallback
            console.log('Trying Chess.com puzzle...');
            return await loadChessComPuzzle();
        }
        
        const data = await response.json();
        console.log('Lichess puzzle loaded:', data);
        
        currentPuzzle = {
            ...data.puzzle || data,
            source: 'Lichess'
        };
        displayPuzzle();
        
    } catch (error) {
        console.error('Failed to load Lichess puzzle:', error);
        // Try Chess.com as fallback
        await loadChessComPuzzle();
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
        
        currentPuzzle = {
            id: 'daily',
            fen: data.fen,
            solution: data.pgn ? data.pgn.split(' ') : [],
            rating: 1500,
            source: 'Chess.com'
        };
        displayPuzzle();
        
    } catch (error) {
        console.error('Failed to load Chess.com puzzle:', error);
        document.getElementById('puzzleTitle').textContent = 'Failed to load puzzle';
        document.getElementById('puzzleTask').textContent = 'Error connecting to puzzle APIs. Check your internet connection.';
    }
}

async function loadNewPuzzle() {
    try {
        // Get random puzzle from Lichess
        const response = await fetch('https://lichess.org/api/puzzle/daily');
        const data = await response.json();
        currentPuzzle = data.puzzle || data;
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

function renderPuzzleBoard(puzzle) {
    const boardElement = document.getElementById('puzzleBoard');
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    
    // Parse FEN if available
    const fen = puzzle.fen || puzzle.position || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const position = parseFEN(fen);
    
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
            
            const piece = position[row][col];
            if (piece) {
                square.textContent = piece;
            }
            
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
    
    displayOpeningDetails();
    renderOpeningBoard();
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
    
    document.getElementById('openingMoves').innerHTML = `
        <strong>Moves:</strong><br>
        ${currentOpening.moves.map((m, i) => `${i+1}. ${m}`).join(' ')}
    `;
}

function renderOpeningBoard() {
    const boardElement = document.getElementById('openingBoard');
    boardElement.innerHTML = '';
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = 'repeat(8, 60px)';
    boardElement.style.gridTemplateRows = 'repeat(8, 60px)';
    boardElement.style.border = '3px solid #333';
    
    // Start with initial position, apply moves up to current index
    const board = initBoard();
    
    // Apply moves (simplified - would need full move parser)
    // For now, show starting position
    
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
            
            const piece = board[row][col];
            if (piece) {
                const pieces = {
                    white: {
                        king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
                    },
                    black: {
                        king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
                    }
                };
                square.textContent = pieces[piece.color][piece.type];
            }
            
            boardElement.appendChild(square);
        }
    }
}

function prevOpeningMove() {
    if (openingMoveIndex > 0) {
        openingMoveIndex--;
        renderOpeningBoard();
    }
}

function nextOpeningMove() {
    if (openingMoveIndex < currentOpening.moves.length) {
        openingMoveIndex++;
        renderOpeningBoard();
    }
}

function resetOpening() {
    openingMoveIndex = 0;
    renderOpeningBoard();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading chess education content...');
    loadFamousGames();
    loadEncyclopedia();
    loadLessons();
    loadDailyPuzzle();
    loadOpenings();
});

