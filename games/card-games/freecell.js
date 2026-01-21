// FreeCell - Windows Classic
// Killing productivity since 1990!

let deck = [];
let freecells = [null, null, null, null];
let foundation = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: []
};
let tableau = [[], [], [], [], [], [], [], []];
let selectedCard = null;
let selectedPile = null;
let moves = 0;
let gameWon = false;
let currentDeal = 11982;
let aiAutoplayActive = false;
let aiAutoplayInterval = null;

// Move history for undo functionality
let moveHistory = [];

// AI move history to prevent cycles (tracks last 8 moves)
let aiMoveHistory = [];

// Seeded shuffle using Linear Congruential Generator
function seededShuffle(array, seed) {
    let rng = seed;
    for (let i = array.length - 1; i > 0; i--) {
        // LCG parameters (similar to Microsoft Visual Basic)
        rng = (rng * 1140671485 + 12820163) % 16777216;
        const j = Math.floor((rng / 16777216) * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame(dealNumber = null) {
    if (dealNumber !== null) {
        currentDeal = dealNumber;
    }

    // Create deck
    deck = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({ suit, rank });
        });
    });

    // Use seeded shuffle for reproducible deals
    seededShuffle(deck, currentDeal);

    // Deal to tableau (8 piles, deal one card to each pile in sequence)
    tableau = [[], [], [], [], [], [], [], []];
    for (let i = 0; i < 52; i++) {
        tableau[i % 8].push(deck[i]);
    }

    freecells = [null, null, null, null];
    foundation = { hearts: [], diamonds: [], clubs: [], spades: [] };
    selectedCard = null;
    selectedPile = null;
    moves = 0;
    gameWon = false;
    aiMoveHistory = []; // Clear AI move history for new game

    updateDisplay();
}

function startGame() {
    const dealInput = document.getElementById('dealNumber');
    const dealNumber = parseInt(dealInput.value);
    if (isNaN(dealNumber) || dealNumber < 1 || dealNumber > 1000000) {
        alert('Please enter a valid deal number between 1 and 1,000,000');
        return;
    }

    // Hide deal setup and show game
    document.getElementById('dealSetup').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    document.getElementById('status').textContent = 'Move cards to foundation piles';

    initGame(dealNumber);
}

function randomDeal() {
    const randomDeal = Math.floor(Math.random() * 1000000) + 1;
    document.getElementById('dealNumber').value = randomDeal;
}

// AI functionality
function aiMove() {
    if (gameWon) return;

    const move = findBestMove();
    if (move) {
        // Show what move the AI is making
        const statusEl = document.getElementById('status');
        if (statusEl) {
            let moveType = '';
            if (move.type === 'foundation') moveType = 'Foundation';
            else if (move.type === 'freecell') moveType = 'Freecell';
            else if (move.type === 'tableau') moveType = 'Tableau';
            else if (move.type === 'sequence') moveType = 'Sequence';

            statusEl.textContent = `🤖 AI: Making ${moveType} move...`;
        }

        executeMove(move);
        updateDisplay();
        checkWin();

        // Track this move in AI history to prevent cycles
        aiMoveHistory.push(move);
        if (aiMoveHistory.length > 8) {
            aiMoveHistory.shift(); // Keep only last 8 moves
        }

        // Reset status after a delay
        setTimeout(() => {
            if (!gameWon) {
                document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
            }
        }, 1500);
    } else {
        // Try to solve with full BFS solver
        const solution = trySolveWithBFS();
        if (solution && solution.length > 0) {
            const move = solution[0];
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = `🤖 AI: Using advanced solver...`;
            }
            executeMove(move);
            updateDisplay();
            checkWin();

            // Track this move in AI history to prevent cycles
            aiMoveHistory.push(move);
            if (aiMoveHistory.length > 8) {
                aiMoveHistory.shift(); // Keep only last 8 moves
            }

            setTimeout(() => {
                if (!gameWon) {
                    document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
                }
            }, 1500);
            return;
        }

        // Try aggressive moves if freecells are available
        const emptyFreecells = freecells.filter(c => c === null).length;
        if (emptyFreecells > 0) {
            const aggressiveMoves = findAggressiveFreecellMoves();
            if (aggressiveMoves.length > 0) {
                const move = aggressiveMoves[0];
                const statusEl = document.getElementById('status');
                if (statusEl) {
                    statusEl.textContent = `🤖 AI: Trying strategic move...`;
                }
                executeMove(move);
                updateDisplay();
                checkWin();

                setTimeout(() => {
                    if (!gameWon) {
                        document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
                    }
                }, 1500);
                return;
            }
        }

        document.getElementById('status').textContent = '🤖 AI: No moves available';
        setTimeout(() => {
            if (!gameWon) {
                document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
            }
        }, 2000);
    }
}

// Try to solve with BFS (limited depth for performance)
function trySolveWithBFS() {
    const currentState = {
        freecells: [...freecells],
        foundation: {
            hearts: [...foundation.hearts],
            diamonds: [...foundation.diamonds],
            clubs: [...foundation.clubs],
            spades: [...foundation.spades]
        },
        tableau: tableau.map(pile => [...pile])
    };

    // BFS with depth limit of 4 for regular AI
    const queue = [{ state: currentState, path: [], depth: 0 }];
    const visited = new Set([stateToString(currentState)]);

    while (queue.length > 0 && queue.length < 500) {
        const { state, path, depth } = queue.shift();

        if (depth >= 4) continue; // Slightly deeper for regular AI

        const moves = generateAllMoves(state);
        moves.sort((a, b) => a.priority - b.priority);

        for (const move of moves.slice(0, 2)) { // Only try best 2 moves
            const newState = applyMoveToState(state, move);
            const stateStr = stateToString(newState);

            if (!visited.has(stateStr)) {
                visited.add(stateStr);
                const newPath = [...path, move];
                queue.push({ state: newState, path: newPath, depth: depth + 1 });
            }
        }
    }

    // Return first move from any found path
    for (const item of queue) {
        if (item.path.length > 0) {
            return [item.path[0]];
        }
    }

    return null;
}

function stateToString(state) {
    let str = '';
    // Freecells
    for (let i = 0; i < 4; i++) {
        str += state.freecells[i] ? state.freecells[i].suit + state.freecells[i].rank : 'X';
    }
    str += '|';
    // Foundations
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
        str += state.foundation[suit].length;
    }
    str += '|';
    // Tableau tops
    for (let i = 0; i < 8; i++) {
        const pile = state.tableau[i];
        if (pile.length > 0) {
            str += pile[pile.length - 1].suit + pile[pile.length - 1].rank;
        } else {
            str += 'E';
        }
    }
    return str;
}

