// Mahjong Solitaire - Microsoft-style tile matching
// **Timestamp**: 2025-02-07

const TILE_W = 42;
const TILE_H = 52;
const TILE_OVERLAP_X = 22;
const TILE_OVERLAP_Y = 26;

// Mahjong tile symbols (Unicode Mahjong range + generic symbols for broad support)
const TILE_SYMBOLS = [
    '\u{1F007}', '\u{1F008}', '\u{1F009}', '\u{1F00A}', '\u{1F00B}', '\u{1F00C}',
    '\u{1F010}', '\u{1F011}', '\u{1F012}', '\u{1F013}', '\u{1F014}', '\u{1F015}',
    '\u{1F019}', '\u{1F01A}', '\u{1F01B}', '\u{1F01C}', '\u{1F01D}', '\u{1F01E}',
    '\u{1F020}', '\u{1F021}', '\u{1F022}', '\u{1F023}', '\u{1F024}', '\u{1F025}',
    '\u{1F000}', '\u{1F001}', '\u{1F002}', '\u{1F003}', '\u{1F004}', '\u{1F005}',
    '\u{2660}', '\u{2665}', '\u{2666}', '\u{2663}', '\u{2734}', '\u{2728}'
];

// Classical turtle layout: 144 tiles, 4 layers
// Shape: head, shell, tail (centered in 8-col grid)
function buildLayout() {
    const positions = [];
    const centerRow = (layer, row, count, maxCol = 8) => {
        const start = Math.floor((maxCol - count) / 2);
        for (let c = 0; c < count; c++) {
            positions.push({ row, col: start + c, layer });
        }
    };
    // Layer 0: 48 tiles - head, shell, tail (classic pyramid)
    centerRow(0, 0, 2);
    centerRow(0, 1, 4);
    centerRow(0, 2, 6);
    centerRow(0, 3, 8);
    centerRow(0, 4, 8);
    centerRow(0, 5, 8);
    centerRow(0, 6, 6);
    centerRow(0, 7, 4);
    centerRow(0, 8, 2);
    // Layer 1: 36 tiles
    centerRow(1, 1, 4);
    centerRow(1, 2, 6);
    centerRow(1, 3, 8);
    centerRow(1, 4, 8);
    centerRow(1, 5, 8);
    centerRow(1, 6, 6);
    centerRow(1, 7, 4);
    // Layer 2: 36 tiles
    centerRow(2, 2, 6);
    centerRow(2, 3, 8);
    centerRow(2, 4, 8);
    centerRow(2, 5, 8);
    centerRow(2, 6, 6);
    // Layer 3: 24 tiles
    centerRow(3, 3, 4);
    centerRow(3, 4, 8);
    centerRow(3, 5, 8);
    centerRow(3, 6, 4);
    return positions;
}

let tiles = [];
let selected = null;
let undoStack = [];
let layout = [];

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function buildTileSet() {
    const deck = [];
    for (let t = 0; t < TILE_SYMBOLS.length; t++) {
        for (let i = 0; i < 4; i++) {
            deck.push({ type: t, symbol: TILE_SYMBOLS[t] });
        }
    }
    return shuffleArray(deck);
}

function getTileAt(row, col, layer) {
    return tiles.find(t => t.row === row && t.col === col && t.layer === layer && !t.matched);
}

function hasTileAt(row, col, layer) {
    return !!getTileAt(row, col, layer);
}

function isFree(tile) {
    if (tile.matched) return false;
    const { row, col, layer } = tile;
    const onTop = hasTileAt(row, col, layer + 1);
    if (onTop) return false;
    const left = hasTileAt(row, col - 1, layer);
    const right = hasTileAt(row, col + 1, layer);
    return !left || !right;
}

function pixelPos(row, col, layer) {
    const x = col * TILE_OVERLAP_X - layer * 2;
    const y = row * TILE_OVERLAP_Y + layer * 3;
    return { x, y };
}

function createBoard() {
    layout = buildLayout();
    const deck = buildTileSet();
    tiles = layout.map((pos, i) => ({
        ...pos,
        type: deck[i].type,
        symbol: deck[i].symbol,
        matched: false,
        id: i
    }));
}

function render() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const maxX = layout.reduce((m, p) => {
        const pos = pixelPos(p.row, p.col, p.layer);
        return Math.max(m, pos.x + TILE_W);
    }, 0);
    const maxY = layout.reduce((m, p) => {
        const pos = pixelPos(p.row, p.col, p.layer);
        return Math.max(m, pos.y + TILE_H);
    }, 0);
    board.style.width = maxX + 20 + 'px';
    board.style.height = maxY + 20 + 'px';
    tiles.filter(t => !t.matched).forEach(t => {
        const el = document.createElement('div');
        el.className = 'tile';
        const free = isFree(t);
        if (free) el.classList.add('free');
        else el.classList.add('blocked');
        if (selected && selected.id === t.id) el.classList.add('selected');
        const pos = pixelPos(t.row, t.col, t.layer);
        el.style.left = (pos.x + 10) + 'px';
        el.style.top = (pos.y + 10) + 'px';
        el.textContent = t.symbol;
        el.dataset.id = t.id;
        el.onclick = () => handleClick(t);
        board.appendChild(el);
    });
    document.getElementById('tilesLeft').textContent = tiles.filter(t => !t.matched).length;
}

function handleClick(tile) {
    if (tile.matched || !isFree(tile)) return;
    if (!selected) {
        selected = tile;
        render();
        const el = document.querySelector(`[data-id="${tile.id}"]`);
        if (el) el.classList.add('selected');
        return;
    }
    if (selected.id === tile.id) {
        selected = null;
        render();
        return;
    }
    if (selected.type === tile.type) {
        undoStack.push([selected.id, tile.id]);
        selected.matched = true;
        tile.matched = true;
        selected = null;
        render();
        const left = tiles.filter(t => !t.matched).length;
        if (left === 0) {
            document.getElementById('winOverlay').classList.add('show');
        }
    } else {
        selected = null;
        render();
    }
}

function newGame() {
    createBoard();
    undoStack = [];
    selected = null;
    render();
}

function undo() {
    if (undoStack.length === 0) return;
    const [a, b] = undoStack.pop();
    const t1 = tiles.find(t => t.id === a);
    const t2 = tiles.find(t => t.id === b);
    if (t1 && t2) {
        t1.matched = false;
        t2.matched = false;
        selected = null;
        render();
    }
}

function hint() {
    const freeTiles = tiles.filter(t => !t.matched && isFree(t));
    for (let i = 0; i < freeTiles.length; i++) {
        for (let j = i + 1; j < freeTiles.length; j++) {
            if (freeTiles[i].type === freeTiles[j].type) {
                const a = freeTiles[i];
                const b = freeTiles[j];
                selected = a;
                render();
                const elA = document.querySelector(`[data-id="${a.id}"]`);
                const elB = document.querySelector(`[data-id="${b.id}"]`);
                if (elA) elA.style.boxShadow = '0 0 15px #00ff00';
                if (elB) elB.style.boxShadow = '0 0 15px #00ff00';
                setTimeout(() => {
                    selected = null;
                    render();
                }, 800);
                return;
            }
        }
    }
}

document.getElementById('newBtn').onclick = newGame;
document.getElementById('hintBtn').onclick = hint;
document.getElementById('undoBtn').onclick = undo;

document.addEventListener('DOMContentLoaded', newGame);
