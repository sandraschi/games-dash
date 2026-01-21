// 24 Game Implementation
// **Timestamp**: 2025-12-04

let currentNumbers = [];
let currentDifficulty = 'easy';
let stats = {
    solved: 0,
    attempts: 0,
    streak: 0
};
let currentSolution = null;

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    ['easy', 'medium', 'hard'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) {
            if (d === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    
    newPuzzle();
}

function newPuzzle() {
    document.getElementById('hintBox').style.display = 'none';
    document.getElementById('solutionBox').style.display = 'none';
    document.getElementById('expressionInput').value = '';
    
    // Generate numbers based on difficulty
    const maxNum = {
        easy: 9,
        medium: 13,
        hard: 13
    }[currentDifficulty];
    
    let hasSolution = false;
    let attempts = 0;
    
    // Keep generating until we find a solvable puzzle (or accept unsolvable on hard)
    while (!hasSolution && attempts < 100) {
        currentNumbers = [];
        for (let i = 0; i < 4; i++) {
            currentNumbers.push(Math.floor(Math.random() * maxNum) + 1);
        }
        
        currentSolution = findSolution(currentNumbers);
        
        if (currentDifficulty === 'hard' || currentSolution) {
            hasSolution = true;
        }
        
        attempts++;
    }
    
    renderCards();
    
    if (currentSolution) {
        updateStatus('Make 24 using all four numbers!');
    } else {
        updateStatus('⚠️ HARD MODE: This puzzle may have NO solution!');
    }
}

function renderCards() {
    const cardsContainer = document.getElementById('cards');
    cardsContainer.innerHTML = '';
    
    currentNumbers.forEach(num => {
        const card = document.createElement('div');
        card.className = 'number-card';
        card.textContent = num;
        cardsContainer.appendChild(card);
    });
}

function checkSolution() {
    const input = document.getElementById('expressionInput').value.trim();
    
    if (!input) {
        updateStatus('Please enter an expression!');
        return;
    }
    
    stats.attempts++;
    updateStats();
    
    try {
        // Validate expression uses only the given numbers
        const usedNumbers = input.match(/\d+/g);
        if (!usedNumbers || usedNumbers.length !== 4) {
            updateStatus('❌ You must use exactly 4 numbers!');
            return;
        }
        
        // Check if numbers match
        const sortedUsed = usedNumbers.map(Number).sort((a, b) => a - b);
        const sortedCurrent = [...currentNumbers].sort((a, b) => a - b);
        
        if (sortedUsed.join(',') !== sortedCurrent.join(',')) {
            updateStatus('❌ You must use the exact numbers shown!');
            return;
        }
        
        // Evaluate expression
        const result = eval(input.replace(/×/g, '*').replace(/÷/g, '/'));
        
        if (Math.abs(result - 24) < 0.001) {
            stats.solved++;
            stats.streak++;
            updateStats();
            updateStatus(`🎉 CORRECT! You made 24! (${input})`);
            
            setTimeout(() => {
                if (confirm('Excellent! Try another puzzle?')) {
                    newPuzzle();
                }
            }, 1500);
        } else {
            stats.streak = 0;
            updateStats();
            updateStatus(`❌ Wrong! That equals ${result.toFixed(2)}, not 24`);
        }
    } catch (e) {
        updateStatus('❌ Invalid expression! Check your syntax.');
    }
}

function showHint() {
    const hintBox = document.getElementById('hintBox');
    const hintText = document.getElementById('hintText');
    
    if (!currentSolution) {
        hintText.textContent = 'This puzzle may have no solution! Try a different combination or get a new puzzle.';
        hintBox.style.display = 'block';
        return;
    }
    
    // Give progressively better hints
    const hints = [
        `Try using ${getRandomOp()} first...`,
        `One approach: combine ${currentNumbers[0]} and ${currentNumbers[1]} first`,
        `Think about making an intermediate number, then working toward 24`,
        `Here's one solution: ${currentSolution}`
    ];
    
    const hintIndex = Math.min(stats.attempts % hints.length, hints.length - 1);
    hintText.textContent = hints[hintIndex];
    hintBox.style.display = 'block';
}

function getRandomOp() {
    const ops = ['addition (+)', 'subtraction (−)', 'multiplication (×)', 'division (÷)'];
    return ops[Math.floor(Math.random() * ops.length)];
}

function findSolution(numbers) {
    // Try to find one solution by brute force
    const perms = permutations(numbers);
    const ops = ['+', '-', '*', '/'];
    
    for (const perm of perms) {
        for (const op1 of ops) {
            for (const op2 of ops) {
                for (const op3 of ops) {
                    // Try different groupings
                    const expressions = [
                        `((${perm[0]} ${op1} ${perm[1]}) ${op2} ${perm[2]}) ${op3} ${perm[3]}`,
                        `(${perm[0]} ${op1} (${perm[1]} ${op2} ${perm[2]})) ${op3} ${perm[3]}`,
                        `(${perm[0]} ${op1} ${perm[1]}) ${op2} (${perm[2]} ${op3} ${perm[3]})`,
                        `${perm[0]} ${op1} ((${perm[1]} ${op2} ${perm[2]}) ${op3} ${perm[3]})`,
                        `${perm[0]} ${op1} (${perm[1]} ${op2} (${perm[2]} ${op3} ${perm[3]}))`
                    ];
                    
                    for (const expr of expressions) {
                        try {
                            const result = eval(expr);
                            if (Math.abs(result - 24) < 0.001) {
                                // Convert to display format
                                return expr.replace(/\*/g, '×').replace(/\//g, '÷');
                            }
                        } catch (e) {
                            // Division by zero or other error
                        }
                    }
                }
            }
        }
    }
    
    return null;
}

function permutations(arr) {
    if (arr.length <= 1) return [arr];
    
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
        const remainingPerms = permutations(remaining);
        
        for (const perm of remainingPerms) {
            result.push([current, ...perm]);
        }
    }
    
    return result;
}

function updateStats() {
    document.getElementById('solvedCount').textContent = stats.solved;
    document.getElementById('attemptCount').textContent = stats.attempts;
    document.getElementById('streakCount').textContent = stats.streak;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Handle Enter key
document.getElementById('expressionInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkSolution();
    }
});

// Initialize
setDifficulty('easy');

