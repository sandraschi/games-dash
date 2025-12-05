// Hanafuda (花札) - Japanese Flower Cards Game
// Koi-Koi variant

// Hanafuda deck: 48 cards, 12 months, 4 cards per month
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Card types and symbols
const CARD_SYMBOLS = {
    'January': { symbol: '🌲', name: 'Pine' },
    'February': { symbol: '🌸', name: 'Plum' },
    'March': { symbol: '🌺', name: 'Cherry' },
    'April': { symbol: '🌿', name: 'Wisteria' },
    'May': { symbol: '🌻', name: 'Iris' },
    'June': { symbol: '🌷', name: 'Peony' },
    'July': { symbol: '🌾', name: 'Bush Clover' },
    'August': { symbol: '🌙', name: 'Moon' },
    'September': { symbol: '🍁', name: 'Chrysanthemum' },
    'October': { symbol: '🍂', name: 'Maple' },
    'November': { symbol: '🌧️', name: 'Willow' },
    'December': { symbol: '❄️', name: 'Paulownia' }
};

// Card types: Plain, Ribbon, Animal, Bright
const CARD_TYPES = {
    PLAIN: 'plain',
    RIBBON: 'ribbon',
    ANIMAL: 'animal',
    BRIGHT: 'bright'
};

// Create full deck
function createDeck() {
    const deck = [];
    
    MONTHS.forEach((month, monthIndex) => {
        // Each month has 4 cards
        // Simplified: 2 plain, 1 ribbon, 1 special (animal/bright)
        deck.push({
            id: `${monthIndex}-0`,
            month: month,
            monthNum: monthIndex + 1,
            type: CARD_TYPES.PLAIN,
            symbol: CARD_SYMBOLS[month].symbol,
            name: CARD_SYMBOLS[month].name
        });
        
        deck.push({
            id: `${monthIndex}-1`,
            month: month,
            monthNum: monthIndex + 1,
            type: CARD_TYPES.PLAIN,
            symbol: CARD_SYMBOLS[month].symbol,
            name: CARD_SYMBOLS[month].name
        });
        
        deck.push({
            id: `${monthIndex}-2`,
            month: month,
            monthNum: monthIndex + 1,
            type: CARD_TYPES.RIBBON,
            symbol: CARD_SYMBOLS[month].symbol,
            name: CARD_SYMBOLS[month].name
        });
        
        // Special cards (animals/brights) for certain months
        if ([0, 2, 6, 7, 10].includes(monthIndex)) {
            // Bright cards (January, March, August, November)
            deck.push({
                id: `${monthIndex}-3`,
                month: month,
                monthNum: monthIndex + 1,
                type: CARD_TYPES.BRIGHT,
                symbol: CARD_SYMBOLS[month].symbol,
                name: CARD_SYMBOLS[month].name
            });
        } else {
            // Animal cards
            deck.push({
                id: `${monthIndex}-3`,
                month: month,
                monthNum: monthIndex + 1,
                type: CARD_TYPES.ANIMAL,
                symbol: CARD_SYMBOLS[month].symbol,
                name: CARD_SYMBOLS[month].name
            });
        }
    });
    
    return deck;
}

// Game state
let gameState = {
    deck: [],
    playerHand: [],
    aiHand: [],
    field: [],
    playerCaptured: [],
    aiCaptured: [],
    currentPlayer: 'player', // 'player' or 'ai'
    selectedCard: null,
    gameActive: false,
    playerScore: 0,
    aiScore: 0,
    round: 1
};

// Yaku (scoring combinations)
const YAKU = {
    'Five Brights': { cards: 5, type: 'bright', points: 10 },
    'Four Brights': { cards: 4, type: 'bright', points: 8 },
    'Three Brights': { cards: 3, type: 'bright', points: 5 },
    'Boar, Deer, Butterflies': { cards: 3, type: 'animal', points: 5 },
    'Viewing the Moon': { cards: 1, type: 'bright', points: 5 },
    'Viewing the Flowers': { cards: 1, type: 'bright', points: 5 },
    'Red Ribbons': { cards: 3, type: 'ribbon', points: 5 },
    'Blue Ribbons': { cards: 3, type: 'ribbon', points: 5 },
    'Poetry Ribbons': { cards: 3, type: 'ribbon', points: 5 }
};

// Shuffle deck
function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize new game
function newGame() {
    const deck = shuffleDeck(createDeck());
    
    // Deal 8 cards to each player
    gameState.playerHand = deck.splice(0, 8);
    gameState.aiHand = deck.splice(0, 8);
    
    // Place 8 cards face-up on the field
    gameState.field = deck.splice(0, 8);
    
    // Remaining cards become draw pile
    gameState.deck = deck;
    
    gameState.playerCaptured = [];
    gameState.aiCaptured = [];
    gameState.currentPlayer = 'player';
    gameState.selectedCard = null;
    gameState.gameActive = true;
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.round = 1;
    
    updateDisplay();
    updateStatus('Your turn! Select a card from your hand to play.');
}