function generateAllMoves(state) {
    const moves = [];

    // Foundation moves (highest priority)
    for (let i = 0; i < 4; i++) {
        if (state.freecells[i] && canPlaceOnFoundation(state.freecells[i], state.freecells[i].suit)) {
            moves.push({
                type: 'foundation',
                from: { type: 'freecell', index: i },
                to: { type: 'foundation', suit: state.freecells[i].suit },
                priority: 1
            });
        }
    }

    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length > 0) {
            const card = state.tableau[i][state.tableau[i].length - 1];
            if (canPlaceOnFoundation(card, card.suit)) {
                moves.push({
                    type: 'foundation',
                    from: { type: 'tableau', index: i },
                    to: { type: 'foundation', suit: card.suit },
                    priority: 1
                });
            }
        }
    }

    // Empty pile moves (high priority)
    const emptyPiles = [];
    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length === 0) {
            emptyPiles.push(i);
        }
    }

    if (emptyPiles.length > 0) {
        // Kings to empty piles
        for (let i = 0; i < 4; i++) {
            if (state.freecells[i] && state.freecells[i].rank === 'K') {
                moves.push({
                    type: 'tableau',
                    from: { type: 'freecell', index: i },
                    to: { type: 'tableau', index: emptyPiles[0] },
                    priority: 2
                });
            }
        }

        for (let i = 0; i < 8; i++) {
            if (state.tableau[i].length > 0 && state.tableau[i][state.tableau[i].length - 1].rank === 'K') {
                moves.push({
                    type: 'tableau',
                    from: { type: 'tableau', index: i },
                    to: { type: 'tableau', index: emptyPiles[0] },
                    priority: 2
                });
            }
        }
    }

    // Freecell to tableau moves (medium priority)
    for (let i = 0; i < 4; i++) {
        if (state.freecells[i]) {
            const card = state.freecells[i];
            for (let j = 0; j < 8; j++) {
                if (canPlaceOnTableau(card, state.tableau[j])) {
                    moves.push({
                        type: 'tableau',
                        from: { type: 'freecell', index: i },
                        to: { type: 'tableau', index: j },
                        priority: 3
                    });
                }
            }
        }
    }

    // Tableau to freecell moves (create space, but be selective)
    const emptyFreecells = state.freecells.filter(c => c === null).length;
    if (emptyFreecells > 0) {
        for (let i = 0; i < 8; i++) {
            if (state.tableau[i].length > 0) {
                const card = state.tableau[i][state.tableau[i].length - 1];
                // Only move if it exposes a foundation-eligible card or is strategic
                if (state.tableau[i].length > 1) {
                    const cardBelow = state.tableau[i][state.tableau[i].length - 2];
                    if (canPlaceOnFoundation(cardBelow, cardBelow.suit)) {
                        moves.push({
                            type: 'freecell',
                            from: { type: 'tableau', index: i },
                            to: { type: 'freecell' },
                            priority: 4
                        });
                    }
                }
            }
        }
    }

    // Tableau to tableau moves (lower priority)
    for (let fromPile = 0; fromPile < 8; fromPile++) {
        if (state.tableau[fromPile].length === 0) continue;

        for (let toPile = 0; toPile < 8; toPile++) {
            if (fromPile === toPile) continue;

            // Try moving sequences (longest first)
            for (let seqLength = Math.min(state.tableau[fromPile].length, 13); seqLength >= 1; seqLength--) {
                const sequence = state.tableau[fromPile].slice(-seqLength);
                if (canMoveSequence(sequence, state.tableau[fromPile], state.tableau[toPile])) {
                    moves.push({
                        type: 'sequence',
                        from: { type: 'tableau', index: fromPile },
                        to: { type: 'tableau', index: toPile },
                        cards: sequence,
                        sequenceLength: seqLength,
                        priority: 5
                    });
                    break; // Take the longest valid sequence
                }
            }
        }
    }

    return moves;
}

function applyMoveToState(state, move) {
    const newState = {
        freecells: [...state.freecells],
        foundation: {
            hearts: [...state.foundation.hearts],
            diamonds: [...state.foundation.diamonds],
            clubs: [...state.foundation.clubs],
            spades: [...state.foundation.spades]
        },
        tableau: state.tableau.map(pile => [...pile])
    };

    if (move.type === 'foundation') {
        let card;
        if (move.from.type === 'freecell') {
            card = newState.freecells[move.from.index];
            newState.freecells[move.from.index] = null;
        } else {
            card = newState.tableau[move.from.index].pop();
        }
        newState.foundation[move.to.suit].push(card);
    }
    else if (move.type === 'tableau') {
        let card;
        if (move.from.type === 'freecell') {
            card = newState.freecells[move.from.index];
            newState.freecells[move.from.index] = null;
        } else {
            card = newState.tableau[move.from.index].pop();
        }
        newState.tableau[move.to.index].push(card);
    }
    else if (move.type === 'freecell') {
        const card = newState.tableau[move.from.index].pop();
        // Find first empty freecell
        for (let i = 0; i < 4; i++) {
            if (newState.freecells[i] === null) {
                newState.freecells[i] = card;
                break;
            }
        }
    }
    else if (move.type === 'sequence') {
        // Move sequence of cards
        const sequence = newState.tableau[move.from.index].splice(-move.sequenceLength);
        newState.tableau[move.to.index].push(...sequence);
    }

    return newState;
}

// Super AI - A* search solver for legendary deals like 11982
function superAIMove() {
    if (gameWon) return;

    // Try A* search for optimal solution
    const solution = tryDeepSolve();
    if (solution && solution.length > 0) {
        // Filter out moves that would create cycles
        const validMoves = filterRecentMoves(solution);
        if (validMoves.length > 0) {
            const move = validMoves[0];
            const statusEl = document.getElementById('status');
            if (statusEl) {
                statusEl.textContent = `🧠 Super AI: Found A* optimal solution path...`;
            }

            executeMove(move);
            updateDisplay();
            checkWin();

            // Track this move in AI history to prevent cycles
            aiMoveHistory.push(move);
            if (aiMoveHistory.length > 8) {
                aiMoveHistory.shift();
            }

            setTimeout(() => {
                if (!gameWon) {
                    document.getElementById('status').textContent = `Moves: ${moves} | Super AI ready!`;
                }
            }, 1500);
            return;
        }
    }

    // Fall back to regular AI
    aiMove();
}

function tryDeepSolve() {
    const currentState = {
        freecells: [...freecells],
        foundation: {
            hearts: [...foundation.hearts],
            diamonds: [...foundation.diamonds],
            clubs: [...foundation.clubs],
            spades: [...foundation.spades]
        },
        tableau: tableau.map(pile => [...pile])
    };

    // Ultra-deep A* search for legendary deals like 11982
    const openSet = [{ state: currentState, path: [], g: 0, h: heuristic(currentState) }];
    const closedSet = new Set();
    let bestPath = null;
    let bestScore = -1;

    // A* priority queue (sorted by f = g + h)
    openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));

    while (openSet.length > 0 && openSet.length < 5000) {
        const current = openSet.shift();
        const { state, path, g } = current;
        const stateStr = stateToString(state);

        if (closedSet.has(stateStr)) continue;
        closedSet.add(stateStr);

        // Enhanced scoring with multiple factors
        const foundationScore = Object.values(state.foundation).reduce((sum, pile) => sum + pile.length, 0);

        // If we found a win, return it immediately
        if (foundationScore === 52) {
            return path;
        }

        // Calculate total score for this position
        const totalScore = evaluatePosition(state);

        // Track best position found so far
        if (totalScore > bestScore && path.length > 0) {
            bestScore = totalScore;
            bestPath = path;
        }

        // If we've made significant progress, consider this a good path
        if (foundationScore >= 8 && path.length > 0 && totalScore > bestScore) {
            return path;
        }

        // Generate all possible moves and evaluate them
        const moves = generateAllMovesAdvanced(state);

        for (const move of moves) {
            const newState = applyMoveToState(state, move);
            const newStateStr = stateToString(newState);

            if (!closedSet.has(newStateStr)) {
                const newPath = [...path, move];
                const moveCost = getMoveCost(move);
                const newG = g + moveCost;
                const newH = heuristic(newState);

                openSet.push({ state: newState, path: newPath, g: newG, h: newH });
            }
        }

        // Keep open set sorted by f-score (A* priority)
        openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));

        // Prevent explosion - limit open set size
        if (openSet.length > 1000) {
            openSet.splice(1000);
        }
    }

    return bestPath; // Return best path found
}

