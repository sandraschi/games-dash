// Schnapsen Game Implementation (Austrian Card Game)
// **Timestamp**: 2025-12-04

let deck = [];
let playerHand = [];
let aiHand = [];
let talon = [];
let trumpCard = null;
let playerPoints = 0;
let aiPoints = 0;
let playerGameScore = 0;
let aiGameScore = 0;
let talonClosed = false;
let currentTrick = [];
let leadPlayer = 'player';
let gameActive = false;

const RANKS = ['A', '10', 'K', 'Q', 'J'];
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = {A: 11, '10': 10, K: 4, Q: 3, J: 2};

function createDeck() {
    const deck = [];
    RANKS.forEach(rank => {
        SUITS.forEach(suit => {
            deck.push({rank, suit, value: VALUES[rank]});
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

function newGame() {
    deck = createDeck();
    shuffle(deck);
    
    playerHand = deck.splice(0, 5);
    aiHand = deck.splice(0, 5);
    trumpCard = deck.pop();
    talon = deck;
    
    playerPoints = 0;
    aiPoints = 0;
    talonClosed = false;
    currentTrick = [];
    leadPlayer = 'player';
    gameActive = true;
    
    renderAll();
    updateStatus('Your turn! Play a card.');
    document.getElementById('talonBtn').disabled = false;
}

function renderAll() {
    renderPlayerHand();
    renderTrumpCard();
    renderPlayArea();
    updateScores();
}

function renderPlayerHand() {
    const handElement = document.getElementById('playerHand');
    handElement.innerHTML = '';
    
    playerHand.forEach((card, index) => {
        const cardElement = createCardElement(card);
        cardElement.onclick = () => playCard(index, 'player');
        handElement.appendChild(cardElement);
    });
}

function renderTrumpCard() {
    const trumpElement = document.getElementById('trumpCard');
    if (trumpCard) {
        const color = (trumpCard.suit === '♥' || trumpCard.suit === '♦') ? '#FF0000' : '#000000';
        trumpElement.innerHTML = `
            <div style="font-size: 24px;">${trumpCard.rank}</div>
            <div style="font-size: 28px; color: ${color}">${trumpCard.suit}</div>
        `;
    }
    
    document.getElementById('talonCount').textContent = `Talon: ${talon.length}${talonClosed ? ' (CLOSED)' : ''}`;
}

function renderPlayArea() {
    const playArea = document.getElementById('playedCards');
    playArea.innerHTML = '';
    
    currentTrick.forEach(played => {
        const cardElement = createCardElement(played.card);
        playArea.appendChild(cardElement);
    });
}

function createCardElement(card) {
    const div = document.createElement('div');
    div.className = 'card';
    
    const color = (card.suit === '♥' || card.suit === '♦') ? '#FF0000' : '#000000';
    
    div.innerHTML = `
        <div class="card-rank" style="color: ${color}">${card.rank}</div>
        <div class="card-suit" style="color: ${color}">${card.suit}</div>
        <div class="card-rank" style="color: ${color}">${card.rank}</div>
        <div class="card-value">${card.value}</div>
    `;
    
    return div;
}

function playCard(index, player) {
    if (!gameActive) return;
    if (player === 'player' && leadPlayer !== 'player') return;
    
    const hand = player === 'player' ? playerHand : aiHand;
    const card = hand[index];
    
    currentTrick.push({player, card});
    hand.splice(index, 1);
    
    renderAll();
    
    if (currentTrick.length === 2) {
        // Evaluate trick
        setTimeout(evaluateTrick, 1500);
    } else {
        // AI's turn
        if (player === 'player') {
            setTimeout(aiTurn, 1000);
        }
    }
}

function aiTurn() {
    if (aiHand.length === 0) return;
    
    // Simple AI: Play highest card if leading, lowest if following
    let cardIndex = 0;
    
    if (currentTrick.length === 0) {
        // Leading - play highest
        cardIndex = aiHand.reduce((maxIdx, card, idx, arr) => 
            card.value > arr[maxIdx].value ? idx : maxIdx, 0);
    } else {
        // Following - play lowest
        cardIndex = aiHand.reduce((minIdx, card, idx, arr) => 
            card.value < arr[minIdx].value ? idx : minIdx, 0);
    }
    
    playCard(cardIndex, 'ai');
}

function evaluateTrick() {
    const [first, second] = currentTrick;
    
    // Determine winner (simplified trump logic)
    let winner = first.player;
    
    if (first.card.suit === second.card.suit) {
        // Same suit - higher value wins
        winner = second.card.value > first.card.value ? second.player : first.player;
    } else if (second.card.suit === trumpCard.suit) {
        // Second card is trump
        winner = second.player;
    } else if (first.card.suit === trumpCard.suit) {
        // First card is trump
        winner = first.player;
    }
    
    // Award points
    const trickPoints = first.card.value + second.card.value;
    
    if (winner === 'player') {
        playerPoints += trickPoints;
        leadPlayer = 'player';
        updateStatus(`You won the trick! +${trickPoints} points`);
    } else {
        aiPoints += trickPoints;
        leadPlayer = 'ai';
        updateStatus(`AI won the trick! +${trickPoints} points`);
    }
    
    currentTrick = [];
    
    // Draw cards if talon available
    if (!talonClosed && talon.length > 0) {
        if (winner === 'player') {
            playerHand.push(talon.shift());
            if (talon.length > 0) aiHand.push(talon.shift());
        } else {
            aiHand.push(talon.shift());
            if (talon.length > 0) playerHand.push(talon.shift());
        }
    }
    
    renderAll();
    
    // Check round end
    if (playerPoints >= 66) {
        endRound('player');
    } else if (aiPoints >= 66) {
        endRound('ai');
    } else if (playerHand.length === 0) {
        endRound(playerPoints > aiPoints ? 'player' : 'ai');
    } else if (leadPlayer === 'ai') {
        setTimeout(aiTurn, 1000);
    }
}

function closeTalon() {
    talonClosed = true;
    document.getElementById('talonBtn').disabled = true;
    updateStatus('Talon closed! Must follow suit now!');
    renderTrumpCard();
}

function endRound(winner) {
    const loserPoints = winner === 'player' ? aiPoints : playerPoints;
    
    let gamePoints = 3; // Normal win
    if (loserPoints === 0) gamePoints = 3; // Schneider
    if (loserPoints < 33) gamePoints = 2; // Almost schneider
    else gamePoints = 1; // Normal
    
    if (winner === 'player') {
        playerGameScore += gamePoints;
    } else {
        aiGameScore += gamePoints;
    }
    
    updateStatus(`${winner === 'player' ? 'YOU' : 'AI'} won the round! +${gamePoints} game points`);
    
    if (playerGameScore >= 7) {
        updateStatus('🎉 YOU WIN THE GAME! (7 game points)');
        gameActive = false;
    } else if (aiGameScore >= 7) {
        updateStatus('AI WINS THE GAME! (7 game points)');
        gameActive = false;
    } else {
        setTimeout(newGame, 3000);
    }
}

function updateScores() {
    document.getElementById('playerPoints').textContent = playerPoints;
    document.getElementById('aiPoints').textContent = aiPoints;
    document.getElementById('playerGameScore').textContent = `Game Score: ${playerGameScore}/7`;
    document.getElementById('aiGameScore').textContent = `Game Score: ${aiGameScore}/7`;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
updateScores();

