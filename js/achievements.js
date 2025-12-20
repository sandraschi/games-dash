/**
 * Achievement System for Games Collection
 *
 * Features:
 * - Multiple achievement categories (games, streaks, special)
 * - Progress tracking and notifications
 * - Badge display with unlock animations
 * - Integration with dashboard statistics
 * - Persistent storage via localStorage
 *
 * **Timestamp**: 2025-12-20
 */

class AchievementSystem {
    constructor() {
        this.achievements = this.defineAchievements();
        this.unlockedAchievements = new Set(this.loadUnlockedAchievements());
        this.notifications = [];
        this.onAchievementUnlocked = null;
    }

    /**
     * Define all available achievements
     */
    defineAchievements() {
        return {
            // Game Completion Achievements
            first_win: {
                id: 'first_win',
                title: 'First Victory',
                description: 'Win your first game',
                icon: '🏆',
                category: 'games',
                rarity: 'common',
                requirement: { type: 'wins', value: 1 },
                points: 10
            },
            game_master: {
                id: 'game_master',
                title: 'Game Master',
                description: 'Win 100 games across any game type',
                icon: '👑',
                category: 'games',
                rarity: 'epic',
                requirement: { type: 'wins', value: 100 },
                points: 500
            },
            chess_champion: {
                id: 'chess_champion',
                title: 'Chess Champion',
                description: 'Win 50 chess games',
                icon: '♛',
                category: 'games',
                rarity: 'rare',
                requirement: { type: 'game_wins', game: 'chess', value: 50 },
                points: 200
            },
            speed_demon: {
                id: 'speed_demon',
                title: 'Speed Demon',
                description: 'Win a game in under 30 seconds',
                icon: '⚡',
                category: 'special',
                rarity: 'rare',
                requirement: { type: 'fast_win', value: 30 },
                points: 150
            },

            // Streak Achievements
            streak_5: {
                id: 'streak_5',
                title: 'On Fire',
                description: 'Win 5 games in a row',
                icon: '🔥',
                category: 'streaks',
                rarity: 'uncommon',
                requirement: { type: 'win_streak', value: 5 },
                points: 50
            },
            streak_10: {
                id: 'streak_10',
                title: 'Unstoppable',
                description: 'Win 10 games in a row',
                icon: '🌟',
                category: 'streaks',
                rarity: 'rare',
                requirement: { type: 'win_streak', value: 10 },
                points: 200
            },
            streak_20: {
                id: 'streak_20',
                title: 'Legendary',
                description: 'Win 20 games in a row',
                icon: '💎',
                category: 'streaks',
                rarity: 'legendary',
                requirement: { type: 'win_streak', value: 20 },
                points: 1000
            },

            // Exploration Achievements
            explorer: {
                id: 'explorer',
                title: 'Explorer',
                description: 'Play 10 different game types',
                icon: '🗺️',
                category: 'exploration',
                rarity: 'uncommon',
                requirement: { type: 'unique_games', value: 10 },
                points: 75
            },
            collector: {
                id: 'collector',
                title: 'Collector',
                description: 'Play all 69 games',
                icon: '🎯',
                category: 'exploration',
                rarity: 'legendary',
                requirement: { type: 'unique_games', value: 69 },
                points: 2000
            },

            // Special Achievements
            night_owl: {
                id: 'night_owl',
                title: 'Night Owl',
                description: 'Play a game between 2 AM and 4 AM',
                icon: '🦉',
                category: 'special',
                rarity: 'uncommon',
                requirement: { type: 'time_play', start: 2, end: 4 },
                points: 100
            },
            early_bird: {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Play a game between 5 AM and 7 AM',
                icon: '🐦',
                category: 'special',
                rarity: 'uncommon',
                requirement: { type: 'time_play', start: 5, end: 7 },
                points: 100
            },
            perfect_game: {
                id: 'perfect_game',
                title: 'Perfect Game',
                description: 'Win a game without making any mistakes (puzzle games only)',
                icon: '💯',
                category: 'special',
                rarity: 'epic',
                requirement: { type: 'perfect_score', value: 1 },
                points: 300
            },
            comeback_kid: {
                id: 'comeback_kid',
                title: 'Comeback Kid',
                description: 'Win a game after being behind by 10+ points',
                icon: '🔄',
                category: 'special',
                rarity: 'rare',
                requirement: { type: 'comeback_win', deficit: 10 },
                points: 250
            },

            // Social Achievements
            social_butterfly: {
                id: 'social_butterfly',
                title: 'Social Butterfly',
                description: 'Play 10 multiplayer games',
                icon: '🦋',
                category: 'social',
                rarity: 'uncommon',
                requirement: { type: 'multiplayer_games', value: 10 },
                points: 150
            },
            chatty: {
                id: 'chatty',
                title: 'Chatty',
                description: 'Send 50 chat messages in multiplayer games',
                icon: '💬',
                category: 'social',
                rarity: 'uncommon',
                requirement: { type: 'chat_messages', value: 50 },
                points: 100
            }
        };
    }

