/**
 * Crossword Word Database
 * **Timestamp**: 2025-01-22
 */

const WORD_DATABASE = {
    // Categories of words for crossword puzzles
    animals: [
        "ELEPHANT", "GIRAFFE", "KANGAROO", "PENGUIN", "DOLPHIN",
        "CHEETAH", "PANTHER", "OCTOPUS", "BUTTERFLY", "HUMMINGBIRD"
    ],

    countries: [
        "AUSTRALIA", "BRAZIL", "CANADA", "DENMARK", "EGYPT",
        "FRANCE", "GERMANY", "HUNGARY", "ICELAND", "JAPAN"
    ],

    colors: [
        "CRIMSON", "TURQUOISE", "MAGENTA", "INDIGO", "VIOLET",
        "SCARLET", "EMERALD", "SAFFRON", "CERULEAN", "OCHRE"
    ],

    professions: [
        "ARCHITECT", "BIOLOGIST", "CHEMIST", "DIETITIAN", "ENGINEER",
        "FINANCIER", "GEOLOGIST", "HISTORIAN", "INVENTOR", "JOURNALIST"
    ],

    foods: [
        "ARTICHOKE", "BROCCOLI", "CARAMEL", "DONUT", "ESCARGOT",
        "FETA", "GRANOLA", "HALIBUT", "ICECREAM", "JELLYBEAN"
    ]
};

class WordDatabase {
    constructor() {
        this.words = WORD_DATABASE;
        console.log('[WORD DATABASE] Initialized with', this.getTotalWords(), 'words');
    }

    getTotalWords() {
        return Object.values(this.words).reduce((total, category) => total + category.length, 0);
    }

    getWordsByCategory(category) {
        return this.words[category] || [];
    }

    getRandomWord(category = null) {
        let wordList;
        if (category && this.words[category]) {
            wordList = this.words[category];
        } else {
            // Get random word from all categories
            const allWords = Object.values(this.words).flat();
            wordList = allWords;
        }

        if (wordList.length === 0) return null;
        return wordList[Math.floor(Math.random() * wordList.length)];
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
}

// Global instance
window.wordDatabase = new WordDatabase();
