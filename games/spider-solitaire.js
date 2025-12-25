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
    console.log('setDifficulty called with numSuits:', numSuits);
    suitsInPlay = numSuits;
    
    // Update button states
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
    
    console.log('suitsInPlay set to:', suitsInPlay);
    newGame();
}

function initGame() {
    console.log('initGame called, suitsInPlay:', suitsInPlay);

    // Create deck
    deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    // Use only specified number of suits
    const activeSuits = suits.slice(0, suitsInPlay);
    console.log('activeSuits:', activeSuits);

    // Spider Solitaire deck sizes (Classic Windows version):
    // - 1 suit (Easy): 1 deck (52 cards) of hearts only
    // - 2 suits (Medium): 2 decks (104 cards) of hearts + diamonds
    // - 4 suits (Hard): 4 decks (208 cards) of all suits
    const numDecks = suitsInPlay; // Easy=1, Medium=2, Hard=4

    for (let deckNum = 0; deckNum < numDecks; deckNum++) {
        activeSuits.forEach(suit => {
            ranks.forEach(rank => {
                deck.push({ suit, rank, faceUp: false });
            });
        });
    }

    console.log('Deck created with', deck.length, 'cards, numDecks:', numDecks, 'suitsInPlay:', suitsInPlay);
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal to tableau - classic Spider Solitaire dealing
    tableau = [[], [], [], [], [], [], [], [], [], []];
    let cardIndex = 0;

    if (deck.length === 52) {
        // 1 suit (Easy): Deal 5 cards to each column
        // Total: 10×5 = 50 cards dealt, 2 left in stock
        for (let col = 0; col < 10; col++) {
            for (let row = 0; row < 5; row++) {
                const card = deck[cardIndex++];
                card.faceUp = (row === 4); // Only top card face up
                tableau[col].push(card);
            }
        }
    } else if (deck.length === 104) {
        // 2 suits (Medium): Standard dealing - 6 cards to first 4 columns, 5 to last 6
        // Total: 4×6 + 6×5 = 24 + 30 = 54 cards dealt, 50 left in stock
        for (let col = 0; col < 10; col++) {
            const cardsInPile = col < 4 ? 6 : 5;
            for (let row = 0; row < cardsInPile; row++) {
                const card = deck[cardIndex++];
                card.faceUp = (row === cardsInPile - 1); // Only top card face up
                tableau[col].push(card);
            }
        }
    } else if (deck.length === 208) {
        // 4 suits (Hard): Deal 6 cards to each of 10 columns
        // Total: 10×6 = 60 cards dealt, 148 left in stock (more dealing possible)
        for (let col = 0; col < 10; col++) {
            for (let row = 0; row < 6; row++) {
                const card = deck[cardIndex++];
                card.faceUp = (row === 5); // Only top card face up
                tableau[col].push(card);
            }
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
    
    // In Spider Solitaire, cards must be same suit AND one rank lower
    return cardIndex === topIndex - 1 && card.suit === topCard.suit;
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
                <path d="M12 3L8 9L12 15L16 9L12 3M12 15L9 21L12 18L15 21L12 15Z" fill="${fill}"/>
            </svg>`;
        default:
            return '';
    }
}

function getSuitPath(suit, size = 14) {
    switch(suit) {
        case 'hearts':
            return '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>';
        case 'diamonds':
            return '<path d="M12 2L2 12l10 10 10-10L12 2z"/>';
        case 'clubs':
            return '<circle cx="12" cy="8" r="4"/><circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3"/><path d="M10 12 L14 12 L12 20 Z"/>';
        case 'spades':
            return '<path d="M12 2C10 2 8 4 8 6C8 8 10 9 12 11C14 9 16 8 16 6C16 4 14 2 12 2M12 13L9 22L11 20L12 22L13 20L15 22L12 13Z"/>';
        default:
            return '';
    }
}

function getFaceCardSVG(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitPath = getSuitPath(suit, 18).replace(/width="[^"]*" height="[^"]*"/, `width="${18}" height="${18}"`);
    
    let faceSVG = '';
    switch(rank) {
        case 'K':
            // Simple K letter
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M25 40 L25 70 M25 55 L35 40 M25 55 L35 70" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
                <g transform="translate(20, 75) scale(0.8)"><g fill="${fill}">${suitPath}</g></g>
            </svg>`;
            break;
        case 'Q':
            // Simple Q letter
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <circle cx="30" cy="50" r="8" stroke="${fill}" stroke-width="4" fill="none"/>
                <path d="M35 55 L40 60" stroke="${fill}" stroke-width="4" stroke-linecap="round"/>
                <g transform="translate(20, 75) scale(0.8)"><g fill="${fill}">${suitPath}</g></g>
            </svg>`;
            break;
        case 'J':
            // Simple J letter
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M30 35 L30 65 M25 65 Q30 70 35 65" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
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

// Get proper pip pattern for number cards (2-10)
function getPipPattern(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 14);

    // Card dimensions and margins
    const cardWidth = 70;
    const cardHeight = 100;
    const margin = 8;
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
                <g transform="translate(${centerX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 12})">${suitSVG}</g>
            `;
            break;
        case '3':
            pattern = `
                <g transform="translate(${centerX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 18})">${suitSVG}</g>
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
                <g transform="translate(${leftX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 18})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 18})">${suitSVG}</g>
            `;
            break;
        case '7':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 8})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 8})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 8})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '8':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '9':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 15})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 15})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 2})">${suitSVG}</g>
            `;
            break;
        case '10':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY - 6})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY - 6})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 6})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 18})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 18})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
    }

    return `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" style="display: block;">
        ${pattern}
    </svg>`;
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
        setTimeout(() => {
            console.log('Initializing game on load, suitsInPlay:', suitsInPlay);
            initGame();
        }, 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        console.log('Initializing game (DOM ready), suitsInPlay:', suitsInPlay);
        initGame();
    }, 100);
}

