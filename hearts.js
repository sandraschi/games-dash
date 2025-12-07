// Hearts - Windows Classic
// Killing productivity since 1990!

let deck = [];
let hands = {
    south: [], // Player
    north: [],
    east: [],
    west: []
};
let scores = {
    south: 0,
    north: 0,
    east: 0,
    west: 0
};
let currentTrick = [];
let leadPlayer = 'south';
let currentPlayer = 'south';
let passDirection = 'left'; // left, right, across, none
let passingPhase = false;
let selectedCards = [];
let heartsBroken = false;
let gameActive = false;

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
    
    // Deal 13 cards to each player
    hands = { south: [], north: [], east: [], west: [] };
    for (let i = 0; i < 52; i++) {
        const player = ['south', 'west', 'north', 'east'][i % 4];
        hands[player].push(deck[i]);
    }
    
    // Sort hands
    Object.keys(hands).forEach(player => {
        sortHand(hands[player]);
    });
    
    currentTrick = [];
    leadPlayer = 'south';
    currentPlayer = 'south';
    passingPhase = true;
    selectedCards = [];
    heartsBroken = false;
    gameActive = false;
    
    // Rotate pass direction
    const directions = ['left', 'right', 'across', 'none'];
    const currentIndex = directions.indexOf(passDirection);
    passDirection = directions[(currentIndex + 1) % directions.length];
    
    updateDisplay();
}

