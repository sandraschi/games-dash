// Japanese Grammar Pattern Recognition Game
// Comprehensive grammar learning for all JLPT levels

// Grammar pattern data by JLPT level
const grammarPatterns = {
    N5: [
        {
            pattern: '~ます',
            name: 'Polite form',
            explanation: 'The ~ます form is used for polite speech and present/future tense. Add ます to the verb stem.',
            examples: [
                { jp: '食べます', en: 'eat (polite)' },
                { jp: '飲みます', en: 'drink (polite)' },
                { jp: '行きます', en: 'go (polite)' }
            ],
            usage: 'Used in polite conversations, business settings, and formal situations.',
            quiz: { type: 'recognition', question: 'What does ~ます indicate?', answers: ['Polite form', 'Past tense', 'Negative form', 'Volitional'], correct: 'Polite form' }
        },
        {
            pattern: '~ません',
            name: 'Polite negative',
            explanation: 'The ~ません form is used for polite negative statements. Add ません to the verb stem.',
            examples: [
                { jp: '食べません', en: 'don\'t eat (polite)' },
                { jp: '行きません', en: 'don\'t go (polite)' }
            ],
            usage: 'Polite way to refuse or deny something.',
            quiz: { type: 'recognition', question: 'What does ~ません indicate?', answers: ['Polite negative', 'Polite positive', 'Casual negative', 'Past negative'], correct: 'Polite negative' }
        },
        {
            pattern: '~ました',
            name: 'Polite past',
            explanation: 'The ~ました form indicates completed actions in polite speech.',
            examples: [
                { jp: '食べました', en: 'ate (polite)' },
                { jp: '行きました', en: 'went (polite)' }
            ],
            usage: 'Talking about past events politely.',
            quiz: { type: 'recognition', question: 'What does ~ました indicate?', answers: ['Polite past', 'Polite future', 'Casual past', 'Present tense'], correct: 'Polite past' }
        },
        {
            pattern: '~です',
            name: 'Copula (polite)',
            explanation: '~です is the polite form of the copula だ. Used to connect nouns and adjectives.',
            examples: [
                { jp: '学生です', en: 'am a student' },
                { jp: '元気です', en: 'am fine' }
            ],
            usage: 'Making polite statements about identity, state, or characteristics.',
            quiz: { type: 'recognition', question: 'What is ~です?', answers: ['Polite copula', 'Polite verb', 'Question particle', 'Topic particle'], correct: 'Polite copula' }
        },
        {
            pattern: '~か',
            name: 'Question particle',
            explanation: '~か is added to the end of sentences to form yes/no questions.',
            examples: [
                { jp: '学生ですか', en: 'Are you a student?' },
                { jp: '元気ですか', en: 'Are you well?' }
            ],
            usage: 'Forming yes/no questions. Sentence ends with rising intonation.',
            quiz: { type: 'recognition', question: 'What does ~か do?', answers: ['Makes questions', 'Makes statements', 'Shows politeness', 'Shows negation'], correct: 'Makes questions' }
        },
        {
            pattern: '~は',
            name: 'Topic particle',
            explanation: '~は marks the topic of the sentence - what the sentence is about.',
            examples: [
                { jp: '私は学生です', en: 'As for me, I am a student' },
                { jp: '東京は大きいです', en: 'As for Tokyo, it is big' }
            ],
            usage: 'Introducing the main topic being discussed. Often translated as "as for" or "speaking of".',
            quiz: { type: 'recognition', question: 'What does ~は mark?', answers: ['Topic', 'Subject', 'Object', 'Location'], correct: 'Topic' }
        },
        {
            pattern: '~が',
            name: 'Subject particle',
            explanation: '~が marks the subject of the sentence when it\'s new information or contrasted.',
            examples: [
                { jp: '猫が好きです', en: 'I like cats' },
                { jp: '私がします', en: 'I will do it' }
            ],
            usage: 'Marking the grammatical subject, especially when introducing new information.',
            quiz: { type: 'recognition', question: 'What does ~が mark?', answers: ['Subject', 'Topic', 'Object', 'Possession'], correct: 'Subject' }
        },
        {
            pattern: '~に',
            name: 'Direction/Time particle',
            explanation: '~に indicates direction, location of existence, or time.',
            examples: [
                { jp: '学校に行きます', en: 'Go to school' },
                { jp: '東京に住んでいます', en: 'Live in Tokyo' },
                { jp: '3時に会いましょう', en: 'Let\'s meet at 3 o\'clock' }
            ],
            usage: 'Movement toward, location of existence, specific times.',
            quiz: { type: 'recognition', question: 'What can ~に indicate?', answers: ['Direction/Time', 'Possession', 'Means', 'Purpose'], correct: 'Direction/Time' }
        },
        {
            pattern: '~の',
            name: 'Possessive particle',
            explanation: '~の indicates possession or relationship between nouns.',
            examples: [
                { jp: '私の本', en: 'my book' },
                { jp: '学生の時', en: 'when I was a student' }
            ],
            usage: 'Showing possession, attribution, or apposition.',
            quiz: { type: 'recognition', question: 'What does ~の show?', answers: ['Possession', 'Location', 'Time', 'Direction'], correct: 'Possession' }
        },
        {
            pattern: '~を',
            name: 'Object particle',
            explanation: '~を marks the direct object of a transitive verb.',
            examples: [
                { jp: '本を読みます', en: 'read a book' },
                { jp: 'ご飯を食べます', en: 'eat rice' }
            ],
            usage: 'Marking the direct object that receives the action of the verb.',
            quiz: { type: 'recognition', question: 'What does ~を mark?', answers: ['Direct object', 'Indirect object', 'Location', 'Time'], correct: 'Direct object' }
        }
    ],
    N4: [
        {
            pattern: '~たい',
            name: 'Desire (want to)',
            explanation: 'Expresses desire or wanting to do something. Change ます to たい.',
            examples: [
                { jp: '食べたい', en: 'want to eat' },
                { jp: '見たい', en: 'want to see' }
            ],
            usage: 'Expressing personal desires. Cannot be used for third person.',
            quiz: { type: 'recognition', question: 'What does ~たい express?', answers: ['Desire', 'Ability', 'Permission', 'Obligation'], correct: 'Desire' }
        },
        {
            pattern: '~ませんか',
            name: 'Suggestion (polite)',
            explanation: 'Used to make polite suggestions or invitations.',
            examples: [
                { jp: '食べませんか', en: 'Shall we eat?' },
                { jp: '行きませんか', en: 'Shall we go?' }
            ],
            usage: 'Making polite suggestions. Similar to "Why don\'t we...?"',
            quiz: { type: 'recognition', question: 'What does ~ませんか express?', answers: ['Suggestion', 'Question', 'Refusal', 'Obligation'], correct: 'Suggestion' }
        },
        {
            pattern: '~ことができます',
            name: 'Can do (potential)',
            explanation: 'Expresses ability or possibility. Add ることができます to verb stem.',
            examples: [
                { jp: '泳ぐことができます', en: 'can swim' },
                { jp: '日本語を話すことができます', en: 'can speak Japanese' }
            ],
            usage: 'Expressing capability or learned skills.',
            quiz: { type: 'recognition', question: 'What does ~ことができます express?', answers: ['Ability', 'Desire', 'Permission', 'Obligation'], correct: 'Ability' }
        },
        {
            pattern: '~て form',
            name: 'Te-form connecting',
            explanation: 'Connects clauses, makes requests, or indicates means/method.',
            examples: [
                { jp: '食べて寝ます', en: 'eat and sleep' },
                { jp: '歩いて行きます', en: 'go on foot' }
            ],
            usage: 'Connecting actions, means of doing something, making requests.',
            quiz: { type: 'recognition', question: 'What can ~て form do?', answers: ['Connect clauses', 'Make questions', 'Show possession', 'Indicate time'], correct: 'Connect clauses' }
        },
        {
            pattern: '~てください',
            name: 'Please do (request)',
            explanation: 'Polite way to make requests. Te-form + ください.',
            examples: [
                { jp: '食べてください', en: 'please eat' },
                { jp: '来てください', en: 'please come' }
            ],
            usage: 'Making polite requests. Softer than commands.',
            quiz: { type: 'recognition', question: 'What does ~てください do?', answers: ['Makes requests', 'Makes statements', 'Makes questions', 'Shows politeness'], correct: 'Makes requests' }
        },
        {
            pattern: '~と思います',
            name: 'I think',
            explanation: 'Expresses personal opinion. Plain form + と思います.',
            examples: [
                { jp: '美味しいと思います', en: 'I think it\'s delicious' },
                { jp: '行きますと思います', en: 'I think I will go' }
            ],
            usage: 'Expressing personal thoughts and opinions.',
            quiz: { type: 'recognition', question: 'What does ~と思います express?', answers: ['Opinion', 'Fact', 'Question', 'Command'], correct: 'Opinion' }
        },
        {
            pattern: '~から',
            name: 'Because/Since',
            explanation: 'Indicates reason or cause. Can be used with plain or polite forms.',
            examples: [
                { jp: '忙しいから、行けません', en: 'Because I\'m busy, I can\'t go' },
                { jp: '雨だから、傘を持って行きます', en: 'Since it\'s raining, I\'ll take an umbrella' }
            ],
            usage: 'Explaining reasons. The clause with から comes first.',
            quiz: { type: 'recognition', question: 'What does ~から indicate?', answers: ['Reason', 'Time', 'Location', 'Purpose'], correct: 'Reason' }
        },
        {
            pattern: '~とき',
            name: 'When/At the time of',
            explanation: 'Indicates when something happens. Dictionary form + とき.',
            examples: [
                { jp: '子供のとき', en: 'when I was a child' },
                { jp: '食べる時、手を洗います', en: 'When eating, wash your hands' }
            ],
            usage: 'Referring to time periods or specific moments.',
            quiz: { type: 'recognition', question: 'What does ~とき indicate?', answers: ['Time/When', 'Reason', 'Condition', 'Purpose'], correct: 'Time/When' }
        },
        {
            pattern: '~と',
            name: 'Together with/If/When',
            explanation: 'Can mean "with" (accompaniment), "if/when" (condition), or quotes direct speech.',
            examples: [
                { jp: '友達と行きます', en: 'go with friend' },
                { jp: '押すと開きます', en: 'if you push, it opens' },
                { jp: '"こんにちは"と言いました', en: 'said "hello"' }
            ],
            usage: 'Accompaniment, conditional, or quoting speech.',
            quiz: { type: 'recognition', question: 'What can ~と mean?', answers: ['With/If/Quote', 'From/By', 'To/Until', 'About/Of'], correct: 'With/If/Quote' }
        },
        {
            pattern: '~で',
            name: 'At/By/With (means)',
            explanation: 'Indicates location of action, means/method, or tool used.',
            examples: [
                { jp: '学校で勉強します', en: 'study at school' },
                { jp: 'バスで行きます', en: 'go by bus' },
                { jp: '鉛筆で書きます', en: 'write with pencil' }
            ],
            usage: 'Location of action, transportation, tools/instruments.',
            quiz: { type: 'recognition', question: 'What can ~で indicate?', answers: ['Location/Means', 'Time', 'Direction', 'Possession'], correct: 'Location/Means' }
        }
    ],
    N3: [
        {
            pattern: '~たら',
            name: 'Conditional (if/when)',
            explanation: 'Expresses hypothetical or conditional situations. Ta-form + ら.',
            examples: [
                { jp: '雨が降ったら、行きません', en: 'If it rains, I won\'t go' },
                { jp: '時間があれば、行きます', en: 'If I have time, I will go' }
            ],
            usage: 'Hypothetical situations, "if" conditions.',
            quiz: { type: 'recognition', question: 'What does ~たら express?', answers: ['Condition', 'Reason', 'Time', 'Purpose'], correct: 'Condition' }
        },
        {
            pattern: '~てしまう',
            name: 'Completely/Regret',
            explanation: 'Indicates completion of action, often with regret. Te-form + しまう.',
            examples: [
                { jp: '忘れてしまいました', en: 'I completely forgot' },
                { jp: '食べてしまいました', en: 'I ate it all up' }
            ],
            usage: 'Unintentionally completing an action, often with regret.',
            quiz: { type: 'recognition', question: 'What does ~てしまう indicate?', answers: ['Completion/Regret', 'Continuation', 'Ability', 'Desire'], correct: 'Completion/Regret' }
        },
        {
            pattern: '~ておく',
            name: 'Do in advance',
            explanation: 'Doing something in preparation for future. Te-form + おく.',
            examples: [
                { jp: '傘を準備しておきます', en: 'I\'ll prepare an umbrella in advance' },
                { jp: '切っておきます', en: 'I\'ll cut it in advance' }
            ],
            usage: 'Preparatory actions done before needed.',
            quiz: { type: 'recognition', question: 'What does ~ておく mean?', answers: ['Do in advance', 'Do completely', 'Do temporarily', 'Do repeatedly'], correct: 'Do in advance' }
        },
        {
            pattern: '~てある',
            name: 'State resulting from action',
            explanation: 'Indicates current state resulting from a previous action. Te-form + ある.',
            examples: [
                { jp: 'ドアが開けてあります', en: 'The door is open (someone opened it)' },
                { jp: 'ご飯ができてあります', en: 'Dinner is ready (someone prepared it)' }
            ],
            usage: 'Current state resulting from someone\'s action.',
            quiz: { type: 'recognition', question: 'What does ~てある indicate?', answers: ['Resulting state', 'Future action', 'Past action', 'Continuous action'], correct: 'Resulting state' }
        },
        {
            pattern: '~ている',
            name: 'Progressive/Continuative',
            explanation: 'Indicates ongoing action or resulting state. Te-form + いる.',
            examples: [
                { jp: '食べています', en: 'am eating' },
                { jp: '結婚しています', en: 'am married' }
            ],
            usage: 'Ongoing actions or states that continue from past.',
            quiz: { type: 'recognition', question: 'What does ~ている show?', answers: ['Ongoing/Resulting', 'Completed', 'Future', 'Negative'], correct: 'Ongoing/Resulting' }
        },
        {
            pattern: '~てほしい',
            name: 'Want someone to do',
            explanation: 'Expressing desire for someone else to do something. Te-form + ほしい.',
            examples: [
                { jp: '来てほしいです', en: 'I want you to come' },
                { jp: '手伝ってほしい', en: 'I want help' }
            ],
            usage: 'Expressing desire for third party action.',
            quiz: { type: 'recognition', question: 'What does ~てほしい express?', answers: ['Want others to do', 'Want to do', 'Want others to have', 'Want to have'], correct: 'Want others to do' }
        },
        {
            pattern: '~なければならない',
            name: 'Must/Have to',
            explanation: 'Expresses obligation or necessity. Negative + なければならない.',
            examples: [
                { jp: '行かなければなりません', en: 'must go' },
                { jp: '勉強しなければなりません', en: 'must study' }
            ],
            usage: 'Strong obligation or requirement.',
            quiz: { type: 'recognition', question: 'What does ~なければならない express?', answers: ['Obligation', 'Desire', 'Permission', 'Possibility'], correct: 'Obligation' }
        },
        {
            pattern: '~てもいい',
            name: 'May/It\'s okay to',
            explanation: 'Giving or asking permission. Te-form + もいい.',
            examples: [
                { jp: '食べてもいいですか', en: 'May I eat?' },
                { jp: '入ってもいいですよ', en: 'You may enter' }
            ],
            usage: 'Permission or allowance.',
            quiz: { type: 'recognition', question: 'What does ~てもいい mean?', answers: ['May/Allowed', 'Must', 'Cannot', 'Should'], correct: 'May/Allowed' }
        },
        {
            pattern: '~てはいけない',
            name: 'Must not',
            explanation: 'Prohibition or strong negative obligation. Te-form + はいけない.',
            examples: [
                { jp: '行ってはいけません', en: 'must not go' },
                { jp: '触ってはいけない', en: 'must not touch' }
            ],
            usage: 'Strict prohibition.',
            quiz: { type: 'recognition', question: 'What does ~てはいけない mean?', answers: ['Must not', 'May not', 'Cannot', 'Should not'], correct: 'Must not' }
        },
        {
            pattern: '~かもしれない',
            name: 'Maybe/Might',
            explanation: 'Expresses possibility or uncertainty. Plain form + かもしれない.',
            examples: [
                { jp: '雨が降るかもしれません', en: 'It might rain' },
                { jp: '遅れるかもしれません', en: 'might be late' }
            ],
            usage: 'Expressing possibility, speculation.',
            quiz: { type: 'recognition', question: 'What does ~かもしれない express?', answers: ['Possibility', 'Certainty', 'Past', 'Future'], correct: 'Possibility' }
        }
    ]
};

