// Japanese Listening Practice Game Logic
// Uses Web Speech API for text-to-speech functionality

class JapaneseListening {
    constructor() {
        this.phrases = [];
        this.currentPhrase = null;
        this.currentIndex = 0;
        this.difficulty = 'beginner';
        this.jlptLevel = 'all';
        this.voice = 'female';
        this.speed = 1.0;
        this.inputMode = false;
        this.isPlaying = false;

        // Statistics
        this.stats = {
            heard: 0,
            correct: 0,
            totalAttempts: 0,
            streak: 0
        };

        // Speech synthesis
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;

        this.init();
    }

    async init() {
        this.checkSpeechSupport();
        this.loadPhrases();
        this.setupEventListeners();
        this.updateUI();
        this.showNextPhrase();
    }

    checkSpeechSupport() {
        if (!('speechSynthesis' in window)) {
            this.showStatus('⚠️ Speech synthesis not supported in this browser');
            return;
        }
        this.showStatus('Ready to practice listening!');
    }

    loadPhrases() {
        // Sample phrases for different difficulty levels
        this.phrases = [
            // Beginner phrases
            {
                japanese: 'こんにちは',
                romaji: 'konnichiwa',
                english: 'Hello',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['koh-n-nee-chee-wah']
            },
            {
                japanese: 'ありがとう',
                romaji: 'arigatou',
                english: 'Thank you',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['ah-ree-gah-toh']
            },
            {
                japanese: 'すみません',
                romaji: 'sumimasen',
                english: 'Excuse me',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['sue-mee-mah-sehn']
            },
            {
                japanese: 'はい',
                romaji: 'hai',
                english: 'Yes',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['hah-ee']
            },
            {
                japanese: 'いいえ',
                romaji: 'iie',
                english: 'No',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['ee-eh']
            },
            {
                japanese: 'おはようございます',
                romaji: 'ohayou gozaimasu',
                english: 'Good morning',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['oh-hah-yoh goh-zah-ee-mahs']
            },
            {
                japanese: 'こんばんは',
                romaji: 'konbanwa',
                english: 'Good evening',
                difficulty: 'beginner',
                jlpt_level: 'N5',
                audioHints: ['kohn-bahn-wah']
            },
            // Intermediate phrases
            {
                japanese: 'わかりました',
                romaji: 'wakarimashita',
                english: 'I understand',
                difficulty: 'intermediate',
                jlpt_level: 'N4',
                audioHints: ['wah-kah-ree-mah-shee-tah']
            },
            {
                japanese: 'お願いします',
                romaji: 'onegaishimasu',
                english: 'Please',
                difficulty: 'intermediate',
                jlpt_level: 'N4',
                audioHints: ['oh-neh-gah-ee-shee-mahs']
            },
            {
                japanese: 'すみませんが',
                romaji: 'sumimasen ga',
                english: 'Excuse me, but...',
                difficulty: 'intermediate',
                jlpt_level: 'N3',
                audioHints: ['sue-mee-mah-sehn gah']
            },
            {
                japanese: 'いらっしゃいませ',
                romaji: 'irasshaimase',
                english: 'Welcome (to a store)',
                difficulty: 'intermediate',
                jlpt_level: 'N3',
                audioHints: ['ee-rah-shah-ee-mah-seh']
            },
            {
                japanese: 'お疲れ様です',
                romaji: 'otsukaresama desu',
                english: 'Good work / Thank you for your hard work',
                difficulty: 'intermediate',
                jlpt_level: 'N3',
                audioHints: ['oh-tsoo-kah-reh-sah-mah deh-sue']
            },
            // Advanced phrases
            {
                japanese: 'お世話になっております',
                romaji: 'osewa ni natte orimasu',
                english: 'Thank you for your continued support',
                difficulty: 'advanced',
                jlpt_level: 'N2',
                audioHints: ['oh-seh-wah nee naht-teh oh-ree-mahs']
            },
            {
                japanese: 'ご迷惑をおかけします',
                romaji: 'gomeiwaku o okake shimasu',
                english: 'I\'m sorry to bother you',
                difficulty: 'advanced',
                jlpt_level: 'N2',
                audioHints: ['goh-meh-wah-koo oh oh-kah-keh shee-mahs']
            },
            {
                japanese: 'お時間をいただいてもよろしいでしょうか',
                romaji: 'ojikan o itadaite mo yoroshii deshou ka',
                english: 'May I take some of your time?',
                difficulty: 'advanced',
                jlpt_level: 'N1',
                audioHints: ['oh-jee-kahn oh ee-tah-dah-ee-teh moh yoh-roh-shee deh-shoh kah']
            }
        ];
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    if (!this.inputMode) {
                        this.playAudio();
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.inputMode) {
                        this.checkAnswer();
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextPhrase();
                    break;
                case 's':
                    e.preventDefault();
                    this.playSlow();
                    break;
            }
        });

        // Input field handling
        const inputField = document.getElementById('listeningInput');
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
    }

    filterPhrases() {
        let filtered = this.phrases;

        // Filter by difficulty
        if (this.difficulty !== 'all') {
            filtered = filtered.filter(phrase => phrase.difficulty === this.difficulty);
        }

        // Filter by JLPT level
        if (this.jlptLevel !== 'all') {
            filtered = filtered.filter(phrase => phrase.jlpt_level === this.jlptLevel);
        }

        return filtered;
    }

    showNextPhrase() {
        const filteredPhrases = this.filterPhrases();

        if (filteredPhrases.length === 0) {
            this.showStatus('No phrases match your current filters');
            return;
        }

        // Pick a random phrase
        this.currentPhrase = filteredPhrases[Math.floor(Math.random() * filteredPhrases.length)];

        this.updatePhraseDisplay();
        this.updateUI();
        this.hideFeedback();
    }

    updatePhraseDisplay() {
        if (!this.currentPhrase) return;

        document.getElementById('japaneseText').textContent = this.inputMode ? '???' : this.currentPhrase.japanese;
        document.getElementById('romajiText').textContent = this.inputMode ? '???' : this.currentPhrase.romaji;
        document.getElementById('translationText').textContent = this.currentPhrase.english;
    }

    playAudio() {
        if (!this.currentPhrase || !this.synth) return;

        // Stop any current speech
        this.stopAudio();

        this.currentUtterance = new SpeechSynthesisUtterance(this.currentPhrase.japanese);

        // Set voice preferences
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(voice => {
            const isJapanese = voice.lang.includes('ja') || voice.lang.includes('JP');
            const isFemale = this.voice === 'female' ?
                voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') :
                voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man');

            return isJapanese && isFemale;
        });

        if (preferredVoice) {
            this.currentUtterance.voice = preferredVoice;
        } else {
            // Fallback to any Japanese voice
            const japaneseVoice = voices.find(voice => voice.lang.includes('ja') || voice.lang.includes('JP'));
            if (japaneseVoice) {
                this.currentUtterance.voice = japaneseVoice;
            }
        }

        // Set speech properties
        this.currentUtterance.rate = this.speed;
        this.currentUtterance.pitch = this.voice === 'female' ? 1.2 : 0.9;
        this.currentUtterance.volume = 0.8;

        // Add event listeners
        this.currentUtterance.onstart = () => {
            this.isPlaying = true;
            this.updatePlayButton(true);
            this.startProgressBar();
        };

        this.currentUtterance.onend = () => {
            this.isPlaying = false;
            this.updatePlayButton(false);
            this.stopProgressBar();
            this.stats.heard++;
            this.updateUI();
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isPlaying = false;
            this.updatePlayButton(false);
            this.stopProgressBar();
            this.showStatus('Speech synthesis failed. Try a different browser.');
        };

        // Speak
        this.synth.speak(this.currentUtterance);
    }

    playSlow() {
        if (!this.currentPhrase || !this.synth) return;

        // Stop any current speech
        this.stopAudio();

        this.currentUtterance = new SpeechSynthesisUtterance(this.currentPhrase.japanese);
        this.currentUtterance.rate = Math.max(0.3, this.speed * 0.5); // Slower than normal
        this.currentUtterance.pitch = this.voice === 'female' ? 1.3 : 0.8; // Slightly higher pitch for clarity

        // Set voice
        const voices = this.synth.getVoices();
        const japaneseVoice = voices.find(voice => voice.lang.includes('ja') || voice.lang.includes('JP'));
        if (japaneseVoice) {
            this.currentUtterance.voice = japaneseVoice;
        }

        this.currentUtterance.onstart = () => {
            this.isPlaying = true;
            document.getElementById('slowPlayButton').classList.add('playing');
        };

        this.currentUtterance.onend = () => {
            this.isPlaying = false;
            document.getElementById('slowPlayButton').classList.remove('playing');
        };

        this.synth.speak(this.currentUtterance);
    }

    repeatAudio() {
        if (!this.isPlaying) {
            this.playAudio();
        }
    }

    stopAudio() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
        }
        this.isPlaying = false;
        this.updatePlayButton(false);
        this.stopProgressBar();
    }

    updatePlayButton(playing) {
        const button = document.getElementById('playButton');
        if (playing) {
            button.textContent = '🔊 Playing... 再生中';
            button.classList.add('playing');
        } else {
            button.textContent = '🔊 Play 再生';
            button.classList.remove('playing');
        }
    }

    startProgressBar() {
        // Estimate duration based on text length (rough approximation)
        const estimatedDuration = Math.max(2000, this.currentPhrase.japanese.length * 200); // 200ms per character
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = '0%';

        let startTime = Date.now();
        const updateProgress = () => {
            if (!this.isPlaying) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min((elapsed / estimatedDuration) * 100, 100);
            progressBar.style.width = progress + '%';

            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            }
        };

        requestAnimationFrame(updateProgress);
    }

    stopProgressBar() {
        document.getElementById('progressBar').style.width = '0%';
    }

    toggleInputMode() {
        this.inputMode = !this.inputMode;
        const inputSection = document.getElementById('inputSection');
        const button = event.target;

        if (this.inputMode) {
            inputSection.style.display = 'block';
            button.textContent = 'Listening Mode 聴解';
            this.updatePhraseDisplay();
            document.getElementById('listeningInput').focus();
        } else {
            inputSection.style.display = 'none';
            button.textContent = 'Dictation Mode 書き取り';
            this.updatePhraseDisplay();
            this.hideFeedback();
        }
    }

    checkAnswer() {
        if (!this.inputMode || !this.currentPhrase) return;

        const userInput = document.getElementById('listeningInput').value.trim();
        const correctAnswer = this.currentPhrase.japanese;
        const feedback = document.getElementById('feedback');

        this.stats.totalAttempts++;

        // Simple comparison (could be enhanced with more sophisticated checking)
        const isCorrect = userInput === correctAnswer ||
                         this.normalizeJapanese(userInput) === this.normalizeJapanese(correctAnswer);

        if (isCorrect) {
            this.stats.correct++;
            this.stats.streak++;
            feedback.className = 'answer-feedback correct-feedback';
            feedback.innerHTML = `
                <strong>✓ Correct!</strong><br>
                You wrote: ${userInput}<br>
                Answer: ${correctAnswer}
            `;
        } else {
            this.stats.streak = 0;
            feedback.className = 'answer-feedback incorrect-feedback';
            feedback.innerHTML = `
                <strong>✗ Incorrect</strong><br>
                You wrote: ${userInput}<br>
                Correct answer: ${correctAnswer}<br>
                <small>Try listening again and focus on the pronunciation!</small>
            `;
        }

        feedback.style.display = 'block';
        this.updateUI();

        // Clear input for next attempt
        document.getElementById('listeningInput').value = '';
    }

    normalizeJapanese(text) {
        // Simple normalization - could be enhanced
        return text.replace(/\s+/g, '').toLowerCase();
    }

    hideFeedback() {
        document.getElementById('feedback').style.display = 'none';
    }

    updateUI() {
        // Update statistics
        document.getElementById('phrasesHeard').textContent = this.stats.heard;
        document.getElementById('correctAnswers').textContent = this.stats.correct;
        document.getElementById('streak').textContent = this.stats.streak;

        const accuracy = this.stats.totalAttempts > 0 ?
            Math.round((this.stats.correct / this.stats.totalAttempts) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    showExamples() {
        const examples = this.filterPhrases().slice(0, 5);
        let message = '📚 Example Phrases:\n\n';

        examples.forEach((phrase, index) => {
            message += `${index + 1}. ${phrase.japanese}\n`;
            message += `   ${phrase.romaji}\n`;
            message += `   "${phrase.english}"\n\n`;
        });

        message += '🎧 Listen and repeat these phrases!';
        alert(message);
    }

    resetProgress() {
        if (confirm('Reset all progress? This will clear your statistics.')) {
            this.stats = {
                heard: 0,
                correct: 0,
                totalAttempts: 0,
                streak: 0
            };
            this.updateUI();
            this.showStatus('Progress reset!');
        }
    }

    showStatus(message) {
        document.getElementById('status').textContent = message;
    }
}

// Global functions for HTML buttons
function setDifficulty(difficulty) {
    listeningGame.difficulty = difficulty;
    document.querySelectorAll('.difficulty-button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) { event.target.classList.add('active'); };
    listeningGame.showNextPhrase();
}

function setJLPTLevel(level) {
    listeningGame.jlptLevel = level;
    document.querySelectorAll('.jlpt-button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) { event.target.classList.add('active'); };
    listeningGame.showNextPhrase();
}

function setVoice(voice) {
    listeningGame.voice = voice;
    document.querySelectorAll('.voice-button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) { event.target.classList.add('active'); };
}

function setSpeed(value) {
    listeningGame.speed = parseFloat(value);
    document.getElementById('speedValue').textContent = value + 'x';
}

function playAudio() {
    listeningGame.playAudio();
}

function playSlow() {
    listeningGame.playSlow();
}

function repeatAudio() {
    listeningGame.repeatAudio();
}

function nextPhrase() {
    listeningGame.showNextPhrase();
}

function toggleInputMode() {
    listeningGame.toggleInputMode();
}

function checkAnswer() {
    listeningGame.checkAnswer();
}

function showExamples() {
    listeningGame.showExamples();
}

function resetProgress() {
    listeningGame.resetProgress();
}

// Initialize when page loads
let listeningGame;
document.addEventListener('DOMContentLoaded', () => {
    listeningGame = new JapaneseListening();

    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => {
            console.log('Voices loaded');
        };
    }
});





