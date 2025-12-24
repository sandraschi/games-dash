// Word Search Game Implementation
// **Timestamp**: 2025-12-04

console.log('Word Search JavaScript loaded successfully!');

// Word search variables
var SIZE = 15; // Dynamic based on difficulty
var grid = [];
var words = [];
var foundWords = [];
var currentDifficulty = 'easy';
var currentTheme = 'animals';

// Time attack mode variables
var timeAttackMode = false;
var gameStartTime = null;
var gameTimer = null;
var elapsedTime = 0;

// Advanced options variables
var allowDiagonals = false;
var allowAnagrams = false;

// Character sets for different language themes
const characterSets = {
    // English/German (A-Z)
    english: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',

    // Japanese Hiragana (all basic hiragana)
    hiragana: 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',

    // Japanese Katakana (all basic katakana)
    katakana: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
};

// Function to get appropriate character set for current theme
function getCharacterSet(theme) {
    if (theme.includes('_hiragana')) {
        return characterSets.hiragana;
    } else if (theme.includes('_katakana')) {
        return characterSets.katakana;
    } else if (theme.includes('_de')) {
        return characterSets.english; // German uses same alphabet
    } else {
        return characterSets.english; // Default to English
    }
}

// Function to get random character from appropriate set
function getRandomChar(theme) {
    const charset = getCharacterSet(theme);
    return charset[Math.floor(Math.random() * charset.length)];
}

// Function to get available directions based on options
function getAvailableDirections() {
    let directions = [[0, 1], [1, 0]]; // Always include horizontal and vertical

    if (allowDiagonals) {
        directions.push([1, 1], [1, -1]); // Add diagonals
    }

    // Add backwards directions if diagonals are allowed
    if (allowDiagonals) {
        directions.push([0, -1], [-1, 0], [-1, -1], [-1, 1]);
    }

    return directions;
}

// Function to update game options when checkboxes change
function updateGameOptions() {
    allowDiagonals = document.getElementById('allowDiagonals').checked;
    allowAnagrams = document.getElementById('allowAnagrams').checked;

    // Update difficulty info display
    updateDifficultyInfo();

    console.log('Game options updated:', { allowDiagonals, allowAnagrams });
}

// Function to toggle time attack mode
function toggleTimeAttack() {
    timeAttackMode = document.getElementById('timeAttackMode').checked;

    if (timeAttackMode && !gameStartTime) {
        startTimer();
    } else if (!timeAttackMode && gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
        updateTimerDisplay();
    }

    updateDifficultyInfo();
    console.log('Time attack mode:', timeAttackMode);
}

// Difficulty settings
const difficulties = {
    easy: {
        size: 10,
        wordCount: 6,
        cellSize: 40,
        minWordLength: 4,
        maxWordLength: 8,
        description: '10×10 grid, 6 words'
    },
    medium: {
        size: 15,
        wordCount: 10,
        cellSize: 35,
        minWordLength: 5,
        maxWordLength: 12,
        description: '15×15 grid, 10 words'
    },
    hard: {
        size: 20,
        wordCount: 15,
        cellSize: 30,
        minWordLength: 6,
        maxWordLength: 15,
        description: '20×20 grid, 15 words'
    },
    expert: {
        size: 20,
        wordCount: 12,
        cellSize: 28,
        minWordLength: 6,
        maxWordLength: 15,
        description: '20×20 grid, 12 words (expert level)'
    }
};

