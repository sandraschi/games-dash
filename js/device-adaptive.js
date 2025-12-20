/**
 * Device Adaptive System - Advanced Responsive Design
 * Detects device type, input methods, orientation, and adapts game layouts/behaviors
 * **Timestamp**: 2025-12-20
 */

class DeviceAdaptive {
    constructor() {
        this.device = this.detectDevice();
        this.input = this.detectInputMethod();
        this.orientation = this.detectOrientation();
        this.capabilities = this.detectCapabilities();
        this.layout = this.calculateOptimalLayout();

        this.bindEvents();
        this.logDeviceInfo();
    }

    // Device Detection
    detectDevice() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;

        const device = {
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            isIOS: false,
            isAndroid: false,
            isWindows: false,
            isMac: false,
            isLinux: false,
            model: 'unknown',
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1
            }
        };

        // Mobile detection
        if (/Android/i.test(ua)) {
            device.isAndroid = true;
            device.isMobile = true;
            device.model = this.extractAndroidModel(ua);
        } else if (/iPhone|iPad|iPod/i.test(ua)) {
            device.isIOS = true;
            device.isMobile = /iPhone|iPod/.test(ua);
            device.isTablet = /iPad/.test(ua);
            device.model = this.extractIOSModel(ua);
        } else if (/Windows/i.test(platform)) {
            device.isWindows = true;
            device.isDesktop = true;
        } else if (/Mac/i.test(platform)) {
            device.isMac = true;
            device.isDesktop = true;
        } else if (/Linux/i.test(platform)) {
            device.isLinux = true;
            device.isDesktop = true;
        }

        // Fallback detection
        if (!device.isMobile && !device.isTablet && !device.isDesktop) {
            device.isDesktop = true;
        }

        return device;
    }

    extractIOSModel(ua) {
        if (ua.includes('iPhone')) {
            // Extract iPhone model from user agent
            const match = ua.match(/iPhone(\d+),(\d+)/);
            if (match) {
                const major = parseInt(match[1]);
                const minor = parseInt(match[2]);
                return `iPhone ${major}${minor}`;
            }
            return 'iPhone';
        }
        if (ua.includes('iPad')) return 'iPad';
        return 'iOS Device';
    }

    extractAndroidModel(ua) {
        // Try to extract device model from Android UA
        const models = ['Pixel', 'Galaxy', 'OnePlus', 'Xiaomi', 'Huawei', 'Sony'];
        for (const model of models) {
            if (ua.includes(model)) return model;
        }
        return 'Android Device';
    }

    // Input Method Detection
    detectInputMethod() {
        const input = {
            hasTouch: false,
            hasMouse: false,
            hasKeyboard: false,
            primaryInput: 'unknown',
            touchPoints: 0,
            precision: 'coarse', // 'coarse' for touch, 'fine' for mouse
            lastInteraction: null
        };

        // Touch detection
        input.hasTouch = 'ontouchstart' in window ||
                         navigator.maxTouchPoints > 0 ||
                         navigator.msMaxTouchPoints > 0;

        if (input.hasTouch) {
            input.touchPoints = navigator.maxTouchPoints || 1;
        }

        // Mouse detection (more complex - assume if not touch-only)
        input.hasMouse = !input.hasTouch ||
                        window.matchMedia('(pointer: fine)').matches ||
                        window.matchMedia('(hover: hover)').matches;

        // Keyboard detection
        input.hasKeyboard = !input.hasTouch; // Simplified - most touch devices have virtual keyboards

        // Determine primary input
        if (input.hasTouch && !input.hasMouse) {
            input.primaryInput = 'touch';
            input.precision = 'coarse';
        } else if (input.hasMouse) {
            input.primaryInput = 'mouse';
            input.precision = 'fine';
        } else {
            input.primaryInput = 'keyboard';
            input.precision = 'fine';
        }

        // Set up event listeners to track actual usage
        this.setupInputTracking(input);

        return input;
    }

    setupInputTracking(input) {
        // Track actual input usage
        document.addEventListener('touchstart', () => {
            input.lastInteraction = 'touch';
        }, { passive: true });

        document.addEventListener('mousedown', () => {
            input.lastInteraction = 'mouse';
        });

        document.addEventListener('keydown', () => {
            input.lastInteraction = 'keyboard';
        });
    }

    // Orientation Detection
    detectOrientation() {
        const orientation = {
            angle: screen.orientation ? screen.orientation.angle : 0,
            type: 'portrait',
            isLandscape: false,
            isPortrait: true
        };

        // Modern orientation API
        if (screen.orientation) {
            orientation.angle = screen.orientation.angle;
            orientation.type = screen.orientation.type;
        } else {
            // Fallback for older browsers
            orientation.angle = window.orientation || 0;
            orientation.type = Math.abs(orientation.angle) === 90 ? 'landscape' : 'portrait';
        }

        orientation.isLandscape = orientation.type.includes('landscape');
        orientation.isPortrait = orientation.type.includes('portrait');

        return orientation;
    }

    // Capability Detection
    detectCapabilities() {
        return {
            webgl: this.detectWebGL(),
            canvas: !!document.createElement('canvas').getContext,
            localStorage: this.testLocalStorage(),
            serviceWorker: 'serviceWorker' in navigator,
            vibration: 'vibrate' in navigator,
            geolocation: 'geolocation' in navigator,
            deviceMotion: 'DeviceMotionEvent' in window,
            deviceOrientation: 'DeviceOrientationEvent' in window,
            fullscreen: !!(document.documentElement.requestFullscreen ||
                          document.documentElement.webkitRequestFullscreen),
            pointerLock: 'pointerLockElement' in document ||
                        'webkitPointerLockElement' in document
        };
    }

    detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    testLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Optimal Layout Calculation
    calculateOptimalLayout() {
        const layout = {
            allowZoom: true,
            allowScroll: true,
            controlScheme: 'auto',
            uiScale: 1,
            touchTargets: 'standard',
            canvasSize: this.calculateCanvasSize(),
            buttonLayout: this.calculateButtonLayout(),
            gestureHandling: this.calculateGestureHandling()
        };

        // Device-specific adjustments
        if (this.device.isMobile) {
            if (this.device.isIOS) {
                layout.allowZoom = true; // iOS users expect zoom
                layout.allowScroll = true; // Allow vertical scroll
                layout.controlScheme = this.input.primaryInput === 'touch' ? 'touch-optimized' : 'hybrid';
                layout.touchTargets = 'generous';
                layout.uiScale = this.device.screenSize.width < 375 ? 0.9 : 1; // Smaller iPhones
            } else if (this.device.isAndroid) {
                layout.allowZoom = false; // Android games typically don't zoom
                layout.allowScroll = false; // Prevent accidental scroll
                layout.controlScheme = 'touch-first';
                layout.touchTargets = 'generous';
                layout.uiScale = 1;
            }

            if (this.orientation.isLandscape) {
                layout.controlScheme = 'landscape-touch';
                layout.buttonLayout = 'side-by-side';
            }
        } else if (this.device.isDesktop) {
            layout.allowZoom = true;
            layout.allowScroll = true;
            layout.controlScheme = this.input.primaryInput === 'mouse' ? 'mouse-keyboard' : 'touch-emulation';
            layout.touchTargets = 'compact';
            layout.uiScale = 1.1; // Slightly larger on desktop
        }

        return layout;
    }

    calculateCanvasSize() {
        const screen = this.device.screenSize;
        const isMobile = this.device.isMobile;
        const isLandscape = this.orientation.isLandscape;

        let maxWidth, maxHeight;

        if (isMobile) {
            if (isLandscape) {
                // Landscape mobile: canvas takes ~60% of height, full width minus controls
                maxHeight = Math.floor(screen.height * 0.6);
                maxWidth = Math.floor(screen.width * 0.7); // Leave room for controls
            } else {
                // Portrait mobile: canvas takes ~70% of width
                maxWidth = Math.floor(screen.width * 0.9);
                maxHeight = Math.floor(screen.height * 0.5);
            }
        } else {
            // Desktop: generous canvas size
            maxWidth = Math.min(800, screen.width * 0.8);
            maxHeight = Math.min(600, screen.height * 0.7);
        }

        return { maxWidth, maxHeight };
    }

    calculateButtonLayout() {
        if (this.device.isMobile) {
            return this.orientation.isLandscape ? 'horizontal-spread' : 'vertical-stack';
        }
        return 'grid';
    }

    calculateGestureHandling() {
        const gestures = {
            pinchZoom: false,
            swipe: false,
            doubleTap: false,
            longPress: false,
            multiTouch: false
        };

        if (this.device.isMobile) {
            gestures.pinchZoom = this.device.isIOS; // iOS users expect pinch zoom
            gestures.swipe = true;
            gestures.doubleTap = false; // Prevent double-tap zoom
            gestures.longPress = false; // Prevent context menu
            gestures.multiTouch = this.input.touchPoints > 1;
        }

        return gestures;
    }

    // Event Binding
    bindEvents() {
        // Orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.orientation = this.detectOrientation();
                this.layout = this.calculateOptimalLayout();
                this.notifyLayoutChange('orientation');
            }, 100);
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.device.screenSize = {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1
            };
            this.layout = this.calculateOptimalLayout();
            this.notifyLayoutChange('resize');
        });

        // Input method changes (detect if user switches between touch/mouse)
        document.addEventListener('touchstart', () => {
            if (this.input.lastInteraction !== 'touch') {
                this.input.lastInteraction = 'touch';
                this.notifyLayoutChange('input-method');
            }
        }, { passive: true });

        document.addEventListener('mousedown', () => {
            if (this.input.lastInteraction !== 'mouse') {
                this.input.lastInteraction = 'mouse';
                this.notifyLayoutChange('input-method');
            }
        });

        document.addEventListener('keydown', () => {
            if (this.input.lastInteraction !== 'keyboard') {
                this.input.lastInteraction = 'keyboard';
                this.notifyLayoutChange('input-method');
            }
        });
    }

    // Layout Change Notifications
    notifyLayoutChange(reason) {
        const event = new CustomEvent('deviceAdaptiveLayoutChange', {
            detail: {
                device: this.device,
                input: this.input,
                orientation: this.orientation,
                layout: this.layout,
                reason: reason
            }
        });

        document.dispatchEvent(event);
        this.logDeviceInfo();
    }

    // Utility Methods
    getOptimalControlScheme(gameType = 'general') {
        const baseScheme = this.layout.controlScheme;

        // Game-specific adjustments
        switch (gameType) {
            case 'tetris':
                if (this.device.isMobile && this.orientation.isLandscape) {
                    return 'tetris-landscape-touch';
                } else if (this.device.isMobile) {
                    return 'tetris-portrait-touch';
                } else {
                    return 'tetris-desktop';
                }
            case 'chess':
                return this.input.primaryInput === 'touch' ? 'chess-touch' : 'chess-mouse';
            case 'puzzle':
                return this.device.isMobile ? 'puzzle-mobile' : 'puzzle-desktop';
            default:
                return baseScheme;
        }
    }

    shouldAllowZoom() {
        return this.layout.allowZoom;
    }

    shouldAllowScroll() {
        return this.layout.allowScroll;
    }

    getRecommendedCanvasSize(gameType = 'general') {
        const baseSize = this.layout.canvasSize;
        const deviceInfo = this.device;
        const isPortrait = this.orientation.isPortrait;
        const isMobile = deviceInfo.isMobile;

        // Square board games that should maximize width in portrait
        const squareBoardGames = ['chess', 'checkers', 'reversi', 'go', 'gomoku', 'hnefatafl'];

        // Large map games that need scrolling (not constrained to viewport)
        const largeMapGames = ['ticket', 'ticket-to-ride'];

        if (largeMapGames.includes(gameType)) {
            // Large map games like Ticket to Ride need fixed large sizes for scrolling
            return {
                width: 1200,  // Fixed large width
                height: 800,  // Fixed large height
                allowScrolling: true,
                isLargeMap: true
            };
        } else if (squareBoardGames.includes(gameType)) {
            if (isMobile && isPortrait) {
                // Portrait mobile: square board full width, height calculated to maintain square
                const screenWidth = deviceInfo.screenSize.width;
                const availableWidth = screenWidth - 20; // Account for padding
                return {
                    width: availableWidth,
                    height: availableWidth  // Square aspect ratio
                };
            } else if (isMobile && !isPortrait) {
                // Landscape mobile: use available height, maintain square
                const screenHeight = deviceInfo.screenSize.height;
                const availableHeight = Math.floor(screenHeight * 0.7); // Leave room for controls
                const size = Math.min(availableHeight, baseSize.maxWidth);
                return { width: size, height: size };
            } else {
                // Desktop: generous square board
                const desktopSize = Math.min(baseSize.maxWidth, baseSize.maxHeight, 600);
                return { width: desktopSize, height: desktopSize };
            }
        }

        // Game-specific canvas adjustments for non-square games
        switch (gameType) {
            case 'tetris':
                // Tetris needs specific aspect ratio
                return {
                    width: Math.min(baseSize.maxWidth, 300),
                    height: Math.min(baseSize.maxHeight, 600)
                };
            default:
                return baseSize;
        }
    }

    // Logging
    logDeviceInfo() {
        console.log('🎮 Device Adaptive Info:', {
            device: this.device,
            input: this.input,
            orientation: this.orientation,
            layout: this.layout,
            capabilities: this.capabilities
        });
    }

    // Public API
    getDeviceInfo() {
        return {
            device: this.device,
            input: this.input,
            orientation: this.orientation,
            layout: this.layout,
            capabilities: this.capabilities
        };
    }

    adaptGameLayout(gameElement, gameType = 'general') {
        const optimalSize = this.getRecommendedCanvasSize(gameType);
        const controlScheme = this.getOptimalControlScheme(gameType);

        // Apply CSS classes based on detection
        const classes = [
            `device-${this.device.isMobile ? 'mobile' : 'desktop'}`,
            `input-${this.input.primaryInput}`,
            `orientation-${this.orientation.type.split('-')[0]}`, // portrait or landscape
            `controls-${controlScheme}`,
            `ui-scale-${Math.round(this.layout.uiScale * 10)}`
        ];

        gameElement.classList.add(...classes);

        // Apply CSS custom properties for dynamic sizing
        gameElement.style.setProperty('--optimal-canvas-width', `${optimalSize.width}px`);
        gameElement.style.setProperty('--optimal-canvas-height', `${optimalSize.height}px`);
        gameElement.style.setProperty('--ui-scale', this.layout.uiScale);
        gameElement.style.setProperty('--touch-target-size',
            this.layout.touchTargets === 'generous' ? '50px' : '40px');

        return {
            canvasSize: optimalSize,
            controlScheme: controlScheme,
            allowZoom: this.shouldAllowZoom(),
            allowScroll: this.shouldAllowScroll()
        };
    }
}

// Global instance
window.DeviceAdaptive = new DeviceAdaptive();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceAdaptive;
}
