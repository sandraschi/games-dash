#!/usr/bin/env python3
"""
Final Link Fix - Zero 404s
**Timestamp**: 2025-01-22
"""

import os
import json
from pathlib import Path

class FinalLinkFixer:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.games_dir = self.root_dir / "games"

    def fix_remaining_links(self):
        """Fix all remaining broken links"""
        print("Fixing remaining broken links...")

        # Fix root "/" links
        root_links_to_fix = [
            "games/arcade-games/pong-spectacular.html",
            "games/board-games/backgammon-education.html",
            "games/educational/rubiks-encyclopedia.html"
        ]

        for file_path in root_links_to_fix:
            full_path = self.root_dir / file_path
            if full_path.exists():
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace root links with dashboard
                content = content.replace(
                    '<a href="/" class="back-button">',
                    '<a href="../shared/dashboard.html" class="back-button">'
                )

                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"  Fixed root link in {file_path}")

        # Fix educational page links
        educational_fixes = [
            ("games/educational/vocabulary.html", "kanji-table.html", "../japan/kanji-table.html"),
            ("games/educational/vocabulary.html", "dictionary.html", "../shared/dictionary.html")
        ]

        for file_path, old_link, new_link in educational_fixes:
            full_path = self.root_dir / file_path
            if full_path.exists():
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                content = content.replace(f'href="{old_link}"', f'href="{new_link}"')

                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"  Fixed educational link in {file_path}")

        # Fix Japan page links
        japan_files = [
            "games/japan/20thcentury.html",
            "games/japan/anime.html",
            "games/japan/art.html",
            "games/japan/bakumatsu.html"
        ]

        for file_path in japan_files:
            full_path = self.root_dir / file_path
            if full_path.exists():
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Fix link to knowledge tree
                content = content.replace(
                    'href="japanese-knowledge-tree.html"',
                    'href="../japan/japanese-knowledge-tree.html"'
                )

                with open(full_path, 'w', encoding='utf-8') as f:
                    f.write(content)

                print(f"  Fixed Japan page link in {file_path}")

    def create_missing_script(self, script_path, content):
        """Create missing script file"""
        full_path = self.root_dir / script_path.lstrip("/")
        full_path.parent.mkdir(parents=True, exist_ok=True)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"  Created script: {script_path}")

    def implement_word_database(self):
        """Implement real word database functionality"""
        content = '''/**
 * Crossword Word Database
 * Comprehensive word database for crossword puzzles
 * **Timestamp**: 2025-01-22
 */

const WORD_DATABASE = {
    animals: [
        "ELEPHANT", "GIRAFFE", "KANGAROO", "PENGUIN", "DOLPHIN",
        "CHEETAH", "PANTHER", "OCTOPUS", "BUTTERFLY", "HUMMINGBIRD",
        "RHINOCEROS", "HIPPOPOTAMUS", "CHIMPANZEE", "KANGAROO", "OSTRICH",
        "FLAMINGO", "PEACOCK", "PARROT", "EAGLE", "HAWK",
        "TIGER", "LION", "BEAR", "WOLF", "FOX"
    ],

    countries: [
        "AUSTRALIA", "BRAZIL", "CANADA", "DENMARK", "EGYPT",
        "FRANCE", "GERMANY", "HUNGARY", "ICELAND", "JAPAN",
        "MONGOLIA", "NORWAY", "POLAND", "ROMANIA", "SWEDEN",
        "THAILAND", "UKRAINE", "VIETNAM", "ZAMBIA", "ZIMBABWE",
        "MEXICO", "SPAIN", "ITALY", "GREECE", "TURKEY"
    ],

    colors: [
        "CRIMSON", "TURQUOISE", "MAGENTA", "INDIGO", "VIOLET",
        "SCARLET", "EMERALD", "SAFFRON", "CERULEAN", "OCHRE",
        "AMBER", "AZURE", "BEIGE", "BISTRE", "BUFF",
        "CARDINAL", "CARMINE", "CELADON", "CHARTREUSE", "CINNAMON",
        "EBONY", "FLAME", "GOLDEN", "JADE", "LAVENDER"
    ],

    professions: [
        "ARCHITECT", "BIOLOGIST", "CHEMIST", "DIETITIAN", "ENGINEER",
        "FINANCIER", "GEOLOGIST", "HISTORIAN", "INVENTOR", "JOURNALIST",
        "LAWYER", "DOCTOR", "TEACHER", "PILOT", "CHEF",
        "ARTIST", "MUSICIAN", "WRITER", "ACTOR", "DIRECTOR",
        "SCIENTIST", "PROGRAMMER", "DESIGNER", "PHOTOGRAPHER", "FARMER"
    ],

    foods: [
        "ARTICHOKE", "BROCCOLI", "CARAMEL", "DONUT", "ESCARGOT",
        "FETA", "GRANOLA", "HALIBUT", "ICECREAM", "JELLYBEAN",
        "KALE", "LASAGNA", "MACARONI", "NOODLES", "OMELETTE",
        "PASTA", "QUICHE", "RATATOUILLE", "SPAGHETTI", "TABBOULEH",
        "SUSHI", "RAMEN", "TEMPURA", "SAKURA", "WASABI"
    ],

    sports: [
        "BASKETBALL", "FOOTBALL", "VOLLEYBALL", "TENNIS", "GOLF",
        "SWIMMING", "CYCLING", "RUNNING", "JUMPING", "THROWING",
        "SOCCER", "HOCKEY", "BASEBALL", "CRICKET", "RUGBY",
        "BOXING", "WRESTLING", "KARATE", "JUDO", "SUMO"
    ]
};

class WordDatabase {
    constructor() {
        this.words = WORD_DATABASE;
        this.usedWords = new Set();
        console.log('[WORD DATABASE] Initialized with', this.getTotalWords(), 'words across', Object.keys(this.words).length, 'categories');
    }

    getTotalWords() {
        return Object.values(this.words).reduce((total, category) => total + category.length, 0);
    }

    getWordsByCategory(category) {
        return this.words[category] || [];
    }

    getRandomWord(category = null, excludeUsed = false) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        if (excludeUsed) {
            wordList = wordList.filter(word => !this.usedWords.has(word));
        }

        if (wordList.length === 0) {
            if (excludeUsed) {
                this.usedWords.clear();
                return this.getRandomWord(category, false);
            }
            return null;
        }

        const randomIndex = Math.floor(Math.random() * wordList.length);
        const selectedWord = wordList[randomIndex];

        if (excludeUsed) {
            this.usedWords.add(selectedWord);
        }

        return selectedWord;
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

    getWordsByLength(length, category = null) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.length === length);
    }

    getWordsStartingWith(letter, category = null) {
        const startLetter = letter.toUpperCase();
        let wordList;

        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.startsWith(startLetter));
    }

    getWordsEndingWith(letter, category = null) {
        const endLetter = letter.toUpperCase();
        let wordList;

        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.endsWith(endLetter));
    }

    getCrosswordWords(minLength = 3, maxLength = 15, category = null) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word =>
            word.length >= minLength &&
            word.length <= maxLength &&
            /^[A-Z]+$/.test(word)
        );
    }

    resetUsedWords() {
        this.usedWords.clear();
        console.log('[WORD DATABASE] Used words reset');
    }

    getStats() {
        const stats = {};
        for (const [category, words] of Object.entries(this.words)) {
            stats[category] = {
                count: words.length,
                avgLength: Math.round(words.reduce((sum, word) => sum + word.length, 0) / words.length),
                minLength: Math.min(...words.map(w => w.length)),
                maxLength: Math.max(...words.map(w => w.length))
            };
        }
        return stats;
    }
}

// Global instance
window.wordDatabase = new WordDatabase();
'''
        self.create_missing_script("js/word_database.js", content)

    def implement_canva_client(self):
        """Implement real Canva integration functionality"""
        content = '''/**
 * Canva Integration Client
 * Provides seamless integration with Canva design tools
 * **Timestamp**: 2025-01-22
 */

class CanvaClient {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.canvaSDK = null;
        this.designs = [];
        this.templates = {};
        console.log('[CANVA CLIENT] Canva integration client initialized');
    }

    async init(apiKey = null) {
        if (this.isInitialized) return;

        this.apiKey = apiKey || this.getStoredApiKey();

        try {
            if (window.Canva && window.Canva.DesignButton) {
                this.canvaSDK = window.Canva;
                await this.setupDesignButtons();
                this.isInitialized = true;
                console.log('[CANVA CLIENT] Canva SDK loaded successfully');
            } else {
                console.warn('[CANVA CLIENT] Canva SDK not available');
                await this.loadSDK();
            }
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to initialize:', error);
            this.handleError(error);
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
            console.log('[CANVA CLIENT] API key stored');
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to store API key:', e);
        }
    }

    async loadSDK() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="canva"]')) {
                resolve();
                return;
            }

            console.log('[CANVA CLIENT] Loading Canva SDK dynamically');

            const script = document.createElement('script');
            script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
            script.onload = () => {
                console.log('[CANVA CLIENT] SDK loaded dynamically');
                this.canvaSDK = window.Canva;
                this.setupDesignButtons();
                this.isInitialized = true;
                resolve();
            };
            script.onerror = (error) => {
                console.error('[CANVA CLIENT] Failed to load SDK:', error);
                reject(error);
            };
            document.head.appendChild(script);

            setTimeout(() => {
                reject(new Error('SDK loading timeout'));
            }, 10000);
        });
    }

    async setupDesignButtons() {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) return;

        console.log('[CANVA CLIENT] Setting up design buttons');

        const buttons = document.querySelectorAll('[data-canva-design-button]');
        buttons.forEach(button => {
            this.initDesignButton(button);
        });

        const canvaButtons = document.querySelectorAll('.canva-button');
        canvaButtons.forEach(button => {
            this.initDesignButton(button);
        });
    }

    initDesignButton(element) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) {
            console.warn('[CANVA CLIENT] Cannot initialize design button - SDK not available');
            return;
        }

        const designType = element.dataset.designType || element.dataset.canvaDesignType || 'Poster';
        const buttonId = element.id || `canva-btn-${Date.now()}`;

        console.log(`[CANVA CLIENT] Initializing design button: ${buttonId} for ${designType}`);

        try {
            const designButton = this.canvaSDK.DesignButton.create({
                apiKey: this.apiKey,
                design: {
                    type: designType,
                    dimensions: this.getDesignDimensions(designType)
                },
                onDesignOpen: (designId) => {
                    console.log('[CANVA CLIENT] Design opened:', designId);
                    this.trackDesignEvent('open', { designId, type: designType, buttonId });
                },
                onDesignPublish: (designUrl, designId, designTitle) => {
                    console.log('[CANVA CLIENT] Design published:', designUrl);
                    this.handlePublishedDesign(designUrl, designId, designTitle, element);
                    this.trackDesignEvent('publish', {
                        designId,
                        designUrl,
                        designTitle,
                        type: designType,
                        buttonId
                    });
                },
                onDesignError: (error) => {
                    console.error('[CANVA CLIENT] Design error:', error);
                    this.handleError(error);
                    this.trackDesignEvent('error', { error: error.message, type: designType, buttonId });
                }
            });

            element._canvaButton = designButton;
            designButton.mount(element);

            console.log(`[CANVA CLIENT] Design button mounted: ${buttonId}`);
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to create design button:', error);
            this.handleError(error);
        }
    }

    getDesignDimensions(designType) {
        const dimensions = {
            Poster: { width: 1080, height: 1080 },
            InstagramPost: { width: 1080, height: 1080 },
            Story: { width: 1080, height: 1920 },
            FacebookPost: { width: 1200, height: 630 },
            Presentation: { width: 1920, height: 1080 },
            Card: { width: 1080, height: 1080 },
            Resume: { width: 210, height: 297 },
            Banner: { width: 1200, height: 628 },
            Logo: { width: 1000, height: 1000 },
            Flyer: { width: 1080, height: 1920 }
        };

        return dimensions[designType] || dimensions.Poster;
    }

    handlePublishedDesign(designUrl, designId, designTitle, sourceElement) {
        console.log('[CANVA CLIENT] Processing published design');

        const designData = {
            id: designId,
            url: designUrl,
            title: designTitle || `Design ${designId}`,
            timestamp: new Date().toISOString(),
            source: sourceElement.id || sourceElement.className || 'unknown',
            type: sourceElement.dataset.designType || 'Poster'
        };

        this.designs.push(designData);
        this.saveDesigns();

        this.notifyDesignPublished(designData);
        this.showSuccessMessage(`Design "${designTitle || designId}" published successfully!`);
    }

    saveDesigns() {
        try {
            localStorage.setItem('canvaDesigns', JSON.stringify(this.designs));
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to save designs:', e);
        }
    }

    loadDesigns() {
        try {
            const saved = localStorage.getItem('canvaDesigns');
            this.designs = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to load designs:', e);
            this.designs = [];
        }
    }

    notifyDesignPublished(designData) {
        const event = new CustomEvent('canvaDesignPublished', {
            detail: designData
        });
        document.dispatchEvent(event);

        if (window.onCanvaDesignPublished) {
            window.onCanvaDesignPublished(designData);
        }
    }

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'canva-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    trackDesignEvent(eventType, data) {
        const eventData = {
            event: eventType,
            timestamp: new Date().toISOString(),
            ...data
        };

        try {
            const analytics = JSON.parse(localStorage.getItem('canvaAnalytics') || '[]');
            analytics.push(eventData);

            if (analytics.length > 100) {
                analytics.splice(0, analytics.length - 100);
            }

            localStorage.setItem('canvaAnalytics', JSON.stringify(analytics));
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to track event:', e);
        }

        console.log(`[CANVA CLIENT] Event tracked: ${eventType}`, data);
    }

    createDesign(designType = 'Poster', options = {}) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) {
            console.warn('[CANVA CLIENT] Canva SDK not available for createDesign');
            this.showErrorMessage('Canva is not available. Please refresh the page and try again.');
            return;
        }

        console.log(`[CANVA CLIENT] Creating new ${designType} design`);

        const tempButton = document.createElement('button');
        tempButton.style.display = 'none';
        tempButton.dataset.designType = designType;
        tempButton.id = `temp-canva-btn-${Date.now()}`;

        if (options.title) tempButton.dataset.designTitle = options.title;
        if (options.width) tempButton.dataset.width = options.width;
        if (options.height) tempButton.dataset.height = options.height;

        document.body.appendChild(tempButton);

        try {
            this.initDesignButton(tempButton);

            setTimeout(() => {
                const mountedButton = document.getElementById(tempButton.id);
                if (mountedButton && mountedButton._canvaButton) {
                    console.log('[CANVA CLIENT] Design creation initiated');
                } else {
                    console.warn('[CANVA CLIENT] Failed to initialize temporary design button');
                    this.showErrorMessage('Failed to create design. Please try again.');
                }

                setTimeout(() => {
                    const btn = document.getElementById(tempButton.id);
                    if (btn) document.body.removeChild(btn);
                }, 1000);
            }, 200);
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to create design:', error);
            this.showErrorMessage('Failed to create design. Please try again.');
            document.body.removeChild(tempButton);
        }
    }

    handleError(error) {
        console.error('[CANVA CLIENT] Error:', error);

        let message = 'An error occurred with Canva integration.';
        if (error.message) {
            if (error.message.includes('network')) {
                message = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('auth')) {
                message = 'Authentication error. Please check your Canva API key.';
            } else if (error.message.includes('quota')) {
                message = 'API quota exceeded. Please try again later.';
            }
        }

        this.showErrorMessage(message);
    }

    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'canva-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">❌</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 7000);
    }

    getDesignHistory() {
        this.loadDesigns();
        return this.designs;
    }

    getAnalytics() {
        try {
            return JSON.parse(localStorage.getItem('canvaAnalytics') || '[]');
        } catch (e) {
            return [];
        }
    }

    clearData() {
        try {
            localStorage.removeItem('canvaDesigns');
            localStorage.removeItem('canvaAnalytics');
            this.designs = [];
            console.log('[CANVA CLIENT] Data cleared');
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to clear data:', e);
        }
    }
}

// CSS for notifications
const canvaClientStyles = document.createElement('style');
canvaClientStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-icon {
        font-size: 1.2em;
    }

    .notification-text {
        flex: 1;
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2em;
        padding: 0;
        opacity: 0.8;
    }

    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(canvaClientStyles);

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
'''
        self.create_missing_script("js/canva-client.js", content)

    def implement_jenga_game(self):
        """Implement real Jenga game functionality"""
        content = '''/**
 * Jenga Game Logic
 * Physics-based tower building and destruction game
 * **Timestamp**: 2025-01-22
 */

class JengaGame {
    constructor(containerId = 'jenga-container') {
        this.container = document.getElementById(containerId);
        this.blocks = [];
        this.selectedBlock = null;
        this.isGameActive = false;
        this.towerHeight = 18;
        this.currentLevel = 0;
        this.gameMode = 'classic';
        this.difficulty = 'normal';
        this.physicsEnabled = true;
        this.gravity = 0.5;
        this.friction = 0.98;

        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;

        this.init();
    }

    init() {
        console.log('[JENGA] Initializing physics-based Jenga game');
        this.setupEventListeners();
        this.createUI();
        this.showStartScreen();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeGame();
        });

        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    createUI() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="jenga-ui">
                <div class="game-header">
                    <h1>🏗️ Jenga</h1>
                    <div class="game-controls">
                        <button id="start-game" class="game-btn primary">Start Game</button>
                        <button id="reset-game" class="game-btn secondary">Reset</button>
                        <select id="difficulty-select">
                            <option value="easy">Easy</option>
                            <option value="normal" selected>Normal</option>
                            <option value="hard">Hard</option>
                            <option value="expert">Expert</option>
                        </select>
                        <select id="mode-select">
                            <option value="classic" selected>Classic</option>
                            <option value="speed">Speed</option>
                            <option value="puzzle">Puzzle</option>
                        </select>
                    </div>
                </div>

                <div class="game-stats">
                    <div class="stat">
                        <span class="stat-label">Moves:</span>
                        <span id="moves-count" class="stat-value">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Height:</span>
                        <span id="tower-height" class="stat-value">18</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Time:</span>
                        <span id="game-timer" class="stat-value">00:00</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Stability:</span>
                        <span id="stability-meter" class="stat-value">100%</span>
                    </div>
                </div>

                <div class="game-canvas-container">
                    <div id="game-canvas" class="game-canvas"></div>
                    <div class="game-instructions">
                        <p id="current-instruction">Click "Start Game" to begin!</p>
                    </div>
                </div>

                <div id="game-messages" class="game-messages"></div>

                <div class="game-actions">
                    <button id="undo-move" class="action-btn" disabled>Undo Last Move</button>
                    <button id="hint-btn" class="action-btn">Get Hint</button>
                    <button id="physics-toggle" class="action-btn">Physics: ON</button>
                </div>
            </div>
        `;

        this.bindUIEvents();
    }

    bindUIEvents() {
        const startBtn = document.getElementById('start-game');
        const resetBtn = document.getElementById('reset-game');
        const difficultySelect = document.getElementById('difficulty-select');
        const modeSelect = document.getElementById('mode-select');
        const undoBtn = document.getElementById('undo-move');
        const hintBtn = document.getElementById('hint-btn');
        const physicsBtn = document.getElementById('physics-toggle');

        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
        if (difficultySelect) difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.updateDifficultySettings();
        });
        if (modeSelect) modeSelect.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.updateGameMode();
        });
        if (undoBtn) undoBtn.addEventListener('click', () => this.undoLastMove());
        if (hintBtn) hintBtn.addEventListener('click', () => this.showHint());
        if (physicsBtn) physicsBtn.addEventListener('click', () => this.togglePhysics());
    }

    updateDifficultySettings() {
        const settings = {
            easy: { stability: 0.9, physics: 0.3, hintLevel: 'high' },
            normal: { stability: 0.7, physics: 0.5, hintLevel: 'medium' },
            hard: { stability: 0.5, physics: 0.7, hintLevel: 'low' },
            expert: { stability: 0.3, physics: 0.9, hintLevel: 'none' }
        };

        const setting = settings[this.difficulty];
        this.baseStability = setting.stability;
        this.physicsStrength = setting.physics;
        this.hintLevel = setting.hintLevel;

        console.log(`[JENGA] Difficulty updated to ${this.difficulty}`);
        this.updateUI();
    }

    updateGameMode() {
        if (this.gameMode === 'speed') {
            this.towerHeight = 12;
        } else if (this.gameMode === 'puzzle') {
            this.towerHeight = 15;
        } else {
            this.towerHeight = 18;
        }

        document.getElementById('tower-height').textContent = this.towerHeight;
        console.log(`[JENGA] Game mode updated to ${this.gameMode}`);
    }

    showStartScreen() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        canvas.innerHTML = `
            <div class="start-screen">
                <div class="start-content">
                    <h2>Welcome to Jenga!</h2>
                    <div class="game-rules">
                        <h3>How to Play:</h3>
                        <ul>
                            <li>Remove one block from any level</li>
                            <li>Place it on top of the tower</li>
                            <li>Don't let the tower fall!</li>
                            <li>Click and drag blocks to move them</li>
                        </ul>
                    </div>

                    <div class="difficulty-info">
                        <h3>Difficulty Levels:</h3>
                        <div class="difficulty-grid">
                            <div class="difficulty-item">
                                <h4>Easy</h4>
                                <p>More stable blocks, helpful hints</p>
                            </div>
                            <div class="difficulty-item">
                                <h4>Normal</h4>
                                <p>Balanced challenge</p>
                            </div>
                            <div class="difficulty-item">
                                <h4>Hard</h4>
                                <p>Unstable blocks, realistic physics</p>
                            </div>
                            <div class="difficulty-item">
                                <h4>Expert</h4>
                                <p>Maximum challenge, no hints</p>
                            </div>
                        </div>
                    </div>

                    <div class="mode-info">
                        <h3>Game Modes:</h3>
                        <ul>
                            <li><strong>Classic:</strong> Traditional 18-level Jenga</li>
                            <li><strong>Speed:</strong> Shorter tower, faster gameplay</li>
                            <li><strong>Puzzle:</strong> Strategic block placement challenges</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        this.updateInstruction("Choose your difficulty and click 'Start Game' to begin!");
    }

    startGame() {
        console.log('[JENGA] Starting game');
        this.isGameActive = true;
        this.moves = 0;
        this.startTime = Date.now();
        this.lastMoveTime = Date.now();
        this.moveHistory = [];
        this.towerStability = 100;

        this.startTimer();
        this.buildTower();
        this.updateUI();
        this.updateInstruction("Select a block to remove by clicking and dragging it.");
    }

    resetGame() {
        console.log('[JENGA] Resetting game');
        this.stopTimer();
        this.isGameActive = false;
        this.blocks = [];
        this.moves = 0;
        this.moveHistory = [];
        this.currentLevel = 0;
        this.towerStability = 100;
        this.showStartScreen();
        this.updateUI();
    }

    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (!this.startTime) return;

        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        const timerEl = document.getElementById('game-timer');
        if (timerEl) {
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    buildTower() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        canvas.innerHTML = '<div class="tower-container"></div>';
        const towerContainer = canvas.querySelector('.tower-container');

        this.blocks = [];

        for (let level = 0; level < this.towerHeight; level++) {
            this.addTowerLevel(towerContainer, level);
        }

        this.addTopPlatform(towerContainer);

        console.log(`[JENGA] Built tower with ${this.blocks.length} blocks`);
        this.calculateTowerStability();
    }

    addTowerLevel(container, level) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'tower-level';
        levelDiv.dataset.level = level;

        const isVerticalLevel = level % 2 === 0;
        const blockCount = 3;

        for (let i = 0; i < blockCount; i++) {
            const block = this.createBlock(level, i, isVerticalLevel);
            levelDiv.appendChild(block);
            this.blocks.push(block);
        }

        container.appendChild(levelDiv);
    }

    addTopPlatform(container) {
        const platform = document.createElement('div');
        platform.className = 'tower-platform';
        platform.innerHTML = '<div class="platform-text">Place blocks here</div>';
        container.appendChild(platform);
    }

    createBlock(level, position, isVertical) {
        const block = document.createElement('div');
        block.className = `jenga-block ${isVertical ? 'vertical' : 'horizontal'}`;
        block.dataset.level = level;
        block.dataset.position = position;
        block.dataset.stability = this.getBlockStability();
        block.dataset.id = `block-${level}-${position}`;
        block.draggable = true;

        return block;
    }

    getBlockStability() {
        const baseStability = this.baseStability || 0.7;
        const randomFactor = (Math.random() - 0.5) * 0.2;
        const positionInstability = Math.random() * 0.1;
        const finalStability = Math.max(0.1, Math.min(1.0, baseStability + randomFactor - positionInstability));

        return finalStability.toFixed(2);
    }

    calculateTowerStability() {
        if (this.blocks.length === 0) return;

        let totalStability = 0;
        let supportedBlocks = 0;

        this.blocks.forEach(block => {
            if (!block.classList.contains('removed')) {
                const stability = parseFloat(block.dataset.stability);
                const level = parseInt(block.dataset.level);
                const levelBonus = Math.max(0, (this.towerHeight - level) / this.towerHeight);
                const blockStability = stability * (0.5 + 0.5 * levelBonus);

                totalStability += blockStability;
                supportedBlocks++;
            }
        });

        if (supportedBlocks > 0) {
            this.towerStability = Math.round((totalStability / supportedBlocks) * 100);
            this.updateStabilityMeter();
        }
    }

    updateStabilityMeter() {
        const meter = document.getElementById('stability-meter');
        if (meter) {
            meter.textContent = `${this.towerStability}%`;
            meter.className = `stat-value stability-${this.getStabilityClass()}`;
        }
    }

    getStabilityClass() {
        if (this.towerStability >= 80) return 'excellent';
        if (this.towerStability >= 60) return 'good';
        if (this.towerStability >= 40) return 'fair';
        if (this.towerStability >= 20) return 'poor';
        return 'critical';
    }

    handleMouseDown(e) {
        if (!this.isGameActive) return;

        const block = e.target.closest('.jenga-block');
        if (block && !block.classList.contains('removed')) {
            this.selectedBlock = block;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.originalX = block.offsetLeft;
            this.originalY = block.offsetTop;

            block.classList.add('dragging');
            block.style.zIndex = '1000';
            block.style.transition = 'none';

            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (!this.selectedBlock) return;

        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;

        this.selectedBlock.style.left = `${this.originalX + deltaX}px`;
        this.selectedBlock.style.top = `${this.originalY + deltaY}px`;
        this.selectedBlock.style.transform = `rotate(${deltaX * 0.1}deg)`;
    }

    handleMouseUp(e) {
        if (!this.selectedBlock) return;

        const block = this.selectedBlock;
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        const movedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        block.style.transition = '';

        if (movedDistance > 20) {
            this.removeBlock(block);
        } else {
            block.style.left = '';
            block.style.top = '';
            block.style.transform = '';
        }

        block.classList.remove('dragging');
        block.style.zIndex = '';
        this.selectedBlock = null;
    }

    handleTouchStart(e) {
        if (!this.isGameActive) return;

        const touch = e.touches[0];
        const block = touch.target.closest('.jenga-block');
        if (block && !block.classList.contains('removed')) {
            this.selectedBlock = block;
            this.dragStartX = touch.clientX;
            this.dragStartY = touch.clientY;
            this.originalX = block.offsetLeft;
            this.dragStartY = block.offsetTop;

            block.classList.add('dragging');
            block.style.zIndex = '1000';
            block.style.transition = 'none';

            e.preventDefault();
        }
    }

    handleTouchMove(e) {
        if (!this.selectedBlock) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.dragStartX;
        const deltaY = touch.clientY - this.dragStartY;

        this.selectedBlock.style.left = `${this.originalX + deltaX}px`;
        this.selectedBlock.style.top = `${this.originalY + deltaY}px`;
        this.selectedBlock.style.transform = `rotate(${deltaX * 0.1}deg)`;

        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (!this.selectedBlock) return;

        const block = this.selectedBlock;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - this.dragStartX;
        const deltaY = touch.clientY - this.dragStartY;
        const movedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        block.style.transition = '';

        if (movedDistance > 20) {
            this.removeBlock(block);
        } else {
            block.style.left = '';
            block.style.top = '';
            block.style.transform = '';
        }

        block.classList.remove('dragging');
        block.style.zIndex = '';
        this.selectedBlock = null;
    }

    handleKeyDown(e) {
        if (!this.isGameActive) return;

        switch (e.key.toLowerCase()) {
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.resetGame();
                }
                break;
            case 'u':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.undoLastMove();
                }
                break;
            case 'h':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.showHint();
                }
                break;
            case 'escape':
                if (this.selectedBlock) {
                    this.cancelBlockSelection();
                }
                break;
        }
    }

    cancelBlockSelection() {
        if (this.selectedBlock) {
            const block = this.selectedBlock;
            block.style.left = '';
            block.style.top = '';
            block.style.transform = '';
            block.classList.remove('dragging');
            block.style.zIndex = '';
            this.selectedBlock = null;
        }
    }

    removeBlock(block) {
        const moveData = {
            block: block.dataset.id,
            level: block.dataset.level,
            position: block.dataset.position,
            style: {
                left: block.style.left,
                top: block.style.top,
                transform: block.style.transform
            }
        };
        this.moveHistory.push(moveData);

        this.moves++;
        block.classList.add('removed');

        setTimeout(() => {
            block.style.display = 'none';
        }, 300);

        console.log(`[JENGA] Block removed: ${block.dataset.id}`);

        this.updateUI();
        this.checkWinCondition();

        setTimeout(() => {
            this.checkTowerCollapse();
        }, 500);
    }

    undoLastMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        const block = document.querySelector(`[data-id="${lastMove.block}"]`);

        if (block) {
            block.classList.remove('removed');
            block.style.display = '';
            block.style.left = lastMove.style.left;
            block.style.top = lastMove.style.top;
            block.style.transform = lastMove.style.transform;

            setTimeout(() => {
                block.style.left = '';
                block.style.top = '';
                block.style.transform = '';
            }, 100);
        }

        this.moves = Math.max(0, this.moves - 1);
        this.updateUI();
        this.calculateTowerStability();

        console.log(`[JENGA] Move undone: ${lastMove.block}`);
    }

    checkTowerCollapse() {
        const remainingBlocks = this.blocks.filter(b => !b.classList.contains('removed'));
        const totalBlocks = this.blocks.length;
        const collapseRatio = remainingBlocks.length / totalBlocks;

        if (this.towerStability < 20 || collapseRatio < 0.4) {
            this.gameOver(false, 'Tower collapsed!');
            return;
        }

        if (this.physicsEnabled) {
            this.applyPhysicsToUnstableBlocks();
        }
    }

    applyPhysicsToUnstableBlocks() {
        this.blocks.forEach(block => {
            if (!block.classList.contains('removed')) {
                const stability = parseFloat(block.dataset.stability);
                const level = parseInt(block.dataset.level);
                const levelMultiplier = (level + 1) / this.towerHeight;
                const effectiveStability = stability * (1 - levelMultiplier * 0.3);

                if (Math.random() > effectiveStability && Math.random() > 0.7) {
                    block.classList.add('unstable');

                    setTimeout(() => {
                        if (!block.classList.contains('removed')) {
                            this.applyBlockPhysics(block);
                        }
                    }, Math.random() * 2000 + 500);
                }
            }
        });
    }

    applyBlockPhysics(block) {
        if (!this.physicsEnabled || block.classList.contains('removed')) return;

        const velocityX = (Math.random() - 0.5) * 4;
        const velocityY = Math.random() * 2 + 1;

        block.dataset.velocityX = velocityX;
        block.dataset.velocityY = velocityY;

        const physicsStep = () => {
            if (block.classList.contains('removed')) return;

            const currentX = parseFloat(block.style.left || 0);
            const currentY = parseFloat(block.style.top || 0);
            const rot = parseFloat(block.dataset.rotation || 0);

            const newX = currentX + parseFloat(block.dataset.velocityX);
            const newY = currentY + parseFloat(block.dataset.velocityY);

            block.dataset.velocityY = parseFloat(block.dataset.velocityY) + this.gravity;
            block.dataset.velocityX *= this.friction;
            block.dataset.velocityY *= this.friction;
            block.dataset.rotation = rot + velocityX * 2;

            block.style.left = `${newX}px`;
            block.style.top = `${newY}px`;
            block.style.transform = `rotate(${block.dataset.rotation}deg)`;

            if (newY > 400 || Math.abs(velocityX) < 0.1) {
                block.classList.add('fallen');
                setTimeout(() => {
                    this.removeBlock(block);
                }, 200);
            } else {
                requestAnimationFrame(physicsStep);
            }
        };

        requestAnimationFrame(physicsStep);
    }

    checkWinCondition() {
        if (this.gameMode === 'speed') {
            const timeLimit = 300;
            const elapsed = (Date.now() - this.startTime) / 1000;
            if (elapsed < timeLimit && this.moves >= this.towerHeight * 1.5) {
                this.gameOver(true, 'Speed challenge completed!');
            }
        } else if (this.gameMode === 'puzzle') {
            if (this.moves >= this.towerHeight && this.towerStability > 70) {
                this.gameOver(true, 'Perfect balance achieved!');
            }
        } else {
            if (this.moves >= this.towerHeight * 2 && this.towerStability > 50) {
                this.gameOver(true, 'Tower master!');
            }
        }
    }

    gameOver(won, message) {
        this.stopTimer();
        this.isGameActive = false;

        const result = won ? 'success' : 'error';
        this.showMessage(message, result);

        const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - this.startTime) / 1000));
        const stabilityBonus = this.towerStability;
        const moveBonus = this.moves * 10;
        const finalScore = timeBonus + stabilityBonus + moveBonus;

        if (window.gameStats) {
            window.gameStats.updateStats({
                score: finalScore,
                won: won,
                duration: Math.floor((Date.now() - this.startTime) / 1000),
                game: 'jenga',
                moves: this.moves,
                stability: this.towerStability,
                mode: this.gameMode,
                difficulty: this.difficulty
            });
        }

        console.log(`[JENGA] Game Over - ${won ? 'Won' : 'Lost'} with score: ${finalScore}`);
    }

    showHint() {
        if (this.hintLevel === 'none') {
            this.showMessage('Hints disabled in Expert mode', 'info');
            return;
        }

        let bestBlock = null;
        let bestStability = -1;

        this.blocks.forEach(block => {
            if (!block.classList.contains('removed')) {
                const stability = parseFloat(block.dataset.stability);
                const level = parseInt(block.dataset.level);
                const adjustedStability = stability * (1 + (this.towerHeight - level) * 0.1);

                if (adjustedStability > bestStability) {
                    bestStability = adjustedStability;
                    bestBlock = block;
                }
            }
        });

        if (bestBlock) {
            bestBlock.classList.add('hint-highlight');

            let hintMessage = 'Try removing the highlighted block';
            if (this.hintLevel === 'high') {
                hintMessage += ` (stability: ${Math.round(bestStability * 100)}%)`;
            }

            this.showMessage(hintMessage, 'info');

            setTimeout(() => {
                bestBlock.classList.remove('hint-highlight');
            }, 3000);
        }
    }

    togglePhysics() {
        this.physicsEnabled = !this.physicsEnabled;
        const btn = document.getElementById('physics-toggle');
        if (btn) {
            btn.textContent = `Physics: ${this.physicsEnabled ? 'ON' : 'OFF'}`;
        }

        console.log(`[JENGA] Physics ${this.physicsEnabled ? 'enabled' : 'disabled'}`);
    }

    showMessage(text, type = 'info') {
        const messagesDiv = document.getElementById('game-messages');
        if (!messagesDiv) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `game-message ${type}`;
        messageDiv.innerHTML = `
            <span class="message-icon">${this.getMessageIcon(type)}</span>
            <span class="message-text">${text}</span>
        `;

        messagesDiv.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.remove();
        }, 4000);
    }

    getMessageIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    updateInstruction(text) {
        const instructionEl = document.getElementById('current-instruction');
        if (instructionEl) {
            instructionEl.textContent = text;
        }
    }

    updateUI() {
        const movesCount = document.getElementById('moves-count');
        const undoBtn = document.getElementById('undo-move');

        if (movesCount) movesCount.textContent = this.moves;
        if (undoBtn) undoBtn.disabled = this.moveHistory.length === 0;
    }

    initializeGame() {
        console.log('[JENGA] Game initialized and ready to play');
        this.updateDifficultySettings();
        this.updateGameMode();
    }
}

// CSS for Jenga game
const jengaStyles = document.createElement('style');
jengaStyles.textContent = `
    .jenga-ui {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
    }

    .game-header {
        text-align: center;
        margin-bottom: 30px;
    }

    .game-header h1 {
        color: gold;
        font-size: 2.5em;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    .game-controls {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
        align-items: center;
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
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .game-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .game-btn.primary {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    }

    .game-btn.secondary {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    }

    .game-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .game-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        flex-wrap: wrap;
    }

    .stat {
        text-align: center;
        margin: 5px 10px;
    }

    .stat-label {
        display: block;
        color: #FFD700;
        font-size: 14px;
        margin-bottom: 5px;
    }

    .stat-value {
        display: block;
        font-size: 24px;
        font-weight: bold;
        color: white;
    }

    .stat-value.excellent { color: #4CAF50; }
    .stat-value.good { color: #8BC34A; }
    .stat-value.fair { color: #FFC107; }
    .stat-value.poor { color: #FF9800; }
    .stat-value.critical { color: #f44336; }

    .game-canvas-container {
        position: relative;
        margin-bottom: 20px;
    }

    .game-canvas {
        width: 100%;
        height: 500px;
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        border-radius: 15px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        border: 3px solid rgba(255, 255, 255, 0.1);
    }

    .tower-container {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 250px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .tower-level {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 3px;
        position: relative;
    }

    .tower-level:nth-child(even) {
        margin-left: 20px;
    }

    .jenga-block {
        width: 70px;
        height: 22px;
        background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
        border: 2px solid #654321;
        border-radius: 3px;
        position: relative;
        cursor: grab;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        user-select: none;
    }

    .jenga-block:hover {
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        transform: scale(1.02);
    }

    .jenga-block.dragging {
        cursor: grabbing;
        z-index: 1000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.6);
        transform: scale(1.05) rotate(2deg);
    }

    .jenga-block.removed {
        opacity: 0;
        transform: translateY(100px) rotate(45deg) scale(0.8);
        pointer-events: none;
    }

    .jenga-block.fallen {
        animation: blockFall 0.6s ease-in forwards;
    }

    .jenga-block.unstable {
        animation: shake 0.5s ease-in-out infinite;
    }

    .jenga-block.hint-highlight {
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    }

    .tower-platform {
        width: 100px;
        height: 30px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
    }

    @keyframes blockFall {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(200px) rotate(720deg) scale(0.5); }
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
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

    .start-content h2 {
        font-size: 2.5em;
        margin-bottom: 20px;
        color: gold;
    }

    .game-rules, .difficulty-info, .mode-info {
        margin-bottom: 30px;
        max-width: 600px;
    }

    .game-rules h3, .difficulty-info h3, .mode-info h3 {
        color: #FFD700;
        margin-bottom: 15px;
    }

    .game-rules ul, .mode-info ul {
        text-align: left;
        list-style: none;
        padding: 0;
    }

    .game-rules li, .mode-info li {
        margin-bottom: 10px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
    }

    .difficulty-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }

    .difficulty-item {
        padding: 15px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .difficulty-item h4 {
        color: #FFD700;
        margin-bottom: 8px;
    }

    .game-instructions {
        position: absolute;
        bottom: 10px;
        left: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        font-size: 14px;
    }

    .game-messages {
        margin-top: 20px;
        min-height: 60px;
    }

    .game-message {
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        font-weight: bold;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        animation: messageSlideIn 0.3s ease;
    }

    .game-message.success {
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
    }

    .game-message.error {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;
    }

    .game-message.info {
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        color: white;
    }

    @keyframes messageSlideIn {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .game-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 20px;
        flex-wrap: wrap;
    }

    .action-btn {
        background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }

    .action-btn:disabled {
        background: #666;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    @media (max-width: 768px) {
        .jenga-ui {
            padding: 10px;
        }

        .game-header h1 {
            font-size: 2em;
        }

        .game-controls {
            flex-direction: column;
            align-items: stretch;
        }

        .game-controls select {
            margin: 5px 0;
        }

        .game-stats {
            flex-direction: column;
            align-items: center;
        }

        .stat {
            margin: 5px 0;
        }

        .game-canvas {
            height: 350px;
        }

        .jenga-block {
            width: 50px;
            height: 16px;
        }

        .game-actions {
            flex-direction: column;
            align-items: stretch;
        }

        .action-btn {
            margin: 5px 0;
        }
    }
`;
document.head.appendChild(jengaStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.jengaGame = new JengaGame();
    });
} else {
    window.jengaGame = new JengaGame();
}
'''
        self.create_missing_script("js/jenga.js", content)

    def run(self):
        """Run the complete fix"""
        print("Running FINAL ZERO 404 FIX...")

        # Fix remaining links
        self.fix_remaining_links()

        # Implement real JavaScript functionality
        self.implement_word_database()
        self.implement_canva_client()
        self.implement_jenga_game()

        print("Final verification...")
        # Run link checker to verify
        import subprocess
        import sys

        try:
            result = subprocess.run([
                sys.executable, "scripts/link_checker.py", str(self.root_dir)
            ], cwd=self.root_dir, capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                lines = result.stdout.split('\n')
                broken_count = 0
                missing_count = 0

                for line in lines:
                    if "Broken internal links:" in line:
                        broken_count = int(line.split(":")[1].strip())
                    elif "Missing scripts:" in line:
                        missing_count = int(line.split(":")[1].strip())

                if broken_count == 0 and missing_count == 0:
                    print("🎉 SUCCESS: ZERO 404s ACHIEVED!")
                    print("All links are working and all scripts exist with REAL functionality.")
                else:
                    print(f"Remaining issues: {broken_count} broken links, {missing_count} missing scripts")
            else:
                print("Verification failed")

        except Exception as e:
            print(f"Verification error: {e}")

def main():
    root_dir = "."
    fixer = FinalLinkFixer(root_dir)
    fixer.run()

if __name__ == "__main__":
    main()