const wordLists = {
    // English themes
    animals: ['ELEPHANT', 'GIRAFFE', 'ZEBRA', 'LION', 'TIGER', 'BEAR', 'MONKEY', 'DOLPHIN', 'WHALE', 'SHARK',
              'PENGUIN', 'KANGAROO', 'LEOPARD', 'CHEETAH', 'RHINOCEROS', 'HIPPOPOTAMUS', 'CROCODILE'],
    countries: ['AUSTRIA', 'GERMANY', 'JAPAN', 'FRANCE', 'ITALY', 'SPAIN', 'CHINA', 'INDIA', 'BRAZIL', 'CANADA',
                'AUSTRALIA', 'SWITZERLAND', 'NETHERLANDS', 'ARGENTINA', 'PORTUGAL', 'SWEDEN'],
    technology: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'PYTHON', 'DATABASE', 'ALGORITHM', 'NETWORK',
                 'JAVASCRIPT', 'PROCESSOR', 'MEMORY', 'STORAGE', 'SECURITY', 'ENCRYPTION'],
    food: ['PIZZA', 'BURGER', 'SUSHI', 'PASTA', 'CHOCOLATE', 'CHEESE', 'BREAD', 'STEAK', 'SALAD', 'APPLE',
           'BANANA', 'STRAWBERRY', 'SANDWICH', 'NOODLES', 'CURRY'],
    sports: ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'BASEBALL', 'HOCKEY', 'GOLF', 'RUGBY', 'CRICKET', 'BOXING',
             'SWIMMING', 'SKIING', 'CYCLING', 'VOLLEYBALL', 'BADMINTON'],
    movies: ['CINEMA', 'HOLLYWOOD', 'DIRECTOR', 'ACTRESS', 'BLOCKBUSTER', 'PRODUCER', 'SCREENPLAY', 'CAMERA',
             'LIGHTING', 'SOUNDTRACK', 'ANIMATION', 'SPECIALFX', 'PREMIERE', 'OSCARS', 'NOMINATION'],
    music: ['SYMPHONY', 'CONCERTO', 'PIANIST', 'VIOLINIST', 'OPERA', 'ORCHESTRA', 'COMPOSER', 'CONDUCTOR',
            'HARMONY', 'MELODY', 'RHYTHM', 'TEMPO', 'CADENCE', 'FUGUE', 'SONATA'],
    science: ['PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'ASTRONOMY', 'GEOLOGY', 'MATHEMATICS', 'QUANTUM', 'RELATIVITY',
              'EVOLUTION', 'ECOSYSTEM', 'MOLECULE', 'ATOM', 'GALAXY', 'TECTONIC', 'ALGORITHM'],
    history: ['EMPIRE', 'REVOLUTION', 'MONARCHY', 'COLONIAL', 'MEDIEVAL', 'RENAISSANCE', 'INDUSTRIAL', 'WARFARE',
              'DEMOCRACY', 'ARCHAEOLOGY', 'CIVILIZATION', 'CONQUEST', 'ALLIANCE', 'TREATY', 'REFORM'],
    literature: ['NOVELIST', 'POETRY', 'DRAMA', 'ROMANCE', 'THRILLER', 'SATIRE', 'METAPHOR', 'ALLEGORY',
                 'NARRATOR', 'PROTAGONIST', 'ANTAGONIST', 'FORESHADOWING', 'CLIMAX', 'DENOUEMENT', 'EPILOGUE'],

    // Japanese Hiragana themes (animal names in hiragana)
    animals_hiragana: ['えれふぁんと', 'じらふ', 'ぜぶら', 'らいおん', 'たいがー', 'べあー', 'もんきー', 'いるか',
                       'くじら', 'さめ', 'ぺんぎん', 'かんがるー', 'ひょう', 'ちーたー', 'さい'],
    countries_hiragana: ['おーすとりあ', 'どいつ', 'にほん', 'ふらんす', 'いたりあ', 'すぺいん', 'ちゃいな', 'いんど',
                         'ぶらじる', 'かなだ', 'おーすとらりあ', 'すいす', 'おらんだ', 'あるぜんちん', 'ぽるとがる'],
    food_hiragana: ['ぴざ', 'ばーがー', 'すし', 'ぱすた', 'ちょこれーと', 'ちーず', 'ぶれっど', 'すてーき',
                    'さらだ', 'りんご', 'ばなな', 'いちご', 'さんどうぃっち', 'めん', 'かれー'],

    // Japanese Katakana themes (technology/foreign words)
    technology_katakana: ['コンピュータ', 'インターネット', 'ソフトウェア', 'ハードウェア', 'パイソン', 'データベース',
                          'アルゴリズム', 'ネットワーク', 'ジャヴァスクリプト', 'プロセッサー', 'メモリー', 'ストレージ'],
    sports_katakana: ['フットボール', 'バスケットボール', 'テニス', 'ベースボール', 'ホッケー', 'ゴルフ', 'ラグビー',
                      'クリケット', 'ボクシング', 'スイミング', 'スキーイング', 'サイクリング', 'バレーボール'],

    // German themes
    tiere_de: ['ELEFANT', 'GIRAFFE', 'ZEBRA', 'LÖWE', 'TIGER', 'BÄR', 'MONKEY', 'DELFIN', 'WAL', 'HAI',
               'PINGUIN', 'KÄNGURU', 'LEOPARD', 'GEPARD', 'RHINOCEROS'],
    länder_de: ['ÖSTERREICH', 'DEUTSCHLAND', 'JAPAN', 'FRANKREICH', 'ITALIEN', 'SPANNIEN', 'CHINA', 'INDIEN',
                'BRASILIEN', 'KANADA', 'AUSTRALIEN', 'SCHWEIZ', 'NIEDERLANDE', 'ARGENTINIEN', 'PORTUGAL'],
    technologie_de: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'PYTHON', 'DATENBANK', 'ALGORITHMUS', 'NETZWERK',
                     'JAVASCRIPT', 'PROZESSOR', 'SPEICHER', 'LAGERUNG', 'SICHERHEIT', 'VERSCHLÜSSELUNG'],

    // French themes
    animaux_fr: ['ÉLÉPHANT', 'GIRAFFE', 'ZÈBRE', 'LION', 'TIGRE', 'OURS', 'MONKEY', 'DAUPHIN', 'BALEINE', 'REQUIN',
                 'PINGOUIN', 'KANGOUROU', 'LÉOPARD', 'GUÉPARD', 'RHINOCÉROS'],
    pays_fr: ['AUTRICHE', 'ALLEMAGNE', 'JAPON', 'FRANCE', 'ITALIE', 'ESPAGNE', 'CHINE', 'INDE', 'BRÉSIL', 'CANADA',
              'AUSTRALIE', 'SUISSE', 'PAYS-BAS', 'ARGENTINE', 'PORTUGAL']
};

