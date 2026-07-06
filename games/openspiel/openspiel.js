const API = 'http://localhost:10787';

let games = [];
let selectedGame = null;
let gameState = '';   // serialized state string
let legalActions = [];
let lastAction = null;
let isTerminal = false;
let returns = null;
let moveHistory = [];
let currentPlayer = 0; // 0 = human, 1 = AI
let mode = 'human';   // human, mcts, random
let aiSims = 200;
let gameParams = {};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameList = document.getElementById('gameList');
const gameCount = document.getElementById('gameCount');
const gameArea = document.getElementById('gameArea');
const gameStatus = document.getElementById('gameStatus');
const actionList = document.getElementById('actionList');
const stateDisplay = document.getElementById('stateDisplay');
const gameParamsEl = document.getElementById('gameParams');

async function fetchGames() {
    try {
        const resp = await fetch(API + '/api/games');
        const data = await resp.json();
        if (data.success) games = data.games;
    } catch (e) {
        gameStatus.textContent = 'Cannot reach OpenSpiel server at ' + API;
    }
    renderGameList();
}

function renderGameList() {
    const q = document.getElementById('searchBox').value.toLowerCase();
    const filtered = games.filter(g => g.name.includes(q) || g.long_name.toLowerCase().includes(q));
    gameCount.textContent = filtered.length + ' of ' + games.length + ' games';
    gameList.innerHTML = filtered.map(g =>
        '<div class="game-card' + (selectedGame === g.name ? ' selected' : '') + '" ' +
        'onclick="selectGame(\'' + g.name + '\')">' +
        '<div class="name">' + g.long_name + '</div>' +
        '<div class="meta">' + g.name + ' &middot; ' + g.players + ' players</div>' +
        '</div>'
    ).join('');
}

function filterGames() { renderGameList(); }

function selectGame(name) {
    selectedGame = name;
    gameArea.classList.add('active');
    renderGameList();
    const g = games.find(x => x.name === name);
    gameParamsEl.innerHTML = '';
    if (g && g.parameters) {
        const keys = Object.keys(g.parameters);
        if (keys.length > 0) {
            let html = '<strong style="color:#aaa;font-size:13px;">Parameters:</strong> ';
            for (const k of keys) {
                const p = g.parameters[k];
                html += '<label>' + k.replace(/_/g, ' ') + ' <input type="text" id="param_' + k + '" value="' + (p.default_value || '') + '" size="4"></label> ';
            }
            gameParamsEl.innerHTML = html;
        }
    }
    startGame();
}

function buildParams() {
    const g = games.find(x => x.name === selectedGame);
    if (!g || !g.parameters) return null;
    const keys = Object.keys(g.parameters);
    if (keys.length === 0) return null;
    const p = {};
    for (const k of keys) {
        const el = document.getElementById('param_' + k);
        if (el) p[k] = el.value;
    }
    return p;
}

async function startGame() {
    if (!selectedGame) return;
    moveHistory = [];
    isTerminal = false;
    returns = null;
    gameState = '';
    legalActions = [];
    lastAction = null;
    gameParams = buildParams();

    gameStatus.textContent = 'Starting ' + selectedGame + '...';
    const ai = mode === 'human' ? 'mcts' : mode;
    try {
        const resp = await fetch(API + '/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game: selectedGame,
                state: '',
                player: 0,
                ai: 'mcts',
                simulations: 100,
                params: Object.keys(gameParams).length > 0 ? gameParams : null,
            }),
        });
        const data = await resp.json();
        if (data.success) {
            gameState = data.next_state || '';
            legalActions = data.legal_actions || [];
            isTerminal = data.is_terminal || false;
            returns = data.returns || null;
            updateUI(null);
            if (!isTerminal && mode !== 'human') {
                setTimeout(() => aiMove(0), 500);
            }
        } else {
            gameStatus.textContent = 'Error: ' + (data.error || 'Unknown');
        }
    } catch (e) {
        gameStatus.textContent = 'Error: ' + e.message;
    }
}

async function humanMove(action) {
    if (isTerminal) return;
    // Send user's action — we move first, then AI responds
    const result = await sendMove(action, 0);
    if (!result || isTerminal) return;

    // AI move (player 1)
    await aiMove(1);
}

async function sendMove(action, player) {
    try {
        const resp = await fetch(API + '/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game: selectedGame,
                state: gameState,
                player: player,
                action: action,
                ai: 'mcts',
                simulations: aiSims,
                params: Object.keys(gameParams).length > 0 ? gameParams : null,
            }),
        });
        const data = await resp.json();
        if (data.success) {
            gameState = data.next_state || '';
            legalActions = data.legal_actions || [];
            isTerminal = data.is_terminal || false;
            returns = data.returns || null;
            updateUI(action);
            return data;
        } else {
            gameStatus.textContent = 'Error: ' + (data.error || 'Unknown');
            return null;
        }
    } catch (e) {
        gameStatus.textContent = 'Error: ' + e.message;
        return null;
    }
}

