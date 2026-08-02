/**
 * Canva Integration Functions for Games Collection UI
 * **Timestamp**: 2025-12-13
 *
 * Provides UI functions for Canva design generation
 */

// Global Canva integration instance
let canvaIntegration = null;

/**
 * Initialize Canva integration on page load
 */
async function initializeCanvaIntegration() {
    try {
        // Show Canva integration section
        const canvaSection = document.getElementById('canva-integration');
        const statusDiv = document.getElementById('canva-status');

        if (canvaSection) {
            canvaSection.style.display = 'block';
        }

        // Try to initialize Canva (this will fail gracefully if no API keys)
        canvaIntegration = window.getGamesCanvaIntegration();

        // For demo purposes, we'll simulate Canva availability
        // In production, you'd get these from environment variables or user input
        const clientId = 'demo_client_id'; // Replace with real Canva API credentials
        const clientSecret = 'demo_client_secret'; // Replace with real Canva API credentials

        try {
            await canvaIntegration.initialize(clientId, clientSecret);

            if (statusDiv) {
                statusDiv.innerHTML = '✅ Canva integration active - Ready to generate designs!';
                statusDiv.style.color = '#4CAF50';
            }
        } catch (error) {
            console.warn('Canva API not configured:', error.message);

            if (statusDiv) {
                statusDiv.innerHTML = `
                    ⚠️ Canva integration available but not configured.<br>
                    <small>Get free API access at <a href="https://www.canva.com/developers/" target="_blank" style="color: #FFD700;">canva.dev</a></small>
                `;
                statusDiv.style.color = '#FFC107';
            }
        }
    } catch (error) {
        console.error('Failed to initialize Canva integration:', error);
        const statusDiv = document.getElementById('canva-status');
        if (statusDiv) {
            statusDiv.innerHTML = '❌ Canva integration unavailable';
            statusDiv.style.color = '#F44336';
        }
    }
}

/**
 * Generate thumbnails for popular games
 */
async function generateGameThumbnails() {
    if (!canvaIntegration || !canvaIntegration.isAvailable()) {
        alert('Canva integration not available. Please configure API credentials first.');
        return;
    }

    try {
        showCanvaStatus('🎨 Generating game thumbnails...');

        // Define some popular games to generate thumbnails for
        const games = [
            { name: 'Chess', type: 'chess' },
            { name: 'Go', type: 'go' },
            { name: 'Shogi', type: 'shogi' },
            { name: 'Poker', type: 'card' },
            { name: 'Blackjack', type: 'casino' },
            { name: 'Monopoly', type: 'board' }
        ];

        const results = await canvaIntegration.generateBulkThumbnails(games);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;

        let message = `✅ Generated ${successCount} game thumbnails!\n\n`;

        if (failureCount > 0) {
            message += `⚠️ ${failureCount} thumbnails failed to generate.\n\n`;
        }

        message += '🎨 Designs created in your Canva account.\n';
        message += '📤 Use "Export Design" to download images.';

        alert(message);
        showCanvaStatus(`✅ Generated ${successCount}/${games.length} thumbnails`);

    } catch (error) {
        console.error('Failed to generate thumbnails:', error);
        alert('❌ Failed to generate thumbnails: ' + error.message);
        showCanvaStatus('❌ Thumbnail generation failed');
    }
}

/**
 * Generate a tournament bracket
 */
async function generateTournamentBracket() {
    if (!canvaIntegration || !canvaIntegration.isAvailable()) {
        alert('Canva integration not available. Please configure API credentials first.');
        return;
    }

    try {
        showCanvaStatus('🏆 Generating tournament bracket...');

        // Get tournament details from user
        const tournamentName = prompt('Enter tournament name:', 'Winter Chess Championship 2025');
        if (!tournamentName) return;

        const playerCount = parseInt(prompt('Enter number of players (4-16):', '8'));
        if (!playerCount || playerCount < 4 || playerCount > 16) {
            alert('Please enter a valid number of players (4-16).');
            return;
        }

        // Generate sample players
        const players = [];
        for (let i = 1; i <= playerCount; i++) {
            players.push(`Player ${i}`);
        }

        const design = await canvaIntegration.generateTournamentBracket(
            tournamentName,
            players
        );

        alert(`✅ Tournament bracket generated!\n\nDesign ID: ${design.designId}\nTitle: ${design.title}\n\nUse Canva to customize and export the bracket.`);
        showCanvaStatus('✅ Tournament bracket generated');

    } catch (error) {
        console.error('Failed to generate bracket:', error);
        alert('❌ Failed to generate tournament bracket: ' + error.message);
        showCanvaStatus('❌ Bracket generation failed');
    }
}

/**
 * Generate an achievement certificate
 */
async function generateAchievementCertificate() {
    if (!canvaIntegration || !canvaIntegration.isAvailable()) {
        alert('Canva integration not available. Please configure API credentials first.');
        return;
    }

    try {
        showCanvaStatus('🏅 Generating achievement certificate...');

        // Get certificate details from user
        const playerName = prompt('Enter player name:', 'Steve');
        if (!playerName) return;

        const achievement = prompt('Enter achievement:', 'Chess Grandmaster');
        if (!achievement) return;

        const gameName = prompt('Enter game name:', 'Chess Championship');
        if (!gameName) return;

        const score = prompt('Enter score/rating (optional):', '2850');

        const design = await canvaIntegration.generateAchievementCertificate(
            playerName,
            achievement,
            gameName,
            score || null
        );

        alert(`✅ Achievement certificate generated!\n\nPlayer: ${playerName}\nAchievement: ${achievement}\nGame: ${gameName}\n\nDesign ID: ${design.designId}\n\nUse Canva to customize and download the certificate.`);
        showCanvaStatus('✅ Achievement certificate generated');

    } catch (error) {
        console.error('Failed to generate certificate:', error);
        alert('❌ Failed to generate achievement certificate: ' + error.message);
        showCanvaStatus('❌ Certificate generation failed');
    }
}

