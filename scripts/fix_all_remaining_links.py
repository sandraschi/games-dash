#!/usr/bin/env python3
"""
Complete Fix for ALL Remaining Broken Links in Games App
Creates missing files and fixes all broken links - ZERO TOLERANCE FOR 404s
**Timestamp**: 2025-01-22
"""

import os
import json
import sys
from pathlib import Path
from typing import Dict, List

class CompleteLinkFixer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.games_dir = self.root_dir / "games"
        self.js_dir = self.root_dir / "js"
        self.report_file = self.root_dir / "link_check_report.json"
        self.fixes_applied = 0
        self.files_created = 0

        # Load current report
        if self.report_file.exists():
            with open(self.report_file, 'r', encoding='utf-8') as f:
                self.report = json.load(f)
        else:
            self.report = {"broken_links": [], "missing_scripts": []}

    def get_correct_path(self, from_file: str, link_target: str) -> str:
        """Get the correct relative path for a link"""
        from_path = self.root_dir / from_file
        from_dir = from_path.parent

        # Handle different types of links
        if link_target == "/":
            # Root links should go to dashboard
            dashboard_path = self.games_dir / "shared" / "dashboard.html"
            return os.path.relpath(dashboard_path, from_dir)

        elif link_target.startswith("/"):
            # Root-relative links
            target_path = self.root_dir / link_target.lstrip("/")
            if target_path.exists():
                return link_target  # Keep as-is if it exists
            else:
                # Try to find in games directory
                games_target = self.games_dir / link_target.lstrip("/")
                if games_target.exists():
                    return os.path.relpath(games_target, from_dir)
                else:
                    return link_target  # Keep original if we can't find it

        else:
            # Relative links - check if they exist
            target_path = from_dir / link_target
            if target_path.exists():
                return link_target
            else:
                # Try to find in other directories
                return self.find_correct_relative_path(from_dir, link_target)

    def find_correct_relative_path(self, from_dir: Path, target: str) -> str:
        """Find the correct relative path for a missing target"""

        # Educational pages linking back to main games
        game_name = target.replace(".html", "")
        if "educational" in str(from_dir):
            # Check arcade-games
            arcade_path = self.games_dir / "arcade-games" / target
            if arcade_path.exists():
                return os.path.relpath(arcade_path, from_dir)

            # Check board-games
            board_path = self.games_dir / "board-games" / target
            if board_path.exists():
                return os.path.relpath(board_path, from_dir)

            # Check puzzle-games
            puzzle_path = self.games_dir / "puzzle-games" / target
            if puzzle_path.exists():
                return os.path.relpath(puzzle_path, from_dir)

            # Check strategy-games
            strategy_path = self.games_dir / "strategy-games" / target
            if strategy_path.exists():
                return os.path.relpath(strategy_path, from_dir)

        return target  # Return original if not found

    def create_missing_script(self, script_path: str, content_type: str = "generic"):
        """Create a missing JavaScript file"""
        # Handle query parameters in script path
        clean_path = script_path.split('?')[0]  # Remove query parameters
        full_path = self.root_dir / clean_path.lstrip("/")

        # Ensure directory exists
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Generate appropriate content based on filename
        filename = full_path.name
        content = self.generate_script_content(filename, content_type)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  Created missing script: {script_path}")
        self.files_created += 1

    def generate_script_content(self, filename: str, content_type: str) -> str:
        """Generate appropriate JavaScript content"""

        if filename == "shogi-education.js":
            return """/**
 * Shogi Education Game Logic
 * **Timestamp**: 2025-01-22
 */

class ShogiEducation {
    constructor() {
        this.currentLesson = 0;
        this.lessons = [
            {
                title: "Shogi Basics",
                content: "Shogi is a Japanese chess variant...",
                moves: []
            }
        ];
        this.init();
    }

    init() {
        console.log('[SHOGI EDUCATION] Initialized');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add event listeners for education features
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
        });
    }

    initializeUI() {
        // Initialize education UI elements
        const container = document.querySelector('.education-container');
        if (container) {
            this.renderCurrentLesson();
        }
    }

    renderCurrentLesson() {
        // Render current lesson content
        const lesson = this.lessons[this.currentLesson];
        if (lesson) {
            console.log(`[SHOGI EDUCATION] Rendering lesson: ${lesson.title}`);
        }
    }

    nextLesson() {
        if (this.currentLesson < this.lessons.length - 1) {
            this.currentLesson++;
            this.renderCurrentLesson();
        }
    }

    previousLesson() {
        if (this.currentLesson > 0) {
            this.currentLesson--;
            this.renderCurrentLesson();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.shogiEducation = new ShogiEducation();
    });
} else {
    window.shogiEducation = new ShogiEducation();
}
"""

        elif filename == "word_database.js":
            return """/**
 * Crossword Word Database
 * **Timestamp**: 2025-01-22
 */

const WORD_DATABASE = {
    // Categories of words for crossword puzzles
    animals: [
        "ELEPHANT", "GIRAFFE", "KANGAROO", "PENGUIN", "DOLPHIN",
        "CHEETAH", "PANTHER", "OCTOPUS", "BUTTERFLY", "HUMMINGBIRD"
    ],

    countries: [
        "AUSTRALIA", "BRAZIL", "CANADA", "DENMARK", "EGYPT",
        "FRANCE", "GERMANY", "HUNGARY", "ICELAND", "JAPAN"
    ],

    colors: [
        "CRIMSON", "TURQUOISE", "MAGENTA", "INDIGO", "VIOLET",
        "SCARLET", "EMERALD", "SAFFRON", "CERULEAN", "OCHRE"
    ],

    professions: [
        "ARCHITECT", "BIOLOGIST", "CHEMIST", "DIETITIAN", "ENGINEER",
        "FINANCIER", "GEOLOGIST", "HISTORIAN", "INVENTOR", "JOURNALIST"
    ],

    foods: [
        "ARTICHOKE", "BROCCOLI", "CARAMEL", "DONUT", "ESCARGOT",
        "FETA", "GRANOLA", "HALIBUT", "ICECREAM", "JELLYBEAN"
    ]
};

class WordDatabase {
    constructor() {
        this.words = WORD_DATABASE;
        console.log('[WORD DATABASE] Initialized with', this.getTotalWords(), 'words');
    }

    getTotalWords() {
        return Object.values(this.words).reduce((total, category) => total + category.length, 0);
    }

    getWordsByCategory(category) {
        return this.words[category] || [];
    }

    getRandomWord(category = null) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            // Get random word from all categories
            const allWords = Object.values(this.words).flat();
            wordList = allWords;
        }

        if (wordList.length === 0) return null;
        return wordList[Math.floor(Math.random() * wordList.length)];
    }

    searchWords(query, category = null) {
        const searchTerm = query.toUpperCase();
        let wordList;

        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.includes(searchTerm));
    }

    getCategories() {
        return Object.keys(this.words);
    }
}

// Global instance
window.wordDatabase = new WordDatabase();
"""

        elif filename == "game-stats.js":
            return """/**
 * Game Statistics and Achievements System
 * **Timestamp**: 2025-01-22
 */

class GameStats {
    constructor() {
        this.stats = this.loadStats();
        this.achievements = this.loadAchievements();
        console.log('[GAME STATS] Initialized');
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('gameStats');
            return saved ? JSON.parse(saved) : this.getDefaultStats();
        } catch (e) {
            console.warn('[GAME STATS] Failed to load stats:', e);
            return this.getDefaultStats();
        }
    }

    getDefaultStats() {
        return {
            gamesPlayed: 0,
            totalScore: 0,
            highScore: 0,
            timePlayed: 0, // in seconds
            gamesWon: 0,
            gamesLost: 0,
            currentStreak: 0,
            bestStreak: 0,
            lastPlayed: null
        };
    }

    loadAchievements() {
        try {
            const saved = localStorage.getItem('gameAchievements');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('[GAME STATS] Failed to load achievements:', e);
            return {};
        }
    }

    saveStats() {
        try {
            localStorage.setItem('gameStats', JSON.stringify(this.stats));
        } catch (e) {
            console.warn('[GAME STATS] Failed to save stats:', e);
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('gameAchievements', JSON.stringify(this.achievements));
        } catch (e) {
            console.warn('[GAME STATS] Failed to save achievements:', e);
        }
    }

    updateStats(gameResult) {
        this.stats.gamesPlayed++;
        this.stats.totalScore += gameResult.score || 0;
        this.stats.timePlayed += gameResult.duration || 0;
        this.stats.lastPlayed = new Date().toISOString();

        if (gameResult.won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
        } else {
            this.stats.gamesLost++;
            this.stats.currentStreak = 0;
        }

        this.stats.highScore = Math.max(this.stats.highScore, gameResult.score || 0);

        this.saveStats();
        this.checkAchievements();
    }

    checkAchievements() {
        // Define achievements
        const achievementDefinitions = {
            firstWin: { condition: () => this.stats.gamesWon >= 1, name: "First Victory" },
            highScorer: { condition: () => this.stats.highScore >= 1000, name: "High Scorer" },
            dedicatedPlayer: { condition: () => this.stats.gamesPlayed >= 10, name: "Dedicated Player" },
            streakMaster: { condition: () => this.stats.bestStreak >= 5, name: "Streak Master" },
            timePlayer: { condition: () => this.stats.timePlayed >= 3600, name: "Time Player" } // 1 hour
        };

        // Check and unlock achievements
        for (const [key, achievement] of Object.entries(achievementDefinitions)) {
            if (!this.achievements[key] && achievement.condition()) {
                this.achievements[key] = {
                    unlocked: true,
                    date: new Date().toISOString(),
                    name: achievement.name
                };
                this.showAchievementNotification(achievement.name);
            }
        }

        this.saveAchievements();
    }

    showAchievementNotification(achievementName) {
        // Show achievement unlocked notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <h4>🏆 Achievement Unlocked!</h4>
                <p>${achievementName}</p>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideInAchievement 0.5s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getStatsSummary() {
        return {
            ...this.stats,
            winRate: this.stats.gamesPlayed > 0 ? (this.stats.gamesWon / this.stats.gamesPlayed * 100).toFixed(1) : 0,
            averageScore: this.stats.gamesPlayed > 0 ? Math.round(this.stats.totalScore / this.stats.gamesPlayed) : 0,
            achievementsUnlocked: Object.keys(this.achievements).length
        };
    }
}

// CSS for achievement animation
const achievementStyles = document.createElement('style');
achievementStyles.textContent = `
    @keyframes slideInAchievement {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(achievementStyles);

// Initialize global instance
window.gameStats = new GameStats();
"""

        elif filename == "canva-client.js":
            return """/**
 * Canva Integration Client
 * **Timestamp**: 2025-01-22
 */

class CanvaClient {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.canvaSDK = null;
        console.log('[CANVA CLIENT] Initialized');
    }

    async init(apiKey = null) {
        if (this.isInitialized) return;

        this.apiKey = apiKey || this.getStoredApiKey();

        try {
            // Load Canva SDK if available
            if (window.Canva && window.Canva.DesignButton) {
                this.canvaSDK = window.Canva;
                this.setupDesignButtons();
                this.isInitialized = true;
                console.log('[CANVA CLIENT] Canva SDK loaded successfully');
            } else {
                console.warn('[CANVA CLIENT] Canva SDK not available');
                // Load SDK dynamically if needed
                await this.loadSDK();
            }
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to initialize:', error);
        }
    }

    getStoredApiKey() {
        try {
            return localStorage.getItem('canvaApiKey');
        } catch (e) {
            return null;
        }
    }

    storeApiKey(apiKey) {
        try {
            localStorage.setItem('canvaApiKey', apiKey);
            this.apiKey = apiKey;
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to store API key:', e);
        }
    }

    async loadSDK() {
        return new Promise((resolve, reject) => {
            // Check if SDK is already loading
            if (document.querySelector('script[src*="canva"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
            script.onload = () => {
                console.log('[CANVA CLIENT] SDK loaded dynamically');
                this.canvaSDK = window.Canva;
                this.setupDesignButtons();
                this.isInitialized = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupDesignButtons() {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) return;

        // Find all Canva design buttons
        const buttons = document.querySelectorAll('[data-canva-design-button]');
        buttons.forEach(button => {
            this.initDesignButton(button);
        });
    }

    initDesignButton(element) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) return;

        const designType = element.dataset.designType || 'Poster';
        const designButton = this.canvaSDK.DesignButton.create({
            apiKey: this.apiKey,
            design: {
                type: designType
            },
            onDesignOpen: (designId) => {
                console.log('[CANVA CLIENT] Design opened:', designId);
            },
            onDesignPublish: (designUrl) => {
                console.log('[CANVA CLIENT] Design published:', designUrl);
                // Handle published design
                this.handlePublishedDesign(designUrl, element);
            },
            onError: (error) => {
                console.error('[CANVA CLIENT] Design button error:', error);
            }
        });

        designButton.mount(element);
    }

    handlePublishedDesign(designUrl, sourceElement) {
        // Handle when user publishes a design from Canva
        console.log('[CANVA CLIENT] Design published:', designUrl);

        // You could save this to game state, share it, etc.
        if (window.gameState) {
            window.gameState.canvaDesigns = window.gameState.canvaDesigns || [];
            window.gameState.canvaDesigns.push({
                url: designUrl,
                timestamp: new Date().toISOString(),
                source: sourceElement.id || 'unknown'
            });
        }
    }

    createDesign(designType = 'Poster', options = {}) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) {
            console.warn('[CANVA CLIENT] Canva SDK not available');
            return;
        }

        // Create a temporary button and click it
        const tempButton = document.createElement('button');
        tempButton.style.display = 'none';
        tempButton.dataset.designType = designType;
        document.body.appendChild(tempButton);

        this.initDesignButton(tempButton);

        // Trigger click after a short delay
        setTimeout(() => {
            tempButton.click();
            document.body.removeChild(tempButton);
        }, 100);
    }

    getDesignHistory() {
        if (!window.gameState || !window.gameState.canvaDesigns) {
            return [];
        }
        return window.gameState.canvaDesigns;
    }
}

// Initialize global instance
window.canvaClient = new CanvaClient();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.canvaClient.init();
    });
} else {
    window.canvaClient.init();
}
"""

        elif filename == "jenga.js":
            return """/**
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
"""

        else:
            # Generic script template
            return f"""/**
 * {filename.replace('.js', '').replace('-', ' ').title()} Module
 * Auto-generated script
 * **Timestamp**: 2025-01-22
 */

class {filename.replace('.js', '').replace('-', '').title()}Module {{
    constructor() {{
        console.log('[GENERIC MODULE] Initialized');
        this.init();
    }}

    init() {{
        // Initialize module
        this.setupEventListeners();
    }}

    setupEventListeners() {{
        // Add event listeners
        document.addEventListener('DOMContentLoaded', () => {{
            this.initializeUI();
        }});
    }}

    initializeUI() {{
        // Initialize UI elements
        console.log('[GENERIC MODULE] UI initialized');
    }}
}}

// Initialize global instance
window.genericModule = new GenericModule();
"""

    def create_missing_html_pages(self):
        """Create missing HTML pages that are referenced"""
        print("Creating missing HTML pages...")

        # Define pages that need to be created
        missing_pages = {
            "games/educational/jenga.html": self.create_jenga_html,
            "games/educational/minesweeper.html": self.create_minesweeper_html,
            "games/educational/ms-pacman.html": self.create_ms_pacman_html,
            "games/educational/pacman.html": self.create_pacman_html,
            "games/educational/pipe-connect.html": self.create_pipe_connect_html,
            "games/educational/pong.html": self.create_pong_html,
            "games/educational/royal-game-of-ur.html": self.create_royal_game_of_ur_html,
            "games/educational/rubiks.html": self.create_rubiks_html,
            "games/puzzle-games/gem-cascade.html": self.create_gem_cascade_html
        }

        for page_path, creator_func in missing_pages.items():
            full_path = self.root_dir / page_path
            if not full_path.exists():
                full_path.parent.mkdir(parents=True, exist_ok=True)
                content = creator_func()
                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  Created missing page: {page_path}")
                self.files_created += 1

    def create_jenga_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jenga - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/responsive-boards.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
    <script src="/js/jenga.js"></script>
    <style>
        .jenga-ui {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .game-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .game-header h1 {
            color: gold;
            font-size: 2.5em;
            margin-bottom: 20px;
        }

        .game-controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .game-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .game-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .game-stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }

        .stat {
            font-size: 18px;
            color: #FFD700;
        }

        .game-canvas {
            width: 100%;
            height: 600px;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            border-radius: 15px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .tower-container {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 400px;
        }

        .tower-level {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2px;
        }

        .tower-level:nth-child(even) {
            margin-left: 15px;
        }

        .jenga-block {
            width: 60px;
            height: 20px;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
            border: 1px solid #654321;
            border-radius: 3px;
            position: relative;
            cursor: grab;
            transition: all 0.3s ease;
        }

        .jenga-block:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .jenga-block.dragging {
            cursor: grabbing;
            z-index: 1000;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        }

        .jenga-block.removed {
            opacity: 0;
            transform: translateY(100px) rotate(45deg);
        }

        .jenga-block.falling {
            animation: fall 0.5s ease-in forwards;
        }

        @keyframes fall {
            to {
                transform: translateY(200px) rotate(90deg);
                opacity: 0;
            }
        }

        .start-screen {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: white;
            text-align: center;
            padding: 40px;
        }

        .start-screen h2 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: gold;
        }

        .difficulty-info {
            margin-top: 30px;
            text-align: left;
            max-width: 500px;
        }

        .difficulty-info h3 {
            color: #FFD700;
            margin-bottom: 15px;
        }

        .difficulty-info ul {
            list-style: none;
            padding: 0;
        }

        .difficulty-info li {
            margin-bottom: 10px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }

        .game-messages {
            margin-top: 20px;
            min-height: 50px;
        }

        .game-message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            font-weight: bold;
            text-align: center;
        }

        .game-message.success {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
        }

        .game-message.error {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
        }

        @media (max-width: 768px) {
            .jenga-ui {
                padding: 10px;
            }

            .game-header h1 {
                font-size: 2em;
            }

            .game-canvas {
                height: 400px;
            }

            .jenga-block {
                width: 45px;
                height: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container game-container">
        <a href="/games/shared/dashboard.html" class="back-button">← Back to Games</a>

        <div id="jenga-container">
            <!-- Game UI will be inserted here by JavaScript -->
        </div>
    </div>
</body>
</html>"""

    def create_minesweeper_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minesweeper - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>💣 Minesweeper</h1>
            <p>Classic puzzle game - find all mines without clicking on them!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>This is a classic Minesweeper implementation.</p>
                <p>Click to reveal cells, right-click to flag mines.</p>
                <p>Find all mines to win!</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Minesweeper game implementation is under development.</p>
                <p>Check back later for the complete experience!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_ms_pacman_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ms Pac-Man - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Ms Pac-Man</a>

        <div class="game-header">
            <h1>👻 Ms Pac-Man</h1>
            <p>The classic arcade game with a female protagonist!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>Guide Ms Pac-Man through the maze, eating dots while avoiding ghosts.</p>
                <p>Eat power pellets to turn the tables on your pursuers!</p>
                <p>Use arrow keys or WASD to move.</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Ms Pac-Man game implementation is under development.</p>
                <p>Check back later for the complete arcade experience!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_pacman_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pac-Man - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>👻 Pac-Man</h1>
            <p>The original arcade classic that started it all!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>Guide Pac-Man through the maze, eating all the dots.</p>
                <p>Avoid the colorful ghosts that chase you!</p>
                <p>Eat the flashing power pellets to turn the tables.</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Pac-Man game implementation is under development.</p>
                <p>Check back later for the complete retro gaming experience!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_pipe_connect_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pipe Connect - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>🔧 Pipe Connect</h1>
            <p>Connect the pipes to create a complete plumbing system!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>Rotate pipe pieces to connect the water source to the destination.</p>
                <p>Create a continuous path through all the pipe segments.</p>
                <p>Think carefully - you can only rotate, not move pieces!</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Pipe Connect puzzle game is under development.</p>
                <p>Check back later for challenging pipe connection puzzles!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_pong_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pong - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>🏓 Pong</h1>
            <p>The game that started the video game revolution!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>Use your paddle to bounce the ball past your opponent's paddle.</p>
                <p>First to reach the winning score wins the game!</p>
                <p>Features single-player vs AI and local multiplayer modes.</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Pong game implementation is under development.</p>
                <p>Check back later for the classic paddle game experience!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_royal_game_of_ur_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Royal Game of Ur - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>👑 Royal Game of Ur</h1>
            <p>Ancient Mesopotamian board game dating back to 2600 BCE!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>The Royal Game of Ur is one of the oldest known board games.</p>
                <p>Race your pieces around the board using dice (or tetrahedrons).</p>
                <p>Land on rosette squares for special bonuses!</p>
                <p>Capture opponent pieces and reach the end first to win.</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Royal Game of Ur implementation is under development.</p>
                <p>Check back later for this ancient gaming experience!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_rubiks_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rubik's Cube - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>🧩 Rubik's Cube</h1>
            <p>The world's most famous puzzle - can you solve it?</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>Rotate the faces of the cube to align all colors.</p>
                <p>Each face should show one solid color when solved.</p>
                <p>Use algorithms and patterns to solve systematically.</p>
                <p>Features step-by-step solving guides for beginners.</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Rubik's Cube solver and simulator is under development.</p>
                <p>Check back later for 3D cube manipulation and solving tutorials!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def create_gem_cascade_html(self):
        return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gem Cascade - Games Collection</title>
    <link rel="stylesheet" href="/styles.css">
    <script src="/js/global-error-handler.js"></script>
    <script src="/js/theme-switcher.js"></script>
    <script src="/js/device-adaptive.js"></script>
</head>
<body>
    <div class="container game-container">
        <a href="../shared/dashboard.html" class="back-button">← Back to Game</a>

        <div class="game-header">
            <h1>💎 Gem Cascade</h1>
            <p>Match colorful gems in this addictive puzzle game!</p>
        </div>

        <div class="game-content">
            <div class="game-info">
                <p>Click on groups of 2 or more matching gems to remove them.</p>
                <p>Create chain reactions for bonus points!</p>
                <p>The more gems you clear at once, the higher your score.</p>
                <p>Strategic placement can create massive cascades.</p>
            </div>

            <div class="coming-soon">
                <h2>🚧 Coming Soon!</h2>
                <p>Full Gem Cascade puzzle game is under development.</p>
                <p>Check back later for colorful gem-matching action!</p>
            </div>
        </div>
    </div>
</body>
</html>"""

    def fix_all_remaining_links(self):
        """Fix all remaining broken links from the report"""
        print("Fixing all remaining broken links...")

        for link in self.report.get("broken_links", []):
            html_file = self.root_dir / link["file"]
            if not html_file.exists():
                continue

            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            modified = False

            # Fix "/" links to dashboard
            if link["link"] == "/" and "Back to Games" in link["text"]:
                new_href = self.get_correct_path(html_file, "/")
                if new_href != "/":
                    old_link = '<a href="/" class="back-button">← Back to Games</a>'
                    new_link = f'<a href="{new_href}" class="back-button">← Back to Games</a>'
                    if old_link in content:
                        content = content.replace(old_link, new_link)
                        modified = True
                        print(f"  Fixed: {link['file']} -> / to {new_href}")

            # Fix other navigation links
            elif link["link"].endswith(".html") and not link["link"].startswith("/"):
                correct_path = self.get_correct_path(html_file, link["link"])
                if correct_path != link["link"]:
                    old_href = f'href="{link["link"]}"'
                    new_href = f'href="{correct_path}"'
                    if old_href in content:
                        content = content.replace(old_href, new_href)
                        modified = True
                        print(f"  Fixed: {link['file']} -> {link['link']} to {correct_path}")

            if modified:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.fixes_applied += 1

    def fix_all_missing_scripts(self):
        """Create all missing scripts"""
        print("Creating all missing scripts...")

        for script in self.report.get("missing_scripts", []):
            self.create_missing_script(script["link"])
            self.fixes_applied += 1

    def run_complete_fix(self):
        """Run the complete fix process"""
        print("STARTING COMPLETE LINK FIX - ZERO TOLERANCE FOR 404s")
        print(f"Working directory: {self.root_dir}")
        print("=" * 60)

        # Create missing pages first
        self.create_missing_html_pages()

        # Create missing scripts
        self.fix_all_missing_scripts()

        # Fix all remaining broken links
        self.fix_all_remaining_links()

        print("\n" + "=" * 60)
        print("COMPLETE FIX FINISHED!")
        print(f"Files created: {self.files_created}")
        print(f"Links fixed: {self.fixes_applied}")

        # Final verification
        print("\nRunning final verification...")
        self.verify_complete_fix()

    def verify_complete_fix(self):
        """Final verification that everything is fixed"""
        print("Running final link check...")

        # Run link checker again
        import subprocess
        import sys

        try:
            result = subprocess.run([
                sys.executable, "scripts/link_checker.py", str(self.root_dir)
            ], cwd=self.root_dir, capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                # Parse the output to check results
                output_lines = result.stdout.split('\n')
                for line in output_lines:
                    if "Broken internal links:" in line:
                        broken_count = int(line.split(":")[1].strip())
                        if broken_count == 0:
                            print("SUCCESS: All broken links fixed!")
                        else:
                            print(f"Remaining broken links: {broken_count}")
                    elif "Missing scripts:" in line:
                        missing_count = int(line.split(":")[1].strip())
                        if missing_count == 0:
                            print("SUCCESS: All missing scripts created!")
                        else:
                            print(f"Remaining missing scripts: {missing_count}")

                print("\nFinal status check complete.")
                if "All broken links fixed!" in result.stdout and "All missing scripts created!" in result.stdout:
                    print("MISSION ACCOMPLISHED: Zero 404s in the games app!")
                else:
                    print("Some issues may remain - check the detailed report.")
            else:
                print("Verification failed - check for errors")

        except subprocess.TimeoutExpired:
            print("Verification timed out - but fixes should be applied")
        except Exception as e:
            print(f"Verification error: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python fix_all_remaining_links.py <games_app_root_directory>")
        sys.exit(1)

    root_dir = sys.argv[1]

    if not Path(root_dir).exists():
        print(f"Directory {root_dir} does not exist")
        sys.exit(1)

    fixer = CompleteLinkFixer(root_dir)
    fixer.run_complete_fix()

if __name__ == "__main__":
    main()