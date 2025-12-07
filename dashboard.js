// Dashboard UI Controller
// **Timestamp**: 2025-12-03

const GAMES = [
    // Board Games
    'chess', 'chess-3d', 'shogi', 'go', 'gomoku', 'checkers', 'connect4', 'muhle', 'ludo', 'snakes-and-ladders',
    // Arcade Games
    'snake', 'tetris', 'breakout', 'pong', 'pacman', 'frogger', 'qbert', 'asteroids',
    // Puzzle & Word Games
    'sudoku', 'wordsearch', 'scrabble', 'crossword', 'pentomino', 'dominoes', 'memory', 'rubiks',
    // Math Puzzles
    'kenken', 'twentyfour',
    // Japanese Games
    'yojijukugo', 'karuta', 'kanji-stroke',
    // Card Games
    'poker', 'bridge', 'oldmaid', 'schnapsen',
    // Party Games
    'tongue-twister', 'text-adventure',
    // Timewasters
    'gem-cascade'
];

async function loadDashboard() {
    // Load stats from localStorage
    updateOverallStats();
    await renderGameStatsTable();
    await loadMultiplayerStats();
    renderAchievements();
    renderRecentGames();
}

async function updateOverallStats() {
    let totalGames = 0;
    let totalWins = 0;
    let totalScore = 0;
    let totalTime = 0;
    
    // Try to load from IndexedDB if available
    let statsManager = null;
    try {
        if (window.statsManager) {
            statsManager = window.statsManager;
            // Ensure it's initialized
            if (!statsManager.db) {
                await statsManager.initialize();
            }
        }
    } catch (e) {
        console.warn('StatsManager not available:', e);
    }
    
    for (const game of GAMES) {
        let stats = {played: 0, wins: 0, highScore: 0, totalTime: 0};
        
        if (statsManager && statsManager.db) {
            try {
                const dbStats = await statsManager.getStats(game);
                if (dbStats) {
                    stats = {
                        played: dbStats.gamesPlayed || 0,
                        wins: dbStats.wins || 0,
                        highScore: dbStats.highScore || 0,
                        totalTime: dbStats.totalTime || 0
                    };
                }
            } catch (e) {
                stats = getGameStats(game);
            }
        } else {
            stats = getGameStats(game);
        }
        
        totalGames += stats.played;
        totalWins += stats.wins;
        totalScore += stats.highScore;
        totalTime += stats.totalTime || 0;
    }
    
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
    const playTimeHours = Math.floor(totalTime / 3600);
    const playTimeMinutes = Math.floor((totalTime % 3600) / 60);
    
    const totalGamesEl = document.getElementById('totalGames');
    const totalWinsEl = document.getElementById('totalWins');
    const winRateEl = document.getElementById('winRate');
    const playTimeEl = document.getElementById('playTime');
    
    if (totalGamesEl) totalGamesEl.textContent = totalGames;
    if (totalWinsEl) totalWinsEl.textContent = totalWins;
    if (winRateEl) winRateEl.textContent = winRate + '%';
    if (playTimeEl) playTimeEl.textContent = playTimeHours > 0 ? `${playTimeHours}h ${playTimeMinutes}m` : `${playTimeMinutes}m`;
}

function getGameStats(game) {
    const stored = localStorage.getItem(`stats_${game}`);
    if (stored) {
        return JSON.parse(stored);
    }
    return {played: 0, wins: 0, highScore: 0};
}

async function renderGameStatsTable() {
    const tbody = document.getElementById('gamesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading statistics...</td></tr>';
    
    // Load stats from IndexedDB if available
    let statsManager = null;
    try {
        if (window.statsManager) {
            statsManager = window.statsManager;
            // Ensure it's initialized
            if (!statsManager.db) {
                await statsManager.initialize();
            }
        }
    } catch (e) {
        console.warn('StatsManager not available:', e);
    }
    
    // Get stats for each game
    const gameStats = [];
    for (const game of GAMES) {
        let stats = {played: 0, wins: 0, highScore: 0, lastPlayed: null};
        
        // Try IndexedDB first
        if (statsManager && statsManager.db) {
            try {
                const dbStats = await statsManager.getStats(game);
                if (dbStats) {
                    stats = {
                        played: dbStats.gamesPlayed || 0,
                        wins: dbStats.wins || 0,
                        highScore: dbStats.highScore || 0,
                        lastPlayed: dbStats.lastPlayed || null
                    };
                }
            } catch (e) {
                // Fall back to localStorage
                stats = getGameStats(game);
            }
        } else {
            // Fall back to localStorage
            stats = getGameStats(game);
        }
        
        gameStats.push({
            name: formatGameName(game),
            game: game,
            ...stats
        });
    }
    
    // Sort by games played (descending)
    gameStats.sort((a, b) => b.played - a.played);
    
    // Render table rows
    tbody.innerHTML = '';
    if (gameStats.length === 0 || gameStats.every(s => s.played === 0)) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No statistics available yet. Play some games!</td></tr>';
        return;
    }
    
    gameStats.forEach(stat => {
        const row = document.createElement('tr');
        const winRate = stat.played > 0 ? Math.round((stat.wins / stat.played) * 100) : 0;
        const lastPlayed = stat.lastPlayed ? new Date(stat.lastPlayed).toLocaleDateString() : 'Never';
        
        row.innerHTML = `
            <td>${stat.name}</td>
            <td>${stat.played}</td>
            <td>${stat.wins}</td>
            <td>${winRate}%</td>
            <td>${stat.highScore}</td>
            <td>${lastPlayed}</td>
        `;
        tbody.appendChild(row);
    });
}

async function loadMultiplayerStats() {
    // Try to load multiplayer statistics (optional - don't fail if unavailable)
    // This is a no-op for now - multiplayer stats would be merged with local stats if needed
    // The HTTP API on port 9878/9879 is optional and may not be available
    return Promise.resolve();
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
    const container = document.getElementById('achievementsGrid');
    if (!container) return;
    
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

async function renderRecentGames() {
    const tbody = document.getElementById('recentGamesBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Loading recent games...</td></tr>';
    
    // Load recent games from IndexedDB if available
    try {
        let statsManager = null;
        if (window.statsManager) {
            statsManager = window.statsManager;
            // Ensure it's initialized
            if (!statsManager.db) {
                await statsManager.initialize();
            }
            
            if (statsManager.db) {
                const games = await statsManager.getRecentGames(10);
                tbody.innerHTML = '';
                
                if (games && games.length > 0) {
                    games.forEach(game => {
                        const row = document.createElement('tr');
                        const date = new Date(game.timestamp).toLocaleString();
                        row.innerHTML = `
                            <td>${formatGameName(game.gameType)}</td>
                            <td>${game.result === 'win' ? '🏆 Win' : game.result === 'loss' ? '❌ Loss' : '🤝 Draw'}</td>
                            <td>${game.score || 0}</td>
                            <td>${formatDuration(game.duration || 0)}</td>
                            <td>${date}</td>
                        `;
                        tbody.appendChild(row);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No recent games. Start playing!</td></tr>';
                }
                return;
            }
        }
    } catch (e) {
        console.warn('Error loading recent games:', e);
    }
    
    // Fallback if no stats manager or error
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No recent games available.</td></tr>';
}

function formatDuration(seconds) {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', loadDashboard);
