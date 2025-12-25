# Phase 8: Card Games with AI

**Target**: 2-3 weeks  
**Priority**: HIGH  
**Date**: 2025-12-03

---

## Card Games Roadmap

From simple kids' games to complex poker variants, all with AI opponents and multiplayer support.

### Tier 1: Simple Card Games (Week 1)
1. **Old Maid** - Classic matching game
2. **Go Fish** - Ask for cards, make pairs
3. **Crazy Eights** - Uno-style game
4. **War** - Simple comparison game

### Tier 2: Strategy Card Games (Week 2)
5. **Rummy** - Meld and discard
6. **Gin Rummy** - Popular variant
7. **Hearts** - Trick-taking game
8. **Spades** - Partnership trick-taking

### Tier 3: Casino Games (Week 3)
9. **Blackjack** (21) - Beat the dealer
10. **Poker - Texas Hold'em** - Most popular poker variant
11. **Poker - 5-Card Draw** - Classic poker
12. **Poker - Omaha** - 4 hole cards variant

### Bonus: Advanced Games
13. **Bridge** - Complex partnership game
14. **Skat** - German trick-taking
15. **Pinochle** - Melding and tricks

---

## Card Engine Architecture

### Base Card System

```javascript
// card.js
class Card {
  constructor(suit, rank) {
    this.suit = suit; // 'hearts', 'diamonds', 'clubs', 'spades'
    this.rank = rank; // 'A', '2'-'10', 'J', 'Q', 'K'
    this.faceUp = false;
    this.selectable = true;
  }
  
  get value() {
    if (this.rank === 'A') return 11; // or 1 in Blackjack
    if (['J', 'Q', 'K'].includes(this.rank)) return 10;
    return parseInt(this.rank);
  }
  
  get symbol() {
    const symbols = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠'
    };
    return symbols[this.suit];
  }
  
  get color() {
    return ['hearts', 'diamonds'].includes(this.suit) ? 'red' : 'black';
  }
  
  toString() {
    return `${this.rank}${this.symbol}`;
  }
  
  flip() {
    this.faceUp = !this.faceUp;
  }
}

class Deck {
  constructor(numDecks = 1) {
    this.cards = [];
    this.discardPile = [];
    this.initializeDeck(numDecks);
  }
  
  initializeDeck(numDecks) {
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
    if (count === 1) {
      return this.cards.pop();
    }
    return this.cards.splice(-count, count);
  }
  
  drawFromTop() {
    return this.cards.shift();
  }
  
  addToDiscard(card) {
    this.discardPile.push(card);
  }
  
  getTopDiscard() {
    return this.discardPile[this.discardPile.length - 1];
  }
  
  remaining() {
    return this.cards.length;
  }
  
  reshuffle() {
    this.cards = [...this.cards, ...this.discardPile];
    this.discardPile = [];
    this.shuffle();
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
    if (index > -1) {
      return this.cards.splice(index, 1)[0];
    }
  }
  
  removeAt(index) {
    return this.cards.splice(index, 1)[0];
  }
  
  sort() {
    this.cards.sort((a, b) => {
      if (a.suit !== b.suit) {
        return a.suit.localeCompare(b.suit);
      }
      const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });
  }
  
  get count() {
    return this.cards.length;
  }
  
  isEmpty() {
    return this.cards.length === 0;
  }
  
  contains(suit, rank) {
    return this.cards.some(card => card.suit === suit && card.rank === rank);
  }
  
  hasRank(rank) {
    return this.cards.some(card => card.rank === rank);
  }
  
  hasSuit(suit) {
    return this.cards.some(card => card.suit === suit);
  }
}
```

---

## Game 1: Old Maid

### Rules
- 3-6 players
- Remove one Queen (Old Maid)
- Deal all cards
- Players discard pairs
- Draw cards from other players
- Last player with Old Maid loses

### Implementation

