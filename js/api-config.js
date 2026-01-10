/**
 * API Configuration for Remote Access with Connection Pooling
 * Dynamically detects if running locally or remotely
 * **Timestamp**: 2025-12-17
 */

class ApiConfig {
    constructor() {
        this.currentHost = window.location.hostname;
        this.currentPort = window.location.port;
        this.protocol = window.location.protocol;

        // Detect environment and connectivity
        this.isLocal = this._detectLocalEnvironment();
        this.isDockerRemote = this._detectDockerRemote();
        this.aiServerHost = this._determineAiServerHost();

        // Connection pooling and caching
        this.connectionPool = new Map();
        this.requestCache = new Map();
        this.cacheTimeout = 30000; // 30 seconds

        // Request deduplication
        this.pendingRequests = new Map();

        // Enhanced connectivity checking
        this.connectivityStatus = new Map();

        console.log(`🌐 API Config: ${this.isLocal ? 'LOCAL' : (this.isDockerRemote ? 'DOCKER-REMOTE' : 'REMOTE')} mode`);
        console.log(`   Web Host: ${this.currentHost}:${this.currentPort}`);
        console.log(`   AI Host: ${this.aiServerHost}`);
        console.log(`   User Agent: ${navigator.userAgent}`);
        console.log(`   Is Mobile: ${/Mobi|Android/i.test(navigator.userAgent)}`);

        // Fetch server configuration for AI server host
        this._loadServerConfig();

        // Start connectivity monitoring
        this._startConnectivityMonitoring();
    }

    async _loadServerConfig() {
        try {
            const configUrl = `${this.protocol}//${this.currentHost}:${this.currentPort || 80}/api/config`;
            const response = await fetch(configUrl);
            const config = await response.json();

            console.log('📡 Server config loaded:', config);

            // Update AI server host if provided by server
            if (config.ai_server_host) {
                this.aiServerHost = config.ai_server_host;
                console.log(`🔄 Updated AI server host to: ${this.aiServerHost}`);
            }

            // Store port information
            this.serverPorts = config.ports || {};
            this.isRemoteAccess = config.is_remote || false;

        } catch (error) {
            console.warn('⚠️ Could not load server config, using defaults:', error.message);
        }
    }

    _detectLocalEnvironment() {
        return this.currentHost === 'localhost' ||
            this.currentHost === '127.0.0.1' ||
            this.currentHost.startsWith('192.168.') ||
            this.currentHost.startsWith('10.') ||
            this.currentHost.startsWith('172.');
    }

    _detectDockerRemote() {
        // Check if we're running in a Docker environment but accessed remotely
        // This happens when the web server is in Docker but AI servers are on Windows host
        return !this.isLocal && (
            // Check for common Docker container indicators
            window.location.port === '9876' || // Our Docker port mapping
            this.currentHost.match(/^\d+\.\d+\.\d+\.\d+$/) || // IP address access
            // Also detect remote access by checking if we're not on localhost/127.0.0.1
            (this.currentHost !== 'localhost' && this.currentHost !== '127.0.0.1')
        );
    }

    _determineAiServerHost() {
        // First priority: Server-provided configuration
        if (window.AI_SERVER_HOST) {
            return window.AI_SERVER_HOST;
        }

        if (this.isDockerRemote) {
            // When running in Docker remotely, AI servers are on the Windows host
            // We need to connect to the Windows host, not the Docker container

            // For VPN setups (Tailscale, ZeroTier, etc.)
            if (this.currentHost.includes('tailscale') || this.currentHost.includes('ts.net') ||
                this.currentHost.includes('zerotier') || this.currentHost.includes('tailscale.net') ||
                this.currentHost.match(/\d+\.\d+\.\d+\.\d+/) && this.currentHost.startsWith('100.')) {
                // VPN networks - keep the same host
                return this.currentHost;
            }

            // For Docker setups, try to reach the host
            // The server config endpoint should provide the correct host
            return 'host.docker.internal'; // Default for Docker
        }

        // For local access, use localhost
        if (this.isLocal) {
            return 'localhost';
        }

        // For remote access to non-Docker setup, use same host
        return this.currentHost;
    }

