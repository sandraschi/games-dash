// Crossword Game Implementation
// **Timestamp**: 2025-12-04

let currentPuzzle = null;
let userAnswers = {};
let selectedCell = null;
let currentDirection = 'across';
let currentLanguage = 'en';

// Generate a crossword puzzle
// Generate a crossword puzzle using the professional generator
function generateCrossword(size = 15, difficulty = 'medium') {
    console.log(`Generating ${size}x${size} ${difficulty} crossword using Professional generator...`);
    updateStatus(`Generating ${difficulty} ${size}×${size} crossword...`);

    try {
        const sizeNum = parseInt(size);
        const generator = new ProfessionalCrosswordGenerator(sizeNum, difficulty);
        const puzzle = generator.generate();

        if (puzzle) {
            loadPuzzle(puzzle);
            updateStatus(`Generated new ${difficulty} ${size}×${size} crossword puzzle!`);
        } else {
            throw new Error("Generator returned no puzzle (null result)");
        }
    } catch (err) {
        console.error("CRITICAL GENERATION FAILURE:", err);
        console.error("Stack Trace:", err.stack);
        updateStatus(`Error: ${err.message}. Check console for details.`);
        alert(`Generation Failed:\n${err.message}\n\nPlease check the console (F12) for debugging details.`);
    }
}




