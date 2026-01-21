/**
 * Base Game Class - Common functionality for all games
 * **Timestamp**: 2026-01-21
 *
 * Provides shared utilities for:
 * - Game state management
 * - Local storage persistence
 * - Score and statistics tracking
 * - Input handling
 * - Sound integration
 * - Theme support
 * - Canvas/grid rendering helpers
 */

class BaseGame {
    constructor(gameName, options = {}) {
        this.gameName = gameName;
        this.options = {
            enableSound: options.enableSound ?? true,
            enableLocalStorage: options.enableLocalStorage ?? true,
            enableThemes: options.enableThemes ?? true,
            enableStats: options.enableStats ?? true,
            ...options
        };

        // Core game state
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.lives = options.initialLives || 3;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseTime = 0;

        // UI elements
        this.statusElement = null;
        this.scoreElement = null;
        this.canvas = null;
        this.ctx = null;

        // Event handlers
        this.keyHandlers = new Map();
        this.clickHandlers = new Set();

        // Theme support
        this.currentTheme = 'default';
        this.themes = this.getDefaultThemes();

        // Stats tracking
        this.stats = this.loadStats();

        // Sound integration
        this.soundEnabled = this.options.enableSound;

        // Bind methods
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the game
     */
    init() {
        this.setupDOM();
        this.setupEventListeners();
        this.loadGameState();
        this.updateUI();

        if (this.options.enableThemes) {
            this.applyTheme();
        }

        console.log(`🎮 ${this.gameName} initialized`);
    }

    /**
     * Setup DOM elements
     */
    setupDOM() {
        // Try to find common elements
        this.statusElement = document.getElementById('status');
        this.scoreElement = document.getElementById('score');
        this.canvas = document.getElementById('gameCanvas');

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', this.handleKeyPress);

        // Mouse/Touch
        document.addEventListener('click', this.handleClick);

        // Window resize
        window.addEventListener('resize', this.handleResize);

        // Visibility change (pause/resume)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState === 'playing') {
                this.pause();
            }
        });
    }

    /**
     * Handle keyboard input
     */
    handleKeyPress(event) {
        const handler = this.keyHandlers.get(event.code) || this.keyHandlers.get(event.key);
        if (handler) {
            handler(event);
            event.preventDefault();
        }
    }

    /**
     * Handle mouse/touch input
     */
    handleClick(event) {
        this.clickHandlers.forEach(handler => handler(event));
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (this.canvas && this.onResize) {
            this.onResize();
        }
        this.updateUI();
    }

    /**
     * Start the game
     */
    start() {
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.updateUI();
        this.saveGameState();
        console.log(`🎯 ${this.gameName} started`);
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.pauseTime = Date.now();
            this.updateUI();
            console.log(`⏸️ ${this.gameName} paused`);
        }
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            if (this.pauseTime) {
                this.totalPauseTime += Date.now() - this.pauseTime;
                this.pauseTime = null;
            }
            this.updateUI();
            console.log(`▶️ ${this.gameName} resumed`);
        }
    }

    /**
     * End the game
     */
    end(finalScore = null) {
        this.gameState = 'gameOver';
        if (finalScore !== null) {
            this.score = finalScore;
        }

        // Update stats
        this.updateStats();

        // Save final state
        this.saveGameState();

        this.updateUI();
        console.log(`🏁 ${this.gameName} ended - Score: ${this.score}`);
    }

    /**
     * Reset the game
     */
    reset() {
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.lives = this.options.initialLives || 3;
        this.startTime = null;
        this.pauseTime = null;
        this.totalPauseTime = 0;
        this.updateUI();
        this.saveGameState();
        console.log(`🔄 ${this.gameName} reset`);
    }

    /**
     * Get elapsed game time (excluding pauses)
     */
    getElapsedTime() {
        if (!this.startTime) return 0;

        const now = Date.now();
        const totalTime = now - this.startTime - this.totalPauseTime;

        return Math.max(0, totalTime);
    }

    /**
     * Add keyboard handler
     */
    addKeyHandler(key, handler) {
        this.keyHandlers.set(key, handler);
    }

    /**
     * Remove keyboard handler
     */
    removeKeyHandler(key) {
        this.keyHandlers.delete(key);
    }

    /**
     * Add click handler
     */
    addClickHandler(handler) {
        this.clickHandlers.add(handler);
    }

    /**
     * Remove click handler
     */
    removeClickHandler(handler) {
        this.clickHandlers.delete(handler);
    }

    /**
     * Update score
     */
    updateScore(points) {
        this.score += points;
        this.updateUI();
        this.saveGameState();
    }

    /**
     * Update level
     */
    updateLevel(newLevel) {
        this.level = newLevel;
        this.updateUI();
        this.saveGameState();
    }

    /**
     * Update lives
     */
    updateLives(change) {
        this.lives += change;
        if (this.lives <= 0) {
            this.end();
        }
        this.updateUI();
        this.saveGameState();
    }

    /**
     * Play sound effect
     */
    playSound(soundName, options = {}) {
        if (!this.soundEnabled) return;

        if (window.gameSoundClient) {
            window.gameSoundClient.play(soundName, options);
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        if (this.statusElement) {
            const timeStr = this.getTimeString();
            const stateStr = this.getStateString();
            this.statusElement.textContent = `${stateStr} | Score: ${this.score} | Level: ${this.level} | Lives: ${this.lives} | Time: ${timeStr}`;
        }

        if (this.scoreElement) {
            this.scoreElement.textContent = this.score.toLocaleString();
        }
    }

    /**
     * Get formatted time string
     */
    getTimeString() {
        const elapsed = Math.floor(this.getElapsedTime() / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get state string
     */
    getStateString() {
        const stateMap = {
            'menu': 'Ready',
            'playing': 'Playing',
            'paused': 'Paused',
            'gameOver': 'Game Over'
        };
        return stateMap[this.gameState] || 'Unknown';
    }

    /**
     * Load game state from localStorage
     */
    loadGameState() {
        if (!this.options.enableLocalStorage) return;

        try {
            const saved = localStorage.getItem(`${this.gameName}_state`);
            if (saved) {
                const state = JSON.parse(saved);
                Object.assign(this, state);
                console.log(`💾 ${this.gameName} state loaded`);
            }
        } catch (e) {
            console.warn(`Failed to load ${this.gameName} state:`, e);
        }
    }

    /**
     * Save game state to localStorage
     */
    saveGameState() {
        if (!this.options.enableLocalStorage) return;

        try {
            const state = {
                gameState: this.gameState,
                score: this.score,
                level: this.level,
                lives: this.lives,
                startTime: this.startTime,
                totalPauseTime: this.totalPauseTime,
                currentTheme: this.currentTheme
            };

            localStorage.setItem(`${this.gameName}_state`, JSON.stringify(state));
        } catch (e) {
            console.warn(`Failed to save ${this.gameName} state:`, e);
        }
    }

    /**
     * Load statistics
     */
    loadStats() {
        if (!this.options.enableStats) return {};

        try {
            const saved = localStorage.getItem(`${this.gameName}_stats`);
            return saved ? JSON.parse(saved) : this.getDefaultStats();
        } catch (e) {
            console.warn(`Failed to load ${this.gameName} stats:`, e);
            return this.getDefaultStats();
        }
    }

    /**
     * Get default statistics
     */
    getDefaultStats() {
        return {
            gamesPlayed: 0,
            gamesWon: 0,
            highScore: 0,
            totalScore: 0,
            totalPlayTime: 0,
            bestTime: null,
            averageScore: 0
        };
    }

    /**
     * Update statistics
     */
    updateStats() {
        if (!this.options.enableStats) return;

        this.stats.gamesPlayed++;

        if (this.gameState === 'gameOver' && this.lives > 0) {
            this.stats.gamesWon++;
        }

        this.stats.highScore = Math.max(this.stats.highScore, this.score);
        this.stats.totalScore += this.score;
        this.stats.totalPlayTime += this.getElapsedTime();

        if (this.stats.bestTime === null || this.getElapsedTime() < this.stats.bestTime) {
            this.stats.bestTime = this.getElapsedTime();
        }

        this.stats.averageScore = this.stats.totalScore / this.stats.gamesPlayed;

        this.saveStats();
    }

    /**
     * Save statistics
     */
    saveStats() {
        if (!this.options.enableStats) return;

        try {
            localStorage.setItem(`${this.gameName}_stats`, JSON.stringify(this.stats));
        } catch (e) {
            console.warn(`Failed to save ${this.gameName} stats:`, e);
        }
    }

    /**
     * Get default themes
     */
    getDefaultThemes() {
        return {
            default: {
                background: '#000',
                foreground: '#fff',
                accent: '#4CAF50'
            },
            dark: {
                background: '#111',
                foreground: '#fff',
                accent: '#2196F3'
            },
            light: {
                background: '#fff',
                foreground: '#000',
                accent: '#FF9800'
            }
        };
    }

    /**
     * Set theme
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this.applyTheme();
            this.saveGameState();
        }
    }

    /**
     * Apply current theme
     */
    applyTheme() {
        if (!this.options.enableThemes) return;

        const theme = this.themes[this.currentTheme];
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.background);
        root.style.setProperty('--fg-color', theme.foreground);
        root.style.setProperty('--accent-color', theme.accent);
    }

    /**
     * Utility: Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Utility: Get random integer between min and max
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Utility: Shuffle array
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Utility: Format number with commas
     */
    formatNumber(num) {
        return num.toLocaleString();
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('click', this.handleClick);
        window.removeEventListener('resize', this.handleResize);

        // Clear handlers
        this.keyHandlers.clear();
        this.clickHandlers.clear();

        console.log(`🗑️ ${this.gameName} destroyed`);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseGame;
}