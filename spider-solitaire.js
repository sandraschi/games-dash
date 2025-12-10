// Spider Solitaire - Windows Classic
// Killing productivity since 1990!

let deck = [];
let stock = [];
let tableau = [[], [], [], [], [], [], [], [], [], []];
let foundation = [[], [], [], [], [], [], [], []];
let selectedCard = null;
let selectedPile = null;
let moves = 0;
let suitsInPlay = 1; // 1, 2, or 4 suits
let completed = 0;

function setDifficulty(numSuits, event) {
    suitsInPlay = numSuits;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback: find button by text content
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            if (btn.textContent.includes(numSuits === 1 ? 'Easy' : numSuits === 2 ? 'Medium' : 'Hard')) {
                btn.classList.add('active');
            }
        });
    }
    newGame();
}

function initGame() {
    // Create deck
    deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    // Use only specified number of suits
    const activeSuits = suits.slice(0, suitsInPlay);
    
    // Create 2 decks (104 cards total for 4 suits, 52 for 1 suit, etc.)
    for (let deckNum = 0; deckNum < 2; deckNum++) {
        activeSuits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({ suit, rank, faceUp: false });
            });
        });
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal to tableau (10 piles, 6 cards to first 4, 5 to last 6)
    tableau = [[], [], [], [], [], [], [], [], [], []];
    let cardIndex = 0;
    
    for (let col = 0; col < 10; col++) {
        const cardsInPile = col < 4 ? 6 : 5;
        for (let row = 0; row < cardsInPile; row++) {
            const card = deck[cardIndex++];
            card.faceUp = (row === cardsInPile - 1); // Only top card face up
            tableau[col].push(card);
        }
    }
    
    // Rest goes to stock
    stock = deck.slice(cardIndex);
    foundation = [[], [], [], [], [], [], [], []];
    selectedCard = null;
    selectedPile = null;
    moves = 0;
    completed = 0;
    
    updateDisplay();
}

function dealFromStock() {
    if (stock.length === 0) {
        alert('Stock is empty!');
        return;
    }
    
    // Deal one card face-up to each tableau pile
    for (let i = 0; i < 10; i++) {
        if (stock.length > 0) {
            const card = stock.pop();
            card.faceUp = true;
            tableau[i].push(card);
        }
    }
    moves++;
    updateDisplay();
}

function canPlaceOnTableau(card, pile) {
    if (pile.length === 0) {
        return true; // Can place any card on empty pile
    }
    const topCard = pile[pile.length - 1];
    if (!topCard.faceUp) return false;
    
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topIndex = rankOrder.indexOf(topCard.rank);
    const cardIndex = rankOrder.indexOf(card.rank);
    
    return cardIndex === topIndex - 1; // Same suit not required, just descending
}

function canMoveSequence(cards) {
    if (cards.length === 0) return false;
    
    // Check if sequence is valid (descending ranks, same suit)
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const firstSuit = cards[0].suit;
    
    for (let i = 0; i < cards.length - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];
        const currentIndex = rankOrder.indexOf(current.rank);
        const nextIndex = rankOrder.indexOf(next.rank);
        
        if (currentIndex !== nextIndex + 1 || current.suit !== firstSuit) {
            return false;
        }
    }
    
    return true;
}

function checkCompleteSequence(pile) {
    if (pile.length < 13) return false;
    
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const last13 = pile.slice(-13);
    const suit = last13[0].suit;
    
    // Check if last 13 cards form a complete sequence (K to A, same suit)
    for (let i = 0; i < 13; i++) {
        if (last13[i].rank !== rankOrder[12 - i] || last13[i].suit !== suit) {
            return false;
        }
    }
    
    return true;
}

function removeCompleteSequence(pileIndex) {
    const pile = tableau[pileIndex];
    if (checkCompleteSequence(pile)) {
        const sequence = pile.splice(-13);
        // Find empty foundation slot
        for (let i = 0; i < 8; i++) {
            if (foundation[i].length === 0) {
                foundation[i] = sequence;
                completed++;
                // Flip new top card if exists
                if (pile.length > 0) {
                    pile[pile.length - 1].faceUp = true;
                }
                updateDisplay();
                checkWin();
                return true;
            }
        }
    }
    return false;
}