// Fallback basic crossword generation
function createBasicCrossword(size, difficulty) {
    console.log('Using fallback crossword generation...');

    const grid = Array(size).fill().map(() => Array(size).fill(''));
    const words = generateWordsForSize(size, difficulty);
    const placedWords = placeWordsInGrid(grid, words, size);

    // Note: generateClues handles the clue mapping
    const clues = generateClues(placedWords);

    return {
        name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Puzzle (Basic)`,
        difficulty: difficulty,
        size: size,
        grid: grid,
        across: clues.across,
        down: clues.down,
        solution: grid.map(row => [...row])
    };
}

// UI Bridge functions to align with crossword.html
function checkAnswers() {
    checkPuzzle();
}

function revealSquare() {
    revealLetter();
}

function loadFromFile(event) {
    importCrossword(event);
}

function printPuzzle() {
    window.print();
}


function newGame() {
    // Generate a random difficulty
    const difficulties = ['easy', 'medium', 'hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const size = randomDifficulty === 'easy' ? 10 : randomDifficulty === 'medium' ? 15 : 20;

    generateCrossword(size, randomDifficulty);
}

// Enhanced crossword word database with professional-quality words and clues
const CROSSWORD_DICTIONARY = {
    // Easy 3-5 letter words
    easy: {
        'CAT': 'Feline pet',
        'DOG': 'Man\'s best friend',
        'RUN': 'Move quickly',
        'JUMP': 'Leap upward',
        'PLAY': 'Recreational activity',
        'BOOK': 'Bound collection of pages',
        'TREE': 'Tall woody plant',
        'HOUSE': 'Place of residence',
        'CAR': 'Automobile',
        'BOAT': 'Water vessel',
        'SUN': 'Center of our solar system',
        'MOON': 'Earth\'s natural satellite',
        'STAR': 'Luminous celestial body',
        'RAIN': 'Water from clouds',
        'SNOW': 'Frozen precipitation',
        'FIRE': 'Combustion process',
        'WATER': 'Universal solvent',
        'EARTH': 'Our planet',
        'WIND': 'Moving air',
        'TIME': 'Fourth dimension',
        'BIRD': 'Feathered creature',
        'FISH': 'Aquatic animal',
        'BEAR': 'Large mammal',
        'LION': 'King of beasts',
        'TIGER': 'Striped feline',
        'HORSE': 'Equine animal',
        'COW': 'Farm animal',
        'PIG': 'Farm mammal',
        'SHEEP': 'Wool producer',
        'GOAT': 'Mountain animal',
        'DUCK': 'Water bird',
        'HEN': 'Female chicken',
        'BEE': 'Honey maker',
        'ANT': 'Colony insect',
        'SPIDER': 'Eight-legged arachnid',
        'SNAKE': 'Reptilian creature',
        'FROG': 'Amphibian',
        'TOAD': 'Warty amphibian',
        'APPLE': 'Red fruit',
        'PEAR': 'Bell-shaped fruit',
        'GRAPE': 'Vine fruit',
        'LEMON': 'Citrus fruit',
        'ORANGE': 'Citrus sphere',
        'BANANA': 'Curved fruit',
        'TOMATO': 'Red vegetable/fruit',
        'POTATO': 'Starchy tuber',
        'CARROT': 'Orange root vegetable',
        'ONION': 'Pungent bulb',
        'GARLIC': 'Aromatic bulb',
        'PEPPER': 'Spicy vegetable',
        'BEAN': 'Leguminous seed',
        'RICE': 'Grain staple',
        'WHEAT': 'Bread grain',
        'CORN': 'Maize plant',
        'MILK': 'Dairy product',
        'CHEESE': 'Dairy food',
        'BREAD': 'Baked dough',
        'MEAT': 'Animal flesh',
        'FISH': 'Seafood',
        'EGG': 'Hen\'s product',
        'SALT': 'Mineral seasoning',
        'SUGAR': 'Sweetener',
        'OIL': 'Liquid fat',
        'TEA': 'Beverage leaves',
        'COFFEE': 'Caffeine drink',
        'JUICE': 'Fruit liquid',
        'BEER': 'Alcoholic beverage',
        'WINE': 'Fermented drink'
    },

    // Medium 4-8 letter words
    medium: {
        'COMPUTER': 'Electronic brain',
        'ELEPHANT': 'Largest land mammal',
        'BUTTERFLY': 'Colorful insect',
        'CHOCOLATE': 'Sweet confection',
        'TELEPHONE': 'Communication device',
        'DINOSAUR': 'Extinct reptile',
        'VOLCANO': 'Mountain that erupts',
        'OCEAN': 'Large body of water',
        'MOUNTAIN': 'High landform',
        'FOREST': 'Dense woodland',
        'UNIVERSE': 'All of existence',
        'GALAXY': 'Star system collection',
        'PLANET': 'Orbital body',
        'ASTRONAUT': 'Space traveler',
        'TELESCOPE': 'Observation instrument',
        'MICROSCOPE': 'Magnification tool',
        'LABORATORY': 'Scientific workspace',
        'EXPERIMENT': 'Scientific test',
        'CHEMISTRY': 'Study of matter',
        'PHYSICS': 'Study of energy and matter',
        'BIOLOGY': 'Study of life',
        'GEOLOGY': 'Study of Earth\'s structure',
        'HISTORY': 'Study of the past',
        'GEOGRAPHY': 'Study of Earth\'s features',
        'MATHEMATICS': 'Study of numbers',
        'LITERATURE': 'Written works',
        'MUSIC': 'Art of sound',
        'ART': 'Visual creativity',
        'THEATER': 'Dramatic performance',
        'CINEMA': 'Motion pictures',
        'TELEVISION': 'Electronic entertainment',
        'RADIO': 'Wireless communication',
        'NEWSPAPER': 'Printed news',
        'MAGAZINE': 'Periodical publication',
        'LIBRARY': 'Book repository',
        'SCHOOL': 'Educational institution',
        'UNIVERSITY': 'Higher education',
        'HOSPITAL': 'Medical facility',
        'DOCTOR': 'Medical practitioner',
        'NURSE': 'Healthcare worker',
        'TEACHER': 'Education professional',
        'ENGINEER': 'Technical designer',
        'SCIENTIST': 'Research professional',
        'ARTIST': 'Creative professional',
        'WRITER': 'Literary creator',
        'MUSICIAN': 'Sound artist',
        'ACTOR': 'Performance artist',
        'DIRECTOR': 'Film/TV leader',
        'POLITICIAN': 'Government figure',
        'PRESIDENT': 'Head of state',
        'GOVERNOR': 'State leader',
        'MAYOR': 'City leader',
        'JUDGE': 'Legal authority',
        'LAWYER': 'Legal professional',
        'POLICE': 'Law enforcement',
        'FIREMAN': 'Firefighter',
        'SOLDIER': 'Military member',
        'PILOT': 'Aircraft operator',
        'DRIVER': 'Vehicle operator',
        'COOK': 'Kitchen chef',
        'WAITER': 'Restaurant server',
        'FARMER': 'Agricultural worker',
        'BUILDER': 'Construction worker',
        'PLUMBER': 'Pipe specialist',
        'ELECTRICIAN': 'Electrical expert',
        'MECHANIC': 'Repair specialist',
        'CARPENTER': 'Wood worker',
        'PAINTER': 'Art creator',
        'SCULPTOR': '3D artist',
        'PHOTOGRAPHER': 'Image capture artist',
        'JOURNALIST': 'News reporter',
        'EDITOR': 'Content reviser',
        'PUBLISHER': 'Content distributor',
        'TRANSLATOR': 'Language converter',
        'INTERPRETER': 'Real-time translator'
    },

    // Hard 6+ letter words
    hard: {
        'PHOTOSYNTHESIS': 'Plant food production',
        'CHROMATOGRAPHY': 'Separation technique',
        'ELECTROMAGNETISM': 'Electric-magnetic interaction',
        'QUANTUMMECHANICS': 'Subatomic physics',
        'NEUROTRANSMITTER': 'Brain chemical messenger',
        'PALAEONTOLOGY': 'Study of fossils',
        'CRYSTALLOGRAPHY': 'Crystal structure study',
        'THERMODYNAMICS': 'Heat and energy study',
        'PHILOSOPHICAL': 'Deep thinking approach',
        'CHARACTERIZATION': 'Detailed description',
        'INTERNATIONALIZATION': 'Global adaptation',
        'RESPONSIBILITY': 'Accountability',
        'COMMUNICATION': 'Information exchange',
        'TECHNOLOGY': 'Applied science',
        'INNOVATION': 'Creative improvement',
        'DEVELOPMENT': 'Progressive change',
        'ENVIRONMENT': 'Surrounding conditions',
        'SUSTAINABILITY': 'Long-term viability',
        'BIODIVERSITY': 'Species variety',
        'CLIMATECHANGE': 'Global warming effect',
        'GLOBALIZATION': 'World interconnection',
        'DEMOCRATIZATION': 'Democratic expansion',
        'INDUSTRIALIZATION': 'Manufacturing growth',
        'URBANIZATION': 'City development',
        'MODERNIZATION': 'Contemporary updating',
        'DIGITALIZATION': 'Electronic conversion',
        'AUTOMATION': 'Mechanical operation',
        'ROBOTIZATION': 'Robot implementation',
        'ARTIFICIALINTELLIGENCE': 'Machine learning',
        'MACHINELEARNING': 'Algorithmic prediction',
        'DEEPLEARNING': 'Neural network training',
        'NEURALNETWORK': 'Brain-inspired computing',
        'COMPUTERVISION': 'Visual AI processing',
        'NATURALLANGUAGEPROCESSING': 'Text understanding AI',
        'CYBERSECURITY': 'Digital protection',
        'BLOCKCHAIN': 'Distributed ledger',
        'CRYPTOCURRENCY': 'Digital money',
        'INTERNETOFTHINGS': 'Connected devices',
        'AUGMENTEDREALITY': 'Enhanced perception',
        'VIRTUALREALITY': 'Immersive simulation',
        'NANOTECHNOLOGY': 'Molecular engineering',
        'BIOTECHNOLOGY': 'Biological technology',
        'GENETICENGINEERING': 'DNA modification',
        'CLONING': 'Genetic duplication',
        'STEMCELLRESEARCH': 'Regenerative medicine',
        'PERSONALIZEDMEDICINE': 'Tailored healthcare',
        'TELEMEDICINE': 'Remote healthcare',
        'MENTALHEALTH': 'Psychological wellbeing',
        'PSYCHOLOGY': 'Mind study',
        'SOCIOLOGY': 'Society study',
        'ANTHROPOLOGY': 'Human culture study',
        'ARCHAEOLOGY': 'Ancient artifact study',
        'LINGUISTICS': 'Language study',
        'PHILOLOGY': 'Historical language study',
        'SEMIOTICS': 'Sign and symbol study',
        'HERMENEUTICS': 'Interpretation theory',
        'PHENOMENOLOGY': 'Experience study',
        'EXISTENTIALISM': 'Being philosophy',
        'PRAGMATISM': 'Practical philosophy',
        'EMPIRICISM': 'Experience-based knowledge',
        'RATIONALISM': 'Reason-based knowledge',
        'UTILITARIANISM': 'Benefit-maximizing ethics',
        'DEONTOLOGY': 'Duty-based ethics',
        'VIRTUEETHICS': 'Character-based morality',
        'METAPHYSICS': 'Reality study',
        'EPISTEMOLOGY': 'Knowledge theory',
        'AXIOLOGY': 'Value theory',
        'AESTHETICS': 'Beauty study',
        'COSMOLOGY': 'Universe study',
        'ONTOLOGY': 'Being study',
        'TELEOLOGY': 'Purpose study',
        'CAUSALITY': 'Cause-effect relationship',
        'DETERMINISM': 'Predetermined outcomes',
        'FREEWILL': 'Personal choice ability',
        'CONSCIOUSNESS': 'Self-awareness',
        'INTELLIGENCE': 'Cognitive ability',
        'CREATIVITY': 'Original thinking',
        'IMAGINATION': 'Mental invention',
        'PERCEPTION': 'Sensory awareness',
        'MEMORY': 'Information retention',
        'LEARNING': 'Knowledge acquisition',
        'REASONING': 'Logical thinking',
        'JUDGMENT': 'Decision making',
        'INTUITION': 'Instinctive knowing'
    }
};

// Merge LARGE_WORD_DATABASE if it exists (from word_database.js)
if (typeof LARGE_WORD_DATABASE !== 'undefined') {
    console.log("Merging LARGE_WORD_DATABASE...", LARGE_WORD_DATABASE);

    // Helper to merge dictionaries
    const mergeDicts = (source, target) => {
        for (const [word, clue] of Object.entries(source)) {
            // Only add if not present (preserve existing themed clues)
            if (!target[word]) {
                target[word] = clue;
            }
        }
    };

    // Merge categories
    if (LARGE_WORD_DATABASE.easy) mergeDicts(LARGE_WORD_DATABASE.easy, CROSSWORD_DICTIONARY.easy);
    if (LARGE_WORD_DATABASE.medium) mergeDicts(LARGE_WORD_DATABASE.medium, CROSSWORD_DICTIONARY.medium);
    if (LARGE_WORD_DATABASE.hard) mergeDicts(LARGE_WORD_DATABASE.hard, CROSSWORD_DICTIONARY.hard);

    console.log("Word database merged. Total words:",
        Object.keys(CROSSWORD_DICTIONARY.easy).length +
        Object.keys(CROSSWORD_DICTIONARY.medium).length +
        Object.keys(CROSSWORD_DICTIONARY.hard).length
    );
}

// Generate appropriate words based on grid size and difficulty
function generateWordsForSize(size, difficulty) {
    const wordDict = CROSSWORD_DICTIONARY[difficulty] || CROSSWORD_DICTIONARY.medium;
    const words = Object.keys(wordDict);

    // Filter words by length and select appropriate number
    const suitableWords = words.filter(word => word.length <= size && word.length >= 3);
    const targetWordCount = Math.min(suitableWords.length, Math.max(8, Math.floor(size * 1.5)));

    // Select words with some randomness but preference for common words
    const selectedWords = [];
    const shuffled = [...suitableWords].sort(() => Math.random() - 0.5);

    for (const word of shuffled) {
        if (selectedWords.length >= targetWordCount) break;
        // Higher chance for shorter words on smaller grids
        const lengthBonus = size > 10 ? 1 : (word.length <= 5 ? 1.5 : 0.8);
        if (Math.random() < (0.6 * lengthBonus)) {
            selectedWords.push(word);
        }
    }

    return selectedWords;
}

// Place words in structured grid with better intersection logic
function placeWordsInGrid(grid, words, size) {
    const placedWords = { across: {}, down: {} };
    let clueNumber = 1;

    // Sort words by length (longer first for better placement)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
        // Try both directions, preferring the one with better intersections
        let bestPlacement = null;
        let bestScore = -1;

        for (const direction of ['across', 'down']) {
            const placement = tryPlaceWord(grid, word, direction, size, clueNumber);
            if (placement) {
                const score = evaluateWordPlacement(grid, word, placement.row, placement.col, direction, size);
                if (score > bestScore) {
                    bestScore = score;
                    bestPlacement = { ...placement, direction };
                }
            }
        }

        if (bestPlacement) {
            // Place the word
            placeWordInGrid(grid, word, bestPlacement.row, bestPlacement.col, bestPlacement.direction);

            // Record placement
            const placementKey = bestPlacement.direction === 'across' ? 'across' : 'down';
            placedWords[placementKey][clueNumber] = {
                clue: getClueFromDictionary(word),
                answer: word,
                row: bestPlacement.row,
                col: bestPlacement.col,
                length: word.length
            };
            clueNumber++;
        }
    }

    return placedWords;
}

// Evaluate how good a word placement is (higher score = better)
function evaluateWordPlacement(grid, word, row, col, direction, size) {
    let score = 0;

    // Base score for successful placement
    score += 10;

    // Bonus for longer words
    score += word.length * 2;

    // Bonus for creating intersections
    const intersections = countIntersections(grid, word, row, col, direction, size);
    score += intersections * 5;

    // Bonus for connections to existing structure
    const connections = countConnections(grid, word, row, col, direction, size);
    score += connections * 3;

    return score;
}

// Count potential intersections with existing letters
function countIntersections(grid, word, row, col, direction, size) {
    let intersections = 0;

    for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;

        if (r >= 0 && r < size && c >= 0 && c < size) {
            // Check perpendicular direction for potential intersections
            const perpDirection = direction === 'across' ? 'down' : 'across';

            if (perpDirection === 'down') {
                // Check if there's space above or below for intersecting words
                if ((r > 0 && grid[r - 1][c] === '') ||
                    (r < size - 1 && grid[r + 1][c] === '')) {
                    intersections++;
                }
            } else {
                // Check if there's space left or right for intersecting words
                if ((c > 0 && grid[r][c - 1] === '') ||
                    (c < size - 1 && grid[r][c + 1] === '')) {
                    intersections++;
                }
            }
        }
    }

    return intersections;
}

// Count connections to existing words
function countConnections(grid, word, row, col, direction, size) {
    let connections = 0;

    for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;

        if (r >= 0 && r < size && c >= 0 && c < size) {
            if (grid[r][c] !== '' && grid[r][c] !== '#') {
                connections++;
            }
        }
    }

    return connections;
}

// Try to place a word in the grid
function tryPlaceWord(grid, word, direction, size, clueNumber) {
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (canPlaceWord(grid, word, row, col, direction, size)) {
            placeWordInGrid(grid, word, row, col, direction);
            return { row, col, direction };
        }
    }

    return null; // Couldn't place the word
}

// Check if a word can be placed at the given position
function canPlaceWord(grid, word, row, col, direction, size) {
    for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;

        if (r >= size || c >= size) return false;
        if (grid[r][c] === '#') return false;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }

    return true;
}

// Place a word in the grid
function placeWordInGrid(grid, word, row, col, direction) {
    for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;

        grid[r][c] = word[i];
    }
}

// Generate a clue for a word
function generateClue(word) {
    const clues = {
        'CAT': 'Feline pet',
        'DOG': 'Canine companion',
        'RUN': 'Move quickly on foot',
        'JUMP': 'Leap into the air',
        'PLAY': 'Engage in recreation',
        'BOOK': 'Written work bound together',
        'TREE': 'Tall woody plant',
        'HOUSE': 'Place of residence',
        'CAR': 'Four-wheeled vehicle',
        'BOAT': 'Watercraft',
        'SUN': 'Star at center of solar system',
        'MOON': 'Natural satellite',
        'STAR': 'Luminous celestial body',
        'RAIN': 'Precipitation from clouds',
        'SNOW': 'Frozen precipitation',
        'FIRE': 'Combustion reaction',
        'WATER': 'Clear liquid essential for life',
        'EARTH': 'Third planet from the sun',
        'WIND': 'Moving air',
        'TIME': 'Fourth dimension'
    };

    return clues[word] || `Definition for ${word}`;
}

// Generate all clues
function generateClues(placedWords) {
    return placedWords;
}

// Built-in crossword puzzles
const PUZZLES_EN = [
    {
        // Mini 5x5 puzzle - FIXED
        name: "Mini Puzzle",
        difficulty: "easy",
        size: 5,
        grid: [
            ['C', 'A', 'T', '#', '#'],
            ['A', '#', 'S', '#', '#'],
            ['R', 'U', 'N', '#', '#'],
            ['#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "Feline pet", answer: "CAT", row: 0, col: 0 },
            2: { clue: "Feline pets (plural)", answer: "CATS", row: 0, col: 0 },
            3: { clue: "Moves quickly on foot", answer: "RUN", row: 2, col: 0 }
        },
        down: {
            1: { clue: "Vehicle for transport", answer: "CAR", row: 0, col: 0 },
            2: { clue: "Opposite of 'no'", answer: "A", row: 0, col: 1 },
            3: { clue: "What you do with a book", answer: "READ", row: 0, col: 2 }
        }
    },
    {
        // Easy 7x7 puzzle - FIXED
        name: "Easy Crossword",
        difficulty: "easy",
        size: 7,
        grid: [
            ['B', 'O', 'O', 'K', '#', '#', '#'],
            ['#', '#', '#', '#', 'C', 'A', 'T'],
            ['#', '#', 'P', 'L', 'A', 'Y', '#'],
            ['D', 'O', 'G', '#', '#', '#', '#'],
            ['#', '#', '#', 'R', 'E', 'A', 'D'],
            ['#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "Something you read", answer: "BOOK", row: 0, col: 0 },
            4: { clue: "Feline pet", answer: "CAT", row: 1, col: 4 },
            5: { clue: "Children do this for fun", answer: "PLAY", row: 2, col: 2 },
            6: { clue: "Canine pet", answer: "DOG", row: 3, col: 0 },
            7: { clue: "Look at words in a book", answer: "READ", row: 4, col: 3 }
        },
        down: {
            1: { clue: "Vehicle for transport", answer: "BOAT", row: 0, col: 0 },
            2: { clue: "Preposition meaning 'on top of'", answer: "ON", row: 0, col: 1 },
            3: { clue: "Opposite of 'off'", answer: "ON", row: 0, col: 2 },
            4: { clue: "Feline pet", answer: "CAT", row: 0, col: 4 }
        }
    },
    {
        // Medium 10x10 puzzle
        name: "Medium Crossword",
        difficulty: "medium",
        size: 10,
        grid: [
            ['C', 'O', 'M', 'P', 'U', 'T', 'E', 'R', '#', '#'],
            ['#', 'C', '#', '#', '#', '#', 'A', '#', 'M', 'A'],
            ['#', 'E', '#', 'G', 'A', 'M', 'E', 'S', 'O', 'T'],
            ['#', 'A', '#', '#', '#', '#', 'D', '#', 'U', 'H'],
            ['W', 'N', 'O', 'R', 'D', 'S', '#', '#', 'S', '#'],
            ['#', '#', '#', '#', '#', '#', 'P', 'I', 'E', '#'],
            ['#', 'M', 'U', 'S', 'I', 'C', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', 'O', '#', 'A', 'R', 'T'],
            ['#', '#', '#', '#', '#', 'D', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', 'E', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "Device for typing and browsing", answer: "COMPUTER", row: 0, col: 0 },
            8: { clue: "Mathematical subject", answer: "MATH", row: 1, col: 6 },
            10: { clue: "Entertainment software", answer: "GAMES", row: 2, col: 3 },
            15: { clue: "Letters that make sentences", answer: "WORDS", row: 4, col: 0 },
            18: { clue: "Dessert you bake", answer: "PIE", row: 5, col: 5 },
            20: { clue: "Sounds and melodies", answer: "MUSIC", row: 6, col: 1 },
            25: { clue: "Creative visual work", answer: "ART", row: 7, col: 7 }
        },
        down: {
            2: { clue: "Large body of water", answer: "OCEAN", row: 0, col: 1 },
            5: { clue: "Consumed food", answer: "ATE", row: 0, col: 6 },
            7: { clue: "Rodent; computer device", answer: "MOUSE", row: 1, col: 8 },
            12: { clue: "To peruse text", answer: "READ", row: 2, col: 6 },
            17: { clue: "Computer encoding", answer: "CODE", row: 4, col: 5 }
        }
    },
    {
        // Hard 10x10 puzzle - FIXED and simplified
        name: "Hard Crossword",
        difficulty: "hard",
        size: 10,
        grid: [
            ['P', 'R', 'O', 'G', 'R', 'A', 'M', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', 'I', '#', '#', '#'],
            ['#', '#', 'T', 'E', 'C', 'H', 'N', 'O', 'L', 'O'],
            ['#', '#', '#', '#', '#', '#', 'G', '#', '#', '#'],
            ['A', 'L', 'G', 'O', 'R', 'I', 'T', 'H', 'M', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', 'D', 'A', 'T', 'A', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['S', 'O', 'F', 'T', 'W', 'A', 'R', 'E', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "Writing code for computers", answer: "PROGRAM", row: 0, col: 0 },
            4: { clue: "Modern tools and innovations", answer: "TECHNOLOGY", row: 2, col: 2 },
            5: { clue: "Step-by-step procedure", answer: "ALGORITHM", row: 4, col: 0 },
            6: { clue: "Information in digital form", answer: "DATA", row: 6, col: 2 },
            7: { clue: "Programs and applications", answer: "SOFTWARE", row: 8, col: 0 }
        },
        down: {
            1: { clue: "Vehicle for transport", answer: "PASS", row: 0, col: 0 },
            2: { clue: "Opposite of 'off'", answer: "ON", row: 0, col: 1 },
            3: { clue: "Thing or item", answer: "OBJECT", row: 0, col: 2 }
        }
    }
];

function loadPuzzle(puzzle) {
    currentPuzzle = puzzle;
    userAnswers = {};
    selectedCell = null;

    // Update UI elements
    document.getElementById('puzzleTitle').textContent = puzzle.name;
    document.getElementById('puzzleSize').textContent = `${puzzle.size}×${puzzle.size}`;
    document.getElementById('puzzleDifficulty').textContent = puzzle.difficulty.charAt(0).toUpperCase() + puzzle.difficulty.slice(1);

    renderGrid();
    renderClues();
    updateStatus(`Puzzle loaded: ${currentPuzzle.name}`);
    updateProgress();
}

function renderGrid() {
    const gridElement = document.getElementById('crosswordGrid');
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${currentPuzzle.size}, 35px)`;
    gridElement.style.gridTemplateRows = `repeat(${currentPuzzle.size}, 35px)`;

    const clueNumbers = getClueNumbers();

    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            const cell = document.createElement('div');
            cell.className = 'crossword-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (currentPuzzle.grid[row][col] === '#') {
                cell.classList.add('black');
            } else {
                const input = document.createElement('input');
                input.maxLength = 1;
                input.dataset.row = row;
                input.dataset.col = col;

                input.addEventListener('input', (e) => handleInput(e, row, col));
                input.addEventListener('focus', () => selectCell(row, col));
                input.addEventListener('keydown', (e) => handleKeyDown(e, row, col));

                // Add clue number if this cell starts a word
                const clueNum = clueNumbers[`${row},${col}`];
                if (clueNum) {
                    const numSpan = document.createElement('span');
                    numSpan.className = 'clue-number';
                    numSpan.textContent = clueNum;
                    cell.appendChild(numSpan);
                }

                cell.appendChild(input);
            }

            gridElement.appendChild(cell);
        }
    }
}

