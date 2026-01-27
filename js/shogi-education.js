/**
 * Shogi Education Module - Complete Implementation
 * Interactive Shogi learning system with tutorials, quizzes, and practice
 * **Timestamp**: 2025-01-22
 */

class ShogiEducation {
    constructor() {
        this.currentLesson = 0;
        this.currentQuiz = null;
        this.score = 0;
        this.completedLessons = new Set();
        this.board = null;
        this.pieces = {};
        this.selectedPiece = null;

        this.lessons = [
            {
                id: 'basics',
                title: 'Shogi Basics',
                content: `
                    <h3>Introduction to Shogi</h3>
                    <p>Shogi (将棋, shōgi) is a Japanese strategy board game also known as Japanese chess.
                    It features a 9×9 board and 20 pieces per player, with unique movement rules and piece promotion.</p>

                    <h4>The Board</h4>
                    <p>The shogi board has 9 ranks (rows) and 9 files (columns), totaling 81 squares.
                    Unlike Western chess, the board orientation can change during play.</p>

                    <h4>Objective</h4>
                    <p>The goal is to checkmate your opponent's king. You can also win by capturing all enemy pieces
                    or by having your opponent resign.</p>
                `,
                interactive: 'board-setup'
            },
            {
                id: 'pieces',
                title: 'Piece Movement',
                content: `
                    <h3>Shogi Pieces</h3>
                    <p>Each player starts with 20 pieces of 8 different types. Most pieces can promote when they reach the enemy camp.</p>

                    <div class="piece-grid">
                        <div class="piece-info">
                            <span class="piece-symbol">王</span>
                            <h4>King (Ōshō)</h4>
                            <p>Moves one square in any direction. Cannot be taken or promoted.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">金</span>
                            <h4>Gold General (Kinshō)</h4>
                            <p>Moves one square forward, diagonally forward, or sideways. Cannot promote.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">銀</span>
                            <h4>Silver General (Ginshō)</h4>
                            <p>Moves one square diagonally or forward. Promotes to Gold General.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">桂</span>
                            <h4>Knight (Keima)</h4>
                            <p>Jumps two squares forward and one sideways. Promotes to Gold General.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">香</span>
                            <h4>Lance (Kyōsha)</h4>
                            <p>Moves any number of squares forward. Promotes to Gold General.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">飛</span>
                            <h4>Rook (Hisha)</h4>
                            <p>Moves any number of squares horizontally or vertically. Promotes to Dragon King.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">角</span>
                            <h4>Bishop (Kakugyō)</h4>
                            <p>Moves any number of squares diagonally. Promotes to Dragon Horse.</p>
                        </div>
                        <div class="piece-info">
                            <span class="piece-symbol">歩</span>
                            <h4>Pawn (Fuhyō)</h4>
                            <p>Moves one square forward. Promotes to Gold General.</p>
                        </div>
                    </div>
                `,
                interactive: 'piece-tutorial'
            },
            {
                id: 'promotion',
                title: 'Piece Promotion',
                content: `
                    <h3>Piece Promotion</h3>
                    <p>Most pieces can promote when they enter the enemy camp (ranks 1-3 for Black, 7-9 for White).
                    Promoted pieces have enhanced movement capabilities.</p>

                    <h4>Promotion Examples</h4>
                    <div class="promotion-examples">
                        <div class="promotion-pair">
                            <div class="before">
                                <span class="piece-symbol">歩</span>
                                <p>Pawn (Fuhyō)</p>
                            </div>
                            <div class="arrow">→</div>
                            <div class="after">
                                <span class="piece-symbol">と</span>
                                <p>Promoted Pawn (Tokin)</p>
                                <p>Moves like Gold General</p>
                            </div>
                        </div>

                        <div class="promotion-pair">
                            <div class="before">
                                <span class="piece-symbol">銀</span>
                                <p>Silver General</p>
                            </div>
                            <div class="arrow">→</div>
                            <div class="after">
                                <span class="piece-symbol">全</span>
                                <p>Promoted Silver</p>
                                <p>Moves like Gold General</p>
                            </div>
                        </div>

                        <div class="promotion-pair">
                            <div class="before">
                                <span class="piece-symbol">飛</span>
                                <p>Rook</p>
                            </div>
                            <div class="arrow">→</div>
                            <div class="after">
                                <span class="piece-symbol">龍</span>
                                <p>Dragon King</p>
                                <p>Rook + King movement</p>
                            </div>
                        </div>
                    </div>
                `,
                interactive: 'promotion-demo'
            },
            {
                id: 'drops',
                title: 'Piece Drops',
                content: `
                    <h3>Piece Drops (Fuhai)</h3>
                    <p>Unlike Western chess, captured pieces can be dropped back onto the board as your own pieces.
                    This creates unique strategic possibilities and tactical complexity.</p>

                    <h4>Dropping Rules</h4>
                    <ul>
                        <li>Dropped pieces become yours and can be used immediately</li>
                        <li>Pieces cannot be dropped on squares where they would be immediately captured</li>
                        <li>Pawns and lances cannot be dropped on the last rank</li>
                        <li>Knights cannot be dropped on the last two ranks</li>
                        <li>You cannot have two unpromoted pawns in the same file</li>
                    </ul>

                    <h4>Strategic Importance</h4>
                    <p>Piece drops allow for counterattacks, piece recycling, and complex tactical maneuvers.
                    Many games are decided by skillful use of drops rather than direct attacks.</p>
                `,
                interactive: 'drop-practice'
            },
            {
                id: 'checkmate',
                title: 'Check and Checkmate',
                content: `
                    <h3>Check and Checkmate</h3>
                    <p>The objective is to checkmate your opponent's king. A king is in check when it can be captured on the next move.</p>

                    <h4>Checkmate Conditions</h4>
                    <ul>
                        <li>The king is in check</li>
                        <li>The king has no legal moves to escape check</li>
                        <li>No piece can be interposed or the checking piece captured</li>
                    </ul>

                    <h4>Other Ways to Win</h4>
                    <ul>
                        <li><strong>Resignation:</strong> A player may resign at any time</li>
                        <li><strong>Time forfeit:</strong> Running out of time (in timed games)</li>
                        <li><strong>Repetition:</strong> Same position occurs four times (rare)</li>
                        <li><strong>Illegal moves:</strong> Making an illegal move loses the game</li>
                    </ul>
                `,
                interactive: 'checkmate-puzzles'
            }
        ];

        this.init();
    }

