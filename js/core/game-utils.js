/**
 * Game Utilities Collection
 * **Timestamp**: 2026-01-21
 *
 * Consolidated utilities for game development:
 * - Base game class with common functionality
 * - Canvas and grid rendering
 * - Card game utilities
 * - Sound management
 * - Input handling
 * - Math and utility functions
 */

// Import all utility modules
import { BaseGame } from './game-base.js';
import { CanvasRenderer, GridRenderer } from './canvas-renderer.js';
import { Card, Deck, CardRenderer, DragDropManager } from './card-utils.js';
import { SoundManager, SoundEffects } from './sound-manager.js';

// Math utilities
class MathUtils {
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static lerp(start, end, t) {
        return start + (end - start) * this.clamp(t, 0, 1);
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static angle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
}

// Array utilities
class ArrayUtils {
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static remove(array, item) {
        const index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }
        return false;
    }

    static contains(array, item) {
        return array.indexOf(item) > -1;
    }

    static last(array) {
        return array[array.length - 1];
    }

    static isEmpty(array) {
        return array.length === 0;
    }

    static clear(array) {
        array.length = 0;
    }
}

// String utilities
class StringUtils {
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static titleCase(str) {
        return str.split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }

    static formatNumber(num) {
        return num.toLocaleString();
    }

    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    static truncate(str, maxLength, suffix = '...') {
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength - suffix.length) + suffix;
    }
}

// Color utilities
class ColorUtils {
    static rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static lerpColor(color1, color2, t) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);

        if (!rgb1 || !rgb2) return color1;

        const r = Math.round(MathUtils.lerp(rgb1.r, rgb2.r, t));
        const g = Math.round(MathUtils.lerp(rgb1.g, rgb2.g, t));
        const b = Math.round(MathUtils.lerp(rgb1.b, rgb2.b, t));

        return this.rgbToHex(r, g, b);
    }

    static getContrastColor(hexColor) {
        const rgb = this.hexToRgb(hexColor);
        if (!rgb) return '#000000';

        // Calculate luminance
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }
}

// Input handling utilities
class InputUtils {
    static isKeyPressed(key) {
        return this.pressedKeys.has(key.toLowerCase());
    }

    static isMouseButtonPressed(button) {
        return this.pressedMouseButtons.has(button);
    }

    static getMousePosition(event, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    static preventDefaultKeys(keys) {
        document.addEventListener('keydown', (event) => {
            if (keys.includes(event.key) || keys.includes(event.code)) {
                event.preventDefault();
            }
        });
    }
}

// Initialize input tracking
InputUtils.pressedKeys = new Set();
InputUtils.pressedMouseButtons = new Set();

// Keyboard event listeners
document.addEventListener('keydown', (event) => {
    InputUtils.pressedKeys.add(event.key.toLowerCase());
    InputUtils.pressedKeys.add(event.code.toLowerCase());
});

document.addEventListener('keyup', (event) => {
    InputUtils.pressedKeys.delete(event.key.toLowerCase());
    InputUtils.pressedKeys.delete(event.code.toLowerCase());
});

// Mouse event listeners
document.addEventListener('mousedown', (event) => {
    InputUtils.pressedMouseButtons.add(event.button);
});

document.addEventListener('mouseup', (event) => {
    InputUtils.pressedMouseButtons.delete(event.button);
});

// Collision detection utilities
class CollisionUtils {
    static pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth &&
               y >= rectY && y <= rectY + rectHeight;
    }

    static pointInCircle(x, y, circleX, circleY, radius) {
        const dx = x - circleX;
        const dy = y - circleY;
        return dx * dx + dy * dy <= radius * radius;
    }

    static rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 &&
               y1 < y2 + h2 && y1 + h1 > y2;
    }

    static circlesOverlap(x1, y1, r1, x2, y2, r2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }
}

// Animation utilities
class AnimationUtils {
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static easeIn(t) {
        return t * t;
    }

    static easeOut(t) {
        return t * (2 - t);
    }

    static bounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    static animate(from, to, duration, easing = 'easeInOut', callback) {
        const startTime = Date.now();
        const easingFn = this[easing] || this.easeInOut;

        const animateFrame = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const easedT = easingFn(t);
            const value = MathUtils.lerp(from, to, easedT);

            callback(value);

            if (t < 1) {
                requestAnimationFrame(animateFrame);
            }
        };

        requestAnimationFrame(animateFrame);
    }
}

// Export consolidated utilities
export {
    BaseGame,
    CanvasRenderer,
    GridRenderer,
    Card,
    Deck,
    CardRenderer,
    DragDropManager,
    SoundManager,
    SoundEffects,
    MathUtils,
    ArrayUtils,
    StringUtils,
    ColorUtils,
    InputUtils,
    CollisionUtils,
    AnimationUtils
};

// Make available globally for games that don't use modules
if (typeof window !== 'undefined') {
    window.GameUtils = {
        BaseGame,
        CanvasRenderer,
        GridRenderer,
        Card,
        Deck,
        CardRenderer,
        DragDropManager,
        SoundManager,
        SoundEffects,
        MathUtils,
        ArrayUtils,
        StringUtils,
        ColorUtils,
        InputUtils,
        CollisionUtils,
        AnimationUtils
    };
}