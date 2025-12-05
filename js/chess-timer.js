// Chess Timer Module
// **Timestamp**: 2025-12-04

class ChessTimer {
    constructor(whiteTime, blackTime, increment = 0) {
        this.whiteTime = whiteTime * 1000; // Convert to ms
        this.blackTime = blackTime * 1000;
        this.increment = increment * 1000;
        this.activePlayer = null;
        this.interval = null;
        this.lastTick = null;
        this.onTimeUp = null;
    }
    
    start(player) {
        if (this.interval) {
            this.stop();
        }
        
        this.activePlayer = player;
        this.lastTick = Date.now();
        
        this.interval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - this.lastTick;
            this.lastTick = now;
            
            if (this.activePlayer === 'white') {
                this.whiteTime -= elapsed;
                if (this.whiteTime <= 0) {
                    this.whiteTime = 0;
                    this.stop();
                    if (this.onTimeUp) this.onTimeUp('white');
                }
            } else {
                this.blackTime -= elapsed;
                if (this.blackTime <= 0) {
                    this.blackTime = 0;
                    this.stop();
                    if (this.onTimeUp) this.onTimeUp('black');
                }
            }
            
            this.render();
        }, 100);
    }
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        // Add increment if player made a move
        if (this.activePlayer) {
            if (this.activePlayer === 'white') {
                this.whiteTime += this.increment;
            } else {
                this.blackTime += this.increment;
            }
        }
        
        this.activePlayer = null;
    }
    
    switchPlayer(player) {
        this.stop();
        this.start(player);
    }
    
    reset(whiteTime, blackTime, increment = 0) {
        this.stop();
        this.whiteTime = whiteTime * 1000;
        this.blackTime = blackTime * 1000;
        this.increment = increment * 1000;
        this.render();
    }
    
    formatTime(ms) {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    render() {
        const whiteTimer = document.getElementById('whiteTimer');
        const blackTimer = document.getElementById('blackTimer');
        
        if (whiteTimer) {
            whiteTimer.textContent = this.formatTime(this.whiteTime);
            whiteTimer.classList.toggle('active', this.activePlayer === 'white');
            whiteTimer.classList.toggle('low-time', this.whiteTime < 30000);
        }
        
        if (blackTimer) {
            blackTimer.textContent = this.formatTime(this.blackTime);
            blackTimer.classList.toggle('active', this.activePlayer === 'black');
            blackTimer.classList.toggle('low-time', this.blackTime < 30000);
        }
    }
}

// Time control presets
const TIME_CONTROLS = {
    bullet: {name: 'Bullet (1+0)', time: 60, increment: 0},
    blitz3: {name: 'Blitz (3+0)', time: 180, increment: 0},
    blitz5: {name: 'Blitz (5+0)', time: 300, increment: 0},
    rapid10: {name: 'Rapid (10+0)', time: 600, increment: 0},
    rapid15: {name: 'Rapid (15+10)', time: 900, increment: 10},
    classical: {name: 'Classical (30+0)', time: 1800, increment: 0},
    unlimited: {name: 'No Timer', time: 999999, increment: 0}
};

window.ChessTimer = ChessTimer;
window.TIME_CONTROLS = TIME_CONTROLS;

