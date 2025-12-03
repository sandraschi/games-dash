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
    // Simple AI: Call or fold based on random
    if (Math.random() > 0.3) {
        const toCall = currentBet - aiBet;
        aiChips -= toCall;
        aiBet += toCall;
        pot += toCall;
    } else {
        alert('AI folded! You win pot of $' + pot);
        playerChips += pot;
        setTimeout(startGame, 1000);
        return;
    }
    
    nextPhase();
}

function showdown() {
    // Simple hand evaluation (simplified)
    alert('Showdown! (Full poker hand evaluation in full version)');
    const winner = Math.random() > 0.5 ? 'player' : 'ai';
    
    if (winner === 'player') {
        playerChips += pot;
        alert('You win $' + pot + '!');
    } else {
        aiChips += pot;
        alert('AI wins $' + pot);
    }
    
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

