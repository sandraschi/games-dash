// Solitaire (Klondike) - Windows Classic
// Killing productivity since 1990!

let deck = [];
let stock = [];
let waste = [];
let foundation = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: []
};
let tableau = [[], [], [], [], [], [], []];
let selectedCard = null;
let selectedPile = null;
let moves = 0;
let gameWon = false;
let gameStartTime = null;

function initGame() {
    // Create deck
    deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank, faceUp: false });
        });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal to tableau
    tableau = [[], [], [], [], [], [], []];
    for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
            const card = deck.pop();
            card.faceUp = (row === col);
            tableau[col].push(card);
        }
    }
    
    // Rest goes to stock
    stock = [...deck];
    waste = [];
    foundation = { hearts: [], diamonds: [], clubs: [], spades: [] };
    selectedCard = null;
    selectedPile = null;
    moves = 0;
    gameWon = false;
    gameStartTime = Date.now();
    
    updateDisplay();
}

function drawFromStock() {
    if (stock.length === 0) {
        // Recycle waste back to stock
        stock = waste.reverse();
        stock.forEach(card => card.faceUp = false);
        waste = [];
    } else {
        // Draw 3 cards (or 1 if less than 3 remain)
        const drawCount = Math.min(3, stock.length);
        for (let i = 0; i < drawCount; i++) {
            const card = stock.pop();
            card.faceUp = true;
            waste.push(card);
        }
    }
    moves++;
    updateDisplay();
}

function canPlaceOnFoundation(card, suit) {
    const foundationPile = foundation[suit];
    if (foundationPile.length === 0) {
        return card.rank === 'A';
    }
    const topCard = foundationPile[foundationPile.length - 1];
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topIndex = rankOrder.indexOf(topCard.rank);
    const cardIndex = rankOrder.indexOf(card.rank);
    return cardIndex === topIndex + 1 && card.suit === suit;
}

function canPlaceOnTableau(card, pile) {
    if (pile.length === 0) {
        return card.rank === 'K';
    }
    const topCard = pile[pile.length - 1];
    if (!topCard.faceUp) return false;
    
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topIndex = rankOrder.indexOf(topCard.rank);
    const cardIndex = rankOrder.indexOf(card.rank);
    
    const topColor = ['hearts', 'diamonds'].includes(topCard.suit) ? 'red' : 'black';
    const cardColor = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
    
    return cardIndex === topIndex - 1 && topColor !== cardColor;
}

function selectCard(card, pileType, pileIndex) {
    if (!card.faceUp) {
        // Try to flip face-down card
        if (pileType === 'tableau' && card === tableau[pileIndex][tableau[pileIndex].length - 1]) {
            card.faceUp = true;
            updateDisplay();
        }
        return;
    }
    
    if (selectedCard === card && selectedPile === { type: pileType, index: pileIndex }) {
        // Deselect
        selectedCard = null;
        selectedPile = null;
    } else {
        selectedCard = card;
        selectedPile = { type: pileType, index: pileIndex };
    }
    updateDisplay();
}

