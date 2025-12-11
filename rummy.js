// Rummy Game Logic
// **Timestamp**: 2025-12-10

let deck = [];
let playerHand = [];
let discardPile = [];
let selectedCards = [];
let melds = [];
let gameActive = false;

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_SYMBOLS = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠'
};

function initGame() {
    // Create deck
    deck = [];
    SUITS.forEach(suit => {
        RANKS.forEach(rank => {
            deck.push({ suit, rank });
        });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal 7 cards to player
    playerHand = deck.splice(0, 7);
    sortHand(playerHand);
    
    // Start discard pile
    discardPile = [deck.pop()];
    
    selectedCards = [];
    melds = [];
    gameActive = true;
    
    updateDisplay();
    updateStatus();
}

function sortHand(hand) {
    const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    hand.sort((a, b) => {
        if (a.suit !== b.suit) {
            return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        }
        return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
}

function drawCard() {
    if (!gameActive || deck.length === 0) return;
    
    playerHand.push(deck.pop());
    sortHand(playerHand);
    updateDisplay();
    document.getElementById('drawBtn').disabled = true;
    document.getElementById('discardBtn').disabled = false;
}

function drawFromDiscard() {
    if (!gameActive || discardPile.length === 0) return;
    
    playerHand.push(discardPile.pop());
    sortHand(playerHand);
    updateDisplay();
    document.getElementById('drawBtn').disabled = true;
    document.getElementById('discardBtn').disabled = false;
}

function toggleCardSelection(card) {
    const index = selectedCards.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (index > -1) {
        selectedCards.splice(index, 1);
    } else {
        selectedCards.push(card);
    }
    updateDisplay();
    checkCanLayDown();
}

function checkCanLayDown() {
    if (selectedCards.length < 3) {
        document.getElementById('layDownBtn').disabled = true;
        return;
    }
    
    // Check if selected cards form a valid meld
    const isValid = isValidMeld(selectedCards);
    document.getElementById('layDownBtn').disabled = !isValid;
}

function isValidMeld(cards) {
    if (cards.length < 3) return false;
    
    // Check for set (same rank, different suits)
    const ranks = cards.map(c => c.rank);
    const suits = cards.map(c => c.suit);
    
    if (ranks.every(r => r === ranks[0]) && new Set(suits).size === suits.length) {
        return true; // Set
    }
    
    // Check for run (same suit, consecutive ranks)
    if (suits.every(s => s === suits[0])) {
        const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const sortedRanks = ranks.sort((a, b) => rankOrder.indexOf(a) - rankOrder.indexOf(b));
        
        for (let i = 1; i < sortedRanks.length; i++) {
            const prevIndex = rankOrder.indexOf(sortedRanks[i - 1]);
            const currIndex = rankOrder.indexOf(sortedRanks[i]);
            if (currIndex !== prevIndex + 1) {
                return false;
            }
        }
        return true; // Run
    }
    
    return false;
}

function layDownMelds() {
    if (!isValidMeld(selectedCards)) return;
    
    // Remove cards from hand
    selectedCards.forEach(card => {
        const index = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
        if (index > -1) playerHand.splice(index, 1);
    });
    
    // Add to melds
    melds.push([...selectedCards]);
    selectedCards = [];
    
    updateDisplay();
    checkCanLayDown();
    
    // Check for win
    if (playerHand.length === 0) {
        gameActive = false;
        document.getElementById('status').textContent = '🎉 You Win! 🎉';
    }
}

function discardSelected() {
    if (selectedCards.length !== 1) {
        alert('Select exactly one card to discard!');
        return;
    }
    
    const card = selectedCards[0];
    const index = playerHand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (index > -1) {
        playerHand.splice(index, 1);
        discardPile.push(card);
        selectedCards = [];
        
        updateDisplay();
        document.getElementById('drawBtn').disabled = false;
        document.getElementById('discardBtn').disabled = true;
        
        updateStatus();
    }
}

function updateDisplay() {
    // Render hand
    const handContainer = document.getElementById('handContainer');
    handContainer.innerHTML = '';
    
    playerHand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = `card ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`;
        
        if (selectedCards.some(c => c.suit === card.suit && c.rank === card.rank)) {
            cardEl.classList.add('selected');
        }
        
        cardEl.innerHTML = `
            <div class="card-rank">${card.rank}</div>
            <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
        `;
        
        cardEl.onclick = () => toggleCardSelection(card);
        handContainer.appendChild(cardEl);
    });
    
    // Render discard pile
    const discardEl = document.getElementById('discardPile');
    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        discardEl.innerHTML = `
            <div class="card ${topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black'}">
                <div class="card-rank">${topCard.rank}</div>
                <div class="card-suit">${SUIT_SYMBOLS[topCard.suit]}</div>
            </div>
        `;
    }
    
    // Render melds
    const meldsContainer = document.getElementById('meldsContainer');
    meldsContainer.innerHTML = '';
    
    melds.forEach((meld, index) => {
        const meldEl = document.createElement('div');
        meldEl.className = 'meld';
        
        const isSet = meld.every(c => c.rank === meld[0].rank);
        const title = isSet ? `Set (${meld[0].rank})` : `Run (${meld[0].suit})`;
        
        meldEl.innerHTML = `<div class="meld-title">${title}:</div>`;
        
        meld.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = `card ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`;
            cardEl.innerHTML = `
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
            `;
            meldEl.appendChild(cardEl);
        });
        
        meldsContainer.appendChild(meldEl);
    });
}

function updateStatus() {
    if (!gameActive) return;
    document.getElementById('status').textContent = `Your Turn - Cards: ${playerHand.length} | Deck: ${deck.length}`;
}

function newGame() {
    initGame();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});