function getClueNumbers() {
    const numbers = {};
    let num = 1;

    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            if (currentPuzzle.grid[row][col] === '#') continue;

            let isStart = false;

            // Check if this starts an across word
            if ((col === 0 || currentPuzzle.grid[row][col - 1] === '#') &&
                col + 1 < currentPuzzle.size && currentPuzzle.grid[row][col + 1] !== '#') {
                isStart = true;
            }

            // Check if this starts a down word
            if ((row === 0 || currentPuzzle.grid[row - 1][col] === '#') &&
                row + 1 < currentPuzzle.size && currentPuzzle.grid[row + 1][col] !== '#') {
                isStart = true;
            }

            if (isStart) {
                numbers[`${row},${col}`] = num++;
            }
        }
    }

    return numbers;
}

function renderClues() {
    const acrossElement = document.getElementById('acrossClues');
    const downElement = document.getElementById('downClues');

    acrossElement.innerHTML = '';
    downElement.innerHTML = '';

    for (const [num, data] of Object.entries(currentPuzzle.across)) {
        const clue = document.createElement('div');
        clue.className = 'clue-item';
        clue.textContent = `${num}. ${data.clue}`;
        clue.onclick = () => highlightWord(data, 'across');
        acrossElement.appendChild(clue);
    }

    for (const [num, data] of Object.entries(currentPuzzle.down)) {
        const clue = document.createElement('div');
        clue.className = 'clue-item';
        clue.textContent = `${num}. ${data.clue}`;
        clue.onclick = () => highlightWord(data, 'down');
        downElement.appendChild(clue);
    }
}