    /**
     * Check if achievement requirements are met
     */
    checkAchievement(achievementId, stats, gameData = {}) {
        if (this.unlockedAchievements.has(achievementId)) {
            return false; // Already unlocked
        }

        const achievement = this.achievements[achievementId];
        if (!achievement) return false;

        const requirement = achievement.requirement;

        switch (requirement.type) {
            case 'wins':
                return stats.totalWins >= requirement.value;

            case 'game_wins':
                return (stats.gameStats[requirement.game]?.wins || 0) >= requirement.value;

            case 'win_streak':
                return stats.currentStreak >= requirement.value;

            case 'unique_games':
                return stats.uniqueGamesPlayed >= requirement.value;

            case 'fast_win':
                return gameData.duration && gameData.duration < requirement.value && gameData.result === 'win';

            case 'time_play':
                const hour = new Date(gameData.timestamp).getHours();
                return hour >= requirement.start && hour < requirement.end;

            case 'perfect_score':
                return gameData.perfect === true && gameData.result === 'win';

            case 'comeback_win':
                return gameData.deficit >= requirement.deficit && gameData.result === 'win';

            case 'multiplayer_games':
                return stats.multiplayerGames >= requirement.value;

            case 'chat_messages':
                return stats.chatMessagesSent >= requirement.value;

            default:
                return false;
        }
    }

    /**
     * Track game event and check for achievements
     */
    trackGameEvent(eventType, stats, gameData = {}) {
        const newlyUnlocked = [];

        for (const [achievementId, achievement] of Object.entries(this.achievements)) {
            if (this.checkAchievement(achievementId, stats, gameData)) {
                this.unlockAchievement(achievementId);
                newlyUnlocked.push(achievement);
            }
        }

        return newlyUnlocked;
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) {
            return false; // Already unlocked
        }

        this.unlockedAchievements.add(achievementId);
        this.saveUnlockedAchievements();

        const achievement = this.achievements[achievementId];
        if (achievement && this.onAchievementUnlocked) {
            this.onAchievementUnlocked(achievement);
        }

        // Show notification
        this.showNotification(achievement);

