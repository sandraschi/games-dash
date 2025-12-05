// Chess Timer Integration
// Add this to chess.html after chess-timer.js loads
// **Timestamp**: 2025-12-04

// Time control presets
const TIME_CONTROLS = {
    unlimited: { time: 0, increment: 0 },
    bullet: { time: 60, increment: 0 },
    blitz3: { time: 180, increment: 0 },
    blitz5: { time: 300, increment: 0 },
    rapid10: { time: 600, increment: 0 },
    rapid15: { time: 900, increment: 10 },
    classical: { time: 1800, increment: 0 }
};

// Initialize timer variable
let chessTimer = null;
let timerEnabled = false;

// Initialize timer on page load
window.addEventListener('DOMContentLoaded', function() {
    // Create timer HTML if not exists
    if (!document.getElementById('whiteTimer')) {
        insertTimerUI();
    }
    
    // Create time control selector if not exists
    if (!document.getElementById('timeControl')) {
        insertTimeControlSelector();
    }
    
    // Initialize with default (no timer)
    changeTimeControl();
});

function insertTimerUI() {
    const status = document.getElementById('status');
    if (!status) return;
    
    const timerHTML = `
        <div class="chess-timers" style="display: flex; justify-content: space-around; margin: 20px auto; max-width: 600px; gap: 20px;">
            <div class="timer-box" style="flex: 1; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; border: 3px solid white; text-align: center;">
                <div style="color: white; font-size: 14px; margin-bottom: 10px;">⬜ White</div>
                <div id="whiteTimer" class="timer-display" style="font-size: 36px; font-weight: bold; color: white; font-family: monospace;">∞</div>
            </div>
            <div class="timer-box" style="flex: 1; background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; border: 3px solid #666; text-align: center;">
                <div style="color: white; font-size: 14px; margin-bottom: 10px;">⬛ Black</div>
                <div id="blackTimer" class="timer-display" style="font-size: 36px; font-weight: bold; color: white; font-family: monospace;">∞</div>
            </div>
        </div>
    `;
    
    status.insertAdjacentHTML('beforebegin', timerHTML);
    
    // Add CSS for active timer
    const style = document.createElement('style');
    style.textContent = `
        .timer-display.active {
            animation: timerPulse 1s infinite;
            color: #4CAF50 !important;
        }
        .timer-display.low-time {
            color: #F44336 !important;
            animation: timerUrgent 0.5s infinite;
        }
        @keyframes timerPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        @keyframes timerUrgent {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
}

function insertTimeControlSelector() {
    // Insert after game-controls or before chess board
    const gameControls = document.querySelector('.game-controls');
    if (!gameControls) return;
    
    const selectorHTML = `
        <div class="timer-controls" style="display: flex; gap: 10px; align-items: center; margin: 15px 0; flex-wrap: wrap; justify-content: center;">
            <label style="color: white;">⏱️ Time Control:</label>
            <select id="timeControl" onchange="changeTimeControl()" style="padding: 8px; border-radius: 5px; background: white; border: 2px solid #4CAF50;">
                <option value="unlimited" selected>No Timer</option>
                <option value="bullet">Bullet (1+0)</option>
                <option value="blitz3">Blitz (3+0)</option>
                <option value="blitz5">Blitz (5+0)</option>
                <option value="rapid10">Rapid (10+0)</option>
                <option value="rapid15">Rapid (15+10)</option>
                <option value="classical">Classical (30+0)</option>
            </select>
        </div>
    `;
    
    gameControls.insertAdjacentHTML('afterend', selectorHTML);
}

function changeTimeControl() {
    const select = document.getElementById('timeControl');
    if (!select) return;
    
    const preset = select.value;
    
    if (preset === 'unlimited') {
        timerEnabled = false;
        if (chessTimer) {
            chessTimer.stop();
        }
        const whiteTimer = document.getElementById('whiteTimer');
        const blackTimer = document.getElementById('blackTimer');
        if (whiteTimer) whiteTimer.textContent = '∞';
        if (blackTimer) blackTimer.textContent = '∞';
        return;
    }
    
    timerEnabled = true;
    const control = TIME_CONTROLS[preset];
    
    if (!chessTimer) {
        chessTimer = new ChessTimer(control.time, control.time, control.increment);
        chessTimer.onTimeUp = handleTimeUp;
    } else {
        chessTimer.reset(control.time, control.time, control.increment);
    }
    
    // Update display immediately
    chessTimer.render();
    
    // Start timer for white if game is in progress
    if (typeof currentPlayer !== 'undefined' && currentPlayer === 'white') {
        chessTimer.start('white');
    }
}

function handleTimeUp(player) {
    const winner = player === 'white' ? 'Black' : 'White';
    alert(`⏱️ ${player.toUpperCase()} ran out of time! ${winner} wins!`);
    if (typeof updateStatus === 'function') {
        updateStatus(`${winner} wins on time!`);
    }
}

// Hook into existing chess game functions
// These will be called by the main chess game
window.startTimer = function(player) {
    if (timerEnabled && chessTimer) {
        console.log('Starting timer for', player);
        chessTimer.start(player);
    }
};

window.stopTimer = function() {
    if (timerEnabled && chessTimer) {
        chessTimer.stop();
    }
};

window.switchTimer = function(player) {
    if (timerEnabled && chessTimer) {
        console.log('Switching timer to', player);
        chessTimer.switchPlayer(player);
    }
};

// Override newGame to reset timer
const originalNewGame = window.newGame;
if (originalNewGame) {
    window.newGame = function() {
        originalNewGame();
        if (timerEnabled && chessTimer) {
            const select = document.getElementById('timeControl');
            if (select) {
                const preset = select.value;
                if (preset !== 'unlimited') {
                    const control = TIME_CONTROLS[preset];
                    chessTimer.reset(control.time, control.time, control.increment);
                    chessTimer.start('white');
                }
            }
        }
    };
}

console.log('✅ Chess timer integration loaded');