function generateGrid(wordList) {
    try {
        const difficulty = difficulties[currentDifficulty];
        if (!difficulty) {
            console.error('Invalid difficulty:', currentDifficulty);
            grid = [];
            return false;
        }
        
        SIZE = difficulty.size;
        
        // Filter words by length and limit to wordCount
        // Also ensure words fit in the grid
        const filteredWords = wordList.filter(w => 
            w && 
            w.length >= difficulty.minWordLength && 
            w.length <= difficulty.maxWordLength &&
            w.length <= SIZE // Word must fit in grid
        );
        
        if (filteredWords.length === 0) {
            console.error('No words match difficulty criteria!', {
                difficulty: currentDifficulty,
                size: SIZE,
                minLength: difficulty.minWordLength,
                maxLength: difficulty.maxWordLength
            });
            grid = [];
            return false;
        }
        
        let wordsToPlace = filteredWords.slice(0, difficulty.wordCount);

        if (wordsToPlace.length === 0) {
            console.error('No words to place!');
            grid = [];
            return false;
        }

        // Log for debugging
        console.log(`Generating ${currentDifficulty} grid: ${SIZE}x${SIZE}, attempting ${wordsToPlace.length} words`);
        console.log('Words to attempt:', wordsToPlace);

        grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(''));
        foundWords = [];

        // Place words and only keep successfully placed ones
        words = [];
        wordsToPlace.forEach(word => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 500;

            while (!placed && attempts < maxAttempts) {
                const direction = getRandomDirection();
                if (!direction) {
                    console.error('No direction available!');
                    break;
                }

                const pos = getRandomPosition(word.length, direction);
                if (!pos || pos.row === undefined || pos.col === undefined) {
                    attempts++;
                    continue;
                }

                if (canPlace(word, pos, direction)) {
                    placeWord(word, pos, direction);
                    words.push(word); // Only add to words array if successfully placed
                    placed = true;
                }
                attempts++;
            }

            // Log if word couldn't be placed (for debugging)
            if (!placed) {
                console.warn(`Could not place word: ${word} after ${maxAttempts} attempts`);
            }
        });

        if (words.length === 0) {
            console.error('No words were successfully placed!');
            grid = [];
            return false;
        }
        
        // Fill empty cells with appropriate characters for theme
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (grid[row][col] === '' || !grid[row][col]) {
                    grid[row][col] = getRandomChar(currentTheme);
                }
            }
        }
        
        console.log('Grid generated successfully:', SIZE, 'x', SIZE, 'with', words.length, 'words');
        return true;
    } catch (error) {
        console.error('Error generating grid:', error);
        grid = [];
        return false;
    }
}

function getRandomDirection() {
    const dirs = getAvailableDirections();
    return dirs[Math.floor(Math.random() * dirs.length)];
}

