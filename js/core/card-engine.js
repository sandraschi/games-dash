// Universal Card Game Engine
// **Timestamp**: 2025-12-03

class Card {
    constructor(suit, rank) {
        this.suit = suit; // hearts, diamonds, clubs, spades
        this.rank = rank; // A, 2-10, J, Q, K
        this.faceUp = false;
    }
    
    get symbol() {
        const symbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
        return symbols[this.suit];
    }
    
    get color() {
        return ['hearts', 'diamonds'].includes(this.suit) ? 'red' : 'black';
    }
    
    get value() {
        if (this.rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(this.rank)) return 10;
        return parseInt(this.rank);
    }
    
    toString() {
        return `${this.rank}${this.symbol}`;
    }
}

class Deck {
    constructor(numDecks = 1) {
        this.cards = [];
        this.discardPile = [];
        this.initialize(numDecks);
    }
    
    initialize(numDecks) {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (let d = 0; d < numDecks; d++) {
            for (const suit of suits) {
                for (const rank of ranks) {
                    this.cards.push(new Card(suit, rank));
                }
            }
        }
    }
    
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    draw(count = 1) {
        if (count === 1) return this.cards.pop();
        return this.cards.splice(-count, count);
    }
    
    remaining() {
        return this.cards.length;
    }
}

class Hand {
    constructor(playerId) {
        this.playerId = playerId;
        this.cards = [];
    }
    
    add(card) {
        this.cards.push(card);
    }
    
    remove(card) {
        const index = this.cards.indexOf(card);
        if (index > -1) return this.cards.splice(index, 1)[0];
    }
    
    sort() {
        this.cards.sort((a, b) => {
            if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
            const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
            return ranks.indexOf(a.rank) - ranks.indexOf(b.rank);
        });
    }
    
    get count() {
        return this.cards.length;
    }
}

window.Card = Card;
window.Deck = Deck;
window.Hand = Hand;