// Advanced position evaluation for A* search
function evaluatePosition(state) {
    let score = 0;

    // Foundation cards (primary objective)
    const foundationScore = Object.values(state.foundation).reduce((sum, pile) => sum + pile.length, 0);
    score += foundationScore * 100;

    // Empty freecells (flexibility bonus)
    const emptyFreecells = state.freecells.filter(c => c === null).length;
    score += emptyFreecells * 15;

    // Empty tableau piles (Kings can go here)
    const emptyTableau = state.tableau.filter(pile => pile.length === 0).length;
    score += emptyTableau * 20;

    // Cards ready for foundation (high priority)
    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length > 0) {
            const topCard = state.tableau[i][state.tableau[i].length - 1];
            if (canPlaceOnFoundation(topCard, topCard.suit)) {
                score += 50; // Major bonus for accessible foundation cards
            }
        }
    }

    // Freecell cards that can go to foundation
    for (let i = 0; i < 4; i++) {
        if (state.freecells[i] && canPlaceOnFoundation(state.freecells[i], state.freecells[i].suit)) {
            score += 60; // Even higher bonus for freecell foundation cards
        }
    }

    // Tableau organization (longer sequences are better)
    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length >= 2) {
            let sequenceLength = 1;
            for (let j = state.tableau[i].length - 2; j >= 0; j--) {
                if (canPlaceOnTableau(state.tableau[i][j], [state.tableau[i][j + 1]])) {
                    sequenceLength++;
                } else {
                    break;
                }
            }
            score += sequenceLength * 2; // Bonus for organized sequences
        }
    }

    return score;
}

// Heuristic for A* search (estimates distance to goal)
function heuristic(state) {
    const foundationCards = Object.values(state.foundation).reduce((sum, pile) => sum + pile.length, 0);
    const remainingCards = 52 - foundationCards;

    // Base heuristic: cards not yet in foundation
    let h = remainingCards * 10;

    // Penalty for blocked foundation cards
    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length > 0) {
            const topCard = state.tableau[i][state.tableau[i].length - 1];
            if (canPlaceOnFoundation(topCard, topCard.suit)) {
                h -= 20; // Reduce heuristic for accessible cards
            }
        }
    }

    // Bonus for empty freecells (reduce estimated difficulty)
    const emptyFreecells = state.freecells.filter(c => c === null).length;
    h -= emptyFreecells * 5;

    return Math.max(0, h);
}

// Move cost for A* search
function getMoveCost(move) {
    // Foundation moves are cheap (we want these)
    if (move.type === 'foundation') return 1;

    // Empty pile moves are also good
    if (move.type === 'tableau' && move.to && move.to.type === 'tableau') {
        const toPileIndex = move.to.index;
        if (tableau[toPileIndex] && tableau[toPileIndex].length === 0) return 2;
    }

    // Other moves cost more
    return 5;
}

// Advanced move generation with better heuristics
function generateAllMovesAdvanced(state) {
    const moves = [];

    // Foundation moves (always highest priority)
    for (let i = 0; i < 4; i++) {
        if (state.freecells[i] && canPlaceOnFoundation(state.freecells[i], state.freecells[i].suit)) {
            moves.push({
                type: 'foundation',
                from: { type: 'freecell', index: i },
                to: { type: 'foundation', suit: state.freecells[i].suit },
                priority: 1
            });
        }
    }

    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length > 0) {
            const card = state.tableau[i][state.tableau[i].length - 1];
            if (canPlaceOnFoundation(card, card.suit)) {
                moves.push({
                    type: 'foundation',
                    from: { type: 'tableau', index: i },
                    to: { type: 'foundation', suit: card.suit },
                    priority: 1
                });
            }
        }
    }

    // Empty pile moves (Kings to empty piles)
    const emptyPiles = [];
    for (let i = 0; i < 8; i++) {
        if (state.tableau[i].length === 0) {
            emptyPiles.push(i);
        }
    }

    if (emptyPiles.length > 0) {
        for (let i = 0; i < 4; i++) {
            if (state.freecells[i] && state.freecells[i].rank === 'K') {
                moves.push({
                    type: 'tableau',
                    from: { type: 'freecell', index: i },
                    to: { type: 'tableau', index: emptyPiles[0] },
                    priority: 2
                });
            }
        }

        for (let i = 0; i < 8; i++) {
            if (state.tableau[i].length > 0 && state.tableau[i][state.tableau[i].length - 1].rank === 'K') {
                moves.push({
                    type: 'tableau',
                    from: { type: 'tableau', index: i },
                    to: { type: 'tableau', index: emptyPiles[0] },
                    priority: 2
                });
            }
        }
    }

    // Strategic freecell moves (only when beneficial)
    const emptyFreecells = state.freecells.filter(c => c === null).length;
    if (emptyFreecells > 0) {
        for (let i = 0; i < 8; i++) {
            if (state.tableau[i].length > 1) {
                const card = state.tableau[i][state.tableau[i].length - 1];
                const cardBelow = state.tableau[i][state.tableau[i].length - 2];

                // Only move if it exposes a foundation-eligible card
                if (canPlaceOnFoundation(cardBelow, cardBelow.suit)) {
                    moves.push({
                        type: 'freecell',
                        from: { type: 'tableau', index: i },
                        to: { type: 'freecell' },
                        priority: 3
                    });
                }
            }
        }
    }

    // Freecell to tableau moves
    for (let i = 0; i < 4; i++) {
        if (state.freecells[i]) {
            const card = state.freecells[i];
            for (let j = 0; j < 8; j++) {
                if (canPlaceOnTableau(card, state.tableau[j])) {
                    // Prioritize moves that build sequences or clear space
                    const priority = state.tableau[j].length === 0 && card.rank === 'K' ? 2 :
                                   canPlaceOnFoundation(card, card.suit) ? 1 : 4;
                    moves.push({
                        type: 'tableau',
                        from: { type: 'freecell', index: i },
                        to: { type: 'tableau', index: j },
                        priority: priority
                    });
                }
            }
        }
    }

    // Tableau sequence moves (most complex)
    for (let fromPile = 0; fromPile < 8; fromPile++) {
        if (state.tableau[fromPile].length === 0) continue;

        for (let toPile = 0; toPile < 8; toPile++) {
            if (fromPile === toPile) continue;

            // Try moving sequences (longest first, but limit to reasonable sizes)
            for (let seqLength = Math.min(state.tableau[fromPile].length, 8); seqLength >= 1; seqLength--) {
                const sequence = state.tableau[fromPile].slice(-seqLength);
                if (canMoveSequence(sequence, state.tableau[fromPile], state.tableau[toPile])) {
                    const priority = state.tableau[toPile].length === 0 && sequence[0].rank === 'K' ? 2 :
                                   seqLength > 3 ? 5 : 6; // Longer sequences get higher priority
                    moves.push({
                        type: 'sequence',
                        from: { type: 'tableau', index: fromPile },
                        to: { type: 'tableau', index: toPile },
                        cards: sequence,
                        sequenceLength: seqLength,
                        priority: priority
                    });
                    break; // Take the longest valid sequence
                }
            }
        }
    }

    // Sort by priority (lower number = higher priority)
    moves.sort((a, b) => a.priority - b.priority);

    return moves;
}