function getRandomPosition(length, direction) {
    const [dRow, dCol] = direction;
    
    // Ensure word fits in grid
    if (length > SIZE) {
        console.error(`Word length ${length} exceeds grid size ${SIZE}`);
        return null;
    }
    
    // Calculate valid row range
    let minRow, maxRow;
    if (dRow > 0) {
        // Moving down: row can be 0 to SIZE - length
        minRow = 0;
        maxRow = Math.max(0, SIZE - length);
    } else if (dRow < 0) {
        // Moving up: row must be at least length - 1
        minRow = Math.min(SIZE - 1, length - 1);
        maxRow = SIZE - 1;
    } else {
        // No vertical movement: row can be anywhere
        minRow = 0;
        maxRow = SIZE - 1;
    }
    
    // Calculate valid col range
    let minCol, maxCol;
    if (dCol > 0) {
        // Moving right: col can be 0 to SIZE - length
        minCol = 0;
        maxCol = Math.max(0, SIZE - length);
    } else if (dCol < 0) {
        // Moving left: col must be at least length - 1
        minCol = Math.min(SIZE - 1, length - 1);
        maxCol = SIZE - 1;
    } else {
        // No horizontal movement: col can be anywhere
        minCol = 0;
        maxCol = SIZE - 1;
    }
    
    // Ensure valid ranges (safety checks)
    minRow = Math.max(0, Math.min(minRow, SIZE - 1));
    maxRow = Math.max(0, Math.min(maxRow, SIZE - 1));
    minCol = Math.max(0, Math.min(minCol, SIZE - 1));
    maxCol = Math.max(0, Math.min(maxCol, SIZE - 1));
    
    // Ensure min <= max
    if (minRow > maxRow) {
        [minRow, maxRow] = [maxRow, minRow];
    }
    if (minCol > maxCol) {
        [minCol, maxCol] = [maxCol, minCol];
    }
    
    // Final safety check - ensure we have a valid range
    if (minRow < 0 || maxRow >= SIZE || minCol < 0 || maxCol >= SIZE || minRow > maxRow || minCol > maxCol) {
        console.error(`Invalid position range: row[${minRow}, ${maxRow}], col[${minCol}, ${maxCol}], SIZE=${SIZE}, length=${length}`);
        return null;
    }
    
    // Ensure we have valid range
    const rowRange = Math.max(1, maxRow - minRow + 1);
    const colRange = Math.max(1, maxCol - minCol + 1);
    
    return {
        row: minRow + Math.floor(Math.random() * rowRange),
        col: minCol + Math.floor(Math.random() * colRange)
    };
}

function canPlace(word, pos, direction) {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
        const row = pos.row + i * dRow;
        const col = pos.col + i * dCol;
        
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return false;
        if (grid[row][col] !== '' && grid[row][col] !== word[i]) return false;
    }
    return true;
}

function placeWord(word, pos, direction) {
    const [dRow, dCol] = direction;
    
    for (let i = 0; i < word.length; i++) {
        const row = pos.row + i * dRow;
        const col = pos.col + i * dCol;
        grid[row][col] = word[i];
    }
}

