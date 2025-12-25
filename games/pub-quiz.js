// Pub Quiz - Trivia Game with 5 Difficulty Levels

const QUESTIONS = {
    easy: [
        { q: "What is the capital of France?", a: ["Paris", "London", "Berlin", "Madrid"], correct: 0 },
        { q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: 2 },
        { q: "What is 2 + 2?", a: ["3", "4", "5", "6"], correct: 1 },
        { q: "What is the largest ocean?", a: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
        { q: "What color do you get when you mix red and blue?", a: ["Green", "Purple", "Orange", "Yellow"], correct: 1 },
        { q: "How many days are in a week?", a: ["5", "6", "7", "8"], correct: 2 },
        { q: "What is the smallest planet in our solar system?", a: ["Mars", "Venus", "Mercury", "Pluto"], correct: 2 },
        { q: "What animal is known as the King of the Jungle?", a: ["Tiger", "Lion", "Elephant", "Bear"], correct: 1 },
        { q: "How many legs does a spider have?", a: ["6", "8", "10", "12"], correct: 1 },
        { q: "What is the capital of Japan?", a: ["Seoul", "Beijing", "Tokyo", "Bangkok"], correct: 2 }
    ],
    medium: [
        { q: "Who wrote 'Romeo and Juliet'?", a: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: 1 },
        { q: "What is the chemical symbol for gold?", a: ["Go", "Gd", "Au", "Ag"], correct: 2 },
        { q: "In which year did World War II end?", a: ["1943", "1944", "1945", "1946"], correct: 2 },
        { q: "What is the square root of 64?", a: ["6", "7", "8", "9"], correct: 2 },
        { q: "Which planet is known as the Red Planet?", a: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
        { q: "Who painted the Mona Lisa?", a: ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"], correct: 2 },
        { q: "What is the largest mammal in the world?", a: ["Elephant", "Giraffe", "Blue Whale", "Hippopotamus"], correct: 2 },
        { q: "How many chambers does a human heart have?", a: ["2", "3", "4", "5"], correct: 2 },
        { q: "What is the speed of light in vacuum (approximately)?", a: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], correct: 0 },
        { q: "Which gas makes up most of Earth's atmosphere?", a: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2 }
    ],
    hard: [
        { q: "What is the molecular formula for water?", a: ["H2O", "CO2", "O2", "H2O2"], correct: 0 },
        { q: "Who composed 'The Four Seasons'?", a: ["Mozart", "Beethoven", "Vivaldi", "Bach"], correct: 2 },
        { q: "What is the smallest prime number?", a: ["0", "1", "2", "3"], correct: 2 },
        { q: "In which year did the Berlin Wall fall?", a: ["1987", "1989", "1991", "1993"], correct: 1 },
        { q: "What is the derivative of x²?", a: ["x", "2x", "x²", "2x²"], correct: 1 },
        { q: "Which element has the atomic number 1?", a: ["Helium", "Hydrogen", "Lithium", "Carbon"], correct: 1 },
        { q: "Who wrote '1984'?", a: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"], correct: 1 },
        { q: "What is the capital of Australia?", a: ["Sydney", "Melbourne", "Canberra", "Brisbane"], correct: 2 },
        { q: "How many bones are in an adult human body?", a: ["196", "206", "216", "226"], correct: 1 },
        { q: "What is the largest organ in the human body?", a: ["Liver", "Lungs", "Skin", "Intestines"], correct: 2 }
    ],
    expert: [
        { q: "What is the Heisenberg Uncertainty Principle?", a: ["Energy cannot be created", "Position and momentum cannot be precisely known", "Light is both wave and particle", "Time is relative"], correct: 1 },
        { q: "Who proved Fermat's Last Theorem?", a: ["Gauss", "Euler", "Andrew Wiles", "Riemann"], correct: 2 },
        { q: "What is the name of the process by which plants convert light into energy?", a: ["Respiration", "Photosynthesis", "Fermentation", "Oxidation"], correct: 1 },
        { q: "In quantum mechanics, what does Schrödinger's cat illustrate?", a: ["Wave function", "Quantum superposition", "Particle duality", "Entanglement"], correct: 1 },
        { q: "What is the capital of Bhutan?", a: ["Kathmandu", "Thimphu", "Dhaka", "Colombo"], correct: 1 },
        { q: "Who wrote 'The Structure of Scientific Revolutions'?", a: ["Karl Popper", "Thomas Kuhn", "Imre Lakatos", "Paul Feyerabend"], correct: 1 },
        { q: "What is the Riemann Hypothesis about?", a: ["Prime numbers", "Zeta function zeros", "Fermat's theorem", "Goldbach conjecture"], correct: 1 },
        { q: "Which philosopher wrote 'Being and Time'?", a: ["Sartre", "Heidegger", "Nietzsche", "Kant"], correct: 1 },
        { q: "What is the speed of sound at sea level (approximately)?", a: ["330 m/s", "343 m/s", "350 m/s", "360 m/s"], correct: 1 },
        { q: "Who discovered penicillin?", a: ["Louis Pasteur", "Alexander Fleming", "Robert Koch", "Joseph Lister"], correct: 1 }
    ],
    insane: [
        { q: "What is the exact value of the fine-structure constant (α)?", a: ["1/137.036", "1/137.035999", "1/137.035999084", "1/137.035999206"], correct: 2 },
        { q: "In which year did Gödel publish his incompleteness theorems?", a: ["1929", "1931", "1933", "1935"], correct: 1 },
        { q: "What is the name of the paradox that questions whether a set of all sets that don't contain themselves contains itself?", a: ["Zeno's Paradox", "Russell's Paradox", "Liar's Paradox", "Ship of Theseus"], correct: 1 },
        { q: "What is the capital of Nauru?", a: ["Yaren", "Tarawa", "Funafuti", "Majuro"], correct: 0 },
        { q: "Who formulated the Navier-Stokes equations?", a: ["Euler and Bernoulli", "Navier and Stokes", "Newton and Leibniz", "Lagrange and Hamilton"], correct: 1 },
        { q: "What is the exact number of possible positions in chess (Shannon number estimate)?", a: ["10^40", "10^43", "10^47", "10^50"], correct: 1 },
        { q: "In which year was the first successful cloning of a mammal (Dolly the sheep)?", a: ["1994", "1996", "1997", "1999"], correct: 2 },
        { q: "What is the name of the theorem that states any consistent formal system capable of expressing arithmetic is incomplete?", a: ["Church-Turing Thesis", "Gödel's Incompleteness", "Tarski's Undefinability", "Löb's Theorem"], correct: 1 },
        { q: "What is the exact value of Planck's constant (h) in J⋅s?", a: ["6.62607015×10^-34", "6.62607004×10^-34", "6.62606957×10^-34", "6.62606896×10^-34"], correct: 0 },
        { q: "Who proved that the set of real numbers is uncountable?", a: ["Cantor", "Dedekind", "Weierstrass", "Bolzano"], correct: 0 }
    ]
};

// Game state
let gameState = {
    difficulty: null,
    currentQuestion: 0,
    score: 0,
    correct: 0,
    questions: [],
    answered: false,
    gameActive: false
};

// Start quiz
function startQuiz(difficulty) {
    gameState.difficulty = difficulty;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correct = 0;
    gameState.questions = [...QUESTIONS[difficulty]].sort(() => Math.random() - 0.5).slice(0, 10);
    gameState.answered = false;
    gameState.gameActive = true;
    
    document.getElementById('difficulty-selector').style.display = 'none';
    document.getElementById('stats').style.display = 'flex';
    document.getElementById('quiz-container').style.display = 'block';
    
    showQuestion();
}

// Show current question
function showQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    if (!question) {
        endQuiz();
        return;
    }
    
    document.getElementById('question').textContent = question.q;
    document.getElementById('question-num').textContent = `${gameState.currentQuestion + 1}/10`;
    
    const answersEl = document.getElementById('answers');
    answersEl.innerHTML = '';
    
    question.a.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(index);
        answersEl.appendChild(btn);
    });
    
    document.getElementById('next-btn').style.display = 'none';
    gameState.answered = false;
    updateStatus(`Question ${gameState.currentQuestion + 1} of 10`);
}

