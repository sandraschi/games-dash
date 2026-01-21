// Game state
let towers = [[], [], []]; // Three towers, each is an array of disk sizes
let selectedTower = null;
let moveCount = 0;
let startTime = null;
let timerInterval = null;
let numDisks = 10;
let isSolving = false;
let isPaused = false;
let solveMoves = [];
let currentMoveIndex = 0;
let animationSpeed = 50; // milliseconds per move (lower = faster)
let animationTimeout = null;

// Initialize game
function initGame() {
    towers = [[], [], []];
    selectedTower = null;
    moveCount = 0;
    startTime = null;
    isSolving = false;
    isPaused = false;
    solveMoves = [];
    currentMoveIndex = 0;
    
    // Create disks on first tower
    for (let i = numDisks; i >= 1; i--) {
        towers[0].push(i);
    }
    
    updateDisplay();
    updateStats();
    updateStatus('Click a disk to select it, then click a tower to move it');
    
    // Clear any running timers
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (animationTimeout) {
        clearTimeout(animationTimeout);
        animationTimeout = null;
    }
    
    document.getElementById('solveBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
}

// Update visual display
function updateDisplay() {
    for (let i = 0; i < 3; i++) {
        const container = document.getElementById(`disks${i}`);
        container.innerHTML = '';
        
        towers[i].forEach((diskSize, index) => {
            const disk = document.createElement('div');
            disk.className = `disk disk-${diskSize}`;
            disk.innerHTML = `<div class="disk-number">${diskSize}</div>`;
            disk.onclick = (e) => {
                e.stopPropagation();
                selectTower(i);
            };
            container.appendChild(disk);
        });
    }
    
    // Highlight selected tower
    for (let i = 0; i < 3; i++) {
        const tower = document.getElementById(`tower${i}`);
        if (selectedTower === i) {
            tower.style.border = '3px solid #FFD700';
            tower.style.borderRadius = '10px';
        } else {
            tower.style.border = 'none';
        }
    }
}

// Select a tower
function selectTower(towerIndex) {
    if (isSolving) return;
    
    if (selectedTower === null) {
        // Select tower if it has disks
        if (towers[towerIndex].length > 0) {
            selectedTower = towerIndex;
            updateDisplay();
            updateStatus(`Tower ${towerIndex + 1} selected. Click destination tower.`);
        }
    } else {
        // Try to move
        if (selectedTower === towerIndex) {
            // Deselect
            selectedTower = null;
            updateDisplay();
            updateStatus('Selection cleared');
        } else {
            moveDisk(selectedTower, towerIndex);
        }
    }
}

// Tower click handler
function towerClick(towerIndex) {
    if (isSolving) return;
    
    if (selectedTower === null) {
        // Select if has disks
        if (towers[towerIndex].length > 0) {
            selectTower(towerIndex);
        }
    } else {
        // Move to this tower
        moveDisk(selectedTower, towerIndex);
    }
}

// Move disk from one tower to another
function moveDisk(from, to) {
    if (towers[from].length === 0) {
        selectedTower = null;
        updateDisplay();
        return;
    }
    
    const disk = towers[from][towers[from].length - 1];
    
    // Check if move is valid
    if (towers[to].length > 0 && towers[to][towers[to].length - 1] < disk) {
        updateStatus('Invalid move! Cannot place larger disk on smaller disk.');
        selectedTower = null;
        updateDisplay();
        return;
    }
    
    // Make the move
    towers[from].pop();
    towers[to].push(disk);
    moveCount++;
    
    // Start timer on first move
    if (startTime === null) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);
    }
    
    selectedTower = null;
    updateDisplay();
    updateStats();
    
    // Check win condition
    if (towers[2].length === numDisks) {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        const minMoves = Math.pow(2, numDisks) - 1;
        const efficiency = Math.round((minMoves / moveCount) * 100);
        updateStatus(`🎉 You won! Completed in ${moveCount} moves (minimum: ${minMoves}, efficiency: ${efficiency}%)`);
        document.querySelector('.status-message').classList.add('complete');
    } else {
        updateStatus('Move successful! Continue...');
    }
}

