// Yojijukugo Game Implementation
// **Timestamp**: 2025-12-04

let currentDifficulty = 'beginner';
let currentQuestion = null;
let stats = {
    correct: 0,
    wrong: 0,
    streak: 0
};

// Yojijukugo database (四字熟語)
const YOJIJUKUGO = {
    beginner: [
        {
            kanji: ['一', '生', '懸', '命'],
            reading: 'いっしょうけんめい (isshoukenmei)',
            meaning: 'With all one\'s might; doing one\'s best',
            explanation: '一生 (whole life) + 懸命 (desperate) = Putting your whole life into something, doing your utmost'
        },
        {
            kanji: ['十', '人', '十', '色'],
            reading: 'じゅうにんといろ (juunintoiro)',
            meaning: 'To each their own; different strokes for different folks',
            explanation: '十人 (ten people) + 十色 (ten colors) = Ten people, ten colors - everyone is different'
        },
        {
            kanji: ['一', '期', '一', '会'],
            reading: 'いちごいちえ (ichigo ichie)',
            meaning: 'Once in a lifetime meeting; treasure every encounter',
            explanation: '一期 (one lifetime) + 一会 (one meeting) = This meeting will never happen again, cherish it'
        },
        {
            kanji: ['四', '季', '折', '々'],
            reading: 'しきおりおり (shiki oriori)',
            meaning: 'Each season; the four seasons',
            explanation: '四季 (four seasons) + 折々 (occasionally) = The changing of seasons throughout the year'
        },
        {
            kanji: ['三', '日', '坊', '主'],
            reading: 'みっかぼうず (mikkabouzu)',
            meaning: 'Giving up quickly; lacking perseverance',
            explanation: '三日 (three days) + 坊主 (Buddhist monk) = A monk who quits after three days - giving up easily'
        },
        {
            kanji: ['一', '石', '二', '鳥'],
            reading: 'いっせきにちょう (isseki nichou)',
            meaning: 'Kill two birds with one stone',
            explanation: '一石 (one stone) + 二鳥 (two birds) = Achieving two goals with one action'
        }
    ],
    intermediate: [
        {
            kanji: ['弱', '肉', '強', '食'],
            reading: 'じゃくにくきょうしょく (jakuniku kyoushoku)',
            meaning: 'The strong eat the weak; survival of the fittest',
            explanation: '弱肉 (weak flesh) + 強食 (strong eat) = The law of nature where the strong prey on the weak'
        },
        {
            kanji: ['温', '故', '知', '新'],
            reading: 'おんこちしん (onkochishin)',
            meaning: 'Learning new things by studying the past',
            explanation: '温故 (review the old) + 知新 (learn new) = Gaining new knowledge through studying history'
        },
        {
            kanji: ['自', '画', '自', '賛'],
            reading: 'じがじさん (jigajisan)',
            meaning: 'Self-praise; blowing one\'s own trumpet',
            explanation: '自画 (self-portrait) + 自賛 (self-praise) = Praising your own work'
        },
        {
            kanji: ['臥', '薪', '嘗', '胆'],
            reading: 'がしんしょうたん (gashin shoutan)',
            meaning: 'Enduring hardship to achieve a goal',
            explanation: '臥薪 (sleep on firewood) + 嘗胆 (taste bile) = Enduring suffering to accomplish revenge or a goal'
        },
        {
            kanji: ['因', '果', '応', '報'],
            reading: 'いんがおうほう (inga ouhou)',
            meaning: 'Karma; what goes around comes around',
            explanation: '因果 (cause and effect) + 応報 (retribution) = You reap what you sow'
        },
        {
            kanji: ['千', '差', '万', '別'],
            reading: 'せんさばんべつ (sensa banbetsu)',
            meaning: 'A great variety; diverse',
            explanation: '千差 (thousand differences) + 万別 (ten thousand distinctions) = Infinite variety'
        }
    ],
    advanced: [
        {
            kanji: ['七', '転', '八', '起'],
            reading: 'しちてんはっき (shichiten hakki)',
            meaning: 'Fall seven times, stand up eight; never give up',
            explanation: '七転 (seven falls) + 八起 (eight rises) = No matter how many times you fall, keep getting up'
        },
        {
            kanji: ['呉', '越', '同', '舟'],
            reading: 'ごえつどうしゅう (goetsu doushuu)',
            meaning: 'Bitter enemies cooperating in crisis',
            explanation: '呉越 (ancient rival states) + 同舟 (same boat) = Even enemies cooperate when facing a common danger'
        },
        {
            kanji: ['竜', '頭', '蛇', '尾'],
            reading: 'りゅうとうだび (ryuutou dabi)',
            meaning: 'Starting strong but ending weak; anticlimax',
            explanation: '竜頭 (dragon head) + 蛇尾 (snake tail) = A strong beginning but weak ending'
        },
        {
            kanji: ['以', '心', '伝', '心'],
            reading: 'いしんでんしん (ishin denshin)',
            meaning: 'Telepathy; understanding without words',
            explanation: '以心 (by mind) + 伝心 (transmit mind) = Communication from heart to heart, mutual understanding'
        },
        {
            kanji: ['馬', '耳', '東', '風'],
            reading: 'ばじとうふう (baji toufuu)',
            meaning: 'Ignoring advice; letting it go in one ear and out the other',
            explanation: '馬耳 (horse ear) + 東風 (east wind) = Like an east wind blowing past a horse\'s ear - unheeded advice'
        },
        {
            kanji: ['針', '小', '棒', '大'],
            reading: 'しんしょうぼうだい (shinshou boudai)',
            meaning: 'Exaggerating; making a mountain out of a molehill',
            explanation: '針小 (needle small) + 棒大 (stick big) = Making a small needle seem like a big stick'
        }
    ]
};

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    ['beginner', 'intermediate', 'advanced'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) {
            if (d === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    
    nextQuestion();
}

function nextQuestion() {
    // Reset UI
    document.getElementById('explanation').style.display = 'none';
    document.getElementById('nextBtn').disabled = true;
    
    // Pick random yojijukugo
    const questions = YOJIJUKUGO[currentDifficulty];
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    // Pick random position for missing kanji
    const missingPos = Math.floor(Math.random() * 4);
    const correctKanji = currentQuestion.kanji[missingPos];
    
    // Render kanji with one missing
    const kanjiDisplay = document.getElementById('kanjiDisplay');
    kanjiDisplay.innerHTML = '';
    
    currentQuestion.kanji.forEach((kanji, index) => {
        const box = document.createElement('div');
        box.className = 'kanji-box';
        if (index === missingPos) {
            box.classList.add('missing');
            box.dataset.missing = 'true';
        } else {
            box.textContent = kanji;
        }
        kanjiDisplay.appendChild(box);
    });
    
    // Generate choices (4 wrong + 1 correct)
    const choices = generateChoices(correctKanji, missingPos);
    
    // Shuffle choices
    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    
    // Render choices
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice;
        btn.onclick = () => checkAnswer(choice, correctKanji, missingPos);
        choicesContainer.appendChild(btn);
    });
    
    updateStatus('選んでください - Choose the missing kanji!');
}