function moveCard() {
    if (!selectedCard || !selectedPile) return;
    
    const { type, index } = selectedPile;
    let cardsToMove = [];
    let sourcePile = null;
    
    if (type === 'waste') {
        if (waste.length === 0) return;
        cardsToMove = [waste[waste.length - 1]];
        sourcePile = waste;
    } else if (type === 'tableau') {
        const pile = tableau[index];
        const cardIndex = pile.indexOf(selectedCard);
        if (cardIndex === -1) return;
        cardsToMove = pile.slice(cardIndex);
        sourcePile = pile;
    } else if (type === 'foundation') {
        const suit = selectedCard.suit;
        if (foundation[suit].length === 0) return;
        cardsToMove = [foundation[suit][foundation[suit].length - 1]];
        sourcePile = foundation[suit];
    }
    
    if (cardsToMove.length === 0) return;
    
    // Try foundation first (single cards only)
    if (cardsToMove.length === 1) {
        for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
            if (canPlaceOnFoundation(cardsToMove[0], suit)) {
                const card = sourcePile.pop();
                foundation[suit].push(card);
                moves++;
                selectedCard = null;
                selectedPile = null;
                checkWin();
                updateDisplay();
                return;
            }
        }
    }
    
    // Try tableau
    for (let i = 0; i < 7; i++) {
        if (i === index && type === 'tableau') continue;
        if (canPlaceOnTableau(cardsToMove[0], tableau[i])) {
            // Check if moving a sequence (must be valid sequence)
            if (cardsToMove.length > 1) {
                const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
                let validSequence = true;
                for (let j = 0; j < cardsToMove.length - 1; j++) {
                    const current = cardsToMove[j];
                    const next = cardsToMove[j + 1];
                    const currentIndex = rankOrder.indexOf(current.rank);
                    const nextIndex = rankOrder.indexOf(next.rank);
                    const currentColor = ['hearts', 'diamonds'].includes(current.suit) ? 'red' : 'black';
                    const nextColor = ['hearts', 'diamonds'].includes(next.suit) ? 'red' : 'black';
                    if (currentIndex !== nextIndex - 1 || currentColor === nextColor) {
                        validSequence = false;
                        break;
                    }
                }
                if (!validSequence) continue;
            }
            
            const removed = sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), cardsToMove.length);
            tableau[i].push(...removed);
            // Flip new top card in source pile
            if (sourcePile.length > 0 && type === 'tableau') {
                sourcePile[sourcePile.length - 1].faceUp = true;
            }
            moves++;
            selectedCard = null;
            selectedPile = null;
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
    const allSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const won = allSuits.every(suit => foundation[suit].length === 13);
    if (won && !gameWon) {
        gameWon = true;
        const duration = gameStartTime ? Date.now() - gameStartTime : 0;
        // Score: lower moves and time = higher score
        const score = Math.max(0, 10000 - moves * 10 - Math.floor(duration / 1000));
        if (window.recordGameStats) {
            window.recordGameStats('solitaire', 'win', score, duration, { moves: moves });
        }
        setTimeout(() => {
            alert(`Congratulations! You won in ${moves} moves!`);
        }, 100);
    }
}

function updateDisplay() {
    // Stock
    const stockEl = document.getElementById('stock');
    stockEl.innerHTML = stock.length > 0 ? 
        '<div style="color: rgba(255,255,255,0.5);">Stock (' + stock.length + ')</div>' : 
        '<div style="color: rgba(255,255,255,0.3);">Empty</div>';
    
    // Waste
    const wasteEl = document.getElementById('waste');
    wasteEl.innerHTML = '';
    if (waste.length > 0) {
        const card = waste[waste.length - 1];
        const cardEl = createCardElement(card, 'waste', 0);
        if (selectedCard === card && selectedPile?.type === 'waste') {
            cardEl.classList.add('selected');
        }
        wasteEl.appendChild(cardEl);
    }
    
    // Foundation
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    suits.forEach((suit, i) => {
        const foundationEl = document.querySelectorAll('.foundation')[i];
        foundationEl.innerHTML = '';
        if (foundation[suit].length > 0) {
            const card = foundation[suit][foundation[suit].length - 1];
            const cardEl = createCardElement(card, 'foundation', suit);
            if (selectedCard === card && selectedPile?.type === 'foundation') {
                cardEl.classList.add('selected');
            }
            foundationEl.appendChild(cardEl);
        } else {
            foundationEl.innerHTML = '<div style="color: rgba(255,255,255,0.3);">' + suit.charAt(0).toUpperCase() + '</div>';
        }
    });
    
    // Tableau
    const tableauEl = document.getElementById('tableau');
    tableauEl.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const pileEl = document.createElement('div');
        pileEl.className = 'tableau-pile';
        pileEl.id = 'tableau-' + i;
        
        tableau[i].forEach((card, cardIndex) => {
            const cardEl = createCardElement(card, 'tableau', i);
            if (selectedCard === card && selectedPile?.type === 'tableau' && selectedPile?.index === i) {
                cardEl.classList.add('selected');
            }
            if (cardIndex > 0) {
                cardEl.style.marginTop = '-120px';
            }
            pileEl.appendChild(cardEl);
        });
        
        tableauEl.appendChild(pileEl);
    }
    
    document.getElementById('status').textContent = `Moves: ${moves} | ${gameWon ? 'YOU WON!' : 'Keep playing!'}`;
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