```javascript
// old-maid.js
class OldMaidGame extends CardGame {
  constructor(numPlayers) {
    super();
    this.numPlayers = numPlayers;
    this.deck = new Deck();
    this.hands = [];
    this.oldMaid = null;
    this.currentPlayer = 0;
    this.loser = null;
  }
  
  setup() {
    // Remove one Queen (the Old Maid)
    const queenIndex = this.deck.cards.findIndex(c => c.rank === 'Q' && c.suit === 'spades');
    this.oldMaid = this.deck.cards[queenIndex];
    this.deck.cards.splice(queenIndex, 1);
    
    this.deck.shuffle();
    
    // Deal all cards
    for (let i = 0; i < this.numPlayers; i++) {
      this.hands[i] = new Hand(i);
    }
    
    let cardIndex = 0;
    while (this.deck.remaining() > 0) {
      const card = this.deck.draw();
      this.hands[cardIndex % this.numPlayers].add(card);
      cardIndex++;
    }
    
    // Each player discards pairs
    this.hands.forEach(hand => this.discardPairs(hand));
  }
  
  discardPairs(hand) {
    const ranks = {};
    hand.cards.forEach((card, index) => {
      if (!ranks[card.rank]) ranks[card.rank] = [];
      ranks[card.rank].push(index);
    });
    
    // Remove pairs
    for (const rank in ranks) {
      while (ranks[rank].length >= 2) {
        const idx1 = ranks[rank].pop();
        const idx2 = ranks[rank].pop();
        hand.removeAt(Math.max(idx1, idx2));
        hand.removeAt(Math.min(idx1, idx2));
      }
    }
  }
  
  drawCard(fromPlayer, cardIndex) {
    const fromHand = this.hands[fromPlayer];
    const card = fromHand.removeAt(cardIndex);
    
    const currentHand = this.hands[this.currentPlayer];
    currentHand.add(card);
    
    // Check for new pairs
    this.discardPairs(currentHand);
    
    // Check if fromPlayer is out
    if (fromHand.isEmpty() && !this.isGameOver()) {
      // Remove from play
    }
    
    // Next player
    this.nextPlayer();
    
    if (this.isGameOver()) {
      this.findLoser();
    }
  }
  
  nextPlayer() {
    do {
      this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers;
    } while (this.hands[this.currentPlayer].isEmpty());
  }
  
  isGameOver() {
    const playersWithCards = this.hands.filter(h => !h.isEmpty()).length;
    return playersWithCards <= 1;
  }
  
  findLoser() {
    for (let i = 0; i < this.hands.length; i++) {
      if (!this.hands[i].isEmpty()) {
        this.loser = i;
        break;
      }
    }
  }
}

// AI for Old Maid
class OldMaidAI {
  chooseCard(hand) {
    // Simple strategy: random card
    return Math.floor(Math.random() * hand.count);
  }
}
```

---

## Game 10: Texas Hold'em Poker (Most Complex)

### Rules
- 2-10 players
- Two hole cards per player
- Five community cards (flop, turn, river)
- Betting rounds: pre-flop, flop, turn, river
- Best 5-card hand wins

### Implementation

