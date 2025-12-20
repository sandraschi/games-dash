// Skat Game Implementation (German Card Game)
// **Timestamp**: 2025-12-19

let deck = [];
let playerHand = [];
let aiHand = [];
let skat = [];
let playedCards = [];
let playerScore = 0;
let aiScore = 0;
let currentPlayer = 'player';
let gamePhase = 'dealing'; // dealing, skat, bidding, discarding, declaring, playing, finished
let trumpSuit = null;
let selectedCards = [];
let playerBid = 0;
let aiBid = 0;
let tricksWon = {player: 0, ai: 0};
let gameActive = false;

// Skat uses a 32-card deck (7-A in each suit)
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const CARD_POINTS = {'7': 0, '8': 0, '9': 0, '10': 10, 'J': 2, 'Q': 3, 'K': 4, 'A': 11};

function createDeck() {
    const deck = [];
    SUITS.forEach(suit => {
        VALUES.forEach(value => {
            deck.push({suit, value, points: CARD_POINTS[value]});
        });
    });
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealCards() {
    deck = createDeck();
    shuffle(deck);

    playerHand = deck.splice(0, 10);
    aiHand = deck.splice(0, 10);
    skat = deck.splice(0, 2); // Skat has 2 cards
}

function newGame() {
    dealCards();
    playerScore = 0;
    aiScore = 0;
    tricksWon = {player: 0, ai: 0};
    gamePhase = 'skat';
    trumpSuit = null;
    selectedCards = [];
    playedCards = [];
    currentPlayer = 'player';
    gameActive = true;

    renderAll();
    updateStatus('Pick up the Skat (2 cards) to improve your hand!');

    document.getElementById('declareBtn').disabled = true;
    document.getElementById('discardBtn').disabled = true;
}

function pickUpSkat() {
    if (gamePhase !== 'skat' || skat.length === 0) return;

    // Add skat cards to player's hand
    playerHand.push(...skat);
    skat = [];

    // AI also picks up skat (simplified)
    aiHand.push({suit: '♠', value: 'A', points: 11}); // Give AI a good card
    aiHand.push({suit: '♥', value: '10', points: 10});

    gamePhase = 'bidding';
    renderAll();
    updateStatus('Bidding phase: Choose your game value!');

    document.getElementById('biddingArea').style.display = 'block';
}

function makeBid(bid) {
    playerBid = bid;
    aiBid = Math.floor(Math.random() * 36) + 18; // AI makes random bid

    document.getElementById('biddingArea').style.display = 'none';

    if (bid >= aiBid) {
        updateStatus(`You won the bid with ${bid}! Now discard 2 cards to the skat.`);
        gamePhase = 'discarding';
        document.getElementById('discardBtn').disabled = false;
    } else {
        updateStatus(`AI won the bid with ${aiBid}! AI's turn.`);
        // AI would normally discard, but for simplicity we'll skip to declaring
        gamePhase = 'declaring';
        setTimeout(() => aiDeclareTrump(), 2000);
    }
}

function selectCardForDiscard(index) {
    if (gamePhase !== 'discarding' || selectedCards.length >= 2) return;

    const cardElement = document.querySelectorAll('#playerHand .skat-card')[index];
    if (selectedCards.includes(index)) {
        // Deselect
        selectedCards = selectedCards.filter(i => i !== index);
        cardElement.style.borderColor = '#000000';
    } else {
        // Select
        selectedCards.push(index);
        cardElement.style.borderColor = '#FF0000';
    }

    updateStatus(`Selected ${selectedCards.length}/2 cards to discard.`);
}

function discardToSkat() {
    if (selectedCards.length !== 2) {
        updateStatus('Please select exactly 2 cards to discard!');
        return;
    }

    // Sort in descending order to avoid index issues
    selectedCards.sort((a, b) => b - a);

    // Move selected cards to skat
    skat = selectedCards.map(index => playerHand.splice(index, 1)[0]);

    selectedCards = [];
    gamePhase = 'declaring';
    renderAll();
    updateStatus('Now declare your trump suit!');

    document.getElementById('declareBtn').disabled = false;
    document.getElementById('discardBtn').disabled = true;
}

function declareGame() {
    if (gamePhase !== 'declaring') return;

    // Create suit selection dialog
    const suitButtons = SUITS.map(suit => `<button class="bid-btn" onclick="setTrumpSuit('${suit}')">${suit}</button>`).join('');

    document.getElementById('statusMessage').innerHTML = `
        <div>Choose your trump suit:</div>
        <div style="margin-top: 10px;">${suitButtons}</div>
    `;
}

function setTrumpSuit(suit) {
    trumpSuit = suit;
    gamePhase = 'playing';
    currentPlayer = 'player';

    renderAll();
    updateStatus(`Trump suit is ${trumpSuit}! You lead the first trick.`);

    document.getElementById('declareBtn').disabled = true;
}

function aiDeclareTrump() {
    // AI randomly chooses trump suit
    trumpSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    gamePhase = 'playing';
    currentPlayer = 'ai';

    updateStatus(`AI declared ${trumpSuit} as trump! AI leads.`);
    renderAll();

    setTimeout(() => aiPlay(), 1500);
}

function playCard(cardIndex, player) {
    if (currentPlayer !== player || gamePhase !== 'playing') return;

    const hand = player === 'player' ? playerHand : aiHand;
    const card = hand.splice(cardIndex, 1)[0];
    playedCards.push({card, player});

    updateStatus(`${player === 'player' ? 'You' : 'AI'} played ${getCardDisplay(card)}`);

    renderAll();

    if (playedCards.length === 2) {
        // Determine winner of trick
        setTimeout(() => resolveTrick(), 1000);
    } else {
        // Switch to other player
        currentPlayer = player === 'player' ? 'ai' : 'player';
        if (currentPlayer === 'ai') {
            setTimeout(() => aiPlay(), 1500);
        }
    }
}

function resolveTrick() {
    const card1 = playedCards[0].card;
    const card2 = playedCards[1].card;

    let winner = 'player'; // Default winner

    // Check if either card is trump
    const card1IsTrump = card1.suit === trumpSuit;
    const card2IsTrump = card2.suit === trumpSuit;

    if (card1IsTrump && !card2IsTrump) {
        winner = playedCards[0].player;
    } else if (!card1IsTrump && card2IsTrump) {
        winner = playedCards[1].player;
    } else if (card1IsTrump && card2IsTrump) {
        // Both trump - compare values
        winner = compareCards(card1, card2, playedCards[0].player, playedCards[1].player);
    } else {
        // Both same suit or different suits - compare values
        if (card1.suit === card2.suit) {
            winner = compareCards(card1, card2, playedCards[0].player, playedCards[1].player);
        } else {
            // Different suits, first player wins (follow suit not enforced in this simple version)
            winner = playedCards[0].player;
        }
    }

    tricksWon[winner]++;
    currentPlayer = winner;

    updateStatus(`${winner === 'player' ? 'You' : 'AI'} won the trick!`);

    playedCards = [];

    if (playerHand.length === 0 && aiHand.length === 0) {
        endGame();
    } else {
        renderAll();
        if (currentPlayer === 'ai') {
            setTimeout(() => aiPlay(), 1500);
        }
    }
}

function compareCards(card1, card2, player1, player2) {
    const val1 = VALUES.indexOf(card1.value);
    const val2 = VALUES.indexOf(card2.value);
    return val1 > val2 ? player1 : player2;
}

function aiPlay() {
    if (aiHand.length === 0) return;

    // Simple AI: play random card
    const cardIndex = Math.floor(Math.random() * aiHand.length);
    playCard(cardIndex, 'ai');
}

function endGame() {
    gamePhase = 'finished';
    gameActive = false;

    // Calculate scores based on tricks won and card points
    const playerTrickPoints = tricksWon.player * 10;
    const aiTrickPoints = tricksWon.ai * 10;

    // Add card points from won tricks (simplified)
    const playerCardPoints = playerHand.reduce((sum, card) => sum + card.points, 0);
    const aiCardPoints = aiHand.reduce((sum, card) => sum + card.points, 0);

    const playerTotal = playerTrickPoints + playerCardPoints;
    const aiTotal = aiTrickPoints + aiCardPoints;

    playerScore += playerTotal;
    aiScore += aiTotal;

    let message = `Game Over! You won ${tricksWon.player} tricks, AI won ${tricksWon.ai} tricks. `;
    message += playerTotal > aiTotal ? 'You win!' : 'AI wins!';

    updateStatus(message);
    renderAll();
}

function getCardDisplay(card) {
    return `${card.value}${card.suit}`;
}

function renderAll() {
    renderPlayerHand();
    renderAIHand();
    renderPlayedCards();
    renderSkat();
    updateScores();
}

function renderPlayerHand() {
    const handElement = document.getElementById('playerHand');
    handElement.innerHTML = '';

    playerHand.forEach((card, index) => {
        const cardElement = createCardElement(card, index, 'player');
        handElement.appendChild(cardElement);
    });
}

function renderAIHand() {
    const handElement = document.getElementById('aiHand');
    handElement.innerHTML = '';

    // Show AI cards as face down
    aiHand.forEach(() => {
        const cardElement = document.createElement('div');
        cardElement.className = 'skat-card';
        cardElement.innerHTML = '🂠';
        cardElement.style.background = '#2E2E2E';
        cardElement.style.color = '#FFD700';
        handElement.appendChild(cardElement);
    });
}

function renderPlayedCards() {
    const playArea = document.getElementById('playedCards');
    playArea.innerHTML = '';

    playedCards.forEach(played => {
        const cardElement = createCardElement(played.card);
        cardElement.style.opacity = '0.8';
        playArea.appendChild(cardElement);
    });
}

function renderSkat() {
    const skatElement = document.getElementById('skatStack');
    if (skat.length > 0) {
        skatElement.innerHTML = `🃏<br>${skat.length}`;
        skatElement.style.cursor = gamePhase === 'skat' ? 'pointer' : 'default';
    } else {
        skatElement.innerHTML = '🃏<br>Empty';
        skatElement.style.cursor = 'default';
    }
}

function createCardElement(card, index = -1, player = null) {
    const cardElement = document.createElement('div');
    cardElement.className = 'skat-card';

    const color = (card.suit === '♥' || card.suit === '♦') ? '#FF0000' : '#000000';
    cardElement.innerHTML = `
        <div class="card-value">${card.value}</div>
        <div class="card-suit" style="color: ${color}">${card.suit}</div>
    `;

    if (card.suit === trumpSuit) {
        cardElement.innerHTML += '<div class="trump-indicator">♔</div>';
    }

    if (player === 'player' && gamePhase === 'playing' && currentPlayer === 'player') {
        cardElement.onclick = () => playCard(index, 'player');
        cardElement.style.cursor = 'pointer';
    } else if (player === 'player' && gamePhase === 'discarding') {
        cardElement.onclick = () => selectCardForDiscard(index);
        cardElement.style.cursor = 'pointer';
    }

    return cardElement;
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
}

function updateStatus(message) {
    document.getElementById('statusMessage').innerHTML = message;
}

// Initialize theme switcher
document.addEventListener('DOMContentLoaded', function() {
    initializeThemeSwitcher();
});
