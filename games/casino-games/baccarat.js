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
                <path d="M17 28 L17 48 M17 38 L27 28 M17 38 L27 48" stroke="${fill}" stroke-width="2" stroke-linecap="round" fill="none"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
        case 'Q':
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <path d="M10 20 L12 12 L17 17 L20 8 L23 17 L28 12 L30 20 L30 25 L10 25 Z" fill="${fill}" stroke="${fill}" stroke-width="1"/>
                <circle cx="12" cy="15" r="1.5" fill="${fill}"/>
                <circle cx="20" cy="11" r="1.8" fill="${fill}"/>
                <circle cx="28" cy="15" r="1.5" fill="${fill}"/>
                <circle cx="20" cy="35" r="5" stroke="${fill}" stroke-width="2" fill="none"/>
                <path d="M23 38 L26 42" stroke="${fill}" stroke-width="2" stroke-linecap="round"/>
                <g transform="translate(15, 55)">${suitSVG}</g>
            </svg>`;
            break;
        case 'J':
            // Jack - young man in profile (smaller version for 50x70 cards)
            faceSVG = `<svg width="50" height="70" viewBox="0 0 50 70" style="display: block;">
                <!-- Jack's hat/feather -->
                <path d="M22 10 Q25 8 28 10 L29 12 Q26 13 24 12 Z" fill="${fill}"/>
                <!-- Jack's face (profile) -->
                <circle cx="25" cy="16" r="3" fill="${fill}"/>
                <!-- Jack's eye -->
                <circle cx="26.5" cy="15.5" r="0.6" fill="white"/>
                <!-- Jack's nose -->
                <path d="M27.5 15.5 L29 17" stroke="${fill}" stroke-width="0.8" stroke-linecap="round"/>
                <!-- Jack's mouth -->
                <path d="M27 18.5 Q27.8 19 28.5 18.5" stroke="${fill}" stroke-width="0.8" fill="none"/>
                <!-- Jack's ruff/collar -->
                <path d="M18 20 Q21 22 25 20 Q29 22 32 20" stroke="${fill}" stroke-width="1.5" fill="none"/>
                <!-- Jack's tunic/coat -->
                <path d="M20 22 L30 22 L29 32 L21 32 Z" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>
                <!-- Jack's belt -->
                <path d="M20 25 L30 25" stroke="${fill}" stroke-width="1.5"/>
                <!-- Jack's trousers -->
                <path d="M21 32 L25 42 L23 42 Z" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>
                <path d="M29 32 L25 42 L27 42 Z" fill="${fill}" stroke="${fill}" stroke-width="0.8"/>
                <!-- Jack's boots -->
                <ellipse cx="22.5" cy="44" rx="2" ry="1.5" fill="${fill}"/>
                <ellipse cx="27.5" cy="44" rx="2" ry="1.5" fill="${fill}"/>
                <!-- Suit symbol -->
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

function renderCard(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    const isRed = card.suit === '♥' || card.suit === '♦';
    cardEl.classList.add(isRed ? 'red' : 'black');

    const color = isRed ? 'red' : 'black';
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
    if (event && event.target) { event.target.classList.add('selected'); };
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


