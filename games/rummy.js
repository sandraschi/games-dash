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

// SVG Suit symbols
function getSuitSVG(suit, color, size = 24) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';

    switch(suit) {
        case 'hearts':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${fill}"/>
            </svg>`;
        case 'diamonds':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 2L2 12l10 10 10-10L12 2z" fill="${fill}"/>
            </svg>`;
        case 'clubs':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <circle cx="12" cy="8" r="4" fill="${fill}"/>
                <circle cx="7" cy="12" r="3" fill="${fill}"/>
                <circle cx="17" cy="12" r="3" fill="${fill}"/>
                <path d="M10 12 L14 12 L12 20 Z" fill="${fill}"/>
            </svg>`;
        case 'spades':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.13-1.5 3.94-3.5 4.58V16h-3v-2.42C8.5 12.94 7 11.13 7 9c0-2.76 2.24-5 5-5zm-1 15h2v3h-2v-3z" fill="${fill}"/>
            </svg>`;
        default:
            return '';
    }
}

// SVG Face card illustrations
function getFaceCardSVG(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 20);

    let faceSVG = '';
    switch(rank) {
        case 'K':
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <path d="M10 20 L12 12 L17 17 L20 8 L23 17 L28 12 L30 20 L30 25 L10 25 Z" fill="${fill}"/>
                <circle cx="12" cy="15" r="1.5" fill="${fill}"/>
                <circle cx="20" cy="11" r="1.5" fill="${fill}"/>
                <circle cx="28" cy="15" r="1.5" fill="${fill}"/>
                <path d="M17 28 L17 48 M17 38 L27 28 M17 38 L27 48" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
        case 'Q':
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <path d="M10 20 L12 12 L17 17 L20 8 L23 17 L28 12 L30 20 L30 25 L10 25 Z" fill="${fill}" stroke="${fill}" stroke-width="1"/>
                <circle cx="12" cy="15" r="1.5" fill="${fill}"/>
                <circle cx="20" cy="11" r="1.8" fill="${fill}"/>
                <circle cx="28" cy="15" r="1.5" fill="${fill}"/>
                <circle cx="20" cy="35" r="5" stroke="${fill}" stroke-width="3" fill="none"/>
                <path d="M23 38 L26 42" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
        case 'J':
            // Simple J letter
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <path d="M23 26 L23 48 M19 48 Q23 51 26 48" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
        case 'A':
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <path d="M12 50 L20 25 L28 50 M16 40 L24 40" stroke="${fill}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
    }
    return faceSVG;
}

// Get proper pip pattern for number cards (2-10)
function getPipPattern(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 18);

    // Card dimensions and margins
    const cardWidth = 50;
    const cardHeight = 70;
    const margin = 6;
    const pipSize = 14;

    // Calculate usable area
    const usableWidth = cardWidth - 2 * margin;
    const usableHeight = cardHeight - 2 * margin;

    // Center coordinates
    const centerX = cardWidth / 2;
    const centerY = cardHeight / 2;

    // Corner positions for symmetric layouts
    const leftX = margin + pipSize / 2;
    const rightX = cardWidth - margin - pipSize / 2;
    const topY = margin + pipSize / 2;
    const bottomY = cardHeight - margin - pipSize / 2;

    let pattern = '';

    switch(rank) {
        case '2':
            pattern = `
                <g transform="translate(${centerX}, ${centerY - 8})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 8})">${suitSVG}</g>
            `;
            break;
        case '3':
            pattern = `
                <g transform="translate(${centerX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 12})">${suitSVG}</g>
            `;
            break;
        case '4':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '5':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '6':
            pattern = `
                <g transform="translate(${leftX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 12})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 12})">${suitSVG}</g>
            `;
            break;
        case '7':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 5})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 5})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 5})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '8':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 8})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 8})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '9':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 10})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 10})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 2})">${suitSVG}</g>
            `;
            break;
        case '10':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY - 4})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY - 4})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 4})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 12})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
    }

    return `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" style="display: block;">
        ${pattern}
    </svg>`;
}

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
        
        const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
        const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
        const rankDisplay = card.rank;
        const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);

        cardEl.innerHTML = `
            <div class="card-corner card-corner-top">
                <div class="card-rank-top">${rankDisplay}</div>
                <div class="card-suit-top">${getSuitSVG(card.suit, color, 12)}</div>
            </div>
            <div class="card-center">
                ${isFaceCard ?
                    `<div class="card-face">${getFaceCardSVG(card.rank, card.suit, color)}</div>` :
                    `<div class="card-pips">${getPipPattern(card.rank, card.suit, color)}</div>`
                }
            </div>
            <div class="card-corner card-corner-bottom">
                <div class="card-rank-bottom">${rankDisplay}</div>
                <div class="card-suit-bottom">${getSuitSVG(card.suit, color, 16)}</div>
            </div>
        `;
        
        cardEl.onclick = () => toggleCardSelection(card);
        handContainer.appendChild(cardEl);
    });
    
    // Render discard pile
    const discardEl = document.getElementById('discardPile');
    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        const color = topCard.suit === 'hearts' || topCard.suit === 'diamonds' ? 'red' : 'black';
        const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
        const rankDisplay = topCard.rank;
        const isFaceCard = ['A', 'K', 'Q', 'J'].includes(topCard.rank);

        discardEl.innerHTML = `
            <div class="card ${color}">
                <div class="card-corner card-corner-top">
                    <div class="card-rank-top">${rankDisplay}</div>
                    <div class="card-suit-top">${getSuitSVG(topCard.suit, color, 12)}</div>
                </div>
                <div class="card-center">
                    ${isFaceCard ?
                        `<div class="card-face">${getFaceCardSVG(topCard.rank, topCard.suit, color)}</div>` :
                        `<div class="card-pips">${getPipPattern(topCard.rank, topCard.suit, color)}</div>`
                    }
                </div>
                <div class="card-corner card-corner-bottom">
                    <div class="card-rank-bottom">${rankDisplay}</div>
                    <div class="card-suit-bottom">${getSuitSVG(topCard.suit, color, 16)}</div>
                </div>
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
            const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
            const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
            const rankDisplay = card.rank;
            const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);

            cardEl.innerHTML = `
                <div class="card-corner card-corner-top">
                    <div class="card-rank-top">${rankDisplay}</div>
                    <div class="card-suit-top">${getSuitSVG(card.suit, color, 12)}</div>
                </div>
                <div class="card-center">
                    ${isFaceCard ?
                        `<div class="card-face">${getFaceCardSVG(card.rank, card.suit, color)}</div>` :
                        `<div class="card-pips">${getPipPattern(card.rank, card.suit, color)}</div>`
                    }
                </div>
                <div class="card-corner card-corner-bottom">
                    <div class="card-rank-bottom">${rankDisplay}</div>
                    <div class="card-suit-bottom">${getSuitSVG(card.suit, color, 12)}</div>
                </div>
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

