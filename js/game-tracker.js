// Game Play Tracker
// **Timestamp**: 2025-12-02
// Tracks game plays for recent games and statistics

(function() {
    'use strict';
    
    function trackGamePlay() {
        try {
            const currentPage = window.location.pathname;
            const gameId = currentPage.match(/([^\/]+)\.html/)?.[1];
            
            if (!gameId) return;
            
            // Add to recent games
            let recentGames = JSON.parse(localStorage.getItem('gamesRecent') || '[]');
            recentGames = recentGames.filter(id => id !== gameId);
            recentGames.unshift(gameId);
            recentGames = recentGames.slice(0, 10);
            localStorage.setItem('gamesRecent', JSON.stringify(recentGames));
            
            // Update stats
            const statsKey = `stats_${gameId}`;
            const stats = JSON.parse(localStorage.getItem(statsKey) || '{"played": 0, "wins": 0, "highScore": 0, "totalTime": 0, "lastPlayed": null}');
            stats.played = (stats.played || 0) + 1;
            stats.lastPlayed = new Date().toISOString();
            localStorage.setItem(statsKey, JSON.stringify(stats));
            
            // Notify index manager if available
            if (window.gamesIndexManager && window.gamesIndexManager.addRecentGame) {
                window.gamesIndexManager.addRecentGame(gameId);
            }
        } catch (e) {
            console.warn('Failed to track game play:', e);
        }
    }
    
    // Track when page loads (game started)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackGamePlay);
    } else {
        trackGamePlay();
    }
})();

