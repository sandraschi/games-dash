/**
 * Subtle Support Reminder System
 * "Pay me a milkshake" approach - voluntary support only
 */

class SupportReminder {
    constructor() {
        this.storageKey = 'games_collection_support';
        this.init();
    }

    init() {
        // Load user support interaction history
        this.userData = this.loadUserData();

        // Set up event listeners for positive experiences
        this.setupEventListeners();
    }

    loadUserData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {
                lastSupportPrompt: 0,
                gamesPlayed: 0,
                puzzlesCompleted: 0,
                highScores: 0,
                supportClicked: false,
                lastSupportClick: 0
            };
        } catch (e) {
            return {
                lastSupportPrompt: 0,
                gamesPlayed: 0,
                puzzlesCompleted: 0,
                highScores: 0,
                supportClicked: false,
                lastSupportClick: 0
            };
        }
    }

    saveUserData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    setupEventListeners() {
        // Listen for custom events from games
        document.addEventListener('gameCompleted', (e) => {
            this.onGameCompleted(e.detail);
        });

        document.addEventListener('puzzleSolved', (e) => {
            this.onPuzzleSolved(e.detail);
        });

        document.addEventListener('highScore', (e) => {
            this.onHighScore(e.detail);
        });

        document.addEventListener('achievementUnlocked', (e) => {
            this.onAchievementUnlocked(e.detail);
        });
    }

    // Track positive user experiences
    onGameCompleted(gameData) {
        this.userData.gamesPlayed++;
        this.saveUserData();

        // Occasional support reminder after multiple games
        if (this.userData.gamesPlayed % 5 === 0 && this.shouldShowSupport()) {
            this.showSupportToast('Enjoying the games? Consider supporting development! 🥤');
        }
    }

    onPuzzleSolved(puzzleData) {
        this.userData.puzzlesCompleted++;
        this.saveUserData();

        // Support reminder after challenging puzzles
        if (puzzleData.difficulty === 'hard' && Math.random() < 0.3 && this.shouldShowSupport()) {
            setTimeout(() => {
                this.showSupportModal('Puzzle Master! 🏆', 'Amazing work solving that challenging puzzle! If you enjoyed the brain-teasing, consider supporting more game development.');
            }, 2000);
        }
    }

    onHighScore(scoreData) {
        this.userData.highScores++;
        this.saveUserData();

        // Rare support reminder for exceptional performance
        if (scoreData.isRecord && Math.random() < 0.1 && this.shouldShowSupport()) {
            this.showSupportToast('New high score! 🏆 Consider supporting to unlock even more challenges!');
        }
    }

    onAchievementUnlocked(achievement) {
        // Support reminder for major achievements
        if (achievement.rarity === 'legendary' && this.shouldShowSupport()) {
            setTimeout(() => {
                this.showSupportModal('Legendary Achievement! 🌟', `Congratulations on unlocking "${achievement.name}"! These rare achievements make the game special. Support development to create even more legendary moments.`);
            }, 3000);
        }
    }

    // Check if we should show support reminders
    shouldShowSupport() {
        const now = Date.now();
        const daysSinceLastPrompt = (now - this.userData.lastSupportPrompt) / (1000 * 60 * 60 * 24);
        const daysSinceLastSupport = (now - this.userData.lastSupportClick) / (1000 * 60 * 60 * 24);

        // Don't show if user recently supported
        if (daysSinceLastSupport < 30) return false;

        // Don't show too frequently
        if (daysSinceLastPrompt < 7) return false;

        // Don't show to new users
        if (this.userData.gamesPlayed < 3) return false;

        return true;
    }

    // Subtle toast notification
    showSupportToast(message) {
        this.userData.lastSupportPrompt = Date.now();
        this.saveUserData();

        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
            z-index: 10000;
            font-weight: bold;
            cursor: pointer;
            max-width: 300px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;

        toast.innerHTML = `
            <div>${message}</div>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">Click to learn more</div>
        `;

        toast.onclick = () => {
            this.userData.lastSupportClick = Date.now();
            this.saveUserData();
            window.open('support.html', '_blank');
            toast.remove();
        };

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);

        // Auto-hide after 8 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 8000);
    }

    // Modal dialog for important moments
    showSupportModal(title, message) {
        this.userData.lastSupportPrompt = Date.now();
        this.saveUserData();

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 2px solid #FFD700;
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        modal.innerHTML = `
            <h3 style="color: #FFD700; margin: 0 0 15px 0; font-size: 1.5em;">${title}</h3>
            <p style="color: #ccc; margin: 0 0 25px 0; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="modal-btn secondary" onclick="this.closest('.modal-overlay').remove()">Maybe Later</button>
                <button class="modal-btn primary" onclick="window.open('support.html', '_blank'); this.closest('.modal-overlay').remove()">🥤 Support</button>
            </div>
        `;

        // Style buttons
        const style = document.createElement('style');
        style.textContent = `
            .modal-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .modal-btn.primary {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #000;
            }
            .modal-btn.primary:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
            }
            .modal-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: #FFD700;
                border: 1px solid #FFD700;
            }
            .modal-btn.secondary:hover {
                background: rgba(255, 215, 0, 0.2);
            }
        `;
        document.head.appendChild(style);

        overlay.appendChild(modal);
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);

        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 100);

        // Click outside to close
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.style.opacity = '0';
                modal.style.transform = 'scale(0.9)';
                setTimeout(() => overlay.remove(), 300);
            }
        };
    }

    // Public method for games to trigger support events
    triggerSupportEvent(eventType, data = {}) {
        const event = new CustomEvent(`support${eventType}`, { detail: data });
        document.dispatchEvent(event);
    }
}

// Initialize support reminder system
const supportReminders = new SupportReminder();

// Make it globally available for games to use
window.supportReminders = supportReminders;

// Example usage for games:
// supportReminders.triggerSupportEvent('GameCompleted', { game: 'chess', difficulty: 'hard' });
// supportReminders.triggerSupportEvent('PuzzleSolved', { size: '15x15', time: 120 });
// supportReminders.triggerSupportEvent('HighScore', { game: 'tetris', score: 50000, isRecord: true });
// supportReminders.triggerSupportEvent('AchievementUnlocked', { name: 'Chess Master', rarity: 'legendary' });





