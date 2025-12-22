// Hiragana & Katakana Learning Game
// Comprehensive Japanese script learning for all levels

// Kana character data
const hiraganaData = {
    // Basic vowels
    'あ': { romaji: 'a', type: 'vowel' },
    'い': { romaji: 'i', type: 'vowel' },
    'う': { romaji: 'u', type: 'vowel' },
    'え': { romaji: 'e', type: 'vowel' },
    'お': { romaji: 'o', type: 'vowel' },

    // K sounds
    'か': { romaji: 'ka', type: 'consonant' },
    'き': { romaji: 'ki', type: 'consonant' },
    'く': { romaji: 'ku', type: 'consonant' },
    'け': { romaji: 'ke', type: 'consonant' },
    'こ': { romaji: 'ko', type: 'consonant' },

    // S sounds
    'さ': { romaji: 'sa', type: 'consonant' },
    'し': { romaji: 'shi', type: 'consonant' },
    'す': { romaji: 'su', type: 'consonant' },
    'せ': { romaji: 'se', type: 'consonant' },
    'そ': { romaji: 'so', type: 'consonant' },

    // T sounds
    'た': { romaji: 'ta', type: 'consonant' },
    'ち': { romaji: 'chi', type: 'consonant' },
    'つ': { romaji: 'tsu', type: 'consonant' },
    'て': { romaji: 'te', type: 'consonant' },
    'と': { romaji: 'to', type: 'consonant' },

    // N sounds
    'な': { romaji: 'na', type: 'consonant' },
    'に': { romaji: 'ni', type: 'consonant' },
    'ぬ': { romaji: 'nu', type: 'consonant' },
    'ね': { romaji: 'ne', type: 'consonant' },
    'の': { romaji: 'no', type: 'consonant' },

    // H sounds
    'は': { romaji: 'ha', type: 'consonant' },
    'ひ': { romaji: 'hi', type: 'consonant' },
    'ふ': { romaji: 'fu', type: 'consonant' },
    'へ': { romaji: 'he', type: 'consonant' },
    'ほ': { romaji: 'ho', type: 'consonant' },

    // M sounds
    'ま': { romaji: 'ma', type: 'consonant' },
    'み': { romaji: 'mi', type: 'consonant' },
    'む': { romaji: 'mu', type: 'consonant' },
    'め': { romaji: 'me', type: 'consonant' },
    'も': { romaji: 'mo', type: 'consonant' },

    // Y sounds
    'や': { romaji: 'ya', type: 'consonant' },
    'ゆ': { romaji: 'yu', type: 'consonant' },
    'よ': { romaji: 'yo', type: 'consonant' },

    // R sounds
    'ら': { romaji: 'ra', type: 'consonant' },
    'り': { romaji: 'ri', type: 'consonant' },
    'る': { romaji: 'ru', type: 'consonant' },
    'れ': { romaji: 're', type: 'consonant' },
    'ろ': { romaji: 'ro', type: 'consonant' },

    // W sounds + N
    'わ': { romaji: 'wa', type: 'consonant' },
    'を': { romaji: 'wo', type: 'consonant' },
    'ん': { romaji: 'n', type: 'consonant' },

    // Dakuten (voiced) versions
    'が': { romaji: 'ga', type: 'voiced' },
    'ぎ': { romaji: 'gi', type: 'voiced' },
    'ぐ': { romaji: 'gu', type: 'voiced' },
    'げ': { romaji: 'ge', type: 'voiced' },
    'ご': { romaji: 'go', type: 'voiced' },

    'ざ': { romaji: 'za', type: 'voiced' },
    'じ': { romaji: 'ji', type: 'voiced' },
    'ず': { romaji: 'zu', type: 'voiced' },
    'ぜ': { romaji: 'ze', type: 'voiced' },
    'ぞ': { romaji: 'zo', type: 'voiced' },

    'だ': { romaji: 'da', type: 'voiced' },
    'ぢ': { romaji: 'ji', type: 'voiced' },
    'づ': { romaji: 'zu', type: 'voiced' },
    'で': { romaji: 'de', type: 'voiced' },
    'ど': { romaji: 'do', type: 'voiced' },

    'ば': { romaji: 'ba', type: 'voiced' },
    'び': { romaji: 'bi', type: 'voiced' },
    'ぶ': { romaji: 'bu', type: 'voiced' },
    'べ': { romaji: 'be', type: 'voiced' },
    'ぼ': { romaji: 'bo', type: 'voiced' },

    // Handakuten (half-voiced) versions
    'ぱ': { romaji: 'pa', type: 'half-voiced' },
    'ぴ': { romaji: 'pi', type: 'half-voiced' },
    'ぷ': { romaji: 'pu', type: 'half-voiced' },
    'ぺ': { romaji: 'pe', type: 'half-voiced' },
    'ぽ': { romaji: 'po', type: 'half-voiced' },

    // Youon (contracted sounds)
    'きゃ': { romaji: 'kya', type: 'contracted' },
    'きゅ': { romaji: 'kyu', type: 'contracted' },
    'きょ': { romaji: 'kyo', type: 'contracted' },
    'しゃ': { romaji: 'sha', type: 'contracted' },
    'しゅ': { romaji: 'shu', type: 'contracted' },
    'しょ': { romaji: 'sho', type: 'contracted' },
    'ちゃ': { romaji: 'cha', type: 'contracted' },
    'ちゅ': { romaji: 'chu', type: 'contracted' },
    'ちょ': { romaji: 'cho', type: 'contracted' },
    'にゃ': { romaji: 'nya', type: 'contracted' },
    'にゅ': { romaji: 'nyu', type: 'contracted' },
    'にょ': { romaji: 'nyo', type: 'contracted' },
    'ひゃ': { romaji: 'hya', type: 'contracted' },
    'ひゅ': { romaji: 'hyu', type: 'contracted' },
    'ひょ': { romaji: 'hyo', type: 'contracted' },
    'みゃ': { romaji: 'mya', type: 'contracted' },
    'みゅ': { romaji: 'myu', type: 'contracted' },
    'みょ': { romaji: 'myo', type: 'contracted' },
    'りゃ': { romaji: 'rya', type: 'contracted' },
    'りゅ': { romaji: 'ryu', type: 'contracted' },
    'りょ': { romaji: 'ryo', type: 'contracted' }
};

