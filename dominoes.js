// Dominoes Game Implementation
// **Timestamp**: 2025-12-04

let playerHand = [];
let aiHand = [];
let boneyard = [];
let chain = [];
let playerScore = 0;
let aiScore = 0;
let currentTurn = 'player';
let aiEnabled = false;
let gameActive = false;

function createDominoSet() {
    const set = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            set.push({top: i, bottom: j});
        }
    }
    return set;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function newGame() {
    const dominoes = createDominoSet();
    shuffle(dominoes);
    
    playerHand = dominoes.slice(0, 7);
    aiHand = dominoes.slice(7, 14);
    boneyard = dominoes.slice(14);
    chain = [];
    currentTurn = 'player';
    gameActive = true;
    
    renderAll();
    updateStatus('Place any domino to start!');
    document.getElementById('drawBtn').disabled = false;
    document.getElementById('passBtn').disabled = false;
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    const btn = document.getElementById('aiToggle');
    btn.textContent = aiEnabled ? '👤 Play vs Human' : '🤖 Play vs AI';
    btn.style.background = aiEnabled ? 'rgba(76, 175, 80, 0.3)' : '';
}

function renderAll() {
    renderPlayerHand();
    renderAIHand();
    renderChain();
    updateScores();
}

function renderPlayerHand() {
    const handElement = document.getElementById('playerHand');
    handElement.innerHTML = '';
    
    playerHand.forEach((domino, index) => {
        const element = createDominoElement(domino);
        element.onclick = () => playDomino(index, 'player');
        handElement.appendChild(element);
    });
}

function renderAIHand() {
    const handElement = document.getElementById('aiHand');
    handElement.innerHTML = '';
    
    aiHand.forEach(() => {
        const back = document.createElement('div');
        back.className = 'domino-back';
        handElement.appendChild(back);
    });
    
    document.getElementById('aiCount').textContent = aiHand.length;
}

function renderChain() {
    const chainElement = document.getElementById('chain');
    chainElement.innerHTML = '';
    
    if (chain.length === 0) {
        chainElement.innerHTML = '<p style="color: white; opacity: 0.5;">Chain is empty - place first domino</p>';
        return;
    }
    
    chain.forEach(domino => {
        const element = createDominoElement(domino, true);
        chainElement.appendChild(element);
    });
}

function createDominoElement(domino, horizontal = false) {
    const div = document.createElement('div');
    div.className = 'domino' + (horizontal ? ' horizontal' : '');
    
    const half1 = document.createElement('div');
    half1.className = 'domino-half';
    half1.textContent = getDots(domino.top);
    
    const divider = document.createElement('div');
    divider.className = 'domino-divider';
    
    const half2 = document.createElement('div');
    half2.className = 'domino-half';
    half2.textContent = getDots(domino.bottom);
    
    div.appendChild(half1);
    div.appendChild(divider);
    div.appendChild(half2);
    
    return div;
}

function getDots(number) {
    const dots = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return number === 0 ? '' : dots[number - 1];
}

function playDomino(index, player) {
    if (!gameActive || currentTurn !== player) return;
    
    const hand = player === 'player' ? playerHand : aiHand;
    const domino = hand[index];
    
    if (chain.length === 0) {
        // First domino
        chain.push(domino);
        hand.splice(index, 1);
    } else {
        // Match ends
        const leftEnd = chain[0].top;
        const rightEnd = chain[chain.length - 1].bottom;
        
        let placed = false;
        
        // Try matching left end
        if (domino.bottom === leftEnd) {
            chain.unshift(domino);
            placed = true;
        } else if (domino.top === leftEnd) {
            chain.unshift({top: domino.bottom, bottom: domino.top});
            placed = true;
        }
        // Try matching right end
        else if (domino.top === rightEnd) {
            chain.push(domino);
            placed = true;
        } else if (domino.bottom === rightEnd) {
            chain.push({top: domino.bottom, bottom: domino.top});
            placed = true;
        }
        
        if (placed) {
            hand.splice(index, 1);
        } else {
            updateStatus('❌ That domino doesn\'t match!');
            return;
        }
    }
    
    renderAll();
    
    // Check win
    if (hand.length === 0) {
        endGame(player);
        return;
    }
    
    // Next turn
    currentTurn = player === 'player' ? 'ai' : 'player';
    
    if (aiEnabled && currentTurn === 'ai') {
        setTimeout(aiTurn, 1000);
    }
}

function aiTurn() {
    if (!gameActive || currentTurn !== 'ai') return;
    
    updateStatus('🤖 AI is thinking...');
    
    // Find playable domino
    let playableIndex = -1;
    
    if (chain.length === 0) {
        playableIndex = 0; // Play first domino
    } else {
        const leftEnd = chain[0].top;
        const rightEnd = chain[chain.length - 1].bottom;
        
        playableIndex = aiHand.findIndex(d => 
            d.top === leftEnd || d.bottom === leftEnd ||
            d.top === rightEnd || d.bottom === rightEnd
        );
    }
    
    if (playableIndex !== -1) {
        setTimeout(() => playDomino(playableIndex, 'ai'), 500);
    } else {
        // AI must draw
        setTimeout(() => {
            if (boneyard.length > 0) {
                aiHand.push(boneyard.pop());
                renderAll();
                updateStatus('AI drew a tile');
                setTimeout(aiTurn, 500);
            } else {
                pass();
            }
        }, 500);
    }
}

function drawFromBoneyard() {
    if (boneyard.length === 0) {
        updateStatus('❌ Boneyard is empty!');
        return;
    }
    
    playerHand.push(boneyard.pop());
    renderAll();
    updateStatus('Drew a tile from boneyard');
}

function pass() {
    updateStatus(`${currentTurn === 'player' ? 'You' : 'AI'} passed`);
    currentTurn = currentTurn === 'player' ? 'ai' : 'player';
    
    if (aiEnabled && currentTurn === 'ai') {
        setTimeout(aiTurn, 1000);
    }
}

function endGame(winner) {
    gameActive = false;
    
    // Calculate scores
    const loser = winner === 'player' ? aiHand : playerHand;
    const points = loser.reduce((sum, d) => sum + d.top + d.bottom, 0);
    
    if (winner === 'player') {
        playerScore += points;
    } else {
        aiScore += points;
    }
    
    updateScores();
    updateStatus(`🎉 ${winner.toUpperCase()} WINS! +${points} points`);
    
    document.getElementById('drawBtn').disabled = true;
    document.getElementById('passBtn').disabled = true;
}

function updateScores() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
    document.getElementById('boneyardCount').textContent = boneyard.length;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
updateScores();

