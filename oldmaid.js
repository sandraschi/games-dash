// Old Maid Card Game Implementation
// **Timestamp**: 2025-12-04

let numPlayers = 2;
let players = [];
let currentPlayer = 0;
let gameActive = false;
let waitingForDraw = false;

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠', '♥', '♦', '♣'];

function setPlayers(count) {
    numPlayers = count;
    [2, 3, 4].forEach(n => {
        const btn = document.getElementById(`btn-${n}`);
        if (btn) btn.classList.toggle('active', n === count);
    });
    newGame();
}

function newGame() {
    gameActive = true;
    currentPlayer = 0;
    waitingForDraw = false;
    
    // Create deck (remove one Queen to make the Old Maid)
    let deck = [];
    RANKS.forEach(rank => {
        SUITS.forEach(suit => {
            if (rank === 'Q' && suit === '♠') {
                // This is the Old Maid!
                deck.push({rank, suit, oldMaid: true});
            } else if (rank === 'Q' && suit === '♥') {
                // Skip one Queen
            } else {
                deck.push({rank, suit, oldMaid: false});
            }
        });
    });
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal cards
    players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            name: i === 0 ? 'You' : `AI ${i}`,
            hand: [],
            pairs: []
        });
    }
    
    deck.forEach((card, index) => {
        players[index % numPlayers].hand.push(card);
    });
    
    // Auto-match initial pairs
    players.forEach(player => {
        matchPairs(player);
    });
    
    render();
    logMessage('Game started! Match your pairs first, then draw from next player.');
    updateStatus("Match your pairs, then draw a card from AI 1");
}

function matchPairs(player) {
    let matched = true;
    
    while (matched) {
        matched = false;
        
        for (let i = 0; i < player.hand.length; i++) {
            for (let j = i + 1; j < player.hand.length; j++) {
                if (player.hand[i].rank === player.hand[j].rank) {
                    // Found a pair!
                    const pair = [player.hand[i], player.hand[j]];
                    player.pairs.push(pair);
                    
                    // Remove from hand (remove larger index first)
                    player.hand.splice(j, 1);
                    player.hand.splice(i, 1);
                    
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }
    }
}

function drawCard(fromPlayerIndex) {
    if (!gameActive || currentPlayer !== 0) return;
    if (fromPlayerIndex === 0) return; // Can't draw from yourself
    
    const fromPlayer = players[fromPlayerIndex];
    if (fromPlayer.hand.length === 0) {
        updateStatus('That player has no cards!');
        return;
    }
    
    // Draw random card
    const cardIndex = Math.floor(Math.random() * fromPlayer.hand.length);
    const drawnCard = fromPlayer.hand.splice(cardIndex, 1)[0];
    players[0].hand.push(drawnCard);
    
    logMessage(`You drew a card from ${fromPlayer.name}`);
    
    // Check for new pairs
    matchPairs(players[0]);
    
    render();
    
    // Check if game over
    if (checkGameOver()) return;
    
    // Next player
    nextTurn();
}

function aiTurn() {
    const player = players[currentPlayer];
    const nextPlayerIndex = (currentPlayer + 1) % numPlayers;
    const nextPlayer = players[nextPlayerIndex];
    
    if (nextPlayer.hand.length === 0) {
        nextTurn();
        return;
    }
    
    updateStatus(`${player.name} is drawing...`);
    
    setTimeout(() => {
        const cardIndex = Math.floor(Math.random() * nextPlayer.hand.length);
        const drawnCard = nextPlayer.hand.splice(cardIndex, 1)[0];
        player.hand.push(drawnCard);
        
        logMessage(`${player.name} drew a card from ${nextPlayer.name}`);
        
        // Match pairs
        matchPairs(player);
        
        render();
        
        if (checkGameOver()) return;
        
        nextTurn();
    }, 1500);
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % numPlayers;
    
    render();
    
    if (currentPlayer === 0) {
        updateStatus('Your turn! Draw a card from an AI player.');
    } else {
        setTimeout(aiTurn, 1000);
    }
}

function checkGameOver() {
    // Game ends when all but one player have no cards
    const playersWithCards = players.filter(p => p.hand.length > 0);
    
    if (playersWithCards.length === 1) {
        const loser = playersWithCards[0];
        const hasOldMaid = loser.hand.some(card => card.oldMaid);
        
        gameActive = false;
        
        if (hasOldMaid) {
            updateStatus(`🎉 GAME OVER! ${loser.name} has the OLD MAID! 👵`);
            logMessage(`${loser.name} loses with the Old Maid!`);
        }
        
        return true;
    }
    
    return false;
}

function render() {
    const area = document.getElementById('playersArea');
    area.innerHTML = '';
    
    players.forEach((player, index) => {
        const section = document.createElement('div');
        section.className = `player-section ${index === 0 ? 'you' : 'ai'}`;
        if (index === currentPlayer) section.classList.add('active');
        
        section.innerHTML = `
            <h3 style="color: ${index === 0 ? '#4CAF50' : '#FF6B6B'}; margin: 0 0 15px 0;">
                ${player.name} ${index === currentPlayer ? '⭐' : ''}
            </h3>
            <div style="color: #00FFFF; margin-bottom: 10px;">
                Cards: ${player.hand.length} | Pairs: ${player.pairs.length}
            </div>
        `;
        
        // Show hand
        const hand = document.createElement('div');
        hand.className = 'hand';
        
        if (index === 0) {
            // Player's hand - show cards
            player.hand.forEach(card => {
                const cardElement = createCardElement(card, false);
                hand.appendChild(cardElement);
            });
        } else {
            // AI hand - show backs, clickable to draw
            player.hand.forEach((card, cardIndex) => {
                const cardElement = createCardElement(null, true);
                if (currentPlayer === 0 && index !== 0) {
                    cardElement.onclick = () => drawCard(index);
                }
                hand.appendChild(cardElement);
            });
        }
        
        section.appendChild(hand);
        
        // Show matched pairs
        if (player.pairs.length > 0) {
            const pairsDiv = document.createElement('div');
            pairsDiv.innerHTML = '<div style="color: #4CAF50; font-size: 12px; margin: 10px 0;">Matched Pairs:</div>';
            const pairsContainer = document.createElement('div');
            pairsContainer.className = 'matched-pairs';
            
            player.pairs.forEach(pair => {
                const pairDiv = document.createElement('div');
                pairDiv.className = 'pair';
                pair.forEach(card => {
                    pairDiv.appendChild(createCardElement(card, false));
                });
                pairsContainer.appendChild(pairDiv);
            });
            
            pairsDiv.appendChild(pairsContainer);
            section.appendChild(pairsDiv);
        }
        
        area.appendChild(section);
    });
}

function createCardElement(card, isBack) {
    const div = document.createElement('div');
    div.className = 'card' + (isBack ? ' back' : '');
    
    if (isBack) {
        div.textContent = '?';
    } else {
        if (card.oldMaid) {
            div.classList.add('old-maid');
            div.innerHTML = '<div>👵<br>OLD<br>MAID</div>';
        } else {
            const color = (card.suit === '♥' || card.suit === '♦') ? '#FF0000' : '#000000';
            div.innerHTML = `
                <div class="card-rank">${card.rank}</div>
                <div class="card-suit" style="color: ${color}">${card.suit}</div>
            `;
        }
    }
    
    return div;
}

function logMessage(message) {
    const log = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
setPlayers(2);

