// Shogi Education System
// **Timestamp**: 2025-12-03

let famousGames = [];
let currentGame = null;
let currentMoveIndex = 0;
let shogiBoardState = null;
let shogiMoves = [];
let blackCaptured = [];
let whiteCaptured = [];
let encyclopediaContent = {};

// Shogi piece Unicode characters
const PIECES = {
    black: {
        king: '玉', rook: '飛', bishop: '角', gold: '金', silver: '銀',
        knight: '桂', lance: '香', pawn: '歩',
        promoted_rook: '竜', promoted_bishop: '馬', promoted_silver: '成銀',
        promoted_knight: '成桂', promoted_lance: '成香', tokin: 'と'
    },
    white: {
        king: '王', rook: '飛', bishop: '角', gold: '金', silver: '銀',
        knight: '桂', lance: '香', pawn: '歩',
        promoted_rook: '竜', promoted_bishop: '馬', promoted_silver: '成銀',
        promoted_knight: '成桂', promoted_lance: '成香', tokin: 'と'
    }
};

// Initial Shogi board setup
function initBoard() {
    return [
        // Row 0 (White's back rank)
        [{type: 'lance', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'silver', color: 'white'}, {type: 'gold', color: 'white'}, {type: 'king', color: 'white'}, {type: 'gold', color: 'white'}, {type: 'silver', color: 'white'}, {type: 'knight', color: 'white'}, {type: 'lance', color: 'white'}],
        // Row 1
        [null, {type: 'rook', color: 'white'}, null, null, null, null, null, {type: 'bishop', color: 'white'}, null],
        // Row 2 (White pawns)
        Array(9).fill(null).map(() => ({type: 'pawn', color: 'white'})),
        // Rows 3-5 (Empty)
        Array(9).fill(null),
        Array(9).fill(null),
        Array(9).fill(null),
        // Row 6 (Black pawns)
        Array(9).fill(null).map(() => ({type: 'pawn', color: 'black'})),
        // Row 7
        [null, {type: 'bishop', color: 'black'}, null, null, null, null, null, {type: 'rook', color: 'black'}, null],
        // Row 8 (Black's back rank)
        [{type: 'lance', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'silver', color: 'black'}, {type: 'gold', color: 'black'}, {type: 'king', color: 'black'}, {type: 'gold', color: 'black'}, {type: 'silver', color: 'black'}, {type: 'knight', color: 'black'}, {type: 'lance', color: 'black'}]
    ];
}

// Load famous games
async function loadFamousGames() {
    try {
        console.log('Fetching famous Shogi games...');
        const response = await fetch('data/shogi/famous-games.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Famous Shogi games loaded:', data.games.length);
        famousGames = data.games;
        renderGamesList();
    } catch (error) {
        console.error('Failed to load famous games:', error);
        const list = document.getElementById('gamesList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error: ${error.message}<br>Check console for details.</p>`;
        }
    }
}

