// JLPT Practice Test - Database-Driven API Client
// Loads questions dynamically from JLPT API server

// API Configuration
const JLPT_API_BASE = '/api/jlpt'; // JLPT-specific API endpoint
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// JLPT Questions Database (fallback if API fails)
const JLPT_QUESTIONS = {
    N5: {
        kanji: [
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n田中さんは（　　）に本を読みます。",
                options: {
                    "ア": "図書館",
                    "イ": "レストラン",
                    "ウ": "病院",
                    "エ": "銀行"
                },
                correct: "ア",
                explanations: {
                    "ア": "「図書館」は本を読む場所なので正解です。",
                    "イ": "「レストラン」は食べ物を食べる場所です。",
                    "ウ": "「病院」は病気の治療を受ける場所です。",
                    "エ": "「銀行」はお金を扱う場所です。"
                },
                type: "kanji"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n毎日（　　）で勉強します。",
                options: {
                    "ア": "学校",
                    "イ": "公園",
                    "ウ": "スーパー",
                    "エ": "駅"
                },
                correct: "ア",
                explanations: {
                    "ア": "「学校」は勉強する場所なので正解です。",
                    "イ": "「公園」は散歩やスポーツをする場所です。",
                    "ウ": "「スーパー」は買い物をする場所です。",
                    "エ": "「駅」は電車に乗る場所です。"
                },
                type: "kanji"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で手紙を書きます。",
                options: {
                    "ア": "鉛筆",
                    "イ": "傘",
                    "ウ": "時計",
                    "エ": "靴"
                },
                correct: "ア",
                explanations: {
                    "ア": "「鉛筆」は手紙を書くのに使う物なので正解です。",
                    "イ": "「傘」は雨よけに使います。",
                    "ウ": "「時計」は時間を確認するのに使います。",
                    "エ": "「靴」は足を保護するのに使います。"
                },
                type: "kanji"
            }
        ],
        grammar: [
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n田中さんは毎日7時に（　　）。",
                options: {
                    "ア": "起きます",
                    "イ": "起きて",
                    "ウ": "起きる",
                    "エ": "起きた"
                },
                correct: "ア",
                explanations: {
                    "ア": "「起きます」は現在形で、毎日の習慣を表すので正解です。",
                    "イ": "「起きて」はテ形接続で、不完全な文になります。",
                    "ウ": "「起きる」は辞書形です。",
                    "エ": "「起きた」は過去形です。"
                },
                type: "grammar"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nこの本は（　　）です。",
                options: {
                    "ア": "面白い",
                    "イ": "面白く",
                    "ウ": "面白かった",
                    "エ": "面白くない"
                },
                correct: "ア",
                explanations: {
                    "ア": "「面白い」はイ形容詞の基本形で、名詞を修飾するので正解です。",
                    "イ": "「面白く」はイ形容詞の連用形で、動詞を修飾します。",
                    "ウ": "「面白かった」は過去形です。",
                    "エ": "「面白くない」は否定形です。"
                },
                type: "grammar"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n昨日、デパートへ（　　）。",
                options: {
                    "ア": "行きました",
                    "イ": "行きます",
                    "ウ": "行く",
                    "エ": "行った"
                },
                correct: "ア",
                explanations: {
                    "ア": "「行きました」は過去の丁寧な表現なので正解です。",
                    "イ": "「行きます」は現在の表現です。",
                    "ウ": "「行く」は辞書形です。",
                    "エ": "「行った」はカジュアルな過去形です。"
                },
                type: "grammar"
            }
        ],
        vocab: [
            {
                question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nA: こんにちは。\nB: （　　）。",
                options: {
                    "ア": "こんにちは",
                    "イ": "さようなら",
                    "ウ": "ありがとう",
                    "エ": "すみません"
                },
                correct: "ア",
                explanations: {
                    "ア": "挨拶に対して挨拶で返すのが自然なので正解です。",
                    "イ": "「さようなら」は別れの挨拶です。",
                    "ウ": "「ありがとう」は感謝を伝える言葉です。",
                    "エ": "「すみません」は謝罪の言葉です。"
                },
                type: "vocab"
            },
            {
                question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n毎日（　　）を食べます。",
                options: {
                    "ア": "野菜",
                    "イ": "机",
                    "ウ": "本",
                    "エ": "時計"
                },
                correct: "ア",
                explanations: {
                    "ア": "「野菜」は食べ物なので正解です。",
                    "イ": "「机」は家具です。",
                    "ウ": "「本」は読む物です。",
                    "エ": "「時計」は時間を確認する物です。"
                },
                type: "vocab"
            },
            {
                question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で日本語を勉強します。",
                options: {
                    "ア": "学校",
                    "イ": "公園",
                    "ウ": "病院",
                    "エ": "銀行"
                },
                correct: "ア",
                explanations: {
                    "ア": "「学校」は勉強する場所なので正解です。",
                    "イ": "「公園」は散歩する場所です。",
                    "ウ": "「病院」は病気の治療を受ける場所です。",
                    "エ": "「銀行」はお金を扱う場所です。"
                },
                type: "vocab"
            }
        ]
    },
    N4: {
        kanji: [
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nこの問題はとても（　　）です。",
                options: {
                    "ア": "難しい",
                    "イ": "簡単だ",
                    "ウ": "きれいだ",
                    "エ": "大きい"
                },
                correct: "ア",
                explanations: {
                    "ア": "「難しい」は「むずかしい」で、問題が複雑であることを表すので正解です。",
                    "イ": "「簡単だ」は「かんたんだ」で、問題が簡単であることを表します。",
                    "ウ": "「きれいだ」は「きれい」で、美しいことを表します。",
                    "エ": "「大きい」は「大きい」で、サイズが大きいことを表します。"
                },
                type: "kanji"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n友達と（　　）へ行きました。",
                options: {
                    "ア": "映画館",
                    "イ": "教室",
                    "ウ": "病院",
                    "エ": "会社"
                },
                correct: "ア",
                explanations: {
                    "ア": "「映画館」は友達と娯楽を楽しむ場所なので正解です。",
                    "イ": "「教室」は勉強する場所です。",
                    "ウ": "「病院」は病気の治療を受ける場所です。",
                    "エ": "「会社」は働く場所です。"
                },
                type: "kanji"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で写真を撮りました。",
                options: {
                    "ア": "カメラ",
                    "イ": "時計",
                    "ウ": "傘",
                    "エ": "靴"
                },
                correct: "ア",
                explanations: {
                    "ア": "「カメラ」は写真を撮る道具なので正解です。",
                    "イ": "「時計」は時間を確認する物です。",
                    "ウ": "「傘」は雨よけです。",
                    "エ": "「靴」は足を保護する物です。"
                },
                type: "kanji"
            }
        ],
        grammar: [
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n明日、友達が（　　）と思います。",
                options: {
                    "ア": "来ます",
                    "イ": "来る",
                    "ウ": "来た",
                    "エ": "来て"
                },
                correct: "イ",
                explanations: {
                    "イ": "「来ると思います」は「～と思います」の正しい使い方で、正解です。",
                    "ア": "「来ますと思います」は二重の丁寧形です。",
                    "ウ": "「来たと思います」は過去形です。",
                    "エ": "「来てと思います」は不完全な文です。"
                },
                type: "grammar"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nこの本は（　　）です。",
                options: {
                    "ア": "面白い",
                    "イ": "面白かった",
                    "ウ": "面白く",
                    "エ": "面白くない"
                },
                correct: "ア",
                explanations: {
                    "ア": "「面白い」は現在形で、状態を表すので正解です。",
                    "イ": "「面白かった」は過去形です。",
                    "ウ": "「面白く」は連用形です。",
                    "エ": "「面白くない」は否定形です。"
                },
                type: "grammar"
            },
            {
                question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n雨が降っているので、（　　）出かけません。",
                options: {
                    "ア": "ずっと",
                    "イ": "すぐに",
                    "ウ": "ゆっくり",
                    "エ": "なかなか"
                },
                correct: "エ",
                explanations: {
                    "エ": "「なかなか～ません」は「あまり～しません」の意味で、正解です。",
                    "ア": "「ずっと」は「ずっと続く」という意味です。",
                    "イ": "「すぐに」は「すぐ」という意味です。",
                    "ウ": "「ゆっくり」は「ゆっくり」という意味です。"
                },
                type: "grammar"
            }
        ],
        vocab: [
            {
                question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nA: すみません。\nB: （　　）。",
                options: {
                    "ア": "どういたしまして",
                    "イ": "こんにちは",
                    "ウ": "さようなら",
                    "エ": "すみません"
                },
                correct: "ア",
                explanations: {
                    "ア": "「どういたしまして」は「どういたしまして」という意味で、謝罪に対する返事として正解です。",
                    "イ": "「こんにちは」は挨拶です。",
                    "ウ": "「さようなら」は別れの挨拶です。",
                    "エ": "「すみません」は謝罪の言葉です。"
                },
                type: "vocab"
            },
            {
                question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）をしています。",
                options: {
                    "ア": "仕事",
                    "イ": "机",
                    "ウ": "本",
                    "エ": "時計"
                },
                correct: "ア",
                explanations: {
                    "ア": "「仕事」は「しごと」で、動詞「する」と組み合わせることができます。",
                    "イ": "「机」は「つくえ」で、動作を表すことができません。",
                    "ウ": "「本」は「ほん」で、動作を表すことができません。",
                    "エ": "「時計」は「とけい」で、動作を表すことができません。"
                },
                type: "vocab"
            },
            {
                question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で新聞を読みます。",
                options: {
                    "ア": "電車",
                    "イ": "学校",
                    "ウ": "病院",
                    "エ": "銀行"
                },
                correct: "ア",
                explanations: {
                    "ア": "「電車」は通勤・通学時に新聞を読む場所なので正解です。",
                    "イ": "「学校」は勉強する場所です。",
                    "ウ": "「病院」は病気の治療を受ける場所です。",
                    "エ": "「銀行」はお金を扱う場所です。"
                },
                type: "vocab"
            }
        ]
    }
};