async function aiMove(player) {
    if (isTerminal || legalActions.length === 0) return;
    gameStatus.textContent = 'AI thinking (player ' + player + ')...';
    try {
        const resp = await fetch(API + '/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game: selectedGame,
                state: gameState,
                player: player,
                ai: 'mcts',
                simulations: aiSims,
                params: Object.keys(gameParams).length > 0 ? gameParams : null,
            }),
        });
        const data = await resp.json();
        if (data.success) {
            gameState = data.next_state || '';
            legalActions = data.legal_actions || [];
            isTerminal = data.is_terminal || false;
            returns = data.returns || null;
            updateUI(data.action);

            if (!isTerminal && mode !== 'human' && legalActions.length > 0) {
                // AI vs AI — next player's AI move
                const nextPlayer = player === 0 ? 1 : 0;
                setTimeout(() => aiMove(nextPlayer), 300);
            } else if (!isTerminal && mode === 'human' && legalActions.length > 0) {
                gameStatus.textContent = 'Your move. Click an action.';
            }
        } else {
            gameStatus.textContent = 'AI error: ' + (data.error || 'Unknown');
        }
    } catch (e) {
        gameStatus.textContent = 'AI error: ' + e.message;
    }
}

function updateUI(action) {
    if (action) moveHistory.push(action);
    stateDisplay.textContent = 'State: ' + (gameState ? gameState.substring(0, 80) + '...' : '(new game)');

    if (isTerminal) {
        if (returns) {
            const scores = returns.map((r, i) => 'Player ' + i + ': ' + r).join(' &middot; ');
            gameStatus.innerHTML = '&#127942; Game over! ' + scores;
        } else {
            gameStatus.innerHTML = '&#127942; Game over';
        }
        actionList.innerHTML = '';
        drawBoard();
        return;
    }

    // Show legal actions as buttons
    let html = '';
    const maxShow = Math.min(legalActions.length, 60);
    for (let i = 0; i < maxShow; i++) {
        const a = legalActions[i];
        html += '<button onclick="humanMove(\'' + a + '\')">' + a + '</button>';
    }
    if (legalActions.length > 60) {
        html += '<span style="color:#666;font-size:12px;padding:6px;">... and ' + (legalActions.length - 60) + ' more</span>';
    }
    actionList.innerHTML = html;
    drawBoard();
}

function drawBoard() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Try to detect grid-based games and draw a board
    const gridGames = ['tic_tac_toe', 'connect_four', 'breakthrough', 'othello', 'go', 'hex', 'phantom_ttt',
        'amazons', 'quorom', 'clobber', 'dots_and_boxes', 'pig', 'kerr'];
    const isGrid = gridGames.some(g => selectedGame && selectedGame.includes(g));

    if (isGrid || legalActions.some(a => /^[a-z]\d+$/.test(a) || /^\d+$/.test(a))) {
        // Determine grid size from game
        let gridSize = 3;
        if (selectedGame && selectedGame.includes('connect_four')) gridSize = 7;
        else if (selectedGame && selectedGame.includes('othello')) gridSize = 8;
        else if (selectedGame && selectedGame.includes('breakthrough')) gridSize = 8;
        else if (selectedGame && selectedGame.includes('go')) gridSize = 9;
        else if (selectedGame && selectedGame.includes('hex')) gridSize = 11;
        else {
            const actionNums = legalActions.map(a => parseInt(a)).filter(n => !isNaN(n));
            if (actionNums.length > 0) {
                const maxAct = Math.max(...actionNums);
                gridSize = Math.ceil(Math.sqrt(maxAct + 1));
            }
        }
        const cellW = W / (gridSize + 1), cellH = H / (gridSize + 1);
        const ox = cellW / 2, oy = cellH / 2;

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const x = ox + c * cellW;
                const y = oy + r * cellH;
                ctx.strokeRect(x - cellW / 2 + 2, y - cellH / 2 + 2, cellW - 4, cellH - 4);
            }
        }

        // Label coordinates
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        for (let r = 0; r < gridSize; r++) {
            ctx.fillText((r + 1).toString(), 4, oy + r * cellH + 4);
        }
        for (let c = 0; c < gridSize; c++) {
            ctx.fillText(String.fromCharCode(97 + c), ox + c * cellW - 4, 14);
        }

        // If we have state info, try to render pieces
        // (basic rendering — shows action history on the board)
        for (let i = 0; i < moveHistory.length; i++) {
            const a = moveHistory[i];
            const isNum = /^\d+$/.test(a);
            let col, row;
            if (isNum) {
                const n = parseInt(a);
                col = n % gridSize;
                row = Math.floor(n / gridSize);
            } else if (/^[a-z]\d+$/.test(a)) {
                col = a.charCodeAt(0) - 97;
                row = parseInt(a.slice(1)) - 1;
            } else continue;
            if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) continue;

            const x = ox + col * cellW;
            const y = oy + row * cellH;
            ctx.beginPath();
            ctx.arc(x, y, Math.min(cellW, cellH) * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? '#e94560' : '#4a9eff';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    } else {
        // No board — show info text
        ctx.fillStyle = '#666';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No board preview for this game.', W / 2, H / 2 - 10);
        ctx.font = '13px sans-serif';
        ctx.fillText('Play using the action buttons below.', W / 2, H / 2 + 20);
    }
}

function undoMove() {
    if (moveHistory.length < 2) { startGame(); return; }
    moveHistory.pop(); // remove last AI move
    moveHistory.pop(); // remove last human move
    // Restart and replay up to moveHistory
    startGame();
}

function switchMode(newMode) {
    mode = newMode;
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab' + newMode.charAt(0).toUpperCase() + newMode.slice(1)).classList.add('active');
    if (selectedGame) startGame();
}

function showHelp() {
    document.getElementById('helpOverlay').classList.add('show');
}

fetchGames();