```javascript
// poker.js
class TexasHoldemGame extends CardGame {
  constructor(players) {
    super();
    this.players = players;
    this.deck = new Deck();
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.dealerButton = 0;
    this.currentPlayer = 0;
    this.bettingRound = 'preflop'; // preflop, flop, turn, river
    this.hands = [];
    this.playerBets = {};
    this.playerStacks = {};
    this.foldedPlayers = [];
  }
  
  setup(startingStack = 1000) {
    this.deck.shuffle();
    
    // Initialize players
    this.players.forEach(player => {
      this.hands[player.id] = new Hand(player.id);
      this.playerStacks[player.id] = startingStack;
      this.playerBets[player.id] = 0;
    });
    
    // Post blinds
    this.postBlinds();
    
    // Deal hole cards
    this.dealHoleCards();
  }
  
  postBlinds() {
    const smallBlindPos = (this.dealerButton + 1) % this.players.length;
    const bigBlindPos = (this.dealerButton + 2) % this.players.length;
    
    const smallBlind = 10;
    const bigBlind = 20;
    
    this.placeBet(this.players[smallBlindPos].id, smallBlind);
    this.placeBet(this.players[bigBlindPos].id, bigBlind);
    
    this.currentBet = bigBlind;
    this.currentPlayer = (bigBlindPos + 1) % this.players.length;
  }
  
  dealHoleCards() {
    for (let i = 0; i < 2; i++) {
      this.players.forEach(player => {
        const card = this.deck.draw();
        card.faceUp = false; // Hidden from others
        this.hands[player.id].add(card);
      });
    }
  }
  
  dealFlop() {
    this.deck.draw(); // Burn card
    for (let i = 0; i < 3; i++) {
      const card = this.deck.draw();
      card.faceUp = true;
      this.communityCards.push(card);
    }
    this.bettingRound = 'flop';
    this.currentBet = 0;
    this.resetBets();
  }
  
  dealTurn() {
    this.deck.draw(); // Burn card
    const card = this.deck.draw();
    card.faceUp = true;
    this.communityCards.push(card);
    this.bettingRound = 'turn';
    this.currentBet = 0;
    this.resetBets();
  }
  
  dealRiver() {
    this.deck.draw(); // Burn card
    const card = this.deck.draw();
    card.faceUp = true;
    this.communityCards.push(card);
    this.bettingRound = 'river';
    this.currentBet = 0;
    this.resetBets();
  }
  
  placeBet(playerId, amount) {
    const stack = this.playerStacks[playerId];
    const actualBet = Math.min(amount, stack);
    
    this.playerStacks[playerId] -= actualBet;
    this.playerBets[playerId] += actualBet;
    this.pot += actualBet;
    
    if (this.playerBets[playerId] > this.currentBet) {
      this.currentBet = this.playerBets[playerId];
    }
  }
  
  fold(playerId) {
    this.foldedPlayers.push(playerId);
  }
  
  call(playerId) {
    const toCall = this.currentBet - this.playerBets[playerId];
    this.placeBet(playerId, toCall);
  }
  
  raise(playerId, amount) {
    const toCall = this.currentBet - this.playerBets[playerId];
    this.placeBet(playerId, toCall + amount);
  }
  
  check(playerId) {
    // No action if current bet is met
  }
  
  allIn(playerId) {
    const stack = this.playerStacks[playerId];
    this.placeBet(playerId, stack);
  }
  
  resetBets() {
    this.players.forEach(player => {
      this.playerBets[player.id] = 0;
    });
  }
  
  evaluateHand(playerId) {
    const hand = this.hands[playerId];
    const allCards = [...hand.cards, ...this.communityCards];
    
    // Find best 5-card combination
    return this.findBestHand(allCards);
  }
  
  findBestHand(cards) {
    // Check for:
    // Royal Flush, Straight Flush, Four of a Kind, Full House,
    // Flush, Straight, Three of a Kind, Two Pair, Pair, High Card
    
    // Simplified version - full implementation would be more complex
    const ranksCount = {};
    cards.forEach(card => {
      ranksCount[card.rank] = (ranksCount[card.rank] || 0) + 1;
    });
    
    const counts = Object.values(ranksCount).sort((a, b) => b - a);
    
    if (counts[0] === 4) return { type: 'Four of a Kind', value: 8 };
    if (counts[0] === 3 && counts[1] === 2) return { type: 'Full House', value: 7 };
    if (counts[0] === 3) return { type: 'Three of a Kind', value: 4 };
    if (counts[0] === 2 && counts[1] === 2) return { type: 'Two Pair', value: 3 };
    if (counts[0] === 2) return { type: 'Pair', value: 2 };
    return { type: 'High Card', value: 1 };
  }
  
  determineWinner() {
    const activePlayers = this.players.filter(p => !this.foldedPlayers.includes(p.id));
    
    let bestHand = null;
    let winner = null;
    
    activePlayers.forEach(player => {
      const hand = this.evaluateHand(player.id);
      if (!bestHand || hand.value > bestHand.value) {
        bestHand = hand;
        winner = player.id;
      }
    });
    
    // Award pot to winner
    this.playerStacks[winner] += this.pot;
    
    return {
      winner,
      hand: bestHand,
      pot: this.pot
    };
  }
}

// Poker AI
class PokerAI {
  constructor(difficulty = 5) {
    this.difficulty = difficulty; // 1-10
    this.style = this.getStyle();
  }
  
  getStyle() {
    // Different AI personalities
    const styles = ['tight', 'loose', 'aggressive', 'passive', 'balanced'];
    return styles[Math.floor(Math.random() * styles.length)];
  }
  
  makeDecision(game, playerId) {
    const hand = game.hands[playerId];
    const stack = game.playerStacks[playerId];
    const currentBet = game.currentBet;
    const playerBet = game.playerBets[playerId];
    const toCall = currentBet - playerBet;
    
    // Evaluate hand strength (0-1)
    const handStrength = this.evaluateHandStrength(hand.cards, game.communityCards);
    
    // Calculate pot odds
    const potOdds = toCall / (game.pot + toCall);
    
    // Bluff factor (based on difficulty)
    const bluffChance = this.difficulty / 100;
    const isBluffing = Math.random() < bluffChance;
    
    // Decision tree
    if (handStrength < 0.3 && !isBluffing) {
      if (toCall === 0) return { action: 'check' };
      if (toCall < stack * 0.05) return { action: 'call' };
      return { action: 'fold' };
    }
    
    if (handStrength > 0.7 || isBluffing) {
      const raiseAmount = Math.floor(game.pot * (0.5 + Math.random() * 0.5));
      return { action: 'raise', amount: raiseAmount };
    }
    
    if (handStrength > potOdds) {
      return { action: 'call' };
    }
    
    if (toCall === 0) return { action: 'check' };
    return { action: 'fold' };
  }
  
  evaluateHandStrength(holeCards, communityCards) {
    // Simplified hand strength evaluation
    // Real implementation would use Monte Carlo simulation or lookup tables
    
    const allCards = [...holeCards, ...communityCards];
    
    // Check for pairs, high cards, etc.
    const ranks = {};
    allCards.forEach(card => {
      ranks[card.rank] = (ranks[card.rank] || 0) + 1;
    });
    
    const counts = Object.values(ranks);
    const hasPair = counts.includes(2);
    const hasTwoPair = counts.filter(c => c === 2).length === 2;
    const hasThree = counts.includes(3);
    const hasFour = counts.includes(4);
    
    if (hasFour) return 0.95;
    if (hasThree && hasPair) return 0.85;
    if (hasThree) return 0.70;
    if (hasTwoPair) return 0.60;
    if (hasPair) return 0.40;
    
    // High card strength
    const highCards = allCards.filter(c => ['A', 'K', 'Q', 'J'].includes(c.rank));
    return 0.2 + (highCards.length * 0.05);
  }
}
```

