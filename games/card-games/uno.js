// UNO Card Game Implementation
// **Timestamp**: 2026-08-05

let players = [];
let currentPlayer = 0;
let direction = 1;
let drawPile = [];
let discardPile = [];
let chosenColor = null;
let gameActive = false;
let roundActive = false;
let matchScores = [];
let unoCalled = [];
let pendingWild = null;
let drewThisTurn = false;
let aiThinking = false;
let firstCardSkipped = false;

const COLORS = ['red', 'yellow', 'green', 'blue'];
const ACTION_CARD_VALUES = ['skip', 'reverse', 'draw2', 'wild', 'wild4'];
const WIN_SCORE = 500;

function setPlayers(count) {
    numPlayers = count;
    [2, 3, 4].forEach(n => {
        const btn = document.getElementById(`btn-${n}`);
        if (btn) btn.classList.toggle('active', n === count);
    });
    newGame();
}

function createDeck() {
    const deck = [];
    COLORS.forEach(color => {
        deck.push({ color, value: 0 });
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 'skip', 'reverse', 'draw2'].forEach(v => {
            deck.push({ color, value: v });
            deck.push({ color, value: v });
        });
    });
    for (let i = 0; i < 4; i++) {
        deck.push({ color: 'wild', value: 'wild' });
        deck.push({ color: 'wild', value: 'wild4' });
    }
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function newGame() {
    matchScores = [0, 0, 0, 0].slice(0, numPlayers);
    startRound();
    document.getElementById('nextRoundBtn').style.display = 'none';
}

function startRound() {
    drawPile = createDeck();
    shuffle(drawPile);
    discardPile = [];
    direction = 1;
    currentPlayer = 0;
    chosenColor = null;
    pendingWild = null;
    drewThisTurn = false;
    aiThinking = false;
    unoCalled = [false, false, false, false];

    players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push({ name: i === 0 ? 'You' : `AI ${i}`, hand: [], isHuman: i === 0 });
    }

    for (let i = 0; i < 7; i++) {
        players.forEach(p => p.hand.push(drawPile.pop()));
    }

    flipStartCard();
    roundActive = true;
    gameActive = true;

    logMessage('Round started. 7 cards dealt to each player.');
    if (firstCardSkipped) {
        startTurn();
    } else {
        nextTurn();
    }
}

function flipStartCard() {
    firstCardSkipped = false;
    let top = drawPile.pop();
    if (top.color === 'wild') {
        chosenColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } else {
        chosenColor = top.color;
    }
    discardPile.push(top);

    // First-card action effects (standard house rules)
    if (top.value === 'skip') {
        currentPlayer = nextIndex(0, direction);
        firstCardSkipped = true;
        logMessage('First card is a Skip - player 0 is skipped.');
    } else if (top.value === 'reverse') {
        if (numPlayers === 2) {
            currentPlayer = nextIndex(0, direction);
            firstCardSkipped = true;
            logMessage('First card is a Reverse (2 players) - player 0 is skipped.');
        } else {
            direction = -1;
            logMessage('First card is a Reverse - play order reversed.');
        }
    } else if (top.value === 'draw2') {
        drawCards(0, 2, false);
        currentPlayer = nextIndex(0, direction);
        firstCardSkipped = true;
        logMessage('First card is a Draw Two - player 0 draws 2 and is skipped.');
    }
}

function nextIndex(from, dir) {
    return (from + dir + numPlayers) % numPlayers;
}

function topCard() {
    return discardPile[discardPile.length - 1];
}

function canPlay(card) {
    if (card.color === 'wild') return true;
    if (card.color === chosenColor) return true;
    return card.value === topCard().value;
}

function hasPlayable(idx) {
    return players[idx].hand.some(canPlay);
}

function playableIndexes(idx) {
    return players[idx].hand.map((c, i) => ({ c, i })).filter(x => canPlay(x.c)).map(x => x.i);
}

function syncUnoFlag(idx) {
    const handCount = players[idx].hand.length;
    if (handCount > 1) {
        unoCalled[idx] = false;
    } else if (handCount === 1 && !players[idx].isHuman) {
        unoCalled[idx] = true; // AI always calls UNO
    }
}

function drawOne(idx) {
    if (drawPile.length === 0) {
        if (discardPile.length <= 1) {
            logMessage('Both piles empty - no cards left to draw.');
            return null;
        }
        const top = discardPile.pop();
        drawPile = discardPile;
        discardPile = [top];
        shuffle(drawPile);
        logMessage('Draw pile empty - discard pile reshuffled.');
    }
    const card = drawPile.pop();
    if (!card) return null;
    players[idx].hand.push(card);
    syncUnoFlag(idx);
    return card;
}