// Select card from hand
function selectCard(cardId) {
    if (!gameState.gameActive || gameState.currentPlayer !== 'player') return;
    
    const card = gameState.playerHand.find(c => c.id === cardId);
    if (!card) return;
    
    gameState.selectedCard = card;
    updateDisplay();
}

// Play selected card
function playCard() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'player') return;
    if (!gameState.selectedCard) {
        updateStatus('Please select a card from your hand.');
        return;
    }
    
    const card = gameState.selectedCard;
    const month = card.month;
    
    // Find matching cards in field
    const matches = gameState.field.filter(c => c.month === month);
    
    if (matches.length > 0) {
        // Match found - capture both cards
        gameState.playerCaptured.push(card, ...matches);
        gameState.playerHand = gameState.playerHand.filter(c => c.id !== card.id);
        gameState.field = gameState.field.filter(c => !matches.includes(c));
        
        // Draw new card from deck
        if (gameState.deck.length > 0) {
            const drawn = gameState.deck.pop();
            gameState.playerHand.push(drawn);
        }
        
        // Check for yaku
        const yaku = checkYaku(gameState.playerCaptured);
        if (yaku.length > 0) {
            showYakuOptions(yaku);
            return;
        }
    } else {
        // No match - place card on field
        gameState.field.push(card);
        gameState.playerHand = gameState.playerHand.filter(c => c.id !== card.id);
        
        // Draw new card from deck
        if (gameState.deck.length > 0) {
            const drawn = gameState.deck.pop();
            gameState.playerHand.push(drawn);
        }
    }
    
    gameState.selectedCard = null;
    
    // Check win conditions
    if (gameState.playerHand.length === 0 || gameState.deck.length === 0) {
        endRound();
        return;
    }
    
    // AI turn
    gameState.currentPlayer = 'ai';
    updateDisplay();
    updateStatus('AI is thinking...');
    
    setTimeout(() => aiTurn(), 1000);
}

// AI turn
function aiTurn() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'ai') return;
    
    // Simple AI: try to match cards
    let played = false;
    
    for (const card of gameState.aiHand) {
        const matches = gameState.field.filter(c => c.month === card.month);
        
        if (matches.length > 0) {
            // Match found
            gameState.aiCaptured.push(card, ...matches);
            gameState.aiHand = gameState.aiHand.filter(c => c.id !== card.id);
            gameState.field = gameState.field.filter(c => !matches.includes(c));
            played = true;
            
            // Draw new card
            if (gameState.deck.length > 0) {
                const drawn = gameState.deck.pop();
                gameState.aiHand.push(drawn);
            }
            
            break;
        }
    }
    
    if (!played && gameState.aiHand.length > 0) {
        // No match - play random card
        const randomIndex = Math.floor(Math.random() * gameState.aiHand.length);
        const card = gameState.aiHand[randomIndex];
        gameState.field.push(card);
        gameState.aiHand = gameState.aiHand.filter(c => c.id !== card.id);
        
        // Draw new card
        if (gameState.deck.length > 0) {
            const drawn = gameState.deck.pop();
            gameState.aiHand.push(drawn);
        }
    }
    
    // Check win conditions
    if (gameState.aiHand.length === 0 || gameState.deck.length === 0) {
        endRound();
        return;
    }
    
    // Player turn
    gameState.currentPlayer = 'player';
    updateDisplay();
    updateStatus('Your turn! Select a card from your hand to play.');
}

// Check for yaku (scoring combinations)
function checkYaku(captured) {
    const yaku = [];
    
    const brights = captured.filter(c => c.type === CARD_TYPES.BRIGHT);
    const animals = captured.filter(c => c.type === CARD_TYPES.ANIMAL);
    const ribbons = captured.filter(c => c.type === CARD_TYPES.RIBBON);
    
    // Bright combinations
    if (brights.length >= 5) yaku.push({ name: 'Five Brights', points: 10 });
    else if (brights.length >= 4) yaku.push({ name: 'Four Brights', points: 8 });
    else if (brights.length >= 3) yaku.push({ name: 'Three Brights', points: 5 });
    
    // Animal combinations
    if (animals.length >= 3) yaku.push({ name: 'Boar, Deer, Butterflies', points: 5 });
    
    // Ribbon combinations
    if (ribbons.length >= 3) yaku.push({ name: 'Red Ribbons', points: 5 });
    
    return yaku;
}

