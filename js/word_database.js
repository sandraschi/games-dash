/**
 * Crossword Word Database
 * Comprehensive word database for crossword puzzles
 * **Timestamp**: 2025-01-22
 */

const WORD_DATABASE = {
    animals: [
        "ELEPHANT", "GIRAFFE", "KANGAROO", "PENGUIN", "DOLPHIN",
        "CHEETAH", "PANTHER", "OCTOPUS", "BUTTERFLY", "HUMMINGBIRD",
        "RHINOCEROS", "HIPPOPOTAMUS", "CHIMPANZEE", "KANGAROO", "OSTRICH",
        "FLAMINGO", "PEACOCK", "PARROT", "EAGLE", "HAWK",
        "TIGER", "LION", "BEAR", "WOLF", "FOX"
    ],

    countries: [
        "AUSTRALIA", "BRAZIL", "CANADA", "DENMARK", "EGYPT",
        "FRANCE", "GERMANY", "HUNGARY", "ICELAND", "JAPAN",
        "MONGOLIA", "NORWAY", "POLAND", "ROMANIA", "SWEDEN",
        "THAILAND", "UKRAINE", "VIETNAM", "ZAMBIA", "ZIMBABWE",
        "MEXICO", "SPAIN", "ITALY", "GREECE", "TURKEY"
    ],

    colors: [
        "CRIMSON", "TURQUOISE", "MAGENTA", "INDIGO", "VIOLET",
        "SCARLET", "EMERALD", "SAFFRON", "CERULEAN", "OCHRE",
        "AMBER", "AZURE", "BEIGE", "BISTRE", "BUFF",
        "CARDINAL", "CARMINE", "CELADON", "CHARTREUSE", "CINNAMON",
        "EBONY", "FLAME", "GOLDEN", "JADE", "LAVENDER"
    ],

    professions: [
        "ARCHITECT", "BIOLOGIST", "CHEMIST", "DIETITIAN", "ENGINEER",
        "FINANCIER", "GEOLOGIST", "HISTORIAN", "INVENTOR", "JOURNALIST",
        "LAWYER", "DOCTOR", "TEACHER", "PILOT", "CHEF",
        "ARTIST", "MUSICIAN", "WRITER", "ACTOR", "DIRECTOR",
        "SCIENTIST", "PROGRAMMER", "DESIGNER", "PHOTOGRAPHER", "FARMER"
    ],

    foods: [
        "ARTICHOKE", "BROCCOLI", "CARAMEL", "DONUT", "ESCARGOT",
        "FETA", "GRANOLA", "HALIBUT", "ICECREAM", "JELLYBEAN",
        "KALE", "LASAGNA", "MACARONI", "NOODLES", "OMELETTE",
        "PASTA", "QUICHE", "RATATOUILLE", "SPAGHETTI", "TABBOULEH",
        "SUSHI", "RAMEN", "TEMPURA", "SAKURA", "WASABI"
    ],

    sports: [
        "BASKETBALL", "FOOTBALL", "VOLLEYBALL", "TENNIS", "GOLF",
        "SWIMMING", "CYCLING", "RUNNING", "JUMPING", "THROWING",
        "SOCCER", "HOCKEY", "BASEBALL", "CRICKET", "RUGBY",
        "BOXING", "WRESTLING", "KARATE", "JUDO", "SUMO"
    ]
};

class WordDatabase {
    constructor() {
        this.words = WORD_DATABASE;
        this.usedWords = new Set();
        console.log('[WORD DATABASE] Initialized with', this.getTotalWords(), 'words across', Object.keys(this.words).length, 'categories');
    }

    getTotalWords() {
        return Object.values(this.words).reduce((total, category) => total + category.length, 0);
    }

    getWordsByCategory(category) {
        return this.words[category] || [];
    }

    getRandomWord(category = null, excludeUsed = false) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        if (excludeUsed) {
            wordList = wordList.filter(word => !this.usedWords.has(word));
        }

        if (wordList.length === 0) {
            if (excludeUsed) {
                this.usedWords.clear();
                return this.getRandomWord(category, false);
            }
            return null;
        }

        const randomIndex = Math.floor(Math.random() * wordList.length);
        const selectedWord = wordList[randomIndex];

        if (excludeUsed) {
            this.usedWords.add(selectedWord);
        }

        return selectedWord;
    }

    searchWords(query, category = null) {
        const searchTerm = query.toUpperCase();
        let wordList;

        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.includes(searchTerm));
    }

    getCategories() {
        return Object.keys(this.words);
    }

    getWordsByLength(length, category = null) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.length === length);
    }

    getWordsStartingWith(letter, category = null) {
        const startLetter = letter.toUpperCase();
        let wordList;

        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.startsWith(startLetter));
    }

    getWordsEndingWith(letter, category = null) {
        const endLetter = letter.toUpperCase();
        let wordList;

        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word => word.endsWith(endLetter));
    }

    getCrosswordWords(minLength = 3, maxLength = 15, category = null) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            wordList = Object.values(this.words).flat();
        }

        return wordList.filter(word =>
            word.length >= minLength &&
            word.length <= maxLength &&
            /^[A-Z]+$/.test(word)
        );
    }

    resetUsedWords() {
        this.usedWords.clear();
        console.log('[WORD DATABASE] Used words reset');
    }

    getStats() {
        const stats = {};
        for (const [category, words] of Object.entries(this.words)) {
            stats[category] = {
                count: words.length,
                avgLength: Math.round(words.reduce((sum, word) => sum + word.length, 0) / words.length),
                minLength: Math.min(...words.map(w => w.length)),
                maxLength: Math.max(...words.map(w => w.length))
            };
        }
        return stats;
    }
}

// Global instance
window.wordDatabase = new WordDatabase();
