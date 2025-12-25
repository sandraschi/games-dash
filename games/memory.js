// Memory Game Implementation
// **Timestamp**: 2025-12-04

let difficulty = 'easy';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let startTime = null;
let timerInterval = null;

const SYMBOLS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '🎼', '🎵', '🎶', '🏀', '⚽'];

const DIFFICULTIES = {
    easy: {rows: 3, cols: 4, pairs: 6},
    medium: {rows: 4, cols: 6, pairs: 12},
    hard: {rows: 6, cols: 6, pairs: 18}
};

function setDifficulty(diff) {
    difficulty = diff;
    
    ['easy', 'medium', 'hard'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) btn.classList.toggle('active', d === diff);
    });
    
    newGame();
}

function newGame() {
    const config = DIFFICULTIES[difficulty];
    const totalCards = config.pairs * 2;
    
    // Select random symbols
    const selectedSymbols = SYMBOLS.slice(0, config.pairs);
    cards = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    startTime = Date.now();
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    renderGrid();
    updateStats();
}

function renderGrid() {
    const config = DIFFICULTIES[difficulty];
    const gridElement = document.getElementById('memoryGrid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${config.cols}, 100px)`;
    gridElement.style.gridTemplateRows = `repeat(${config.rows}, 100px)`;
    
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.innerHTML = '<div class="card-back">?</div>';
        card.onclick = () => flipCard(index);
        gridElement.appendChild(card);
    });
}

function flipCard(index) {
    const card = document.querySelector(`.memory-card[data-index="${index}"]`);
    
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;
    
    card.classList.add('flipped');
    card.textContent = cards[index];
    flippedCards.push(index);
    
    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        checkMatch();
    }
}

function checkMatch() {
    const [index1, index2] = flippedCards;
    const card1 = document.querySelector(`.memory-card[data-index="${index1}"]`);
    const card2 = document.querySelector(`.memory-card[data-index="${index2}"]`);
    
    if (cards[index1] === cards[index2]) {
        // Match!
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];
            updateStats();
            
            // Check win
            const config = DIFFICULTIES[difficulty];
            if (matchedPairs === config.pairs) {
                clearInterval(timerInterval);
                document.getElementById('status').textContent = `🎉 YOU WIN! ${moves} moves in ${getTimeString()}`;
            }
        }, 500);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.innerHTML = '<div class="card-back">?</div>';
            card2.innerHTML = '<div class="card-back">?</div>';
            flippedCards = [];
        }, 1000);
    }
}

function updateStats() {
    document.getElementById('moves').textContent = moves;
    document.getElementById('matches').textContent = matchedPairs;
}

function updateTimer() {
    if (!startTime) return;
    document.getElementById('timer').textContent = getTimeString();
}

function getTimeString() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize
setDifficulty('easy');

