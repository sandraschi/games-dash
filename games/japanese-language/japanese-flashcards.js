// Japanese Flashcards Game Logic
// Implements spaced repetition system for vocabulary learning

class JapaneseFlashcards {
    constructor() {
        this.vocabulary = [];
        this.currentCard = null;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.difficulty = 'all';
        this.jlptLevel = 'all';
        this.stats = {
            studied: 0,
            correct: 0,
            totalAttempts: 0,
            streak: 0,
            sessionStart: Date.now()
        };

        // Spaced repetition intervals (in days)
        this.intervals = {
            again: 1,      // Review again tomorrow
            hard: 3,       // Review in 3 days
            good: 7,       // Review in a week
            easy: 21       // Review in 3 weeks
        };

        this.init();
    }

    async init() {
        try {
            await this.loadVocabulary();
            this.setupEventListeners();
            this.updateUI();
            this.showNextCard();
        } catch (error) {
            console.error('Failed to initialize flashcards:', error);
            this.showStatus('Error loading vocabulary. Please check your connection.');
        }
    }

    async loadVocabulary() {
        try {
            // Load vocabulary from API (generates hundreds of cards from kanji database)
            const response = await fetch(`/api/vocabulary?jlpt=${this.jlptLevel}&limit=200`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.vocabulary) {
                    this.vocabulary = data.vocabulary.map(card => ({
                        japanese: card.japanese,
                        reading: card.reading,
                        meaning: card.meaning,
                        jlpt_level: card.jlpt_level,
                        difficulty: card.difficulty,
                        part_of_speech: card.part_of_speech,
                        examples: card.examples || [],
                        kanji_breakdown: card.kanji_breakdown || [],
                        source: card.source || 'api'
                    }));
                    this.showStatus(`Loaded ${this.vocabulary.length} vocabulary cards from database`);
                } else {
                    throw new Error('Invalid API response');
                }
            } else {
                throw new Error(`API returned ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load vocabulary from API:', error);
            // Fallback to sample vocabulary
            this.vocabulary = this.getSampleVocabulary();
            this.showStatus('Using sample vocabulary (API unavailable)');
        }
    }

    getSampleVocabulary() {
        return [
            {
                japanese: 'こんにちは',
                reading: 'konnichiwa',
                meaning: 'hello',
                jlpt_level: 'N5',
                difficulty: 'beginner',
                examples: ['こんにちは、お元気ですか？ - Hello, how are you?']
            },
            {
                japanese: 'ありがとう',
                reading: 'arigatou',
                meaning: 'thank you',
                jlpt_level: 'N5',
                difficulty: 'beginner',
                examples: ['ありがとうございます - Thank you very much']
            },
            {
                japanese: 'すみません',
                reading: 'sumimasen',
                meaning: 'excuse me / sorry',
                jlpt_level: 'N5',
                difficulty: 'beginner',
                examples: ['すみません、お手洗所はどこですか？ - Excuse me, where is the bathroom?']
            },
            {
                japanese: '分かりません',
                reading: 'wakarimasen',
                meaning: 'I don\'t understand',
                jlpt_level: 'N5',
                difficulty: 'beginner',
                examples: ['すみません、わかりません - Sorry, I don\'t understand']
            },
            {
                japanese: '勉強',
                reading: 'benkyou',
                meaning: 'study',
                jlpt_level: 'N5',
                difficulty: 'intermediate',
                examples: ['日本語を勉強しています - I\'m studying Japanese']
            },
            {
                japanese: '友達',
                reading: 'tomodachi',
                meaning: 'friend',
                jlpt_level: 'N5',
                difficulty: 'beginner',
                examples: ['私の友達 - My friend']
            }
        ];
    }

    setupEventListeners() {
        // Card flipping
        document.getElementById('currentCard').addEventListener('click', () => this.flipCard());
        document.getElementById('currentCardBack').addEventListener('click', () => this.flipCard());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.flipCard();
                    break;
                case '1':
                    e.preventDefault();
                    this.markIncorrect();
                    break;
                case '2':
                    e.preventDefault();
                    this.markCorrect();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.markIncorrect();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.markCorrect();
                    break;
            }
        });
    }

    filterCards() {
        let filtered = this.vocabulary;

        // Filter by difficulty
        if (this.difficulty !== 'all') {
            filtered = filtered.filter(card => card.difficulty === this.difficulty);
        }

        // Filter by JLPT level
        if (this.jlptLevel !== 'all') {
            filtered = filtered.filter(card => card.jlpt_level === this.jlptLevel);
        }

        return filtered;
    }

    showNextCard() {
        const filteredCards = this.filterCards();

        if (filteredCards.length === 0) {
            this.showStatus('No cards match your current filters');
            return;
        }

        // Simple spaced repetition: show cards that haven't been studied recently
        // In a full implementation, this would use actual spaced repetition algorithm
        const availableCards = filteredCards.filter(card =>
            !card.lastReviewed || Date.now() - card.lastReviewed > 24 * 60 * 60 * 1000
        );

        if (availableCards.length === 0) {
            this.showStatus('All cards reviewed for today! Great job! 🎉');
            return;
        }

        // For now, just pick a random card (simplified spaced repetition)
        this.currentCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        this.isFlipped = false;

        this.updateCardDisplay();
        this.updateUI();
    }

    updateCardDisplay() {
        if (!this.currentCard) return;

        const frontCard = document.getElementById('currentCard');
        const backCard = document.getElementById('currentCardBack');

        // Front of card (Japanese)
        document.getElementById('cardContent').innerHTML = `
            <div class="flashcard-content">${this.currentCard.japanese}</div>
            <div class="flashcard-hint" style="font-size: 14px; opacity: 0.7; margin-top: 10px;">
                ${this.currentCard.jlpt_level ? `JLPT ${this.currentCard.jlpt_level}` : ''}
                ${this.currentCard.part_of_speech ? ` • ${this.currentCard.part_of_speech}` : ''}
            </div>
        `;

        // Back of card (All details)
        document.getElementById('cardBackContent').innerHTML = `
            <div class="flashcard-reading" style="font-size: 24px; color: #FFD700; margin: 10px 0;">
                ${this.currentCard.reading ? this.currentCard.reading : ''}
            </div>
            <div class="flashcard-meaning" style="font-size: 28px; margin: 15px 0; font-weight: bold;">
                ${this.currentCard.meaning ? this.currentCard.meaning : ''}
            </div>
            <div class="flashcard-details" style="font-size: 16px; margin: 15px 0; opacity: 0.9;">
                ${this.currentCard.jlpt_level ? `<div><strong>JLPT Level:</strong> ${this.currentCard.jlpt_level}</div>` : ''}
                ${this.currentCard.part_of_speech ? `<div><strong>Type:</strong> ${this.currentCard.part_of_speech}</div>` : ''}
                ${this.currentCard.kanji_breakdown && this.currentCard.kanji_breakdown.length > 0 ?
                    `<div><strong>Kanji:</strong> ${this.currentCard.kanji_breakdown.join(' + ')}</div>` : ''}
            </div>
            ${this.currentCard.examples && this.currentCard.examples.length > 0 ?
                `<div class="flashcard-examples" style="font-size: 14px; margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                    <strong>Examples:</strong><br>
                    ${this.currentCard.examples.map(ex => `• ${ex}`).join('<br>')}
                </div>` : ''}
        `;

        // Reset flip state
        frontCard.classList.remove('flipped');
        backCard.classList.remove('flipped');
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        const frontCard = document.getElementById('currentCard');
        const backCard = document.getElementById('currentCardBack');

        if (this.isFlipped) {
            frontCard.classList.add('flipped');
            backCard.classList.add('flipped');
        } else {
            frontCard.classList.remove('flipped');
            backCard.classList.remove('flipped');
        }
    }

    markCorrect() {
        if (!this.currentCard) return;

        this.stats.correct++;
        this.stats.totalAttempts++;
        this.stats.streak++;
        this.stats.studied++;

        // Mark as reviewed
        this.currentCard.lastReviewed = Date.now();
        this.currentCard.nextReview = Date.now() + (this.intervals.good * 24 * 60 * 60 * 1000);

        this.showNextCard();
        this.updateUI();
        this.showFeedback(true);
    }

    markIncorrect() {
        if (!this.currentCard) return;

        this.stats.totalAttempts++;
        this.stats.streak = 0;
        this.stats.studied++;

        // Mark for review sooner
        this.currentCard.lastReviewed = Date.now();
        this.currentCard.nextReview = Date.now() + (this.intervals.again * 24 * 60 * 60 * 1000);

        this.showNextCard();
        this.updateUI();
        this.showFeedback(false);
    }

    showFeedback(correct) {
        const status = document.getElementById('status');
        status.textContent = correct ? '✓ Correct! Keep it up!' : '✗ Study this one more';
        status.style.color = correct ? '#4CAF50' : '#f44336';

        setTimeout(() => {
            this.updateStatus();
        }, 2000);
    }

    updateUI() {
        // Update statistics
        document.getElementById('cardsStudied').textContent = this.stats.studied;
        document.getElementById('correctCount').textContent = this.stats.correct;
        document.getElementById('streak').textContent = this.stats.streak;

        const accuracy = this.stats.totalAttempts > 0 ?
            Math.round((this.stats.correct / this.stats.totalAttempts) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';

        // Update progress bar
        const filteredCards = this.filterCards();
        const progress = filteredCards.length > 0 ?
            Math.min((this.stats.studied / Math.max(filteredCards.length, 10)) * 100, 100) : 0;
        document.getElementById('progressFill').style.width = progress + '%';

        // Update stack indicator
        const remainingCards = this.filterCards().filter(card =>
            !card.lastReviewed || Date.now() - card.lastReviewed > 24 * 60 * 60 * 1000
        ).length;
        document.getElementById('stackIndicator').textContent =
            `${remainingCards} cards remaining`;

        // Update next review time
        this.updateNextReview();
    }

    updateNextReview() {
        const nextReviewTime = this.vocabulary
            .filter(card => card.nextReview)
            .map(card => card.nextReview)
            .sort((a, b) => a - b)[0];

        const nextReviewEl = document.getElementById('nextReview');
        if (nextReviewTime) {
            const timeUntil = nextReviewTime - Date.now();
            if (timeUntil > 0) {
                const hours = Math.floor(timeUntil / (1000 * 60 * 60));
                const days = Math.floor(hours / 24);
                if (days > 0) {
                    nextReviewEl.textContent = `Next review: ${days} day${days > 1 ? 's' : ''}`;
                } else {
                    nextReviewEl.textContent = `Next review: ${hours} hour${hours > 1 ? 's' : ''}`;
                }
            } else {
                nextReviewEl.textContent = 'Cards ready for review!';
            }
        } else {
            nextReviewEl.textContent = 'Start studying to see next review time';
        }
    }

    updateStatus() {
        const filteredCards = this.filterCards();
        const remainingCards = filteredCards.filter(card =>
            !card.lastReviewed || Date.now() - card.lastReviewed > 24 * 60 * 60 * 1000
        ).length;

        let statusText = `${filteredCards.length} cards available`;
        if (remainingCards < filteredCards.length) {
            statusText += ` • ${remainingCards} ready for review`;
        }

        document.getElementById('status').textContent = statusText;
        document.getElementById('status').style.color = '';
    }

    showStatistics() {
        const accuracy = this.stats.totalAttempts > 0 ?
            Math.round((this.stats.correct / this.stats.totalAttempts) * 100) : 0;

        const sessionTime = Math.floor((Date.now() - this.stats.sessionStart) / 1000 / 60);

        alert(`📊 Flashcard Statistics

Cards Studied: ${this.stats.studied}
Correct Answers: ${this.stats.correct}
Total Attempts: ${this.stats.totalAttempts}
Accuracy: ${accuracy}%
Current Streak: ${this.stats.streak}
Session Time: ${sessionTime} minutes

Keep studying! 頑張って！`);
    }

    resetProgress() {
        if (confirm('Reset all progress? This will clear your study statistics and review schedule.')) {
            this.vocabulary.forEach(card => {
                delete card.lastReviewed;
                delete card.nextReview;
            });

            this.stats = {
                studied: 0,
                correct: 0,
                totalAttempts: 0,
                streak: 0,
                sessionStart: Date.now()
            };

            this.updateUI();
            this.showNextCard();
            this.showStatus('Progress reset. Ready to start studying!');
        }
    }

    shuffleCards() {
        // Shuffle the vocabulary array
        for (let i = this.vocabulary.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.vocabulary[i], this.vocabulary[j]] = [this.vocabulary[j], this.vocabulary[i]];
        }

        this.showNextCard();
        this.showStatus('Cards shuffled! 🎲');
    }

    loadNewCards() {
        // Reset session stats but keep long-term progress
        this.stats.studied = 0;
        this.stats.correct = 0;
        this.stats.totalAttempts = 0;
        this.stats.streak = 0;
        this.stats.sessionStart = Date.now();

        this.showNextCard();
        this.updateUI();
        this.showStatus('New study session started!');
    }

    showStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Global functions for HTML buttons
function setDifficulty(difficulty, btn) {
    flashcards.difficulty = difficulty;
    document.querySelectorAll('.difficulty-button').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    // For now, just show current cards with new difficulty filter
    // (API filtering is primarily by JLPT level)
    flashcards.showNextCard();
    flashcards.updateStatus();
}

function setJLPTLevel(level, btn) {
    flashcards.jlptLevel = level;
    document.querySelectorAll('.jlpt-button').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');

    // Reload vocabulary with new JLPT filter
    flashcards.loadVocabulary().then(() => {
        flashcards.showNextCard();
        flashcards.updateStatus();
    });
}

function flipCard() {
    flashcards.flipCard();
}

function markCorrect() {
    flashcards.markCorrect();
}

function markIncorrect() {
    flashcards.markIncorrect();
}

function loadNewCards() {
    flashcards.loadNewCards();
}

function shuffleCards() {
    flashcards.shuffleCards();
}

function showStatistics() {
    flashcards.showStatistics();
}

function resetProgress() {
    flashcards.resetProgress();
}

// Initialize when page loads
const flashcards = new JapaneseFlashcards();





