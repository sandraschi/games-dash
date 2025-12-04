// Scrabble Game Implementation
// **Timestamp**: 2025-12-04

const BOARD_SIZE = 15;
let board = [];
let playerRack = [];
let aiRack = [];
let tileBag = [];
let playerScore = 0;
let aiScore = 0;
let currentTurn = 'player';
let placedTiles = [];
let gameActive = false;

// Tile values and distribution (Scrabble standard)
const TILE_VALUES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1,
    'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Q': 10, 'R': 1,
    'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10, '_': 0
};

const TILE_DISTRIBUTION = {
    'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12, 'F': 2, 'G': 3, 'H': 2, 'I': 9,
    'J': 1, 'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8, 'P': 2, 'Q': 1, 'R': 6,
    'S': 4, 'T': 6, 'U': 4, 'V': 2, 'W': 2, 'X': 1, 'Y': 2, 'Z': 1, '_': 2
};

// Premium squares layout
const PREMIUM_SQUARES = {
    tw: [[0,0],[0,7],[0,14],[7,0],[7,14],[14,0],[14,7],[14,14]], // Triple Word
    dw: [[1,1],[2,2],[3,3],[4,4],[1,13],[2,12],[3,11],[4,10],[10,4],[11,3],[12,2],[13,1],[10,10],[11,11],[12,12],[13,13]], // Double Word
    tl: [[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],[9,1],[9,5],[9,9],[9,13],[13,5],[13,9]], // Triple Letter
    dl: [[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],[7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],[14,3],[14,11]] // Double Letter
};

// Basic dictionary (top 1000 common words + Scrabble words)
const DICTIONARY = new Set([
    'THE', 'BE', 'TO', 'OF', 'AND', 'IN', 'THAT', 'HAVE', 'IT', 'FOR', 'NOT', 'ON', 'WITH', 'HE', 'AS', 'YOU',
    'DO', 'AT', 'THIS', 'BUT', 'HIS', 'BY', 'FROM', 'THEY', 'WE', 'SAY', 'HER', 'SHE', 'OR', 'AN', 'WILL', 'MY',
    'ONE', 'ALL', 'WOULD', 'THERE', 'THEIR', 'WHAT', 'SO', 'UP', 'OUT', 'IF', 'ABOUT', 'WHO', 'GET', 'WHICH', 'GO', 'ME',
    'WHEN', 'MAKE', 'CAN', 'LIKE', 'TIME', 'NO', 'JUST', 'HIM', 'KNOW', 'TAKE', 'PEOPLE', 'INTO', 'YEAR', 'YOUR', 'GOOD',
    'SOME', 'COULD', 'THEM', 'SEE', 'OTHER', 'THAN', 'THEN', 'NOW', 'LOOK', 'ONLY', 'COME', 'ITS', 'OVER', 'THINK',
    'ALSO', 'BACK', 'AFTER', 'USE', 'TWO', 'HOW', 'OUR', 'WORK', 'FIRST', 'WELL', 'WAY', 'EVEN', 'NEW', 'WANT', 'BECAUSE',
    'ANY', 'THESE', 'GIVE', 'DAY', 'MOST', 'US', 'CAT', 'DOG', 'RUN', 'BIG', 'SMALL', 'PLAY', 'HELP', 'FIND', 'CALL',
    'TRY', 'ASK', 'NEED', 'FEEL', 'BECOME', 'LEAVE', 'PUT', 'MEAN', 'KEEP', 'LET', 'BEGIN', 'SEEM', 'SHOW', 'TALK',
    'TURN', 'START', 'MIGHT', 'LIVE', 'BELIEVE', 'HOLD', 'BRING', 'HAPPEN', 'MUST', 'WRITE', 'PROVIDE', 'SIT', 'STAND',
    'LOSE', 'PAY', 'MEET', 'INCLUDE', 'CONTINUE', 'SET', 'LEARN', 'CHANGE', 'LEAD', 'UNDERSTAND', 'WATCH', 'FOLLOW',
    'STOP', 'CREATE', 'SPEAK', 'READ', 'ALLOW', 'ADD', 'SPEND', 'GROW', 'OPEN', 'WALK', 'WIN', 'OFFER', 'REMEMBER',
    'LOVE', 'CONSIDER', 'APPEAR', 'BUY', 'WAIT', 'SERVE', 'DIE', 'SEND', 'EXPECT', 'BUILD', 'STAY', 'FALL', 'CUT',
    'REACH', 'KILL', 'REMAIN', 'SUGGEST', 'RAISE', 'PASS', 'SELL', 'REQUIRE', 'REPORT', 'DECIDE', 'PULL',
    'QUIZ', 'JAZZ', 'FIZZ', 'BUZZ', 'ZAP', 'ZIP', 'ZEN', 'ZOO', 'ZEST', 'ZERO', 'ZONE', 'ZOOM',
    'QI', 'QAT', 'QOPH', 'QADI', 'QAID', 'QANAT', 'XI', 'XU', 'AX', 'OX', 'EX',
    'JO', 'JA', 'JEW', 'JAW', 'JAB', 'JAG', 'JAM', 'JAR', 'JET', 'JIG', 'JOB', 'JOG', 'JOT', 'JOY', 'JUG',
    'WORD', 'GAME', 'PLAY', 'TILE', 'BOARD', 'SCORE', 'POINT'
]);

function initializeBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    renderBoard();
}

function initializeTileBag() {
    tileBag = [];
    for (const [letter, count] of Object.entries(TILE_DISTRIBUTION)) {
        for (let i = 0; i < count; i++) {
            tileBag.push(letter);
        }
    }
    shuffleArray(tileBag);
}

function drawTiles(count) {
    const drawn = [];
    for (let i = 0; i < count && tileBag.length > 0; i++) {
        drawn.push(tileBag.pop());
    }
    return drawn;
}

function fillRack(rack) {
    while (rack.length < 7 && tileBag.length > 0) {
        rack.push(tileBag.pop());
    }
}

function renderBoard() {
    const boardElement = document.getElementById('scrabbleBoard');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add premium square styling
            if (row === 7 && col === 7) {
                cell.classList.add('center');
                cell.innerHTML = '<span class="premium-label">★</span>';
            } else {
                for (const [type, positions] of Object.entries(PREMIUM_SQUARES)) {
                    if (positions.some(([r, c]) => r === row && c === col)) {
                        cell.classList.add(type);
                        const labels = {tw: 'TW', dw: 'DW', tl: 'TL', dl: 'DL'};
                        cell.innerHTML = `<span class="premium-label">${labels[type]}</span>`;
                        break;
                    }
                }
            }
            
            // Add tile if occupied
            if (board[row][col]) {
                cell.classList.add('occupied');
                const letter = board[row][col];
                cell.innerHTML = `${letter}<span class="tile-score">${TILE_VALUES[letter]}</span>`;
            }
            
            cell.addEventListener('click', () => placeTileOnBoard(row, col));
            boardElement.appendChild(cell);
        }
    }
}

function renderPlayerRack() {
    const rackElement = document.getElementById('playerRack');
    rackElement.innerHTML = '';
    
    playerRack.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (letter === '_') tile.classList.add('blank');
        tile.textContent = letter === '_' ? '?' : letter;
        tile.innerHTML += `<span class="tile-score">${TILE_VALUES[letter]}</span>`;
        tile.dataset.index = index;
        tile.addEventListener('click', () => selectTile(index));
        rackElement.appendChild(tile);
    });
}

let selectedTileIndex = null;

function selectTile(index) {
    selectedTileIndex = index;
    updateStatus(`Selected: ${playerRack[index]}. Click a board square to place it.`);
}

