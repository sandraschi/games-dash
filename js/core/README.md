# Game Development Utilities

**Consolidated utilities for building games in the Games Collection**

This directory contains shared utilities that eliminate code duplication and provide consistent functionality across all games.

## 📁 Structure

```
js/core/
├── game-base.js      # Base game class with common functionality
├── canvas-renderer.js # Canvas and grid rendering utilities
├── card-utils.js     # Card game specific utilities
├── sound-manager.js  # Audio management system
├── game-utils.js     # Consolidated exports and additional utilities
└── README.md         # This file
```

## 🚀 Quick Start

### Using ES6 Modules (Recommended)

```javascript
// Import specific utilities
import { BaseGame, CanvasRenderer, SoundManager } from './js/core/game-utils.js';

// Create a game instance
class MyGame extends BaseGame {
    constructor() {
        super('MyGame', {
            enableSound: true,
            enableLocalStorage: true
        });

        // Game-specific initialization
        this.canvas = new CanvasRenderer('gameCanvas');
        this.soundManager = new SoundManager();
    }

    // Override lifecycle methods
    start() {
        super.start();
        // Game-specific start logic
    }

    updateUI() {
        super.updateUI();
        // Custom UI updates
    }
}
```

### Using Global Objects (Fallback)

```javascript
// Available globally if modules aren't supported
const { BaseGame, CanvasRenderer, SoundManager } = window.GameUtils;

// Use as before
```

## 🎮 BaseGame Class

Provides common game functionality that all games can inherit from.

### Features
- **Game State Management**: menu, playing, paused, gameOver states
- **Local Storage**: Automatic save/load of game progress
- **Statistics Tracking**: Games played, high scores, play time
- **Input Handling**: Keyboard and mouse event management
- **Sound Integration**: Built-in sound effect support
- **Theme Support**: Dynamic theme switching
- **Time Tracking**: Elapsed time with pause compensation

### Example Usage

```javascript
class ChessGame extends BaseGame {
    constructor() {
        super('ChessGame', {
            initialLives: 1,
            enableSound: true,
            enableStats: true
        });

        this.board = this.createBoard();
    }

    start() {
        super.start(); // Call parent start
        this.resetBoard();
        this.updateUI();
    }

    updateScore(points) {
        super.updateScore(points); // Updates score and UI
        this.checkWinCondition();
    }

    saveGameState() {
        super.saveGameState(); // Saves common data
        // Add game-specific saves
        localStorage.setItem('chess_board', JSON.stringify(this.board));
    }
}
```

## 🎨 Canvas & Grid Rendering

### CanvasRenderer

General-purpose canvas rendering with device adaptation.

```javascript
const canvas = new CanvasRenderer('gameCanvas', {
    autoResize: true,
    deviceAdapt: true,
    maxWidth: 800,
    maxHeight: 600
});

// Drawing methods
canvas.drawRect(100, 100, 50, 50, '#ff0000', true);
canvas.drawCircle(200, 200, 25, '#00ff00', false);
canvas.drawText('Hello World', 150, 150, {
    color: '#ffffff',
    font: 'bold 24px Arial',
    align: 'center'
});

// Animation
canvas.startAnimationLoop((time) => {
    canvas.clear();
    // Draw frame
}, 60); // 60 FPS
```

### GridRenderer

Specialized for grid-based games like Tetris, Sudoku, etc.

```javascript
const grid = new GridRenderer('gridCanvas', 10, 20, {
    autoResize: true
});

// Set grid cells
grid.setCell(5, 10, { color: '#ff0000', type: 'block' });

// Draw entire grid
grid.drawGrid('#333');

// Convert coordinates
const gridPos = grid.screenToGrid(mouseX, mouseY);
const canvasPos = grid.gridToCanvas(5, 10);
```

## 🃏 Card Game Utilities

Complete card game framework with rendering and drag-and-drop.

```javascript
// Create deck
const deck = new Deck({ includeJokers: false });
deck.shuffle();

// Create renderer
const cardRenderer = new CardRenderer(canvas);

// Draw cards
deck.getAllCards().forEach((card, index) => {
    cardRenderer.drawCard(card, 50 + (index % 13) * 80, 100 + Math.floor(index / 13) * 120);
});

// Drag and drop
const dragDrop = new DragDropManager(canvas, {
    canDropCard: (card) => {
        // Custom drop validation
        return isValidDrop(card, dropTarget);
    },
    onCardDropped: (card) => {
        // Handle successful drop
        moveCardToPile(card, dropTarget);
    }
});
```

## 🔊 Sound Management

Comprehensive audio system with Web Audio API and fallbacks.

```javascript
const soundManager = new SoundManager({
    enableSound: true,
    masterVolume: 0.8,
    sfxVolume: 1.0,
    musicVolume: 0.6
});

// Load sounds
await soundManager.loadSound('move', '/sounds/move.wav');
await soundManager.loadMusic('background', '/music/game.mp3');

// Play effects
soundManager.playSound('move', { volume: 0.7, rate: 1.2 });

// Play music
soundManager.playMusic('background', { fadeIn: 2.0 });

// Generate procedural sounds
const clickSound = soundManager.createProceduralSound({
    frequency: 800,
    duration: 0.1,
    type: 'square'
});
clickSound(); // Play the sound
```