function toggleAiAutoplay() {
    if (aiAutoplayActive) {
        stopAiAutoplay();
    } else {
        startAiAutoplay();
    }
}

function startAiAutoplay() {
    if (aiAutoplayActive) return;
    aiAutoplayActive = true;
    document.getElementById('aiAutoplayBtn').textContent = '⏹️ Stop AI';
    document.getElementById('aiAutoplayBtn').style.background = 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)';

    aiAutoplayInterval = setInterval(() => {
        if (gameWon) {
            stopAiAutoplay();
            return;
        }

        const move = findBestMove();
        if (move) {
            // Show what move the AI is making
            const statusEl = document.getElementById('status');
            if (statusEl) {
                let moveType = '';
                if (move.type === 'foundation') moveType = 'Foundation';
                else if (move.type === 'freecell') moveType = 'Freecell';
                else if (move.type === 'tableau') moveType = 'Tableau';
                else if (move.type === 'sequence') moveType = 'Sequence';

                statusEl.textContent = `🤖 AI: Making ${moveType} move...`;
            }

            executeMove(move);
            updateDisplay();
            if (checkWin()) {
                stopAiAutoplay();
            }
        } else {
            // No move available, try aggressive moves if freecells are available
            const emptyFreecells = freecells.filter(c => c === null).length;
            if (emptyFreecells > 0) {
                const aggressiveMoves = findAggressiveFreecellMoves();
                if (aggressiveMoves.length > 0) {
                    const move = aggressiveMoves[0];
                    const statusEl = document.getElementById('status');
                    if (statusEl) {
                        statusEl.textContent = `🤖 AI: Trying strategic move...`;
                    }
                    executeMove(move);
                    updateDisplay();
                    return;
                }
            }

            // No move available at all, stop autoplay
            stopAiAutoplay();
            document.getElementById('status').textContent = '🤖 AI: No moves available - stopped';
            setTimeout(() => {
                if (!gameWon) {
                    document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
                }
            }, 2000);
        }
    }, 800); // Slightly slower than Minesweeper for better visibility
}

function stopAiAutoplay() {
    if (aiAutoplayInterval) {
        clearInterval(aiAutoplayInterval);
        aiAutoplayInterval = null;
    }
    aiAutoplayActive = false;
    document.getElementById('aiAutoplayBtn').textContent = '🎯 AI Auto';
    document.getElementById('aiAutoplayBtn').style.background = 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)';
}

// AI Move Finding Logic
function findBestMove() {
    // Priority 1: Move cards to foundation (always best)
    const foundationMoves = findFoundationMoves();
    const validFoundationMoves = filterRecentMoves(foundationMoves);
    if (validFoundationMoves.length > 0) {
        return validFoundationMoves[0];
    }

    // Priority 2: Move Kings to empty tableau piles (very valuable)
    const kingToEmptyMoves = findKingToEmptyPileMoves();
    const validKingMoves = filterRecentMoves(kingToEmptyMoves);
    if (validKingMoves.length > 0) {
        return validKingMoves[0];
    }

    // Priority 3: Move cards from freecells to empty tableau piles
    const freecellToEmptyMoves = findFreecellToEmptyPileMoves();
    const validFreecellToEmptyMoves = filterRecentMoves(freecellToEmptyMoves);
    if (validFreecellToEmptyMoves.length > 0) {
        return validFreecellToEmptyMoves[0];
    }

    // Priority 4: Move cards to empty freecells (create more move options) - but avoid cycles!
    const freecellMoves = findFreecellMoves();
    const validFreecellMoves = filterRecentMoves(freecellMoves);
    if (validFreecellMoves.length > 0) {
        return validFreecellMoves[0];
    }

    // Priority 5: Move cards from freecells to non-empty tableau piles - but avoid cycles!
    const freecellToTableauMoves = findFreecellToTableauMoves();
    const validFreecellToTableauMoves = filterRecentMoves(freecellToTableauMoves);
    if (validFreecellToTableauMoves.length > 0) {
        return validFreecellToTableauMoves[0];
    }

    // Priority 6: Build sequences in tableau
    const tableauMoves = findTableauMoves();
    const validTableauMoves = filterRecentMoves(tableauMoves);
    if (validTableauMoves.length > 0) {
        return validTableauMoves[0];
    }

    // Last resort: If we have empty freecells, be more aggressive about using them
    const emptyFreecells = freecells.filter(c => c === null).length;
    if (emptyFreecells > 0) {
        const aggressiveMoves = findAggressiveFreecellMoves();
        const validAggressiveMoves = filterRecentMoves(aggressiveMoves);
        if (validAggressiveMoves.length > 0) {
            return validAggressiveMoves[0];
        }
    }

    return null;
}

function filterRecentMoves(moves) {
    // Filter out moves that would create cycles with recent AI moves
    return moves.filter(move => {
        // Check if this exact move was made recently
        for (const recentMove of aiMoveHistory.slice(-6)) { // Check last 6 moves
            if (isReverseMove(move, recentMove)) {
                return false; // This move would undo a recent move - skip it
            }
        }
        return true;
    });
}

function isReverseMove(move1, move2) {
    // Check if move1 is the reverse/undo of move2
    if (!move1 || !move2) return false;

    // Same card?
    if (!cardsEqual(move1.card, move2.card)) return false;

    // Check if it's a freecell <-> tableau cycle
    if (move1.type === 'freecell' && move2.type === 'tableau' &&
        move1.from.type === 'tableau' && move2.from.type === 'freecell' &&
        move1.from.index === move2.to.index && move1.to.type === 'freecell' && move2.from.index === move1.from.index) {
        return true; // This is moving the same card from tableau to freecell and back
    }

    if (move1.type === 'tableau' && move2.type === 'freecell' &&
        move1.from.type === 'freecell' && move2.from.type === 'tableau' &&
        move1.from.index === move2.to.index && move1.to.type === 'tableau' && move2.from.index === move1.to.index) {
        return true; // This is moving the same card from freecell to tableau and back
    }

    return false;
}

function cardsEqual(card1, card2) {
    if (!card1 || !card2) return false;
    return card1.suit === card2.suit && card1.rank === card2.rank;
}

function findFoundationMoves() {
    const moves = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

    // Check freecells
    for (let i = 0; i < 4; i++) {
        if (freecells[i] && canPlaceOnFoundation(freecells[i], freecells[i].suit)) {
            moves.push({
                type: 'foundation',
                from: { type: 'freecell', index: i },
                to: { type: 'foundation', suit: freecells[i].suit },
                card: freecells[i]
            });
        }
    }

    // Check tableau tops
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length > 0) {
            const card = tableau[i][tableau[i].length - 1];
            if (canPlaceOnFoundation(card, card.suit)) {
                moves.push({
                    type: 'foundation',
                    from: { type: 'tableau', index: i },
                    to: { type: 'foundation', suit: card.suit },
                    card: card
                });
            }
        }
    }

    return moves;
}

