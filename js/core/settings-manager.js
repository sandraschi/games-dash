// Universal Settings Manager
// **Timestamp**: 2025-12-03

class SettingsManager {
    constructor() {
        this.globalSettings = this.loadGlobalSettings();
        this.gameSettings = {};
    }
    
    loadGlobalSettings() {
        const defaults = {
            theme: 'dark',
            soundEnabled: true,
            soundVolume: 0.7,
            showFPS: false,
            animationSpeed: 'normal'
        };
        
        const stored = localStorage.getItem('globalSettings');
        return stored ? {...defaults, ...JSON.parse(stored)} : defaults;
    }
    
    saveGlobalSettings() {
        localStorage.setItem('globalSettings', JSON.stringify(this.globalSettings));
    }
    
    loadGameSettings(gameType) {
        const stored = localStorage.getItem(`${gameType}_settings`);
        if (stored) {
            this.gameSettings[gameType] = JSON.parse(stored);
        } else {
            this.gameSettings[gameType] = this.getDefaults(gameType);
        }
        return this.gameSettings[gameType];
    }
    
    saveGameSettings(gameType) {
        localStorage.setItem(`${gameType}_settings`, 
            JSON.stringify(this.gameSettings[gameType]));
    }
    
    getDefaults(gameType) {
        const defaults = {
            pong: {
                aiSpeed: 5,
                ballSpeed: 5,
                paddleSize: 'normal',
                ballSize: 'normal',
                numBalls: 1, // 1-5 for multiball!
                scoreLimit: 5
            },
            tetris: {
                startLevel: 1,
                ghostPiece: true,
                nextPiecesShown: 3
            },
            chess: {
                aiLevel: 10,
                showLegalMoves: true,
                highlightLastMove: true
            }
        };
        return defaults[gameType] || {};
    }
    
    get(key) {
        return this.globalSettings[key];
    }
    
    set(key, value) {
        this.globalSettings[key] = value;
        this.saveGlobalSettings();
    }
    
    getGameSetting(gameType, key) {
        if (!this.gameSettings[gameType]) {
            this.loadGameSettings(gameType);
        }
        return this.gameSettings[gameType][key];
    }
    
    setGameSetting(gameType, key, value) {
        if (!this.gameSettings[gameType]) {
            this.loadGameSettings(gameType);
        }
        this.gameSettings[gameType][key] = value;
        this.saveGameSettings(gameType);
    }
}

const settingsManager = new SettingsManager();
window.settingsManager = settingsManager;

