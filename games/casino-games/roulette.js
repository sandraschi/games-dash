// Roulette Game
// **Timestamp**: 2025-12-02

let bankroll = 1000;
let currentBet = 10;
let selectedBet = null;
let spinning = false;

// European Roulette: 0, 1-36 (0 is green, others alternate red/black)
const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

function getNumberColor(num) {
    if (num === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
}

function selectBet(betType) {
    if (spinning) return;
    
    selectedBet = betType;
    
    // Update button styles
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
}

function spin() {
    if (spinning || !selectedBet) {
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
    
    spinning = true;
    document.getElementById('spinBtn').disabled = true;
    updateStatus('Spinning...');
    
    // Random number
    const winningNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const winningColor = getNumberColor(winningNumber);
    
    // Calculate rotation (each number is ~9.73 degrees, 0 is at top)
    const numberIndex = numbers.indexOf(winningNumber);
    const baseRotation = 360 - (numberIndex * (360 / 37));
    const extraSpins = 5 + Math.random() * 3; // 5-8 full spins
    const finalRotation = baseRotation + (extraSpins * 360);
    
    // Animate wheel
    const wheel = document.getElementById('wheel');
    wheel.style.transform = `rotate(${finalRotation}deg)`;
    
    // Show result after animation
    setTimeout(() => {
        document.getElementById('result').textContent = winningNumber;
        
        // Check win
        let won = false;
        let payout = 0;
        
        switch(selectedBet) {
            case 'red':
                won = winningColor === 'red';
                payout = won ? currentBet * 2 : 0;
                break;
            case 'black':
                won = winningColor === 'black';
                payout = won ? currentBet * 2 : 0;
                break;
            case 'green':
                won = winningNumber === 0;
                payout = won ? currentBet * 36 : 0;
                break;
            case 'even':
                won = winningNumber !== 0 && winningNumber % 2 === 0;
                payout = won ? currentBet * 2 : 0;
                break;
            case 'odd':
                won = winningNumber !== 0 && winningNumber % 2 === 1;
                payout = won ? currentBet * 2 : 0;
                break;
            case '1-18':
                won = winningNumber >= 1 && winningNumber <= 18;
                payout = won ? currentBet * 2 : 0;
                break;
            case '19-36':
                won = winningNumber >= 19 && winningNumber <= 36;
                payout = won ? currentBet * 2 : 0;
                break;
            case '1-12':
                won = winningNumber >= 1 && winningNumber <= 12;
                payout = won ? currentBet * 3 : 0;
                break;
            case '13-24':
                won = winningNumber >= 13 && winningNumber <= 24;
                payout = won ? currentBet * 3 : 0;
                break;
        }
        
        if (won) {
            bankroll += payout;
            updateStatus(`You win! ${winningNumber} ${winningColor} - Payout: $${payout}`);
        } else {
            updateStatus(`You lose! ${winningNumber} ${winningColor}`);
        }
        
        updateBankroll();
        spinning = false;
        document.getElementById('spinBtn').disabled = false;
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
    }, 3000);
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
    spinning = false;
    updateBankroll();
    updateStatus('Place your bet and spin!');
    document.getElementById('betAmount').value = 10;
    document.getElementById('result').textContent = '-';
    document.getElementById('spinBtn').disabled = false;
    
    // Reset wheel
    const wheel = document.getElementById('wheel');
    wheel.style.transform = 'rotate(0deg)';
    
    // Clear selection
    document.querySelectorAll('.bet-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Initialize
updateBankroll();