const katakanaData = {
    // Basic vowels
    'ア': { romaji: 'a', type: 'vowel' },
    'イ': { romaji: 'i', type: 'vowel' },
    'ウ': { romaji: 'u', type: 'vowel' },
    'エ': { romaji: 'e', type: 'vowel' },
    'オ': { romaji: 'o', type: 'vowel' },

    // K sounds
    'カ': { romaji: 'ka', type: 'consonant' },
    'キ': { romaji: 'ki', type: 'consonant' },
    'ク': { romaji: 'ku', type: 'consonant' },
    'ケ': { romaji: 'ke', type: 'consonant' },
    'コ': { romaji: 'ko', type: 'consonant' },

    // S sounds
    'サ': { romaji: 'sa', type: 'consonant' },
    'シ': { romaji: 'shi', type: 'consonant' },
    'ス': { romaji: 'su', type: 'consonant' },
    'セ': { romaji: 'se', type: 'consonant' },
    'ソ': { romaji: 'so', type: 'consonant' },

    // T sounds
    'タ': { romaji: 'ta', type: 'consonant' },
    'チ': { romaji: 'chi', type: 'consonant' },
    'ツ': { romaji: 'tsu', type: 'consonant' },
    'テ': { romaji: 'te', type: 'consonant' },
    'ト': { romaji: 'to', type: 'consonant' },

    // N sounds
    'ナ': { romaji: 'na', type: 'consonant' },
    'ニ': { romaji: 'ni', type: 'consonant' },
    'ヌ': { romaji: 'nu', type: 'consonant' },
    'ネ': { romaji: 'ne', type: 'consonant' },
    'ノ': { romaji: 'no', type: 'consonant' },

    // H sounds
    'ハ': { romaji: 'ha', type: 'consonant' },
    'ヒ': { romaji: 'hi', type: 'consonant' },
    'フ': { romaji: 'fu', type: 'consonant' },
    'ヘ': { romaji: 'he', type: 'consonant' },
    'ホ': { romaji: 'ho', type: 'consonant' },

    // M sounds
    'マ': { romaji: 'ma', type: 'consonant' },
    'ミ': { romaji: 'mi', type: 'consonant' },
    'ム': { romaji: 'mu', type: 'consonant' },
    'メ': { romaji: 'me', type: 'consonant' },
    'モ': { romaji: 'mo', type: 'consonant' },

    // Y sounds
    'ヤ': { romaji: 'ya', type: 'consonant' },
    'ユ': { romaji: 'yu', type: 'consonant' },
    'ヨ': { romaji: 'yo', type: 'consonant' },

    // R sounds
    'ラ': { romaji: 'ra', type: 'consonant' },
    'リ': { romaji: 'ri', type: 'consonant' },
    'ル': { romaji: 'ru', type: 'consonant' },
    'レ': { romaji: 're', type: 'consonant' },
    'ロ': { romaji: 'ro', type: 'consonant' },

    // W sounds + N
    'ワ': { romaji: 'wa', type: 'consonant' },
    'ヲ': { romaji: 'wo', type: 'consonant' },
    'ン': { romaji: 'n', type: 'consonant' },

    // Dakuten (voiced) versions
    'ガ': { romaji: 'ga', type: 'voiced' },
    'ギ': { romaji: 'gi', type: 'voiced' },
    'グ': { romaji: 'gu', type: 'voiced' },
    'ゲ': { romaji: 'ge', type: 'voiced' },
    'ゴ': { romaji: 'go', type: 'voiced' },

    'ザ': { romaji: 'za', type: 'voiced' },
    'ジ': { romaji: 'ji', type: 'voiced' },
    'ズ': { romaji: 'zu', type: 'voiced' },
    'ゼ': { romaji: 'ze', type: 'voiced' },
    'ゾ': { romaji: 'zo', type: 'voiced' },

    'ダ': { romaji: 'da', type: 'voiced' },
    'ヂ': { romaji: 'ji', type: 'voiced' },
    'ヅ': { romaji: 'zu', type: 'voiced' },
    'デ': { romaji: 'de', type: 'voiced' },
    'ド': { romaji: 'do', type: 'voiced' },

    'バ': { romaji: 'ba', type: 'voiced' },
    'ビ': { romaji: 'bi', type: 'voiced' },
    'ブ': { romaji: 'bu', type: 'voiced' },
    'ベ': { romaji: 'be', type: 'voiced' },
    'ボ': { romaji: 'bo', type: 'voiced' },

    // Handakuten (half-voiced) versions
    'パ': { romaji: 'pa', type: 'half-voiced' },
    'ピ': { romaji: 'pi', type: 'half-voiced' },
    'プ': { romaji: 'pu', type: 'half-voiced' },
    'ペ': { romaji: 'pe', type: 'half-voiced' },
    'ポ': { romaji: 'po', type: 'half-voiced' },

    // Youon (contracted sounds)
    'キャ': { romaji: 'kya', type: 'contracted' },
    'キュ': { romaji: 'kyu', type: 'contracted' },
    'キョ': { romaji: 'kyo', type: 'contracted' },
    'シャ': { romaji: 'sha', type: 'contracted' },
    'シュ': { romaji: 'shu', type: 'contracted' },
    'ショ': { romaji: 'sho', type: 'contracted' },
    'チャ': { romaji: 'cha', type: 'contracted' },
    'チュ': { romaji: 'chu', type: 'contracted' },
    'チョ': { romaji: 'cho', type: 'contracted' },
    'ニャ': { romaji: 'nya', type: 'contracted' },
    'ニュ': { romaji: 'nyu', type: 'contracted' },
    'ニョ': { romaji: 'nyo', type: 'contracted' },
    'ヒャ': { romaji: 'hya', type: 'contracted' },
    'ヒュ': { romaji: 'hyu', type: 'contracted' },
    'ヒョ': { romaji: 'hyo', type: 'contracted' },
    'ミャ': { romaji: 'mya', type: 'contracted' },
    'ミュ': { romaji: 'myu', type: 'contracted' },
    'ミョ': { romaji: 'myo', type: 'contracted' },
    'リャ': { romaji: 'rya', type: 'contracted' },
    'リュ': { romaji: 'ryu', type: 'contracted' },
    'リョ': { romaji: 'ryo', type: 'contracted' }
};

