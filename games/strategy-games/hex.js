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
            }
        }
    } catch (e) { statusEl.textContent = 'AI error: ' + e.message; }
    aiThinking = false;
}

function drawBoard() {
    const W = canvas.width, H = canvas.height;
    const hexR = Math.min(W, H) / (size * 1.6);
    const s3 = Math.sqrt(3);
    const spacingX = s3 * hexR;
    const spacingY = 1.5 * hexR;
    const x0 = (W - (size - 1) * spacingX - spacingX / 2) / 2 + spacingX / 2;
    const y0 = (H - (size - 1) * spacingY) / 2;

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

    // Get cell centers
    const cells = [];
    for (let r = 0; r < size; r++) {
        cells[r] = [];
        for (let c = 0; c < size; c++) {
            cells[r][c] = { cx: x0 + c * spacingX + r * spacingX / 2, cy: y0 + r * spacingY };
        }
    }

    // Draw visible grid lines (only draw each edge once — from cell to its NE and E neighbors)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cx = cells[r][c].cx, cy = cells[r][c].cy;
            // Connect to east neighbor
            if (c + 1 < size) {
                const nx = cells[r][c + 1].cx, ny = cells[r][c + 1].cy;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
            }
            // Connect to south-east neighbor
            if (r + 1 < size) {
                const nx = cells[r + 1][c].cx, ny = cells[r + 1][c].cy;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
            }
            // Connect to south-west neighbor
            if (r + 1 < size && c - 1 >= 0) {
                const nx = cells[r + 1][c - 1].cx, ny = cells[r + 1][c - 1].cy;
                ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.stroke();
            }
        }
    }

    // Draw cells
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const {cx, cy} = cells[r][c];
            const stone = board[r][c];

            hexPath(cx, cy);
            if (stone === 'black') {
                ctx.fillStyle = '#1a1a1a';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Glossy highlight
                hexPath(cx - 2, cy - 2, hexR * 0.65);
                ctx.fillStyle = 'rgba(255,255,255,0.08)';
                ctx.fill();
            } else if (stone === 'white') {
                ctx.fillStyle = '#e0e0e0';
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Glossy highlight
                hexPath(cx - 2, cy - 2, hexR * 0.65);
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fill();
            } else {
                // Empty cell — subtle fill + bevel
                ctx.fillStyle = '#1a1a20';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Inner bevel highlight
                hexPath(cx, cy, hexR * 0.88);
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    // Black side borders (top-bottom) — thick colored strip
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 6;
    ctx.beginPath();
    const tL = x0, tR = x0 + (size - 1) * spacingX;
    const topY = y0 - hexR * 0.9;
    const botY = y0 + (size - 1) * spacingY + hexR * 0.9;
    ctx.moveTo(tL, topY); ctx.lineTo(tR, topY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tL, botY); ctx.lineTo(tR, botY); ctx.stroke();

    // White side borders (left-right) — thick colored strip
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 6;
    const leftX = x0 - hexR * 0.75;
    const rightX = x0 + (size - 1) * spacingX + hexR * 0.75;
    ctx.beginPath();
    ctx.moveTo(leftX, y0); ctx.lineTo(leftX + (size - 1) * spacingX / 2, y0 + (size - 1) * spacingY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightX, y0); ctx.lineTo(rightX - (size - 1) * spacingX / 2, y0 + (size - 1) * spacingY); ctx.stroke();
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
    const s3 = Math.sqrt(3);
    const hexR = Math.min(canvas.width, canvas.height) / (size * 1.6);
    const spacingX = s3 * hexR;
    const spacingY = 1.5 * hexR;
    const x0 = (canvas.width - (size - 1) * spacingX - spacingX / 2) / 2 + spacingX / 2;
    const y0 = (canvas.height - (size - 1) * spacingY) / 2;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cx = x0 + c * spacingX + r * spacingX / 2;
            const cy = y0 + r * spacingY;
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
function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiBtn').textContent = aiEnabled ? 'Play vs Human' : 'Play vs AI';
    document.getElementById('aiBtn').className = 'btn ' + (aiEnabled ? '' : 'secondary');
    if (aiEnabled && !gameOver && currentPlayer === 'white') setTimeout(aiMove, 500);
    updateStatus();
}

initBoard(); drawBoard();
