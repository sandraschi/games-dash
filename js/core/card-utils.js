/**
 * Card Game Utilities
 * **Timestamp**: 2026-01-21
 *
 * Shared utilities for card games:
 * - Deck creation and shuffling
 * - Card rendering and positioning
 * - Game logic helpers
 * - Drag and drop support
 */

class Card {
    constructor(suit, rank, options = {}) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = options.faceUp ?? false;
        this.selected = false;
        this.dragging = false;
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 80;
        this.height = options.height || 112;

        // Card values for sorting/comparison
        this.rankValue = this.getRankValue();
        this.suitValue = this.getSuitValue();
    }

    /**
     * Get numerical value of rank
     */
    getRankValue() {
        const rankValues = {
            'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13
        };
        return rankValues[this.rank] || 0;
    }

    /**
     * Get numerical value of suit
     */
    getSuitValue() {
        const suitValues = {
            'hearts': 1,
            'diamonds': 2,
            'clubs': 3,
            'spades': 4
        };
        return suitValues[this.suit] || 0;
    }

    /**
     * Get card color
     */
    getColor() {
        return (this.suit === 'hearts' || this.suit === 'diamonds') ? 'red' : 'black';
    }

    /**
     * Check if card can be placed on another card
     */
    canPlaceOn(otherCard, rules = {}) {
        const { alternateColors = true, descending = true } = rules;

        if (alternateColors && this.getColor() === otherCard.getColor()) {
            return false;
        }

        if (descending && this.rankValue !== otherCard.rankValue - 1) {
            return false;
        }

        return true;
    }

    /**
     * Flip card
     */
    flip() {
        this.faceUp = !this.faceUp;
    }

    /**
     * Select/deselect card
     */
    select(selected = true) {
        this.selected = selected;
    }

    /**
     * Check if point is inside card bounds
     */
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    /**
     * Clone card
     */
    clone() {
        return new Card(this.suit, this.rank, {
            faceUp: this.faceUp,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        });
    }
}

class Deck {
    constructor(options = {}) {
        this.cards = [];
        this.shuffleCount = options.shuffleCount || 1000;
        this.includeJokers = options.includeJokers ?? false;
        this.customCards = options.customCards || null;

        this.createDeck();
        if (options.autoShuffle) {
            this.shuffle();
        }
    }

    /**
     * Create standard 52-card deck
     */
    createDeck() {
        this.cards = [];

        if (this.customCards) {
            this.cards = this.customCards.map(cardData =>
                new Card(cardData.suit, cardData.rank, cardData.options)
            );
            return;
        }

        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        suits.forEach(suit => {
            ranks.forEach(rank => {
                this.cards.push(new Card(suit, rank));
            });
        });

        if (this.includeJokers) {
            this.cards.push(new Card('joker', 'red'));
            this.cards.push(new Card('joker', 'black'));
        }
    }

    /**
     * Shuffle deck using Fisher-Yates algorithm
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    /**
     * Draw card from top of deck
     */
    draw() {
        return this.cards.pop();
    }

    /**
     * Draw multiple cards
     */
    drawMultiple(count) {
        const cards = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            cards.push(this.draw());
        }
        return cards;
    }

    /**
     * Add card to bottom of deck
     */
    addCard(card) {
        this.cards.unshift(card);
        return this;
    }

    /**
     * Add multiple cards to bottom
     */
    addCards(cards) {
        this.cards.unshift(...cards);
        return this;
    }

    /**
     * Remove specific card
     */
    removeCard(card) {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            this.cards.splice(index, 1);
            return card;
        }
        return null;
    }

    /**
     * Get card at specific position
     */
    getCard(index) {
        return this.cards[index] || null;
    }

    /**
     * Get all cards
     */
    getAllCards() {
        return [...this.cards];
    }

    /**
     * Count cards in deck
     */
    count() {
        return this.cards.length;
    }

    /**
     * Check if deck is empty
     */
    isEmpty() {
        return this.cards.length === 0;
    }

    /**
     * Clear deck
     */
    clear() {
        this.cards = [];
        return this;
    }

    /**
     * Sort deck by rank and suit
     */
    sort() {
        this.cards.sort((a, b) => {
            if (a.suitValue !== b.suitValue) {
                return a.suitValue - b.suitValue;
            }
            return a.rankValue - b.rankValue;
        });
        return this;
    }
}

class CardRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            cardWidth: options.cardWidth || 80,
            cardHeight: options.cardHeight || 112,
            cornerRadius: options.cornerRadius || 8,
            showShadows: options.showShadows ?? true,
            cardBackColor: options.cardBackColor || '#2E7D32',
            cardFrontColor: options.cardFrontColor || '#fff',
            ...options
        };

        this.cardImages = new Map();
        this.loadCardImages();
    }

    /**
     * Load card face images (if available)
     */
    async loadCardImages() {
        // This would load actual card images if they exist
        // For now, we'll use text-based rendering
        return Promise.resolve();
    }

    /**
     * Draw card
     */
    drawCard(card, x, y, options = {}) {
        const { selected = false, highlight = false } = options;

        card.x = x;
        card.y = y;
        card.width = this.options.cardWidth;
        card.height = this.options.cardHeight;

        this.ctx.save();

        // Shadow effect
        if (this.options.showShadows && !selected) {
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
        }

        // Card background
        const bgColor = card.faceUp ? this.options.cardFrontColor : this.options.cardBackColor;
        this.drawRoundedRect(x, y, card.width, card.height, this.options.cornerRadius, bgColor);

        // Selection highlight
        if (selected) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.drawRoundedRect(x - 2, y - 2, card.width + 4, card.height + 4, this.options.cornerRadius + 2, null, false);
        }

        // Card content
        if (card.faceUp) {
            this.drawCardFace(card, x, y);
        } else {
            this.drawCardBack(x, y);
        }

        this.ctx.restore();
    }

    /**
     * Draw rounded rectangle
     */
    drawRoundedRect(x, y, width, height, radius, fillColor = null, stroke = true) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();

        if (fillColor) {
            this.ctx.fillStyle = fillColor;
            this.ctx.fill();
        }

        if (stroke) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    /**
     * Draw card face
     */
    drawCardFace(card, x, y) {
        const centerX = x + card.width / 2;
        const centerY = y + card.height / 2;

        // Card rank and suit
        this.ctx.fillStyle = card.getColor();
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';

        // Top left
        this.ctx.fillText(card.rank, x + 8, y + 16);
        this.drawSuitSymbol(card.suit, x + 8, y + 32);

        // Bottom right (upside down)
        this.ctx.save();
        this.ctx.translate(x + card.width - 8, y + card.height - 16);
        this.ctx.rotate(Math.PI);
        this.ctx.fillText(card.rank, 0, 0);
        this.drawSuitSymbol(card.suit, 0, 16);
        this.ctx.restore();

        // Center symbol for face cards
        if (['J', 'Q', 'K'].includes(card.rank)) {
            this.drawFaceCardSymbol(card, centerX, centerY);
        } else if (card.rank !== 'A') {
            // Draw pip pattern for number cards
            this.drawPipPattern(card, x, y);
        }
    }

    /**
     * Draw suit symbol
     */
    drawSuitSymbol(suit, x, y) {
        const symbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };

        this.ctx.font = '12px Arial';
        this.ctx.fillText(symbols[suit] || suit, x, y);
    }

    /**
     * Draw face card symbol
     */
    drawFaceCardSymbol(card, centerX, centerY) {
        const symbols = {
            'J': '👑',
            'Q': '👸',
            'K': '🤴'
        };

        this.ctx.font = '32px Arial';
        this.ctx.fillText(symbols[card.rank] || card.rank, centerX, centerY);
    }

    /**
     * Draw pip pattern for number cards
     */
    drawPipPattern(card, x, y) {
        const pipCount = parseInt(card.rank);
        const symbol = card.suit === 'hearts' ? '♥' :
                      card.suit === 'diamonds' ? '♦' :
                      card.suit === 'clubs' ? '♣' : '♠';

        this.ctx.font = '16px Arial';

        // Simple pip layout
        const positions = this.getPipPositions(pipCount);
        positions.forEach(pos => {
            this.ctx.fillText(symbol, x + pos.x, y + pos.y);
        });
    }

    /**
     * Get pip positions for number cards
     */
    getPipPositions(count) {
        const positions = [];
        const width = this.options.cardWidth;
        const height = this.options.cardHeight;

        switch (count) {
            case 1:
                positions.push({ x: width / 2, y: height / 2 });
                break;
            case 2:
                positions.push({ x: width / 2, y: height * 0.3 });
                positions.push({ x: width / 2, y: height * 0.7 });
                break;
            case 3:
                positions.push({ x: width / 2, y: height * 0.25 });
                positions.push({ x: width / 2, y: height / 2 });
                positions.push({ x: width / 2, y: height * 0.75 });
                break;
            // Add more patterns for 4-10 as needed
            default:
                positions.push({ x: width / 2, y: height / 2 });
        }

        return positions;
    }

    /**
     * Draw card back
     */
    drawCardBack(x, y) {
        // Simple pattern for card back
        this.ctx.fillStyle = '#1B5E20';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 7; j++) {
                if ((i + j) % 2 === 0) {
                    this.ctx.fillRect(x + i * 8, y + j * 16, 8, 16);
                }
            }
        }
    }

    /**
     * Draw card stack
     */
    drawCardStack(cards, x, y, options = {}) {
        const { offsetX = 0, offsetY = 2, maxVisible = 3 } = options;

        cards.slice(0, maxVisible).forEach((card, index) => {
            const cardX = x + (offsetX * index);
            const cardY = y + (offsetY * index);
            this.drawCard(card, cardX, cardY, { selected: card.selected });
        });

        // Show count if there are more cards
        if (cards.length > maxVisible) {
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`+${cards.length - maxVisible}`, x + 40, y + 140);
        }
    }
}