function selectCell(row, col) {
    selectedCell = { row, col };

    // Remove previous selections
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('selected');
    });

    // Highlight current cell
    const cells = document.querySelectorAll(`.crossword-cell[data-row="${row}"][data-col="${col}"]`);
    cells.forEach(cell => cell.classList.add('selected'));
}

function highlightWord(wordData, direction) {
    currentDirection = direction;
    const { row, col, answer } = wordData;

    // Clear previous highlights
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('selected');
    });

    // Highlight word cells
    for (let i = 0; i < answer.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        const cell = document.querySelector(`.crossword-cell[data-row="${r}"][data-col="${c}"]`);
        if (cell) cell.classList.add('selected');
    }

    // Focus first cell
    const firstInput = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"] input`);
    if (firstInput) firstInput.focus();
}

function handleInput(e, row, col) {
    const value = e.target.value.toUpperCase();
    userAnswers[`${row},${col}`] = value;

    if (value) {
        // Move to next cell
        if (currentDirection === 'across') {
            moveToCell(row, col + 1);
        } else {
            moveToCell(row + 1, col);
        }
    }

    updateProgress();
}

function handleKeyDown(e, row, col) {
    switch (e.key) {
        case 'ArrowRight':
            e.preventDefault();
            moveToCell(row, col + 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            moveToCell(row, col - 1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveToCell(row + 1, col);
            break;
        case 'ArrowUp':
            e.preventDefault();
            moveToCell(row - 1, col);
            break;
        case 'Backspace':
            if (!e.target.value) {
                e.preventDefault();
                if (currentDirection === 'across') {
                    moveToCell(row, col - 1);
                } else {
                    moveToCell(row - 1, col);
                }
            }
            break;
    }
}

function moveToCell(row, col) {
    if (row < 0 || row >= currentPuzzle.size || col < 0 || col >= currentPuzzle.size) return;
    if (currentPuzzle.grid[row][col] === '#') return;

    const input = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"] input`);
    if (input) {
        input.focus();
        selectCell(row, col);
    }
}

function checkPuzzle() {
    let correct = 0;
    let total = 0;

    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            if (currentPuzzle.grid[row][col] !== '#') {
                total++;
                const userAnswer = userAnswers[`${row},${col}`] || '';
                const correctAnswer = currentPuzzle.grid[row][col];

                const cell = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"]`);

                if (userAnswer === correctAnswer) {
                    cell.classList.add('correct');
                    cell.classList.remove('wrong');
                    correct++;
                } else if (userAnswer) {
                    cell.classList.add('wrong');
                    cell.classList.remove('correct');
                }
            }
        }
    }

    if (correct === total) {
        updateStatus('🎉 PUZZLE COMPLETE! Perfect score!');
    } else {
        updateStatus(`${correct}/${total} correct (${Math.round(correct / total * 100)}%)`);
    }
}