// Animated move for AI solving
async function animatedMove(from, to) {
    return new Promise((resolve) => {
        if (towers[from].length === 0) {
            resolve();
            return;
        }
        
        const diskSize = towers[from][towers[from].length - 1];
        const fromContainer = document.getElementById(`disks${from}`);
        const toContainer = document.getElementById(`disks${to}`);
        const diskElement = fromContainer.lastElementChild;
        
        if (!diskElement) {
            resolve();
            return;
        }
        
        // Mark as moving
        diskElement.classList.add('moving');
        
        // Get positions
        const fromRect = fromContainer.getBoundingClientRect();
        const toRect = toContainer.getBoundingClientRect();
        const containerRect = document.getElementById('towersContainer').getBoundingClientRect();
        
        // Calculate target position
        const targetY = toRect.bottom - containerRect.top - 20 - (towers[to].length * 28);
        const currentY = fromRect.bottom - containerRect.top - 20 - ((towers[from].length - 1) * 28);
        
        // Calculate timing (total animation = animationSpeed)
        const upTime = Math.max(10, animationSpeed * 0.25);
        const acrossTime = Math.max(10, animationSpeed * 0.5);
        const downTime = Math.max(10, animationSpeed * 0.25);
        const totalTime = upTime + acrossTime + downTime;
        
        // Animate upward first
        diskElement.style.position = 'absolute';
        diskElement.style.left = `${fromRect.left - containerRect.left + (fromRect.width / 2) - (diskElement.offsetWidth / 2)}px`;
        diskElement.style.top = `${currentY}px`;
        diskElement.style.transition = `top ${upTime}ms ease-out`;
        diskElement.style.zIndex = '1000';
        
        setTimeout(() => {
            // Move to top
            diskElement.style.top = '50px';
        }, 10);
        
        setTimeout(() => {
            // Move horizontally
            diskElement.style.left = `${toRect.left - containerRect.left + (toRect.width / 2) - (diskElement.offsetWidth / 2)}px`;
            diskElement.style.transition = `left ${acrossTime}ms ease-in-out, top ${downTime}ms ease-in ${acrossTime}ms`;
        }, upTime + 10);
        
        setTimeout(() => {
            // Move down
            diskElement.style.top = `${targetY}px`;
        }, upTime + acrossTime + 10);
        
        setTimeout(() => {
            // Update game state
            towers[from].pop();
            towers[to].push(diskSize);
            moveCount++;
            
            // Remove from DOM and re-render
            diskElement.remove();
            updateDisplay();
            updateStats();
            
            // Check win
            if (towers[2].length === numDisks) {
                const minMoves = Math.pow(2, numDisks) - 1;
                const efficiency = Math.round((minMoves / moveCount) * 100);
                updateStatus(`🤖 AI solved in ${moveCount} moves (minimum: ${minMoves}, efficiency: ${efficiency}%)`);
                document.querySelector('.status-message').classList.add('complete');
                isSolving = false;
                document.getElementById('solveBtn').style.display = 'inline-block';
                document.getElementById('pauseBtn').style.display = 'none';
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }
            
            resolve();
        }, totalTime + 20);
    });
}

// AI solver using recursive algorithm
function generateSolution(n, from, to, aux, moves) {
    if (n === 1) {
        moves.push({from, to});
    } else {
        generateSolution(n - 1, from, aux, to, moves);
        moves.push({from, to});
        generateSolution(n - 1, aux, to, from, moves);
    }
}

// Solve with AI
async function solveWithAI() {
    if (isSolving) return;
    
    // Reset if already solved
    if (towers[2].length === numDisks) {
        newGame();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    isSolving = true;
    isPaused = false;
    solveMoves = [];
    currentMoveIndex = 0;
    
    // Generate optimal solution
    generateSolution(numDisks, 0, 2, 1, solveMoves);
    
    // Start timer
    if (startTime === null) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 100);
    }
    
    document.getElementById('solveBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    updateStatus(`🤖 AI solving... (${solveMoves.length} moves at ${animationSpeed}ms each)`);
    document.querySelector('.status-message').classList.add('solving');
    
    // Execute moves
    await executeMoves();
}

// Execute moves with animation
async function executeMoves() {
    while (currentMoveIndex < solveMoves.length && isSolving && !isPaused) {
        const move = solveMoves[currentMoveIndex];
        await animatedMove(move.from, move.to);
        currentMoveIndex++;
        
        if (isPaused) {
            updateStatus(`⏸️ Paused at move ${currentMoveIndex} of ${solveMoves.length}`);
            break;
        }
        
        // Small delay between moves
        await new Promise(resolve => setTimeout(resolve, animationSpeed * 0.1));
    }
    
    if (currentMoveIndex >= solveMoves.length && !isPaused) {
        isSolving = false;
        document.getElementById('solveBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
    }
}

// Pause AI solving
function pauseAI() {
    if (!isSolving) return;
    isPaused = !isPaused;
    
    if (isPaused) {
        document.getElementById('pauseBtn').textContent = '▶️ Resume';
        updateStatus(`⏸️ Paused at move ${currentMoveIndex} of ${solveMoves.length}`);
    } else {
        document.getElementById('pauseBtn').textContent = '⏸️ Pause';
        updateStatus(`🤖 AI solving... (${solveMoves.length} moves)`);
        executeMoves();
    }
}

// Update speed
function updateSpeed() {
    const slider = document.getElementById('speedSlider');
    const value = parseInt(slider.value);
    // Speed: 1 = 200ms (slow), 50 = 4ms (medium), 100 = 1ms (very fast)
    animationSpeed = Math.max(1, Math.round(201 - (value * 2)));
    document.getElementById('speedDisplay').textContent = `${value}x`;
    
    if (isSolving && !isPaused) {
        // Note: Speed change will apply to next move
        updateStatus(`🤖 AI solving... Speed: ${value}x (${animationSpeed}ms per move)`);
    }
}

// Change disk count
function changeDiskCount() {
    const select = document.getElementById('diskCount');
    numDisks = parseInt(select.value);
    const minMoves = Math.pow(2, numDisks) - 1;
    document.getElementById('minMoves').textContent = minMoves;
    newGame();
}

// New game
function newGame() {
    if (isSolving) {
        isSolving = false;
        isPaused = false;
        if (animationTimeout) {
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
    }
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.querySelector('.status-message').classList.remove('solving', 'complete');
    initGame();
}

// Update stats
function updateStats() {
    document.getElementById('moveCount').textContent = moveCount;
    const minMoves = Math.pow(2, numDisks) - 1;
    document.getElementById('minMoves').textContent = minMoves;
    
    if (moveCount > 0) {
        const efficiency = Math.round((minMoves / moveCount) * 100);
        document.getElementById('efficiency').textContent = `${efficiency}%`;
    } else {
        document.getElementById('efficiency').textContent = '100%';
    }
}

// Update timer
function updateTimer() {
    if (startTime === null) return;
    
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;
    
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`;
}

// Update status message
function updateStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

// Initialize on load
window.addEventListener('load', () => {
    initGame();
    const minMoves = Math.pow(2, numDisks) - 1;
    document.getElementById('minMoves').textContent = minMoves;
});

