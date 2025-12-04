// Dashboard UI Controller
// **Timestamp**: 2025-12-03

const GAMES = [
    // Board Games
    'chess', 'shogi', 'go', 'gomoku', 'checkers', 'connect4', 'muhle',
    // Arcade Games
    'snake', 'tetris', 'breakout', 'pong', 'pacman', 'frogger', 'qbert',
    // Puzzle & Word Games
    'sudoku', 'wordsearch', 'scrabble', 'crossword',
    // Card Games
    'poker', 'bridge',
    // Party Games
    'tongue-twister', 'text-adventure',
    // Timewasters
    'gem-cascade'
];

async function loadDashboard() {
    // Load stats from localStorage
    updateOverallStats();
    renderGameStats();
    renderAchievements();
}

function updateOverallStats() {
    let totalGames = 0;
    let totalWins = 0;
    let totalScore = 0;
    
    GAMES.forEach(game => {
        const stats = getGameStats(game);
        totalGames += stats.played;
        totalWins += stats.wins;
        totalScore += stats.highScore;
    });
    
    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('totalWins').textContent = totalWins;
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('playTime').textContent = '0h 0m'; // Placeholder
}

function getGameStats(game) {
    const stored = localStorage.getItem(`stats_${game}`);
    if (stored) {
        return JSON.parse(stored);
    }
    return {played: 0, wins: 0, highScore: 0};
}

function renderGameStats() {
    const container = document.getElementById('gameStats');
    container.innerHTML = '';
    
    // Group games by category
    const categories = {
        '♟️ Board Games': ['chess', 'shogi', 'go', 'gomoku', 'checkers', 'connect4', 'muhle'],
        '👾 Arcade': ['snake', 'tetris', 'breakout', 'pong', 'pacman', 'frogger', 'qbert'],
        '🧩 Puzzle & Word': ['sudoku', 'wordsearch', 'scrabble', 'crossword'],
        '🃏 Card': ['poker', 'bridge'],
        '🎉 Party': ['tongue-twister', 'text-adventure'],
        '⏰ Timewasters': ['gem-cascade']
    };
    
    Object.entries(categories).forEach(([category, games]) => {
        const categorySection = document.createElement('div');
        categorySection.innerHTML = `<h2 style="color: #4CAF50; margin: 30px 0 15px 0; border-bottom: 2px solid rgba(76, 175, 80, 0.3); padding-bottom: 10px;">${category}</h2>`;
        container.appendChild(categorySection);
        
        const categoryGrid = document.createElement('div');
        categoryGrid.style.display = 'grid';
        categoryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        categoryGrid.style.gap = '15px';
        categoryGrid.style.marginBottom = '20px';
        
        games.forEach(game => {
            const stats = getGameStats(game);
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <h3>${formatGameName(game)}</h3>
                <div class="stat-value">${stats.played}</div>
                <div class="stat-label">Played</div>
                <div style="margin-top: 10px; font-size: 12px;">
                    <span class="badge">Score: ${stats.highScore}</span>
                </div>
            `;
            categoryGrid.appendChild(card);
        });
        
        container.appendChild(categoryGrid);
    });
}

function formatGameName(game) {
    const specialNames = {
        'chess': '♟️ Chess',
        'shogi': '🎌 Shogi',
        'go': '⚫ Go',
        'gomoku': '⚪ Gomoku',
        'checkers': '🔴 Checkers',
        'connect4': '🟡 Connect Four',
        'muhle': '🎯 Mühle',
        'snake': '🐍 Snake',
        'tetris': '🟦 Tetris',
        'breakout': '🧱 Breakout',
        'pong': '🏓 Pong',
        'pacman': '👻 Pac-Man',
        'frogger': '🐸 Frogger',
        'qbert': '🔶 Q*bert',
        'sudoku': '🔢 Sudoku',
        'wordsearch': '🔍 Word Search',
        'poker': '🃏 Poker',
        'bridge': '🎴 Bridge',
        'tongue-twister': '👅 Tongue Twister',
        'text-adventure': '📜 Text Adventure',
        'gem-cascade': '💎 Gem Cascade'
    };
    
    return specialNames[game] || game.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function renderAchievements() {
    const container = document.getElementById('achievements');
    container.innerHTML = '';
    
    const achievements = [
        {icon: '🏆', name: 'First Win', unlocked: true},
        {icon: '🎯', name: 'Perfect Game', unlocked: false},
        {icon: '🔥', name: '10 Win Streak', unlocked: false},
        {icon: '⚡', name: 'Speed Demon', unlocked: false},
        {icon: '🧠', name: 'Master Strategist', unlocked: false},
        {icon: '💎', name: 'Collector', unlocked: false},
        {icon: '🌟', name: 'All Games Played', unlocked: false},
        {icon: '👑', name: 'Beat All AIs', unlocked: false}
    ];
    
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? '' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div>${achievement.name}</div>
        `;
        container.appendChild(card);
    });
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', loadDashboard);