function drawCards(idx, count, logIt) {
    let drawn = 0;
    for (let i = 0; i < count; i++) {
        const card = drawOne(idx);
        if (!card) break;
        drawn++;
    }
    if (logIt) logMessage(`${players[idx].name} draws ${drawn} card(s).`);
    syncUnoFlag(idx);
    render();
}

function playCard(playerIdx, cardIdx) {
    if (!gameActive || !roundActive) return;
    if (currentPlayer !== playerIdx) return;
    if (aiThinking) return;

    const player = players[playerIdx];
    const card = player.hand[cardIdx];
    if (!canPlay(card)) {
        updateStatus('That card does not match the top card!');
        return;
    }

    player.hand.splice(cardIdx, 1);
    drewThisTurn = false;

    if (card.color === 'wild') {
        if (player.isHuman) {
            pendingWild = { card, playerIdx };
            showColorPicker();
            return;
        }
        chosenColor = pickColor(player.hand);
    } else {
        chosenColor = card.color;
    }

    resolvePlay(card, playerIdx);
}

function chooseWildColor(color) {
    hideColorPicker();
    if (!pendingWild) return;
    chosenColor = color;
    const { card, playerIdx } = pendingWild;
    pendingWild = null;
    resolvePlay(card, playerIdx);
}

function resolvePlay(card, playerIdx) {
    discardPile.push(card);
    syncUnoFlag(playerIdx);

    const handCount = players[playerIdx].hand.length;
    if (handCount === 0) {
        roundWon(playerIdx);
        return;
    }
    if (handCount === 1 && !unoCalled[playerIdx]) {
        drawCards(playerIdx, 2, false);
        logMessage(`${players[playerIdx].name} forgot to call UNO! +2 penalty cards.`);
        updateStatus('Penalty! You must call UNO when you have one card left.');
    }

    applyAction(card, playerIdx);
    render();
    nextTurn();
}

function applyAction(card, playerIdx) {
    switch (card.value) {
        case 'skip':
            logMessage(`${players[playerIdx].name} plays Skip - next player skips.`);
            currentPlayer = nextIndex(currentPlayer, direction);
            break;
        case 'reverse':
            if (numPlayers === 2) {
                logMessage(`${players[playerIdx].name} plays Reverse - next player skips.`);
                currentPlayer = nextIndex(currentPlayer, direction);
            } else {
                direction *= -1;
                logMessage(`${players[playerIdx].name} plays Reverse - play order reversed.`);
            }
            break;
        case 'draw2':
            logMessage(`${players[playerIdx].name} plays Draw Two!`);
            drawCards(nextIndex(currentPlayer, direction), 2, true);
            currentPlayer = nextIndex(currentPlayer, direction);
            break;
        case 'wild4':
            logMessage(`${players[playerIdx].name} plays Wild Draw Four!`);
            drawCards(nextIndex(currentPlayer, direction), 4, true);
            currentPlayer = nextIndex(currentPlayer, direction);
            break;
        default:
            break;
    }
}

function drawCard() {
    if (!gameActive || !roundActive) return;
    if (aiThinking) return;
    if (!players[currentPlayer].isHuman) return;
    if (drewThisTurn) return;

    const card = drawOne(currentPlayer);
    drewThisTurn = true;
    render();

    if (canPlay(card)) {
        updateStatus('You drew a playable card - play it or pass.');
        document.getElementById('passBtn').style.display = 'inline-block';
    } else {
        updateStatus('No matching card - turn passes.');
        setTimeout(() => {
            passTurn();
        }, 700);
    }
}

function passTurn() {
    if (!gameActive || !roundActive) return;
    if (aiThinking) return;
    if (!players[currentPlayer].isHuman) return;
    document.getElementById('passBtn').style.display = 'none';
    drewThisTurn = false;
    logMessage('You pass.');
    nextTurn();
}

function callUno() {
    if (!gameActive || !roundActive) return;
    if (players[0].hand.length !== 2 || unoCalled[0]) return;
    unoCalled[0] = true;
    logMessage('You call UNO!');
    updateStatus('UNO called! Play your last card.');
    render();
}

function aiTurn() {
    if (!gameActive || !roundActive) return;
    const idx = currentPlayer;
    const player = players[idx];
    aiThinking = false;

    const playable = playableIndexes(idx);
    if (playable.length > 0) {
        const best = pickBestCard(idx, playable);
        const card = player.hand.splice(best, 1)[0];
        if (card.color === 'wild') {
            chosenColor = pickColor(player.hand);
        } else {
            chosenColor = card.color;
        }
        logMessage(`${player.name} plays ${describeCard(card)}.`);
        discardPile.push(card);
        syncUnoFlag(idx);

        if (player.hand.length === 0) {
            roundWon(idx);
            return;
        }

        applyAction(card, idx);
        render();
        nextTurn();
        return;
    }

    const drawn = drawOne(idx);
    if (drawn && canPlay(drawn)) {
        const drawnIdx = player.hand.length - 1;
        const card = player.hand.splice(drawnIdx, 1)[0];
        if (card.color === 'wild') {
            chosenColor = pickColor(player.hand);
        } else {
            chosenColor = card.color;
        }
        logMessage(`${player.name} draws a card and plays ${describeCard(card)}.`);
        discardPile.push(card);
        syncUnoFlag(idx);

        if (player.hand.length === 0) {
            roundWon(idx);
            return;
        }

        applyAction(card, idx);
        render();
        nextTurn();
    } else {
        logMessage(`${player.name} draws a card and passes.`);
        render();
        setTimeout(nextTurn, 800);
    }
}

