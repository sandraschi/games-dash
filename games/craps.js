// Craps Game Logic

// Game state
let gameState = {
    bankroll: 1000,
    currentBet: null,
    betAmount: 10,
    point: null,
    comeOutRoll: true,
    die1: 1,
    die2: 1
};

// Get die face
function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

// Roll dice
function rollDice() {
    if (!gameState.currentBet) {
        updateStatus('Please place a bet first!');
        return;
    }
    
    // Animate dice
    const die1El = document.getElementById('die1');
    const die2El = document.getElementById('die2');
    die1El.classList.add('rolling');
    die2El.classList.add('rolling');
    
    setTimeout(() => {
        gameState.die1 = Math.floor(Math.random() * 6) + 1;
        gameState.die2 = Math.floor(Math.random() * 6) + 1;
        
        const total = gameState.die1 + gameState.die2;
        
        die1El.textContent = getDieFace(gameState.die1);
        die2El.textContent = getDieFace(gameState.die2);
        die1El.classList.remove('rolling');
        die2El.classList.remove('rolling');
        
        processRoll(total);
    }, 500);
}

// Process roll result
function processRoll(total) {
    if (gameState.comeOutRoll) {
        // Come out roll
        if (total === 7 || total === 11) {
            if (gameState.currentBet === 'pass' || gameState.currentBet === 'come') {
                // Win!
                gameState.bankroll += gameState.betAmount * 2;
                updateStatus(`🎉 Natural ${total}! You win $${gameState.betAmount * 2}!`);
            } else {
                // Lose
                gameState.bankroll -= gameState.betAmount;
                updateStatus(`❌ Natural ${total}! You lose $${gameState.betAmount}.`);
            }
            resetRound();
        } else if (total === 2 || total === 3 || total === 12) {
            if (gameState.currentBet === 'pass' || gameState.currentBet === 'come') {
                // Lose (craps)
                gameState.bankroll -= gameState.betAmount;
                updateStatus(`❌ Craps ${total}! You lose $${gameState.betAmount}.`);
            } else {
                // Win
                gameState.bankroll += gameState.betAmount * 2;
                updateStatus(`🎉 Craps ${total}! You win $${gameState.betAmount * 2}!`);
            }
            resetRound();
        } else {
            // Point established
            gameState.point = total;
            gameState.comeOutRoll = false;
            document.getElementById('point-display').style.display = 'block';
            document.getElementById('point-value').textContent = total;
            updateStatus(`Point is ${total}! Roll again.`);
        }
    } else {
        // Point roll
        if (total === gameState.point) {
            // Made the point - win!
            if (gameState.currentBet === 'pass' || gameState.currentBet === 'come') {
                gameState.bankroll += gameState.betAmount * 2;
                updateStatus(`🎉 Made the point ${total}! You win $${gameState.betAmount * 2}!`);
            } else {
                gameState.bankroll -= gameState.betAmount;
                updateStatus(`❌ Made the point ${total}! You lose $${gameState.betAmount}.`);
            }
            resetRound();
        } else if (total === 7) {
            // Seven out - lose
            if (gameState.currentBet === 'pass' || gameState.currentBet === 'come') {
                gameState.bankroll -= gameState.betAmount;
                updateStatus(`❌ Seven out! You lose $${gameState.betAmount}.`);
            } else {
                gameState.bankroll += gameState.betAmount * 2;
                updateStatus(`🎉 Seven out! You win $${gameState.betAmount * 2}!`);
            }
            resetRound();
        } else {
            updateStatus(`Rolled ${total}. Point is ${gameState.point}. Roll again.`);
        }
    }
    
    updateBankroll();
    
    if (gameState.bankroll <= 0) {
        updateStatus('💸 Out of money! Game over!');
        document.getElementById('roll-btn').disabled = true;
    }
}

// Place bet
function placeBet(betType) {
    if (gameState.bankroll < gameState.betAmount) {
        updateStatus('Not enough money!');
        return;
    }
    
    // Remove active class from all buttons
    document.querySelectorAll('.bet-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected button
    event.target.classList.add('active');
    
    gameState.currentBet = betType;
    updateStatus(`Bet placed: ${betType.replace('-', ' ')}. Click "Roll Dice"!`);
    document.getElementById('roll-btn').disabled = false;
}

// Reset round
function resetRound() {
    gameState.point = null;
    gameState.comeOutRoll = true;
    gameState.currentBet = null;
    document.getElementById('point-display').style.display = 'none';
    document.querySelectorAll('.bet-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('roll-btn').disabled = true;
}

// Update bankroll display
function updateBankroll() {
    document.getElementById('bankroll').textContent = gameState.bankroll;
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// New game
function newGame() {
    gameState.bankroll = 1000;
    gameState.currentBet = null;
    gameState.point = null;
    gameState.comeOutRoll = true;
    gameState.die1 = 1;
    gameState.die2 = 1;
    
    document.getElementById('die1').textContent = getDieFace(1);
    document.getElementById('die2').textContent = getDieFace(1);
    document.getElementById('point-display').style.display = 'none';
    document.querySelectorAll('.bet-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('roll-btn').disabled = true;
    
    updateBankroll();
    updateStatus('Place your bet and roll!');
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