// Game state
let currentJLPTLevel = 'N5';
let currentPage = 0;
let selectedAnswers = {};
let questionsPerPage = 3;
let currentQuestions = [];
let testResults = [];

// API Helper Functions
async function apiCall(endpoint, params = {}) {
    const url = new URL(JLPT_API_BASE + endpoint, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call failed:', error);
        // Fallback to cached questions if API fails
        return getFallbackQuestions();
    }
};

async function loadQuestions(level, type = 'mixed', limit = 3, excludeIds = []) {
    const data = await apiCall('/questions', {
        level: level,
        type: type,
        limit: limit,
        exclude_ids: excludeIds.join(',')
    });

    if (data.success) {
        return data.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanations: q.explanations,
            type: q.type,
            level: q.level
        }));
    }

    return getFallbackQuestions();
}

async function submitAnswersToAPI(answers) {
    const data = await apiCall('/submit-answers', {}, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            answers: answers
        })
    });

    return data;
}

// Fallback questions in case API fails
function getFallbackQuestions() {
    return [
        {
            id: 1,
            question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n田中さんは（　　）に本を読みます。",
            options: { "ア": "図書館", "イ": "レストラン", "ウ": "病院", "エ": "銀行" },
            correct: "ア",
            explanations: {
                "ア": "「図書館」は本を読む場所なので正解です。",
                "イ": "「レストラン」は食べ物を食べる場所です。",
                "ウ": "「病院」は病気の治療を受ける場所です。",
                "エ": "「銀行」はお金を扱う場所です。"
            },
            type: "kanji",
            level: "N5"
        },
        {
            id: 2,
            question: "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n毎日（　　）で勉強します。",
            options: { "ア": "学校", "イ": "公園", "ウ": "スーパー", "エ": "駅" },
            correct: "ア",
            explanations: {
                "ア": "「学校」は勉強する場所なので正解です。",
                "イ": "「公園」は散歩やスポーツをする場所です。",
                "ウ": "「スーパー」は買い物をする場所です。",
                "エ": "「駅」は電車に乗る場所です。"
            },
            type: "kanji",
            level: "N5"
        },
        {
            id: 3,
            question: "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nA: こんにちは。\nB: （　　）。",
            options: { "ア": "こんにちは", "イ": "さようなら", "ウ": "ありがとう", "エ": "すみません" },
            correct: "ア",
            explanations: {
                "ア": "挨拶に対して挨拶で返すのが自然なので正解です。",
                "イ": "「さようなら」は別れの挨拶です。",
                "ウ": "「ありがとう」は感謝を伝える言葉です。",
                "エ": "「すみません」は謝罪の言葉です。"
            },
            type: "vocab",
            level: "N5"
        }
    ];
}