function getFaceCardSVG(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 30);
    
    let faceSVG = '';
    switch(rank) {
        case 'K':
            // King illustration - crown and K
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <!-- Crown -->
                <path d="M15 30 L20 20 L25 25 L30 15 L35 25 L40 20 L45 30 L45 35 L15 35 Z" fill="${fill}" stroke="${fill}" stroke-width="1"/>
                <circle cx="20" cy="22" r="2" fill="${fill}"/>
                <circle cx="30" cy="18" r="2" fill="${fill}"/>
                <circle cx="40" cy="22" r="2" fill="${fill}"/>
                <!-- K letter -->
                <path d="M25 40 L25 70 M25 55 L35 40 M25 55 L35 70" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <!-- Suit symbol -->
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
        case 'Q':
            // Queen illustration - crown and Q
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <!-- Crown -->
                <path d="M15 30 L20 20 L25 25 L30 15 L35 25 L40 20 L45 30 L45 35 L15 35 Z" fill="${fill}" stroke="${fill}" stroke-width="1"/>
                <circle cx="20" cy="22" r="2" fill="${fill}"/>
                <circle cx="30" cy="18" r="2.5" fill="${fill}"/>
                <circle cx="40" cy="22" r="2" fill="${fill}"/>
                <!-- Q letter -->
                <circle cx="30" cy="50" r="8" stroke="${fill}" stroke-width="3" fill="none"/>
                <path d="M35 55 L40 60" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
                <!-- Suit symbol -->
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
        case 'J':
            // Jack illustration - J with decorative elements
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <!-- Decorative top -->
                <path d="M25 25 Q30 20 35 25 Q40 20 35 30" stroke="${fill}" stroke-width="2" fill="none"/>
                <!-- J letter -->
                <path d="M30 35 L30 65 M25 65 Q30 70 35 65" stroke="${fill}" stroke-width="3" stroke-linecap="round" fill="none"/>
                <!-- Suit symbol -->
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
        case 'A':
            // Ace - large A with suit
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <!-- A letter -->
                <path d="M20 70 L30 40 L40 70 M25 60 L35 60" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
                <!-- Suit symbol in center -->
                <g transform="translate(20, 75)">${suitSVG}</g>
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
        
        const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
        const rankDisplay = card.rank;
        const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);
        
        // Create proper card layout with SVG suit symbols and face cards
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
        
        cardEl.onclick = () => {
            if (selectedCard && selectedPile) {
                moveCard();
            } else {
                selectCard(card, pileType, pileIndex);
            }
        };
    } else {
        cardEl.classList.add('face-down');
        cardEl.innerHTML = '<div style="font-size: 40px; text-align: center;">*</div>';
        cardEl.onclick = () => selectCard(card, pileType, pileIndex);
    }
    
    return cardEl;
}

function newGame() {
    initGame();
}

function hint() {
    // Simple hint: try to move waste card or tableau cards
    alert('Hint: Try moving cards to foundation piles (Aces first), or build tableau sequences (alternating colors, descending ranks).');
}

function undo() {
    alert('Undo not implemented in this version. Start a new game if needed!');
}

// Initialize on load
window.addEventListener('load', () => {
    initGame();
});

