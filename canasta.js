// Canasta Game Logic
// **Timestamp**: 2025-12-10

let deck = [];
let playerHand = [];
let discardPile = [];
let selectedCards = [];
let canastas = []; // Array of melds (each meld is array of cards)
let score = 0;
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
    // Create deck (2 standard decks + 4 jokers = 108 cards)
    deck = [];
    
    // Add 2 standard decks
    for (let i = 0; i < 2; i++) {
        SUITS.forEach(suit => {
            RANKS.forEach(rank => {
                deck.push({ suit, rank, isJoker: false });
            });
        });
    }
    
    // Add 4 jokers
    for (let i = 0; i < 4; i++) {
        deck.push({ suit: null, rank: 'Joker', isJoker: true });
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal 11 cards to player
    playerHand = deck.splice(0, 11);
    sortHand(playerHand);
    
    // Start discard pile
    discardPile = [deck.pop()];
    
    selectedCards = [];
    canastas = [];
    score = 0;
    gameActive = true;
    
    updateDisplay();
    updateStatus();
}

function sortHand(hand) {
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'Joker'];
    const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
    
    hand.sort((a, b) => {
        if (a.isJoker) return 1;
        if (b.isJoker) return -1;
        if (a.rank !== b.rank) {
            return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        }
        return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
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
    const index = selectedCards.findIndex(c => 
        c.suit === card.suit && c.rank === card.rank && c.isJoker === card.isJoker
    );
    if (index > -1) {
        selectedCards.splice(index, 1);
    } else {
        selectedCards.push(card);
    }
    updateDisplay();
    checkCanMeld();
}

function checkCanMeld() {
    if (selectedCards.length < 3) {
        document.getElementById('meldBtn').disabled = true;
        return;
    }
    
    // Check if selected cards form a valid meld (same rank, 3+ cards)
    const ranks = selectedCards.map(c => c.rank);
    const jokers = selectedCards.filter(c => c.isJoker);
    const nonJokers = selectedCards.filter(c => !c.isJoker);
    
    // All non-jokers must be same rank
    if (nonJokers.length > 0) {
        const firstRank = nonJokers[0].rank;
        if (!nonJokers.every(c => c.rank === firstRank)) {
            document.getElementById('meldBtn').disabled = true;
            return;
        }
    }
    
    // Canasta requires 7 cards of same rank
    // Regular meld requires 3+ cards
    document.getElementById('meldBtn').disabled = false;
}

function meldCards() {
    if (selectedCards.length < 3) return;
    
    // Validate meld
    const nonJokers = selectedCards.filter(c => !c.isJoker);
    if (nonJokers.length > 0) {
        const firstRank = nonJokers[0].rank;
        if (!nonJokers.every(c => c.rank === firstRank)) {
            alert('All cards in a meld must be the same rank!');
            return;
        }
    }
    
    // Remove cards from hand
    selectedCards.forEach(card => {
        const index = playerHand.findIndex(c => 
            c.suit === card.suit && c.rank === card.rank && c.isJoker === card.isJoker
        );
        if (index > -1) playerHand.splice(index, 1);
    });
    
    // Add to canastas
    canastas.push([...selectedCards]);
    
    // Calculate score
    const meldSize = selectedCards.length;
    if (meldSize >= 7) {
        score += 500; // Canasta bonus
    } else if (meldSize >= 3) {
        score += meldSize * 20; // Regular meld
    }
    
    selectedCards = [];
    
    updateDisplay();
    checkCanMeld();
    
    // Check for win (go out by playing all cards)
    if (playerHand.length === 0) {
        gameActive = false;
        score += 100; // Going out bonus
        document.getElementById('status').textContent = '🎉 You Win! 🎉';
    }
}

function discardSelected() {
    if (selectedCards.length !== 1) {
        alert('Select exactly one card to discard!');
        return;
    }
    
    const card = selectedCards[0];
    const index = playerHand.findIndex(c => 
        c.suit === card.suit && c.rank === card.rank && c.isJoker === card.isJoker
    );
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
        if (card.isJoker) {
            cardEl.className = 'card joker';
        } else {
            cardEl.className = `card ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`;
        }
        
        if (selectedCards.some(c => 
            c.suit === card.suit && c.rank === card.rank && c.isJoker === card.isJoker
        )) {
            cardEl.classList.add('selected');
        }
        
        if (card.isJoker) {
            cardEl.innerHTML = `<div class="card-rank">🃏</div>`;
        } else {
            cardEl.innerHTML = `
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
            `;
        }
        
        cardEl.onclick = () => toggleCardSelection(card);
        handContainer.appendChild(cardEl);
    });
    
    // Render discard pile
    const discardEl = document.getElementById('discardPile');
    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        if (topCard.isJoker) {
            discardEl.innerHTML = `
                <div class="card joker">
                    <div class="card-rank">🃏</div>
                </div>
            `;
        } else {
            discardEl.innerHTML = `
                <div class="card ${topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black'}">
                    <div class="card-rank">${topCard.rank}</div>
                    <div class="card-suit">${SUIT_SYMBOLS[topCard.suit]}</div>
                </div>
            `;
        }
    }
    
    // Render canastas
    const canastasContainer = document.getElementById('canastasContainer');
    canastasContainer.innerHTML = '';
    
    canastas.forEach((canasta, index) => {
        const canastaEl = document.createElement('div');
        canastaEl.className = 'canasta';
        
        const rank = canasta.find(c => !c.isJoker)?.rank || 'Joker';
        const isFullCanasta = canasta.length >= 7;
        const title = isFullCanasta ? `Canasta (${rank}) - 7+ cards` : `Meld (${rank}) - ${canasta.length} cards`;
        
        canastaEl.innerHTML = `<div class="canasta-title">${title}:</div>`;
        
        canasta.forEach(card => {
            const cardEl = document.createElement('div');
            if (card.isJoker) {
                cardEl.className = 'card joker';
                cardEl.innerHTML = `<div class="card-rank">🃏</div>`;
            } else {
                cardEl.className = `card ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black'}`;
                cardEl.innerHTML = `
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-suit">${SUIT_SYMBOLS[card.suit]}</div>
                `;
            }
            canastaEl.appendChild(cardEl);
        });
        
        canastasContainer.appendChild(canastaEl);
    });
    
    // Update score
    document.getElementById('score').textContent = score;
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

