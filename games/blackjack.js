// Blackjack (21) Game
// **Timestamp**: 2025-12-02

let deck = [];
let playerHand = [];
let dealerHand = [];
let bankroll = 1000;
let currentBet = 10;
let gameActive = false;

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
    const newDeck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            newDeck.push({ suit, rank });
        }
    }
    return shuffleDeck(newDeck);
}

function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getCardValue(card) {
    if (card.rank === 'A') return 11;
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    return parseInt(card.rank);
}

function getHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.rank === 'A') {
            aces++;
            value += 11;
        } else {
            value += getCardValue(card);
        }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    
    return value;
}

function dealCard(hand) {
    if (deck.length === 0) {
        deck = createDeck();
    }
    const card = deck.pop();
    hand.push(card);
    return card;
}

function renderCard(card, isHidden = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if (isHidden) {
        cardEl.classList.add('back');
        cardEl.textContent = '🂠';
    } else {
        const isRed = card.suit === '♥' || card.suit === '♦';
        cardEl.classList.add(isRed ? 'red' : 'black');
        cardEl.textContent = `${card.rank}${card.suit}`;
    }
    
    return cardEl;
}

function renderHands() {
    const dealerCardsEl = document.getElementById('dealerCards');
    const playerCardsEl = document.getElementById('playerCards');
    const dealerValueEl = document.getElementById('dealerValue');
    const playerValueEl = document.getElementById('playerValue');
    
    dealerCardsEl.innerHTML = '';
    playerCardsEl.innerHTML = '';
    
    // Render dealer hand (hide first card if game active)
    dealerHand.forEach((card, index) => {
        const isHidden = gameActive && index === 0 && dealerHand.length === 2;
        dealerCardsEl.appendChild(renderCard(card, isHidden));
    });
    
    // Render player hand
    playerHand.forEach(card => {
        playerCardsEl.appendChild(renderCard(card));
    });
    
    // Update values
    const playerValue = getHandValue(playerHand);
    playerValueEl.textContent = `Value: ${playerValue}`;
    
    if (gameActive && dealerHand.length === 2) {
        dealerValueEl.textContent = `Value: ${getCardValue(dealerHand[1])}+`;
    } else {
        dealerValueEl.textContent = `Value: ${getHandValue(dealerHand)}`;
    }
}

function dealCards() {
    const betInput = document.getElementById('betAmount');
    currentBet = parseInt(betInput.value) || 10;
    
    if (currentBet < 1 || currentBet > bankroll) {
        updateStatus('Invalid bet amount!');
        return;
    }
    
    bankroll -= currentBet;
    updateBankroll();
    
    deck = createDeck();
    playerHand = [];
    dealerHand = [];
    
    // Deal initial cards
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);
    
    gameActive = true;
    updateStatus('Your turn! Hit or Stand?');
    
    // Check for blackjack
    if (getHandValue(playerHand) === 21) {
        if (getHandValue(dealerHand) === 21) {
            endGame('Push! Both have Blackjack!');
        } else {
            endGame('Blackjack! You win!');
            bankroll += currentBet * 2.5; // Blackjack pays 3:2
        }
        return;
    }
    
    renderHands();
    updateControls();
}

function hit() {
    if (!gameActive) return;
    
    dealCard(playerHand);
    renderHands();
    
    const playerValue = getHandValue(playerHand);
    
    if (playerValue > 21) {
        endGame('Bust! You lose!');
    } else if (playerValue === 21) {
        stand();
    }
}

function stand() {
    if (!gameActive) return;
    
    // Dealer plays
    while (getHandValue(dealerHand) < 17) {
        dealCard(dealerHand);
    }
    
    renderHands();
    
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endGame('Dealer busts! You win!');
        bankroll += currentBet * 2;
    } else if (dealerValue > playerValue) {
        endGame('Dealer wins!');
    } else if (dealerValue < playerValue) {
        endGame('You win!');
        bankroll += currentBet * 2;
    } else {
        endGame('Push! It\'s a tie!');
        bankroll += currentBet;
    }
}

function doubleDown() {
    if (!gameActive || playerHand.length !== 2) return;
    if (currentBet > bankroll) {
        updateStatus('Not enough money to double!');
        return;
    }
    
    bankroll -= currentBet;
    currentBet *= 2;
    updateBankroll();
    
    dealCard(playerHand);
    renderHands();
    
    const playerValue = getHandValue(playerHand);
    
    if (playerValue > 21) {
        endGame('Bust! You lose!');
    } else {
        stand();
    }
}

function endGame(message) {
    gameActive = false;
    updateStatus(message);
    updateControls();
    
    if (bankroll <= 0) {
        setTimeout(() => {
            if (confirm('You\'re out of money! Start over with $1000?')) {
                newGame();
            }
        }, 1000);
    }
}

function updateControls() {
    const dealBtn = document.getElementById('dealBtn');
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const doubleBtn = document.getElementById('doubleBtn');
    const betInput = document.getElementById('betAmount');
    
    if (gameActive) {
        dealBtn.disabled = true;
        hitBtn.disabled = false;
        standBtn.disabled = false;
        doubleBtn.disabled = playerHand.length !== 2 || currentBet > bankroll;
        betInput.disabled = true;
    } else {
        dealBtn.disabled = false;
        hitBtn.disabled = true;
        standBtn.disabled = true;
        doubleBtn.disabled = true;
        betInput.disabled = false;
    }
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateBankroll() {
    document.getElementById('bankroll').textContent = bankroll;
}

function newGame() {
    bankroll = 1000;
    currentBet = 10;
    playerHand = [];
    dealerHand = [];
    gameActive = false;
    updateBankroll();
    updateStatus('Place your bet and click Deal!');
    document.getElementById('betAmount').value = 10;
    renderHands();
    updateControls();
}

// Initialize
updateControls();
renderHands();

