// Authentication Manager (Firebase ready)
// **Timestamp**: 2025-12-03

class AuthManager {
    constructor() {
        this.user = null;
        this.useLocalAuth = true; // Start with local, upgrade to Firebase later
    }
    
    // Local authentication (no server)
    loginLocal(username) {
        this.user = {
            uid: 'local_' + Date.now(),
            username: username,
            displayName: username,
            isLocal: true,
            createdAt: Date.now()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.user));
        return { success: true, user: this.user };
    }
    
    // Guest mode
    loginAsGuest() {
        return this.loginLocal('Guest' + Math.floor(Math.random() * 10000));
    }
    
    // Get current user
    getCurrentUser() {
        if (!this.user) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.user = JSON.parse(stored);
            }
        }
        return this.user;
    }
    
    // Check if logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }
    
    // Logout
    logout() {
        this.user = null;
        localStorage.removeItem('currentUser');
        return { success: true };
    }
    
    // Firebase integration (Phase 7 full implementation)
    async initializeFirebase(config) {
        // TODO: Full Firebase implementation
        console.log('Firebase initialization placeholder');
    }
}

const authManager = new AuthManager();
window.authManager = authManager;

