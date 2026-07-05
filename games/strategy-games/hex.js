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
        for (let c = 0; c < size; c++) {
            board[r][c] = null;
        }
    }
    currentPlayer = 'black';
    gameOver = false;
    moveCount = 0;
    aiThinking = false;
}

function boardToMohex() {
    const moves = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c]) {
                const colLetter = String.fromCharCode(97 + c);
                const rowNum = r + 1;
                moves.push(board[r][c] + ' ' + colLetter + rowNum);
            }
        }
    }
    return moves.join(', ');
}

function checkWin() {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));

    function dfs(r, c, color) {
        if (r < 0 || r >= size || c < 0 || c >= size) return false;
        if (visited[r][c] || board[r][c] !== color) return false;
        visited[r][c] = true;

        if (color === 'black' && r === size - 1) return true;
        if (color === 'white' && c === size - 1) return true;

        const dirs = [[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0]];
        for (const [dr, dc] of dirs) {
            if (dfs(r + dr, c + dc, color)) return true;
        }
        return false;
    }

    if (color === 'black') {
        for (let c = 0; c < size; c++) {
            if (board[0][c] === 'black' && dfs(0, c, 'black')) return 'black';
        }
    } else {
        for (let r = 0; r < size; r++) {
            if (board[r][0] === 'white' && dfs(r, 0, 'white')) return 'white';
        }
    }
    return null;
}

function placeStone(r, c) {
    if (gameOver || board[r][c] || aiThinking) return false;
    if (aiEnabled && currentPlayer !== 'black') return false;

    board[r][c] = currentPlayer;
    moveCount++;

    const winner = checkWin(currentPlayer);
    if (winner) {
        gameOver = true;
        statusEl.innerHTML = '&#127942; ' + winner.charAt(0).toUpperCase() + winner.slice(1) + ' wins!';
        drawBoard();
        return true;
    }

    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    drawBoard();
    updateStatus();

    if (aiEnabled && !gameOver && currentPlayer === 'white') {
        setTimeout(aiMove, 300);
    }
    return true;
}

async function aiMove() {
    if (gameOver || aiThinking) return;
    aiThinking = true;
    statusEl.textContent = 'AI thinking...';

    try {
        const boardStr = boardToMohex();
        const resp = await fetch(AI_URL + '/api/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ board: boardStr || ' ', boardsize: size, player: 'white' }),
        });
        const data = await resp.json();
        if (data.success && data.move) {
            const col = data.move.charCodeAt(0) - 97;
            const row = parseInt(data.move.slice(1)) - 1;
            if (row >= 0 && row < size && col >= 0 && col < size && !board[row][col]) {
                board[row][col] = 'white';
                moveCount++;

                const winner = checkWin('white');
                if (winner) {
                    gameOver = true;
                    statusEl.innerHTML = '&#129302; AI (White) wins!';
                    drawBoard();
                    aiThinking = false;
                    return;
                }

                currentPlayer = 'black';
                drawBoard();
                updateStatus();
            }
        }
    } catch (e) {
        statusEl.textContent = 'AI error: ' + e.message + '. Click to place.';
    }
    aiThinking = false;
}

function drawBoard() {
    const W = canvas.width, H = canvas.height;
    const hexR = Math.min(W, H) / (size + 2) * 0.58;
    const spacingX = hexR * 1.5;
    const spacingY = hexR * Math.sqrt(3);
    const x0 = (W - (size - 1) * spacingX) / 2 - hexR * 0.5;
    const y0 = (H - (size - 1) * spacingY) / 2;

    ctx.clearRect(0, 0, W, H);

    function hexPath(cx, cy) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 6 + (Math.PI / 3) * i;
            const x = cx + hexR * Math.cos(angle);
            const y = cy + hexR * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    // Draw edges
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cx = x0 + c * spacingX + r * spacingX * 0.5;
            const cy = y0 + r * spacingY;
            hexPath(cx, cy);
            ctx.fillStyle = board[r][c] === 'black' ? '#222' : board[r][c] === 'white' ? '#fff' : '#1e3a5f';
            ctx.fill();
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // Top-bottom border (black): thick line above top row and below bottom row
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);
    // Top edge
    const tY = y0 - hexR * 0.9;
    ctx.beginPath();
    ctx.moveTo(x0 + hexR * 0.5, tY);
    ctx.lineTo(x0 + (size - 1) * spacingX + hexR * 0.5, tY);
    ctx.stroke();
    // Bottom edge
    const bY = y0 + (size - 1) * spacingY + hexR * 0.9;
    ctx.beginPath();
    ctx.moveTo(x0 + hexR * 0.5, bY);
    ctx.lineTo(x0 + (size - 1) * spacingX + hexR * 0.5, bY);
    ctx.stroke();
    // Left-right border (white): thick line left and right
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(x0 - hexR * 0.8, y0 + hexR * 0.2);
    ctx.lineTo(x0 + (size - 1) * spacingX * 0.5 - hexR * 0.2, y0 + (size - 1) * spacingY + hexR * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0 + (size - 1) * spacingX + hexR * 0.8, y0 + hexR * 0.2);
    ctx.lineTo(x0 + (size - 1) * spacingX * 0.5 + hexR * 0.2, y0 + (size - 1) * spacingY + hexR * 0.2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function updateStatus() {
    if (gameOver) return;
    if (aiEnabled && currentPlayer === 'white') {
        statusEl.innerHTML = '<span class="turn-indicator turn-white"></span>AI thinking...';
    } else {
        const cls = currentPlayer === 'black' ? 'turn-black' : 'turn-white';
        statusEl.innerHTML = '<span class="turn-indicator ' + cls + '"></span>' +
            currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + '\'s turn';
    }
}

canvas.addEventListener('click', function (e) {
    if (gameOver || aiThinking) return;
    if (aiEnabled && currentPlayer !== 'black') return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = mx * scaleX, py = my * scaleY;

    const hexR = Math.min(canvas.width, canvas.height) / (size + 2) * 0.58;
    const spacingX = hexR * 1.5;
    const spacingY = hexR * Math.sqrt(3);
    const x0 = (canvas.width - (size - 1) * spacingX) / 2 - hexR * 0.5;
    const y0 = (canvas.height - (size - 1) * spacingY) / 2;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cx = x0 + c * spacingX + r * spacingX * 0.5;
            const cy = y0 + r * spacingY;
            const dx = px - cx, dy = py - cy;
            if (dx * dx + dy * dy < hexR * hexR * 0.85) {
                placeStone(r, c);
                return;
            }
        }
    }
});

function resetGame() {
    size = parseInt(document.getElementById('sizeSelect').value);
    initBoard();
    drawBoard();
    updateStatus();
}

function toggleAI() {
    aiEnabled = !aiEnabled;
    document.getElementById('aiBtn').textContent = aiEnabled ? 'Play vs Human' : 'Play vs AI';
    document.getElementById('aiBtn').className = 'btn ' + (aiEnabled ? '' : 'secondary');
    if (aiEnabled && !gameOver && currentPlayer === 'white') {
        setTimeout(aiMove, 500);
    }
    updateStatus();
}

initBoard();
drawBoard();
