/**
 * Jenga Game Logic
 * **Timestamp**: 2025-01-22
 */

class JengaGame {
    constructor(containerId = 'jenga-container') {
        this.container = document.getElementById(containerId);
        this.blocks = [];
        this.selectedBlock = null;
        this.isGameActive = false;
        this.towerHeight = 18; // 18 levels for standard Jenga
        this.currentLevel = 0;
        this.gameMode = 'classic'; // classic, speed, puzzle
        this.difficulty = 'normal';

        this.init();
    }

    init() {
        console.log('[JENGA] Initializing Jenga game');
        this.setupEventListeners();
        this.createUI();
        this.showStartScreen();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeGame();
        });

        // Touch/mouse events for mobile and desktop
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }

    createUI() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="jenga-ui">
                <div class="game-header">
                    <h1>🏗️ Jenga</h1>
                    <div class="game-controls">
                        <button id="start-game" class="game-btn">Start Game</button>
                        <button id="reset-game" class="game-btn">Reset</button>
                        <select id="difficulty-select">
                            <option value="easy">Easy</option>
                            <option value="normal" selected>Normal</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>
                <div class="game-stats">
                    <div class="stat">Moves: <span id="moves-count">0</span></div>
                    <div class="stat">Height: <span id="tower-height">18</span></div>
                    <div class="stat">Time: <span id="game-timer">00:00</span></div>
                </div>
                <div id="game-canvas" class="game-canvas"></div>
                <div id="game-messages" class="game-messages"></div>
            </div>
        `;

        this.bindUIEvents();
    }

    bindUIEvents() {
        const startBtn = document.getElementById('start-game');
        const resetBtn = document.getElementById('reset-game');
        const difficultySelect = document.getElementById('difficulty-select');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }

        if (difficultySelect) {
            difficultySelect.addEventListener('change', (e) => {
                this.difficulty = e.target.value;
            });
        }
    }

    showStartScreen() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.innerHTML = `
                <div class="start-screen">
                    <h2>Welcome to Jenga!</h2>
                    <p>Click and drag blocks to remove them from the tower.</p>
                    <p>Try not to let the tower fall!</p>
                    <div class="difficulty-info">
                        <h3>Difficulty Levels:</h3>
                        <ul>
                            <li><strong>Easy:</strong> More stable blocks, forgiving physics</li>
                            <li><strong>Normal:</strong> Standard Jenga physics</li>
                            <li><strong>Hard:</strong> Unstable blocks, realistic physics</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    startGame() {
        console.log('[JENGA] Starting game');
        this.isGameActive = true;
        this.moves = 0;
        this.startTime = Date.now();
        this.buildTower();
        this.updateUI();
    }

    resetGame() {
        console.log('[JENGA] Resetting game');
        this.isGameActive = false;
        this.blocks = [];
        this.moves = 0;
        this.currentLevel = 0;
        this.showStartScreen();
        this.updateUI();
    }

    buildTower() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        canvas.innerHTML = '<div class="tower-container"></div>';
        const towerContainer = canvas.querySelector('.tower-container');

        // Build tower level by level
        for (let level = 0; level < this.towerHeight; level++) {
            this.addTowerLevel(towerContainer, level);
        }

        console.log(`[JENGA] Built tower with ${this.blocks.length} blocks`);
    }

    addTowerLevel(container, level) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'tower-level';
        levelDiv.dataset.level = level;

        // Alternate block orientation every level
        const isVerticalLevel = level % 2 === 0;
        const blockCount = isVerticalLevel ? 3 : 3; // 3 blocks per level

        for (let i = 0; i < blockCount; i++) {
            const block = this.createBlock(level, i, isVerticalLevel);
            levelDiv.appendChild(block);
            this.blocks.push(block);
        }

        container.appendChild(levelDiv);
    }

    createBlock(level, position, isVertical) {
        const block = document.createElement('div');
        block.className = `jenga-block ${isVertical ? 'vertical' : 'horizontal'}`;
        block.dataset.level = level;
        block.dataset.position = position;
        block.draggable = true;

        // Add physics properties based on difficulty
        const stability = this.getBlockStability();
        block.dataset.stability = stability;

        return block;
    }

    getBlockStability() {
        const baseStability = {
            easy: 0.8,
            normal: 0.6,
            hard: 0.4
        };

        const base = baseStability[this.difficulty] || 0.6;
        // Add some randomness
        return Math.max(0.1, Math.min(1.0, base + (Math.random() - 0.5) * 0.2));
    }

    handleMouseDown(e) {
        if (!this.isGameActive) return;

        const block = e.target.closest('.jenga-block');
        if (block) {
            this.selectedBlock = block;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            block.classList.add('dragging');
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (!this.selectedBlock) return;

        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        // Move block visually
        this.selectedBlock.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    handleMouseUp(e) {
        if (!this.selectedBlock) return;

        const block = this.selectedBlock;
        block.classList.remove('dragging');

        // Check if block was moved significantly
        const transform = block.style.transform;
        if (transform && transform !== 'translate(0px, 0px)') {
            // Block was moved - remove it from tower
            this.removeBlock(block);
        } else {
            // Reset position
            block.style.transform = '';
        }

        this.selectedBlock = null;
    }

    handleTouchStart(e) {
        if (!this.isGameActive) return;

        const touch = e.touches[0];
        const block = touch.target.closest('.jenga-block');
        if (block) {
            this.selectedBlock = block;
            this.dragStartX = touch.clientX;
            this.dragStartY = touch.clientY;
            block.classList.add('dragging');
            e.preventDefault();
        }
    }

    handleTouchMove(e) {
        if (!this.selectedBlock) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.dragStartX;
        const deltaY = touch.clientY - this.dragStartY;

        this.selectedBlock.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.selectedBlock) return;

        const block = this.selectedBlock;
        block.classList.remove('dragging');

        const transform = block.style.transform;
        if (transform && transform !== 'translate(0px, 0px)') {
            this.removeBlock(block);
        } else {
            block.style.transform = '';
        }

        this.selectedBlock = null;
    }

    removeBlock(block) {
        this.moves++;
        block.classList.add('removed');

        // Apply physics to nearby blocks
        setTimeout(() => {
            this.applyPhysics(block);
        }, 100);

        this.updateUI();
        this.checkWinCondition();
    }

    applyPhysics(removedBlock) {
        const level = parseInt(removedBlock.dataset.level);
        const position = parseInt(removedBlock.dataset.position);

        // Find blocks in the same level and above
        const affectedBlocks = this.blocks.filter(b => {
            const bLevel = parseInt(b.dataset.level);
            return bLevel >= level && !b.classList.contains('removed');
        });

        // Apply gravity and stability checks
        affectedBlocks.forEach(block => {
            const stability = parseFloat(block.dataset.stability);
            if (Math.random() > stability) {
                // Block falls
                block.classList.add('falling');
                setTimeout(() => {
                    block.classList.add('removed');
                    this.checkTowerCollapse();
                }, 500);
            }
        });
    }

    checkTowerCollapse() {
        const remainingBlocks = this.blocks.filter(b => !b.classList.contains('removed'));
        const totalBlocks = this.blocks.length;
        const collapseRatio = remainingBlocks.length / totalBlocks;

        if (collapseRatio < 0.3) { // Less than 30% of blocks remaining
            this.gameOver(false); // Loss
        }
    }

    checkWinCondition() {
        // Win if tower is still standing after many moves
        if (this.moves >= this.towerHeight * 2) {
            const standingBlocks = this.blocks.filter(b =>
                !b.classList.contains('removed') && !b.classList.contains('falling')
            );

            if (standingBlocks.length > this.blocks.length * 0.5) {
                this.gameOver(true); // Win
            }
        }
    }

    gameOver(won) {
        this.isGameActive = false;
        const message = won ? 'Congratulations! Tower survived!' : 'Tower collapsed! Game Over!';

        this.showMessage(message, won ? 'success' : 'error');

        // Update stats
        if (window.gameStats) {
            window.gameStats.updateStats({
                score: this.moves * 10,
                won: won,
                duration: Math.floor((Date.now() - this.startTime) / 1000),
                game: 'jenga'
            });
        }
    }

    showMessage(text, type = 'info') {
        const messagesDiv = document.getElementById('game-messages');
        if (!messagesDiv) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `game-message ${type}`;
        messageDiv.textContent = text;

        messagesDiv.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    updateUI() {
        const movesCount = document.getElementById('moves-count');
        const towerHeight = document.getElementById('tower-height');
        const gameTimer = document.getElementById('game-timer');

        if (movesCount) movesCount.textContent = this.moves;
        if (towerHeight) towerHeight.textContent = this.towerHeight;

        if (gameTimer && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    initializeGame() {
        console.log('[JENGA] Game initialized');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.jengaGame = new JengaGame();
    });
} else {
    window.jengaGame = new JengaGame();
}
