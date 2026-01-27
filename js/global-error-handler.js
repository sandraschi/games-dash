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

        // Try to send error report to server for centralized logging
        this.reportErrorToServer(errorInfo);
    }

    /**
     * Report error to server for centralized logging
     */
    async reportErrorToServer(errorInfo) {
        try {
            // Only report critical errors to avoid spam
            if (!errorInfo.critical) return;

            const reportData = {
                timestamp: errorInfo.timestamp,
                type: errorInfo.type,
                message: errorInfo.message,
                filename: errorInfo.filename,
                lineno: errorInfo.lineno,
                colno: errorInfo.colno,
                url: window.location.href,
                userAgent: navigator.userAgent,
                game: this.getCurrentGame(),
                sessionId: this.getSessionId()
            };

            // Try to send to error reporting endpoint (if available)
            const response = await fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData),
                signal: AbortSignal.timeout(2000) // 2 second timeout
            });

            if (response.ok) {
                console.log('[ERROR HANDLER] Error reported to server successfully');
            }
        } catch (e) {
            // Silently fail if server reporting is not available
            console.debug('[ERROR HANDLER] Could not report error to server:', e.message);
        }
    }

    /**
     * Get current game from URL or page title
     */
    getCurrentGame() {
        try {
            const path = window.location.pathname;
            const title = document.title;

            // Extract game name from path
            const pathMatch = path.match(/\/games\/([^\/]+)\//);
            if (pathMatch) return pathMatch[1];

            // Extract from title
            const titleMatch = title.match(/^([^-\|]+)/);
            if (titleMatch) return titleMatch[1].trim();

            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }

    /**
     * Get or create session ID for error tracking
     */
    getSessionId() {
        try {
            let sessionId = sessionStorage.getItem('errorSessionId');
            if (!sessionId) {
                sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                sessionStorage.setItem('errorSessionId', sessionId);
            }
            return sessionId;
        } catch (e) {
            return 'unknown';
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
            /audiocontext.*suspend/i,
            /stockfish.*not.*found/i,
            /engine.*connection.*fail/i,
            /webgl.*not.*supported/i,
            /out.*of.*memory/i,
            /maximum.*call.*stack/i,
            /cannot.*read.*property.*null/i,
            /undefined.*is.*not.*function/i
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

        // Auto-remove after longer delay (8 seconds for regular errors, 15 for critical)
        const autoRemoveDelay = errorInfo.critical ? 15000 : 8000;
        setTimeout(() => {
            if (notification.parentElement) {
                // Fade out animation
                notification.style.transition = 'opacity 0.5s ease';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 500);
            }
        }, autoRemoveDelay);
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
            'websocket': 'Lost connection to game server. Check your internet connection and try reconnecting.',
            'firebase': 'Cloud multiplayer services are currently unavailable. You can still play locally.',
            'three': '3D graphics failed to initialize. This game may not support your browser or device.',
            'audiocontext': 'Audio system error. Game sounds are disabled. You can continue playing.',
            'script_load': `Failed to load game component: ${errorInfo.source || 'unknown'}. Try refreshing the page or check your connection.`,
            'promise': `Game operation failed: ${errorInfo.message || 'Unknown error'}. Please try again.`,
            'javascript': `JavaScript error: ${errorInfo.message || 'Unknown error'} in ${errorInfo.filename || 'game code'}:${errorInfo.lineno || '?'}. The game may need to be refreshed.`,
            'stockfish': 'Chess engine failed to load. You can still play, but AI analysis is unavailable.',
            'engine': 'Game engine connection failed. Local gameplay will continue.',
            'webgl': 'WebGL graphics not supported. Try updating your browser or use a different device.',
            'memory': 'Out of memory error. Try closing other tabs or refreshing the page.',
            'network': 'Network error occurred. Some online features may not work.',
            'chess': 'Chess game error. The position may be corrupted - try starting a new game.',
            'multiplayer': 'Multiplayer connection error. You can continue playing locally.',
            'audio': 'Audio playback error. Game sounds are disabled but you can continue playing.',
            'canvas': 'Graphics rendering error. The game display may be affected.',
            'timeout': 'Operation timed out. The server may be busy - please try again.',
            'permission': 'Permission denied. Some features require additional browser permissions.',
            'unsupported': 'This feature is not supported in your browser. Try updating or use a different browser.',
            'file_load': `Failed to load game file: ${errorInfo.filename || 'unknown'}. Check your connection.`,
            'config': 'Configuration error. Game settings may not be saved properly.',
            'save': 'Failed to save game progress. Your progress may not be preserved.',
            'load': 'Failed to load game data. Some content may not be available.',
            'validation': 'Invalid game data detected. The game may behave unexpectedly.',
            'compatibility': 'Browser compatibility issue. Some features may not work correctly.',
            'security': 'Security policy blocked this operation. Check your browser settings.',
            'quota': 'Storage quota exceeded. Try clearing browser data.',
            'interrupt': 'Operation was interrupted. Please try again.',
            'busy': 'System is busy. Please wait a moment and try again.',
            'maintenance': 'Service temporarily unavailable for maintenance.',
            'deprecated': 'This feature is deprecated and may not work correctly.',
            'experimental': 'This is an experimental feature that may be unstable.',
            'beta': 'This feature is in beta and may have bugs.',
            'debug': 'Debug mode error. This should not happen in production.',
            'test': 'Test environment error. This is not a production issue.',
            'development': 'Development error. This code path should not be reached.',
            'production': 'Production environment error. Please report this issue.',
            'unknown': 'An unexpected error occurred. Please refresh the page and try again.'
        };

        // Try to match error type first
        let message = messages[errorInfo.type];

        // If no type match, try to infer from message content
        if (!message && errorInfo.message) {
            const msg = errorInfo.message.toLowerCase();

            if (msg.includes('network') || msg.includes('connection')) {
                message = messages['network'];
            } else if (msg.includes('timeout') || msg.includes('timed out')) {
                message = messages['timeout'];
            } else if (msg.includes('permission') || msg.includes('denied')) {
                message = messages['permission'];
            } else if (msg.includes('memory') || msg.includes('out of memory')) {
                message = messages['memory'];
            } else if (msg.includes('webgl') || msg.includes('graphics')) {
                message = messages['webgl'];
            } else if (msg.includes('audio') || msg.includes('sound')) {
                message = messages['audio'];
            } else if (msg.includes('chess') || msg.includes('engine')) {
                message = messages['chess'];
            } else if (msg.includes('multiplayer') || msg.includes('firebase')) {
                message = messages['multiplayer'];
            } else if (msg.includes('canvas') || msg.includes('render')) {
                message = messages['canvas'];
            } else if (msg.includes('file') || msg.includes('load')) {
                message = messages['file_load'];
            } else if (msg.includes('save') || msg.includes('storage')) {
                message = messages['save'];
            } else if (msg.includes('validation') || msg.includes('invalid')) {
                message = messages['validation'];
            } else if (msg.includes('security') || msg.includes('policy')) {
                message = messages['security'];
            } else if (msg.includes('quota') || msg.includes('storage')) {
                message = messages['quota'];
            } else if (msg.includes('interrupt') || msg.includes('cancelled')) {
                message = messages['interrupt'];
            } else if (msg.includes('busy') || msg.includes('rate limit')) {
                message = messages['busy'];
            } else if (msg.includes('maintenance') || msg.includes('unavailable')) {
                message = messages['maintenance'];
            }
        }

        // If still no match, try the original type or use generic
        if (!message) {
            message = messages['unknown'];
        }

        // Add context for critical errors
        if (errorInfo.critical) {
            message += ' This appears to be a critical issue that may affect gameplay.';
        }

        // Add recovery suggestion if available
        const recovery = this.getRecoverySuggestion(errorInfo.type);
        if (recovery) {
            message += ` ${recovery}`;
        }

        return message;
    }

    /**
     * Get recovery suggestion for error type
     */
    getRecoverySuggestion(errorType) {
        const suggestions = {
            'websocket': 'Try refreshing the page to reconnect.',
            'network': 'Check your internet connection and try again.',
            'three': 'Try refreshing the page or use a different browser.',
            'webgl': 'Update your browser or try a different device.',
            'memory': 'Close other tabs and refresh the page.',
            'timeout': 'Wait a moment and try again.',
            'permission': 'Grant the required permissions in your browser settings.',
            'quota': 'Clear your browser cache and cookies.',
            'security': 'Check your browser security settings.',
            'script_load': 'Refresh the page to reload all components.',
            'javascript': 'Refresh the page to reset the application state.',
            'chess': 'Start a new game to reset the position.',
            'multiplayer': 'Continue playing locally or try reconnecting later.',
            'audio': 'Refresh the page or check your audio settings.',
            'canvas': 'Try refreshing the page.',
            'save': 'Your progress may still be saved locally.',
            'load': 'Try refreshing the page to reload the data.',
            'validation': 'The game should still be playable.',
            'compatibility': 'Try updating your browser.',
            'busy': 'Wait a moment before trying again.',
            'maintenance': 'Try again later.',
            'unknown': 'If the problem persists, try refreshing the page.'
        };

        return suggestions[errorType];
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

        // Stockfish engine recovery
        this.recoveryStrategies.set('stockfish', (error) => {
            console.log('[ERROR HANDLER] Attempting Stockfish recovery...');
            // Try to reconnect to Stockfish server
            setTimeout(() => {
                if (window.chessGame && window.chessGame.connectToEngine) {
                    window.chessGame.connectToEngine();
                }
            }, 3000);
            return true;
        });

        // Firebase recovery
        this.recoveryStrategies.set('firebase', (error) => {
            console.log('[ERROR HANDLER] Attempting Firebase recovery...');
            // Try to reinitialize Firebase
            setTimeout(() => {
                if (window.initializeFirebase) {
                    window.initializeFirebase();
                }
            }, 2000);
            return true;
        });

        // Network recovery
        this.recoveryStrategies.set('network', (error) => {
            console.log('[ERROR HANDLER] Attempting network recovery...');
            // Show network status and retry connections
            setTimeout(() => {
                if (navigator.onLine) {
                    this.showUserNotification({
                        type: 'network',
                        message: 'Network connection restored. Retrying operations...'
                    });
                    // Trigger reconnection for multiplayer and engines
                    if (window.unifiedMultiplayer) {
                        window.unifiedMultiplayer.initialize();
                    }
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