function sortHand(hand) {
    const suitOrder = ['clubs', 'diamonds', 'spades', 'hearts'];
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    hand.sort((a, b) => {
        if (a.suit !== b.suit) {
            return suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
        }
        return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
}

function passCards() {
    if (selectedCards.length !== 3) {
        alert('Select exactly 3 cards to pass!');
        return;
    }
    
    if (passDirection === 'none') {
        passingPhase = false;
        startTrick();
        return;
    }
    
    // Remove selected cards from player's hand
    selectedCards.forEach(card => {
        const index = hands.south.indexOf(card);
        if (index > -1) hands.south.splice(index, 1);
    });
    
    // AI players pass cards (random for simplicity)
    const aiPlayers = ['north', 'east', 'west'];
    const aiPassed = {};
    aiPlayers.forEach(player => {
        const cardsToPass = hands[player].slice(0, 3);
        cardsToPass.forEach(card => {
            const index = hands[player].indexOf(card);
            if (index > -1) hands[player].splice(index, 1);
        });
        aiPassed[player] = cardsToPass;
    });
    
    // Receive passed cards
    if (passDirection === 'left') {
        hands.south.push(...aiPassed['west']);
        hands.west.push(...aiPassed['north']);
        hands.north.push(...aiPassed['east']);
        hands.east.push(...selectedCards);
    } else if (passDirection === 'right') {
        hands.south.push(...aiPassed['east']);
        hands.east.push(...aiPassed['north']);
        hands.north.push(...aiPassed['west']);
        hands.west.push(...selectedCards);
    } else if (passDirection === 'across') {
        hands.south.push(...aiPassed['north']);
        hands.north.push(...selectedCards);
        hands.east.push(...aiPassed['west']);
        hands.west.push(...aiPassed['east']);
    }
    
    // Sort hands again
    Object.keys(hands).forEach(player => {
        sortHand(hands[player]);
    });
    
    selectedCards = [];
    passingPhase = false;
    startTrick();
    updateDisplay();
}

function startTrick() {
    if (!gameActive) {
        gameActive = true;
        // Find player with 2 of clubs
        for (const player of ['south', 'west', 'north', 'east']) {
            if (hands[player].some(c => c.suit === 'clubs' && c.rank === '2')) {
                leadPlayer = player;
                currentPlayer = player;
                break;
            }
        }
    }
    
    currentTrick = [];
    updateDisplay();
    
    if (currentPlayer === 'south') {
        document.getElementById('status').textContent = 'Your turn! Play a card.';
    } else {
        playAICard();
    }
}

function canPlayCard(card, hand, isLead) {
    if (isLead) {
        // First trick: must play 2 of clubs if you have it
        if (currentTrick.length === 0 && hands.south.some(c => c.suit === 'clubs' && c.rank === '2')) {
            return card.suit === 'clubs' && card.rank === '2';
        }
        // Can't lead hearts until broken
        if (!heartsBroken && card.suit === 'hearts') {
            // Unless hearts is all you have
            return hand.every(c => c.suit === 'hearts');
        }
        return true;
    } else {
        // Must follow suit
        const leadSuit = currentTrick[0].suit;
        const hasLeadSuit = hand.some(c => c.suit === leadSuit);
        
        if (hasLeadSuit) {
            return card.suit === leadSuit;
        }
        
        // Can't play hearts or queen of spades on first trick
        if (currentTrick.length === 0 && (card.suit === 'hearts' || (card.suit === 'spades' && card.rank === 'Q'))) {
            return false;
        }
        
        return true;
    }
}

function playCard(card, player) {
    if (currentPlayer !== player) return;
    if (passingPhase) {
        // Toggle selection for passing
        const index = selectedCards.indexOf(card);
        if (index > -1) {
            selectedCards.splice(index, 1);
        } else {
            if (selectedCards.length < 3) {
                selectedCards.push(card);
            }
        }
        updateDisplay();
        return;
    }
    
    const hand = hands[player];
    const isLead = currentTrick.length === 0;
    
    if (!canPlayCard(card, hand, isLead)) {
        alert('Invalid card! ' + (isLead ? 'Must follow suit or play 2 of clubs on first trick.' : 'Must follow suit if possible.'));
        return;
    }
    
    // Remove card from hand
    const cardIndex = hand.indexOf(card);
    if (cardIndex > -1) hand.splice(cardIndex, 1);
    
    // Add to trick
    currentTrick.push({ card, player });
    
    // Break hearts if needed
    if (card.suit === 'hearts') heartsBroken = true;
    
    // Move to next player
    const players = ['south', 'west', 'north', 'east'];
    const currentIndex = players.indexOf(currentPlayer);
    currentPlayer = players[(currentIndex + 1) % 4];
    
    if (currentTrick.length === 4) {
        // Trick complete
        completeTrick();
    } else {
        // Next player's turn
        if (currentPlayer === 'south') {
            document.getElementById('status').textContent = 'Your turn!';
        } else {
            setTimeout(() => playAICard(), 500);
        }
    }
    
    updateDisplay();
}

function completeTrick() {
    // Find winner (highest card of lead suit)
    const leadSuit = currentTrick[0].card.suit;
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    let winner = currentTrick[0];
    let highestRank = rankOrder.indexOf(currentTrick[0].card.rank);
    
    for (let i = 1; i < 4; i++) {
        if (currentTrick[i].card.suit === leadSuit) {
            const rank = rankOrder.indexOf(currentTrick[i].card.rank);
            if (rank > highestRank) {
                highestRank = rank;
                winner = currentTrick[i];
            }
        }
    }
    
    // Calculate points
    let points = 0;
    currentTrick.forEach(({ card }) => {
        if (card.suit === 'hearts') points += 1;
        if (card.suit === 'spades' && card.rank === 'Q') points += 13;
    });
    
    scores[winner.player] += points;
    leadPlayer = winner.player;
    currentPlayer = winner.player;
    
    // Check for shooting the moon
    if (points === 26) {
        // Shoot the moon - give all other players 26 points
        Object.keys(scores).forEach(player => {
            if (player !== winner.player) {
                scores[player] += 26;
            }
        });
        scores[winner.player] -= 26;
        alert(`${winner.player.toUpperCase()} shot the moon!`);
    }
    
    // Check game over
    if (hands.south.length === 0) {
        // Round over
        checkGameOver();
        return;
    }
    
    // Start next trick
    setTimeout(() => {
        currentTrick = [];
        startTrick();
    }, 1000);
}

function playAICard() {
    const hand = hands[currentPlayer];
    const isLead = currentTrick.length === 0;
    const playableCards = hand.filter(card => canPlayCard(card, hand, isLead));
    
    if (playableCards.length === 0) {
        // Must play something
        playCard(hand[0], currentPlayer);
        return;
    }
    
    // Simple AI: play lowest card, avoid taking tricks with points
    let cardToPlay = playableCards[0];
    
    if (!isLead) {
        // Try to avoid winning trick
        const leadSuit = currentTrick[0].card.suit;
        const suitCards = playableCards.filter(c => c.suit === leadSuit);
        if (suitCards.length > 0) {
            // Play lowest of suit
            const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            cardToPlay = suitCards.reduce((lowest, card) => {
                return rankOrder.indexOf(card.rank) < rankOrder.indexOf(lowest.rank) ? card : lowest;
            });
        }
    } else {
        // Lead: play lowest non-point card if possible
        const safeCards = playableCards.filter(c => c.suit !== 'hearts' && !(c.suit === 'spades' && c.rank === 'Q'));
        if (safeCards.length > 0) {
            const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            cardToPlay = safeCards.reduce((lowest, card) => {
                return rankOrder.indexOf(card.rank) < rankOrder.indexOf(lowest.rank) ? card : lowest;
            });
        }
    }
    
    playCard(cardToPlay, currentPlayer);
}

function checkGameOver() {
    // Game ends when someone reaches 100 points
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore >= 100) {
        const winner = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b);
        alert(`Game Over! ${winner.toUpperCase()} wins with ${scores[winner]} points (lowest score wins)!`);
        newGame();
    } else {
        // Start new round
        initGame();
    }
}