// Game state
let currentGrammarLevel = 'N5';
let currentGrammarMode = 'recognition';
let currentGrammarList = [];
let currentGrammarIndex = 0;
let grammarScore = 0;
let grammarTotalAttempts = 0;
let grammarCorrectAnswers = 0;
let grammarCurrentStreak = 0;

function initializeGrammarGame() {
    setGrammarLevel('N5');
    setGrammarMode('recognition');
    updateGrammarDisplay();
}

function setGrammarLevel(level) {
    currentGrammarLevel = level;

    // Update button states
    document.querySelectorAll('.grammar-level-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Find and activate the button for this level
    const levelButton = document.querySelector(`.grammar-level-button[onclick*="setGrammarLevel('${level}')"]`);
    if (levelButton) {
        levelButton.classList.add('active');
    }

    // Set grammar list
    currentGrammarList = [...grammarPatterns[level]];
    shuffleGrammar();
    updateGrammarDisplay();

    document.getElementById('status').textContent = `JLPT ${level} grammar patterns loaded! Choose practice mode.`;
}

function setGrammarMode(mode) {
    currentGrammarMode = mode;

    // Update button states
    document.querySelectorAll('.grammar-mode-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Find and activate the button for this mode
    const modeButton = document.querySelector(`.grammar-mode-button[onclick*="setGrammarMode('${mode}')"]`);
    if (modeButton) {
        modeButton.classList.add('active');
    }

    // Update UI visibility
    document.getElementById('recognitionMode').style.display = mode === 'recognition' ? 'block' : 'none';
    document.getElementById('constructionMode').style.display = mode === 'construction' ? 'block' : 'none';
    document.getElementById('correctionMode').style.display = mode === 'correction' ? 'block' : 'none';
    document.getElementById('explanationMode').style.display = mode === 'explanation' ? 'block' : 'none';

    updateGrammarDisplay();

    if (mode === 'recognition') {
        generateGrammarAnswerOptions();
    }
}

function updateGrammarDisplay() {
    if (currentGrammarList.length === 0) return;

    const currentPattern = currentGrammarList[currentGrammarIndex];

    document.getElementById('currentPattern').textContent = currentPattern.pattern;
    document.getElementById('patternExample').textContent = currentPattern.examples[0].jp;
    document.getElementById('patternTranslation').textContent = currentPattern.examples[0].en;
    document.getElementById('patternExplanation').textContent = currentPattern.explanation;
    document.getElementById('patternLevel').textContent = currentGrammarLevel;

    updateGrammarStats();
}

function updateGrammarStats() {
    document.getElementById('grammarScore').textContent = grammarScore;
    document.getElementById('grammarStreak').textContent = grammarCurrentStreak;
    const accuracy = grammarTotalAttempts > 0 ? Math.round((grammarCorrectAnswers / grammarTotalAttempts) * 100) : 0;
    document.getElementById('grammarAccuracy').textContent = `${accuracy}%`;
}

function generateGrammarAnswerOptions() {
    const currentPattern = currentGrammarList[currentGrammarIndex];
    const correctAnswer = currentPattern.name;

    // Get 3 wrong answers from other patterns
    const wrongAnswers = [];
    const otherPatterns = currentGrammarList.filter((_, index) => index !== currentGrammarIndex);

    while (wrongAnswers.length < 3 && otherPatterns.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherPatterns.length);
        const wrongPattern = otherPatterns.splice(randomIndex, 1)[0];

        if (wrongPattern.name !== correctAnswer && !wrongAnswers.includes(wrongPattern.name)) {
            wrongAnswers.push(wrongPattern.name);
        }
    }

    // Combine and shuffle answers
    const allAnswers = [correctAnswer, ...wrongAnswers];
    for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    // Create answer buttons
    const answerOptions = document.getElementById('grammarAnswerOptions');
    answerOptions.innerHTML = '';

    allAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'grammar-answer-button';
        button.textContent = answer;
        button.onclick = () => checkGrammarAnswer(answer, correctAnswer, button);
        answerOptions.appendChild(button);
    });
}

