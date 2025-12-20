// Tarock Game Implementation (Austrian Card Game)
// **Timestamp**: 2025-12-19

let deck = [];
let playerHand = [];
let aiHand = [];
let talon = [];
let skat = []; // Discarded cards
let playedCards = [];
let playerScore = 0;
let aiScore = 0;
let currentPlayer = 'player';
let gamePhase = 'bidding'; // bidding, playing, finished
let talonClosed = false;
let playerBid = 0;
let aiBid = 0;
let tricksWon = {player: 0, ai: 0};
let gameActive = false;

// Tarock deck: 22 tarock cards (I-XXII) + 4 suits × 8 cards (A,10,K,Q,J,9,8,7)
const TAROCK_CARDS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
                      'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII'];
const SUITS = ['♠', '♥', '♦', '♣'];
const SUIT_CARDS = ['A', '10', 'K', 'Q', 'J', '9', '8', '7'];

// Card values for scoring
const CARD_VALUES = {
    'I': 5, 'XXI': 5, 'XXII': 5, 'J': 2, '9': 1, '8': 1, '7': 1, 'A': 1, '10': 1, 'K': 1, 'Q': 1, 'XX': 1, 'XIX': 1, 'XVIII': 1
};

function createDeck() {
    const deck = [];

    // Add tarock cards
    TAROCK_CARDS.forEach(card => {
        deck.push({type: 'tarock', value: card, points: CARD_VALUES[card] || 0});
    });

    // Add suit cards
    SUITS.forEach(suit => {
        SUIT_CARDS.forEach(card => {
            deck.push({type: 'suit', suit: suit, value: card, points: CARD_VALUES[card] || 0});
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

    playerHand = deck.splice(0, 12);
    aiHand = deck.splice(0, 12);
    talon = deck.splice(0, 6); // Talon has 6 cards
    skat = deck.splice(0, 2); // Skat has 2 cards
}

function newGame() {
    dealCards();
    playerScore = 0;
    aiScore = 0;
    tricksWon = {player: 0, ai: 0};
    gamePhase = 'bidding';
    talonClosed = false;
    playerBid = 0;
    aiBid = 0;
    playedCards = [];
    currentPlayer = 'player';
    gameActive = true;

    renderAll();
    updateStatus('Bidding phase: Choose your bid!');

    document.getElementById('biddingArea').style.display = 'block';
    document.getElementById('talonBtn').disabled = true;
    document.getElementById('closeTalonBtn').disabled = true;
}

function makeBid(bid) {
    playerBid = bid;
    aiBid = Math.floor(Math.random() * 4); // AI makes random bid

    document.getElementById('biddingArea').style.display = 'none';

    if (bid > aiBid) {
        updateStatus(`You won the bid with ${bid} games! You lead.`);
        currentPlayer = 'player';
    } else if (aiBid > bid) {
        updateStatus(`AI won the bid with ${aiBid} games! AI leads.`);
        currentPlayer = 'ai';
        setTimeout(() => aiPlay(), 1000);
    } else {
        updateStatus('Both passed. Redealing...');
        setTimeout(() => newGame(), 2000);
        return;
    }

    gamePhase = 'playing';
    document.getElementById('talonBtn').disabled = false;
    document.getElementById('closeTalonBtn').disabled = false;
}

function drawFromTalon() {
    if (talon.length === 0) {
        updateStatus('Talon is empty!');
        return;
    }

    const card = talon.pop();
    playerHand.push(card);

    updateStatus(`Drew ${getCardDisplay(card)} from talon.`);
    renderAll();

    // AI also draws if talon has cards
    if (talon.length > 0) {
        const aiCard = talon.pop();
        aiHand.push(aiCard);
        updateStatus(`AI also drew a card.`);
        renderAll();
    }
}

function closeTalon() {
    talonClosed = true;
    updateStatus('Talon closed! No more drawing allowed.');
    document.getElementById('talonBtn').disabled = true;
    document.getElementById('closeTalonBtn').disabled = true;
    renderAll();
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

    // Tarock cards beat everything, suit cards follow suit rules
    if (card1.type === 'tarock' && card2.type === 'tarock') {
        winner = card1.value > card2.value ? playedCards[0].player : playedCards[1].player;
    } else if (card1.type === 'tarock') {
        winner = playedCards[0].player;
    } else if (card2.type === 'tarock') {
        winner = playedCards[1].player;
    } else {
        // Both suit cards - check if they follow suit
        // For simplicity, higher value wins (in real Tarock this is more complex)
        const val1 = SUIT_CARDS.indexOf(card1.value);
        const val2 = SUIT_CARDS.indexOf(card2.value);
        winner = val1 > val2 ? playedCards[0].player : playedCards[1].player;
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

function aiPlay() {
    if (aiHand.length === 0) return;

    // Simple AI: play random card
    const cardIndex = Math.floor(Math.random() * aiHand.length);
    playCard(cardIndex, 'ai');
}

function endGame() {
    gamePhase = 'finished';
    gameActive = false;

    // Simple scoring: winner gets points based on tricks
    const playerPoints = tricksWon.player * 10;
    const aiPoints = tricksWon.ai * 10;

    playerScore += playerPoints;
    aiScore += aiPoints;

    let message = `Game Over! You won ${tricksWon.player} tricks, AI won ${tricksWon.ai} tricks. `;
    message += tricksWon.player > tricksWon.ai ? 'You win!' : 'AI wins!';

    updateStatus(message);
    renderAll();
}

function getCardDisplay(card) {
    if (card.type === 'tarock') {
        return card.value;
    } else {
        return `${card.value}${card.suit}`;
    }
}

function renderAll() {
    renderPlayerHand();
    renderAIHand();
    renderPlayedCards();
    renderTalon();
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
        cardElement.className = 'tarock-card';
        cardElement.innerHTML = '🂠';
        cardElement.style.background = '#8B4513';
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

function renderTalon() {
    const talonElement = document.getElementById('talonStack');
    talonElement.innerHTML = `🃏<br>${talon.length}`;
    talonElement.style.opacity = talonClosed ? '0.5' : '1';
}

function createCardElement(card, index = -1, player = null) {
    const cardElement = document.createElement('div');
    cardElement.className = `tarock-card ${card.type === 'tarock' ? 'tarock' : ''}`;

    if (card.type === 'tarock') {
        cardElement.innerHTML = `<div class="card-value">${card.value}</div>`;
    } else {
        const color = (card.suit === '♥' || card.suit === '♦') ? '#FF0000' : '#000000';
        cardElement.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-suit" style="color: ${color}">${card.suit}</div>
        `;
    }

    if (player === 'player' && gamePhase === 'playing' && currentPlayer === 'player') {
        cardElement.onclick = () => playCard(index, 'player');
        cardElement.style.cursor = 'pointer';
    }

    return cardElement;
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
}

function updateStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

// Initialize theme switcher
document.addEventListener('DOMContentLoaded', function() {
    initializeThemeSwitcher();
});