function findFreecellMoves() {
    const moves = [];
    const emptyFreecells = freecells.filter(c => c === null).length;

    if (emptyFreecells === 0) return moves;

    // VERY conservative - only move to freecell when it will immediately help foundation progress
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length > 1) { // Must have at least 2 cards
            const card = tableau[i][tableau[i].length - 1];
            const cardBelow = tableau[i][tableau[i].length - 2];

            // ONLY move if the card below can immediately go to foundation
            if (canPlaceOnFoundation(cardBelow, cardBelow.suit)) {
                moves.push({
                    type: 'freecell',
                    from: { type: 'tableau', index: i },
                    to: { type: 'freecell' },
                    card: card
                });
            }
        }
    }

    return moves;
}

function findKingToEmptyPileMoves() {
    const moves = [];

    // Find empty tableau piles
    const emptyPiles = [];
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length === 0) {
            emptyPiles.push(i);
        }
    }

    if (emptyPiles.length === 0) return moves;

    // Look for Kings in freecells
    for (let i = 0; i < 4; i++) {
        if (freecells[i] && freecells[i].rank === 'K') {
            moves.push({
                type: 'tableau',
                from: { type: 'freecell', index: i },
                to: { type: 'tableau', index: emptyPiles[0] },
                card: freecells[i]
            });
        }
    }

    // Look for Kings on tableau tops
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length > 0 && tableau[i][tableau[i].length - 1].rank === 'K') {
            moves.push({
                type: 'tableau',
                from: { type: 'tableau', index: i },
                to: { type: 'tableau', index: emptyPiles[0] },
                card: tableau[i][tableau[i].length - 1]
            });
        }
    }

    return moves;
}

function findFreecellToEmptyPileMoves() {
    const moves = [];

    // Find empty tableau piles
    const emptyPiles = [];
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length === 0) {
            emptyPiles.push(i);
        }
    }

    if (emptyPiles.length === 0) return moves;

    // Move any card from freecell to empty pile (only Kings can go on empty piles)
    for (let i = 0; i < 4; i++) {
        if (freecells[i] && freecells[i].rank === 'K') {
            moves.push({
                type: 'tableau',
                from: { type: 'freecell', index: i },
                to: { type: 'tableau', index: emptyPiles[0] },
                card: freecells[i]
            });
        }
    }

    return moves;
}

function findFreecellToTableauMoves() {
    const moves = [];

    for (let i = 0; i < 4; i++) {
        if (freecells[i]) {
            const card = freecells[i];
            // Try to place on each tableau pile
            for (let j = 0; j < 8; j++) {
                if (canPlaceOnTableau(card, tableau[j])) {
                    moves.push({
                        type: 'tableau',
                        from: { type: 'freecell', index: i },
                        to: { type: 'tableau', index: j },
                        card: card
                    });
                }
            }
        }
    }

    return moves;
}

function findTableauMoves() {
    const moves = [];

    for (let fromPile = 0; fromPile < 8; fromPile++) {
        if (tableau[fromPile].length === 0) continue;

        for (let toPile = 0; toPile < 8; toPile++) {
            if (fromPile === toPile) continue;

            // Try moving sequences (longest first)
            for (let seqLength = Math.min(tableau[fromPile].length, 13); seqLength >= 1; seqLength--) {
                const sequence = tableau[fromPile].slice(-seqLength);
                if (canMoveSequence(sequence, tableau[fromPile], tableau[toPile])) {
                    moves.push({
                        type: 'sequence',
                        from: { type: 'tableau', index: fromPile },
                        to: { type: 'tableau', index: toPile },
                        cards: sequence,
                        sequenceLength: seqLength,
                        priority: tableau[toPile].length === 0 && sequence[0].rank === 'K' ? 1 : 2
                    });
                    break; // Take the longest valid sequence
                }
            }
        }
    }

    // Sort by priority (empty pile moves first)
    moves.sort((a, b) => a.priority - b.priority);

    return moves;
}

function canMoveSequenceFromTableau(pileIndex, cardIndex) {
    // Check if moving this card would break a sequence or help progress
    const pile = tableau[pileIndex];
    if (cardIndex === 0 || pile.length <= 1) return true;

    // Check if the card below would be eligible for foundation
    const cardBelow = pile[cardIndex - 1];
    if (canPlaceOnFoundation(cardBelow, cardBelow.suit)) {
        return true; // Good to move, exposes foundation-eligible card
    }

    return false; // Don't move if it doesn't help
}

function isCardBlocking(card, pileIndex) {
    // Check if this card is blocking access to foundation moves or sequences
    const pile = tableau[pileIndex];

    // If this card can go to foundation, it's not blocking
    if (canPlaceOnFoundation(card, card.suit)) {
        return false;
    }

    // If there are cards below that can go to foundation, this card is blocking
    for (let i = 0; i < pile.length - 1; i++) {
        if (canPlaceOnFoundation(pile[i], pile[i].suit)) {
            return true;
        }
    }

    // Check if this card is preventing sequence moves
    const emptyPiles = tableau.filter(p => p.length === 0).length;
    const emptyFreecells = freecells.filter(c => c === null).length;

    // If we have empty piles/freecells, blocking cards should be moved
    if (emptyPiles > 0 || emptyFreecells > 1) {
        // Look for cards below that could start sequences
        for (let i = 0; i < pile.length - 1; i++) {
            if (pile[i].rank === 'K' && emptyPiles > 0) {
                return true; // Blocking a King that could go to empty pile
            }
        }
    }

    return false;
}

function findAggressiveFreecellMoves() {
    const moves = [];
    const emptyFreecells = freecells.filter(c => c === null).length;

    if (emptyFreecells === 0) return moves;

    // Last resort: Move any card from tableau to freecell if it might help
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length > 0) {
            const card = tableau[i][tableau[i].length - 1];

            // Don't move Kings if we have empty piles (Kings should go to empty piles first)
            if (card.rank === 'K' && tableau.some(p => p.length === 0)) {
                continue;
            }

            // Move any card that might help create more options
            moves.push({
                type: 'freecell',
                from: { type: 'tableau', index: i },
                to: { type: 'freecell' },
                card: card,
                priority: 4
            });
        }
    }

    return moves;
}

function executeMove(move) {
    // Save state for undo before making move
    saveGameState();

    if (move.type === 'foundation') {
        // Move to foundation
        if (move.from.type === 'freecell') {
            foundation[move.to.suit].push(freecells[move.from.index]);
            freecells[move.from.index] = null;
        } else if (move.from.type === 'tableau') {
            const card = tableau[move.from.index].pop();
            foundation[move.to.suit].push(card);
        }
    } else if (move.type === 'freecell') {
        // Move to freecell
        const card = tableau[move.from.index].pop();
        const emptyIndex = freecells.findIndex(c => c === null);
        freecells[emptyIndex] = card;
    } else if (move.type === 'tableau') {
        // Move from freecell to tableau
        const card = freecells[move.from.index];
        freecells[move.from.index] = null;
        tableau[move.to.index].push(card);
    } else if (move.type === 'sequence') {
        // Move sequence between tableau piles
        const cards = tableau[move.from.index].splice(-move.sequenceLength);
        tableau[move.to.index].push(...cards);
    }

    moves++;
}