---

## Card Game Rendering

### HTML5 Canvas Rendering

```javascript
// card-renderer.js
class CardRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cardWidth = 80;
    this.cardHeight = 112;
    this.cardRadius = 8;
  }
  
  drawCard(card, x, y, faceUp = true) {
    const ctx = this.ctx;
    
    // Card background
    ctx.fillStyle = faceUp ? '#fff' : '#1a4d2e';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    this.roundRect(x, y, this.cardWidth, this.cardHeight, this.cardRadius);
    ctx.fill();
    ctx.stroke();
    
    if (faceUp) {
      // Rank and suit
      ctx.fillStyle = card.color === 'red' ? '#d32f2f' : '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Top left
      ctx.fillText(card.rank, x + 15, y + 20);
      ctx.font = '20px Arial';
      ctx.fillText(card.symbol, x + 15, y + 40);
      
      // Center symbol
      ctx.font = 'bold 40px Arial';
      ctx.fillText(card.symbol, x + this.cardWidth/2, y + this.cardHeight/2);
      
      // Bottom right (upside down)
      ctx.save();
      ctx.translate(x + this.cardWidth - 15, y + this.cardHeight - 20);
      ctx.rotate(Math.PI);
      ctx.font = 'bold 24px Arial';
      ctx.fillText(card.rank, 0, 0);
      ctx.font = '20px Arial';
      ctx.fillText(card.symbol, 0, 20);
      ctx.restore();
    } else {
      // Card back pattern
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(x + 5, y + 5, this.cardWidth - 10, this.cardHeight - 10);
      
      // Pattern
      ctx.strokeStyle = '#1b5e20';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 10 + i * 15, y + 5);
        ctx.lineTo(x + 10 + i * 15, y + this.cardHeight - 5);
        ctx.stroke();
      }
    }
  }
  
  drawHand(hand, x, y, spread = 20) {
    hand.cards.forEach((card, index) => {
      this.drawCard(card, x + index * spread, y, card.faceUp);
    });
  }
  
  drawDeck(x, y, count) {
    for (let i = 0; i < Math.min(count, 5); i++) {
      this.drawCard({ faceUp: false }, x + i * 2, y - i * 2, false);
    }
    
    // Count badge
    if (count > 0) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(x + this.cardWidth - 30, y + this.cardHeight - 25, 25, 20);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(count, x + this.cardWidth - 17.5, y + this.cardHeight - 12);
    }
  }
  
  roundRect(x, y, width, height, radius) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
```