## 🛠️ Utility Functions

### MathUtils

```javascript
import { MathUtils } from './game-utils.js';

const clamped = MathUtils.clamp(value, 0, 100);
const random = MathUtils.randomInt(1, 6);
const distance = MathUtils.distance(x1, y1, x2, y2);
```

### ArrayUtils

```javascript
import { ArrayUtils } from './game-utils.js';

const shuffled = ArrayUtils.shuffle(myArray);
ArrayUtils.remove(myArray, item);
const isEmpty = ArrayUtils.isEmpty(myArray);
```

### ColorUtils

```javascript
import { ColorUtils } from './game-utils.js';

const hex = ColorUtils.rgbToHex(255, 0, 0); // "#ff0000"
const rgb = ColorUtils.hexToRgb('#ff0000'); // {r:255, g:0, b:0}
const contrast = ColorUtils.getContrastColor('#ffffff'); // "#000000"
```

### AnimationUtils

```javascript
import { AnimationUtils } from './game-utils.js';

// Animate a value over time
AnimationUtils.animate(0, 100, 1000, 'easeOut', (value) => {
    element.style.width = value + 'px';
});

// Use easing functions
const eased = AnimationUtils.easeInOut(0.5); // 0.5
```

## 🎯 Best Practices

### 1. Extend BaseGame

```javascript
class MyGame extends BaseGame {
    constructor() {
        super('MyGame', {
            // Configure options
            enableSound: true,
            enableStats: true,
            initialLives: 3
        });
    }

    // Override lifecycle methods as needed
    start() {
        super.start(); // Always call parent
        // Custom logic
    }
}
```

### 2. Use CanvasRenderer for Graphics

```javascript
// Initialize once
this.canvas = new CanvasRenderer('gameCanvas', {
    autoResize: true,
    deviceAdapt: true
});

// Use in game loop
this.canvas.clear();
this.canvas.drawRect(x, y, w, h, color);
// ... more drawing
```

### 3. Handle Errors Gracefully

```javascript
try {
    // Game logic
    this.makeMove(move);
} catch (error) {
    // Error will be automatically handled by global error handler
    // But you can add game-specific recovery
    this.attemptRecovery(error);
}
```

### 4. Save Game State Regularly

```javascript
// BaseGame handles common state automatically
// Add game-specific state in saveGameState()
saveGameState() {
    super.saveGameState(); // Saves common data
    // Add custom data
    localStorage.setItem('myGame_board', JSON.stringify(this.board));
}
```

### 5. Use Sound Effects Consistently

```javascript
// Load sounds once
await this.soundManager.loadSound('move', '/sounds/move.wav');

// Use throughout game
this.soundManager.playSound('move');
// Or use predefined effects
SoundEffects.click(this.soundManager);
```

## 🔧 Integration with Existing Games

### Updating Existing Games

1. **Add global error handler** (already done via script)
2. **Extend BaseGame** instead of custom state management
3. **Use CanvasRenderer** instead of direct canvas calls
4. **Use SoundManager** instead of inline audio
5. **Use utility functions** instead of custom implementations

### Example Migration

**Before:**
```javascript
// Old way - lots of duplication
let score = 0;
let level = 1;
let gameRunning = false;

function saveGame() {
    localStorage.setItem('score', score);
    localStorage.setItem('level', level);
}

function loadGame() {
    score = parseInt(localStorage.getItem('score') || '0');
    level = parseInt(localStorage.getItem('level') || '1');
}
```

**After:**
```javascript
// New way - consolidated
class MyGame extends BaseGame {
    constructor() {
        super('MyGame', { enableLocalStorage: true });
    }

    // State automatically saved/loaded
    // Statistics automatically tracked
    // UI automatically updated
}
```

## 📊 Performance Considerations

- **Canvas rendering** is optimized for 60 FPS
- **Sound pooling** prevents audio glitches
- **State saving** uses debouncing to avoid excessive writes
- **Memory management** automatically cleans up resources

## 🐛 Error Handling

All utilities include comprehensive error handling:

- **CanvasRenderer**: Graceful fallbacks for missing canvases
- **SoundManager**: Automatic fallback to HTML5 audio
- **BaseGame**: State preservation on crashes
- **Global Error Handler**: Catches unhandled errors

Errors are automatically reported to the server for monitoring and debugging.

## 🎨 Themes & Styling

Games automatically support theme switching:

```javascript
// Switch theme
game.setTheme('dark');

// Available themes
console.log(game.themes); // { default, dark, light }
```

## 📱 Mobile Support

All utilities are mobile-optimized:

- **Touch events** automatically handled
- **Canvas scaling** for different screen sizes
- **Responsive layouts** with device adaptation
- **Performance optimization** for mobile GPUs

## 🔄 Migration Guide

### Phase 1: Quick Wins
1. Add global error handler (✅ Done)
2. Use utility functions for common operations
3. Switch to SoundManager for audio

### Phase 2: Refactoring
1. Extend BaseGame instead of custom game classes
2. Use CanvasRenderer for all drawing operations
3. Implement proper state management

### Phase 3: Advanced Features
1. Add comprehensive statistics tracking
2. Implement theme support
3. Add multiplayer integration

This utilities library eliminates code duplication, improves maintainability, and provides a solid foundation for all games in the collection.
