// Kanji Master - Reading & Meaning Practice
// Comprehensive kanji learning for all JLPT levels

// Kanji data by JLPT level
const kanjiData = {
    N5: [
        { kanji: '日', onyomi: ['ニチ', 'ジツ'], kunyomi: ['ひ', 'か'], meaning: 'day/sun', jlpt: 'N5', radicals: [
            { symbol: '日', name: 'sun/day', meaning: 'sun, day' }
        ], compounds: [
            { word: '日曜日', reading: 'にちようび', meaning: 'Sunday' },
            { word: '毎日', reading: 'まいにち', meaning: 'every day' },
            { word: '一日', reading: 'いちにち', meaning: 'one day' }
        ]},
        { kanji: '一', onyomi: ['イチ'], kunyomi: ['ひと'], meaning: 'one', jlpt: 'N5', radicals: [
            { symbol: '一', name: 'one', meaning: 'one, horizontal line' }
        ], compounds: [
            { word: '一人', reading: 'ひとり', meaning: 'one person' },
            { word: '一つ', reading: 'ひとつ', meaning: 'one (thing)' },
            { word: '一番', reading: 'いちばん', meaning: 'number one, best' }
        ]},
        { kanji: '人', onyomi: ['ジン', 'ニン'], kunyomi: ['ひと'], meaning: 'person', jlpt: 'N5', radicals: [
            { symbol: '人', name: 'person', meaning: 'person, human' }
        ], compounds: [
            { word: '人', reading: 'ひと', meaning: 'person' },
            { word: '日本人', reading: 'にほんじん', meaning: 'Japanese person' },
            { word: '二人', reading: 'ふたり', meaning: 'two people' }
        ]},
        { kanji: '月', onyomi: ['ゲツ', 'ガツ'], kunyomi: ['つき'], meaning: 'moon/month', jlpt: 'N5', radicals: [
            { symbol: '月', name: 'moon/month', meaning: 'moon, month' }
        ], compounds: [
            { word: '月曜日', reading: 'げつようび', meaning: 'Monday' },
            { word: '今月', reading: 'こんげつ', meaning: 'this month' },
            { word: '月', reading: 'つき', meaning: 'moon, month' }
        ]},
        { kanji: '火', onyomi: ['カ'], kunyomi: ['ひ', 'ほ'], meaning: 'fire', jlpt: 'N5', radicals: [
            { symbol: '火', name: 'fire', meaning: 'fire, flame' }
        ], compounds: [
            { word: '火曜日', reading: 'かようび', meaning: 'Tuesday' },
            { word: '火', reading: 'ひ', meaning: 'fire' },
            { word: '花火', reading: 'はなび', meaning: 'fireworks' }
        ]},
        { kanji: '水', onyomi: ['スイ'], kunyomi: ['みず'], meaning: 'water', jlpt: 'N5', radicals: [
            { symbol: '水', name: 'water', meaning: 'water, liquid' }
        ], compounds: [
            { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
            { word: '水', reading: 'みず', meaning: 'water' },
            { word: '海水', reading: 'かいすい', meaning: 'seawater' }
        ]},
        { kanji: '木', onyomi: ['ボク', 'モク'], kunyomi: ['き', 'こ'], meaning: 'tree/wood', jlpt: 'N5', radicals: [
            { symbol: '木', name: 'tree', meaning: 'tree, wood' }
        ], compounds: [
            { word: '木曜日', reading: 'もくようび', meaning: 'Thursday' },
            { word: '木', reading: 'き', meaning: 'tree, wood' },
            { word: '果物', reading: 'くだもの', meaning: 'fruit' }
        ]},
        { kanji: '金', onyomi: ['キン', 'コン'], kunyomi: ['かね', 'かな'], meaning: 'gold/money', jlpt: 'N5', radicals: [
            { symbol: '金', name: 'metal/gold', meaning: 'metal, gold' }
        ], compounds: [
            { word: '金曜日', reading: 'きんようび', meaning: 'Friday' },
            { word: '金', reading: 'かね', meaning: 'money' },
            { word: '銀行', reading: 'ぎんこう', meaning: 'bank' }
        ]},
        { kanji: '土', onyomi: ['ド', 'ト'], kunyomi: ['つち'], meaning: 'earth/soil', jlpt: 'N5', radicals: [
            { symbol: '土', name: 'earth', meaning: 'earth, soil' }
        ], compounds: [
            { word: '土曜日', reading: 'どようび', meaning: 'Saturday' },
            { word: '土', reading: 'つち', meaning: 'soil, earth' },
            { word: '土地', reading: 'とち', meaning: 'land, plot' }
        ]},
        { kanji: '本', onyomi: ['ホン'], kunyomi: ['もと'], meaning: 'book/origin', jlpt: 'N5', radicals: [
            { symbol: '木', name: 'tree', meaning: 'tree' },
            { symbol: '一', name: 'one', meaning: 'one' }
        ], compounds: [
            { word: '本', reading: 'ほん', meaning: 'book' },
            { word: '日本', reading: 'にほん', meaning: 'Japan' },
            { word: '本当', reading: 'ほんとう', meaning: 'true, real' }
        ]},
        { kanji: '学', onyomi: ['ガク'], kunyomi: [], meaning: 'study/learn', jlpt: 'N5', radicals: [
            { symbol: '子', name: 'child', meaning: 'child' },
            { symbol: '冖', name: 'cover', meaning: 'cover' },
            { symbol: '爻', name: 'lines', meaning: 'crossing lines' }
        ], compounds: [
            { word: '学校', reading: 'がっこう', meaning: 'school' },
            { word: '学生', reading: 'がくせい', meaning: 'student' },
            { word: '大学', reading: 'だいがく', meaning: 'university' }
        ]},
        { kanji: '行', onyomi: ['コウ', 'ギョウ'], kunyomi: ['い', 'ゆ'], meaning: 'go/row', jlpt: 'N5', radicals: [
            { symbol: '行', name: 'go/row', meaning: 'go, do, conduct, row' }
        ], compounds: [
            { word: '行く', reading: 'いく', meaning: 'to go' },
            { word: '銀行', reading: 'ぎんこう', meaning: 'bank' },
            { word: '旅行', reading: 'りょこう', meaning: 'travel' }
        ]},
        { kanji: '見', onyomi: ['ケン'], kunyomi: ['み'], meaning: 'see/look', jlpt: 'N5', radicals: [
            { symbol: '見', name: 'see', meaning: 'see, look at' }
        ], compounds: [
            { word: '見る', reading: 'みる', meaning: 'to see, to look' },
            { word: '見せる', reading: 'みせる', meaning: 'to show' },
            { word: '意見', reading: 'いけん', meaning: 'opinion' }
        ]},
        { kanji: '食', onyomi: ['ショク'], kunyomi: ['た'], meaning: 'eat/food', jlpt: 'N5', radicals: [
            { symbol: '食', name: 'eat', meaning: 'eat, food' }
        ], compounds: [
            { word: '食べる', reading: 'たべる', meaning: 'to eat' },
            { word: '食事', reading: 'しょくじ', meaning: 'meal' },
            { word: '食堂', reading: 'しょくどう', meaning: 'cafeteria' }
        ]},
        { kanji: '飲', onyomi: ['イン'], kunyomi: ['の'], meaning: 'drink', jlpt: 'N5', radicals: [
            { symbol: '食', name: 'eat', meaning: 'eat' },
            { symbol: '欠', name: 'lack', meaning: 'lack, yawn' }
        ], compounds: [
            { word: '飲む', reading: 'のむ', meaning: 'to drink' },
            { word: '飲み物', reading: 'のみもの', meaning: 'drink, beverage' },
            { word: '飲み会', reading: 'のみかい', meaning: 'drinking party' }
        ]}
    ],
    N4: [
        { kanji: '国', onyomi: ['コク'], kunyomi: ['くに'], meaning: 'country', jlpt: 'N4', radicals: [
            { symbol: '囗', name: 'enclosure', meaning: 'enclosure' },
            { symbol: '玉', name: 'jade', meaning: 'jade, ball' }
        ], compounds: [
            { word: '国', reading: 'くに', meaning: 'country' },
            { word: '外国', reading: 'がいこく', meaning: 'foreign country' },
            { word: '国際', reading: 'こくさい', meaning: 'international' }
        ]},
        { kanji: '時', onyomi: ['ジ'], kunyomi: ['とき'], meaning: 'time', jlpt: 'N4', radicals: [
            { symbol: '日', name: 'sun', meaning: 'sun' },
            { symbol: '寺', name: 'temple', meaning: 'temple' }
        ], compounds: [
            { word: '時', reading: 'とき', meaning: 'time' },
            { word: '時間', reading: 'じかん', meaning: 'time' },
            { word: '時計', reading: 'とけい', meaning: 'clock, watch' }
        ]},
        { kanji: '年', onyomi: ['ネン'], kunyomi: ['とし'], meaning: 'year', jlpt: 'N4', radicals: [
            { symbol: '年', name: 'year', meaning: 'year' }
        ], compounds: [
            { word: '年', reading: 'とし', meaning: 'year' },
            { word: '今年', reading: 'ことし', meaning: 'this year' },
            { word: '去年', reading: 'きょねん', meaning: 'last year' }
        ]},
        { kanji: '気', onyomi: ['キ', 'ケ'], kunyomi: [], meaning: 'spirit/air', jlpt: 'N4', radicals: [
            { symbol: '气', name: 'steam', meaning: 'steam, breath' }
        ], compounds: [
            { word: '天気', reading: 'てんき', meaning: 'weather' },
            { word: '気持ち', reading: 'きもち', meaning: 'feeling' },
            { word: '元気', reading: 'げんき', meaning: 'energy, health' }
        ]},
        { kanji: '大', onyomi: ['ダイ', 'タイ'], kunyomi: ['おお'], meaning: 'big/large', jlpt: 'N4', radicals: [
            { symbol: '大', name: 'big', meaning: 'big, large' }
        ], compounds: [
            { word: '大きい', reading: 'おおきい', meaning: 'big' },
            { word: '大学', reading: 'だいがく', meaning: 'university' },
            { word: '大切', reading: 'たいせつ', meaning: 'important' }
        ]},
        { kanji: '高', onyomi: ['コウ'], kunyomi: ['たか'], meaning: 'high/tall', jlpt: 'N4', radicals: [
            { symbol: '高', name: 'tall', meaning: 'tall, high' }
        ], compounds: [
            { word: '高い', reading: 'たかい', meaning: 'high, expensive' },
            { word: '高校', reading: 'こうこう', meaning: 'high school' },
            { word: '最高', reading: 'さいこう', meaning: 'the best' }
        ]},
        { kanji: '長', onyomi: ['チョウ'], kunyomi: ['なが'], meaning: 'long/leader', jlpt: 'N4', radicals: [
            { symbol: '長', name: 'long', meaning: 'long, leader' }
        ], compounds: [
            { word: '長い', reading: 'ながい', meaning: 'long' },
            { word: '校長', reading: 'こうちょう', meaning: 'school principal' },
            { word: '社長', reading: 'しゃちょう', meaning: 'company president' }
        ]},
        { kanji: '間', onyomi: ['カン', 'ケン'], kunyomi: ['あいだ', 'ま'], meaning: 'between/time', jlpt: 'N4', radicals: [
            { symbol: '門', name: 'gate', meaning: 'gate' }
        ], compounds: [
            { word: '時間', reading: 'じかん', meaning: 'time' },
            { word: '人間', reading: 'にんげん', meaning: 'human' },
            { word: '間に合う', reading: 'まにあう', meaning: 'to be in time' }
        ]},
        { kanji: '手', onyomi: ['シュ'], kunyomi: ['て'], meaning: 'hand', jlpt: 'N4', radicals: [
            { symbol: '手', name: 'hand', meaning: 'hand' }
        ], compounds: [
            { word: '手', reading: 'て', meaning: 'hand' },
            { word: '手紙', reading: 'てがみ', meaning: 'letter' },
            { word: '手伝う', reading: 'てつだう', meaning: 'to help' }
        ]},
        { kanji: '車', onyomi: ['シャ'], kunyomi: ['くるま'], meaning: 'car/vehicle', jlpt: 'N4', radicals: [
            { symbol: '車', name: 'cart', meaning: 'cart, vehicle' }
        ], compounds: [
            { word: '車', reading: 'くるま', meaning: 'car' },
            { word: '電車', reading: 'でんしゃ', meaning: 'train' },
            { word: '自動車', reading: 'じどうしゃ', meaning: 'automobile' }
        ]},
        { kanji: '出', onyomi: ['シュツ'], kunyomi: ['で', 'だ'], meaning: 'exit/go out', jlpt: 'N4', radicals: [
            { symbol: '出', name: 'exit', meaning: 'exit, go out' }
        ], compounds: [
            { word: '出る', reading: 'でる', meaning: 'to go out, to exit' },
            { word: '出口', reading: 'でぐち', meaning: 'exit' },
            { word: '出席', reading: 'しゅっせき', meaning: 'attendance' }
        ]},
        { kanji: '電', onyomi: ['デン'], kunyomi: [], meaning: 'electricity', jlpt: 'N4', radicals: [
            { symbol: '雨', name: 'rain', meaning: 'rain' },
            { symbol: '電', name: 'lightning', meaning: 'lightning' }
        ], compounds: [
            { word: '電気', reading: 'でんき', meaning: 'electricity' },
            { word: '電話', reading: 'でんわ', meaning: 'telephone' },
            { word: '電車', reading: 'でんしゃ', meaning: 'train' }
        ]},
        { kanji: '語', onyomi: ['ゴ'], kunyomi: ['かた'], meaning: 'language/word', jlpt: 'N4', radicals: [
            { symbol: '言', name: 'speech', meaning: 'speech, words' },
            { symbol: '五', name: 'five', meaning: 'five' }
        ], compounds: [
            { word: '言葉', reading: 'ことば', meaning: 'word, language' },
            { word: '英語', reading: 'えいご', meaning: 'English language' },
            { word: '日本語', reading: 'にほんご', meaning: 'Japanese language' }
        ]},
        { kanji: '言', onyomi: ['ゲン', 'ゴン'], kunyomi: ['い', 'こと'], meaning: 'say/word', jlpt: 'N4', radicals: [
            { symbol: '言', name: 'speech', meaning: 'speech, words' }
        ], compounds: [
            { word: '言う', reading: 'いう', meaning: 'to say' },
            { word: '言葉', reading: 'ことば', meaning: 'word' },
            { word: '言語', reading: 'げんご', meaning: 'language' }
        ]},
        { kanji: '読', onyomi: ['ドク'], kunyomi: ['よ'], meaning: 'read', jlpt: 'N4', radicals: [
            { symbol: '言', name: 'speech', meaning: 'speech' },
            { symbol: '売', name: 'sell', meaning: 'sell' }
        ], compounds: [
            { word: '読む', reading: 'よむ', meaning: 'to read' },
            { word: '読み物', reading: 'よみもの', meaning: 'reading material' },
            { word: '読書', reading: 'どくしょ', meaning: 'reading books' }
        ]},
        { kanji: '書', onyomi: ['ショ'], kunyomi: ['か'], meaning: 'write/book', jlpt: 'N4', radicals: [
            { symbol: '聿', name: 'brush', meaning: 'brush' },
            { symbol: '日', name: 'sun', meaning: 'sun' }
        ], compounds: [
            { word: '書く', reading: 'かく', meaning: 'to write' },
            { word: '本', reading: 'ほん', meaning: 'book' },
            { word: '手紙', reading: 'てがみ', meaning: 'letter' }
        ]}
    ]
};

// Game state
let currentKanjiLevel = 'N5';
let currentKanjiPracticeMode = 'meaning';
let currentKanjiList = [];
let currentKanjiIndex = 0;
let kanjiScore = 0;
let kanjiTotalAttempts = 0;
let kanjiCorrectAnswers = 0;
let kanjiCurrentStreak = 0;

function initializeKanjiGame() {
    setKanjiLevel('N5');
    setKanjiPracticeMode('meaning');
    updateKanjiDisplay();
}

function setKanjiLevel(level) {
    currentKanjiLevel = level;

    // Update button states
    document.querySelectorAll('.kanji-level-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Set kanji list
    currentKanjiList = [...kanjiData[level]];
    shuffleKanji();
    updateKanjiDisplay();

    document.getElementById('status').textContent = `JLPT ${level} kanji loaded! Choose practice mode.`;
}

function setKanjiPracticeMode(mode) {
    currentKanjiPracticeMode = mode;

    // Update button states
    document.querySelectorAll('.kanji-mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update UI visibility
    document.getElementById('kanjiRecognitionMode').style.display = ['meaning', 'reading', 'onyomi', 'kunyomi', 'mixed'].includes(mode) ? 'block' : 'none';
    document.getElementById('kanjiInputMode').style.display = ['meaning', 'reading', 'onyomi', 'kunyomi', 'mixed'].includes(mode) ? 'none' : 'block';
    document.getElementById('radicalInfo').style.display = 'none';
    document.getElementById('compoundInfo').style.display = 'none';

    updateKanjiDisplay();

    if (['meaning', 'reading', 'onyomi', 'kunyomi', 'mixed'].includes(mode)) {
        generateKanjiAnswerOptions();
    }
}

function updateKanjiDisplay() {
    if (currentKanjiList.length === 0) return;

    const currentKanji = currentKanjiList[currentKanjiIndex];

    document.getElementById('currentKanji').textContent = currentKanji.kanji;

    // Show readings based on mode
    let readingsText = '';
    if (currentKanjiPracticeMode === 'reading' || currentKanjiPracticeMode === 'mixed') {
        const allReadings = [...currentKanji.onyomi, ...currentKanji.kunyomi];
        readingsText = allReadings.join(', ');
    } else if (currentKanjiPracticeMode === 'onyomi') {
        readingsText = currentKanji.onyomi.join(', ');
    } else if (currentKanjiPracticeMode === 'kunyomi') {
        readingsText = currentKanji.kunyomi.join(', ');
    }

    document.getElementById('kanjiReadings').textContent = readingsText || '—';
    document.getElementById('kanjiMeaning').textContent = currentKanji.meaning;
    document.getElementById('kanjiInfo').textContent = `${currentKanji.jlpt} - ${currentKanjiPracticeMode}`;
    document.getElementById('kanjiLevelIndicator').textContent = currentKanji.jlpt;

    updateKanjiStats();
}

function updateKanjiStats() {
    document.getElementById('kanjiScore').textContent = kanjiScore;
    document.getElementById('kanjiStreak').textContent = kanjiCurrentStreak;
    const accuracy = kanjiTotalAttempts > 0 ? Math.round((kanjiCorrectAnswers / kanjiTotalAttempts) * 100) : 0;
    document.getElementById('kanjiAccuracy').textContent = `${accuracy}%`;
}

function generateKanjiAnswerOptions() {
    const currentKanji = currentKanjiList[currentKanjiIndex];
    let correctAnswer = '';
    let answerType = '';

    // Determine what to ask for based on mode
    switch (currentKanjiPracticeMode) {
        case 'meaning':
            correctAnswer = currentKanji.meaning;
            answerType = 'meaning';
            break;
        case 'reading':
            const allReadings = [...currentKanji.onyomi, ...currentKanji.kunyomi];
            correctAnswer = allReadings.join(', ');
            answerType = 'reading';
            break;
        case 'onyomi':
            correctAnswer = currentKanji.onyomi.join(', ');
            answerType = 'on-yomi';
            break;
        case 'kunyomi':
            correctAnswer = currentKanji.kunyomi.join(', ');
            answerType = 'kun-yomi';
            break;
        case 'mixed':
            // Randomly choose between meaning and reading
            if (Math.random() < 0.5) {
                correctAnswer = currentKanji.meaning;
                answerType = 'meaning';
            } else {
                const allReadings = [...currentKanji.onyomi, ...currentKanji.kunyomi];
                correctAnswer = allReadings.join(', ');
                answerType = 'reading';
            }
            break;
    }

    // Get 3 wrong answers from other kanji
    const wrongAnswers = [];
    const otherKanji = currentKanjiList.filter((_, index) => index !== currentKanjiIndex);

    while (wrongAnswers.length < 3 && otherKanji.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherKanji.length);
        const wrongKanji = otherKanji.splice(randomIndex, 1)[0];
        let wrongAnswer = '';

        // Get the same type of answer from wrong kanji
        switch (answerType) {
            case 'meaning':
                wrongAnswer = wrongKanji.meaning;
                break;
            case 'reading':
                const wrongReadings = [...wrongKanji.onyomi, ...wrongKanji.kunyomi];
                wrongAnswer = wrongReadings.join(', ');
                break;
            case 'on-yomi':
                wrongAnswer = wrongKanji.onyomi.join(', ');
                break;
            case 'kun-yomi':
                wrongAnswer = wrongKanji.kunyomi.join(', ');
                break;
        }

        if (wrongAnswer && wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
            wrongAnswers.push(wrongAnswer);
        }
    }

    // Combine and shuffle answers
    const allAnswers = [correctAnswer, ...wrongAnswers];
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    // Create answer buttons
    const answerOptions = document.getElementById('kanjiAnswerOptions');
    answerOptions.innerHTML = '';

    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'kanji-answer-button';
        button.textContent = answer;
        button.onclick = () => checkKanjiAnswer(answer, correctAnswer, button);
        answerOptions.appendChild(button);
    });
}