function saveGameState() {
    const state = {
        freecells: [...freecells],
        foundation: {
            hearts: [...foundation.hearts],
            diamonds: [...foundation.diamonds],
            clubs: [...foundation.clubs],
            spades: [...foundation.spades]
        },
        tableau: tableau.map(pile => [...pile]),
        moves: moves,
        gameWon: gameWon
    };
    moveHistory.push(state);

    // Keep only last 10 moves for memory efficiency
    if (moveHistory.length > 10) {
        moveHistory.shift();
    }
}

// ===== CHEAT FUNCTIONS =====

// Auto-move eligible cards to foundation
function cheatAutoFoundation() {
    if (gameWon) return;

    let movesMade = 0;
    let foundMove = true;

    while (foundMove && movesMade < 10) { // Prevent infinite loops
        foundMove = false;

        // Check freecells first
        for (let i = 0; i < 4; i++) {
            if (freecells[i] && canPlaceOnFoundation(freecells[i], freecells[i].suit)) {
                executeMove({
                    type: 'foundation',
                    from: { type: 'freecell', index: i },
                    to: { suit: freecells[i].suit }
                });
                movesMade++;
                foundMove = true;
                break;
            }
        }

        if (!foundMove) {
            // Check tableau piles
            for (let i = 0; i < 8; i++) {
                if (tableau[i].length > 0) {
                    const card = tableau[i][tableau[i].length - 1];
                    if (canPlaceOnFoundation(card, card.suit)) {
                        executeMove({
                            type: 'foundation',
                            from: { type: 'tableau', index: i },
                            to: { suit: card.suit }
                        });
                        movesMade++;
                        foundMove = true;
                        break;
                    }
                }
            }
        }
    }

    updateDisplay();
    checkWin();

    const statusEl = document.getElementById('status');
    if (statusEl) {
        statusEl.textContent = `🎯 Auto-moved ${movesMade} cards to foundation!`;
        setTimeout(() => {
            if (!gameWon) {
                statusEl.textContent = `Moves: ${moves} | Keep playing!`;
            }
        }, 2000);
    }
}

// Undo last move
function cheatUndoMove() {
    if (moveHistory.length === 0) {
        document.getElementById('status').textContent = '❌ No moves to undo!';
        setTimeout(() => {
            document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
        }, 1500);
        return;
    }

    const previousState = moveHistory.pop();
    freecells = [...previousState.freecells];
    foundation = {
        hearts: [...previousState.foundation.hearts],
        diamonds: [...previousState.foundation.diamonds],
        clubs: [...previousState.foundation.clubs],
        spades: [...previousState.foundation.spades]
    };
    tableau = previousState.tableau.map(pile => [...pile]);
    moves = previousState.moves;
    gameWon = previousState.gameWon;

    updateDisplay();

    document.getElementById('status').textContent = '↶ Move undone!';
    setTimeout(() => {
        if (!gameWon) {
            document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
        }
    }, 1500);
}

// Shuffle freecell cards
function cheatShuffleFreecells() {
    const occupiedFreecells = freecells.filter(card => card !== null);
    if (occupiedFreecells.length < 2) {
        document.getElementById('status').textContent = '❌ Need at least 2 cards in freecells to shuffle!';
        setTimeout(() => {
            document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
        }, 1500);
        return;
    }

    // Simple shuffle
    for (let i = occupiedFreecells.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [occupiedFreecells[i], occupiedFreecells[j]] = [occupiedFreecells[j], occupiedFreecells[i]];
    }

    // Put back into freecells
    let occupiedIndex = 0;
    for (let i = 0; i < 4; i++) {
        if (freecells[i] !== null) {
            freecells[i] = occupiedFreecells[occupiedIndex++];
        }
    }

    updateDisplay();

    document.getElementById('status').textContent = '🔀 Freecells shuffled!';
    setTimeout(() => {
        document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
    }, 1500);
}

// Auto-move Kings to empty tableau piles
function cheatAutoKings() {
    let kingsMoved = 0;

    // Check freecells for Kings
    for (let i = 0; i < 4; i++) {
        if (freecells[i] && freecells[i].rank === 'K') {
            // Find empty tableau pile
            const emptyPileIndex = tableau.findIndex(pile => pile.length === 0);
            if (emptyPileIndex !== -1) {
                executeMove({
                    type: 'tableau',
                    from: { type: 'freecell', index: i },
                    to: { index: emptyPileIndex }
                });
                kingsMoved++;
            }
        }
    }

    // Check tableau piles for Kings on top
    for (let i = 0; i < 8; i++) {
        if (tableau[i].length > 0 && tableau[i][tableau[i].length - 1].rank === 'K') {
            // Find empty tableau pile
            const emptyPileIndex = tableau.findIndex(pile => pile.length === 0);
            if (emptyPileIndex !== -1 && emptyPileIndex !== i) {
                executeMove({
                    type: 'sequence',
                    from: { type: 'tableau', index: i },
                    to: { index: emptyPileIndex },
                    sequenceLength: 1
                });
                kingsMoved++;
            }
        }
    }

    if (kingsMoved > 0) {
        updateDisplay();
        checkWin();

        document.getElementById('status').textContent = `👑 Auto-moved ${kingsMoved} King(s) to empty piles!`;
        setTimeout(() => {
            if (!gameWon) {
                document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
            }
        }, 2000);
    } else {
        document.getElementById('status').textContent = '❌ No Kings available to move to empty piles!';
        setTimeout(() => {
            document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
        }, 1500);
    }
}

// Fast forward - auto-build foundation piles
function cheatFastForward() {
    if (gameWon) return;

    let totalMoves = 0;
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops

    while (!gameWon && iterations < maxIterations) {
        let movesThisIteration = 0;

        // Auto foundation moves
        let foundMove = true;
        while (foundMove && movesThisIteration < 5) {
            foundMove = false;

            // Check freecells
            for (let i = 0; i < 4; i++) {
                if (freecells[i] && canPlaceOnFoundation(freecells[i], freecells[i].suit)) {
                    executeMove({
                        type: 'foundation',
                        from: { type: 'freecell', index: i },
                        to: { suit: freecells[i].suit }
                    });
                    movesThisIteration++;
                    totalMoves++;
                    foundMove = true;
                    break;
                }
            }

            if (!foundMove) {
                // Check tableau
                for (let i = 0; i < 8; i++) {
                    if (tableau[i].length > 0) {
                        const card = tableau[i][tableau[i].length - 1];
                        if (canPlaceOnFoundation(card, card.suit)) {
                            executeMove({
                                type: 'foundation',
                                from: { type: 'tableau', index: i },
                                to: { suit: card.suit }
                            });
                            movesThisIteration++;
                            totalMoves++;
                            foundMove = true;
                            break;
                        }
                    }
                }
            }
        }

        // Auto King moves if no foundation moves available
        if (movesThisIteration === 0) {
            let kingsMoved = 0;

            // Check freecells for Kings
            for (let i = 0; i < 4; i++) {
                if (freecells[i] && freecells[i].rank === 'K') {
                    const emptyPileIndex = tableau.findIndex(pile => pile.length === 0);
                    if (emptyPileIndex !== -1) {
                        executeMove({
                            type: 'tableau',
                            from: { type: 'freecell', index: i },
                            to: { index: emptyPileIndex }
                        });
                        kingsMoved++;
                        totalMoves++;
                    }
                }
            }

            // Check tableau for Kings
            for (let i = 0; i < 8; i++) {
                if (tableau[i].length > 0 && tableau[i][tableau[i].length - 1].rank === 'K') {
                    const emptyPileIndex = tableau.findIndex(pile => pile.length === 0);
                    if (emptyPileIndex !== -1 && emptyPileIndex !== i) {
                        executeMove({
                            type: 'sequence',
                            from: { type: 'tableau', index: i },
                            to: { index: emptyPileIndex },
                            sequenceLength: 1
                        });
                        kingsMoved++;
                        totalMoves++;
                    }
                }
            }

            movesThisIteration = kingsMoved;
        }

        if (movesThisIteration === 0) {
            break; // No more moves possible
        }

        iterations++;
        checkWin();
    }

    updateDisplay();

    document.getElementById('status').textContent = `⚡ Fast forwarded ${totalMoves} moves! ${gameWon ? 'Game won!' : ''}`;
    setTimeout(() => {
        if (!gameWon) {
            document.getElementById('status').textContent = `Moves: ${moves} | Keep playing!`;
        }
    }, 3000);
}

