// Cho-Han Bakuchi (丁半) - Japanese Dice Game
// Bet on whether the sum of two dice is even (Cho) or odd (Han)

// Game state
let gameState = {
    bankroll: 10000,
    currentBet: null,
    betAmount: 1000,
    die1: 1,
    die2: 1
};

// Get die face
function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

// Place bet
function placeBet(betType) {
    if (gameState.bankroll < gameState.betAmount) {
        updateStatus('Not enough money!');
        return;
    }
    
    // Remove selected class
    document.getElementById('bet-cho').classList.remove('selected');
    document.getElementById('bet-han').classList.remove('selected');
    
    // Add selected class
    document.getElementById(`bet-${betType}`).classList.add('selected');
    
    gameState.currentBet = betType;
    updateStatus(`Bet placed: ${betType.toUpperCase()} (${betType === 'cho' ? 'Even' : 'Odd'}). Click "Roll Dice"!`);
    document.getElementById('roll-btn').disabled = false;
}

// Roll dice
function rollDice() {
    if (!gameState.currentBet) {
        updateStatus('Please place a bet first!');
        return;
    }

    // Play dice roll sound
    if (window.gameSound) {
        window.gameSound.playSound('dice_roll', { gameType: 'general' });
    }

    // Shake animation
    const diceCup = document.getElementById('dice-cup');
    diceCup.classList.add('shaking');
    diceCup.textContent = '🎲';
    
    document.getElementById('roll-btn').disabled = true;
    document.getElementById('result-display').style.display = 'none';
    
    setTimeout(() => {
        // Roll dice
        gameState.die1 = Math.floor(Math.random() * 6) + 1;
        gameState.die2 = Math.floor(Math.random() * 6) + 1;
        
        const total = gameState.die1 + gameState.die2;
        const isEven = total % 2 === 0;
        const result = isEven ? 'CHO' : 'HAN';
        
        // Stop shaking
        diceCup.classList.remove('shaking');
        diceCup.textContent = `${getDieFace(gameState.die1)} ${getDieFace(gameState.die2)}`;
        
        // Show result
        const resultDisplay = document.getElementById('result-display');
        resultDisplay.textContent = `${result} (${total})`;
        resultDisplay.style.display = 'block';
        
        // Check win/loss
        const won = (gameState.currentBet === 'cho' && isEven) || 
                   (gameState.currentBet === 'han' && !isEven);
        
        if (won) {
            gameState.bankroll += gameState.betAmount;
            updateStatus(`🎉 ${result}! You win ¥${gameState.betAmount}!`);
        } else {
            gameState.bankroll -= gameState.betAmount;
            updateStatus(`❌ ${result}! You lose ¥${gameState.betAmount}.`);
        }
        
        updateBankroll();
        
        // Reset for next round
        gameState.currentBet = null;
        document.getElementById('bet-cho').classList.remove('selected');
        document.getElementById('bet-han').classList.remove('selected');
        
        if (gameState.bankroll <= 0) {
            updateStatus('💸 Out of money! Game over!');
        } else {
            setTimeout(() => {
                diceCup.textContent = '🎲';
                resultDisplay.style.display = 'none';
                updateStatus('Choose: Cho (Even) or Han (Odd)');
            }, 3000);
        }
    }, 1500);
}

// Update bankroll
function updateBankroll() {
    document.getElementById('bankroll').textContent = gameState.bankroll;
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// New game
function newGame() {
    gameState.bankroll = 10000;
    gameState.currentBet = null;
    gameState.die1 = 1;
    gameState.die2 = 1;
    
    document.getElementById('dice-cup').textContent = '🎲';
    document.getElementById('result-display').style.display = 'none';
    document.getElementById('bet-cho').classList.remove('selected');
    document.getElementById('bet-han').classList.remove('selected');
    document.getElementById('roll-btn').disabled = true;
    
    updateBankroll();
    updateStatus('Choose: Cho (Even) or Han (Odd)');
}

// Sound toggle function
function toggleSound() {
    if (window.gameSound) {
        const isEnabled = window.gameSound.isEnabled;
        if (isEnabled) {
            window.gameSound.disable();
            document.getElementById('soundToggle').textContent = '🔇 Sound: Off';
        } else {
            window.gameSound.enable();
            document.getElementById('soundToggle').textContent = '🔊 Sound: On';
        }
    } else {
        alert('Sound system not available. Make sure the sound service is running.');
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
