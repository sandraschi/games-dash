/**
 * Games Collection - Canva Integration
 * **Timestamp**: 2025-12-13
 *
 * Integrates Canva's free design tools with the games collection for:
 * - Automated game thumbnail generation
 * - Tournament bracket creation
 * - Achievement certificate generation
 * - Promotional material creation
 */

class GamesCanvaIntegration {
    constructor() {
        this.canvaClient = null;
        this.initialized = false;
        this.templates = {
            chess: {
                thumbnail: { width: 1200, height: 630 },
                poster: { width: 1080, height: 1920 }
            },
            go: {
                thumbnail: { width: 1200, height: 630 },
                board: { width: 1920, height: 1080 }
            },
            multiplayer: {
                leaderboard: { width: 1920, height: 1080 },
                certificate: { width: 1920, height: 1080 }
            }
        };
    }

    /**
     * Initialize Canva integration
     * @param {string} clientId - Canva OAuth client ID
     * @param {string} clientSecret - Canva OAuth client secret
     */
    async initialize(clientId, clientSecret) {
        try {
            // Dynamic import to avoid issues if Canva client not available
            const { CanvaClient } = await import('./canva-client.js');
            this.canvaClient = new CanvaClient();
            await this.canvaClient.initialize(clientId, clientSecret);
            this.initialized = true;
            console.log('🎨 Games Canva integration initialized');
        } catch (error) {
            console.warn('⚠️ Canva integration not available:', error.message);
            this.initialized = false;
        }
    }

    /**
     * Check if Canva integration is available
     * @returns {boolean} True if Canva is available
     */
    isAvailable() {
        return this.initialized && this.canvaClient !== null;
    }

    /**
     * Generate thumbnail for a game
     * @param {string} gameName - Name of the game
     * @param {string} gameType - Type of game (chess, go, card, etc.)
     * @param {File} screenshot - Game screenshot (optional)
     * @returns {Promise<Object>} Thumbnail design info
     */
    async generateGameThumbnail(gameName, gameType = 'generic', screenshot = null) {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        try {
            const description = this.getGameDescription(gameType);
            const design = await this.canvaClient.generateGameThumbnail(
                gameName,
                description,
                screenshot
            );

            console.log(`🎮 Generated thumbnail for ${gameName}`);
            return design;
        } catch (error) {
            console.error(`❌ Failed to generate thumbnail for ${gameName}:`, error);
            throw error;
        }
    }

    /**
     * Generate tournament bracket
     * @param {string} tournamentName - Tournament name
     * @param {Array} players - Array of player objects with name and rating
     * @param {string} gameType - Type of game
     * @returns {Promise<Object>} Bracket design info
     */
    async generateTournamentBracket(tournamentName, players, gameType = 'chess') {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        try {
            // Format player names for bracket
            const playerNames = players.map(p => p.name || p).slice(0, 16); // Max 16 players

            const design = await this.canvaClient.generateTournamentBracket(
                tournamentName,
                playerNames
            );

            console.log(`🏆 Generated bracket for ${tournamentName} (${players.length} players)`);
            return design;
        } catch (error) {
            console.error(`❌ Failed to generate bracket for ${tournamentName}:`, error);
            throw error;
        }
    }

    /**
     * Generate achievement certificate
     * @param {string} playerName - Player name
     * @param {string} achievement - Achievement description
     * @param {string} gameName - Game name
     * @param {number} score - Achievement score/rating
     * @returns {Promise<Object>} Certificate design info
     */
    async generateAchievementCertificate(playerName, achievement, gameName, score = null) {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        try {
            const fullAchievement = score ?
                `${achievement} (${score} points)` :
                achievement;

            const design = await this.canvaClient.generateAchievementCertificate(
                playerName,
                fullAchievement,
                gameName
            );

            console.log(`🏅 Generated certificate for ${playerName}: ${achievement}`);
            return design;
        } catch (error) {
            console.error(`❌ Failed to generate certificate for ${playerName}:`, error);
            throw error;
        }
    }

