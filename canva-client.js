/**
 * Canva Integration Client
 * **Timestamp**: 2025-01-22
 */

class CanvaClient {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.canvaSDK = null;
        console.log('[CANVA CLIENT] Initialized');
    }

    async init(apiKey = null) {
        if (this.isInitialized) return;

        this.apiKey = apiKey || this.getStoredApiKey();

        try {
            // Load Canva SDK if available
            if (window.Canva && window.Canva.DesignButton) {
                this.canvaSDK = window.Canva;
                this.setupDesignButtons();
                this.isInitialized = true;
                console.log('[CANVA CLIENT] Canva SDK loaded successfully');
            } else {
                console.warn('[CANVA CLIENT] Canva SDK not available');
                // Load SDK dynamically if needed
                await this.loadSDK();
            }
        } catch (error) {
            console.error('[CANVA CLIENT] Failed to initialize:', error);
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
        } catch (e) {
            console.warn('[CANVA CLIENT] Failed to store API key:', e);
        }
    }

    async loadSDK() {
        return new Promise((resolve, reject) => {
            // Check if SDK is already loading
            if (document.querySelector('script[src*="canva"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
            script.onload = () => {
                console.log('[CANVA CLIENT] SDK loaded dynamically');
                this.canvaSDK = window.Canva;
                this.setupDesignButtons();
                this.isInitialized = true;
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupDesignButtons() {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) return;

        // Find all Canva design buttons
        const buttons = document.querySelectorAll('[data-canva-design-button]');
        buttons.forEach(button => {
            this.initDesignButton(button);
        });
    }

    initDesignButton(element) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) return;

        const designType = element.dataset.designType || 'Poster';
        const designButton = this.canvaSDK.DesignButton.create({
            apiKey: this.apiKey,
            design: {
                type: designType
            },
            onDesignOpen: (designId) => {
                console.log('[CANVA CLIENT] Design opened:', designId);
            },
            onDesignPublish: (designUrl) => {
                console.log('[CANVA CLIENT] Design published:', designUrl);
                // Handle published design
                this.handlePublishedDesign(designUrl, element);
            },
            onError: (error) => {
                console.error('[CANVA CLIENT] Design button error:', error);
            }
        });

        designButton.mount(element);
    }

    handlePublishedDesign(designUrl, sourceElement) {
        // Handle when user publishes a design from Canva
        console.log('[CANVA CLIENT] Design published:', designUrl);

        // You could save this to game state, share it, etc.
        if (window.gameState) {
            window.gameState.canvaDesigns = window.gameState.canvaDesigns || [];
            window.gameState.canvaDesigns.push({
                url: designUrl,
                timestamp: new Date().toISOString(),
                source: sourceElement.id || 'unknown'
            });
        }
    }

    createDesign(designType = 'Poster', options = {}) {
        if (!this.canvaSDK || !this.canvaSDK.DesignButton) {
            console.warn('[CANVA CLIENT] Canva SDK not available');
            return;
        }

        // Create a temporary button and click it
        const tempButton = document.createElement('button');
        tempButton.style.display = 'none';
        tempButton.dataset.designType = designType;
        document.body.appendChild(tempButton);

        this.initDesignButton(tempButton);

        // Trigger click after a short delay
        setTimeout(() => {
            tempButton.click();
            document.body.removeChild(tempButton);
        }, 100);
    }

    getDesignHistory() {
        if (!window.gameState || !window.gameState.canvaDesigns) {
            return [];
        }
        return window.gameState.canvaDesigns;
    }
}

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
