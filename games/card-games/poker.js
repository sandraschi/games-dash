// Texas Hold'em Poker
// **Timestamp**: 2025-12-03

const canvas = document.getElementById('pokerCanvas');
const ctx = canvas.getContext('2d');

let deck, playerHand, aiHand, communityCards;
let pot = 0, playerChips = 1000, aiChips = 1000;
let currentBet = 0, playerBet = 0, aiBet = 0;
let gamePhase = 'preflop'; // preflop, flop, turn, river, showdown

function startGame() {
    deck = new Deck();
    deck.shuffle();
    
    playerHand = new Hand('player');
    aiHand = new Hand('ai');
    communityCards = [];
    
    pot = 0;
    currentBet = 20;
    playerBet = 10; // Small blind
    aiBet = 20; // Big blind
    
    playerChips -= 10;
    aiChips -= 20;
    pot = 30;
    
    // Deal hole cards
    for (let i = 0; i < 2; i++) {
        playerHand.add(deck.draw());
        aiHand.add(deck.draw());
    }
    
    gamePhase = 'preflop';
    render();
    updateInfo();
}

function render() {
    ctx.fillStyle = '#0D5C26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw table
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(50, 100, 800, 400);
    
    // Draw community cards
    communityCards.forEach((card, i) => {
        drawCard(card, 300 + i * 70, 250, true);
    });
    
    // Draw player hand
    playerHand.cards.forEach((card, i) => {
        drawCard(card, 350 + i * 80, 480, true);
    });
    
    // Draw AI hand (face down)
    aiHand.cards.forEach((card, i) => {
        drawCard(card, 350 + i * 80, 50, false);
    });
    
    // Draw pot
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Pot: $${pot}`, 450, 300);
}

function drawCard(card, x, y, faceUp) {
    const w = 60, h = 90;
    
    // Card background
    ctx.fillStyle = faceUp ? '#FFF' : '#1a4d2e';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    
    if (faceUp) {
        ctx.fillStyle = card.color === 'red' ? '#d32f2f' : '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.rank, x + w/2, y + 25);
        ctx.font = '18px Arial';
        ctx.fillText(card.symbol, x + w/2, y + 50);
    }
}

function call() {
    const toCall = currentBet - playerBet;
    if (playerChips >= toCall) {
        playerChips -= toCall;
        playerBet += toCall;
        pot += toCall;
        nextPhase();
    }
}

function raise() {
    const raiseAmount = 50;
    const total = (currentBet - playerBet) + raiseAmount;
    if (playerChips >= total) {
        playerChips -= total;
        playerBet += total;
        pot += total;
        currentBet = playerBet;
        aiTurn();
    }
}

function fold() {
    alert('You folded. AI wins pot of $' + pot);
    aiChips += pot;
    setTimeout(startGame, 1000);
}

function nextPhase() {
    if (gamePhase === 'preflop') {
        // Deal flop
        for (let i = 0; i < 3; i++) {
            communityCards.push(deck.draw());
        }
        gamePhase = 'flop';
    } else if (gamePhase === 'flop') {
        communityCards.push(deck.draw());
        gamePhase = 'turn';
    } else if (gamePhase === 'turn') {
        communityCards.push(deck.draw());
        gamePhase = 'river';
    } else if (gamePhase === 'river') {
        showdown();
        return;
    }
    
    currentBet = 0;
    playerBet = 0;
    aiBet = 0;
    render();
    updateInfo();
}

function aiTurn() {
    // Improved AI with hand strength evaluation
    const handStrength = evaluateHandStrength(aiHand.cards, communityCards);
    const potOdds = pot > 0 ? (currentBet - aiBet) / (pot + (currentBet - aiBet)) : 0;
    
    // Decision logic based on hand strength and pot odds
    let action = 'fold';
    
    if (handStrength > 0.7) {
        // Strong hand - raise
        action = Math.random() > 0.3 ? 'raise' : 'call';
    } else if (handStrength > 0.5) {
        // Decent hand - call
        action = 'call';
    } else if (handStrength > 0.3) {
        // Weak hand - check pot odds
        action = potOdds < 0.3 ? 'call' : 'fold';
    } else {
        // Very weak - mostly fold
        action = Math.random() > 0.8 ? 'call' : 'fold';
    }
    
    if (action === 'raise' && aiChips >= (currentBet - aiBet) + 50) {
        const raiseAmount = 50;
        const total = (currentBet - aiBet) + raiseAmount;
        aiChips -= total;
        aiBet += total;
        pot += total;
        currentBet = aiBet;
        
        document.getElementById('status').textContent = `AI raises $${raiseAmount}!`;
        updateInfo();
        return; // Player's turn to respond
    } else if (action === 'call') {
        const toCall = currentBet - aiBet;
        if (aiChips >= toCall) {
            aiChips -= toCall;
            aiBet += toCall;
            pot += toCall;
        } else {
            action = 'fold';
        }
    }
    
    if (action === 'fold') {
        alert('AI folded! You win pot of $' + pot);
        playerChips += pot;
        setTimeout(startGame, 1000);
        return;
    }
    
    nextPhase();
}

function evaluateHandStrength(holeCards, community) {
    // Combine hole cards with community cards
    const allCards = [...holeCards, ...community];
    
    if (allCards.length < 2) {
        // Pre-flop - evaluate hole cards only
        const ranks = holeCards.map(c => c.rankValue);
        const suited = holeCards[0].suit === holeCards[1].suit;
        
        // Pocket pairs
        if (ranks[0] === ranks[1]) {
            return Math.min(1.0, 0.5 + ranks[0] / 28); // AA = 1.0, 22 = 0.57
        }
        
        // High cards
        const highCard = Math.max(...ranks);
        let strength = highCard / 14; // Ace = 1.0, 2 = 0.14
        
        // Suited bonus
        if (suited) strength += 0.1;
        
        // Connected cards bonus
        if (Math.abs(ranks[0] - ranks[1]) === 1) strength += 0.05;
        
        return Math.min(1.0, strength);
    }
    
    // Post-flop: Check for pairs, two pair, etc.
    const rankCounts = {};
    allCards.forEach(card => {
        rankCounts[card.rankValue] = (rankCounts[card.rankValue] || 0) + 1;
    });
    
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    
    // Four of a kind
    if (counts[0] === 4) return 0.95;
    
    // Full house
    if (counts[0] === 3 && counts[1] === 2) return 0.9;
    
    // Three of a kind
    if (counts[0] === 3) return 0.75;
    
    // Two pair
    if (counts[0] === 2 && counts[1] === 2) return 0.65;
    
    // One pair
    if (counts[0] === 2) {
        const pairRank = Object.keys(rankCounts).find(k => rankCounts[k] === 2);
        return 0.4 + (parseInt(pairRank) / 40); // High pair = better
    }
    
    // High card only
    const highCard = Math.max(...allCards.map(c => c.rankValue));
    return highCard / 20; // Weak hand
}

function showdown() {
    // Evaluate both hands
    const playerStrength = evaluateHandStrength(playerHand.cards, communityCards);
    const aiStrength = evaluateHandStrength(aiHand.cards, communityCards);
    
    const winner = playerStrength > aiStrength ? 'player' : 
                   aiStrength > playerStrength ? 'ai' : 'tie';
    
    let message = `Showdown!\nYour hand strength: ${(playerStrength * 100).toFixed(0)}%\nAI hand strength: ${(aiStrength * 100).toFixed(0)}%\n\n`;
    
    if (winner === 'player') {
        playerChips += pot;
        message += `You win $${pot}!`;
    } else if (winner === 'ai') {
        aiChips += pot;
        message += `AI wins $${pot}!`;
    } else {
        const split = Math.floor(pot / 2);
        playerChips += split;
        aiChips += split;
        message += `Split pot! Each gets $${split}`;
    }
    
    alert(message);
    setTimeout(startGame, 1000);
}

function updateInfo() {
    document.getElementById('gameInfo').textContent = 
        `Pot: $${pot} | Your Chips: $${playerChips} | Bet: $${currentBet}`;
}

// Initialize
ctx.fillStyle = '#0D5C26';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#FFF';
ctx.font = '32px Arial';
ctx.textAlign = 'center';
ctx.fillText('Click Start Game to Play Poker', 450, 300);

