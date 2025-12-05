// Yahtzee Game Logic

// Scoring categories
const CATEGORIES = [
    { id: 'ones', name: 'Ones', description: 'Sum of all 1s' },
    { id: 'twos', name: 'Twos', description: 'Sum of all 2s' },
    { id: 'threes', name: 'Threes', description: 'Sum of all 3s' },
    { id: 'fours', name: 'Fours', description: 'Sum of all 4s' },
    { id: 'fives', name: 'Fives', description: 'Sum of all 5s' },
    { id: 'sixes', name: 'Sixes', description: 'Sum of all 6s' },
    { id: 'three-kind', name: 'Three of a Kind', description: 'At least 3 dice the same' },
    { id: 'four-kind', name: 'Four of a Kind', description: 'At least 4 dice the same' },
    { id: 'full-house', name: 'Full House', description: '3 of one, 2 of another' },
    { id: 'small-straight', name: 'Small Straight', description: '4 consecutive numbers' },
    { id: 'large-straight', name: 'Large Straight', description: '5 consecutive numbers' },
    { id: 'yahtzee', name: 'Yahtzee', description: 'All 5 dice the same' },
    { id: 'chance', name: 'Chance', description: 'Any combination' }
];

// Game state
let gameState = {
    dice: [1, 1, 1, 1, 1],
    locked: [false, false, false, false, false],
    rollsLeft: 3,
    scores: {},
    selectedCategory: null,
    gameActive: true
};

