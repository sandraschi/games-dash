// FreeCell - Windows Classic
// Killing productivity since 1990!

let deck = [];
let freecells = [null, null, null, null];
let foundation = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: []
};
let tableau = [[], [], [], [], [], [], [], []];
let selectedCard = null;
let selectedPile = null;
let moves = 0;
let gameWon = false;

function initGame() {
    // Create deck
    deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal to tableau (8 piles, alternating)
    tableau = [[], [], [], [], [], [], [], []];
    for (let i = 0; i < 52; i++) {
        tableau[i % 8].push(deck[i]);
    }
    
    freecells = [null, null, null, null];
    foundation = { hearts: [], diamonds: [], clubs: [], spades: [] };
    selectedCard = null;
    selectedPile = null;
    moves = 0;
    gameWon = false;
    
    updateDisplay();
}

function canPlaceOnFoundation(card, suit) {
    const foundationPile = foundation[suit];
    if (foundationPile.length === 0) {
        return card.rank === 'A' && card.suit === suit;
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
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topIndex = rankOrder.indexOf(topCard.rank);
    const cardIndex = rankOrder.indexOf(card.rank);
    
    const topColor = ['hearts', 'diamonds'].includes(topCard.suit) ? 'red' : 'black';
    const cardColor = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
    
    return cardIndex === topIndex - 1 && topColor !== cardColor;
}

function canMoveSequence(cards, fromPile, toPile) {
    if (cards.length === 0) return false;
    
    // Count available freecells and empty tableau piles
    const emptyFreecells = freecells.filter(c => c === null).length;
    const emptyTableau = tableau.filter(p => p.length === 0).length;
    const maxMovable = (emptyFreecells + 1) * Math.pow(2, emptyTableau);
    
    if (cards.length > maxMovable) return false;
    
    // Check if sequence is valid
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (let i = 0; i < cards.length - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];
        const currentIndex = rankOrder.indexOf(current.rank);
        const nextIndex = rankOrder.indexOf(next.rank);
        
        const currentColor = ['hearts', 'diamonds'].includes(current.suit) ? 'red' : 'black';
        const nextColor = ['hearts', 'diamonds'].includes(next.suit) ? 'red' : 'black';
        
        if (currentIndex !== nextIndex + 1 || currentColor === nextColor) {
            return false;
        }
    }
    
    // Check if can place on destination
    if (toPile.length === 0) {
        return cards[cards.length - 1].rank === 'K';
    }
    return canPlaceOnTableau(cards[0], toPile);
}

function selectCard(card, pileType, pileIndex) {
    if (selectedCard === card && selectedPile?.type === pileType && selectedPile?.index === pileIndex) {
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
    
    if (type === 'freecell') {
        cardsToMove = [freecells[index]];
        sourcePile = freecells;
    } else if (type === 'tableau') {
        const pile = tableau[index];
        const cardIndex = pile.indexOf(selectedCard);
        cardsToMove = pile.slice(cardIndex);
        sourcePile = pile;
    }
    
    // Try foundation first
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
        if (cardsToMove.length === 1 && canPlaceOnFoundation(cardsToMove[0], suit)) {
            if (type === 'freecell') {
                freecells[index] = null;
            } else {
                sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), 1);
            }
            foundation[suit].push(cardsToMove[0]);
            moves++;
            selectedCard = null;
            selectedPile = null;
            checkWin();
            updateDisplay();
            return;
        }
    }
    
    // Try freecell (single card only)
    if (cardsToMove.length === 1) {
        for (let i = 0; i < 4; i++) {
            if (freecells[i] === null && type !== 'freecell') {
                sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), 1);
                freecells[i] = cardsToMove[0];
                moves++;
                selectedCard = null;
                selectedPile = null;
                updateDisplay();
                return;
            }
        }
    }
    
    // Try tableau
    for (let i = 0; i < 8; i++) {
        if (i === index && type === 'tableau') continue;
        if (canMoveSequence(cardsToMove, sourcePile, tableau[i])) {
            sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), cardsToMove.length);
            tableau[i].push(...cardsToMove);
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
        setTimeout(() => {
            alert(`Congratulations! You won in ${moves} moves!`);
        }, 100);
    }
}

function updateDisplay() {
    // Freecells
    for (let i = 0; i < 4; i++) {
        const freecellEl = document.querySelectorAll('.freecell')[i];
        freecellEl.innerHTML = '';
        if (freecells[i]) {
            const cardEl = createCardElement(freecells[i], 'freecell', i);
            if (selectedCard === freecells[i] && selectedPile?.type === 'freecell') {
                cardEl.classList.add('selected');
            }
            freecellEl.appendChild(cardEl);
        }
    }
    
    // Foundations
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    suits.forEach((suit, i) => {
        const foundationEl = document.querySelectorAll('.foundation')[i];
        foundationEl.innerHTML = '';
        if (foundation[suit].length > 0) {
            const card = foundation[suit][foundation[suit].length - 1];
            const cardEl = createCardElement(card, 'foundation', suit);
            foundationEl.appendChild(cardEl);
        } else {
            foundationEl.innerHTML = '<div style="color: rgba(255,255,255,0.3);">' + suit.charAt(0).toUpperCase() + '</div>';
        }
    });
    
    // Tableau
    const tableauEl = document.getElementById('tableau');
    tableauEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const pileEl = document.createElement('div');
        pileEl.className = 'tableau-pile card-stack';
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

function createCardElement(card, pileType, pileIndex) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    const color = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
    cardEl.classList.add(color);
    
    const suitSymbols = {
        hearts: '♥',
        diamonds: '♦',
        clubs: '♣',
        spades: '♠'
    };
    
    const suitSymbol = suitSymbols[card.suit];
    const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
    const rankDisplay = card.rank;
    const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);
    
    cardEl.innerHTML = `
        <div class="card-corner card-corner-top">
            <div class="card-rank-top">${rankDisplay}</div>
            <div class="card-suit-top" style="color: ${suitColorValue};">${suitSymbol}</div>
        </div>
        <div class="card-center">
            ${isFaceCard ? 
                `<div class="card-face" style="color: ${suitColorValue}; font-size: 50px; font-weight: bold;">${card.rank}</div>
                 <div class="card-suit-large" style="color: ${suitColorValue}; font-size: 40px; margin-top: 5px;">${suitSymbol}</div>` :
                `<div class="card-suit-large" style="color: ${suitColorValue}; font-size: 48px;">${suitSymbol}</div>`
            }
        </div>
        <div class="card-corner card-corner-bottom">
            <div class="card-rank-bottom">${rankDisplay}</div>
            <div class="card-suit-bottom" style="color: ${suitColorValue};">${suitSymbol}</div>
        </div>
    `;
    
    cardEl.onclick = () => {
        if (selectedCard && selectedPile) {
            moveCard();
        } else {
            selectCard(card, pileType, pileIndex);
        }
    };
    
    return cardEl;
}

function newGame() {
    initGame();
}

function hint() {
    alert('Hint: Use freecells strategically to move sequences. Build foundation piles from Aces up. Build tableau sequences alternating colors, descending ranks.');
}

// Initialize on load
window.addEventListener('load', () => {
    initGame();
});