// Game state
let currentMode = 'hiragana';
let currentKanaList = [];
let currentIndex = 0;
let score = 0;
let totalAttempts = 0;
let correctAnswers = 0;
let practiceMode = 'recognition';

// Stroke order data for writing practice
const strokeOrders = {
    'あ': [1, 2, 3, 4],
    'い': [1, 2],
    'う': [1, 2, 3],
    'え': [1, 2, 3, 4],
    'お': [1, 2, 3, 4, 5],
    'ア': [1, 2],
    'イ': [1],
    'ウ': [1, 2],
    'エ': [1, 2, 3],
    'オ': [1, 2, 3, 4]
};

let currentStroke = 0;
let canvas, ctx;

function initializeGame() {
    setMode('hiragana');
    updateDisplay();
}

function setMode(mode) {
    currentMode = mode;

    // Update button states
    document.querySelectorAll('.mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Set kana list based on mode
    switch(mode) {
        case 'hiragana':
            currentKanaList = Object.keys(hiraganaData);
            practiceMode = 'recognition';
            break;
        case 'katakana':
            currentKanaList = Object.keys(katakanaData);
            practiceMode = 'recognition';
            break;
        case 'recognition':
            currentKanaList = Object.keys(currentMode === 'hiragana' ? hiraganaData : katakanaData);
            practiceMode = 'recognition';
            break;
        case 'writing':
            currentKanaList = Object.keys(currentMode === 'hiragana' ? hiraganaData : katakanaData);
            practiceMode = 'writing';
            initializeWritingCanvas();
            break;
        case 'mixed':
            const hiraganaKeys = Object.keys(hiraganaData);
            const katakanaKeys = Object.keys(katakanaData);
            currentKanaList = [...hiraganaKeys, ...katakanaKeys];
            practiceMode = 'recognition';
            break;
    }

    shuffleKana();
    updateDisplay();
    updateModeVisibility();
}

function updateModeVisibility() {
    document.getElementById('recognitionMode').style.display =
        practiceMode === 'recognition' ? 'block' : 'none';
    document.getElementById('writingMode').style.display =
        practiceMode === 'writing' ? 'block' : 'none';

    if (practiceMode === 'recognition') {
        generateAnswerOptions();
    }
}

function updateDisplay() {
    if (currentKanaList.length === 0) return;

    const currentKana = currentKanaList[currentIndex];
    const kanaData = currentMode === 'katakana' && katakanaData[currentKana] ?
        katakanaData[currentKana] : hiraganaData[currentKana] || katakanaData[currentKana];

    document.getElementById('currentKana').textContent = currentKana;
    document.getElementById('romaji').textContent = kanaData ? kanaData.romaji : 'unknown';
    document.getElementById('kanaType').textContent = getKanaType(currentKana);

    updateProgress();
}

function getKanaType(kana) {
    const data = hiraganaData[kana] || katakanaData[kana];
    if (!data) return 'Unknown';

    const script = hiraganaData[kana] ? 'Hiragana' : 'Katakana';
    const type = data.type.charAt(0).toUpperCase() + data.type.slice(1);
    return `${script} - ${type}`;
}

function updateProgress() {
    const progressInfo = document.getElementById('progressInfo');
    const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 0;

    progressInfo.innerHTML = `
        <div class="score-display">Score: ${score}</div>
        <div>Progress: ${currentIndex + 1}/${currentKanaList.length}</div>
        <div>Accuracy: ${accuracy}% (${correctAnswers}/${totalAttempts})</div>
        <span class="level-indicator">${getLevel()}</span>
    `;
}

function getLevel() {
    const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) : 0;
    if (accuracy >= 0.9) return 'Expert';
    if (accuracy >= 0.7) return 'Advanced';
    if (accuracy >= 0.5) return 'Intermediate';
    return 'Beginner';
}