function pickBestCard(idx, playableIndexesList) {
    const player = players[idx];
    const colorCount = {};
    COLORS.forEach(c => colorCount[c] = 0);
    player.hand.forEach(c => {
        if (c.color !== 'wild') colorCount[c.color]++;
    });

    let bestIdx = playableIndexesList[0];
    let bestScore = -1;
    playableIndexesList.forEach(i => {
        const card = player.hand[i];
        let score = 1;
        if (card.value === 'wild4') score = 60;
        else if (card.value === 'draw2') score = 30;
        else if (card.value === 'skip') score = 20;
        else if (card.value === 'reverse') score = 15;
        else if (card.value === 'wild') score = 5;
        if (card.color !== 'wild') score += colorCount[card.color];

        // Punish near-empty opponents harder
        const nextIdx = nextIndex(currentPlayer, direction);
        if (players[nextIdx].hand.length <= 2 && (card.value === 'draw2' || card.value === 'wild4' || card.value === 'skip')) {
            score += 25;
        }
        if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    });
    return bestIdx;
}

function pickColor(hand) {
    const colorCount = {};
    COLORS.forEach(c => colorCount[c] = 0);
    hand.forEach(c => {
        if (c.color !== 'wild') colorCount[c.color]++;
    });
    let best = COLORS[Math.floor(Math.random() * COLORS.length)];
    let bestCount = -1;
    COLORS.forEach(c => {
        if (colorCount[c] > bestCount) {
            bestCount = colorCount[c];
            best = c;
        }
    });
    return best;
}

function nextTurn() {
    if (!gameActive || !roundActive) return;
    currentPlayer = nextIndex(currentPlayer, direction);
    startTurn();
}

function startTurn() {
    if (!gameActive || !roundActive) return;
    drewThisTurn = false;
    document.getElementById('passBtn').style.display = 'none';
    syncUnoFlag(currentPlayer);

    render();

    const p = players[currentPlayer];
    if (p.isHuman) {
        updateStatus(hasPlayable(currentPlayer)
            ? 'Your turn! Click a card to play, or draw from the pile.'
            : 'Your turn! No matching card - draw from the pile.');
    } else {
        updateStatus(`${p.name}'s turn...`);
        aiThinking = true;
        setTimeout(aiTurn, 900);
    }
}

function cardScore(card) {
    if (typeof card.value === 'number') return card.value;
    if (card.value === 'wild' || card.value === 'wild4') return 50;
    return 20; // skip, reverse, draw2
}

function roundWon(idx) {
    roundActive = false;
    aiThinking = false;
    let points = 0;
    players.forEach((p, i) => {
        if (i !== idx) {
            p.hand.forEach(c => points += cardScore(c));
        }
    });
    matchScores[idx] += points;

    logMessage(`${players[idx].name} wins the round and earns ${points} points!`);

    if (matchScores[idx] >= WIN_SCORE) {
        gameActive = false;
        updateStatus(`🏆 MATCH OVER! ${players[idx].name} reaches ${matchScores[idx]} points and wins the match!`);
        document.getElementById('nextRoundBtn').style.display = 'none';
        render();
        return;
    }

    updateStatus(`${players[idx].name} wins the round (+${points}). Ready for the next round!`);
    document.getElementById('nextRoundBtn').style.display = 'inline-block';
    render();
}

function nextRound() {
    if (roundActive) return;
    startRound();
}

function describeCard(card) {
    const colors = { red: 'Red', yellow: 'Yellow', green: 'Green', blue: 'Blue', wild: 'Wild' };
    const values = { skip: 'Skip', reverse: 'Reverse', draw2: 'Draw Two', wild: '', wild4: 'Draw Four' };
    const color = colors[card.color] || card.color;
    if (card.value === 'wild') return `${color}`;
    if (card.value === 'wild4') return `${color} Draw Four`;
    return `${color} ${values[card.value] ?? card.value}`;
}

function showColorPicker() {
    document.getElementById('colorPicker').style.display = 'flex';
}

function hideColorPicker() {
    document.getElementById('colorPicker').style.display = 'none';
}