---

## Multiplayer Card Games

All card games support:
1. **Local Multiplayer**: Pass-and-play on same device
2. **Online Multiplayer**: Play with friends via Firebase
3. **AI Opponents**: Fill empty slots with AI
4. **Spectator Mode**: Watch games in progress

```javascript
// multiplayer-card-game.js
class MultiplayerCardGame {
  constructor(gameType) {
    this.gameType = gameType;
    this.gameId = null;
    this.localGame = null;
    this.multiplayerManager = new MultiplayerManager();
  }
  
  async createLobby(maxPlayers, settings) {
    this.gameId = await this.multiplayerManager.createGame(this.gameType, {
      maxPlayers,
      ...settings
    });
    
    // Listen for players joining
    this.multiplayerManager.listenToGame(this.gameId, (game) => {
      this.updateLobby(game);
      
      if (game.status === 'starting') {
        this.startGame(game);
      }
    });
    
    return this.gameId;
  }
  
  async joinLobby(gameId) {
    await this.multiplayerManager.joinGame(gameId);
    this.gameId = gameId;
    
    this.multiplayerManager.listenToGame(gameId, (game) => {
      this.updateGame(game);
    });
  }
  
  startGame(game) {
    // Initialize local game instance
    this.localGame = new TexasHoldemGame(game.players);
    this.localGame.setup();
    
    // Host syncs initial state
    if (game.hostUid === authManager.getCurrentUser().uid) {
      this.syncGameState();
    }
  }
  
  async makeMove(action) {
    // Apply move locally
    this.localGame.processAction(action);
    
    // Sync to server
    await this.multiplayerManager.makeMove(this.gameId, action);
  }
  
  async syncGameState() {
    const state = this.localGame.getState();
    await this.multiplayerManager.updateGameState(this.gameId, state, this.getNextPlayer());
  }
}
```

---

## AI Difficulty Levels

Each card game has configurable AI:

| Level | Name | Description | Win Rate |
|-------|------|-------------|----------|
| 1 | Beginner | Random plays, no strategy | 10% |
| 2-3 | Novice | Basic strategy | 25% |
| 4-5 | Intermediate | Good strategy, occasional mistakes | 40% |
| 6-7 | Advanced | Strong strategy, bluffing | 55% |
| 8-9 | Expert | Near-optimal play | 70% |
| 10 | Master | Optimal play, perfect memory | 85% |

---

## Card Games Summary

**Total Implementation Time**: 2-3 weeks

**Week 1**: Simple games (Old Maid, Go Fish, Crazy Eights, War) + Card engine
**Week 2**: Strategy games (Rummy, Hearts, Spades) + Multiplayer integration
**Week 3**: Casino games (Blackjack, Poker variants) + Advanced AI

**Next**: Settings modals and customization system

