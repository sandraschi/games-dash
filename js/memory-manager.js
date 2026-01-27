// Memory Management Utilities for Games App
// **Timestamp**: 2025-12-17
// Optimizes memory usage and provides cleanup utilities

class MemoryManager {
    constructor() {
        this.eventListeners = new Map();
        this.timers = new Set();
        this.intervals = new Set();
        this.observers = new Set();
        this.workers = new Set();
        this.canvases = new Set();
        this.gcThreshold = 50 * 1024 * 1024; // 50MB threshold for manual GC

        // Start memory monitoring
        this.startMemoryMonitoring();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        window.addEventListener('pagehide', () => this.cleanup());
    }

    /**
     * Track event listener for cleanup
     */
    trackEventListener(element, event, handler, options) {
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({ event, handler, options });
    }

    /**
     * Track timer for cleanup
     */
    trackTimer(timerId) {
        this.timers.add(timerId);
        return timerId;
    }

    /**
     * Track interval for cleanup
     */
    trackInterval(intervalId) {
        this.intervals.add(intervalId);
        return intervalId;
    }

    /**
     * Track observer for cleanup
     */
    trackObserver(observer) {
        this.observers.add(observer);
        return observer;
    }

    /**
     * Track worker for cleanup
     */
    trackWorker(worker) {
        this.workers.add(worker);
        return worker;
    }

    /**
     * Track canvas for memory monitoring
     */
    trackCanvas(canvas) {
        this.canvases.add(canvas);
        return canvas;
    }

    /**
     * Force garbage collection if available and memory usage is high
     */
    forceGC() {
        if (window.gc && performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            if (used > this.gcThreshold) {
                console.log(`[MEMORY] Forcing GC - Used: ${(used / 1024 / 1024).toFixed(1)}MB`);
                window.gc();
            }
        }
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        if (!performance.memory) return;

        this.trackInterval(setInterval(() => {
            const mem = performance.memory;
            const usedMB = (mem.usedJSHeapSize / 1024 / 1024).toFixed(1);
            const totalMB = (mem.totalJSHeapSize / 1024 / 1024).toFixed(1);
            const limitMB = (mem.jsHeapSizeLimit / 1024 / 1024).toFixed(1);

            console.log(`[MEMORY] Used: ${usedMB}MB, Total: ${totalMB}MB, Limit: ${limitMB}MB`);

            // Force GC if usage is high
            this.forceGC();
        }, 30000)); // Check every 30 seconds
    }

    /**
     * Clear canvas memory
     */
    clearCanvasMemory(canvas) {
        if (canvas && canvas.getContext) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }

    /**
     * Optimized object cleanup
     */
    deepCleanup(obj) {
        if (!obj || typeof obj !== 'object') return;

        // Clear arrays
        if (Array.isArray(obj)) {
            obj.length = 0;
            return;
        }

        // Clear object properties
        const keys = Object.keys(obj);
        for (const key of keys) {
            const value = obj[key];

            // Recursively cleanup nested objects
            if (value && typeof value === 'object') {
                this.deepCleanup(value);
            }

            // Clear the property
            delete obj[key];
        }
    }

    /**
     * Cleanup all tracked resources
     */
    cleanup() {
        console.log('[MEMORY] Starting cleanup...');

        // Clear event listeners
        for (const [element, listeners] of this.eventListeners.entries()) {
            for (const { event, handler } of listeners) {
                element.removeEventListener(event, handler);
            }
        }
        this.eventListeners.clear();

        // Clear timers
        for (const timerId of this.timers) {
            clearTimeout(timerId);
        }
        this.timers.clear();

        // Clear intervals
        for (const intervalId of this.intervals) {
            clearInterval(intervalId);
        }
        this.intervals.clear();

        // Disconnect observers
        for (const observer of this.observers) {
            if (observer.disconnect) {
                observer.disconnect();
            }
        }
        this.observers.clear();

        // Terminate workers
        for (const worker of this.workers) {
            if (worker.terminate) {
                worker.terminate();
            }
        }
        this.workers.clear();

        // Clear canvas memory
        for (const canvas of this.canvases) {
            this.clearCanvasMemory(canvas);
        }

        // Clear API cache
        if (window.apiConfig && window.apiConfig.cleanupCache) {
            window.apiConfig.cleanupCache();
        }

        // Force final GC
        this.forceGC();

        console.log('[MEMORY] Cleanup complete');
    }

    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        if (!performance.memory) {
            return { error: 'Memory API not available' };
        }

        const mem = performance.memory;
        return {
            used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
            total: Math.round(mem.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024),
            usedPercent: Math.round((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100),
            tracked: {
                eventListeners: this.eventListeners.size,
                timers: this.timers.size,
                intervals: this.intervals.size,
                observers: this.observers.size,
                workers: this.workers.size
            }
        };
    }
}

// Optimized wrapper functions for common operations
const memoryManager = new MemoryManager();

// Enhanced setTimeout with tracking
window.trackedSetTimeout = function(callback, delay) {
    const timerId = setTimeout(() => {
        memoryManager.timers.delete(timerId);
        callback();
    }, delay);
    return memoryManager.trackTimer(timerId);
};

// Enhanced setInterval with tracking
window.trackedSetInterval = function(callback, delay) {
    const intervalId = setInterval(callback, delay);
    return memoryManager.trackInterval(intervalId);
};

// Enhanced addEventListener with tracking
window.trackedAddEventListener = function(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    memoryManager.trackEventListener(element, event, handler, options);
};

// Enhanced IntersectionObserver with tracking
window.trackedIntersectionObserver = function(callback, options) {
    const observer = new IntersectionObserver(callback, options);
    return memoryManager.trackObserver(observer);
};

// Enhanced Worker with tracking
window.trackedWorker = function(url) {
    const worker = new Worker(url);
    return memoryManager.trackWorker(worker);
};

// Make memory manager globally available
window.memoryManager = memoryManager;

// Log initial memory stats
document.addEventListener('DOMContentLoaded', () => {
    console.log('[MEMORY] Memory manager initialized');
    const stats = memoryManager.getMemoryStats();
    if (!stats.error) {
        console.log(`[MEMORY] Initial stats: ${JSON.stringify(stats)}`);
    }
});
