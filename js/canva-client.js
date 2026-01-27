/**
 * Canva Integration Client
 * Provides seamless integration with Canva design tools
 * **Timestamp**: 2025-01-22
 */

class CanvaClient {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.canvaSDK = null;
        this.designs = [];
        this.templates = {};
        console.log('[CANVA CLIENT] Canva integration client initialized');
    }

    async init(apiKey = null) {
        if (this.isInitialized) return;

        this.apiKey = apiKey || this.getStoredApiKey();

        try {
            if (window.Canva && window.Canva.DesignButton) {
                this.canvaSDK = window.Canva;
                await this.setupDesignButtons();
                this.isInitialized = true;
                console.log('[CANVA CLIENT] Canva SDK loaded successfully');
            } else {
                console.warn('[CANVA CLIENT] Canva SDK not available');
                await this.loadSDK();
            }
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to initialize:', error);
            this.handleError(error);
        }
    }

    getStoredApiKey() {
        try {
            return localStorage.getItem('canvaApiKey');
        } catch (e) {
            return null;
        }
    }

    storeApiKey(apiKey) {
        try {
            localStorage.setItem('canvaApiKey', apiKey);
            this.apiKey = apiKey;
            console.log('[CANVA CLIENT] API key stored');
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to store API key:', e);
        }
    }

    async loadSDK() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="canva"]')) {
                resolve();
                return;
            }

            console.log('[CANVA CLIENT] Loading Canva SDK dynamically');

            const script = document.createElement('script');
            script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
            script.onload = () => {
                console.log('[CANVA CLIENT] SDK loaded dynamically');
                this.canvaSDK = window.Canva;
                this.setupDesignButtons();
                this.isInitialized = true;
                resolve();
            };
            script.onerror = (error) => {
                console.error('[CANVA CLIENT] Failed to load SDK:', error);
                reject(error);
            };
            document.head.appendChild(script);

            setTimeout(() => {
                reject(new Error('SDK loading timeout'));
            }, 10000);
        });
    }

    async setupDesignButtons() {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) return;

        console.log('[CANVA CLIENT] Setting up design buttons');

        const buttons = document.querySelectorAll('[data-canva-design-button]');
        buttons.forEach(button => {
            this.initDesignButton(button);
        });

        const canvaButtons = document.querySelectorAll('.canva-button');
        canvaButtons.forEach(button => {
            this.initDesignButton(button);
        });
    }

    initDesignButton(element) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) {
            console.warn('[CANVA CLIENT] Cannot initialize design button - SDK not available');
            return;
        }

        const designType = element.dataset.designType || element.dataset.canvaDesignType || 'Poster';
        const buttonId = element.id || `canva-btn-${Date.now()}`;

        console.log(`[CANVA CLIENT] Initializing design button: ${buttonId} for ${designType}`);

        try {
            const designButton = this.canvaSDK.DesignButton.create({
                apiKey: this.apiKey,
                design: {
                    type: designType,
                    dimensions: this.getDesignDimensions(designType)
                },
                onDesignOpen: (designId) => {
                    console.log('[CANVA CLIENT] Design opened:', designId);
                    this.trackDesignEvent('open', { designId, type: designType, buttonId });
                },
                onDesignPublish: (designUrl, designId, designTitle) => {
                    console.log('[CANVA CLIENT] Design published:', designUrl);
                    this.handlePublishedDesign(designUrl, designId, designTitle, element);
                    this.trackDesignEvent('publish', {
                        designId,
                        designUrl,
                        designTitle,
                        type: designType,
                        buttonId
                    });
                },
                onDesignError: (error) => {
                    console.error('[CANVA CLIENT] Design error:', error);
                    this.handleError(error);
                    this.trackDesignEvent('error', { error: error.message, type: designType, buttonId });
                }
            });

            element._canvaButton = designButton;
            designButton.mount(element);

            console.log(`[CANVA CLIENT] Design button mounted: ${buttonId}`);
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to create design button:', error);
            this.handleError(error);
        }
    }

    getDesignDimensions(designType) {
        const dimensions = {
            Poster: { width: 1080, height: 1080 },
            InstagramPost: { width: 1080, height: 1080 },
            Story: { width: 1080, height: 1920 },
            FacebookPost: { width: 1200, height: 630 },
            Presentation: { width: 1920, height: 1080 },
            Card: { width: 1080, height: 1080 },
            Resume: { width: 210, height: 297 },
            Banner: { width: 1200, height: 628 },
            Logo: { width: 1000, height: 1000 },
            Flyer: { width: 1080, height: 1920 }
        };

        return dimensions[designType] || dimensions.Poster;
    }

    handlePublishedDesign(designUrl, designId, designTitle, sourceElement) {
        console.log('[CANVA CLIENT] Processing published design');

        const designData = {
            id: designId,
            url: designUrl,
            title: designTitle || `Design ${designId}`,
            timestamp: new Date().toISOString(),
            source: sourceElement.id || sourceElement.className || 'unknown',
            type: sourceElement.dataset.designType || 'Poster'
        };

        this.designs.push(designData);
        this.saveDesigns();

        this.notifyDesignPublished(designData);
        this.showSuccessMessage(`Design "${designTitle || designId}" published successfully!`);
    }

    saveDesigns() {
        try {
            localStorage.setItem('canvaDesigns', JSON.stringify(this.designs));
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to save designs:', e);
        }
    }

    loadDesigns() {
        try {
            const saved = localStorage.getItem('canvaDesigns');
            this.designs = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to load designs:', e);
            this.designs = [];
        }
    }

    notifyDesignPublished(designData) {
        const event = new CustomEvent('canvaDesignPublished', {
            detail: designData
        });
        document.dispatchEvent(event);

        if (window.onCanvaDesignPublished) {
            window.onCanvaDesignPublished(designData);
        }
    }

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'canva-success-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    trackDesignEvent(eventType, data) {
        const eventData = {
            event: eventType,
            timestamp: new Date().toISOString(),
            ...data
        };

        try {
            const analytics = JSON.parse(localStorage.getItem('canvaAnalytics') || '[]');
            analytics.push(eventData);

            if (analytics.length > 100) {
                analytics.splice(0, analytics.length - 100);
            }

            localStorage.setItem('canvaAnalytics', JSON.stringify(analytics));
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to track event:', e);
        }

        console.log(`[CANVA CLIENT] Event tracked: ${eventType}`, data);
    }

    createDesign(designType = 'Poster', options = {}) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) {
            console.warn('[CANVA CLIENT] Canva SDK not available for createDesign');
            this.showErrorMessage('Canva is not available. Please refresh the page and try again.');
            return;
        }

        console.log(`[CANVA CLIENT] Creating new ${designType} design`);

        const tempButton = document.createElement('button');
        tempButton.style.display = 'none';
        tempButton.dataset.designType = designType;
        tempButton.id = `temp-canva-btn-${Date.now()}`;

        if (options.title) tempButton.dataset.designTitle = options.title;
        if (options.width) tempButton.dataset.width = options.width;
        if (options.height) tempButton.dataset.height = options.height;

        document.body.appendChild(tempButton);

        try {
            this.initDesignButton(tempButton);

            setTimeout(() => {
                const mountedButton = document.getElementById(tempButton.id);
                if (mountedButton && mountedButton._canvaButton) {
                    console.log('[CANVA CLIENT] Design creation initiated');
                } else {
                    console.warn('[CANVA CLIENT] Failed to initialize temporary design button');
                    this.showErrorMessage('Failed to create design. Please try again.');
                }

                setTimeout(() => {
                    const btn = document.getElementById(tempButton.id);
                    if (btn) document.body.removeChild(btn);
                }, 1000);
            }, 200);
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to create design:', error);
            this.showErrorMessage('Failed to create design. Please try again.');
            document.body.removeChild(tempButton);
        }
    }

    handleError(error) {
        console.error('[CANVA CLIENT] Error:', error);

        let message = 'An error occurred with Canva integration.';
        if (error.message) {
            if (error.message.includes('network')) {
                message = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('auth')) {
                message = 'Authentication error. Please check your Canva API key.';
            } else if (error.message.includes('quota')) {
                message = 'API quota exceeded. Please try again later.';
            }
        }

        this.showErrorMessage(message);
    }

    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'canva-error-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">❌</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 7000);
    }

    getDesignHistory() {
        this.loadDesigns();
        return this.designs;
    }

    getAnalytics() {
        try {
            return JSON.parse(localStorage.getItem('canvaAnalytics') || '[]');
        } catch (e) {
            return [];
        }
    }

    clearData() {
        try {
            localStorage.removeItem('canvaDesigns');
            localStorage.removeItem('canvaAnalytics');
            this.designs = [];
            console.log('[CANVA CLIENT] Data cleared');
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to clear data:', e);
        }
    }
}

// CSS for notifications
const canvaClientStyles = document.createElement('style');
canvaClientStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .notification-icon {
        font-size: 1.2em;
    }

    .notification-text {
        flex: 1;
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2em;
        padding: 0;
        opacity: 0.8;
    }

    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(canvaClientStyles);

// Initialize global instance
window.canvaClient = new CanvaClient();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.canvaClient.init();
    });
} else {
    window.canvaClient.init();
}