// Initialize the game
async function initializeTest() {
    await setJLPTLevel('N5');
}

async function setJLPTLevel(level) {
    currentJLPTLevel = level;

    // Update button states
    document.querySelectorAll('.level-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Find and activate the button for this level
    const levelButton = document.querySelector(`.level-button[onclick*="setJLPTLevel('${level}')"]`);
    if (levelButton) {
        levelButton.classList.add('active');
    }

    // Show test content
    document.getElementById('testContent').style.display = 'block';
    document.getElementById('status').textContent = `Loading JLPT ${level} questions...`;

    // Generate first page of questions from API
    await generateQuestions();

    document.getElementById('status').textContent = `JLPT ${level} Practice Test - Click answers and submit!`;
}

async function generateQuestions() {
    try {
        // Load questions from API
        const excludeIds = currentQuestions.map(q => q.id).filter(id => id);
        currentQuestions = await loadQuestions(currentJLPTLevel, 'mixed', questionsPerPage, excludeIds);

        // Reset selections
        selectedAnswers = {};
        testResults = [];

        renderQuestions();
    } catch (error) {
        console.error('Failed to load questions:', error);
        // Use fallback questions
        currentQuestions = getFallbackQuestions();
        renderQuestions();
    }
}

function renderQuestions() {
    const questionsSection = document.getElementById('questionsSection');
    questionsSection.innerHTML = '';

    currentQuestions.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';

        const questionNumber = currentPage * questionsPerPage + index + 1;

        // Determine question type class
        let typeClass = '';
        if (question.type === 'kanji') typeClass = 'question-type-kanji';
        else if (question.type === 'grammar') typeClass = 'question-type-grammar';
        else if (question.type === 'vocab') typeClass = 'question-type-vocab';

        questionCard.innerHTML = `
            <div class="question-number">
                問題 ${questionNumber}
                <span class="question-type-indicator ${typeClass}">${question.type.toUpperCase()}</span>
            </div>
            <div class="question-text">${question.question.replace(/（　　）/g, '<span class="question-blank">　　　</span>')}</div>
            <div class="answer-options">
                <div class="option-group">
                    <div class="option-label">ア</div>
                    <button class="answer-button" onclick="selectAnswer(${index}, 'ア')" data-question="${index}" data-option="ア">${question.options['ア']}</button>
                    <div class="option-label">イ</div>
                    <button class="answer-button" onclick="selectAnswer(${index}, 'イ')" data-question="${index}" data-option="イ">${question.options['イ']}</button>
                </div>
                <div class="option-group">
                    <div class="option-label">ウ</div>
                    <button class="answer-button" onclick="selectAnswer(${index}, 'ウ')" data-question="${index}" data-option="ウ">${question.options['ウ']}</button>
                    <div class="option-label">エ</div>
                    <button class="answer-button" onclick="selectAnswer(${index}, 'エ')" data-question="${index}" data-option="エ">${question.options['エ']}</button>
                </div>
            </div>
        `;

        questionsSection.appendChild(questionCard);
    });
}

