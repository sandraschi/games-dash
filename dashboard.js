// Dashboard UI Controller
// **Timestamp**: 2025-12-03

async function loadDashboard() {
    try {
        // Wait for stats manager to initialize
        if (!statsManager.db) {
            await statsManager.initialize();
        }
        
        // Load all stats
        const allStats = await statsManager.getAllStats();
        
        // Calculate totals
        let totalGames = 0;
        let totalWins = 0;
        let totalTime = 0;
        
        allStats.forEach(stat => {
            totalGames += stat.gamesPlayed || 0;
            totalWins += stat.wins || 0;
            totalTime += stat.totalTime || 0;
        });
        
        const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : 0;
        const playTimeHours = (totalTime / 3600000).toFixed(1);
        
        // Update overview cards
        document.getElementById('totalGames').textContent = totalGames;
        document.getElementById('totalWins').textContent = totalWins;
        document.getElementById('winRate').textContent = winRate + '%';
        document.getElementById('playTime').textContent = playTimeHours + 'h';
        
        // Render games table
        renderGamesTable(allStats);
        
        // Load recent games
        const recent = await statsManager.getRecentGames(10);
        renderRecentGames(recent);
        
        // Load achievements
        renderAchievements();
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

function renderGamesTable(stats) {
    const tbody = document.getElementById('gamesTableBody');
    tbody.innerHTML = '';
    
    if (stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No games played yet. Start playing to see stats!</td></tr>';
        return;
    }
    
    stats.forEach(stat => {
        const row = document.createElement('tr');
        const winRate = stat.gamesPlayed > 0 ? 
            ((stat.wins / stat.gamesPlayed) * 100).toFixed(1) : 0;
        const lastPlayed = new Date(stat.lastPlayed).toLocaleDateString();
        
        row.innerHTML = `
            <td>${stat.gameType}</td>
            <td>${stat.gamesPlayed}</td>
            <td>${stat.wins}</td>
            <td>${winRate}%</td>
            <td>${stat.highScore}</td>
            <td>${lastPlayed}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderRecentGames(games) {
    const tbody = document.getElementById('recentGamesBody');
    tbody.innerHTML = '';
    
    if (games.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No recent games</td></tr>';
        return;
    }
    
    games.forEach(game => {
        const row = document.createElement('tr');
        const duration = (game.duration / 1000 / 60).toFixed(1) + 'm';
        const date = new Date(game.timestamp).toLocaleDateString();
        
        const resultEmoji = {
            'win': '✅',
            'loss': '❌',
            'draw': '🤝'
        }[game.result] || '➖';
        
        row.innerHTML = `
            <td>${game.gameType}</td>
            <td>${resultEmoji} ${game.result}</td>
            <td>${game.score}</td>
            <td>${duration}</td>
            <td>${date}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    
    // Sample achievements (will be loaded from DB in full version)
    const achievements = [
        { id: 'first_win', name: 'First Victory', icon: '🏆', unlocked: true },
        { id: 'century', name: '100 Games', icon: '💯', unlocked: false },
        { id: 'perfectionist', name: 'Perfect Score', icon: '🌟', unlocked: false },
        { id: 'speedster', name: 'Speed Demon', icon: '⚡', unlocked: false },
        { id: 'polyglot', name: 'Jack of All Games', icon: '🎭', unlocked: false }
    ];
    
    achievements.forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? '' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <strong>${achievement.name}</strong>
        `;
        grid.appendChild(card);
    });
}

// Load dashboard when page loads
window.addEventListener('load', loadDashboard);