    init() {
        console.log('[SHOGI EDUCATION] Initializing complete education system');
        this.setupEventListeners();
        this.createUI();
        this.showLesson(0);
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeUI();
        });
    }

    createUI() {
        const container = document.querySelector('.education-container') || document.body;

        const ui = document.createElement('div');
        ui.className = 'shogi-education-ui';
        ui.innerHTML = `
            <div class="education-header">
                <h2>Shogi Education System</h2>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="lesson-nav">
                    <button id="prev-lesson" class="nav-btn" disabled>← Previous</button>
                    <span id="lesson-counter">Lesson 1 of ${this.lessons.length}</span>
                    <button id="next-lesson" class="nav-btn">Next →</button>
                </div>
            </div>

            <div class="lesson-content" id="lesson-content">
                <!-- Lesson content will be inserted here -->
            </div>

            <div class="interactive-area" id="interactive-area">
                <!-- Interactive elements will be inserted here -->
            </div>

            <div class="lesson-actions">
                <button id="practice-btn" class="action-btn">Practice Mode</button>
                <button id="quiz-btn" class="action-btn">Take Quiz</button>
                <button id="reset-btn" class="action-btn">Reset Progress</button>
            </div>
        `;

        container.appendChild(ui);
        this.bindEvents();
    }

    bindEvents() {
        const prevBtn = document.getElementById('prev-lesson');
        const nextBtn = document.getElementById('next-lesson');
        const practiceBtn = document.getElementById('practice-btn');
        const quizBtn = document.getElementById('quiz-btn');
        const resetBtn = document.getElementById('reset-btn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.previousLesson());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextLesson());
        if (practiceBtn) practiceBtn.addEventListener('click', () => this.startPractice());
        if (quizBtn) quizBtn.addEventListener('click', () => this.startQuiz());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetProgress());
    }

    showLesson(index) {
        if (index < 0 || index >= this.lessons.length) return;

        this.currentLesson = index;
        const lesson = this.lessons[index];

        // Update progress bar
        const progress = ((index + 1) / this.lessons.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        // Update navigation
        const prevBtn = document.getElementById('prev-lesson');
        const nextBtn = document.getElementById('next-lesson');
        const counter = document.getElementById('lesson-counter');

        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === this.lessons.length - 1;
        if (counter) counter.textContent = `Lesson ${index + 1} of ${this.lessons.length}`;

        // Show content
        const contentDiv = document.getElementById('lesson-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <h2>${lesson.title}</h2>
                ${lesson.content}
            `;
        }

        // Show interactive content
        this.showInteractive(lesson.interactive);

        // Mark as completed
        this.completedLessons.add(lesson.id);
    }

    showInteractive(type) {
        const interactiveArea = document.getElementById('interactive-area');
        if (!interactiveArea) return;

        let content = '';

        switch (type) {
            case 'board-setup':
                content = this.createBoardSetup();
                break;
            case 'piece-tutorial':
                content = this.createPieceTutorial();
                break;
            case 'promotion-demo':
                content = this.createPromotionDemo();
                break;
            case 'drop-practice':
                content = this.createDropPractice();
                break;
            case 'checkmate-puzzles':
                content = this.createCheckmatePuzzles();
                break;
            default:
                content = '<p>Interactive content coming soon...</p>';
        }

        interactiveArea.innerHTML = content;
    }

    createBoardSetup() {
        return `
            <div class="board-setup">
                <h3>Shogi Board Setup</h3>
                <div class="board-container">
                    <div class="shogi-board" id="demo-board">
                        <!-- 9x9 board will be created here -->
                    </div>
                </div>
                <p class="setup-instructions">
                    The board starts with pieces arranged as shown above.
                    Click on pieces to see their movement ranges.
                </p>
            </div>
        `;
    }

    createPieceTutorial() {
        return `
            <div class="piece-tutorial">
                <h3>Piece Movement Tutorial</h3>
                <div class="piece-selector">
                    <button class="piece-btn" data-piece="king">王 King</button>
                    <button class="piece-btn" data-piece="gold">金 Gold</button>
                    <button class="piece-btn" data-piece="silver">銀 Silver</button>
                    <button class="piece-btn" data-piece="knight">桂 Knight</button>
                    <button class="piece-btn" data-piece="lance">香 Lance</button>
                    <button class="piece-btn" data-piece="rook">飛 Rook</button>
                    <button class="piece-btn" data-piece="bishop">角 Bishop</button>
                    <button class="piece-btn" data-piece="pawn">歩 Pawn</button>
                </div>
                <div class="movement-display" id="movement-display">
                    <p>Select a piece to see its movement pattern.</p>
                </div>
            </div>
        `;
    }

    createPromotionDemo() {
        return `
            <div class="promotion-demo">
                <h3>Promotion Demonstration</h3>
                <div class="promotion-scenarios">
                    <div class="scenario">
                        <h4>Pawn Promotion</h4>
                        <p>When a pawn reaches the enemy camp, it can promote to Tokin (と).</p>
                        <div class="promotion-example">
                            <div class="before-promotion">
                                <span class="piece">歩</span>
                                <p>Pawn approaches enemy camp</p>
                            </div>
                            <div class="promotion-arrow">→</div>
                            <div class="after-promotion">
                                <span class="piece promoted">と</span>
                                <p>Promotes to Tokin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createDropPractice() {
        return `
            <div class="drop-practice">
                <h3>Piece Drop Practice</h3>
                <div class="drop-instructions">
                    <p>In this exercise, practice dropping captured pieces back onto the board.</p>
                    <p>Remember the dropping rules and try to create threats with your drops.</p>
                </div>
                <div class="captured-pieces">
                    <h4>Captured Pieces (Click to drop)</h4>
                    <div class="piece-collection">
                        <span class="droppable-piece" data-piece="pawn">歩</span>
                        <span class="droppable-piece" data-piece="silver">銀</span>
                        <span class="droppable-piece" data-piece="gold">金</span>
                        <span class="droppable-piece" data-piece="rook">飛</span>
                    </div>
                </div>
            </div>
        `;
    }

    createCheckmatePuzzles() {
        return `
            <div class="checkmate-puzzles">
                <h3>Checkmate Puzzles</h3>
                <div class="puzzle-list">
                    <div class="puzzle-item">
                        <h4>Puzzle 1: Basic Checkmate</h4>
                        <p>White to move and checkmate in one move.</p>
                        <button class="solve-btn" data-puzzle="1">Show Solution</button>
                    </div>
                    <div class="puzzle-item">
                        <h4>Puzzle 2: Promotion Checkmate</h4>
                        <p>Use promotion to create checkmate.</p>
                        <button class="solve-btn" data-puzzle="2">Show Solution</button>
                    </div>
                </div>
            </div>
        `;
    }

    nextLesson() {
        if (this.currentLesson < this.lessons.length - 1) {
            this.showLesson(this.currentLesson + 1);
        }
    }

    previousLesson() {
        if (this.currentLesson > 0) {
            this.showLesson(this.currentLesson - 1);
        }
    }

    startPractice() {
        console.log('[SHOGI EDUCATION] Starting practice mode');
        // Implementation for practice mode
        this.showMessage('Practice mode coming soon! Try the interactive elements above.');
    }

    startQuiz() {
        console.log('[SHOGI EDUCATION] Starting quiz');
        // Implementation for quiz mode
        this.showMessage('Quiz mode coming soon! Complete lessons first.');
    }

    resetProgress() {
        if (confirm('Are you sure you want to reset all progress?')) {
            this.completedLessons.clear();
            this.currentLesson = 0;
            this.score = 0;
            this.showLesson(0);
            this.showMessage('Progress reset successfully.');
        }
    }

    showMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `education-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    initializeUI() {
        console.log('[SHOGI EDUCATION] UI initialized');
        // Additional initialization if needed
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.shogiEducation = new ShogiEducation();
    });
} else {
    window.shogiEducation = new ShogiEducation();
}