/**
 * Global Error Handler for Games Collection
 * Provides centralized error logging, user notification, and recovery
 * **Timestamp**: 2025-01-09
 */

class GlobalErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.isInitialized = false;
        this.errorCounts = {};
        this.criticalErrors = [];
        this.recoveryStrategies = new Map();
        
        // Initialize recovery strategies
        this.initRecoveryStrategies();
    }

    /**
     * Initialize the global error handler
     */
    init() {
        if (this.isInitialized) return;

        // Set up global error handlers
        this.setupGlobalHandlers();
        
        // Set up unhandled promise rejection handler
        this.setupPromiseRejectionHandler();
        
        // Set up resource error handler
        this.setupResourceErrorHandler();
        
        this.isInitialized = true;
        console.log('[ERROR HANDLER] Global error handler initialized');
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });
        });

        // Async error handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Setup promise rejection handler
     */
    setupPromiseRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            console.warn('[ERROR HANDLER] Unhandled promise rejection:', event.reason);
            
            // Try to recover if possible
            const recovery = this.attemptRecovery('promise', event.reason);
            if (recovery) {
                event.preventDefault();
            }
        });
    }

    /**
     * Setup resource error handler
     */
    setupResourceErrorHandler() {
        document.addEventListener('error', (event) => {
            const target = event.target;
            
            // Handle image loading errors
            if (target.tagName === 'IMG') {
                this.handleImageError(target);
            }
            
            // Handle script loading errors
            else if (target.tagName === 'SCRIPT') {
                this.handleScriptError(target);
            }
            
            // Handle style loading errors
            else if (target.tagName === 'LINK' && target.rel === 'stylesheet') {
                this.handleStyleError(target);
            }
        }, true);
    }

    /**
     * Handle image loading errors
     */
    handleImageError(imgElement) {
        console.warn('[ERROR HANDLER] Image failed to load:', imgElement.src);
        
        // Try to load fallback image
        if (!imgElement.dataset.fallbackTried) {
            imgElement.dataset.fallbackTried = 'true';
            
            // Use a placeholder or fallback image
            const fallbackSrc = '/images/placeholder.png';
            imgElement.src = fallbackSrc;
            
            // Add error styling
            imgElement.style.border = '2px dashed #ff6b6b';
            imgElement.style.backgroundColor = '#ffe0e0';
            imgElement.title = 'Image failed to load';
        }
    }

    /**
     * Handle script loading errors
     */
    handleScriptError(scriptElement) {
        console.error('[ERROR HANDLER] Script failed to load:', scriptElement.src);
        
        this.handleError({
            type: 'script_load',
            message: `Failed to load script: ${scriptElement.src}`,
            source: scriptElement.src,
            timestamp: new Date().toISOString(),
            critical: scriptElement.src.includes('chess') || scriptElement.src.includes('multiplayer')
        });
    }

    /**
     * Handle style loading errors
     */
    handleStyleError(linkElement) {
        console.error('[ERROR HANDLER] Stylesheet failed to load:', linkElement.href);
        
        // Try to apply basic fallback styling
        if (!linkElement.dataset.fallbackTried) {
            linkElement.dataset.fallbackTried = 'true';
            
            const fallbackStyle = document.createElement('style');
            fallbackStyle.textContent = `
                .error-fallback {
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                    color: #333;
                    padding: 10px;
                    border: 1px solid #ddd;
                }
            `;
            document.head.appendChild(fallbackStyle);
        }
    }

    /**
     * Handle errors with logging and user notification
     */
    handleError(errorInfo) {
        // Add to error log
        this.logError(errorInfo);
        
        // Count error types
        const errorKey = `${errorInfo.type}:${errorInfo.message}`;
        this.errorCounts[errorKey] = (this.errorCounts[errorKey] || 0) + 1;
        
        // Check if it's a critical error
        if (errorInfo.critical || this.isCriticalError(errorInfo)) {
            this.criticalErrors.push(errorInfo);
            this.handleCriticalError(errorInfo);
        }
        
        // Show user notification if needed
        this.showUserNotification(errorInfo);
        
        // Attempt recovery
        this.attemptRecovery(errorInfo.type, errorInfo);
        
        // Cleanup old errors
        this.cleanupOldErrors();
    }

    /**
     * Log error to console and storage
     */
    logError(errorInfo) {
        // Add to internal array
        this.errors.push(errorInfo);
        
        // Log to console with appropriate level
        if (errorInfo.critical) {
            console.error('[ERROR HANDLER] Critical error:', errorInfo);
        } else {
            console.warn('[ERROR HANDLER] Error:', errorInfo);
        }
        
        // Store in localStorage for debugging
        try {
            const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
            errorLog.push(errorInfo);
            
            // Keep only last 50 errors in localStorage
            if (errorLog.length > 50) {
                errorLog.splice(0, errorLog.length - 50);
            }
            
            localStorage.setItem('errorLog', JSON.stringify(errorLog));
        } catch (e) {
            console.warn('[ERROR HANDLER] Failed to save error to localStorage:', e);
        }
    }

    /**
     * Check if error is critical
     */
    isCriticalError(errorInfo) {
        const criticalPatterns = [
            /chess.*crash/i,
            /multiplayer.*connect/i,
            /websocket.*fail/i,
            /firebase.*auth/i,
            /three.*webgl/i,
            /audiocontext.*suspend/i
        ];
        
        return criticalPatterns.some(pattern => 
            pattern.test(errorInfo.message) || 
            pattern.test(errorInfo.filename || '')
        );
    }

    /**
     * Handle critical errors
     */
    handleCriticalError(errorInfo) {
        console.error('[ERROR HANDLER] CRITICAL ERROR DETECTED:', errorInfo);
        
        // Show critical error notification
        this.showCriticalErrorNotification(errorInfo);
        
        // Try to save game state if possible
        this.saveGameState();
    }

    /**
     * Show user notification for errors
     */
    showUserNotification(errorInfo) {
        // Don't show notifications for every error type
        const silentTypes = ['image_load', 'resource_load', 'minor'];
        if (silentTypes.includes(errorInfo.type)) {
            return;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <strong>⚠️ Error:</strong> ${this.getUserFriendlyMessage(errorInfo)}
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Show critical error notification
     */
    showCriticalErrorNotification(errorInfo) {
        const notification = document.createElement('div');
        notification.className = 'critical-error-notification';
        notification.innerHTML = `
            <div class="critical-error-content">
                <h3>🚨 Critical Error</h3>
                <p>${this.getUserFriendlyMessage(errorInfo)}</p>
                <div class="error-actions">
                    <button onclick="location.reload()">🔄 Reload Page</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">Dismiss</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #d32f2f;
            color: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            z-index: 10001;
            max-width: 400px;
            text-align: center;
        `;
        
        document.body.appendChild(notification);
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(errorInfo) {
        const messages = {
            'websocket': 'Connection to game server lost. Please check your internet connection.',
            'firebase': 'Cloud services unavailable. Some features may not work.',
            'three': '3D graphics initialization failed. Try refreshing the page.',
            'audiocontext': 'Audio system encountered an issue. Sound may be disabled.',
            'script_load': 'A required component failed to load. Please refresh the page.',
            'promise': 'An operation failed. Please try again.',
            'javascript': 'An unexpected error occurred. The page may need to be refreshed.'
        };
        
        return messages[errorInfo.type] || errorInfo.message || 'An error occurred.';
    }

    /**
     * Initialize recovery strategies
     */
    initRecoveryStrategies() {
        // WebSocket recovery
        this.recoveryStrategies.set('websocket', (error) => {
            console.log('[ERROR HANDLER] Attempting WebSocket recovery...');
            // Try to reconnect after delay
            setTimeout(() => {
                if (window.unifiedMultiplayer) {
                    window.unifiedMultiplayer.attemptReconnect();
                }
            }, 2000);
            return true;
        });
        
        // Audio recovery
        this.recoveryStrategies.set('audiocontext', (error) => {
            console.log('[ERROR HANDLER] Attempting audio recovery...');
            // Try to resume audio context
            if (window.gameSoundClient && window.gameSoundClient.audioContext) {
                window.gameSoundClient.audioContext.resume();
            }
            return true;
        });
        
        // Three.js recovery
        this.recoveryStrategies.set('three', (error) => {
            console.log('[ERROR HANDLER] Attempting Three.js recovery...');
            // Try to reinitialize 3D components
            setTimeout(() => {
                if (typeof initThreeJS === 'function') {
                    initThreeJS();
                }
            }, 1000);
            return true;
        });
    }

    /**
     * Attempt recovery based on error type
     */
    attemptRecovery(errorType, errorInfo) {
        const strategy = this.recoveryStrategies.get(errorType);
        if (strategy) {
            try {
                return strategy(errorInfo);
            } catch (e) {
                console.warn('[ERROR HANDLER] Recovery strategy failed:', e);
            }
        }
        return false;
    }

    /**
     * Save game state before crash
     */
    saveGameState() {
        try {
            const gameState = {
                timestamp: new Date().toISOString(),
                url: window.location.href,
                gameData: this.getGameData()
            };
            
            localStorage.setItem('crashRecoveryState', JSON.stringify(gameState));
            console.log('[ERROR HANDLER] Game state saved for recovery');
        } catch (e) {
            console.warn('[ERROR HANDLER] Failed to save game state:', e);
        }
    }

    /**
     * Get current game data
     */
    getGameData() {
        const data = {};
        
        // Chess game state
        if (window.chessGame && window.chessGame.getFEN) {
            data.chessFEN = window.chessGame.getFEN();
        }
        
        // Current scores
        if (window.currentScore !== undefined) {
            data.score = window.currentScore;
        }
        
        // Current level/stage
        if (window.currentLevel !== undefined) {
            data.level = window.currentLevel;
        }
        
        return data;
    }

    /**
     * Cleanup old errors
     */
    cleanupOldErrors() {
        if (this.errors.length > this.maxErrors) {
            this.errors.splice(0, this.errors.length - this.maxErrors);
        }
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        return {
            totalErrors: this.errors.length,
            criticalErrors: this.criticalErrors.length,
            errorCounts: this.errorCounts,
            recentErrors: this.errors.slice(-10)
        };
    }

    /**
     * Export error log for debugging
     */
    exportErrorLog() {
        const logData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            stats: this.getErrorStats(),
            errors: this.errors,
            localStorage: JSON.parse(localStorage.getItem('errorLog') || '[]')
        };
        
        const blob = new Blob([JSON.stringify(logData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-log-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// Create global instance
window.globalErrorHandler = new GlobalErrorHandler();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.globalErrorHandler.init();
    });
} else {
    window.globalErrorHandler.init();
}

// Add CSS for error notifications
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .error-notification button {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 10px;
        font-size: 12px;
    }
    
    .error-notification button:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .critical-error-notification button {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        margin: 5px;
        font-size: 14px;
    }
    
    .critical-error-notification button:hover {
        background: rgba(255,255,255,0.3);
    }
`;
document.head.appendChild(errorStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalErrorHandler;
}