function selectCard(card, pileIndex) {
    const pile = tableau[pileIndex];
    const cardIndex = pile.indexOf(card);
    
    if (!card.faceUp) {
        // Try to flip face-down card
        if (cardIndex === pile.length - 1) {
            card.faceUp = true;
            updateDisplay();
        }
        return;
    }
    
    // Select sequence starting from this card
    const sequence = pile.slice(cardIndex);
    if (!canMoveSequence(sequence)) {
        alert('Invalid sequence! Cards must be in descending order, same suit.');
        return;
    }
    
    if (selectedCard === card && selectedPile === pileIndex) {
        selectedCard = null;
        selectedPile = null;
    } else {
        selectedCard = card;
        selectedPile = pileIndex;
    }
    updateDisplay();
}

function moveCard() {
    if (!selectedCard || selectedPile === null) return;
    
    const sourcePile = tableau[selectedPile];
    const cardIndex = sourcePile.indexOf(selectedCard);
    const cardsToMove = sourcePile.slice(cardIndex);
    
    if (!canMoveSequence(cardsToMove)) {
        selectedCard = null;
        selectedPile = null;
        updateDisplay();
        return;
    }
    
    // Try to place on another tableau pile
    for (let i = 0; i < 10; i++) {
        if (i === selectedPile) continue;
        if (canPlaceOnTableau(cardsToMove[0], tableau[i])) {
            sourcePile.splice(cardIndex, cardsToMove.length);
            tableau[i].push(...cardsToMove);
            
            // Flip new top card in source pile
            if (sourcePile.length > 0) {
                sourcePile[sourcePile.length - 1].faceUp = true;
            }
            
            moves++;
            selectedCard = null;
            selectedPile = null;
            
            // Check for complete sequences
            removeCompleteSequence(i);
            updateDisplay();
            return;
        }
    }
    
    // Invalid move
    selectedCard = null;
    selectedPile = null;
    updateDisplay();
}

function checkWin() {
    if (completed === 8) {
        setTimeout(() => {
            alert(`Congratulations! You won in ${moves} moves!`);
        }, 100);
    }
}

function updateDisplay() {
    // Stock
    const stockEl = document.getElementById('stock');
    if (stockEl) {
        stockEl.innerHTML = stock.length > 0 ? 
            '<div style="color: rgba(255,255,255,0.5);">Stock (' + stock.length + ')</div>' : 
            '<div style="color: rgba(255,255,255,0.3);">Empty</div>';
    }
    
    // Foundations
    const foundationsEl = document.getElementById('foundations');
    if (foundationsEl) {
        foundationsEl.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const foundationEl = document.createElement('div');
            foundationEl.className = 'card-slot foundation';
            if (foundation[i] && foundation[i].length > 0) {
                const card = foundation[i][foundation[i].length - 1];
                foundationEl.appendChild(createCardElement(card, 'foundation', i));
            }
            foundationsEl.appendChild(foundationEl);
        }
    }
    
    // Tableau
    const tableauEl = document.getElementById('tableau');
    if (tableauEl) {
        tableauEl.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const pileEl = document.createElement('div');
            pileEl.className = 'tableau-pile card-stack';
            pileEl.id = 'tableau-' + i;
            
            if (tableau[i]) {
                tableau[i].forEach((card, cardIndex) => {
                    const cardEl = createCardElement(card, 'tableau', i);
                    if (selectedCard === card && selectedPile === i) {
                        cardEl.classList.add('selected');
                    }
                    // Position cards in stack (CSS handles spacing with margin-top: 30px)
                    if (cardIndex > 0) {
                        cardEl.style.top = (cardIndex * 30) + 'px';
                    } else {
                        cardEl.style.top = '0px';
                    }
                    pileEl.appendChild(cardEl);
                });
            }
            
            tableauEl.appendChild(pileEl);
        }
    }
    
    const movesEl = document.getElementById('moves');
    if (movesEl) movesEl.textContent = moves;
    
    const completedEl = document.getElementById('completed');
    if (completedEl) completedEl.textContent = completed + '/8';
    
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = completed === 8 ? 'YOU WON!' : 'Keep playing!';
}

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

