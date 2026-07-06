// Jigsaw — drag-and-drop puzzle with wavy-edged pieces
let size = 4;
let pieces = [];
let dragPiece = null;
let dragOffX = 0, dragOffY = 0;
let completed = false;

const canvas = document.getElementById('jigsawCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('progress');

function drawSourceImage() {
    const c = document.createElement('canvas');
    c.width = 400; c.height = 400;
    const cx = c.getContext('2d');
    const grad = cx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#1a1a4a'); grad.addColorStop(0.5, '#4a1a6a'); grad.addColorStop(1, '#1a4a6a');
    cx.fillStyle = grad; cx.fillRect(0, 0, 400, 400);
    cx.fillStyle = '#FFD700'; cx.font = '80px Arial'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillText('JIGSAW', 200, 160);
    cx.font = '24px Arial'; cx.fillStyle = '#fff'; cx.fillText('Drag pieces together', 200, 240);
    for (let i = 0; i < 30; i++) {
        cx.fillStyle = `hsl(${i*12}, 70%, 60%)`;
        cx.beginPath(); cx.arc(Math.random()*400, Math.random()*400, 8+Math.random()*20, 0, Math.PI*2); cx.fill();
    }
    return c;
}

function createPieces() {
    const img = drawSourceImage();
    const pw = 400 / size, ph = 400 / size;
    pieces = [];
    completed = false;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const offX = (Math.random() - 0.5) * 300 + 50;
            const offY = (Math.random() - 0.5) * 300 + 50;
            pieces.push({
                row: r, col: c,
                x: 50 + c * pw + offX, y: 50 + r * ph + offY,
                correctX: 20 + c * (380 / size), correctY: 20 + r * (380 / size),
                pw, ph, img,
                tabSize: 8 + Math.random() * 6,
            });
        }
    }
    shuffleArray(pieces);
    draw();
    updateStatus();
}

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
}

function tabOffset(t, phase) {
    return Math.sin(t * Math.PI * 2 + phase) * 6;
}

function drawPiece(p, dx, dy) {
    const {row, col, pw, ph, tabSize, img} = p;
    const x = (dx || p.x), y = (dy || p.y);
    const ts = tabSize;
    const t = ts * 0.5;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Top edge
    const hasTopTab = row > 0;
    if (hasTopTab) {
        ctx.lineTo(x + pw * 0.3, y);
        ctx.quadraticCurveTo(x + pw * 0.3 + t, y - ts, x + pw * 0.5, y - ts);
        ctx.quadraticCurveTo(x + pw * 0.7 - t, y - ts, x + pw * 0.7, y);
    }
    ctx.lineTo(x + pw, y);

    // Right edge
    const hasRightTab = col < size - 1;
    if (hasRightTab) {
        ctx.lineTo(x + pw, y + ph * 0.3);
        ctx.quadraticCurveTo(x + pw + ts, y + ph * 0.3 + t, x + pw + ts, y + ph * 0.5);
        ctx.quadraticCurveTo(x + pw + ts, y + ph * 0.7 - t, x + pw, y + ph * 0.7);
    }
    ctx.lineTo(x + pw, y + ph);

    // Bottom edge
    const hasBottomTab = row < size - 1;
    if (hasBottomTab) {
        ctx.lineTo(x + pw * 0.7, y + ph);
        ctx.quadraticCurveTo(x + pw * 0.7 - t, y + ph + ts, x + pw * 0.5, y + ph + ts);
        ctx.quadraticCurveTo(x + pw * 0.3 + t, y + ph + ts, x + pw * 0.3, y + ph);
    }
    ctx.lineTo(x, y + ph);

    // Left edge
    const hasLeftTab = col > 0;
    if (hasLeftTab) {
        ctx.lineTo(x, y + ph * 0.7);
        ctx.quadraticCurveTo(x - ts, y + ph * 0.7 - t, x - ts, y + ph * 0.5);
        ctx.quadraticCurveTo(x - ts, y + ph * 0.3 + t, x, y + ph * 0.3);
    }
    ctx.closePath();
    ctx.clip();

    // Draw image portion
    const sx = col * 400 / size, sy = row * 400 / size;
    const sw = 400 / size, sh = 400 / size;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, pw, ph);

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a2a4a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pieces in order (drag piece on top)
    const drawOrder = pieces.filter(p => p !== dragPiece);
    if (dragPiece) drawOrder.push(dragPiece);
    for (const p of drawOrder) {
        drawPiece(p);
    }
    updateStatus();
}