function updateDisplay() {
    // Update scores
    document.getElementById('score-player').textContent = scores.south;
    document.getElementById('score-north').textContent = scores.north;
    document.getElementById('score-east').textContent = scores.east;
    document.getElementById('score-west').textContent = scores.west;
    
    // Update player areas
    ['south', 'north', 'east', 'west'].forEach(player => {
        const area = document.getElementById('player-' + player);
        const handEl = document.getElementById('hand-' + player);
        handEl.innerHTML = '';
        
        if (currentPlayer === player && !passingPhase) {
            area.classList.add('active');
        } else {
            area.classList.remove('active');
        }
        
        hands[player].forEach(card => {
            const cardEl = createCardElement(card, player);
            if (player === 'south' && selectedCards.includes(card)) {
                cardEl.classList.add('selected');
            }
            handEl.appendChild(cardEl);
        });
    });
    
    // Update trick area
    const trickEl = document.getElementById('trick-area');
    trickEl.innerHTML = '';
    const positions = { south: 'bottom', north: 'top', east: 'right', west: 'left' };
    currentTrick.forEach(({ card, player }) => {
        const cardEl = createCardElement(card, player, true);
        cardEl.style.gridArea = positions[player];
        trickEl.appendChild(cardEl);
    });
    
    // Update pass button
    const passBtn = document.getElementById('pass-btn');
    if (passingPhase && passDirection !== 'none') {
        passBtn.style.display = 'inline-block';
        document.getElementById('status').textContent = `Pass ${passDirection === 'left' ? 'left' : passDirection === 'right' ? 'right' : 'across'} (select 3 cards)`;
    } else {
        passBtn.style.display = 'none';
    }
}

function createCardElement(card, player, inTrick = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if (player === 'south' || inTrick) {
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
        
        if (player === 'south' && !inTrick) {
            cardEl.onclick = () => playCard(card, player);
        }
    } else {
        cardEl.classList.add('back');
        cardEl.innerHTML = '<div style="font-size: 30px; text-align: center;">*</div>';
    }
    
    return cardEl;
}

function newGame() {
    scores = { south: 0, north: 0, east: 0, west: 0 };
    initGame();
}

// Initialize on load
window.addEventListener('load', () => {
    initGame();
});