class DragDropManager {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            dragThreshold: options.dragThreshold || 5,
            snapToGrid: options.snapToGrid ?? false,
            gridSize: options.gridSize || 20,
            ...options
        };

        this.draggedCard = null;
        this.dragOffset = { x: 0, y: 0 };
        this.originalPosition = { x: 0, y: 0 };
        this.isDragging = false;

        this.setupEventListeners();
    }

    /**
     * Setup event listeners for drag and drop
     */
    setupEventListeners() {
        let startX, startY;

        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.draggedCard || !this.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            this.draggedCard.x = mouseX - this.dragOffset.x;
            this.draggedCard.y = mouseY - this.dragOffset.y;

            if (this.options.snapToGrid) {
                this.draggedCard.x = Math.round(this.draggedCard.x / this.options.gridSize) * this.options.gridSize;
                this.draggedCard.y = Math.round(this.draggedCard.y / this.options.gridSize) * this.options.gridSize;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            if (this.draggedCard && this.isDragging) {
                this.dropCard();
            }
        });
    }

    /**
     * Start dragging a card
     */
    startDrag(card, mouseX, mouseY) {
        this.draggedCard = card;
        this.originalPosition = { x: card.x, y: card.y };
        this.dragOffset = {
            x: mouseX - card.x,
            y: mouseY - card.y
        };
        this.isDragging = false; // Will be set to true after threshold
        card.dragging = true;
    }

    /**
     * Update drag state (call in animation loop)
     */
    updateDrag(mouseX, mouseY) {
        if (!this.draggedCard) return;

        if (!this.isDragging) {
            // Check if we've moved enough to start dragging
            const deltaX = Math.abs(mouseX - (this.originalPosition.x + this.dragOffset.x));
            const deltaY = Math.abs(mouseY - (this.originalPosition.y + this.dragOffset.y));

            if (deltaX > this.options.dragThreshold || deltaY > this.options.dragThreshold) {
                this.isDragging = true;
            }
        }
    }

    /**
     * Drop the dragged card
     */
    dropCard() {
        if (!this.draggedCard) return;

        // Check if card can be dropped at current position
        const canDrop = this.canDropCard(this.draggedCard);

        if (canDrop) {
            // Successful drop
            this.draggedCard.dragging = false;
            this.draggedCard.selected = false;
            this.onCardDropped(this.draggedCard);
        } else {
            // Return to original position
            this.draggedCard.x = this.originalPosition.x;
            this.draggedCard.y = this.originalPosition.y;
            this.draggedCard.dragging = false;
            this.onCardDropFailed(this.draggedCard);
        }

        this.draggedCard = null;
        this.isDragging = false;
    }

    /**
     * Check if card can be dropped at current position
     */
    canDropCard(card) {
        // Override in subclass or provide callback
        return this.options.canDropCard ? this.options.canDropCard(card) : true;
    }

    /**
     * Handle successful card drop
     */
    onCardDropped(card) {
        if (this.options.onCardDropped) {
            this.options.onCardDropped(card);
        }
    }

    /**
     * Handle failed card drop
     */
    onCardDropFailed(card) {
        if (this.options.onCardDropFailed) {
            this.options.onCardDropFailed(card);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Card, Deck, CardRenderer, DragDropManager };
}