/**
 * Export a design (placeholder - would need design ID)
 */
async function exportDesign(designId) {
    if (!canvaIntegration || !canvaIntegration.isAvailable()) {
        alert('Canva integration not available. Please configure API credentials first.');
        return;
    }

    try {
        showCanvaStatus('📤 Exporting design...');

        const format = prompt('Enter export format (PNG, JPG, PDF):', 'PNG').toUpperCase();
        if (!['PNG', 'JPG', 'PDF'].includes(format)) {
            alert('Invalid format. Please choose PNG, JPG, or PDF.');
            return;
        }

        const exportResult = await canvaIntegration.exportDesign(designId, format);

        alert(`✅ Design exported!\n\nFormat: ${format}\nDownload URL: ${exportResult.url}\n\nThe design is ready for download.`);
        showCanvaStatus('✅ Design exported successfully');

    } catch (error) {
        console.error('Failed to export design:', error);
        alert('❌ Failed to export design: ' + error.message);
        showCanvaStatus('❌ Design export failed');
    }
}

/**
 * Generate a game promotional poster
 */
async function generateGamePoster(gameName = null) {
    if (!canvaIntegration || !canvaIntegration.isAvailable()) {
        alert('Canva integration not available. Please configure API credentials first.');
        return;
    }

    try {
        showCanvaStatus('📢 Generating promotional poster...');

        if (!gameName) {
            gameName = prompt('Enter game name:', 'Chess Championship');
            if (!gameName) return;
        }

        const tagline = prompt('Enter tagline (optional):', 'The Ultimate Strategy Experience');
        const features = prompt('Enter features (comma-separated, optional):', 'AI opponents, 3D graphics, multiplayer');

        const featureList = features ? features.split(',').map(f => f.trim()) : [];

        const design = await canvaIntegration.generateGamePoster(
            gameName,
            tagline || '',
            featureList
        );

        alert(`✅ Promotional poster generated!\n\nGame: ${gameName}\nTagline: ${tagline}\n\nDesign ID: ${design.designId}\n\nUse Canva to customize colors, add images, and export.`);
        showCanvaStatus('✅ Promotional poster generated');

    } catch (error) {
        console.error('Failed to generate poster:', error);
        alert('❌ Failed to generate promotional poster: ' + error.message);
        showCanvaStatus('❌ Poster generation failed');
    }
}

/**
 * Generate a leaderboard visualization
 */
async function generateLeaderboard() {
    if (!canvaIntegration || !canvaIntegration.isAvailable()) {
        alert('Canva integration not available. Please configure API credentials first.');
        return;
    }

    try {
        showCanvaStatus('📊 Generating leaderboard...');

        const title = prompt('Enter leaderboard title:', 'Top Chess Players');
        if (!title) return;

        // Generate sample leaderboard data
        const entries = [
            { name: 'Magnus Carlsen', score: 2850 },
            { name: 'Fabiano Caruana', score: 2800 },
            { name: 'Ding Liren', score: 2780 },
            { name: 'Ian Nepomniachtchi', score: 2770 },
            { name: 'Wesley So', score: 2760 }
        ];

        const design = await canvaIntegration.generateLeaderboard(title, entries);

        alert(`✅ Leaderboard generated!\n\nTitle: ${title}\nPlayers: ${entries.length}\n\nDesign ID: ${design.designId}\n\nUse Canva to customize and export the leaderboard.`);
        showCanvaStatus('✅ Leaderboard generated');

    } catch (error) {
        console.error('Failed to generate leaderboard:', error);
        alert('❌ Failed to generate leaderboard: ' + error.message);
        showCanvaStatus('❌ Leaderboard generation failed');
    }
}

/**
 * Update Canva status display
 */
function showCanvaStatus(message) {
    const statusDiv = document.getElementById('canva-status');
    if (statusDiv) {
        statusDiv.innerHTML = message;
        statusDiv.style.color = message.includes('✅') ? '#4CAF50' :
                               message.includes('❌') ? '#F44336' :
                               message.includes('⚠️') ? '#FFC107' : '#FFD700';
    }
}

/**
 * Show Canva integration help
 */
function showCanvaHelp() {
    const helpText = `
🎨 Canva Integration Help

Canva is now FREE and provides professional design tools for your games!

Features Available:
• 🖼️ Game Thumbnails - Auto-generate promotional images
• 🏆 Tournament Brackets - Create competition visualizations
• 🏅 Achievement Certificates - Generate player rewards
• 📊 Leaderboards - Visualize rankings and scores
• 📢 Promotional Posters - Create marketing materials

Setup Required:
1. Visit https://www.canva.com/developers/
2. Create a free developer account
3. Get your API credentials
4. Configure in your ai games collection

Benefits:
• Professional quality designs
• Automated asset generation
• No design skills required
• Free for personal use
• Export in multiple formats

Note: Canva integration requires internet connection and API credentials.
`;

    alert(helpText);
}

// Initialize Canva integration when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to ensure other scripts load first
    setTimeout(initializeCanvaIntegration, 1000);
});

// Export functions for global access
window.initializeCanvaIntegration = initializeCanvaIntegration;
window.generateGameThumbnails = generateGameThumbnails;
window.generateTournamentBracket = generateTournamentBracket;
window.generateAchievementCertificate = generateAchievementCertificate;
window.exportDesign = exportDesign;
window.generateGamePoster = generateGamePoster;
window.generateLeaderboard = generateLeaderboard;
window.showCanvaHelp = showCanvaHelp;