function nextKana() {
    currentIndex = (currentIndex + 1) % currentKanaList.length;
    updateDisplay();
    if (practiceMode === 'recognition') {
        generateAnswerOptions();
    }
}

function previousKana() {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : currentKanaList.length - 1;
    updateDisplay();
    if (practiceMode === 'recognition') {
        generateAnswerOptions();
    }
}

function shuffleKana() {
    for (let i = currentKanaList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentKanaList[i], currentKanaList[j]] = [currentKanaList[j], currentKanaList[i]];
    }
    currentIndex = 0;
    updateDisplay();
}

function resetProgress() {
    score = 0;
    totalAttempts = 0;
    correctAnswers = 0;
    updateProgress();
    document.getElementById('status').textContent = 'Progress reset! Keep practicing!';
}

function generateAnswerOptions() {
    const currentKana = currentKanaList[currentIndex];
    const correctRomaji = getRomaji(currentKana);

    // Get 3 wrong answers
    const allRomaji = Object.values(currentMode === 'katakana' ? katakanaData : hiraganaData)
        .map(data => data.romaji)
        .filter(romaji => romaji !== correctRomaji);

    const wrongAnswers = [];
    while (wrongAnswers.length < 3 && allRomaji.length > 0) {
        const randomIndex = Math.floor(Math.random() * allRomaji.length);
        const wrongAnswer = allRomaji.splice(randomIndex, 1)[0];
        if (!wrongAnswers.includes(wrongAnswer)) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    // Combine and shuffle answers
    const allAnswers = [correctRomaji, ...wrongAnswers];
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    // Create answer buttons
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';

    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-button';
        button.textContent = answer;
        button.onclick = () => checkAnswer(answer, correctRomaji, button);
        answerOptions.appendChild(button);
    });
}