function checkKanjiAnswer(selectedAnswer, correctAnswer, button) {
    kanjiTotalAttempts++;

    if (selectedAnswer === correctAnswer) {
        kanjiCorrectAnswers++;
        kanjiCurrentStreak++;
        kanjiScore += 10;
        button.classList.add('correct');
        document.getElementById('status').textContent = 'Correct! 🎉';

        setTimeout(() => {
            nextKanji();
        }, 1000);
    } else {
        kanjiCurrentStreak = 0;
        kanjiScore = Math.max(0, kanjiScore - 5);
        button.classList.add('incorrect');
        document.getElementById('status').textContent = `Incorrect. The correct answer is "${correctAnswer}"`;

        // Highlight correct answer
        const buttons = document.querySelectorAll('.kanji-answer-button');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        setTimeout(() => {
            generateKanjiAnswerOptions();
        }, 2000);
    }

    updateKanjiStats();
}

function nextKanji() {
    currentKanjiIndex = (currentKanjiIndex + 1) % currentKanjiList.length;
    updateKanjiDisplay();

    if (['meaning', 'reading', 'onyomi', 'kunyomi', 'mixed'].includes(currentKanjiPracticeMode)) {
        generateKanjiAnswerOptions();
    }

    // Clear input if in input mode
    document.getElementById('kanjiInput').value = '';
    document.getElementById('kanjiInput').style.borderColor = '#9C27B0';
}