function render() {
    renderTable();
    renderScores();
    renderPlayers();
    renderUnoButton();
}

function renderTable() {
    const drawEl = document.getElementById('drawPile');
    drawEl.className = 'pile draw-pile' + (gameActive && roundActive && players[currentPlayer].isHuman && !drewThisTurn ? ' clickable' : '');
    drawEl.onclick = (gameActive && roundActive && players[currentPlayer].isHuman && !drewThisTurn) ? drawCard : null;

    const discardEl = document.getElementById('discardPile');
    discardEl.innerHTML = '';
    if (discardPile.length > 0) {
        discardEl.appendChild(createUnoCardElement(topCard(), true));
    }

    document.getElementById('direction').textContent = direction === 1 ? '↻' : '↺';
    document.getElementById('direction').title = direction === 1 ? 'Clockwise' : 'Counter-clockwise';

    const colorEl = document.getElementById('colorIndicator');
    if (chosenColor) {
        colorEl.style.background = COLOR_HEX[chosenColor];
        colorEl.title = `Chosen color: ${chosenColor}`;
    } else {
        colorEl.style.background = 'transparent';
    }
}

const COLOR_HEX = {
    red: '#E63946',
    yellow: '#FFB703',
    green: '#2A9D8F',
    blue: '#2196F3',
    wild: '#1D1D1D'
};

function renderScores() {
    const bar = document.getElementById('scoresBar');
    bar.innerHTML = '';
    players.forEach((p, i) => {
        const span = document.createElement('span');
        span.className = 'score-chip' + (i === currentPlayer ? ' current' : '');
        span.textContent = `${p.name}: ${matchScores[i]}`;
        bar.appendChild(span);
    });
    bar.appendChild(document.createTextNode(` (first to ${WIN_SCORE})`));
}

function renderPlayers() {
    const area = document.getElementById('playersArea');
    area.innerHTML = '';

    players.forEach((player, index) => {
        const section = document.createElement('div');
        section.className = `player-section ${player.isHuman ? 'you' : 'ai'}`;
        if (index === currentPlayer) section.classList.add('active');

        const turnMark = index === currentPlayer ? ' ⭐' : '';
        const unoBadge = player.hand.length === 1 ? ' <span class="uno-badge">UNO!</span>' : '';
        section.innerHTML = `
            <h3 style="color: ${player.isHuman ? '#4CAF50' : '#FF6B6B'}; margin: 0 0 10px 0;">
                ${player.name}${turnMark}${unoBadge}
            </h3>
            <div style="color: #00FFFF; margin-bottom: 10px;">Cards: ${player.hand.length}</div>
        `;

        const hand = document.createElement('div');
        hand.className = 'hand';

        if (player.isHuman) {
            player.hand.forEach((card, cardIdx) => {
                const el = createUnoCardElement(card, false);
                el.onclick = () => playCard(0, cardIdx);
                hand.appendChild(el);
            });
        } else {
            player.hand.forEach(() => {
                hand.appendChild(createUnoCardElement(null, true));
            });
        }

        section.appendChild(hand);
        area.appendChild(section);
    });
}

function renderUnoButton() {
    const btn = document.getElementById('unoBtn');
    const humanCount = players[0] ? players[0].hand.length : 0;
    if (humanCount === 2 && !unoCalled[0]) {
        btn.disabled = false;
        btn.classList.add('pulse');
    } else {
        btn.disabled = true;
        btn.classList.remove('pulse');
    }
}

function createUnoCardElement(card, isDiscard) {
    const div = document.createElement('div');
    div.className = 'card uno-card';

    if (!card) {
        div.classList.add('back');
        div.textContent = 'UNO';
        return div;
    }

    const hex = COLOR_HEX[card.color] || '#1D1D1D';
    div.style.background = `linear-gradient(135deg, ${hex} 0%, ${shade(hex, -20)} 100%)`;
    div.style.border = card.color === 'wild' ? '4px solid #FFD700' : '3px solid rgba(0,0,0,0.3)';

    const valueLabel = typeof card.value === 'number' ? card.value : card.value;
    div.innerHTML = `
        <div class="uno-card-value">${valueLabel}</div>
        ${card.value === 'skip' ? '<div class="uno-card-icon">⊘</div>' : ''}
        ${card.value === 'reverse' ? '<div class="uno-card-icon">⇄</div>' : ''}
        ${card.value === 'draw2' ? '<div class="uno-card-icon">+2</div>' : ''}
        ${card.value === 'wild' ? '<div class="uno-card-icon">★</div>' : ''}
        ${card.value === 'wild4' ? '<div class="uno-card-icon">+4</div>' : ''}
    `;

    if (isDiscard) div.classList.add('discard');
    return div;
}

function shade(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
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
let numPlayers = 2;
setPlayers(2);