function placeTileOnBoard(row, col) {
    if (!gameActive || currentTurn !== 'player') return;
    if (selectedTileIndex === null) {
        updateStatus('Select a tile from your rack first!');
        return;
    }
    if (board[row][col]) {
        updateStatus('That square is already occupied!');
        return;
    }
    
    const letter = playerRack[selectedTileIndex];
    board[row][col] = letter;
    placedTiles.push({row, col, letter});
    playerRack.splice(selectedTileIndex, 1);
    selectedTileIndex = null;
    
    renderBoard();
    renderPlayerRack();
    updateStatus(`Placed ${letter} at (${row},${col}). Continue or click "Play Word"`);
    document.getElementById('playBtn').disabled = false;
}

function recall() {
    placedTiles.forEach(({row, col, letter}) => {
        board[row][col] = null;
        playerRack.push(letter);
    });
    placedTiles = [];
    renderBoard();
    renderPlayerRack();
    updateStatus('Tiles recalled to rack');
    document.getElementById('playBtn').disabled = true;
}

function playWord() {
    if (placedTiles.length === 0) {
        updateStatus('Place tiles on the board first!');
        return;
    }
    
    const wordsFormed = getWordsFormed(placedTiles);
    if (wordsFormed.length === 0) {
        updateStatus('Invalid placement! Tiles must form connected words.');
        recall();
        return;
    }
    
    // Validate all words
    for (const word of wordsFormed) {
        if (!DICTIONARY.has(word.word)) {
            updateStatus(`"${word.word}" is not in the dictionary!`);
            recall();
            return;
        }
    }
    
    // Calculate score
    const score = calculateScore(wordsFormed, placedTiles);
    playerScore += score;
    logMove('Player', wordsFormed.map(w => w.word).join(', '), score);
    
    fillRack(playerRack);
    placedTiles = [];
    renderBoard();
    renderPlayerRack();
    updateScores();
    document.getElementById('playBtn').disabled = true;
    
    // AI turn
    currentTurn = 'ai';
    setTimeout(aiTurn, 1500);
}

function getWordsFormed(tiles) {
    // This is a simplified version - would need full validation
    const words = [];
    
    // Check horizontal word
    tiles.sort((a, b) => a.row === b.row ? a.col - b.col : a.row - b.row);
    if (tiles.length > 1 && tiles[0].row === tiles[tiles.length - 1].row) {
        let word = '';
        for (let col = tiles[0].col; col <= tiles[tiles.length - 1].col; col++) {
            word += board[tiles[0].row][col] || '?';
        }
        if (word.length > 1 && !word.includes('?')) {
            words.push({word, tiles});
        }
    }
    
    // Check vertical word
    if (tiles.length > 1 && tiles[0].col === tiles[tiles.length - 1].col) {
        let word = '';
        for (let row = tiles[0].row; row <= tiles[tiles.length - 1].row; row++) {
            word += board[row][tiles[0].col] || '?';
        }
        if (word.length > 1 && !word.includes('?')) {
            words.push({word, tiles});
        }
    }
    
    return words.length > 0 ? words : [{word: tiles.map(t => t.letter).join(''), tiles}];
}

function calculateScore(words, newTiles) {
    let score = 0;
    for (const {word, tiles} of words) {
        let wordScore = 0;
        let wordMultiplier = 1;
        
        for (const char of word) {
            let letterScore = TILE_VALUES[char];
            const tile = tiles.find(t => t.letter === char);
            
            if (tile && newTiles.includes(tile)) {
                // Check for letter multipliers
                if (isPremiumSquare('tl', tile.row, tile.col)) letterScore *= 3;
                if (isPremiumSquare('dl', tile.row, tile.col)) letterScore *= 2;
                
                // Check for word multipliers
                if (isPremiumSquare('tw', tile.row, tile.col)) wordMultiplier *= 3;
                if (isPremiumSquare('dw', tile.row, tile.col)) wordMultiplier *= 2;
            }
            
            wordScore += letterScore;
        }
        
        score += wordScore * wordMultiplier;
    }
    
    // Bonus for using all 7 tiles
    if (newTiles.length === 7) score += 50;
    
    return score;
}