    _findAiServerHost() {
        // Try multiple strategies to find the AI server host

        // Strategy 1: Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const aiHost = urlParams.get('ai_host');
        if (aiHost) return aiHost;

        // Strategy 2: Try the current host (works if ports are forwarded correctly)
        return this.currentHost;

        // Strategy 3: Could implement auto-discovery here if needed
        // For now, we'll rely on proper port forwarding or URL parameters
    }

    _startConnectivityMonitoring() {
        // Monitor connectivity to AI servers
        setInterval(() => {
            this._checkAiConnectivity();
        }, 60000); // Check every minute
    }

    async _checkAiConnectivity() {
        const services = [
            { name: 'stockfish', port: 11543, path: '/api/stockfish/status' },
            { name: 'shogi', port: 11544, path: '/api/shogi/status' },
            { name: 'go', port: 11545, path: '/api/go/status' }
        ];

        for (const service of services) {
            let connected = false;

            try {
                // Use the proxied API paths through nginx
                const response = await fetch(service.path, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });

                if (response.ok) {
                    connected = true;
                }
            } catch (error) {
                // Connection failed
            }

            this.connectivityStatus.set(service.port, connected);
        }

        console.log('🔗 AI Connectivity (via proxy):', Object.fromEntries(this.connectivityStatus));
        console.log('🎯 AI routing through nginx proxy');
    }

    /**
     * Get the base URL for API calls
     * Web server and AI servers may be on different hosts
     */
    getApiBaseUrl(port) {
        // For web server calls, use current host
        if (port === 11876) {
            return `${this.protocol}//${this.currentHost}:${this.currentPort || 80}`;
        }

        // For AI servers, use the determined AI server host
        return `${this.protocol}//${this.aiServerHost}:${port}`;
    }

    // Convenience methods for each service - now using proxied paths or direct ports
    get stockfishUrl() { return this.getApiBaseUrl(11543) + '/api'; }
    get shogiUrl() { return this.getApiBaseUrl(11544) + '/api'; }
    get goUrl() { return this.getApiBaseUrl(11545) + '/api'; }
    get multiplayerUrl() { return this.getApiBaseUrl(11877) + '/api'; }

    // WebSocket URLs
    get multiplayerWsUrl() {
        const wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:';
        if (this.isLocal) {
            return `ws://localhost:11877`;
        } else {
            return `${wsProtocol}//${this.currentHost}:11877`;
        }
    }

    /**
     * Optimized fetch with connection pooling and caching
     * @param {string} url - API endpoint URL
     * @param {object} options - Fetch options
     * @param {boolean} useCache - Whether to use response caching
     */
    async optimizedFetch(url, options = {}, useCache = true) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;

        // Check cache first
        if (useCache && this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.response.clone();
            } else {
                this.requestCache.delete(cacheKey);
            }
        }

        // Check for pending identical request (deduplication)
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Create optimized request
        const requestPromise = this._performFetch(url, options);

        // Store pending request for deduplication
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const response = await requestPromise;

            // Cache successful GET responses
            if (useCache && options.method === 'GET' && response.ok) {
                this.requestCache.set(cacheKey, {
                    response: response.clone(),
                    timestamp: Date.now()
                });
            }

            return response;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Perform the actual fetch with optimized settings
     */
    async _performFetch(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            // Connection keep-alive for better performance
            keepalive: true,
            // Timeout for requests
            signal: AbortSignal.timeout(10000), // 10 second timeout
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);

            // Handle common HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            // Enhanced error handling with AI server troubleshooting
            if (error.name === 'AbortError') {
                throw new Error(`Request timed out. AI server may not be running or accessible. Check: connectivity-test.html`);
            }
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error(`Network connection failed. AI server unreachable from ${this.aiServerHost}. Try: connectivity-test.html`);
            }
            throw error;
        }
    }

    /**
     * Make API call with automatic retry logic
     */
    async apiCall(endpoint, options = {}, maxRetries = 2) {
        let lastError;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await this.optimizedFetch(endpoint, options);
                return await response.json();
            } catch (error) {
                lastError = error;

                // Don't retry on client errors (4xx)
                if (error.message.includes('HTTP 4')) {
                    break;
                }

                // Exponential backoff
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    /**
     * Clean up old cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.requestCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.requestCache.delete(key);
            }
        }
    }
}

// Global instance
const apiConfig = new ApiConfig();

// Make it available globally
window.apiConfig = apiConfig;