function canPlaceOnFoundation(card, suit) {
    const foundationPile = foundation[suit];
    if (foundationPile.length === 0) {
        return card.rank === 'A' && card.suit === suit;
    }
    const topCard = foundationPile[foundationPile.length - 1];
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topIndex = rankOrder.indexOf(topCard.rank);
    const cardIndex = rankOrder.indexOf(card.rank);
    return cardIndex === topIndex + 1 && card.suit === suit;
}

function canPlaceOnTableau(card, pile) {
    if (pile.length === 0) {
        return card.rank === 'K';
    }
    const topCard = pile[pile.length - 1];
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const topIndex = rankOrder.indexOf(topCard.rank);
    const cardIndex = rankOrder.indexOf(card.rank);
    
    const topColor = ['hearts', 'diamonds'].includes(topCard.suit) ? 'red' : 'black';
    const cardColor = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
    
    return cardIndex === topIndex - 1 && topColor !== cardColor;
}

function canMoveSequence(cards, fromPile, toPile) {
    if (cards.length === 0) return false;
    
    // Count available freecells and empty tableau piles
    const emptyFreecells = freecells.filter(c => c === null).length;
    const emptyTableau = tableau.filter(p => p.length === 0).length;
    const maxMovable = (emptyFreecells + 1) * Math.pow(2, emptyTableau);
    
    if (cards.length > maxMovable) return false;
    
    // Check if sequence is valid
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (let i = 0; i < cards.length - 1; i++) {
        const current = cards[i];
        const next = cards[i + 1];
        const currentIndex = rankOrder.indexOf(current.rank);
        const nextIndex = rankOrder.indexOf(next.rank);
        
        const currentColor = ['hearts', 'diamonds'].includes(current.suit) ? 'red' : 'black';
        const nextColor = ['hearts', 'diamonds'].includes(next.suit) ? 'red' : 'black';
        
        if (currentIndex !== nextIndex + 1 || currentColor === nextColor) {
            return false;
        }
    }
    
    // Check if can place on destination
    if (toPile.length === 0) {
        return cards[cards.length - 1].rank === 'K';
    }
    return canPlaceOnTableau(cards[0], toPile);
}

function selectCard(card, pileType, pileIndex) {
    if (selectedCard === card && selectedPile?.type === pileType && selectedPile?.index === pileIndex) {
        selectedCard = null;
        selectedPile = null;
    } else {
        selectedCard = card;
        selectedPile = { type: pileType, index: pileIndex };
    }
    updateDisplay();
}

function moveCard() {
    if (!selectedCard || !selectedPile) return;
    
    const { type, index } = selectedPile;
    let cardsToMove = [];
    let sourcePile = null;
    
    if (type === 'freecell') {
        cardsToMove = [freecells[index]];
        sourcePile = freecells;
    } else if (type === 'tableau') {
        const pile = tableau[index];
        const cardIndex = pile.indexOf(selectedCard);
        cardsToMove = pile.slice(cardIndex);
        sourcePile = pile;
    }
    
    // Try foundation first
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
        if (cardsToMove.length === 1 && canPlaceOnFoundation(cardsToMove[0], suit)) {
            if (type === 'freecell') {
                freecells[index] = null;
            } else {
                sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), 1);
            }
            foundation[suit].push(cardsToMove[0]);
            moves++;
            selectedCard = null;
            selectedPile = null;
            if (checkWin()) {
                stopAiAutoplay();
            }
            updateDisplay();
            return;
        }
    }
    
    // Try freecell (single card only)
    if (cardsToMove.length === 1) {
        for (let i = 0; i < 4; i++) {
            if (freecells[i] === null && type !== 'freecell') {
                sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), 1);
                freecells[i] = cardsToMove[0];
                moves++;
                selectedCard = null;
                selectedPile = null;
                updateDisplay();
                return;
            }
        }
    }
    
    // Try tableau
    for (let i = 0; i < 8; i++) {
        if (i === index && type === 'tableau') continue;
        if (canMoveSequence(cardsToMove, sourcePile, tableau[i])) {
            sourcePile.splice(sourcePile.indexOf(cardsToMove[0]), cardsToMove.length);
            tableau[i].push(...cardsToMove);
            moves++;
            selectedCard = null;
            selectedPile = null;
            updateDisplay();
            return;
        }
    }
    
    // Invalid move
    selectedCard = null;
    selectedPile = null;
    updateDisplay();
}

function checkWin() {
    const allSuits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const won = allSuits.every(suit => foundation[suit].length === 13);
    if (won && !gameWon) {
        gameWon = true;
        document.getElementById('status').textContent = `🎉 YOU WON in ${moves} moves! 🎉`;
        return true;
    }
    return false;
}

function updateDisplay() {
    // Freecells
    for (let i = 0; i < 4; i++) {
        const freecellEl = document.querySelectorAll('.freecell')[i];
        freecellEl.innerHTML = '';
        if (freecells[i]) {
            const cardEl = createCardElement(freecells[i], 'freecell', i);
            if (selectedCard === freecells[i] && selectedPile?.type === 'freecell') {
                cardEl.classList.add('selected');
            }
            freecellEl.appendChild(cardEl);
        }
    }
    
    // Foundations
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    suits.forEach((suit, i) => {
        const foundationEl = document.querySelectorAll('.foundation')[i];
        foundationEl.innerHTML = '';
        if (foundation[suit].length > 0) {
            const card = foundation[suit][foundation[suit].length - 1];
            const cardEl = createCardElement(card, 'foundation', suit);
            foundationEl.appendChild(cardEl);
        } else {
            foundationEl.innerHTML = '<div style="color: rgba(255,255,255,0.3);">' + suit.charAt(0).toUpperCase() + '</div>';
        }
    });
    
    // Tableau
    const tableauEl = document.getElementById('tableau');
    tableauEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const pileEl = document.createElement('div');
        pileEl.className = 'tableau-pile card-stack';
        pileEl.id = 'tableau-' + i;
        
        tableau[i].forEach((card, cardIndex) => {
            const cardEl = createCardElement(card, 'tableau', i);
            if (selectedCard === card && selectedPile?.type === 'tableau' && selectedPile?.index === i) {
                cardEl.classList.add('selected');
            }
            pileEl.appendChild(cardEl);
        });
        
        tableauEl.appendChild(pileEl);
    }
    
    document.getElementById('status').textContent = `Moves: ${moves} | ${gameWon ? 'YOU WON!' : 'Keep playing!'}`;
}