function generateChoices(correctKanji, missingPos) {
    const choices = [correctKanji];
    
    // Pool of kanji for wrong answers
    const kanjiPool = [
        '愛', '美', '心', '力', '風', '雨', '山', '川', '木', '林',
        '花', '鳥', '魚', '犬', '猫', '人', '子', '女', '男', '大',
        '小', '中', '上', '下', '左', '右', '東', '西', '南', '北',
        '春', '夏', '秋', '冬', '日', '月', '火', '水', '金', '土',
        '天', '地', '海', '空', '星', '光', '闇', '朝', '昼', '夜',
        '生', '死', '始', '終', '前', '後', '今', '昔', '新', '古'
    ];
    
    // Add wrong answers
    while (choices.length < 5) {
        const randomKanji = kanjiPool[Math.floor(Math.random() * kanjiPool.length)];
        if (!choices.includes(randomKanji) && randomKanji !== correctKanji) {
            choices.push(randomKanji);
        }
    }
    
    return choices;
}

function checkAnswer(selected, correct, position) {
    // Disable all buttons
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    const isCorrect = selected === correct;
    
    // Highlight selected button
    buttons.forEach(btn => {
        if (btn.textContent === selected) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (btn.textContent === correct && !isCorrect) {
            btn.classList.add('correct');
        }
    });
    
    // Update stats
    if (isCorrect) {
        stats.correct++;
        stats.streak++;
        updateStatus('正解！ Correct! 素晴らしい！');
    } else {
        stats.wrong++;
        stats.streak = 0;
        updateStatus(`不正解 Wrong! The correct answer was: ${correct}`);
    }
    
    updateStats();
    
    // Fill in the missing kanji
    const missingBox = document.querySelector('.kanji-box.missing');
    if (missingBox) {
        setTimeout(() => {
            missingBox.classList.remove('missing');
            missingBox.textContent = correct;
            missingBox.style.background = isCorrect ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
        }, 500);
    }
    
    // Show explanation
    setTimeout(() => {
        showExplanation();
        document.getElementById('nextBtn').disabled = false;
    }, 1000);
}

function showExplanation() {
    const explanationBox = document.getElementById('explanation');
    explanationBox.innerHTML = `
        <h3>${currentQuestion.kanji.join('')}</h3>
        <p class="reading-text">${currentQuestion.reading}</p>
        <p class="english-text"><strong>Meaning:</strong> ${currentQuestion.meaning}</p>
        <p class="japanese-text">説明 (Explanation):</p>
        <p class="english-text">${currentQuestion.explanation}</p>
    `;
    explanationBox.style.display = 'block';
}

function showHint() {
    const hints = [
        `This yojijukugo is read as: ${currentQuestion.reading}`,
        `The meaning is: ${currentQuestion.meaning}`,
        `Full explanation: ${currentQuestion.explanation}`
    ];
    
    const hintIndex = Math.min(stats.wrong, hints.length - 1);
    alert(`💡 ヒント Hint:\n\n${hints[hintIndex]}`);
}

function updateStats() {
    document.getElementById('correctCount').textContent = stats.correct;
    document.getElementById('wrongCount').textContent = stats.wrong;
    document.getElementById('streakCount').textContent = stats.streak;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
setDifficulty('beginner');

