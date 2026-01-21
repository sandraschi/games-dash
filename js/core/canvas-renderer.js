/**
 * Canvas/Grid Rendering Utilities
 * **Timestamp**: 2026-01-21
 *
 * Shared utilities for:
 * - Canvas setup and management
 * - Grid-based game rendering
 * - Sprite/text rendering
 * - Animation helpers
 * - Device adaptation
 */

class CanvasRenderer {
    constructor(canvasId, options = {}) {
        this.canvasId = canvasId;
        this.options = {
            autoResize: options.autoResize ?? true,
            deviceAdapt: options.deviceAdapt ?? true,
            maxWidth: options.maxWidth || 800,
            maxHeight: options.maxHeight || 600,
            backgroundColor: options.backgroundColor || '#000',
            ...options
        };

        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.devicePixelRatio = window.devicePixelRatio || 1;

        this.sprites = new Map();
        this.animations = new Set();

        this.init();
    }

    /**
     * Initialize canvas
     */
    init() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.error(`Canvas element with id '${this.canvasId}' not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Failed to get 2D context from canvas');
            return;
        }

        this.setupCanvas();
        if (this.options.autoResize) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }

        console.log(`🎨 Canvas renderer initialized for ${this.canvasId}`);
    }

    /**
     * Setup canvas properties
     */
    setupCanvas() {
        // Enable image smoothing
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Set font defaults
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
    }

    /**
     * Resize canvas for device
     */
    resize() {
        if (!this.options.deviceAdapt) {
            this.setSize(this.options.maxWidth, this.options.maxHeight);
            return;
        }

        const container = this.canvas.parentElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const aspectRatio = this.options.maxWidth / this.options.maxHeight;

        let newWidth = containerRect.width;
        let newHeight = containerRect.height;

        // Maintain aspect ratio
        if (newWidth / newHeight > aspectRatio) {
            newWidth = newHeight * aspectRatio;
        } else {
            newHeight = newWidth / aspectRatio;
        }

        // Apply maximum constraints
        newWidth = Math.min(newWidth, this.options.maxWidth);
        newHeight = Math.min(newHeight, this.options.maxHeight);

        this.setSize(newWidth, newHeight);
    }

    /**
     * Set canvas size
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;

        // Set actual canvas size (accounting for device pixel ratio)
        const scaledWidth = width * this.devicePixelRatio;
        const scaledHeight = height * this.devicePixelRatio;

        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;

        // Scale the drawing context so everything draws at the correct size
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';

        this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

        // Clear and set background
        this.clear();
    }

    /**
     * Clear canvas
     */
    clear() {
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draw rectangle
     */
    drawRect(x, y, width, height, color = '#fff', filled = true) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;

        if (filled) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    /**
     * Draw circle
     */
    drawCircle(x, y, radius, color = '#fff', filled = true) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);

        if (filled) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }

    /**
     * Draw text
     */
    drawText(text, x, y, options = {}) {
        const {
            color = '#fff',
            font = '16px Arial',
            align = 'left',
            baseline = 'top',
            maxWidth = null
        } = options;

        this.ctx.fillStyle = color;
        this.ctx.font = font;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;

        if (maxWidth) {
            this.ctx.fillText(text, x, y, maxWidth);
        } else {
            this.ctx.fillText(text, x, y);
        }
    }

    /**
     * Draw sprite
     */
    drawSprite(spriteName, x, y, options = {}) {
        const sprite = this.sprites.get(spriteName);
        if (!sprite) return;

        const { width, height, frame = 0, scale = 1 } = options;

        const frameWidth = sprite.width / sprite.frames;
        const frameHeight = sprite.height;

        const destWidth = (width || frameWidth) * scale;
        const destHeight = (height || frameHeight) * scale;

        this.ctx.drawImage(
            sprite.image,
            frame * frameWidth, 0, frameWidth, frameHeight,
            x, y, destWidth, destHeight
        );
    }

    /**
     * Load sprite
     */
    async loadSprite(name, src, frames = 1) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites.set(name, {
                    image: img,
                    width: img.width,
                    height: img.height,
                    frames: frames
                });
                resolve();
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Draw grid
     */
    drawGrid(cellSize, color = '#333') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= this.width; x += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= this.height; y += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Convert screen coordinates to canvas coordinates
     */
    screenToCanvas(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;

        return {
            x: (screenX - rect.left) * scaleX,
            y: (screenY - rect.top) * scaleY
        };
    }

    /**
     * Start animation loop
     */
    startAnimationLoop(callback, fps = 60) {
        const interval = 1000 / fps;
        let lastTime = 0;

        const animate = (currentTime) => {
            if (currentTime - lastTime >= interval) {
                callback(currentTime);
                lastTime = currentTime;
            }
            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);
        this.animations.add(animationId);

        return animationId;
    }

    /**
     * Stop animation loop
     */
    stopAnimationLoop(animationId) {
        if (this.animations.has(animationId)) {
            cancelAnimationFrame(animationId);
            this.animations.delete(animationId);
        }
    }

    /**
     * Stop all animations
     */
    stopAllAnimations() {
        this.animations.forEach(id => cancelAnimationFrame(id));
        this.animations.clear();
    }

    /**
     * Get canvas center coordinates
     */
    getCenter() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }

    /**
     * Check if point is inside rectangle
     */
    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return x >= rectX && x <= rectX + rectWidth &&
               y >= rectY && y <= rectY + rectHeight;
    }

    /**
     * Check if point is inside circle
     */
    isPointInCircle(x, y, circleX, circleY, radius) {
        const dx = x - circleX;
        const dy = y - circleY;
        return dx * dx + dy * dy <= radius * radius;
    }

    /**
     * Create particle system
     */
    createParticles(count, options = {}) {
        const particles = [];

        for (let i = 0; i < count; i++) {
            particles.push({
                x: options.x || this.width / 2,
                y: options.y || this.height / 2,
                vx: (Math.random() - 0.5) * (options.speed || 5),
                vy: (Math.random() - 0.5) * (options.speed || 5),
                life: options.life || 60,
                maxLife: options.life || 60,
                color: options.color || '#fff',
                size: options.size || 2,
                ...options.particleOptions
            });
        }

        return particles;
    }

    /**
     * Update particles
     */
    updateParticles(particles) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];

            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;

            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    /**
     * Draw particles
     */
    drawParticles(particles) {
        particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            this.drawCircle(particle.x, particle.y, particle.size, particle.color, true);
        });
        this.ctx.globalAlpha = 1;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopAllAnimations();
        this.sprites.clear();
        window.removeEventListener('resize', () => this.resize());
        console.log(`🗑️ Canvas renderer for ${this.canvasId} destroyed`);
    }
}

// Grid-based game utilities
class GridRenderer extends CanvasRenderer {
    constructor(canvasId, gridWidth, gridHeight, options = {}) {
        super(canvasId, options);

        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.cellWidth = 0;
        this.cellHeight = 0;

        this.grid = [];
        this.initGrid();
    }

    /**
     * Initialize grid
     */
    initGrid() {
        this.cellWidth = this.width / this.gridWidth;
        this.cellHeight = this.height / this.gridHeight;

        this.grid = Array(this.gridHeight).fill(null).map(() =>
            Array(this.gridWidth).fill(null)
        );
    }

    /**
     * Resize grid
     */
    resize() {
        super.resize();
        this.cellWidth = this.width / this.gridWidth;
        this.cellHeight = this.height / this.gridHeight;
    }

    /**
     * Set grid cell value
     */
    setCell(x, y, value) {
        if (this.isValidCell(x, y)) {
            this.grid[y][x] = value;
        }
    }

    /**
     * Get grid cell value
     */
    getCell(x, y) {
        if (this.isValidCell(x, y)) {
            return this.grid[y][x];
        }
        return null;
    }

    /**
     * Check if cell coordinates are valid
     */
    isValidCell(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    /**
     * Convert screen coordinates to grid coordinates
     */
    screenToGrid(screenX, screenY) {
        const canvasCoords = this.screenToCanvas(screenX, screenY);
        return {
            x: Math.floor(canvasCoords.x / this.cellWidth),
            y: Math.floor(canvasCoords.y / this.cellHeight)
        };
    }

    /**
     * Convert grid coordinates to canvas coordinates
     */
    gridToCanvas(gridX, gridY) {
        return {
            x: gridX * this.cellWidth,
            y: gridY * this.cellHeight,
            width: this.cellWidth,
            height: this.cellHeight
        };
    }

    /**
     * Draw grid cell
     */
    drawCell(x, y, color = '#fff', filled = true) {
        const coords = this.gridToCanvas(x, y);
        this.drawRect(coords.x, coords.y, coords.width, coords.height, color, filled);
    }

    /**
     * Draw entire grid
     */
    drawGrid(color = '#333') {
        // Draw cell borders
        super.drawGrid(this.cellWidth, color);

        // Draw cell contents
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.drawCellContent(x, y);
            }
        }
    }

    /**
     * Draw cell content (override in subclass)
     */
    drawCellContent(x, y) {
        // Override in subclass to draw specific cell content
    }

    /**
     * Clear grid
     */
    clearGrid() {
        this.grid = Array(this.gridHeight).fill(null).map(() =>
            Array(this.gridWidth).fill(null)
        );
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CanvasRenderer, GridRenderer };
}