// SVG Suit symbols
function getSuitSVG(suit, color, size = 24) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';

    switch(suit) {
        case 'hearts':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${fill}"/>
            </svg>`;
        case 'diamonds':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 2L2 12l10 10 10-10L12 2z" fill="${fill}"/>
            </svg>`;
        case 'clubs':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <circle cx="12" cy="8" r="4" fill="${fill}"/>
                <circle cx="7" cy="12" r="3" fill="${fill}"/>
                <circle cx="17" cy="12" r="3" fill="${fill}"/>
                <path d="M10 12 L14 12 L12 20 Z" fill="${fill}"/>
            </svg>`;
        case 'spades':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 2.13-1.5 3.94-3.5 4.58V16h-3v-2.42C8.5 12.94 7 11.13 7 9c0-2.76 2.24-5 5-5zm-1 15h2v3h-2v-3z" fill="${fill}"/>
            </svg>`;
        default:
            return '';
    }
}

// SVG Face card illustrations
function getFaceCardSVG(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 30);

    let faceSVG = '';
    switch(rank) {
        case 'K':
            // Simple K letter
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M25 40 L25 70 M25 55 L35 40 M25 55 L35 70" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
        case 'Q':
            // Simple Q letter
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <circle cx="30" cy="50" r="8" stroke="${fill}" stroke-width="4" fill="none"/>
                <path d="M35 55 L40 60" stroke="${fill}" stroke-width="4" stroke-linecap="round"/>
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
        case 'J':
            // Simple J letter
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <path d="M30 35 L30 65 M25 65 Q30 70 35 65" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
        case 'A':
            // Ace - large A with suit
            faceSVG = `<svg width="70" height="100" viewBox="0 0 70 100" style="display: block;">
                <!-- A letter -->
                <path d="M20 70 L30 40 L40 70 M25 60 L35 60" stroke="${fill}" stroke-width="4" stroke-linecap="round" fill="none"/>
                <!-- Suit symbol in center -->
                <g transform="translate(20, 75)">${suitSVG}</g>
            </svg>`;
            break;
    }
    return faceSVG;
}

// SVG Suit symbols
function getSuitSVG(suit, color, size = 24) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';

    switch(suit) {
        case 'hearts':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${fill}"/>
            </svg>`;
        case 'diamonds':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 2L2 12l10 10 10-10L12 2z" fill="${fill}"/>
            </svg>`;
        case 'clubs':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <circle cx="12" cy="8" r="4" fill="${fill}"/>
                <circle cx="7" cy="12" r="3" fill="${fill}"/>
                <circle cx="17" cy="12" r="3" fill="${fill}"/>
                <path d="M10 12 L14 12 L12 20 Z" fill="${fill}"/>
            </svg>`;
        case 'spades':
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display: block;">
                <path d="M12 3L8 9L12 15L16 9L12 3M12 15L9 21L12 18L15 21L12 15Z" fill="${fill}"/>
            </svg>`;
        default:
            return '';
    }
}

// Get proper pip pattern for number cards (2-10)
function getPipPattern(rank, suit, color) {
    const fill = color === 'red' ? '#D32F2F' : '#000000';
    const suitSVG = getSuitSVG(suit, color, 18);

    // Card dimensions and margins
    const cardWidth = 70;
    const cardHeight = 100;
    const margin = 8;
    const pipSize = 14;

    // Calculate usable area
    const usableWidth = cardWidth - 2 * margin;
    const usableHeight = cardHeight - 2 * margin;

    // Center coordinates
    const centerX = cardWidth / 2;
    const centerY = cardHeight / 2;

    // Corner positions for symmetric layouts
    const leftX = margin + pipSize / 2;
    const rightX = cardWidth - margin - pipSize / 2;
    const topY = margin + pipSize / 2;
    const bottomY = cardHeight - margin - pipSize / 2;

    let pattern = '';

    switch(rank) {
        case '2':
            pattern = `
                <g transform="translate(${centerX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 12})">${suitSVG}</g>
            `;
            break;
        case '3':
            pattern = `
                <g transform="translate(${centerX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 18})">${suitSVG}</g>
            `;
            break;
        case '4':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '5':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '6':
            pattern = `
                <g transform="translate(${leftX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 18})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 18})">${suitSVG}</g>
            `;
            break;
        case '7':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 8})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 8})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 8})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '8':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 12})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
        case '9':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 15})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 15})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 2})">${suitSVG}</g>
            `;
            break;
        case '10':
            pattern = `
                <g transform="translate(${leftX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${topY})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY - 18})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY - 6})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY - 6})">${suitSVG}</g>
                <g transform="translate(${centerX}, ${centerY + 6})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${centerY + 18})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${centerY + 18})">${suitSVG}</g>
                <g transform="translate(${leftX}, ${bottomY})">${suitSVG}</g>
                <g transform="translate(${rightX}, ${bottomY})">${suitSVG}</g>
            `;
            break;
    }

    return `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" style="display: block;">
        ${pattern}
    </svg>`;
}

function createCardElement(card, pileType, pileIndex) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    const color = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';
    cardEl.classList.add(color);

    const suitColorValue = color === 'red' ? '#D32F2F' : '#000000';
    const rankDisplay = card.rank;
    const isFaceCard = ['A', 'K', 'Q', 'J'].includes(card.rank);

    cardEl.innerHTML = `
        <div class="card-corner card-corner-top">
            <div class="card-rank-top">${rankDisplay}</div>
            <div class="card-suit-top">${getSuitSVG(card.suit, color, 12)}</div>
        </div>
        <div class="card-center">
            ${isFaceCard ?
                `<div class="card-face">${getFaceCardSVG(card.rank, card.suit, color)}</div>` :
                `<div class="card-pips">${getPipPattern(card.rank, card.suit, color)}</div>`
            }
        </div>
        <div class="card-corner card-corner-bottom">
            <div class="card-rank-bottom">${rankDisplay}</div>
            <div class="card-suit-bottom">${getSuitSVG(card.suit, color, 12)}</div>
        </div>
    `;

    cardEl.onclick = () => {
        if (selectedCard && selectedPile) {
            moveCard();
        } else {
            selectCard(card, pileType, pileIndex);
        }
    };

    return cardEl;
}

function newGame() {
    stopAiAutoplay();
    // Show deal setup again
    document.getElementById('dealSetup').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('status').textContent = 'Enter a deal number and click Start Game';
}

function hint() {
    alert('Hint: Use freecells strategically to move sequences. Build foundation piles from Aces up. Build tableau sequences alternating colors, descending ranks.');
}

// Initialize on load
window.addEventListener('load', () => {
    initGame();
});

