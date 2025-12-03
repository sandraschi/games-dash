// Firebase Configuration
// **Timestamp**: 2025-12-03

// TODO: Replace with your Firebase project credentials
// Get these from: https://console.firebase.google.com
// 1. Create new project
// 2. Add web app
// 3. Copy config object here

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "games-collection.firebaseapp.com",
    databaseURL: "https://games-collection-default-rtdb.firebaseio.com",
    projectId: "games-collection",
    storageBucket: "games-collection.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (will be called when Firebase SDK loads)
let firebaseApp = null;
let auth = null;
let database = null;
let currentUser = null;

function initializeFirebase() {
    try {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
        
        console.log('✅ Firebase initialized!');
        
        // Listen for auth state changes
        auth.onAuthStateChanged(user => {
            currentUser = user;
            if (user) {
                console.log('✅ User logged in:', user.email || user.uid);
                updateOnlineStatus(true);
                loadUserProfile();
            } else {
                console.log('User logged out');
                updateOnlineStatus(false);
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.log('Using offline mode. Multiplayer features disabled.');
        return false;
    }
}

function updateOnlineStatus(isOnline) {
    if (!currentUser || !database) return;
    
    const userStatusRef = database.ref(`users/${currentUser.uid}/online`);
    
    if (isOnline) {
        userStatusRef.set(true);
        userStatusRef.onDisconnect().set(false);
    } else {
        userStatusRef.set(false);
    }
}

async function loadUserProfile() {
    if (!currentUser || !database) return;
    
    const profileRef = database.ref(`users/${currentUser.uid}`);
    const snapshot = await profileRef.once('value');
    
    if (!snapshot.exists()) {
        // Create new profile
        await profileRef.set({
            uid: currentUser.uid,
            email: currentUser.email,
            username: currentUser.email?.split('@')[0] || 'Player',
            createdAt: Date.now(),
            stats: {
                gamesPlayed: 0,
                wins: 0,
                losses: 0
            },
            friends: [],
            online: true
        });
        console.log('✅ Profile created');
    } else {
        console.log('✅ Profile loaded:', snapshot.val());
    }
}

// Check if Firebase is configured
function isFirebaseConfigured() {
    return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
}

