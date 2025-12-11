// Baccarat Game
// **Timestamp**: 2025-12-02

let deck = [];
let playerHand = [];
let bankerHand = [];
let bankroll = 1000;
let currentBet = 10;
let selectedBet = null;
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
    // In Baccarat: A=1, 2-9=face value, 10/J/Q/K=0
    if (['10', 'J', 'Q', 'K'].includes(card.rank)) return 0;
    if (card.rank === 'A') return 1;
    return parseInt(card.rank);
}

function getHandValue(hand) {
    let total = 0;
    for (let card of hand) {
        total += getCardValue(card);
    }
    return total % 10; // Baccarat uses modulo 10
}

function dealCard(hand) {
    if (deck.length === 0) {
        deck = createDeck();
    }
    const card = deck.pop();
    hand.push(card);
    return card;
}

function renderCard(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    cardEl.classList.add(isRed ? 'red' : 'black');
    cardEl.textContent = `${card.rank}${card.suit}`;
    
    return cardEl;
}

function renderHands() {
    const playerCardsEl = document.getElementById('playerCards');
    const bankerCardsEl = document.getElementById('bankerCards');
    const playerValueEl = document.getElementById('playerValue');
    const bankerValueEl = document.getElementById('bankerValue');
    
    playerCardsEl.innerHTML = '';
    bankerCardsEl.innerHTML = '';
    
    playerHand.forEach(card => {
        playerCardsEl.appendChild(renderCard(card));
    });
    
    bankerHand.forEach(card => {
        bankerCardsEl.appendChild(renderCard(card));
    });
    
    playerValueEl.textContent = `Value: ${getHandValue(playerHand)}`;
    bankerValueEl.textContent = `Value: ${getHandValue(bankerHand)}`;
}

function selectBet(betType) {
    if (gameActive) return;
    
    selectedBet = betType;
    
    // Update button styles
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function deal() {
    if (gameActive || !selectedBet) {
        if (!selectedBet) {
            updateStatus('Please select a bet first!');
        }
        return;
    }
    
    const betInput = document.getElementById('betAmount');
    currentBet = parseInt(betInput.value) || 10;
    
    if (currentBet < 1 || currentBet > bankroll) {
        updateStatus('Invalid bet amount!');
        return;
    }
    
    bankroll -= currentBet;
    updateBankroll();
    
    gameActive = true;
    document.getElementById('dealBtn').disabled = true;
    
    deck = createDeck();
    playerHand = [];
    bankerHand = [];
    
    // Deal initial two cards to each
    dealCard(playerHand);
    dealCard(bankerHand);
    dealCard(playerHand);
    dealCard(bankerHand);
    
    renderHands();
    
    // Baccarat rules: Third card may be drawn
    const playerValue = getHandValue(playerHand);
    const bankerValue = getHandValue(bankerHand);
    
    // Player draws third card if value is 0-5
    if (playerValue <= 5) {
        dealCard(playerHand);
    }
    
    // Banker draws third card based on complex rules
    const finalPlayerValue = getHandValue(playerHand);
    const playerDrewThird = playerHand.length === 3;
    const playerThirdCardValue = playerDrewThird ? getCardValue(playerHand[2]) : -1;
    
    if (bankerValue <= 2) {
        dealCard(bankerHand);
    } else if (bankerValue === 3 && playerDrewThird && playerThirdCardValue !== 8) {
        dealCard(bankerHand);
    } else if (bankerValue === 4 && playerDrewThird && playerThirdCardValue >= 2 && playerThirdCardValue <= 7) {
        dealCard(bankerHand);
    } else if (bankerValue === 5 && playerDrewThird && playerThirdCardValue >= 4 && playerThirdCardValue <= 7) {
        dealCard(bankerHand);
    } else if (bankerValue === 6 && playerDrewThird && (playerThirdCardValue === 6 || playerThirdCardValue === 7)) {
        dealCard(bankerHand);
    }
    
    renderHands();
    
    // Determine winner
    const finalPlayerValue2 = getHandValue(playerHand);
    const finalBankerValue = getHandValue(bankerHand);
    
    let winner = null;
    let payout = 0;
    
    if (finalPlayerValue2 > finalBankerValue) {
        winner = 'player';
        if (selectedBet === 'player') {
            payout = currentBet * 2;
        }
    } else if (finalBankerValue > finalPlayerValue2) {
        winner = 'banker';
        if (selectedBet === 'banker') {
            payout = Math.floor(currentBet * 1.95); // 5% commission
        }
    } else {
        winner = 'tie';
        if (selectedBet === 'tie') {
            payout = currentBet * 9;
        } else {
            // Push on player/banker bets when tie
            payout = currentBet;
        }
    }
    
    bankroll += payout;
    updateBankroll();
    
    let message = `Player: ${finalPlayerValue2}, Banker: ${finalBankerValue} - `;
    if (winner === 'tie') {
        message += 'Tie!';
    } else {
        message += `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
    }
    
    if (payout > currentBet) {
        message += ` You win $${payout}!`;
    } else if (payout === currentBet && winner === 'tie') {
        message += ' Push - bet returned.';
    } else {
        message += ' You lose.';
    }
    
    updateStatus(message);
    
    gameActive = false;
    document.getElementById('dealBtn').disabled = false;
    selectedBet = null;
    
    // Clear selection
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (bankroll <= 0) {
        setTimeout(() => {
            if (confirm('You\'re out of money! Start over with $1000?')) {
                newGame();
            }
        }, 1000);
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
    selectedBet = null;
    playerHand = [];
    bankerHand = [];
    gameActive = false;
    updateBankroll();
    updateStatus('Place your bet and deal!');
    document.getElementById('betAmount').value = 10;
    document.getElementById('dealBtn').disabled = false;
    renderHands();
    
    // Clear selection
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Initialize
renderHands();

