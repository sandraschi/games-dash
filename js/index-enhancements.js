// Index Page Enhancements
// **Timestamp**: 2025-12-02
// Features: Search, Favorites, Recent Games

class GamesIndexManager {
    constructor() {
        this.favorites = this.loadFavorites();
        this.recentGames = this.loadRecentGames();
        this.allGames = [];
        this.init();
    }

    init() {
        this.collectAllGames();
        this.setupSearch();
        this.setupFavorites();
        this.renderRecentGames();
        this.setupKeyboardShortcuts();
    }

    collectAllGames() {
        // Collect all game cards from the page
        const gameCards = document.querySelectorAll('.game-card');
        this.allGames = Array.from(gameCards).map(card => {
            const link = card.closest('a');
            const icon = card.querySelector('.game-icon')?.textContent || '🎮';
            const title = card.querySelector('h3')?.textContent || '';
            const description = card.querySelector('p')?.textContent || '';
            const href = link?.href || '';
            const gameId = this.extractGameId(href);
            
            return {
                element: card,
                link: link,
                icon,
                title,
                description,
                href,
                gameId,
                category: this.getCategory(card)
            };
        });
    }

    extractGameId(href) {
        // Extract game ID from href (e.g., "chess.html" -> "chess")
        const match = href.match(/([^\/]+)\.html/);
        return match ? match[1] : '';
    }

    getCategory(card) {
        // Find which category this game belongs to
        const categorySection = card.closest('.game-category');
        if (categorySection) {
            const categoryId = categorySection.id;
            const categoryMap = {
                'board-games': 'Board Games',
                'arcade': 'Arcade',
                'puzzle': 'Puzzle',
                'math': 'Math',
                'japanese': 'Japanese',
                'card': 'Card',
                'dice': 'Dice',
                'party': 'Party',
                'adventure': 'Adventure',
                'windows-classic': 'Windows Classic',
                'timewaster': 'Timewaster'
            };
            return categoryMap[categoryId] || 'Other';
        }
        return 'Other';
    }