function shuffleKanji() {
    for (let i = currentKanjiList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentKanjiList[i], currentKanjiList[j]] = [currentKanjiList[j], currentKanjiList[i]];
    }
    currentKanjiIndex = 0;
    updateKanjiDisplay();
}

function showRadicals() {
    const currentKanji = currentKanjiList[currentKanjiIndex];
    const radicalList = document.getElementById('radicalList');

    radicalList.innerHTML = '';
    currentKanji.radicals.forEach(radical => {
        const radicalDiv = document.createElement('div');
        radicalDiv.className = 'radical-item';

        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'radical-symbol';
        symbolDiv.textContent = radical.symbol;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'radical-details';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'radical-name';
        nameDiv.textContent = radical.name;

        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'radical-meaning';
        meaningDiv.textContent = radical.meaning;

        detailsDiv.appendChild(nameDiv);
        detailsDiv.appendChild(meaningDiv);

        radicalDiv.appendChild(symbolDiv);
        radicalDiv.appendChild(detailsDiv);
        radicalList.appendChild(radicalDiv);
    });

    document.getElementById('radicalInfo').style.display = 'block';
    document.getElementById('compoundInfo').style.display = 'none';
}

function showCompounds() {
    const currentKanji = currentKanjiList[currentKanjiIndex];
    const compoundList = document.getElementById('compoundList');

    compoundList.innerHTML = '';
    currentKanji.compounds.forEach(compound => {
        const compoundDiv = document.createElement('div');
        compoundDiv.className = 'compound-item';

        const wordDiv = document.createElement('div');
        wordDiv.className = 'compound-word';
        wordDiv.textContent = compound.word;

        const readingDiv = document.createElement('div');
        readingDiv.className = 'compound-reading';
        readingDiv.textContent = compound.reading;

        const meaningDiv = document.createElement('div');
        meaningDiv.className = 'compound-meaning';
        meaningDiv.textContent = compound.meaning;

        compoundDiv.appendChild(wordDiv);
        compoundDiv.appendChild(readingDiv);
        compoundDiv.appendChild(meaningDiv);
        compoundList.appendChild(compoundDiv);
    });

    document.getElementById('radicalInfo').style.display = 'none';
    document.getElementById('compoundInfo').style.display = 'block';
}

function resetKanjiProgress() {
    kanjiScore = 0;
    kanjiTotalAttempts = 0;
    kanjiCorrectAnswers = 0;
    kanjiCurrentStreak = 0;
    updateKanjiStats();
    document.getElementById('status').textContent = 'Progress reset! Keep practicing!';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeKanjiGame);
