const AI_URL = 'http://localhost:10775';

let board = [];
let size = 11;
let currentPlayer = 'black';
let gameOver = false;
let aiEnabled = false;
let aiThinking = false;
let moveCount = 0;

const canvas = document.getElementById('hexCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function initBoard() {
    board = [];
    for (let r = 0; r < size; r++) {
        board[r] = [];
        for (let c = 0; c < size; c++) board[r][c] = null;
    }
    currentPlayer = 'black';
    gameOver = false;
    moveCount = 0;
    aiThinking = false;
}

function boardToMohex() {
    const moves = [];
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (board[r][c])
                moves.push(board[r][c] + ' ' + String.fromCharCode(97 + c) + (r + 1));
    return moves.join(', ');
}

function checkWin(player) {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    function dfs(r, c) {
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (visited[r][c] || board[r][c] !== player) return false;
        visited[r][c] = true;
        if (player === 'black' && r === size - 1) return true;
        if (player === 'white' && c === size - 1) return true;
        const dirs = [[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0]];
        for (const [dr, dc] of dirs)
            if (dfs(r + dr, c + dc)) return true;
        return false;
    }
    if (player === 'black')
        for (let c = 0; c < size; c++) if (board[0][c] === 'black' && dfs(0, c)) return true;
    if (player === 'white')
        for (let r = 0; r < size; r++) if (board[r][0] === 'white' && dfs(r, 0)) return true;
    return false;
}

function placeStone(r, c) {
    if (gameOver || board[r][c] || aiThinking) return false;
    if (aiEnabled && currentPlayer !== 'black') return false;
    board[r][c] = currentPlayer;
    moveCount++;
    if (checkWin(currentPlayer)) {
        gameOver = true;
        statusEl.innerHTML = '&#127942; ' + currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + ' wins!';
        drawBoard(); return true;
    }
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    drawBoard(); updateStatus();
    if (aiEnabled && !gameOver && currentPlayer === 'white') setTimeout(aiMove, 300);
    return true;
}

async function aiMove() {
    if (gameOver || aiThinking) return;
    aiThinking = true;
    statusEl.textContent = 'AI thinking...';
    try {
        const resp = await fetch(AI_URL + '/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board: boardToMohex() || ' ', boardsize: size, player: 'white' }),
            signal: AbortSignal.timeout(15000),
        });
        const data = await resp.json();
        if (data.success && data.move) {
            const col = data.move.charCodeAt(0) - 97;
            const row = parseInt(data.move.slice(1)) - 1;
            if (row >= 0 && row < size && col >= 0 && col < size && !board[row][col]) {
                board[row][col] = 'white';
                moveCount++;
                if (checkWin('white')) { gameOver = true; statusEl.innerHTML = '&#129302; AI (White) wins!'; drawBoard(); aiThinking = false; return; }
                currentPlayer = 'black';
                drawBoard(); updateStatus();
                aiThinking = false; return;
            }
        }
        statusEl.textContent = 'AI returned an invalid move.';
        aiEnabled = false;
        document.getElementById('aiBtn').textContent = 'Play vs AI';
        drawBoard(); updateStatus();
    } catch (e) {
        statusEl.textContent = e.name === 'TimeoutError' ? 'AI not reachable (port 10775). Try Docker or disable AI.' : 'AI error: ' + e.message;
        aiEnabled = false;
        document.getElementById('aiBtn').textContent = 'Play vs AI';
        drawBoard(); updateStatus();
    }
    aiThinking = false;
}

