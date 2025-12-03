// Chess AI Integration (Stockfish)
// **Timestamp**: 2025-12-03

class ChessAI {
    constructor() {
        this.worker = null;
        this.difficulty = 10; // 1-20
        this.thinking = false;
        this.onMove = null;
    }
    
    async initialize() {
        // Use CDN-hosted Stockfish
        try {
            this.worker = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');
            
            this.worker.onmessage = (event) => {
                const message = event.data;
                console.log('Stockfish:', message);
                
                if (message.startsWith('bestmove')) {
                    const move = message.split(' ')[1];
                    this.thinking = false;
                    if (this.onMove) {
                        this.onMove(move);
                    }
                }
            };
            
            this.worker.postMessage('uci');
            return true;
        } catch (error) {
            console.error('Failed to load Stockfish:', error);
            return false;
        }
    }
    
    setDifficulty(level) {
        this.difficulty = Math.max(1, Math.min(20, level));
    }
    
    async getBestMove(fen) {
        if (!this.worker) {
            console.error('Stockfish not initialized');
            return null;
        }
        
        this.thinking = true;
        
        return new Promise((resolve) => {
            this.onMove = resolve;
            this.worker.postMessage(`position fen ${fen}`);
            this.worker.postMessage(`go depth ${this.difficulty}`);
        });
    }
    
    stop() {
        if (this.worker) {
            this.worker.postMessage('stop');
            this.thinking = false;
        }
    }
}

// Export for use in chess.html
window.ChessAI = ChessAI;

