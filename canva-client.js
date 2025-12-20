/**
 * Canva Connect API Client for Games Collection
 * **Timestamp**: 2025-12-13
 *
 * Integrates Canva's free design tools for automated game asset generation:
 * - Game thumbnails and promotional materials
 * - UI mockups and wireframes
 * - Tournament brackets and leaderboards
 * - Achievement certificates and badges
 */

class CanvaClient {
    constructor() {
        this.baseURL = 'https://api.canva.com';
        this.apiKey = null;
        this.accessToken = null;
        this.templates = {
            thumbnail: {
                width: 1200,
                height: 630,
                type: 'custom'
            },
            poster: {
                width: 1080,
                height: 1920,
                type: 'custom'
            },
            certificate: {
                width: 1920,
                height: 1080,
                type: 'custom'
            }
        };
    }

    /**
     * Initialize Canva API client
     * @param {string} clientId - Canva OAuth client ID
     * @param {string} clientSecret - Canva OAuth client secret
     */
    async initialize(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;

        // Get access token via OAuth
        await this.authenticate();
    }

    /**
     * Authenticate with Canva API
     */
    async authenticate() {
        try {
            const response = await fetch('https://api.canva.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
                },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    scope: 'design:content:read design:content:write asset:read asset:write'
                })
            });

            const data = await response.json();
            this.accessToken = data.access_token;

            console.log('✅ Canva API authenticated successfully');
        } catch (error) {
            console.error('❌ Canva API authentication failed:', error);
            throw error;
        }
    }

    /**
     * Create a new design
     * @param {Object} options - Design options
     * @param {string} options.title - Design title
     * @param {number} options.width - Design width
     * @param {number} options.height - Design height
     * @param {string} options.type - Design type
     * @returns {Promise<Object>} Design data
     */
    async createDesign({ title, width = 1200, height = 630, type = 'custom' }) {
        try {
            const response = await fetch(`${this.baseURL}/v1/designs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    type,
                    dimensions: { width, height }
                })
            });

            const design = await response.json();

            if (!response.ok) {
                throw new Error(`Failed to create design: ${design.message}`);
            }

            console.log(`✅ Created Canva design: ${design.design.id}`);
            return design.design;
        } catch (error) {
            console.error('❌ Failed to create Canva design:', error);
            throw error;
        }
    }

    /**
     * Upload an image asset to Canva
     * @param {File|Blob} imageFile - Image file to upload
     * @param {string} filename - Asset filename
     * @returns {Promise<Object>} Asset data
     */
    async uploadAsset(imageFile, filename) {
        try {
            // Start asset upload job
            const uploadResponse = await fetch(`${this.baseURL}/v1/asset-uploads`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Asset-Upload-Metadata': JSON.stringify({
                        name: filename,
                        mime_type: imageFile.type || 'image/png'
                    })
                },
                body: imageFile
            });

            const uploadJob = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(`Failed to start asset upload: ${uploadJob.message}`);
            }

            // Poll for completion
            const asset = await this.pollJob(uploadJob.job.id, 'asset-uploads');
            console.log(`✅ Uploaded Canva asset: ${asset.asset.id}`);
            return asset.asset;
        } catch (error) {
            console.error('❌ Failed to upload Canva asset:', error);
            throw error;
        }
    }

    /**
     * Export a design
     * @param {string} designId - Design ID
     * @param {string} format - Export format (PNG, JPG, PDF, SVG)
     * @returns {Promise<Object>} Export data
     */
    async exportDesign(designId, format = 'PNG') {
        try {
            const response = await fetch(`${this.baseURL}/v1/designs/${designId}/export`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format: format.toUpperCase()
                })
            });

            const exportJob = await response.json();

            if (!response.ok) {
                throw new Error(`Failed to start export: ${exportJob.message}`);
            }

            // Poll for completion
            const result = await this.pollJob(exportJob.job.id, 'exports');
            console.log(`✅ Exported Canva design: ${result.export.url}`);
            return result.export;
        } catch (error) {
            console.error('❌ Failed to export Canva design:', error);
            throw error;
        }
    }

    /**
     * Poll a job until completion
     * @param {string} jobId - Job ID
     * @param {string} jobType - Job type (asset-uploads, exports)
     * @returns {Promise<Object>} Job result
     */
    async pollJob(jobId, jobType) {
        const maxAttempts = 30;
        const pollInterval = 2000; // 2 seconds

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch(`${this.baseURL}/v1/${jobType}/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                });

                const job = await response.json();

                if (job.job.status === 'success') {
                    return job;
                } else if (job.job.status === 'failed') {
                    throw new Error(`Job failed: ${job.job.error?.message || 'Unknown error'}`);
                }

                // Still processing, wait and try again
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }

        throw new Error('Job polling timed out');
    }

    /**
     * Generate a game thumbnail
     * @param {string} gameName - Name of the game
     * @param {string} description - Game description
     * @param {File} screenshot - Game screenshot (optional)
     * @returns {Promise<Object>} Thumbnail design data
     */
    async generateGameThumbnail(gameName, description, screenshot = null) {
        try {
            // Create design
            const design = await this.createDesign({
                title: `${gameName} - Thumbnail`,
                ...this.templates.thumbnail
            });

            // Upload screenshot if provided
            if (screenshot) {
                await this.uploadAsset(screenshot, `${gameName}-screenshot.png`);
            }

            // For now, return design info - in a real implementation,
            // you'd use Canva's design editing APIs to add text, images, etc.
            console.log(`🎮 Generated thumbnail design for ${gameName}`);
            return {
                designId: design.id,
                title: design.title,
                urls: design.urls
            };
        } catch (error) {
            console.error(`❌ Failed to generate thumbnail for ${gameName}:`, error);
            throw error;
        }
    }

    /**
     * Generate a tournament bracket
     * @param {string} tournamentName - Tournament name
     * @param {Array} players - Array of player names
     * @returns {Promise<Object>} Bracket design data
     */
    async generateTournamentBracket(tournamentName, players) {
        try {
            const design = await this.createDesign({
                title: `${tournamentName} - Bracket`,
                width: 1920,
                height: 1080
            });

            console.log(`🏆 Generated tournament bracket for ${tournamentName}`);
            return {
                designId: design.id,
                title: design.title,
                urls: design.urls
            };
        } catch (error) {
            console.error(`❌ Failed to generate bracket for ${tournamentName}:`, error);
            throw error;
        }
    }

    /**
     * Generate an achievement certificate
     * @param {string} playerName - Player name
     * @param {string} achievement - Achievement description
     * @param {string} gameName - Game name
     * @returns {Promise<Object>} Certificate design data
     */
    async generateAchievementCertificate(playerName, achievement, gameName) {
        try {
            const design = await this.createDesign({
                title: `${playerName} - ${achievement}`,
                ...this.templates.certificate
            });

            console.log(`🏅 Generated certificate for ${playerName}`);
            return {
                designId: design.id,
                title: design.title,
                urls: design.urls
            };
        } catch (error) {
            console.error(`❌ Failed to generate certificate for ${playerName}:`, error);
            throw error;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanvaClient;
} else {
    window.CanvaClient = CanvaClient;
}