function revealLetter() {
    if (!selectedCell) {
        updateStatus('Select a cell first!');
        return;
    }

    const { row, col } = selectedCell;
    const correctAnswer = currentPuzzle.grid[row][col];

    const input = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col}"] input`);
    if (input) {
        input.value = correctAnswer;
        userAnswers[`${row},${col}`] = correctAnswer;
        updateProgress();
    }
}

function revealWord() {
    if (!selectedCell) {
        updateStatus('Select a cell first!');
        return;
    }

    // Find which word this cell belongs to
    for (const data of Object.values(currentPuzzle.across)) {
        const { row, col, answer } = data;
        if (selectedCell.row === row && selectedCell.col >= col && selectedCell.col < col + answer.length) {
            // Reveal across word
            for (let i = 0; i < answer.length; i++) {
                const input = document.querySelector(`.crossword-cell[data-row="${row}"][data-col="${col + i}"] input`);
                if (input) {
                    input.value = answer[i];
                    userAnswers[`${row},${col + i}`] = answer[i];
                }
            }
            updateProgress();
            return;
        }
    }

    for (const data of Object.values(currentPuzzle.down)) {
        const { row, col, answer } = data;
        if (selectedCell.col === col && selectedCell.row >= row && selectedCell.row < row + answer.length) {
            // Reveal down word
            for (let i = 0; i < answer.length; i++) {
                const input = document.querySelector(`.crossword-cell[data-row="${row + i}"][data-col="${col}"] input`);
                if (input) {
                    input.value = answer[i];
                    userAnswers[`${row + i},${col}`] = answer[i];
                }
            }
            updateProgress();
            return;
        }
    }
}