function checkAnswer(selectedAnswer, correctAnswer, button) {
    totalAttempts++;

    if (selectedAnswer === correctAnswer) {
        correctAnswers++;
        score += 10;
        button.classList.add('correct');
        document.getElementById('status').textContent = 'Correct! 🎉';

        setTimeout(() => {
            nextKana();
        }, 1000);
    } else {
        score = Math.max(0, score - 5);
        button.classList.add('incorrect');
        document.getElementById('status').textContent = `Incorrect. The correct answer is "${correctAnswer}"`;

        // Highlight correct answer
        const buttons = document.querySelectorAll('.answer-button');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        setTimeout(() => {
            generateAnswerOptions();
        }, 2000);
    }

    updateProgress();
}

function getRomaji(kana) {
    return (hiraganaData[kana] || katakanaData[kana] || {}).romaji || 'unknown';
}

function initializeWritingCanvas() {
    canvas = document.getElementById('writingCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    clearCanvas();

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw guide lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 8;

    currentStroke = 0;
    updateStrokeDisplay();
}

let isDrawing = false;

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        currentStroke++;
        updateStrokeDisplay();
    }
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (e.type === 'touchstart') {
        startDrawing({ offsetX: x, offsetY: y });
    } else if (e.type === 'touchmove') {
        draw({ offsetX: x, offsetY: y });
    }
}

function updateStrokeDisplay() {
    const currentKana = currentKanaList[currentIndex];
    const strokes = strokeOrders[currentKana] || [];

    const strokeOrderDiv = document.getElementById('strokeOrder');
    strokeOrderDiv.innerHTML = '';

    strokes.forEach((stroke, index) => {
        const strokeDiv = document.createElement('div');
        strokeDiv.className = 'stroke-number';
        strokeDiv.textContent = stroke;

        if (index < currentStroke) {
            strokeDiv.classList.add('active');
        }

        strokeOrderDiv.appendChild(strokeDiv);
    });
}

function checkStroke() {
    const currentKana = currentKanaList[currentIndex];
    const expectedStrokes = strokeOrders[currentKana];

    if (!expectedStrokes) {
        document.getElementById('status').textContent = 'No stroke order data available for this character';
        return;
    }

    if (currentStroke === expectedStrokes.length) {
        score += 20;
        correctAnswers++;
        totalAttempts++;
        document.getElementById('status').textContent = 'Perfect stroke order! 🎉';
        updateProgress();

        setTimeout(() => {
            nextKana();
            clearCanvas();
        }, 1500);
    } else {
        score = Math.max(0, score - 10);
        totalAttempts++;
        document.getElementById('status').textContent = `Keep practicing! Expected ${expectedStrokes.length} strokes, you drew ${currentStroke}`;
        updateProgress();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);
