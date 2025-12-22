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
                <path d="M12 2C10 2 8 4 8 6C8 8 10 9 12 11C14 9 16 8 16 6C16 4 14 2 12 2M12 13L9 22L11 20L12 22L13 20L15 22L12 13Z" fill="${fill}"/>
            </svg>`;
        default:
            return '';
    }
}

// SVG Face card illustrations
function getFaceCardSVG(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 18);

    let faceSVG = '';
    switch(rank) {
        case 'K':
            // Simple K letter
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <path d="M18 30 L18 50 M18 40 L26 30 M18 40 L26 50" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
        case 'Q':
            // Simple Q letter
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <circle cx="25" cy="38" r="6" stroke="${fill}" stroke-width="3" fill="none"/>
                <path d="M28 41 L32 45" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
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
    const suitSVG = getSuitSVG(suit, color, 14);

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
        
        const color = card.suit === 'hearts' || card.suit === 'diamonds' ? 'red' : 'black';
        const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
        const rankDisplay = card.rank;
        const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);

        if (card.isJoker) {
            cardEl.innerHTML = `
                <div class="card-corner card-corner-top">
                    <div class="card-rank-top">J</div>
                </div>
                <div class="card-center">
                    <div class="card-face" style="color: ${suitColorValue}; font-size: 24px; font-weight: bold;">🃏</div>
                </div>
                <div class="card-corner card-corner-bottom">
                    <div class="card-rank-bottom">J</div>
                </div>
            `;
        } else {
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
        }
        
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

        if (topCard.isJoker) {
            discardEl.innerHTML = `
                <div class="card joker">
                    <div class="card-corner card-corner-top">
                        <div class="card-rank-top">J</div>
                    </div>
                    <div class="card-center">
                        <div class="card-face" style="color: ${suitColorValue}; font-size: 24px; font-weight: bold;">🃏</div>
                    </div>
                    <div class="card-corner card-corner-bottom">
                        <div class="card-rank-bottom">J</div>
                    </div>
                </div>
            `;
        } else {
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

