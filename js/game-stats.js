/**
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
