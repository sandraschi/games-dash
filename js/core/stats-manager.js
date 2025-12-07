// Statistics Manager - IndexedDB-based tracking
// **Timestamp**: 2025-12-03

class StatsManager {
    constructor() {
        this.db = null;
        this.dbName = 'GamesCollectionDB';
        this.dbVersion = 1;
    }
    
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Games history store
                if (!db.objectStoreNames.contains('games')) {
                    const gamesStore = db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
                    gamesStore.createIndex('gameType', 'gameType');
                    gamesStore.createIndex('timestamp', 'timestamp');
                    gamesStore.createIndex('result', 'result');
                }
                
                // User stats store
                if (!db.objectStoreNames.contains('stats')) {
                    const statsStore = db.createObjectStore('stats', { keyPath: 'gameType' });
                    statsStore.createIndex('gamesPlayed', 'gamesPlayed');
                    statsStore.createIndex('highScore', 'highScore');
                }
                
                // Achievements store
                if (!db.objectStoreNames.contains('achievements')) {
                    const achievStore = db.createObjectStore('achievements', { keyPath: 'id' });
                    achievStore.createIndex('unlocked', 'unlocked');
                }
            };
        });
    }
    
    async recordGame(gameData) {
        const tx = this.db.transaction(['games', 'stats'], 'readwrite');
        const gamesStore = tx.objectStore('games');
        const statsStore = tx.objectStore('stats');
        
        // Save game record
        const gameRecord = {
            gameType: gameData.gameType,
            score: gameData.score || 0,
            result: gameData.result, // 'win', 'loss', 'draw'
            duration: gameData.duration || 0,
            timestamp: Date.now(),
            details: gameData.details || {}
        };
        
        await gamesStore.add(gameRecord);
        
        // Update stats
        const stats = await this.getStats(gameData.gameType);
        const updated = {
            gameType: gameData.gameType,
            gamesPlayed: (stats?.gamesPlayed || 0) + 1,
            wins: (stats?.wins || 0) + (gameData.result === 'win' ? 1 : 0),
            losses: (stats?.losses || 0) + (gameData.result === 'loss' ? 1 : 0),
            draws: (stats?.draws || 0) + (gameData.result === 'draw' ? 1 : 0),
            highScore: Math.max(stats?.highScore || 0, gameData.score || 0),
            totalScore: (stats?.totalScore || 0) + (gameData.score || 0),
            totalTime: (stats?.totalTime || 0) + (gameData.duration || 0),
            lastPlayed: Date.now()
        };
        
        await statsStore.put(updated);
        
        // Check achievements
        await this.checkAchievements(updated);
        
        return gameRecord;
    }
    
    async getStats(gameType) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('stats', 'readonly');
            const store = tx.objectStore('stats');
            const request = store.get(gameType);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAllStats() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('stats', 'readonly');
            const store = tx.objectStore('stats');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getRecentGames(limit = 10) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('games', 'readonly');
            const store = tx.objectStore('games');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');
            
            const games = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && games.length < limit) {
                    games.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(games);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    async checkAchievements(stats) {
        const achievements = [];
        
        // First Win
        if (stats.wins === 1) {
            achievements.push({
                id: 'first_win_' + stats.gameType,
                name: 'First Victory',
                description: `Won your first ${stats.gameType} game`,
                icon: '🏆',
                unlocked: Date.now()
            });
        }
        
        // 100 Games Played
        if (stats.gamesPlayed === 100) {
            achievements.push({
                id: 'century_' + stats.gameType,
                name: 'Century Club',
                description: `Played 100 ${stats.gameType} games`,
                icon: '💯',
                unlocked: Date.now()
            });
        }
        
        // High Score Milestones
        if (stats.gameType === 'tetris' && stats.highScore >= 10000) {
            achievements.push({
                id: 'tetris_master',
                name: 'Tetris Master',
                description: 'Scored 10,000+ in Tetris',
                icon: '🟦',
                unlocked: Date.now()
            });
        }
        
        // Save achievements
        if (achievements.length > 0) {
            const tx = this.db.transaction('achievements', 'readwrite');
            const store = tx.objectStore('achievements');
            achievements.forEach(a => store.add(a));
        }
        
        return achievements;
    }
    
    async getOverallStats() {
        const allStats = await this.getAllStats();
        let totalGames = 0;
        let totalWins = 0;
        let totalPlayTime = 0; // in milliseconds
        
        allStats.forEach(stats => {
            totalGames += stats.gamesPlayed || 0;
            totalWins += stats.wins || 0;
            totalPlayTime += stats.totalTime || 0;
        });
        
        const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;
        
        return {
            totalGames,
            totalWins,
            winRate,
            totalPlayTime
        };
    }
    
    async getAllAchievements() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('achievements', 'readonly');
            const store = tx.objectStore('achievements');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global instance
const statsManager = new StatsManager();
window.statsManager = statsManager;

// Unobtrusive helper function for games to record stats
// Silently fails if stats manager is unavailable - no UI interruption
window.recordGameStats = async function(gameType, result, score = 0, duration = 0, details = {}) {
    if (!window.statsManager) return;
    try {
        if (!window.statsManager.db) {
            await window.statsManager.initialize();
        }
        await window.statsManager.recordGame({
            gameType: gameType,
            score: score,
            result: result, // 'win', 'loss', 'draw'
            duration: duration,
            details: details
        });
    } catch (e) {
        // Silently fail - stats are optional and shouldn't interrupt gameplay
        console.debug('Stats recording failed (non-critical):', e);
    }
};

// Initialize on load
window.addEventListener('load', async () => {
    try {
        await statsManager.initialize();
        console.log('Stats manager initialized');
    } catch (error) {
        console.error('Failed to initialize stats:', error);
    }
});