function checkGrammarAnswer(selectedAnswer, correctAnswer, button) {
    grammarTotalAttempts++;

    if (selectedAnswer === correctAnswer) {
        grammarCorrectAnswers++;
        grammarCurrentStreak++;
        grammarScore += 10;
        button.classList.add('correct');
        document.getElementById('status').textContent = 'Correct! 🎉';

        setTimeout(() => {
            nextGrammar();
        }, 1000);
    } else {
        grammarCurrentStreak = 0;
        grammarScore = Math.max(0, grammarScore - 5);
        button.classList.add('incorrect');
        document.getElementById('status').textContent = `Incorrect. The correct answer is "${correctAnswer}"`;

        // Highlight correct answer
        const buttons = document.querySelectorAll('.grammar-answer-button');
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });

        setTimeout(() => {
            generateGrammarAnswerOptions();
        }, 2000);
    }

    updateGrammarStats();
}

function nextGrammar() {
    currentGrammarIndex = (currentGrammarIndex + 1) % currentGrammarList.length;
    updateGrammarDisplay();

    if (currentGrammarMode === 'recognition') {
        generateGrammarAnswerOptions();
    } else {
        // Reset input fields
        document.getElementById('constructionInput').value = '';
        document.getElementById('correctionInput').value = '';
        document.getElementById('constructionInput').style.borderColor = '#FF9800';
        document.getElementById('correctionInput').style.borderColor = '#FF9800';
    }
}