function drawBoard() {
    const W = canvas.width, H = canvas.height;
    const N = size;
    const hexR = Math.min(W / (N * 1.85), H / (N * 1.65));
    const s3 = Math.sqrt(3);
    const spacingX = s3 * hexR;
    const spacingY = 1.5 * hexR;
    const cx0 = W / 2, cy0 = H / 2;
    const mid = (N - 1) / 2;

    ctx.clearRect(0, 0, W, H);

    function hexPath(cx, cy, r) {
        const radius = r || hexR;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = Math.PI / 2 + (Math.PI / 3) * i;
            const x = cx + radius * Math.cos(a);
            const y = cy + radius * Math.sin(a);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    // Compute cell centers (rhombus, centered at cx0,cy0)
    const cells = [];
    for (let r = 0; r < N; r++) {
        cells[r] = [];
        for (let c = 0; c < N; c++) {
            cells[r][c] = {
                cx: cx0 + (c - mid) * spacingX + (r - mid) * spacingX / 2,
                cy: cy0 + (r - mid) * spacingY
            };
        }
    }

    // Grid lines — single edge per pair
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            const {cx, cy} = cells[r][c];
            if (c + 1 < N) {
                const nx = cells[r][c+1].cx, ny = cells[r][c+1].cy;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
            }
            if (r + 1 < N) {
                const nx = cells[r+1][c].cx, ny = cells[r+1][c].cy;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
            }
            if (r + 1 < N && c - 1 >= 0) {
                const nx = cells[r+1][c-1].cx, ny = cells[r+1][c-1].cy;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
            }
        }
    }

    // Draw cells
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            const {cx, cy} = cells[r][c];
            const stone = board[r][c];

            hexPath(cx, cy);
            if (stone === 'black') {
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
                hexPath(cx - 2, cy - 2, hexR * 0.65);
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fill();
            } else if (stone === 'white') {
                ctx.fillStyle = '#e0e0e0';
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
                hexPath(cx - 2, cy - 2, hexR * 0.65);
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fill();
            } else {
                ctx.fillStyle = '#1a1a20';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.lineWidth = 1;
                ctx.stroke();
                hexPath(cx, cy, hexR * 0.88);
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // Black connection strips (top-bottom)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 4;
    const topL = cells[0][0], topR = cells[0][N-1];
    const botL = cells[N-1][0], botR = cells[N-1][N-1];
    const hh = hexR * Math.sqrt(3) * 0.5;
    ctx.beginPath(); ctx.moveTo(topL.cx - hh, topL.cy - hexR * 1.1); ctx.lineTo(topR.cx + hh, topR.cy - hexR * 1.1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(botL.cx - hh, botL.cy + hexR * 1.1); ctx.lineTo(botR.cx + hh, botR.cy + hexR * 1.1); ctx.stroke();

    // White connection strips (left-right) — subtle
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(topL.cx - hh * 1.3, topL.cy - hexR / 2);
    ctx.lineTo(botL.cx - hh * 1.3, botL.cy + hexR / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(topR.cx + hh * 1.3, topR.cy - hexR / 2);
    ctx.lineTo(botR.cx + hh * 1.3, botR.cy + hexR / 2);
    ctx.stroke();

    // Edge labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `${Math.round(hexR * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Black', (topL.cx + topR.cx) / 2, topL.cy - hexR * 1.5);
    ctx.fillText('Black', (botL.cx + botR.cx) / 2, botL.cy + hexR * 2);
    ctx.textAlign = 'right';
    ctx.fillText('White', topL.cx - hh * 1.8, (topL.cy + botL.cy) / 2 + hexR * 0.25);
    ctx.textAlign = 'left';
    ctx.fillText('White', topR.cx + hh * 1.8, (topR.cy + botR.cy) / 2 + hexR * 0.25);
}

function updateStatus() {
    if (gameOver) return;
    if (aiEnabled && currentPlayer === 'white') statusEl.innerHTML = '<span class="turn-indicator turn-white"></span>AI thinking...';
    else statusEl.innerHTML = '<span class="turn-indicator turn-' + currentPlayer + '"></span>' + currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + '\'s turn';
}

canvas.addEventListener('click', function (e) {
    if (gameOver || aiThinking) return;
    if (aiEnabled && currentPlayer !== 'black') return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const N = size;
    const hexR = Math.min(canvas.width, canvas.height) / (N * 1.85);
    const s3 = Math.sqrt(3);
    const spacingX = s3 * hexR;
    const spacingY = 1.5 * hexR;
    const cx0 = canvas.width / 2, cy0 = canvas.height / 2;
    const mid = (N - 1) / 2;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            const cx = cx0 + (c - mid) * spacingX + (r - mid) * spacingX / 2;
            const cy = cy0 + (r - mid) * spacingY;
            if ((mx - cx) * (mx - cx) + (my - cy) * (my - cy) < hexR * hexR * 0.85) {
                placeStone(r, c); return;
            }
        }
    }
});

function resetGame() {
    size = parseInt(document.getElementById('sizeSelect').value);
    initBoard(); drawBoard(); updateStatus();
}
async function toggleAI() {
    if (!aiEnabled) {
        statusEl.textContent = 'Connecting to AI engine...';
        try {
            const resp = await fetch(AI_URL + '/api/status', { signal: AbortSignal.timeout(5000) });
            const data = await resp.json();
            if (data.ready || data.status === 'online') {
                aiEnabled = true;
                document.getElementById('aiBtn').textContent = 'Play vs Human';
                document.getElementById('aiBtn').className = 'btn';
                if (!gameOver && currentPlayer === 'white') setTimeout(aiMove, 500);
                updateStatus();
                return;
            }
        } catch (_) {}
        statusEl.textContent = 'AI engine unavailable (port 10775). Start Docker: just docker-up';
        document.getElementById('aiBtn').textContent = 'Play vs AI';
        return;
    }
    aiEnabled = false;
    document.getElementById('aiBtn').textContent = 'Play vs AI';
    document.getElementById('aiBtn').className = 'btn secondary';
    updateStatus();
}

initBoard(); drawBoard();