// Load encyclopedia
async function loadEncyclopedia() {
    console.log('Loading Shogi encyclopedia...');
    const files = ['rules-basics'];
    
    for (const file of files) {
        try {
            const response = await fetch(`data/shogi/encyclopedia/${file}.json`);
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
    
    console.log('Shogi encyclopedia articles loaded:', Object.keys(encyclopediaContent).length);
    renderEncyclopedia();
}

function renderEncyclopedia() {
    const content = document.getElementById('encyclopediaList');
    
    if (Object.keys(encyclopediaContent).length === 0) {
        content.innerHTML = '<p style="color: #FF6B6B;">Encyclopedia content not found.</p>';
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
        <button onclick="loadEncyclopedia(); renderEncyclopedia();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(255, 107, 107, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Encyclopedia</button>
        <h2>${data.title}</h2>
        ${data.sections.map(section => `
            <div style="margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <h3 style="color: #FF6B6B; margin-bottom: 15px;">${section.title}</h3>
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
    
    document.getElementById('gameTitle').textContent = `${game.name} - ${game.white} vs ${game.black}`;
    
    // Initialize board and parse moves
    initializeShogiBoard();
    parseKifu(game.kifu);
    renderBoard();
    renderMoveList();
    updateComments();
    updateCapturedPieces();
}

function closeViewer() {
    document.getElementById('gamesList').style.display = 'grid';
    document.getElementById('gameViewer').style.display = 'none';
}

function initializeShogiBoard() {
    shogiBoardState = initBoard();
    blackCaptured = [];
    whiteCaptured = [];
}

function parseKifu(kifu) {
    if (!kifu) {
        shogiMoves = [];
        return;
    }
    
    // Parse kifu notation (e.g., "P-7f P-3d P-2f")
    // Format: Piece-FileRank (e.g., P-7f = Pawn to 7f)
    shogiMoves = kifu.split(/\s+/).filter(m => m.trim() && m.includes('-'));
}

function renderBoard() {
    // Reset to initial position
    initializeShogiBoard();
    
    // Apply moves up to current index
    for (let i = 0; i < currentMoveIndex && i < shogiMoves.length; i++) {
        applyKifuMove(shogiMoves[i], i % 2 === 0 ? 'black' : 'white');
    }
    
    const boardElement = document.getElementById('shogiBoard');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const square = document.createElement('div');
            square.className = 'shogi-square';
            
            // Add promotion zone highlighting
            if (row < 3) square.classList.add('promotion-zone-white');
            if (row > 5) square.classList.add('promotion-zone-black');
            
            const piece = shogiBoardState[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.className = `piece-${piece.color}`;
                const pieceType = piece.promoted ? `promoted_${piece.type}` : piece.type;
                pieceElement.textContent = PIECES[piece.color][pieceType] || PIECES[piece.color][piece.type];
                square.appendChild(pieceElement);
            }
            
            boardElement.appendChild(square);
        }
    }
}

function applyKifuMove(moveNotation, color) {
    // Parse kifu move (e.g., "P-7f" = Pawn to 7f)
    // Format: Piece-FileRank or Piece*FileRank (drop)
    if (!moveNotation || !moveNotation.includes('-')) return;
    
    const isDrop = moveNotation.includes('*');
    const parts = moveNotation.replace('*', '').split('-');
    if (parts.length !== 2) return;
    
    const pieceType = parts[0].toLowerCase();
    const destination = parts[1];
    
    // Parse destination (e.g., "7f" = row 6, col 5)
    const file = destination[0].charCodeAt(0) - 97; // a=0, b=1, etc.
    const rank = 9 - parseInt(destination[1]); // 1=row 8, 9=row 0
    
    if (file < 0 || file > 8 || rank < 0 || rank > 8) return;
    
    const pieceMap = {
        'P': 'pawn', 'L': 'lance', 'N': 'knight', 'S': 'silver',
        'G': 'gold', 'B': 'bishop', 'R': 'rook', 'K': 'king'
    };
    
    const type = pieceMap[pieceType.toUpperCase()];
    if (!type) return;
    
    if (isDrop) {
        // Handle piece drop
        const captured = color === 'black' ? blackCaptured : whiteCaptured;
        const pieceIndex = captured.findIndex(p => p.type === type);
        if (pieceIndex >= 0) {
            captured.splice(pieceIndex, 1);
            shogiBoardState[rank][file] = { type, color };
        }
    } else {
        // Handle normal move - simplified (would need full move logic)
        // For now, just move a piece of the right type
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const piece = shogiBoardState[r][c];
                if (piece && piece.type === type && piece.color === color) {
                    // Check if this could be the move (simplified)
                    if (shogiBoardState[rank][file]) {
                        // Capture
                        const capturedPiece = shogiBoardState[rank][file];
                        if (color === 'black') {
                            whiteCaptured.push({ type: capturedPiece.type });
                        } else {
                            blackCaptured.push({ type: capturedPiece.type });
                        }
                    }
                    shogiBoardState[rank][file] = piece;
                    shogiBoardState[r][c] = null;
                    return;
                }
            }
        }
    }
}

function updateCapturedPieces() {
    const blackDiv = document.getElementById('blackCaptured');
    const whiteDiv = document.getElementById('whiteCaptured');
    
    if (blackDiv) {
        blackDiv.innerHTML = blackCaptured.map(p => {
            return `<span class="pieces">${PIECES.black[p.type]}</span>`;
        }).join('');
    }
    
    if (whiteDiv) {
        whiteDiv.innerHTML = whiteCaptured.map(p => {
            return `<span class="pieces">${PIECES.white[p.type]}</span>`;
        }).join('');
    }
}

function renderMoveList() {
    const moveList = document.getElementById('moveList');
    moveList.innerHTML = '';
    
    // Add initial position
    const initialItem = document.createElement('div');
    initialItem.className = 'move-item' + (currentMoveIndex === 0 ? ' active' : '');
    initialItem.textContent = 'Initial Position';
    initialItem.onclick = () => jumpToMove(0);
    moveList.appendChild(initialItem);
    
    // Add moves
    for (let i = 0; i < shogiMoves.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const blackMove = shogiMoves[i] || '';
        const whiteMove = shogiMoves[i + 1] || '';
        
        const item = document.createElement('div');
        item.className = 'move-item' + (moveNum === currentMoveIndex ? ' active' : '');
        item.textContent = `${moveNum}. ${blackMove} ${whiteMove}`.trim();
        item.onclick = () => jumpToMove(moveNum);
        moveList.appendChild(item);
    }
}

function jumpToMove(moveNum) {
    currentMoveIndex = moveNum;
    renderBoard();
    renderMoveList();
    updateComments();
    updateCapturedPieces();
}

function updateComments() {
    const commentBox = document.getElementById('commentBox');
    
    if (currentMoveIndex === 0) {
        commentBox.innerHTML = `
            <strong>${currentGame.name}</strong><br>
            <p><strong>${currentGame.white}</strong> (White/後手) vs <strong>${currentGame.black}</strong> (Black/先手)</p>
            <p>${currentGame.date} - ${currentGame.event}</p>
            <p style="margin-top: 15px;">${currentGame.description}</p>
        `;
    } else {
        const commentKey = `move_${currentMoveIndex}`;
        const comment = currentGame.comments[commentKey] || 'Continue following the game...';
        commentBox.innerHTML = `
            <strong>Move ${currentMoveIndex}</strong><br>
            <p>${comment}</p>
        `;
    }
}

function firstMove() {
    currentMoveIndex = 0;
    renderBoard();
    renderMoveList();
    updateComments();
    updateCapturedPieces();
}

function prevMove() {
    if (currentMoveIndex > 0) {
        currentMoveIndex--;
        renderBoard();
        renderMoveList();
        updateComments();
        updateCapturedPieces();
    }
}

function nextMove() {
    const maxMoves = Math.ceil(shogiMoves.length / 2);
    if (currentMoveIndex < maxMoves) {
        currentMoveIndex++;
        renderBoard();
        renderMoveList();
        updateComments();
        updateCapturedPieces();
    }
}

function lastMove() {
    currentMoveIndex = Math.ceil(shogiMoves.length / 2);
    renderBoard();
    renderMoveList();
    updateComments();
    updateCapturedPieces();
}

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading Shogi education content...');
    loadFamousGames();
    loadEncyclopedia();
});