// Select answer
function selectAnswer(index) {
    if (gameState.answered) return;
    
    gameState.answered = true;
    const question = gameState.questions[gameState.currentQuestion];
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === question.correct) {
            btn.classList.add('correct');
        } else if (i === index && i !== question.correct) {
            btn.classList.add('incorrect');
        }
    });
    
    if (index === question.correct) {
        gameState.score += getPoints();
        gameState.correct++;
        updateStatus('✅ Correct!');
    } else {
        updateStatus(`❌ Wrong! The correct answer was: ${question.a[question.correct]}`);
    }
    
    updateStats();
    document.getElementById('next-btn').style.display = 'inline-block';
}

// Get points based on difficulty
function getPoints() {
    const points = {
        easy: 10,
        medium: 20,
        hard: 30,
        expert: 50,
        insane: 100
    };
    return points[gameState.difficulty] || 10;
}

// Next question
function nextQuestion() {
    gameState.currentQuestion++;
    if (gameState.currentQuestion >= gameState.questions.length) {
        endQuiz();
    } else {
        showQuestion();
    }
}

// Update stats
function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('correct').textContent = gameState.correct;
}

// End quiz
function endQuiz() {
    gameState.gameActive = false;
    const percentage = Math.round((gameState.correct / gameState.questions.length) * 100);
    
    let message = `Quiz Complete! Score: ${gameState.score} points (${gameState.correct}/${gameState.questions.length} correct - ${percentage}%)`;
    
    if (percentage === 100) {
        message = `🏆 Perfect Score! ${message}`;
    } else if (percentage >= 80) {
        message = `🎉 Excellent! ${message}`;
    } else if (percentage >= 60) {
        message = `👍 Good job! ${message}`;
    } else if (percentage >= 40) {
        message = `📚 Keep learning! ${message}`;
    } else {
        message = `💪 Try again! ${message}`;
    }
    
    updateStatus(message);
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('difficulty-selector').style.display = 'flex';
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}