// Show yaku options
function showYakuOptions(yaku) {
    const totalPoints = yaku.reduce((sum, y) => sum + y.points, 0);
    updateStatus(`You got ${yaku.map(y => y.name).join(', ')}! Total: ${totalPoints} points. Continue (Koi-Koi) or Stop?`);
    
    document.getElementById('koi-btn').style.display = 'inline-block';
    document.getElementById('stop-btn').style.display = 'inline-block';
    document.getElementById('play-btn').disabled = true;
}

// Koi-Koi (continue)
function koiKoi() {
    const yaku = checkYaku(gameState.playerCaptured);
    const points = yaku.reduce((sum, y) => sum + y.points, 0);
    
    gameState.playerScore += points;
    
    document.getElementById('koi-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'none';
    document.getElementById('play-btn').disabled = false;
    
    updateDisplay();
    updateStatus('Koi-Koi! Game continues. Your turn!');
}

// Stop game
function stopGame() {
    const playerYaku = checkYaku(gameState.playerCaptured);
    const aiYaku = checkYaku(gameState.aiCaptured);
    
    const playerPoints = playerYaku.reduce((sum, y) => sum + y.points, 0);
    const aiPoints = aiYaku.reduce((sum, y) => sum + y.points, 0);
    
    gameState.playerScore += playerPoints;
    gameState.aiScore += aiPoints;
    
    endRound();
}

// End round
function endRound() {
    gameState.gameActive = false;
    
    const playerYaku = checkYaku(gameState.playerCaptured);
    const aiYaku = checkYaku(gameState.aiCaptured);
    
    const playerPoints = playerYaku.reduce((sum, y) => sum + y.points, 0);
    const aiPoints = aiYaku.reduce((sum, y) => sum + y.points, 0);
    
    gameState.playerScore += playerPoints;
    gameState.aiScore += aiPoints;
    
    updateDisplay();
    
    let message = `Round ${gameState.round} ended! `;
    message += `You: ${playerPoints} points, AI: ${aiPoints} points. `;
    message += `Total - You: ${gameState.playerScore}, AI: ${gameState.aiScore}`;
    
    if (gameState.playerScore >= 50 || gameState.aiScore >= 50) {
        const winner = gameState.playerScore >= 50 ? 'You' : 'AI';
        message = `🎉 ${winner} wins the game! Final scores - You: ${gameState.playerScore}, AI: ${gameState.aiScore}`;
    }
    
    updateStatus(message);
    
    document.getElementById('play-btn').disabled = true;
    document.getElementById('koi-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'none';
}

// Update display
function updateDisplay() {
    // Update player hand
    const playerHandEl = document.getElementById('hand-human');
    playerHandEl.innerHTML = '';
    gameState.playerHand.forEach(card => {
        const cardEl = createCardElement(card, true);
        if (gameState.selectedCard && gameState.selectedCard.id === card.id) {
            cardEl.classList.add('selected');
        }
        playerHandEl.appendChild(cardEl);
    });
    
    // Update AI hand (show backs)
    const aiHandEl = document.getElementById('hand-ai');
    aiHandEl.innerHTML = '';
    gameState.aiHand.forEach(() => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card back';
        aiHandEl.appendChild(cardEl);
    });
    
    // Update field
    const fieldEl = document.getElementById('field-cards');
    fieldEl.innerHTML = '';
    gameState.field.forEach(card => {
        fieldEl.appendChild(createCardElement(card, false));
    });
    
    // Update scores
    document.getElementById('score-player').textContent = gameState.playerScore;
    document.getElementById('score-ai').textContent = gameState.aiScore;
    
    // Update yaku lists
    const playerYaku = checkYaku(gameState.playerCaptured);
    const aiYaku = checkYaku(gameState.aiCaptured);
    
    const playerYakuEl = document.getElementById('yaku-human');
    playerYakuEl.innerHTML = playerYaku.length > 0 
        ? `<strong>Your Yaku:</strong> ${playerYaku.map(y => `${y.name} (${y.points})`).join(', ')}`
        : '';
    
    const aiYakuEl = document.getElementById('yaku-ai');
    aiYakuEl.innerHTML = aiYaku.length > 0
        ? `<strong>AI Yaku:</strong> ${aiYaku.map(y => `${y.name} (${y.points})`).join(', ')}`
        : '';
    
    // Update active player
    document.getElementById('player-human').classList.toggle('active', gameState.currentPlayer === 'player');
    document.getElementById('player-ai').classList.toggle('active', gameState.currentPlayer === 'ai');
}

// Create card element
function createCardElement(card, clickable) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if (clickable) {
        cardEl.onclick = () => selectCard(card.id);
    }
    
    cardEl.innerHTML = `
        <div class="card-month">${card.monthNum}月</div>
        <div class="card-symbol">${card.symbol}</div>
        <div class="card-type">${card.type}</div>
    `;
    
    return cardEl;
}

// Update status
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