        return true;
    }

    /**
     * Show achievement unlock notification
     */
    showNotification(achievement) {
        const notification = {
            id: Date.now(),
            achievement: achievement,
            timestamp: new Date(),
            read: false
        };

        this.notifications.unshift(notification);

        // Keep only last 50 notifications
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.saveNotifications();
        this.displayNotification(notification);
    }

    /**
     * Display notification on screen
     */
    displayNotification(notification) {
        const achievement = notification.achievement;

        // Create notification element
        const notificationEl = document.createElement('div');
        notificationEl.className = 'achievement-notification';
        notificationEl.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} points</div>
            </div>
            <div class="achievement-rarity rarity-${achievement.rarity}">${achievement.rarity}</div>
        `;

        // Add to page
        document.body.appendChild(notificationEl);

        // Animate in
        setTimeout(() => notificationEl.classList.add('show'), 100);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notificationEl.classList.remove('show');
            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.parentNode.removeChild(notificationEl);
                }
            }, 500);
        }, 5000);
    }

    /**
     * Get all unlocked achievements
     */
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements).map(id => this.achievements[id]).filter(Boolean);
    }

    /**
     * Get achievement progress
     */
    getAchievementProgress(achievementId, stats) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return null;

        const requirement = achievement.requirement;
        let current = 0;
        let target = requirement.value;

        switch (requirement.type) {
            case 'wins':
                current = stats.totalWins || 0;
                break;
            case 'game_wins':
                current = stats.gameStats[requirement.game]?.wins || 0;
                break;
            case 'win_streak':
                current = stats.currentStreak || 0;
                break;
            case 'unique_games':
                current = stats.uniqueGamesPlayed || 0;
                break;
            case 'multiplayer_games':
                current = stats.multiplayerGames || 0;
                break;
            case 'chat_messages':
                current = stats.chatMessagesSent || 0;
                break;
            default:
                current = this.unlockedAchievements.has(achievementId) ? target : 0;
        }

        return {
            achievement: achievement,
            current: Math.min(current, target),
            target: target,
            percentage: Math.min((current / target) * 100, 100),
            unlocked: this.unlockedAchievements.has(achievementId)
        };
    }

    /**
     * Get total achievement points
     */
    getTotalPoints() {
        return this.getUnlockedAchievements().reduce((total, achievement) => total + achievement.points, 0);
    }

    /**
     * Get achievements by category
     */
    getAchievementsByCategory(category) {
        return Object.values(this.achievements).filter(a => a.category === category);
    }

    /**
     * Get recent notifications
     */
    getRecentNotifications(limit = 10) {
        return this.notifications.slice(0, limit);
    }

    /**
     * Mark notification as read
     */
    markNotificationRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    /**
     * Load unlocked achievements from storage
     */
    loadUnlockedAchievements() {
        try {
            const stored = localStorage.getItem('gamesAchievements');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading achievements:', error);
            return [];
        }
    }

    /**
     * Save unlocked achievements to storage
     */
    saveUnlockedAchievements() {
        try {
            localStorage.setItem('gamesAchievements', JSON.stringify(Array.from(this.unlockedAchievements)));
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }

    /**
     * Load notifications from storage
     */
    loadNotifications() {
        try {
            const stored = localStorage.getItem('gamesNotifications');
            this.notifications = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
        }
    }

    /**
     * Save notifications to storage
     */
    saveNotifications() {
        try {
            localStorage.setItem('gamesNotifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }

    /**
     * Initialize the system
     */
    initialize() {
        this.loadNotifications();

        // Add CSS for notifications
        if (!document.getElementById('achievement-styles')) {
            const style = document.createElement('style');
            style.id = 'achievement-styles';
            style.textContent = `
                .achievement-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.5s ease-out;
                    max-width: 400px;
                    backdrop-filter: blur(10px);
                }
                .achievement-notification.show {
                    transform: translateX(0);
                }
                .achievement-icon {
                    font-size: 2.5em;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                }
                .achievement-content {
                    flex: 1;
                }
                .achievement-title {
                    font-size: 0.9em;
                    opacity: 0.9;
                    margin-bottom: 5px;
                }
                .achievement-name {
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .achievement-description {
                    font-size: 0.9em;
                    opacity: 0.9;
                    margin-bottom: 8px;
                }
                .achievement-points {
                    font-size: 0.9em;
                    font-weight: bold;
                    color: #ffd700;
                }
                .achievement-rarity {
                    font-size: 0.8em;
                    padding: 4px 8px;
                    border-radius: 12px;
                    text-transform: uppercase;
                    font-weight: bold;
                }
                .rarity-common { background: #6c757d; }
                .rarity-uncommon { background: #28a745; }
                .rarity-rare { background: #007bff; }
                .rarity-epic { background: #6f42c1; }
                .rarity-legendary { background: #fd7e14; }
            `;
            document.head.appendChild(style);
        }
    }
}

// Global instance
window.achievementSystem = new AchievementSystem();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.achievementSystem.initialize();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}