// Initialize game
function initGame() {
    gameState.dice = [1, 1, 1, 1, 1];
    gameState.locked = [false, false, false, false, false];
    gameState.rollsLeft = 3;
    gameState.scores = {};
    gameState.selectedCategory = null;
    gameState.gameActive = true;
    
    // Initialize score sheet
    const scoreBody = document.getElementById('score-body');
    scoreBody.innerHTML = '';
    
    CATEGORIES.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${category.name}</strong><br>
                <small style="color: #aaa;">${category.description}</small>
            </td>
            <td class="score-cell" id="score-${category.id}" onclick="selectCategory('${category.id}')">
                -
            </td>
        `;
        scoreBody.appendChild(row);
    });
    
    updateDisplay();
    updateStatus('Click "Roll Dice" to start!');
}

// Roll dice
function rollDice() {
    if (gameState.rollsLeft === 0) {
        updateStatus('No rolls left! Select a category to score.');
        return;
    }
    
    if (gameState.rollsLeft === 3 && !gameState.selectedCategory) {
        // First roll - must select category after
        gameState.rollsLeft--;
    } else if (gameState.rollsLeft < 3) {
        gameState.rollsLeft--;
    }
    
    // Roll unlocked dice
    for (let i = 0; i < 5; i++) {
        if (!gameState.locked[i]) {
            gameState.dice[i] = Math.floor(Math.random() * 6) + 1;
        }
    }
    
    updateDisplay();
    
    if (gameState.rollsLeft === 0) {
        updateStatus('No rolls left! Select a category to score.');
        document.getElementById('roll-btn').disabled = true;
    } else {
        updateStatus(`Rolled! ${gameState.rollsLeft} roll(s) left. Lock dice and roll again, or select a category.`);
    }
}

// Toggle die lock
function toggleLock(index) {
    if (gameState.rollsLeft === 3) return; // Can't lock before first roll
    
    gameState.locked[index] = !gameState.locked[index];
    updateDisplay();
}

// Select category
function selectCategory(categoryId) {
    if (gameState.scores[categoryId] !== undefined) {
        updateStatus('This category is already used!');
        return;
    }
    
    if (gameState.rollsLeft === 3) {
        updateStatus('Roll the dice first!');
        return;
    }
    
    gameState.selectedCategory = categoryId;
    const score = calculateScore(categoryId, gameState.dice);
    
    // Update score
    gameState.scores[categoryId] = score;
    const scoreCell = document.getElementById(`score-${categoryId}`);
    scoreCell.textContent = score;
    scoreCell.classList.add('used');
    scoreCell.onclick = null;
    
    // Reset for next turn
    gameState.dice = [1, 1, 1, 1, 1];
    gameState.locked = [false, false, false, false, false];
    gameState.rollsLeft = 3;
    gameState.selectedCategory = null;
    
    updateDisplay();
    updateTotalScore();
    
    // Check if game is over
    if (Object.keys(gameState.scores).length === CATEGORIES.length) {
        endGame();
    } else {
        updateStatus('Category scored! Click "Roll Dice" for next turn.');
        document.getElementById('roll-btn').disabled = false;
    }
}

// Calculate score for a category
function calculateScore(categoryId, dice) {
    const counts = [0, 0, 0, 0, 0, 0];
    dice.forEach(die => counts[die - 1]++);
    
    switch (categoryId) {
        case 'ones':
            return counts[0] * 1;
        case 'twos':
            return counts[1] * 2;
        case 'threes':
            return counts[2] * 3;
        case 'fours':
            return counts[3] * 4;
        case 'fives':
            return counts[4] * 5;
        case 'sixes':
            return counts[5] * 6;
        case 'three-kind':
            if (counts.some(c => c >= 3)) {
                return dice.reduce((a, b) => a + b, 0);
            }
            return 0;
        case 'four-kind':
            if (counts.some(c => c >= 4)) {
                return dice.reduce((a, b) => a + b, 0);
            }
            return 0;
        case 'full-house':
            const hasThree = counts.some(c => c === 3);
            const hasTwo = counts.some(c => c === 2);
            return (hasThree && hasTwo) ? 25 : 0;
        case 'small-straight':
            const sorted = [...dice].sort();
            const unique = [...new Set(sorted)];
            if (unique.length >= 4) {
                // Check for 4 consecutive
                for (let i = 0; i <= unique.length - 4; i++) {
                    if (unique[i + 3] - unique[i] === 3) {
                        return 30;
                    }
                }
            }
            return 0;
        case 'large-straight':
            const sorted2 = [...dice].sort();
            const unique2 = [...new Set(sorted2)];
            if (unique2.length === 5 && unique2[4] - unique2[0] === 4) {
                return 40;
            }
            return 0;
        case 'yahtzee':
            if (counts.some(c => c === 5)) {
                return 50;
            }
            return 0;
        case 'chance':
            return dice.reduce((a, b) => a + b, 0);
        default:
            return 0;
    }
}

// Update display
function updateDisplay() {
    const diceContainer = document.getElementById('dice-container');
    diceContainer.innerHTML = '';
    
    gameState.dice.forEach((value, index) => {
        const die = document.createElement('div');
        die.className = 'die';
        if (gameState.locked[index]) {
            die.classList.add('locked');
        }
        die.textContent = getDieFace(value);
        die.onclick = () => toggleLock(index);
        diceContainer.appendChild(die);
    });
    
    document.getElementById('rolls-left').textContent = gameState.rollsLeft;
    
    // Update score previews
    CATEGORIES.forEach(category => {
        if (gameState.scores[category.id] === undefined && gameState.rollsLeft < 3) {
            const score = calculateScore(category.id, gameState.dice);
            const cell = document.getElementById(`score-${category.id}`);
            if (cell && !cell.classList.contains('used')) {
                cell.textContent = score > 0 ? score : '-';
            }
        }
    });
}

// Get die face emoji
function getDieFace(value) {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[value - 1];
}

// Update total score
function updateTotalScore() {
    const total = Object.values(gameState.scores).reduce((a, b) => a + b, 0);
    document.getElementById('total-score').textContent = total;
}

// Update status
function updateStatus(message) {
    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// End game
function endGame() {
    gameState.gameActive = false;
    const total = Object.values(gameState.scores).reduce((a, b) => a + b, 0);
    
    let message = `🎉 Game Over! Final Score: ${total} points! `;
    
    if (total >= 200) {
        message += 'Excellent!';
    } else if (total >= 150) {
        message += 'Good job!';
    } else if (total >= 100) {
        message += 'Not bad!';
    } else {
        message += 'Keep practicing!';
    }
    
    updateStatus(message);
    document.getElementById('roll-btn').disabled = true;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initGame();
});