function updateStatus() {
    if (!statusEl) return;
    const correct = pieces.filter(p => {
        const dx = Math.abs(p.x - p.correctX);
        const dy = Math.abs(p.y - p.correctY);
        return dx < 10 && dy < 10;
    }).length;
    statusEl.textContent = correct + ' / ' + pieces.length + ' correct';
    if (correct === pieces.length && !completed) {
        completed = true;
        setTimeout(() => alert('Puzzle solved!'), 300);
    }
}

function snapPieces() {
    for (const p of pieces) {
        if (Math.abs(p.x - p.correctX) < 15 && Math.abs(p.y - p.correctY) < 15) {
            p.x = p.correctX; p.y = p.correctY;
        }
    }
}

// Mouse/touch handlers
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
    const cy = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
    return { x: cx * scaleX, y: cy * scaleY };
}

function findPiece(x, y) {
    // Check in reverse order (top pieces first)
    for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (x >= p.x && x <= p.x + p.pw && y >= p.y && y <= p.y + p.ph) return i;
    }
    return -1;
}

canvas.addEventListener('mousedown', (e) => {
    const pos = getPos(e);
    const idx = findPiece(pos.x, pos.y);
    if (idx >= 0) {
        dragPiece = pieces[idx];
        dragOffX = pos.x - dragPiece.x;
        dragOffY = pos.y - dragPiece.y;
        // Move to top
        pieces.splice(idx, 1);
        pieces.push(dragPiece);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragPiece) return;
    const pos = getPos(e);
    dragPiece.x = pos.x - dragOffX;
    dragPiece.y = pos.y - dragOffY;
    draw();
});

canvas.addEventListener('mouseup', () => {
    if (dragPiece) {
        snapPieces();
        dragPiece = null;
        draw();
    }
});

canvas.addEventListener('mouseleave', () => {
    if (dragPiece) {
        snapPieces();
        dragPiece = null;
        draw();
    }
});

// Touch support
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); const ev = {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}; const pos = getPos(ev); const idx = findPiece(pos.x, pos.y); if(idx>=0){dragPiece=pieces[idx];dragOffX=pos.x-dragPiece.x;dragOffY=pos.y-dragPiece.y;pieces.splice(idx,1);pieces.push(dragPiece);} }, {passive:false});
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if(!dragPiece)return; const pos = getPos(e); dragPiece.x=pos.x-dragOffX; dragPiece.y=pos.y-dragOffY; draw(); }, {passive:false});
canvas.addEventListener('touchend', (e) => { if(dragPiece){snapPieces();dragPiece=null;draw();} });

function setSize(s) {
    size = s;
    document.querySelectorAll('.diff-btn[data-size]').forEach(b => b.classList.toggle('active', parseInt(b.dataset.size) === size));
    createPieces();
}

document.getElementById('shuffleBtn').onclick = () => createPieces();
document.getElementById('hintBtn').onclick = () => {
    const wrong = pieces.filter(p => Math.abs(p.x - p.correctX) >= 10 || Math.abs(p.y - p.correctY) >= 10);
    if (wrong.length > 0) {
        wrong[0].x = wrong[0].correctX; wrong[0].y = wrong[0].correctY;
        draw();
    }
};

document.querySelectorAll('.diff-btn[data-size]').forEach(b => {
    b.onclick = () => setSize(parseInt(b.dataset.size));
});

document.addEventListener('DOMContentLoaded', () => { createPieces(); });
