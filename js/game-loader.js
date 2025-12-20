// Game Asset Lazy Loader
// **Timestamp**: 2025-12-17
// Optimizes loading by deferring game-specific assets until needed

class GameAssetLoader {
    constructor() {
        this.loadedAssets = new Set();
        this.loadingPromises = new Map();
    }

    /**
     * Preload critical game assets for better UX
     * @param {string} gameId - Game identifier
     */
    async preloadGameAssets(gameId) {
        // Don't preload if already loaded or loading
        if (this.loadedAssets.has(gameId) || this.loadingPromises.has(gameId)) {
            return;
        }

        // Create loading promise
        const loadingPromise = this._loadGameAssets(gameId);
        this.loadingPromises.set(gameId, loadingPromise);

        try {
            await loadingPromise;
            this.loadedAssets.add(gameId);
            this.loadingPromises.delete(gameId);
        } catch (error) {
            console.warn(`Failed to preload ${gameId}:`, error);
            this.loadingPromises.delete(gameId);
        }
    }

    /**
     * Load game assets dynamically
     * @param {string} gameId - Game identifier
     */
    async _loadGameAssets(gameId) {
        const assets = this._getGameAssets(gameId);
        const loadPromises = [];

        // Load CSS first
        if (assets.css) {
            assets.css.forEach(css => {
                loadPromises.push(this._loadCSS(css));
            });
        }

        // Load JavaScript
        if (assets.js) {
            assets.js.forEach(js => {
                loadPromises.push(this._loadJS(js));
            });
        }

        // Wait for all assets to load
        await Promise.all(loadPromises);
    }

    /**
     * Load CSS file dynamically
     * @param {string} href - CSS file path
     */
    _loadCSS(href) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existingLinks = document.querySelectorAll(`link[href="${href}"]`);
            if (existingLinks.length > 0) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    /**
     * Load JavaScript file dynamically
     * @param {string} src - JS file path
     */
    _loadJS(src) {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            const existingScripts = document.querySelectorAll(`script[src="${src}"]`);
            if (existingScripts.length > 0) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Get asset list for a specific game
     * @param {string} gameId - Game identifier
     */
    _getGameAssets(gameId) {
        const gameAssets = {
            // Board games
            'chess': {
                css: ['responsive-boards.css'],
                js: ['js/chess-ai.js']
            },
            'shogi': {
                css: ['responsive-boards.css'],
                js: []
            },
            'go': {
                css: ['responsive-boards.css'],
                js: []
            },
            'checkers': {
                css: ['responsive-boards.css'],
                js: []
            },
            'gomoku': {
                css: ['responsive-boards.css'],
                js: []
            },

            // Arcade games
            'pacman': {
                css: [],
                js: []
            },
            'snake': {
                css: [],
                js: []
            },
            'tetris': {
                css: [],
                js: ['js/tetris-ai.js']
            },
            'breakout': {
                css: [],
                js: []
            },
            'pong': {
                css: [],
                js: []
            },

            // Puzzle games
            'sudoku': {
                css: [],
                js: []
            },
            'crossword': {
                css: [],
                js: ['crossword-generator.js', 'crossword-generator-v2.js']
            },
            'scrabble': {
                css: [],
                js: []
            },

            // Card games
            'poker': {
                css: [],
                js: []
            },
            'blackjack': {
                css: [],
                js: []
            },

            // 3D Chess (special case)
            'chess-3d': {
                css: [],
                js: ['js/chess-3d-models.js']
            }
        };

        return gameAssets[gameId] || { css: [], js: [] };
    }

    /**
     * Check if game assets are loaded
     * @param {string} gameId - Game identifier
     */
    isLoaded(gameId) {
        return this.loadedAssets.has(gameId);
    }

    /**
     * Get loading status
     * @param {string} gameId - Game identifier
     */
    isLoading(gameId) {
        return this.loadingPromises.has(gameId);
    }
}

// Global instance
const gameAssetLoader = new GameAssetLoader();

// Make it available globally
window.gameAssetLoader = gameAssetLoader;

// Auto-preload assets for visible games (performance optimization)
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        rootMargin: '50px', // Start loading when games are 50px from viewport
        threshold: 0
    };

    const gameObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const gameCard = entry.target;
                const gameLink = gameCard.querySelector('a');
                if (gameLink) {
                    const href = gameLink.getAttribute('href');
                    const gameId = href.replace('.html', '');
                    gameAssetLoader.preloadGameAssets(gameId);
                }
            }
        });
    }, observerOptions);

    // Observe all game cards
    document.querySelectorAll('.game-card').forEach(card => {
        gameObserver.observe(card);
    });
});
