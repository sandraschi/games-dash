// Karuta Game Implementation (かるた)
// **Timestamp**: 2025-12-04

let difficulty = 'easy';
let cards = [];
let currentReading = null;
let playerScore = 0;
let aiScore = 0;
let gameActive = false;
let aiReactionTime = 2000;

// Karuta card database (Hiragana/Kanji pairs)
const KARUTA_CARDS = {
    easy: [
        {reading: 'いぬ', kanji: '犬', meaning: 'Dog'},
        {reading: 'ねこ', kanji: '猫', meaning: 'Cat'},
        {reading: 'さかな', kanji: '魚', meaning: 'Fish'},
        {reading: 'とり', kanji: '鳥', meaning: 'Bird'},
        {reading: 'はな', kanji: '花', meaning: 'Flower'},
        {reading: 'き', kanji: '木', meaning: 'Tree'},
        {reading: 'やま', kanji: '山', meaning: 'Mountain'},
        {reading: 'かわ', kanji: '川', meaning: 'River'},
        {reading: 'そら', kanji: '空', meaning: 'Sky'},
        {reading: 'ひ', kanji: '日', meaning: 'Sun'},
        {reading: 'つき', kanji: '月', meaning: 'Moon'},
        {reading: 'ほし', kanji: '星', meaning: 'Star'}
    ],
    medium: [
        {reading: 'べんきょう', kanji: '勉強', meaning: 'Study'},
        {reading: 'がっこう', kanji: '学校', meaning: 'School'},
        {reading: 'せんせい', kanji: '先生', meaning: 'Teacher'},
        {reading: 'がくせい', kanji: '学生', meaning: 'Student'},
        {reading: 'ともだち', kanji: '友達', meaning: 'Friend'},
        {reading: 'かぞく', kanji: '家族', meaning: 'Family'},
        {reading: 'しごと', kanji: '仕事', meaning: 'Work'},
        {reading: 'でんしゃ', kanji: '電車', meaning: 'Train'},
        {reading: 'くるま', kanji: '車', meaning: 'Car'},
        {reading: 'ひこうき', kanji: '飛行機', meaning: 'Airplane'}
    ],
    hard: [
        {reading: 'けいざい', kanji: '経済', meaning: 'Economy'},
        {reading: 'せいじ', kanji: '政治', meaning: 'Politics'},
        {reading: 'ぶんか', kanji: '文化', meaning: 'Culture'},
        {reading: 'れきし', kanji: '歴史', meaning: 'History'},
        {reading: 'かがく', kanji: '科学', meaning: 'Science'},
        {reading: 'ぎじゅつ', kanji: '技術', meaning: 'Technology'},
        {reading: 'しゃかい', kanji: '社会', meaning: 'Society'},
        {reading: 'きょういく', kanji: '教育', meaning: 'Education'}
    ]
};

function setDifficulty(diff) {
    difficulty = diff;
    
    ['easy', 'medium', 'hard'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) btn.classList.toggle('active', d === diff);
    });
    
    aiReactionTime = {
        easy: 2500,
        medium: 1500,
        hard: 800
    }[diff];
}

function startGame() {
    gameActive = true;
    playerScore = 0;
    aiScore = 0;
    
    cards = [...KARUTA_CARDS[difficulty]];
    shuffle(cards);
    
    renderCards();
    updateScores();
    nextRound();
    
    document.getElementById('startBtn').textContent = '▶️ NEXT';
}

function renderCards() {
    const field = document.getElementById('cardsField');
    field.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'karuta-card';
        cardElement.innerHTML = `
            <div class="kanji-large">${card.kanji}</div>
            <div class="meaning-small">${card.meaning}</div>
        `;
        cardElement.dataset.index = index;
        cardElement.onclick = () => grabCard(index);
        field.appendChild(cardElement);
    });
}

function nextRound() {
    if (cards.length === 0) {
        endGame();
        return;
    }
    
    // Pick random card to read
    const randomIndex = Math.floor(Math.random() * cards.length);
    currentReading = cards[randomIndex];
    
    const readingCard = document.getElementById('readingCard');
    readingCard.innerHTML = `<div class="reading-text">${currentReading.reading}</div>`;
    
    updateStatus(`速く！ Find: ${currentReading.meaning}!`);
    
    // AI attempts to grab card
    setTimeout(aiGrab, aiReactionTime + Math.random() * 1000);
}

function grabCard(index) {
    if (!gameActive) return;
    
    const grabbedCard = cards[index];
    const cardElement = document.querySelector(`.karuta-card[data-index="${index}"]`);
    
    if (grabbedCard.kanji === currentReading.kanji) {
        // Correct!
        playerScore++;
        cardElement.classList.add('correct');
        updateStatus(`正解！ Correct! +1 point`);
        playSound(800, 0.1);
        
        setTimeout(() => {
            cards.splice(index, 1);
            nextRound();
        }, 1000);
    } else {
        // Wrong!
        cardElement.classList.add('wrong');
        updateStatus(`違う！ Wrong card! Try again!`);
        playSound(200, 0.2);
        
        setTimeout(() => {
            cardElement.classList.remove('wrong');
        }, 500);
    }
    
    updateScores();
}

function aiGrab() {
    if (!gameActive || !currentReading) return;
    
    // Find correct card
    const correctIndex = cards.findIndex(c => c.kanji === currentReading.kanji);
    
    if (correctIndex !== -1) {
        aiScore++;
        const cardElement = document.querySelector(`.karuta-card[data-index="${correctIndex}"]`);
        
        if (cardElement) {
            cardElement.classList.add('correct');
            cardElement.style.background = '#FF9800';
        }
        
        updateStatus('AI grabbed first! 0 points for you');
        playSound(400, 0.15);
        
        setTimeout(() => {
            cards.splice(correctIndex, 1);
            nextRound();
        }, 1000);
        
        updateScores();
    }
}

function endGame() {
    gameActive = false;
    
    const winner = playerScore > aiScore ? 'YOU WIN' : playerScore < aiScore ? 'AI WINS' : 'TIE';
    const emoji = playerScore > aiScore ? '🎉' : playerScore < aiScore ? '😢' : '🤝';
    
    updateStatus(`${emoji} GAME OVER! ${winner}! (${playerScore} - ${aiScore})`);
    
    document.getElementById('readingCard').innerHTML = `
        <div>
            <div style="font-size: 72px; margin-bottom: 20px;">${emoji}</div>
            <div style="font-size: 32px; color: white;">${winner}</div>
            <div style="font-size: 24px; color: #FFD700; margin-top: 10px;">
                You: ${playerScore} - AI: ${aiScore}
            </div>
        </div>
    `;
    
    document.getElementById('startBtn').textContent = '🔄 NEW GAME';
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
    document.getElementById('remaining').textContent = cards.length;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function playSound(freq, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Initialize
updateScores();