    /**
     * Generate leaderboard visualization
     * @param {string} title - Leaderboard title
     * @param {Array} entries - Array of leaderboard entries
     * @returns {Promise<Object>} Leaderboard design info
     */
    async generateLeaderboard(title, entries) {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        try {
            // Create a custom design for leaderboard
            const design = await this.canvaClient.createDesign({
                title: `${title} - Leaderboard`,
                width: 1920,
                height: 1080,
                type: 'custom'
            });

            console.log(`📊 Generated leaderboard: ${title}`);
            return {
                designId: design.id,
                title: design.title,
                urls: design.urls
            };
        } catch (error) {
            console.error(`❌ Failed to generate leaderboard ${title}:`, error);
            throw error;
        }
    }

    /**
     * Generate promotional poster for a game
     * @param {string} gameName - Name of the game
     * @param {string} tagline - Game tagline
     * @param {Array} features - Array of game features
     * @returns {Promise<Object>} Poster design info
     */
    async generateGamePoster(gameName, tagline = '', features = []) {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        try {
            const design = await this.canvaClient.createDesign({
                title: `${gameName} - Promotional Poster`,
                width: 1080,
                height: 1920,
                type: 'custom'
            });

            console.log(`📢 Generated promotional poster for ${gameName}`);
            return {
                designId: design.id,
                title: design.title,
                urls: design.urls
            };
        } catch (error) {
            console.error(`❌ Failed to generate poster for ${gameName}:`, error);
            throw error;
        }
    }

    /**
     * Export a design to image file
     * @param {string} designId - Canva design ID
     * @param {string} format - Export format (PNG, JPG, PDF)
     * @returns {Promise<Object>} Export result with download URL
     */
    async exportDesign(designId, format = 'PNG') {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        try {
            const exportResult = await this.canvaClient.exportDesign(designId, format);
            console.log(`📤 Exported design ${designId} as ${format}`);
            return exportResult;
        } catch (error) {
            console.error(`❌ Failed to export design ${designId}:`, error);
            throw error;
        }
    }

    /**
     * Get game description based on type
     * @param {string} gameType - Type of game
     * @returns {string} Game description
     */
    getGameDescription(gameType) {
        const descriptions = {
            chess: 'Strategic board game of kings and queens',
            go: 'Ancient strategy game of territory and influence',
            shogi: 'Japanese chess with drops and promotions',
            card: 'Classic card games with strategy and luck',
            board: 'Tabletop games for family and friends',
            arcade: 'Fast-paced action and skill games',
            puzzle: 'Mind-bending challenges and brain teasers',
            word: 'Vocabulary and language skill games',
            generic: 'Exciting game from the collection'
        };

        return descriptions[gameType] || descriptions.generic;
    }

    /**
     * Generate assets for multiple games
     * @param {Array} games - Array of game objects with name and type
     * @returns {Promise<Array>} Array of generated designs
     */
    async generateBulkThumbnails(games) {
        if (!this.isAvailable()) {
            throw new Error('Canva integration not initialized');
        }

        const results = [];

        for (const game of games) {
            try {
                const design = await this.generateGameThumbnail(
                    game.name,
                    game.type || 'generic'
                );
                results.push({
                    game: game.name,
                    design,
                    success: true
                });
            } catch (error) {
                results.push({
                    game: game.name,
                    error: error.message,
                    success: false
                });
            }

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`🎨 Generated thumbnails for ${results.filter(r => r.success).length}/${games.length} games`);
        return results;
    }
}

// Global instance
let gamesCanvaIntegration = null;

/**
 * Get or create the global Canva integration instance
 * @returns {GamesCanvaIntegration} Canva integration instance
 */
function getGamesCanvaIntegration() {
    if (!gamesCanvaIntegration) {
        gamesCanvaIntegration = new GamesCanvaIntegration();
    }
    return gamesCanvaIntegration;
}

/**
 * Initialize Canva integration globally
 * @param {string} clientId - Canva OAuth client ID
 * @param {string} clientSecret - Canva OAuth client secret
 */
async function initializeGamesCanva(clientId, clientSecret) {
    const integration = getGamesCanvaIntegration();
    await integration.initialize(clientId, clientSecret);
    return integration;
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GamesCanvaIntegration,
        getGamesCanvaIntegration,
        initializeGamesCanva
    };
} else {
    window.GamesCanvaIntegration = GamesCanvaIntegration;
    window.getGamesCanvaIntegration = getGamesCanvaIntegration;
    window.initializeGamesCanva = initializeGamesCanva;
}
