// Contract Bridge Implementation
// **Timestamp**: 2025-12-03

const SUITS = ['♣', '♦', '♥', '♠'];
const SUIT_NAMES = ['clubs', 'diamonds', 'hearts', 'spades'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

let hands = {north: [], south: [], east: [], west: []};
let currentBidder = 'south';
let bids = [];
let contract = null;
let declarer = null;
let trump = null;
let currentTrick = [];
let tricksWon = {ns: 0, ew: 0};
let currentPlayer = 'west'; // Player to left of dealer starts
let phase = 'bidding';
let aiEnabled = true;

function newGame() {
    // Deal cards
    const deck = createDeck();
    shuffle(deck);
    
    hands = {
        north: deck.slice(0, 13),
        south: deck.slice(13, 26),
        east: deck.slice(26, 39),
        west: deck.slice(39, 52)
    };
    
    // Sort hands
    Object.keys(hands).forEach(player => {
        hands[player].sort((a, b) => {
            if (a.suitIndex !== b.suitIndex) return b.suitIndex - a.suitIndex;
            return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
        });
    });
    
    currentBidder = 'south';
    bids = [];
    contract = null;
    declarer = null;
    trump = null;
    currentTrick = [];
    tricksWon = {ns: 0, ew: 0};
    phase = 'bidding';
    
    renderBidding();
    updateStatus();
}

function createDeck() {
    const deck = [];
    for (let suitIndex = 0; suitIndex < 4; suitIndex++) {
        for (const rank of RANKS) {
            deck.push({
                suit: SUITS[suitIndex],
                suitName: SUIT_NAMES[suitIndex],
                suitIndex: suitIndex,
                rank: rank,
                value: RANK_VALUES[rank]
            });
        }
    }
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderBidding() {
    const biddingPhase = document.getElementById('biddingPhase');
    const playPhase = document.getElementById('playPhase');
    
    biddingPhase.style.display = 'block';
    playPhase.style.display = 'none';
    
    // Create bid grid
    const bidGrid = document.getElementById('bidGrid');
    bidGrid.innerHTML = '';
    
    const levels = [1, 2, 3, 4, 5, 6, 7];
    const suits = ['♣', '♦', '♥', '♠', 'NT'];
    
    levels.forEach(level => {
        suits.forEach((suit, index) => {
            const btn = document.createElement('button');
            btn.className = 'bid-button';
            btn.textContent = `${level}${suit}`;
            btn.onclick = () => makeBid(`${level}${suit}`);
            
            if (index < 2) btn.style.color = '#000';
            else if (index < 4) btn.style.color = '#D32F2F';
            
            bidGrid.appendChild(btn);
        });
    });
}

function makeBid(bid) {
    bids.push({player: currentBidder, bid: bid});
    
    document.getElementById('currentBid').textContent = 
        `${currentBidder.toUpperCase()}: ${bid}`;
    
    // Check if bidding is over (3 passes after a bid)
    if (bid !== 'pass') {
        contract = bid;
        declarer = currentBidder;
    }
    
    const lastThree = bids.slice(-3);
    if (lastThree.length === 3 && lastThree.every(b => b.bid === 'pass') && contract) {
        // Bidding is over!
        startPlay();
        return;
    }
    
    // Next bidder
    const order = ['south', 'west', 'north', 'east'];
    const currentIndex = order.indexOf(currentBidder);
    currentBidder = order[(currentIndex + 1) % 4];
    
    // AI bid if needed
    if (currentBidder !== 'south' && aiEnabled) {
        setTimeout(getAIBid, 1000);
    }
}

function getAIBid() {
    // Simple AI bidding (evaluates hand strength)
    const hand = hands[currentBidder];
    const hcp = evaluateHCP(hand);
    
    // Simple bidding logic
    if (hcp < 12 || Math.random() < 0.3) {
        makeBid('pass');
    } else {
        // Find longest suit
        const suitCounts = [0, 0, 0, 0];
        hand.forEach(card => suitCounts[card.suitIndex]++);
        const longestSuit = suitCounts.indexOf(Math.max(...suitCounts));
        
        const level = Math.min(7, Math.floor(hcp / 5));
        const suit = SUITS[longestSuit];
        makeBid(`${level}${suit}`);
    }
}

function evaluateHCP(hand) {
    // High Card Points: A=4, K=3, Q=2, J=1
    let points = 0;
    hand.forEach(card => {
        if (card.rank === 'A') points += 4;
        else if (card.rank === 'K') points += 3;
        else if (card.rank === 'Q') points += 2;
        else if (card.rank === 'J') points += 1;
    });
    return points;
}

function startPlay() {
    phase = 'play';
    
    // Parse contract
    const level = parseInt(contract[0]);
    const suitStr = contract.slice(1);
    
    trump = suitStr === 'NT' ? null : suitStr;
    
    document.getElementById('biddingPhase').style.display = 'none';
    document.getElementById('playPhase').style.display = 'block';
    
    document.getElementById('contractDisplay').textContent = 
        `Contract: ${contract} by ${declarer.toUpperCase()} | Trump: ${trump || 'No Trump'}`;
    
    // Player to left of declarer leads
    const order = ['south', 'west', 'north', 'east'];
    const declarerIndex = order.indexOf(declarer);
    currentPlayer = order[(declarerIndex + 1) % 4];
    
    renderPlay();
    updateStatus();
    
    // If AI starts, make move
    if (currentPlayer !== 'south' && aiEnabled) {
        setTimeout(getAIPlay, 1000);
    }
}

function renderPlay() {
    // Render all hands
    renderHand('south', document.getElementById('southHand'), true);
    renderHand('north', document.getElementById('northHand'), false);
    renderHand('east', document.getElementById('eastHand'), false);
    renderHand('west', document.getElementById('westHand'), false);
}

function renderHand(player, container, showCards) {
    container.innerHTML = '';
    
    hands[player].forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.suitName}`;
        
        if (showCards) {
            cardElement.textContent = card.rank + card.suit;
            cardElement.onclick = () => playCard(player, index);
        } else {
            cardElement.textContent = '🂠';
            cardElement.style.background = '#4682B4';
        }
        
        container.appendChild(cardElement);
    });
}

function playCard(player, cardIndex) {
    if (player !== currentPlayer || phase !== 'play') return;
    
    const card = hands[player][cardIndex];
    
    // Validate play (must follow suit if possible)
    if (currentTrick.length > 0) {
        const ledSuit = currentTrick[0].card.suitName;
        const hasSuit = hands[player].some(c => c.suitName === ledSuit);
        
        if (hasSuit && card.suitName !== ledSuit) {
            alert('Must follow suit!');
            return;
        }
    }
    
    // Play the card
    hands[player].splice(cardIndex, 1);
    currentTrick.push({player, card});
    
    renderPlayedCards();
    
    if (currentTrick.length === 4) {
        // Trick complete
        setTimeout(evaluateTrick, 1500);
    } else {
        // Next player
        const order = ['south', 'west', 'north', 'east'];
        const currentIndex = order.indexOf(currentPlayer);
        currentPlayer = order[(currentIndex + 1) % 4];
        
        renderPlay();
        updateStatus();
        
        // AI play
        if (currentPlayer !== 'south' && aiEnabled) {
            setTimeout(getAIPlay, 1000);
        }
    }
}

function getAIPlay() {
    if (phase !== 'play') return;
    
    const hand = hands[currentPlayer];
    if (hand.length === 0) return;
    
    let cardIndex = 0;
    
    // Simple AI: Follow suit, play low if losing, high if winning
    if (currentTrick.length > 0) {
        const ledSuit = currentTrick[0].card.suitName;
        const suitCards = hand.map((c, i) => ({card: c, index: i}))
            .filter(item => item.card.suitName === ledSuit);
        
        if (suitCards.length > 0) {
            // Follow suit - play middle card
            cardIndex = suitCards[Math.floor(suitCards.length / 2)].index;
        } else {
            // Can't follow - discard lowest
            cardIndex = hand.length - 1;
        }
    } else {
        // Leading - play middle card
        cardIndex = Math.floor(hand.length / 2);
    }
    
    playCard(currentPlayer, cardIndex);
}

function renderPlayedCards() {
    const centerArea = document.getElementById('centerArea');
    centerArea.innerHTML = '';
    
    const positions = {south: '0px, 80px', west: '-80px, 0px', north: '0px, -80px', east: '80px, 0px'};
    
    currentTrick.forEach(({player, card}) => {
        const cardElement = document.createElement('div');
        cardElement.className = `card played-card ${card.suitName}`;
        cardElement.textContent = card.rank + card.suit;
        cardElement.style.transform = `translate(${positions[player]})`;
        centerArea.appendChild(cardElement);
    });
}

function evaluateTrick() {
    const ledSuit = currentTrick[0].card.suitName;
    let winner = currentTrick[0];
    
    currentTrick.forEach(play => {
        // Trump beats everything
        if (trump && play.card.suit === trump && winner.card.suit !== trump) {
            winner = play;
        }
        // Higher trump beats lower trump
        else if (trump && play.card.suit === trump && winner.card.suit === trump) {
            if (play.card.value > winner.card.value) winner = play;
        }
        // Must follow suit
        else if (play.card.suitName === ledSuit && winner.card.suitName === ledSuit) {
            if (play.card.value > winner.card.value) winner = play;
        }
    });
    
    // Award trick
    if (winner.player === 'north' || winner.player === 'south') {
        tricksWon.ns++;
    } else {
        tricksWon.ew++;
    }
    
    document.getElementById('tricksWon').textContent = 
        `North-South: ${tricksWon.ns} tricks | East-West: ${tricksWon.ew} tricks`;
    
    // Winner leads next trick
    currentPlayer = winner.player;
    currentTrick = [];
    
    // Check if hand is over
    if (hands.south.length === 0) {
        endHand();
    } else {
        renderPlay();
        renderPlayedCards();
        
        if (currentPlayer !== 'south' && aiEnabled) {
            setTimeout(getAIPlay, 1000);
        }
    }
}

function endHand() {
    const contractLevel = parseInt(contract[0]);
    const tricksNeeded = 6 + contractLevel;
    
    const declarerPair = (declarer === 'north' || declarer === 'south') ? 'ns' : 'ew';
    const made = tricksWon[declarerPair] >= tricksNeeded;
    
    const result = made ? 
        `Contract MADE! ${tricksWon[declarerPair]} tricks (needed ${tricksNeeded})` :
        `Contract FAILED! Only ${tricksWon[declarerPair]} tricks (needed ${tricksNeeded})`;
    
    setTimeout(() => {
        alert(`Hand Complete!\n\n${result}\n\nScoring in Bridge is complex - see rules for details!`);
    }, 100);
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    
    if (aiEnabled) {
        btn.textContent = '🤖 AI Partners ON';
        btn.style.background = 'rgba(76, 175, 80, 0.3)';
    } else {
        btn.textContent = '👥 All Human';
        btn.style.background = '';
    }
}

function updateStatus() {
    let statusText = '';
    
    if (phase === 'bidding') {
        statusText = `Bidding: ${currentBidder.toUpperCase()} to bid`;
    } else {
        statusText = `Playing: ${currentPlayer.toUpperCase()}'s turn`;
    }
    
    document.getElementById('status').textContent = statusText;
}

// Initialize
newGame();