function clearGrid() {
    if (!confirm('Clear all answers?')) return;

    userAnswers = {};
    document.querySelectorAll('.crossword-cell input').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('.crossword-cell').forEach(cell => {
        cell.classList.remove('correct', 'wrong');
    });
    updateProgress();
    updateStatus('Grid cleared!');
}

function updateProgress() {
    if (!currentPuzzle) return;

    let filled = 0;
    let total = 0;

    for (let row = 0; row < currentPuzzle.size; row++) {
        for (let col = 0; col < currentPuzzle.size; col++) {
            if (currentPuzzle.grid[row][col] !== '#') {
                total++;
                if (userAnswers[`${row},${col}`]) filled++;
            }
        }
    }

    const progress = total > 0 ? Math.round((filled / total) * 100) : 0;
    document.getElementById('puzzleProgress').textContent = `${filled}/${total} clues`;
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Japanese crossword puzzles (Hiragana)
const PUZZLES_JA = [
    {
        name: "ミニパズル",
        difficulty: "easy",
        size: 5,
        grid: [
            ['ね', 'こ', '#', '#', '#'],
            ['#', 'い', 'ぬ', '#', '#'],
            ['#', '#', '#', 'さ', 'る'],
            ['#', '#', '#', 'か', '#'],
            ['#', '#', '#', 'な', '#']
        ],
        across: {
            1: { clue: "猫のこと", answer: "ねこ", row: 0, col: 0 },
            3: { clue: "犬のこと", answer: "いぬ", row: 1, col: 1 },
            5: { clue: "猿のこと", answer: "さる", row: 2, col: 3 }
        },
        down: {
            2: { clue: "医者のこと", answer: "いしゃ", row: 0, col: 1 },
            4: { clue: "魚のこと", answer: "さかな", row: 2, col: 3 }
        }
    },
    {
        name: "かんたん",
        difficulty: "easy",
        size: 7,
        grid: [
            ['に', 'ほ', 'ん', '#', '#', '#', '#'],
            ['#', 'ん', '#', 'あ', 'め', '#', '#'],
            ['#', '#', 'そ', 'ら', '#', '#', '#'],
            ['#', '#', '#', 'か', 'ぜ', '#', '#'],
            ['#', 'み', 'ず', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "日本のこと", answer: "にほん", row: 0, col: 0 },
            5: { clue: "雨のこと", answer: "あめ", row: 1, col: 3 },
            7: { clue: "空のこと", answer: "そら", row: 2, col: 2 },
            10: { clue: "風のこと", answer: "かぜ", row: 3, col: 3 },
            12: { clue: "水のこと", answer: "みず", row: 4, col: 1 }
        },
        down: {
            2: { clue: "本のこと", answer: "ほん", row: 0, col: 1 },
            6: { clue: "雨と空", answer: "あそら", row: 1, col: 3 }
        }
    },
    {
        name: "ふつう",
        difficulty: "medium",
        size: 8,
        grid: [
            ['が', 'っ', 'こ', 'う', '#', '#', '#', '#'],
            ['#', '#', 'ん', '#', 'せ', 'ん', 'せ', 'い'],
            ['#', '#', 'ぴ', 'ゅ', 'う', 'た', '#', '#'],
            ['#', '#', '#', '#', '#', 'べ', 'ん', 'き'],
            ['#', 'と', 'も', 'だ', 'ち', '#', '#', 'ょ'],
            ['#', '#', '#', '#', '#', '#', '#', 'う'],
            ['#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "学校のこと", answer: "がっこう", row: 0, col: 0 },
            8: { clue: "先生のこと", answer: "せんせい", row: 1, col: 4 },
            10: { clue: "コンピュータのこと", answer: "ぴゅうた", row: 2, col: 2 },
            15: { clue: "勉強のこと", answer: "べんきょう", row: 3, col: 5 },
            18: { clue: "友達のこと", answer: "ともだち", row: 4, col: 1 }
        },
        down: {
            3: { clue: "コンピュータ", answer: "こんぴゅうた", row: 0, col: 2 }
        }
    },
    {
        name: "むずかしい",
        difficulty: "hard",
        size: 10,
        grid: [
            ['け', 'い', 'さ', 'ん', 'き', '#', '#', '#', '#', '#'],
            ['#', 'ん', '#', '#', '#', 'あ', 'た', 'ま', '#', '#'],
            ['#', 'た', '#', 'こ', 'と', 'ば', '#', '#', '#', '#'],
            ['#', 'あ', '#', '#', '#', '#', 'が', 'く', 'せ', 'い'],
            ['#', 'ね', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', 'っ', '#', 'し', 'ゃ', 'し', 'ん', '#', '#', '#'],
            ['#', 'と', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
            ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
        ],
        across: {
            1: { clue: "計算機のこと", answer: "けいさんき", row: 0, col: 0 },
            10: { clue: "頭のこと", answer: "あたま", row: 1, col: 5 },
            12: { clue: "言葉のこと", answer: "ことば", row: 2, col: 3 },
            15: { clue: "学生のこと", answer: "がくせい", row: 3, col: 6 },
            20: { clue: "写真のこと", answer: "しゃしん", row: 5, col: 3 }
        },
        down: {
            2: { clue: "インターネット", answer: "いんたあねっと", row: 0, col: 1 }
        }
    }
];

function setLanguage(lang) {
    currentLanguage = lang;

    // Update button states
    ['en', 'ja'].forEach(l => {
        const btn = document.getElementById(`btn-${l}`);
        if (btn) {
            if (l === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    // Update puzzle selector
    renderPuzzleSelector();
    updateStatus(lang === 'en' ? 'Select a puzzle to begin!' : 'パズルを選んでください！');
}

function renderPuzzleSelector() {
    const selector = document.getElementById('puzzleSelector');
    selector.innerHTML = '';

    const puzzles = currentLanguage === 'en' ? PUZZLES_EN : PUZZLES_JA;

    puzzles.forEach((puzzle, index) => {
        const btn = document.createElement('button');
        btn.onclick = () => loadPuzzle(index);

        const difficultyEmoji = {
            easy: '🟢',
            medium: '🟡',
            hard: '🔴'
        }[puzzle.difficulty];

        btn.textContent = `${puzzle.name} ${difficultyEmoji}`;
        selector.appendChild(btn);
    });
}



function importCrossword(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            if (file.name.endsWith('.json')) {
                // JSON format import
                const data = JSON.parse(e.target.result);
                importFromJSON(data);
            } else if (file.name.endsWith('.puz')) {
                // .puz format (binary) - simplified parser
                alert('PUZ file format requires specialized parsing. Please convert to JSON format first, or use built-in puzzles. For NYTimes puzzles, try exporting as JSON from puzzle websites.');
            } else {
                alert('Unsupported file format. Please use .json or .puz files.');
            }
        } catch (err) {
            alert('Error loading crossword file: ' + err.message);
        }
    };

    if (file.name.endsWith('.json')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function importFromJSON(data) {
    // Convert JSON crossword data to our format
    try {
        const imported = {
            name: data.title || data.name || "Imported Puzzle",
            difficulty: data.difficulty || "medium",
            size: data.size || 15,
            grid: data.grid,
            across: data.across || {},
            down: data.down || {}
        };

        // Validate grid
        if (!imported.grid || !Array.isArray(imported.grid)) {
            throw new Error('Invalid grid format');
        }

        // Load the imported puzzle
        loadPuzzle(imported);

        updateStatus(`Imported: ${imported.name}`);
        showDownloadStatus(`✅ Successfully imported: ${imported.name}`, 'success');
    } catch (err) {
        showDownloadStatus(`❌ Error: ${err.message}`, 'error');
    }
}

async function downloadFromInternet() {
    showDownloadStatus('🔒 NYT requires subscription/CORS check...', 'loading');

    // NYT APIs and pages are strictly CORS-blocked and behind paywalls.
    // Client-side fetch will almost always fail or be blocked.
    // We provide a direct link instead.

    setTimeout(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // Use the Mini URL as it's the most popular free one (sometimes)
        const nytUrl = `https://www.nytimes.com/crosswords/game/mini/${year}${month}${day}`;

        if (confirm(`Direct import from NYT is blocked by browser security (CORS) and paywalls.\n\nOpen NYT Crossword page in a new tab instead?`)) {
            window.open(nytUrl, '_blank');
            showDownloadStatus('✅ Opened NYT in new tab', 'success');
        } else {
            showDownloadStatus('', 'idle');
        }
    }, 500);
}

async function downloadGuardian() {
    const type = document.getElementById('guardianType').value;
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

    showDownloadStatus(`🔄 Checking local backend for ${typeLabel}...`, 'loading');

    // Try to fetch from our local backend proxy first
    try {
        const response = await fetch(`http://localhost:9879/api/guardian/latest?type=${type}`);

        if (response.ok) {
            const data = await response.json();
            showDownloadStatus(`✅ Guardian ${typeLabel} puzzle downloaded!`, 'success');
            convertGuardianData(data);
            return;
        } else {
            throw new Error(`Backend returned ${response.status}`);
        }
    } catch (e) {
        console.warn("Backend fetch failed:", e);
        // Fallback to manual open if backend is missing/failing

        const fallbackMsg = `Local Backend (port 9879) not running.\n\nDirect import blocked by browser security (CORS).\n\nOpen Guardian ${typeLabel} Crosswords in a new tab?`;

        if (confirm(fallbackMsg)) {
            window.open(`https://www.theguardian.com/crosswords/series/${type}`, '_blank');
            showDownloadStatus(`✅ Opened Guardian ${typeLabel} in new tab`, 'success');
        } else {
            showDownloadStatus('❌ Import cancelled', 'error');
        }
    }
}

function convertGuardianData(guardianData) {
    // Convert Guardian JSON format to our crossword format
    const size = Math.sqrt(guardianData.dimensions?.total || 225); // Assume 15x15 if not specified

    // Create empty grid
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid[i] = [];
        for (let j = 0; j < size; j++) {
            grid[i][j] = ' '; // Empty cell
        }
    }

    // Fill in black squares and letters
    if (guardianData.entries) {
        guardianData.entries.forEach(entry => {
            if (entry.solution && entry.position) {
                const row = entry.position.y;
                const col = entry.position.x;
                const direction = entry.direction;
                const solution = entry.solution;

                for (let i = 0; i < solution.length; i++) {
                    const r = direction === 'across' ? row : row + i;
                    const c = direction === 'across' ? col + i : col;

                    if (r < size && c < size) {
                        grid[r][c] = solution[i].toUpperCase();
                    }
                }
            }
        });
    }

    // Extract clues
    const across = {};
    const down = {};

    if (guardianData.entries) {
        guardianData.entries.forEach(entry => {
            const clueData = {
                clue: entry.clue || '',
                answer: entry.solution || '',
                row: entry.position?.y || 0,
                col: entry.position?.x || 0
            };

            const key = entry.number;
            if (entry.direction === 'across') {
                across[key] = clueData;
            } else if (entry.direction === 'down') {
                down[key] = clueData;
            }
        });
    }

    return {
        name: guardianData.name || 'Guardian Cryptic',
        difficulty: 'hard',
        size: size,
        grid: grid,
        across: across,
        down: down
    };
}

function convertNYTData(nytData) {
    // Convert NYT JSON format to our crossword format
    const size = nytData.size?.rows || nytData.size?.cols || 15;

    // Create empty grid
    const grid = [];
    for (let i = 0; i < size; i++) {
        grid[i] = [];
        for (let j = 0; j < size; j++) {
            grid[i][j] = ' '; // Empty cell
        }
    }

    // Fill in letters from solution
    if (nytData.solution) {
        for (let i = 0; i < nytData.solution.length; i++) {
            const row = Math.floor(i / size);
            const col = i % size;
            if (row < size && col < size) {
                grid[row][col] = nytData.solution[i] || ' ';
            }
        }
    }

    // Extract clues
    const across = {};
    const down = {};

    if (nytData.clues?.across) {
        nytData.clues.across.forEach((clue, index) => {
            const number = index + 1;
            across[number] = {
                clue: clue,
                answer: '', // NYT doesn't include answers in the basic data
                row: 0, // Would need to calculate from grid position
                col: 0
            };
        });
    }

    if (nytData.clues?.down) {
        nytData.clues.down.forEach((clue, index) => {
            const number = index + 1;
            down[number] = {
                clue: clue,
                answer: '',
                row: 0,
                col: 0
            };
        });
    }

    return {
        name: nytData.title || 'NYT Crossword',
        difficulty: 'medium',
        size: size,
        grid: grid,
        across: across,
        down: down
    };
}

async function downloadFreeAlternatives() {
    showDownloadStatus('🆓 Opening free crossword sites...', 'loading');

    try {
        // Open multiple free crossword sites
        const freeSites = [
            { name: 'LA Times Mini', url: 'https://www.latimes.com/games/daily-crossword' },
            { name: 'USA Today', url: 'https://games.usatoday.com/games/daily-crossword' },
            { name: 'Play Mini Crossword', url: 'https://www.playminicrossword.com' },
            { name: 'Mini But Better', url: 'https://minibutbetter.com' }
        ];

        freeSites.forEach(site => {
            window.open(site.url, '_blank');
        });

        showDownloadStatus('✅ Opened free crossword sites in new tabs!', 'success');

        setTimeout(() => {
            alert('Free crossword sites opened!\n\nThese provide daily mini crosswords without subscription:\n• LA Times Mini\n• USA Today\n• Play Mini Crossword\n• Mini But Better');
        }, 2000);

    } catch (err) {
        showDownloadStatus('❌ Error opening free sites', 'error');
    }
}

async function downloadXWordInfo() {
    showDownloadStatus('🔄 Opening XWordInfo database...', 'loading');

    try {
        // XWordInfo has extensive crossword database but requires manual download
        window.open('https://www.xwordinfo.com/', '_blank');

        const instructions = `
📊 XWord Info - NYT Crossword Database:

• Browse by date using the calendar
• Click any date to see that day's puzzle
• Look for "Print" link to download printable version
• Some puzzles available as .puz files
• Upload downloaded files using "Upload File" button above

💡 Tip: Many users use browser extensions to convert NYT puzzles to .puz format.`;

        setTimeout(() => {
            alert(instructions);
            showDownloadStatus('📚 XWord Info opened - check popup for download guide', 'info');
        }, 1500);

    } catch (err) {
        showDownloadStatus('❌ Error opening XWord Info: ' + err.message, 'error');
    }
}

function convertAndImport(data) {
    try {
        // Convert various crossword formats to our format
        let converted = {
            name: data.title || data.name || 'Downloaded Puzzle',
            difficulty: data.difficulty || 'medium',
            size: data.size || 15,
            grid: [],
            across: {},
            down: {}
        };

        // Handle different data formats
        if (data.grid) {
            converted.grid = data.grid;
        } else if (data.solution) {
            // Convert solution string to grid
            const size = Math.sqrt(data.solution.length);
            converted.size = size;
            converted.grid = [];
            for (let i = 0; i < size; i++) {
                converted.grid[i] = [];
                for (let j = 0; j < size; j++) {
                    const char = data.solution[i * size + j];
                    converted.grid[i][j] = char === '.' ? '#' : char;
                }
            }
        }

        if (data.clues) {
            converted.across = data.clues.across || {};
            converted.down = data.clues.down || {};
        }

        importFromJSON(converted);

    } catch (err) {
        showDownloadStatus('❌ Conversion error: ' + err.message, 'error');
    }
}

function showDownloadStatus(message, type) {
    const statusDiv = document.getElementById('downloadStatus');
    const statusText = document.getElementById('downloadStatusText');

    statusDiv.style.display = 'block';
    statusText.textContent = message;

    const colors = {
        loading: '#00FFFF',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };

    statusText.style.color = colors[type] || '#00FFFF';

    if (type === 'success' || type === 'error' || type === 'warning') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// File import functionality
function importCrossword(event) {
    const file = event.target.files[0];
    if (!file) return;

    showDownloadStatus(`📁 Reading ${file.name}...`, 'loading');

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            let data;

            if (file.name.endsWith('.json')) {
                // JSON file
                data = JSON.parse(e.target.result);
                importFromJSON(data);
            } else if (file.name.endsWith('.puz')) {
                // .puz file - would need a library to parse this format
                // For now, show error and suggest conversion
                showDownloadStatus('⚠️ .puz files need conversion. Try converting to JSON first using online tools.', 'warning');
                return;
            } else {
                throw new Error('Unsupported file format. Please use .json or .puz files.');
            }

        } catch (err) {
            showDownloadStatus(`❌ Error parsing file: ${err.message}`, 'error');
        }
    };

    reader.onerror = function () {
        showDownloadStatus('❌ Error reading file', 'error');
    };

    reader.readAsText(file);

    // Reset file input so same file can be selected again
    event.target.value = '';
}

// Get clue from comprehensive dictionary
function getClueFromDictionary(word) {
    // Search all difficulty levels for the word
    for (const difficulty of ['easy', 'medium', 'hard']) {
        const dict = CROSSWORD_DICTIONARY[difficulty];
        if (dict && dict[word]) {
            return dict[word];
        }
    }

    // Fallback: generate a generic clue
    return generateGenericClue(word);
}

// Generate a generic clue when word isn't in dictionary
function generateGenericClue(word) {
    const length = word.length;

    // Some basic patterns for common word types
    if (length <= 3) {
        return `${length}-letter word`;
    } else if (length <= 5) {
        return `Short ${length}-letter word`;
    } else if (length <= 8) {
        return `${length}-letter term`;
    } else {
        return `Long ${length}-letter word`;
    }
}

// Generate professional-quality clues for placed words
function generateProfessionalClues(placedWords) {
    const clues = { across: {}, down: {} };

    // Process across clues
    for (const [num, wordData] of Object.entries(placedWords.across || {})) {
        clues.across[num] = {
            clue: getClueFromDictionary(wordData.answer),
            answer: wordData.answer,
            row: wordData.row,
            col: wordData.col,
            length: wordData.length
        };
    }

    // Process down clues
    for (const [num, wordData] of Object.entries(placedWords.down || {})) {
        clues.down[num] = {
            clue: getClueFromDictionary(wordData.answer),
            answer: wordData.answer,
            row: wordData.row,
            col: wordData.col,
            length: wordData.length
        };
    }

    return clues;
}

// Initialize
setLanguage('en');


// Export Puzzle to JSON
function exportPuzzle() {
    if (!currentPuzzle) {
        alert("No puzzle loaded to export!");
        return;
    }

    const saveData = {
        name: currentPuzzle.name || "Crossword",
        size: currentPuzzle.size,
        difficulty: currentPuzzle.difficulty || "custom",
        grid: currentPuzzle.grid,
        across: currentPuzzle.across,
        down: currentPuzzle.down,
        userAnswers: userAnswers || {},
        timer: seconds || 0
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", (saveData.name).replace(/\s+/g, '_').toLowerCase() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Make functions globally accessible for HTML
window.generateCrossword = generateCrossword;