function selectAnswer(questionIndex, option) {
    // Remove previous selection for this question
    document.querySelectorAll(`[data-question="${questionIndex}"]`).forEach(btn => {
        btn.classList.remove('selected');
    });

    // Select new answer
    document.querySelector(`[data-question="${questionIndex}"][data-option="${option}"]`).classList.add('selected');

    // Store answer
    selectedAnswers[questionIndex] = option;
}

async function submitAnswers() {
    // Check if all questions are answered
    if (Object.keys(selectedAnswers).length < currentQuestions.length) {
        alert('Please answer all questions before submitting!');
        return;
    }

    // Hide questions and submit button
    document.getElementById('questionsSection').style.display = 'none';
    document.querySelector('.submit-section').style.display = 'none';

    // Calculate results
    let correctCount = 0;
    testResults = currentQuestions.map((question, index) => {
        const userAnswer = selectedAnswers[index];
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) correctCount++;

        return {
            question_id: question.id,
            user_answer: userAnswer,
            correct_answer: question.correct,
            is_correct: isCorrect
        };
    });

    // Submit to API
    try {
        await submitAnswersToAPI(testResults);
    } catch (error) {
        console.error('Failed to submit answers to API:', error);
    }

    // Show results
    showResults(correctCount);
}

function showResults(correctCount) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = '';

    // Score summary
    const scoreSummary = document.createElement('div');
    scoreSummary.className = 'score-summary';
    scoreSummary.innerHTML = `
        <div class="score-text">Score: ${correctCount}/${currentQuestions.length}</div>
        <div class="score-details">
            ${correctCount === currentQuestions.length ? 'Perfect! 🎉' :
              correctCount >= currentQuestions.length * 0.7 ? 'Good job! 👍' :
              correctCount >= currentQuestions.length * 0.5 ? 'Keep practicing! 📚' :
              'Need more practice! 💪'}
        </div>
    `;
    resultsSection.appendChild(scoreSummary);

    // Individual question results
    testResults.forEach((result, index) => {
        const resultCard = document.createElement('div');
        resultCard.className = `result-card ${result.isCorrect ? 'result-correct' : 'result-incorrect'}`;

        const questionNumber = currentPage * questionsPerPage + index + 1;

        resultCard.innerHTML = `
            <div class="result-header">
                <div class="result-icon">${result.isCorrect ? '✅' : '❌'}</div>
                <div class="result-title">Question ${questionNumber} - ${result.question.type.toUpperCase()}</div>
            </div>
            <div class="your-answer">
                Your answer: <span class="${result.isCorrect ? 'correct-answer' : 'wrong-answer'}">${result.userAnswer}</span>
                ${!result.isCorrect ? ` (Correct: ${result.correctAnswer})` : ''}
            </div>
            <div class="question-text">${result.question.question.replace(/（　　）/g, '<span class="question-blank">　　　</span>')}</div>
            <div class="explanation">
                <div class="explanation-title">Explanation:</div>
                <div class="option-explanation">
                    <span class="option-letter">ア</span>: ${result.question.explanations['ア']}
                </div>
                <div class="option-explanation">
                    <span class="option-letter">イ</span>: ${result.question.explanations['イ']}
                </div>
                <div class="option-explanation">
                    <span class="option-letter">ウ</span>: ${result.question.explanations['ウ']}
                </div>
                <div class="option-explanation">
                    <span class="option-letter">エ</span>: ${result.question.explanations['エ']}
                </div>
            </div>
        `;

        resultsSection.appendChild(resultCard);
    });
}

function previousPage() {
    if (currentPage > 0) {
        currentPage--;
        generateQuestions();
        resetTestUI();
    }
}

function nextPage() {
    currentPage++;
    generateQuestions();
    resetTestUI();
}

function newTest() {
    currentPage = 0;
    selectedAnswers = {};
    testResults = [];
    resetTestUI();
    generateQuestions();
}

function resetTestUI() {
    document.getElementById('questionsSection').style.display = 'block';
    document.querySelector('.submit-section').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeTest);