function shuffleGrammar() {
    for (let i = currentGrammarList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentGrammarList[i], currentGrammarList[j]] = [currentGrammarList[j], currentGrammarList[i]];
    }
    currentGrammarIndex = 0;
    updateGrammarDisplay();
}

function showExamples() {
    const currentPattern = currentGrammarList[currentGrammarIndex];
    const examplesDiv = document.getElementById('usageExamples');

    examplesDiv.innerHTML = '<h3>Usage Examples:</h3>';
    currentPattern.examples.forEach(example => {
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'usage-example';

        const japaneseDiv = document.createElement('div');
        japaneseDiv.className = 'example-japanese';
        japaneseDiv.textContent = example.jp;

        const translationDiv = document.createElement('div');
        translationDiv.className = 'example-translation';
        translationDiv.textContent = example.en;

        exampleDiv.appendChild(japaneseDiv);
        exampleDiv.appendChild(translationDiv);
        examplesDiv.appendChild(exampleDiv);
    });

    document.getElementById('explanationMode').style.display = 'block';
}

function resetGrammarProgress() {
    grammarScore = 0;
    grammarTotalAttempts = 0;
    grammarCorrectAnswers = 0;
    grammarCurrentStreak = 0;
    updateGrammarStats();
    document.getElementById('status').textContent = 'Progress reset! Keep practicing!';
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGrammarGame);