    setupSearch() {
        // Create search input
        const searchContainer = document.createElement('div');
        searchContainer.id = 'search-container';
        searchContainer.style.cssText = 'margin: 20px 0; text-align: center;';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'game-search';
        searchInput.placeholder = '🔍 Search games... (Press / to focus)';
        searchInput.style.cssText = `
            padding: 12px 20px;
            font-size: 1.1em;
            width: 100%;
            max-width: 500px;
            border-radius: 25px;
            background: rgba(0, 0, 0, 0.6);
            border: 2px solid #FFD700;
            color: #FFD700;
            outline: none;
        `;
        
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.handleSearch('');
                e.target.blur();
            }
        });
        
        searchContainer.appendChild(searchInput);
        
        // Insert after theme switcher
        const themeSwitcher = document.querySelector('#themeSelector')?.parentElement;
        if (themeSwitcher) {
            themeSwitcher.parentNode.insertBefore(searchContainer, themeSwitcher.nextSibling);
        } else {
            const header = document.querySelector('header');
            if (header) {
                header.appendChild(searchContainer);
            }
        }
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            // Show all games
            this.allGames.forEach(game => {
                game.element.closest('.game-category')?.classList.remove('hidden');
                game.element.closest('a')?.classList.remove('hidden');
            });
            return;
        }

        // Filter games
        let hasResults = false;
        this.allGames.forEach(game => {
            const matches = 
                game.title.toLowerCase().includes(searchTerm) ||
                game.description.toLowerCase().includes(searchTerm) ||
                game.category.toLowerCase().includes(searchTerm) ||
                game.gameId.toLowerCase().includes(searchTerm);
            
            if (matches) {
                game.element.closest('a')?.classList.remove('hidden');
                game.element.closest('.game-category')?.classList.remove('hidden');
                hasResults = true;
            } else {
                game.element.closest('a')?.classList.add('hidden');
            }
        });

        // Hide empty categories
        document.querySelectorAll('.game-category').forEach(category => {
            const visibleGames = category.querySelectorAll('.game-card:not(.hidden)');
            if (visibleGames.length === 0 && searchTerm) {
                category.classList.add('hidden');
            }
        });

        // Show "no results" message if needed
        this.showNoResultsMessage(!hasResults && searchTerm);
    }

    showNoResultsMessage(show) {
        let messageEl = document.getElementById('no-results-message');
        if (show && !messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'no-results-message';
            messageEl.style.cssText = `
                text-align: center;
                padding: 40px;
                color: #FFD700;
                font-size: 1.2em;
                margin: 40px 0;
            `;
            messageEl.textContent = '🔍 No games found. Try a different search term.';
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(messageEl, container.querySelector('.games-grid'));
            }
        } else if (!show && messageEl) {
            messageEl.remove();
        }
    }

    setupFavorites() {
        // Add favorite buttons to all game cards
        this.allGames.forEach(game => {
            if (game.link) {
                const favoriteBtn = document.createElement('button');
                favoriteBtn.className = 'favorite-btn';
                favoriteBtn.innerHTML = this.favorites.has(game.gameId) ? '⭐' : '☆';
                favoriteBtn.setAttribute('aria-label', 'Toggle favorite');
                favoriteBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.6);
                    border: 2px solid #FFD700;
                    border-radius: 50%;
                    width: 35px;
                    height: 35px;
                    font-size: 1.2em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                `;
                
                favoriteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleFavorite(game.gameId, favoriteBtn);
                });
                
                // Make game card position relative
                if (game.element) {
                    const card = game.element.closest('a');
                    if (card) {
                        card.style.position = 'relative';
                        card.appendChild(favoriteBtn);
                    }
                }
            }
        });

        // Add favorites section
        this.renderFavoritesSection();
    }

    toggleFavorite(gameId, button) {
        if (this.favorites.has(gameId)) {
            this.favorites.delete(gameId);
            button.innerHTML = '☆';
        } else {
            this.favorites.add(gameId);
            button.innerHTML = '⭐';
        }
        this.saveFavorites();
        this.renderFavoritesSection();
    }

    loadFavorites() {
        const stored = localStorage.getItem('gamesFavorites');
        return stored ? new Set(JSON.parse(stored)) : new Set();
    }

    saveFavorites() {
        localStorage.setItem('gamesFavorites', JSON.stringify(Array.from(this.favorites)));
    }

    renderFavoritesSection() {
        let favoritesSection = document.getElementById('favorites-section');
        
        if (this.favorites.size === 0) {
            if (favoritesSection) {
                favoritesSection.remove();
            }
            return;
        }

        if (!favoritesSection) {
            favoritesSection = document.createElement('div');
            favoritesSection.id = 'favorites-section';
            favoritesSection.className = 'game-category';
            favoritesSection.innerHTML = '<h2>⭐ Favorites</h2><div class="games-row"></div>';
            
            const gamesGrid = document.querySelector('.games-grid');
            if (gamesGrid) {
                gamesGrid.insertBefore(favoritesSection, gamesGrid.firstChild);
            }
        }

        const favoritesRow = favoritesSection.querySelector('.games-row');
        favoritesRow.innerHTML = '';

        this.favorites.forEach(gameId => {
            const game = this.allGames.find(g => g.gameId === gameId);
            if (game && game.link) {
                const favoriteCard = game.link.cloneNode(true);
                favoriteCard.classList.add('favorite-card');
                favoritesRow.appendChild(favoriteCard);
                
                // Re-attach favorite button
                const favBtn = favoriteCard.querySelector('.favorite-btn');
                if (favBtn) {
                    favBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleFavorite(gameId, favBtn);
                    });
                }
            }
        });
    }

    loadRecentGames() {
        const stored = localStorage.getItem('gamesRecent');
        return stored ? JSON.parse(stored) : [];
    }

    saveRecentGames() {
        localStorage.setItem('gamesRecent', JSON.stringify(this.recentGames.slice(0, 10)));
    }

    addRecentGame(gameId) {
        // Remove if already exists
        this.recentGames = this.recentGames.filter(id => id !== gameId);
        // Add to front
        this.recentGames.unshift(gameId);
        // Keep only last 10
        this.recentGames = this.recentGames.slice(0, 10);
        this.saveRecentGames();
        this.renderRecentGames();
    }

    renderRecentGames() {
        if (this.recentGames.length === 0) return;

        let recentSection = document.getElementById('recent-games-section');
        
        if (!recentSection) {
            recentSection = document.createElement('div');
            recentSection.id = 'recent-games-section';
            recentSection.className = 'game-category';
            recentSection.innerHTML = '<h2>🕐 Recently Played</h2><div class="games-row"></div>';
            
            const gamesGrid = document.querySelector('.games-grid');
            const favoritesSection = document.getElementById('favorites-section');
            if (gamesGrid) {
                gamesGrid.insertBefore(recentSection, favoritesSection ? favoritesSection.nextSibling : gamesGrid.firstChild);
            }
        }

        const recentRow = recentSection.querySelector('.games-row');
        recentRow.innerHTML = '';

        this.recentGames.forEach(gameId => {
            const game = this.allGames.find(g => g.gameId === gameId);
            if (game && game.link) {
                const recentCard = game.link.cloneNode(true);
                recentCard.classList.add('recent-card');
                recentRow.appendChild(recentCard);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Press / to focus search (unless typing in input)
            if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                const searchInput = document.getElementById('game-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }
}

// Track game plays for recent games
function trackGamePlay() {
    const currentPage = window.location.pathname;
    const gameId = currentPage.match(/([^\/]+)\.html/)?.[1];
    if (gameId && window.gamesIndexManager) {
        window.gamesIndexManager.addRecentGame(gameId);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gamesIndexManager = new GamesIndexManager();
    });
} else {
    window.gamesIndexManager = new GamesIndexManager();
}

// Track game play when leaving index page
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    // On index page, don't track
} else {
    // On game page, track when loaded
    trackGamePlay();
}

