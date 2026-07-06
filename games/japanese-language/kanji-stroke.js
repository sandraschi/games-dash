// Kanji Stroke Order Game Implementation
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('strokeCanvas');
const ctx = canvas.getContext('2d');

let currentKanji = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Kanji database with stroke counts
const KANJI_DATABASE = [
    {kanji: '一', reading: 'いち (ichi)', meaning: 'One', strokes: 1},
    {kanji: '二', reading: 'に (ni)', meaning: 'Two', strokes: 2},
    {kanji: '三', reading: 'さん (san)', meaning: 'Three', strokes: 3},
    {kanji: '山', reading: 'やま (yama)', meaning: 'Mountain', strokes: 3},
    {kanji: '川', reading: 'かわ (kawa)', meaning: 'River', strokes: 3},
    {kanji: '木', reading: 'き (ki)', meaning: 'Tree', strokes: 4},
    {kanji: '日', reading: 'ひ (hi)', meaning: 'Sun/Day', strokes: 4},
    {kanji: '月', reading: 'つき (tsuki)', meaning: 'Moon/Month', strokes: 4},
    {kanji: '火', reading: 'ひ (hi)', meaning: 'Fire', strokes: 4},
    {kanji: '水', reading: 'みず (mizu)', meaning: 'Water', strokes: 4},
    {kanji: '金', reading: 'きん (kin)', meaning: 'Gold/Money', strokes: 8},
    {kanji: '土', reading: 'つち (tsuchi)', meaning: 'Earth/Soil', strokes: 3},
    {kanji: '人', reading: 'ひと (hito)', meaning: 'Person', strokes: 2},
    {kanji: '犬', reading: 'いぬ (inu)', meaning: 'Dog', strokes: 4},
    {kanji: '猫', reading: 'ねこ (neko)', meaning: 'Cat', strokes: 11},
    {kanji: '魚', reading: 'さかな (sakana)', meaning: 'Fish', strokes: 11},
    {kanji: '鳥', reading: 'とり (tori)', meaning: 'Bird', strokes: 11},
    {kanji: '花', reading: 'はな (hana)', meaning: 'Flower', strokes: 7}
];

function initKanjiList() {
    const listElement = document.getElementById('kanjiList');
    listElement.innerHTML = '';
    
    KANJI_DATABASE.forEach(kanji => {
        const btn = document.createElement('button');
        btn.className = 'kanji-btn';
        btn.textContent = kanji.kanji;
        btn.onclick = () => selectKanji(kanji);
        listElement.appendChild(btn);
    });
}

function selectKanji(kanji) {
    currentKanji = kanji;
    
    document.getElementById('referenceKanji').textContent = kanji.kanji;
    document.getElementById('kanjiReading').textContent = kanji.reading;
    document.getElementById('kanjiMeaning').textContent = kanji.meaning;
    document.getElementById('strokeCount').textContent = `Strokes: ${kanji.strokes}`;
    
    clearCanvas();
    
    // Highlight selected
    document.querySelectorAll('.kanji-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === kanji.kanji);
    });
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function showHint() {
    if (!currentKanji) return;
    
    // Draw reference kanji lightly on canvas
    ctx.save();
    ctx.font = '300px serif';
    ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentKanji.kanji, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

function nextKanji() {
    const currentIndex = KANJI_DATABASE.findIndex(k => k === currentKanji);
    const nextIndex = (currentIndex + 1) % KANJI_DATABASE.length;
    selectKanji(KANJI_DATABASE[nextIndex]);
}

// Drawing functionality
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

// Initialize
initKanjiList();
selectKanji(KANJI_DATABASE[0]);