function renderWordList() {
    const listElement = document.getElementById('wordList');
    listElement.innerHTML = '';

    words.forEach(word => {
        const item = document.createElement('div');
        item.className = 'word-item';
        if (foundWords.includes(word)) item.classList.add('found');

        // In expert mode, show anagram hint
        if (allowAnagrams) {
            const reversed = word.split('').reverse().join('');
            item.innerHTML = `${word} <span style="font-size: 0.8em; opacity: 0.7;">(${reversed})</span>`;
        } else {
            item.textContent = word;
        }

        listElement.appendChild(item);
    });

    if (foundWords.length === words.length) {
        const congratsMsg = difficulties[currentDifficulty].allowAnagrams ?
            '🎉 MASTER SOLVER! All words and anagrams found!' :
            '🎉 ALL WORDS FOUND!';
        document.getElementById('status').textContent = congratsMsg;
    }
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update button states
    ['easy', 'medium', 'hard'].forEach(d => {
        const btn = document.getElementById(`btn-${d}`);
        if (btn) {
            if (d === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
    
    // Update info display
    const infoEl = document.getElementById('difficultyInfo');
    if (infoEl) {
        let info = difficulties[difficulty].description;

        // Add options info
        const options = [];
        if (allowDiagonals) options.push('diagonals');
        if (allowAnagrams) options.push('anagrams');
        if (timeAttackMode) options.push('time attack');

        if (options.length > 0) {
            info += ` (${options.join(', ')})`;
        }

        infoEl.textContent = info;
    }
    
    // Restart game with new difficulty if already playing
    if (currentTheme) {
        newGame(currentTheme);
    }
}

function newGame(theme) {
    // Stop any existing timer
    stopTimer();

    if (theme) {
        currentTheme = theme;
    }

    const wordList = wordLists[currentTheme];
    if (!wordList || wordList.length === 0) {
        console.error('No word list found for theme:', currentTheme);
        return;
    }

    // Ensure DOM is ready first
    const gridElement = document.getElementById('wordGrid');
    if (!gridElement) {
        console.error('wordGrid element not found, waiting...');
        setTimeout(() => newGame(theme), 100);
        return;
    }

    console.log('Calling generateGrid for theme:', theme);
    const success = generateGrid(wordList);
    console.log('generateGrid result:', success, 'grid exists:', !!grid, 'grid length:', grid ? grid.length : 0);

    // Verify grid was generated
    if (!success || !grid || grid.length === 0 || words.length === 0) {
        console.error('Grid generation failed! Creating fallback grid...');
        // Create a simple fallback grid with guaranteed words
        SIZE = 10;
        grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(''));

        // Place guaranteed words in fallback grid
        words = ['TEST', 'WORD', 'GAME'];
        foundWords = [];

        // Place TEST horizontally at (0,0)
        for (let i = 0; i < 'TEST'.length; i++) {
            grid[0][i] = 'TEST'[i];
        }

        // Place WORD horizontally at (2,0)
        for (let i = 0; i < 'WORD'.length; i++) {
            grid[2][i] = 'WORD'[i];
        }

        // Place GAME vertically at (0,6)
        for (let i = 0; i < 'GAME'.length; i++) {
            grid[i][6] = 'GAME'[i];
        }

        // Fill remaining cells with random characters appropriate for the theme
        for (let row = 0; row < SIZE; row++) {
            for (let col = 0; col < SIZE; col++) {
                if (grid[row][col] === '') {
                    grid[row][col] = getRandomChar(currentTheme);
                }
            }
        }

        console.log('Created fallback grid with guaranteed words');
    }

    // Reset timer for new game
    elapsedTime = 0;
    gameStartTime = null;

    renderGrid();
    renderWordList();

    // Start timer if time attack mode is enabled
    if (timeAttackMode) {
        startTimer();
    } else {
        updateTimerDisplay();
    }

    const statusEl = document.getElementById('status');
    if (statusEl) {
        let wordCountText = `${words.length} words`;
        if (allowAnagrams) {
            wordCountText += ` + anagrams`;
        }
        if (timeAttackMode) {
            wordCountText += ` (TIME ATTACK)`;
        }
        statusEl.textContent = `${currentDifficulty.toUpperCase()} ${currentTheme}: Find ${wordCountText}!`;
    }
}

function showHint() {
    const unfound = words.filter(w => !foundWords.includes(w));
    if (unfound.length > 0) {
        alert(`Hint: Look for "${unfound[0]}"`);
    }
}

function toggleTimeAttack() {
    timeAttackMode = !timeAttackMode;
    const button = document.getElementById('time-attack-btn');
    if (button) {
        button.textContent = timeAttackMode ? '⏱️ Time Attack: ON' : '⏱️ Time Attack: OFF';
        button.style.background = timeAttackMode ? '#FF6B35' : '';
    }

    if (timeAttackMode && gameStartTime) {
        startTimer();
    } else if (!timeAttackMode) {
        stopTimer();
    }
}

function createCustomGame() {
    const input = document.getElementById('custom-words-input');
    if (!input || !input.value.trim()) {
        alert('Please enter some words separated by commas!');
        return;
    }

    // Parse custom words
    const customWords = input.value.split(',')
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length > 0);

    if (customWords.length === 0) {
        alert('Please enter valid words!');
        return;
    }

    if (customWords.length < 3) {
        alert('Please enter at least 3 words for a good puzzle!');
        return;
    }

    // Create custom theme
    const customTheme = 'custom';
    wordLists[customTheme] = customWords;

    // Set current theme and start game
    currentTheme = customTheme;
    newGame(customTheme);

    // Clear input
    input.value = '';
}

function startTimer() {
    if (gameTimer) clearInterval(gameTimer);
    gameStartTime = Date.now() - elapsedTime;

    gameTimer = setInterval(() => {
        elapsedTime = Date.now() - gameStartTime;
        updateTimerDisplay();
    }, 100);
}

function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer-display');
    if (timerEl && timeAttackMode) {
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerEl.textContent = `⏱️ ${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
    }
}

function solvePuzzle() {
    if (confirm('Are you sure you want to reveal all words? This will end the puzzle.')) {
        let actuallyFound = 0;
        let anagramsFound = 0;

        // Try to find each word in the grid (forward and backward in expert mode)
        words.forEach(word => {
            let wordFound = false;

            // Try to find the word in normal orientation
            const positions = findWordInGrid(word);
            if (positions) {
                if (!foundWords.includes(word)) {
                    foundWords.push(word);
                    actuallyFound++;
                    wordFound = true;
                }

                // Highlight the word on the grid
                positions.forEach(pos => {
                    const index = pos.row * SIZE + pos.col;
                    const gridElement = document.getElementById('wordGrid');
                    if (gridElement.children[index]) {
                        gridElement.children[index].classList.add('found');
                    }
                });
            }

            // In expert mode, also try to find the backwards version
            if (!wordFound && difficulties[currentDifficulty].allowAnagrams) {
                const reversedWord = word.split('').reverse().join('');
                const reversedPositions = findWordInGrid(reversedWord);
                if (reversedPositions) {
                    if (!foundWords.includes(word)) {
                        foundWords.push(word);
                        actuallyFound++;
                        anagramsFound++;
                        wordFound = true;
                    }

                    // Highlight the anagram on the grid
                    reversedPositions.forEach(pos => {
                        const index = pos.row * SIZE + pos.col;
                        const gridElement = document.getElementById('wordGrid');
                        if (gridElement.children[index]) {
                            gridElement.children[index].classList.add('found');
                        }
                    });
                }
            }

            if (!wordFound) {
                console.warn(`Could not find word "${word}" in grid - may have been displaced or not placed correctly`);
            }
        });

        // Update word list display
        const wordItems = document.querySelectorAll('.word-item');
        wordItems.forEach(item => {
            const wordText = item.textContent.trim().replace(' 🔄', ''); // Remove any existing anagram markers
            if (foundWords.includes(wordText)) {
                item.classList.add('found');
                // Add anagram indicator for words found as anagrams in expert mode
                if (difficulties[currentDifficulty].allowAnagrams && anagramsFound > 0) {
                    item.style.textDecoration = 'line-through';
                    item.style.fontStyle = 'italic';
                    item.style.color = '#FF6B6B';
                    item.innerHTML = wordText + ' 🔄';
                }
            }
        });

        // Update status
        const statusEl = document.getElementById('status');
        if (statusEl) {
            if (actuallyFound === words.length) {
                let solveMsg = `🎯 PUZZLE SOLVED! All ${words.length} words found and highlighted.`;
                if (anagramsFound > 0) {
                    solveMsg += ` (${anagramsFound} found as anagrams!)`;
                }
                statusEl.textContent = solveMsg;
            } else {
                statusEl.textContent = `🎯 SOLVE COMPLETE! Found ${actuallyFound}/${words.length} words. Some words may not be properly placed.`;
            }
        }
    }
}

function findWordInGrid(word) {
    // Find the word's position in the grid
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            // Try all directions
            for (const direction of getAvailableDirections()) {
                const positions = [];
                let found = true;

                for (let i = 0; i < word.length; i++) {
                    const r = row + i * direction[0];
                    const c = col + i * direction[1];

                    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE || grid[r][c] !== word[i]) {
                        found = false;
                        break;
                    }

                    positions.push({row: r, col: c});
                }

                if (found) {
                    return positions;
                }
            }
        }
    }
    return null;
}

// Mouse selection for words
let selecting = false;
let selection = [];
let lastSelectedCell = null;

function startSelection(row, col) {
    selecting = true;
    selection = [{row, col}];
    lastSelectedCell = {row, col};
    const gridElement = document.getElementById('wordGrid');
    const index = row * SIZE + col;
    if (gridElement.children[index]) {
        gridElement.children[index].classList.add('selected');
    }
}

function addToSelection(row, col) {
    if (!selecting) return;

    // Check if this cell is adjacent to the last selected cell
    if (lastSelectedCell) {
        const rowDiff = Math.abs(row - lastSelectedCell.row);
        const colDiff = Math.abs(col - lastSelectedCell.col);

        // Allow horizontal, vertical, and diagonal (but not jumping)
        // For touch devices, be more lenient with diagonal detection
        if ((rowDiff === 0 && colDiff === 1) ||
            (rowDiff === 1 && colDiff === 0) ||
            (rowDiff === 1 && colDiff === 1)) {

            // Check if already in selection (to allow backtracking)
            const exists = selection.some(c => c.row === row && c.col === col);
            if (!exists) {
                selection.push({row, col});
                lastSelectedCell = {row, col};
                const gridElement = document.getElementById('wordGrid');
                const index = row * SIZE + col;
                if (gridElement.children[index]) {
                    gridElement.children[index].classList.add('selected');
                    // Add touch feedback for mobile devices
                    if ('vibrate' in navigator && window.innerWidth < 768) {
                        navigator.vibrate(50); // Short vibration feedback
                    }
                }
            }
        }
    }
}

function endSelection() {
    if (!selecting) return;
    selecting = false;
    checkSelection();
    clearSelectionHighlight();
    selection = [];
    lastSelectedCell = null;
}

function clearSelectionHighlight() {
    const gridElement = document.getElementById('wordGrid');
    for (let i = 0; i < gridElement.children.length; i++) {
        const cell = gridElement.children[i];
        cell.classList.remove('selected');
        if (!cell.classList.contains('found')) {
            cell.style.background = '';
        }
    }
}

function checkSelection() {
    if (selection.length < 3) {
        clearSelectionHighlight();
        return;
    }

    const word = selection.map(cell => grid[cell.row][cell.col]).join('');
    const reversedWord = word.split('').reverse().join('');

    let foundWord = null;
    let isAnagram = false;

    // Check for exact matches first
    if (words.includes(word) && !foundWords.includes(word)) {
        foundWord = word;
    } else if (words.includes(reversedWord) && !foundWords.includes(reversedWord)) {
        foundWord = reversedWord;
    }
    // In expert mode, also check for anagrams (backwards versions)
    else if (difficulties[currentDifficulty].allowAnagrams) {
        // Check if this word is the reverse of any word in the list
        for (const puzzleWord of words) {
            if (word === puzzleWord.split('').reverse().join('') && !foundWords.includes(puzzleWord)) {
                foundWord = puzzleWord; // Mark the original word as found
                isAnagram = true;
                break;
            }
            if (reversedWord === puzzleWord.split('').reverse().join('') && !foundWords.includes(puzzleWord)) {
                foundWord = puzzleWord; // Mark the original word as found
                isAnagram = true;
                break;
            }
        }
    }

    if (foundWord) {
        foundWords.push(foundWord);
        markFound(selection);

        // Special message for anagrams in expert mode
        if (isAnagram && difficulties[currentDifficulty].allowAnagrams) {
            // Highlight the found word in the list with special styling
            const wordItems = document.querySelectorAll('.word-item');
            wordItems.forEach(item => {
                if (item.textContent.trim() === foundWord) {
                    item.style.textDecoration = 'line-through';
                    item.style.fontStyle = 'italic';
                    item.style.color = '#FF6B6B';
                    item.innerHTML += ' 🔄'; // Add anagram indicator
                }
            });
        }

        renderWordList();

        // Check if all words found
        if (foundWords.length === words.length) {
            stopTimer(); // Stop timer when game is complete

            let congratsMsg = difficulties[currentDifficulty].allowAnagrams ?
                '🎉 MASTER SOLVER! You found all words and anagrams!' :
                '🎉 Congratulations! You found all words!';

            if (timeAttackMode && elapsedTime > 0) {
                const seconds = Math.floor(elapsedTime / 1000);
                const minutes = Math.floor(seconds / 60);
                const displaySeconds = seconds % 60;
                congratsMsg += ` ⏱️ Time: ${minutes}:${displaySeconds.toString().padStart(2, '0')}`;
            }

            document.getElementById('status').textContent = congratsMsg;
        } else {
            const remaining = words.length - foundWords.length;
            document.getElementById('status').textContent = `Found: ${foundWords.length}/${words.length} words (${remaining} remaining)`;
        }
    } else {
        clearSelectionHighlight();
    }
}

function markFound(cells) {
    const gridElement = document.getElementById('wordGrid');
    cells.forEach(cell => {
        const index = cell.row * SIZE + cell.col;
        if (gridElement.children[index]) {
            gridElement.children[index].classList.add('found');
            gridElement.children[index].style.background = 'rgba(76, 175, 80, 0.5)';
        }
    });
}

function renderGrid() {
    const gridElement = document.getElementById('wordGrid');
    if (!gridElement) {
        console.error('wordGrid element not found!');
        return;
    }

    gridElement.innerHTML = '';

    // If no grid data, create a simple test grid
    if (!grid || grid.length === 0) {
        console.log('No grid data, creating test grid');
        SIZE = 10;
        grid = Array(SIZE).fill(null).map(() =>
            Array(SIZE).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        );
        words = ['TEST', 'GAME', 'WORD'];
        foundWords = [];
    }

    // Update grid CSS for current size
    const cellSize = difficulties[currentDifficulty] ? difficulties[currentDifficulty].cellSize : 40;
    gridElement.style.gridTemplateColumns = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.gridTemplateRows = `repeat(${SIZE}, ${cellSize}px)`;
    gridElement.style.display = 'grid';

    // Prevent default touch behavior on grid for better iPad support
    gridElement.addEventListener('touchstart', (e) => {
        // Only prevent if we're not on a form element
        if (!e.target.closest('input, button, select, textarea')) {
            e.preventDefault();
        }
    }, { passive: false });

    gridElement.addEventListener('touchmove', (e) => {
        // Prevent scrolling/zooming while selecting words
        if (selecting) {
            e.preventDefault();
        }
    }, { passive: false });

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.fontSize = `${cellSize * 0.5}px`;
            cell.textContent = (grid[row] && grid[row][col]) ? grid[row][col] : 'X';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // Mouse event handlers for word selection
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault();
                startSelection(row, col);
            });

            cell.addEventListener('mouseenter', () => {
                addToSelection(row, col);
            });

            cell.addEventListener('mouseup', () => {
                endSelection();
            });

            // Touch event handlers for iPad support
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startSelection(row, col);
            }, { passive: false });

            cell.addEventListener('touchmove', (e) => {
                e.preventDefault();
                // Get touch position and find cell under touch
                const touch = e.touches[0];
                const gridElement = document.getElementById('wordGrid');
                const gridRect = gridElement.getBoundingClientRect();
                const cellSize = difficulties[currentDifficulty].cellSize;

                const col = Math.floor((touch.clientX - gridRect.left) / cellSize);
                const row = Math.floor((touch.clientY - gridRect.top) / cellSize);

                if (row >= 0 && row < SIZE && col >= 0 && col < SIZE) {
                    addToSelection(row, col);
                }
            }, { passive: false });

            cell.addEventListener('touchend', (e) => {
                e.preventDefault();
                endSelection();
            }, { passive: false });

            gridElement.appendChild(cell);
        }
    }

    console.log(`Rendered ${SIZE}x${SIZE} grid with ${gridElement.children.length} cells`);
}

// Initialize when DOM is ready
function initializeWordSearch() {
    console.log('Initializing Word Search...');
    setDifficulty('easy');
    newGame('animals'); // Start with animals theme by default
    console.log('Word Search initialized');
}

// Initialize immediately
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing word search');
    initializeWordSearch();

    // Initialize options checkboxes
    if (currentDifficulty === 'medium' || currentDifficulty === 'hard' || currentDifficulty === 'expert') {
        allowDiagonals = true;
        const diagonalCheckbox = document.getElementById('allowDiagonals');
        if (diagonalCheckbox) diagonalCheckbox.checked = true;
    }
    if (currentDifficulty === 'expert') {
        allowAnagrams = true;
        const anagramCheckbox = document.getElementById('allowAnagrams');
        if (anagramCheckbox) anagramCheckbox.checked = true;
    }

    updateDifficultyInfo();
});

// Fallback initialization
setTimeout(() => {
    const gridElement = document.getElementById('wordGrid');
    if (gridElement && gridElement.children.length === 0) {
        console.log('Fallback initialization triggered');
        initializeWordSearch();
    }
}, 1000);

