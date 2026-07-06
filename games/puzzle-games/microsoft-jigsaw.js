// Microsoft Jigsaw - Classic 2D image puzzle
// **Timestamp**: 2025-02-07

let size = 4;
let pieces = [];
let selected = null;
let correctCount = 0;

function drawSourceImage() {
    const c = document.getElementById('sourceImg');
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1a1a4a');
    grad.addColorStop(0.5, '#4a1a6a');
    grad.addColorStop(1, '#1a4a6a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#FFD700';
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PUZZLE', w/2, h/2 - 30);
    ctx.font = '40px Arial';
    ctx.fillText('Drag pieces to solve', w/2, h/2 + 50);
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${i * 18}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, 15 + Math.random() * 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createPieces() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    const pieceSize = Math.min(400 / size, 80);
    board.style.width = (pieceSize * size + 16) + 'px';
    board.style.height = (pieceSize * size + 16) + 'px';
    pieces = [];
    const order = [];
    for (let i = 0; i < size * size; i++) order.push(i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    const src = document.getElementById('sourceImg');
    const dataUrl = src.toDataURL();
    for (let i = 0; i < size * size; i++) {
        const div = document.createElement('div');
        div.className = 'jigsaw-piece';
        div.style.width = pieceSize + 'px';
        div.style.height = pieceSize + 'px';
        const row = Math.floor(order[i] / size);
        const col = order[i] % size;
        const bgX = (col / (size - 1)) * 100;
        const bgY = (row / (size - 1)) * 100;
        div.style.backgroundImage = `url(${dataUrl})`;
        div.style.backgroundPosition = `${bgX}% ${bgY}%`;
        div.style.backgroundSize = (size * 100) + '% ' + (size * 100) + '%';
        div.dataset.current = order[i];
        div.dataset.correct = i;
        div.addEventListener('click', function() { handleClick(this); });
        board.appendChild(div);
        pieces.push(div);
    }
    correctCount = 0;
    updateProgress();
}

function handleClick(div) {
    if (div.classList.contains('correct')) return;
    if (!selected) {
        selected = div;
        div.style.boxShadow = '0 0 10px #FFD700';
        return;
    }
    if (selected === div) {
        selected.style.boxShadow = '';
        selected = null;
        return;
    }
    const a = parseInt(selected.dataset.current);
    const b = parseInt(div.dataset.current);
    selected.dataset.current = b;
    div.dataset.current = a;
    const rowA = Math.floor(a / size), colA = a % size;
    const rowB = Math.floor(b / size), colB = b % size;
    const pieceSize = 400 / size;
    const updateBg = (el, r, c) => {
        const bgX = size > 1 ? (c / (size - 1)) * 100 : 0;
        const bgY = size > 1 ? (r / (size - 1)) * 100 : 0;
        el.style.backgroundPosition = `${bgX}% ${bgY}%`;
    };
    updateBg(selected, rowB, colB);
    updateBg(div, rowA, colA);
    selected.classList.remove('correct');
    div.classList.remove('correct');
    if (parseInt(selected.dataset.current) === parseInt(selected.dataset.correct)) selected.classList.add('correct');
    if (parseInt(div.dataset.current) === parseInt(div.dataset.correct)) div.classList.add('correct');
    selected.style.boxShadow = '';
    selected = null;
    correctCount = pieces.filter(p => p.classList.contains('correct')).length;
    updateProgress();
}

function updateProgress() {
    const el = document.getElementById('progress');
    if (el) el.textContent = correctCount + ' / ' + (size * size) + ' correct';
}

function setSize(s) {
    size = s;
    document.querySelectorAll('.diff-btn[data-size]').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.size) === size);
    });
    createPieces();
}

document.getElementById('shuffleBtn').onclick = () => createPieces();
document.getElementById('hintBtn').onclick = () => {
    const wrong = pieces.filter(p => !p.classList.contains('correct'));
    if (wrong.length > 0) wrong[0].style.animation = 'pulse 0.5s ease 3';
    setTimeout(() => { if (wrong[0]) wrong[0].style.animation = ''; }, 1600);
};

document.querySelectorAll('.diff-btn[data-size]').forEach(b => {
    b.onclick = () => setSize(parseInt(b.dataset.size));
});

document.addEventListener('DOMContentLoaded', () => {
    drawSourceImage();
    createPieces();
});