function isPremiumSquare(type, row, col) {
    return PREMIUM_SQUARES[type].some(([r, c]) => r === row && c === col);
}

function aiTurn() {
    updateStatus('🤖 AI is thinking...');
    document.getElementById('status').classList.add('ai-turn-indicator');
    
    setTimeout(() => {
        const aiMove = findBestAIMove();
        
        if (aiMove) {
            // Place AI tiles
            aiMove.tiles.forEach(({row, col, letter}) => {
                board[row][col] = letter;
            });
            
            const score = calculateScore([{word: aiMove.word, tiles: aiMove.tiles}], aiMove.tiles);
            aiScore += score;
            logMove('AI', aiMove.word, score);
            
            // Remove used tiles and refill
            aiMove.tiles.forEach(t => {
                const index = aiRack.indexOf(t.letter);
                if (index > -1) aiRack.splice(index, 1);
            });
            fillRack(aiRack);
        } else {
            logMove('AI', 'PASS', 0);
        }
        
        renderBoard();
        updateScores();
        currentTurn = 'player';
        document.getElementById('status').classList.remove('ai-turn-indicator');
        updateStatus('Your turn!');
    }, 2000);
}

function findBestAIMove() {
    // Simplified AI: Try to place a word from AI rack horizontally
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col]) continue;
            
            // Try each word in dictionary that can be made from AI rack
            for (const word of DICTIONARY) {
                if (word.length > aiRack.length) continue;
                
                const letters = word.split('');
                const canMake = letters.every(l => aiRack.includes(l));
                
                if (canMake && col + word.length <= BOARD_SIZE) {
                    let valid = true;
                    for (let i = 0; i < word.length; i++) {
                        if (board[row][col + i]) {
                            valid = false;
                            break;
                        }
                    }
                    
                    if (valid) {
                        return {
                            word,
                            tiles: letters.map((letter, i) => ({row, col: col + i, letter}))
                        };
                    }
                }
            }
        }
    }
    
    return null;
}

function pass() {
    if (currentTurn !== 'player') return;
    logMove('Player', 'PASS', 0);
    currentTurn = 'ai';
    setTimeout(aiTurn, 1000);
}

function shuffle() {
    shuffleArray(playerRack);
    renderPlayerRack();
}

function newGame() {
    initializeBoard();
    initializeTileBag();
    
    playerRack = drawTiles(7);
    aiRack = drawTiles(7);
    playerScore = 0;
    aiScore = 0;
    placedTiles = [];
    currentTurn = 'player';
    gameActive = true;
    
    renderPlayerRack();
    updateScores();
    clearLog();
    updateStatus('Game started! Place tiles to form words.');
    document.getElementById('playBtn').disabled = true;
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
    document.getElementById('tilesRemaining').textContent = tileBag.length;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function logMove(player, word, score) {
    const log = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<strong>${player}:</strong> ${word} <span style="color: #4CAF50;">(+${score})</span>`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function clearLog() {
    document.getElementById('gameLog').innerHTML = '';
}

function showHelp() {
    alert(`SCRABBLE RULES:

1. Form words horizontally or vertically
2. Words must connect to existing tiles (except first word)
3. First word must use center star
4. Premium squares multiply your score:
   - TW = Triple Word Score
   - DW = Double Word Score  
   - TL = Triple Letter Score
   - DL = Double Letter Score
5. Use all 7 tiles in one turn = +50 bonus!
6. Game ends when tile bag is empty

HOW TO PLAY:
1. Click a tile in your rack
2. Click a board square to place it
3. Continue placing tiles
4. Click "Play Word" when done
5. Click "Recall" to take tiles back`);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initialize empty board
initializeBoard();

