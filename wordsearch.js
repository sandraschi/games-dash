// Word Search Game Implementation
// **Timestamp**: 2025-12-03

const SIZE = 15;
let grid = [];
let words = [];
let foundWords = [];

const wordLists = {
    animals: ['ELEPHANT', 'GIRAFFE', 'ZEBRA', 'LION', 'TIGER', 'BEAR', 'MONKEY', 'DOLPHIN', 'WHALE', 'SHARK'],
    countries: ['AUSTRIA', 'GERMANY', 'JAPAN', 'FRANCE', 'ITALY', 'SPAIN', 'CHINA', 'INDIA', 'BRAZIL', 'CANADA'],
    technology: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'PYTHON', 'DATABASE', 'ALGORITHM', 'NETWORK']
};

function generateGrid(wordList) {
    grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(''));
    words = [...wordList];
    foundWords = [];
    
    // Place words
    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = getRandomDirection();
            const pos = getRandomPosition(word.length, direction);
            
            if (canPlace(word, pos, direction)) {
                placeWord(word, pos, direction);
                placed = true;
            }
            attempts++;
        }
    });
    
    // Fill empty cells
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (grid[row][col] === '') {
                grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }
}

function getRandomDirection() {
    const dirs = [
        [0, 1],   // Right
        [1, 0],   // Down
        [1, 1],   // Diagonal down-right
        [1, -1]   // Diagonal down-left
    ];
    return dirs[Math.floor(Math.random() * dirs.length)];
}

function getRandomPosition(length, direction) {
    const [dRow, dCol] = direction;
    const maxRow = dRow >= 0 ? SIZE - length * Math.abs(dRow) : length * Math.abs(dRow);
    const maxCol = dCol >= 0 ? SIZE - length * Math.abs(dCol) : length * Math.abs(dCol);
    
    return {
        row: Math.floor(Math.random() * (maxRow || SIZE)),
        col: Math.floor(Math.random() * (maxCol || SIZE))
    };
}

function canPlace(word, pos, direction) {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
        const row = pos.row + i * dRow;
        const col = pos.col + i * dCol;
        
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return false;
        if (grid[row][col] !== '' && grid[row][col] !== word[i]) return false;
    }
    return true;
}

function placeWord(word, pos, direction) {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
        const row = pos.row + i * dRow;
        const col = pos.col + i * dCol;
        grid[row][col] = word[i];
    }
}

function renderWordList() {
    const listElement = document.getElementById('wordList');
    listElement.innerHTML = '';
    
    words.forEach(word => {
        const item = document.createElement('div');
        item.className = 'word-item';
        if (foundWords.includes(word)) item.classList.add('found');
        item.textContent = word;
        listElement.appendChild(item);
    });
    
    if (foundWords.length === words.length) {
        document.getElementById('status').textContent = '🎉 ALL WORDS FOUND!';
    }
}

function newGame(theme) {
    const wordList = wordLists[theme];
    generateGrid(wordList);
    renderGrid();
    renderWordList();
    document.getElementById('status').textContent = `Find ${words.length} words!`;
}

function showHint() {
    const unfound = words.filter(w => !foundWords.includes(w));
    if (unfound.length > 0) {
        alert(`Hint: Look for "${unfound[0]}"`);
    }
}

// Mouse selection for words
let selecting = false;
let selection = [];

document.getElementById('wordGrid').addEventListener('mousedown', () => {
    selecting = true;
    selection = [];
});

document.getElementById('wordGrid').addEventListener('mouseup', () => {
    selecting = false;
    checkSelection();
    selection = [];
});

function checkSelection() {
    if (selection.length < 3) return;
    
    const word = selection.map(cell => grid[cell.row][cell.col]).join('');
    
    if (words.includes(word) && !foundWords.includes(word)) {
        foundWords.push(word);
        markFound(selection);
        renderWordList();
    }
}

function markFound(cells) {
    const gridElement = document.getElementById('wordGrid');
    cells.forEach(cell => {
        const index = cell.row * SIZE + cell.col;
        gridElement.children[index].classList.add('found');
    });
}

// Initialize
renderGrid();