function getSuitPath(suit) {
    switch(suit) {
        case 'hearts':
            return '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
        case 'diamonds':
            return '<path d="M12 2L2 12l10 10 10-10L12 2z"/>';
        case 'clubs':
            return '<circle cx="12" cy="8" r="4"/><circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><path d="M10 12 L14 12 L12 20 Z"/>';
        case 'spades':
            return '<path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.13-1.5 3.94-3.5 4.58V16h-3v-2.42C8.5 12.94 7 11.13 7 9c0-2.76 2.24-5 5-5zm-1 15h2v3h-2v-3z"/>';
        default:
            return '';
    }
}

function getFaceCardSVG(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitPath = getSuitPath(suit);
    
    let faceSVG = '';
    switch(rank) {
        case 'K':
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M15 30 L20 20 L25 25 L30 15 L35 25 L40 20 L45 30 L45 35 L15 35 Z" fill="${fill}" stroke="${fill}" stroke-width="1"/>
                <circle cx="20" cy="22" r="2" fill="${fill}"/>
                <circle cx="30" cy="18" r="2" fill="${fill}"/>
                <circle cx="40" cy="22" r="2" fill="${fill}"/>
                <path d="M25 40 L25 70 M25 55 L35 40 M25 55 L35 70" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <g transform="translate(20, 75) scale(0.8)"><g fill="${fill}">${suitPath}</g></g>
            </svg>`;
            break;
        case 'Q':
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M15 30 L20 20 L25 25 L30 15 L35 25 L40 20 L45 30 L45 35 L15 35 Z" fill="${fill}" stroke="${fill}" stroke-width="1"/>
                <circle cx="20" cy="22" r="2" fill="${fill}"/>
                <circle cx="30" cy="18" r="2.5" fill="${fill}"/>
                <circle cx="40" cy="22" r="2" fill="${fill}"/>
                <circle cx="30" cy="50" r="8" stroke="${fill}" stroke-width="3" fill="none"/>
                <path d="M35 55 L40 60" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
                <g transform="translate(20, 75) scale(0.8)"><g fill="${fill}">${suitPath}</g></g>
            </svg>`;
            break;
        case 'J':
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M25 25 Q30 20 35 25 Q40 20 35 30" stroke="${fill}" stroke-width="2" fill="none"/>
                <path d="M30 35 L30 65 M25 65 Q30 70 35 65" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <g transform="translate(20, 75) scale(0.8)"><g fill="${fill}">${suitPath}</g></g>
            </svg>`;
            break;
        case 'A':
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M20 70 L30 40 L40 70 M25 60 L35 60" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
                <g transform="translate(20, 75) scale(0.8)"><g fill="${fill}">${suitPath}</g></g>
            </svg>`;
            break;
    }
    return faceSVG;
}

function createCardElement(card, pileType, pileIndex) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if (card.faceUp) {
        const color = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
        cardEl.classList.add(color);
        
        const rankDisplay = card.rank;
        const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);
        
        cardEl.innerHTML = `
            <div class="card-corner card-corner-top">
                <div class="card-rank-top">${rankDisplay}</div>
                <div class="card-suit-top">${getSuitSVG(card.suit, color, 20)}</div>
            </div>
            <div class="card-center">
                ${isFaceCard ? 
                    `<div class="card-face">${getFaceCardSVG(card.rank, card.suit, color)}</div>` :
                    `<div class="card-suit-large">${getSuitSVG(card.suit, color, 48)}</div>`
                }
            </div>
            <div class="card-corner card-corner-bottom">
                <div class="card-rank-bottom">${rankDisplay}</div>
                <div class="card-suit-bottom">${getSuitSVG(card.suit, color, 20)}</div>
            </div>
        `;
        
        if (pileType === 'tableau') {
            cardEl.onclick = () => {
                if (selectedCard && selectedPile !== null) {
                    moveCard();
                } else {
                    selectCard(card, pileIndex);
                }
            };
        }
    } else {
        cardEl.classList.add('face-down');
        cardEl.innerHTML = '<div style="font-size: 30px; text-align: center;">*</div>';
        if (pileType === 'tableau') {
            cardEl.onclick = () => selectCard(card, pileIndex);
        }
    }
    
    return cardEl;
}

function newGame() {
    initGame();
}

function hint() {
    alert('Hint: Build sequences of same suit, descending from K to A. Complete sequences (K-A, same suit) are automatically moved to foundation. Deal from stock when stuck.');
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => initGame(), 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => initGame(), 100);
}

