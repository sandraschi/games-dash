// Multiplayer System Implementation
// **Timestamp**: 2025-12-03

// Initialize when page loads
window.addEventListener('load', () => {
    if (typeof firebase !== 'undefined') {
        if (isFirebaseConfigured()) {
            initializeFirebase();
            document.getElementById('firebaseStatus').style.display = 'none';
        } else {
            document.getElementById('firebaseStatus').innerHTML = `
                <p>⚠️ <strong>Firebase Setup Required</strong></p>
                <p style="font-size: 14px; margin-top: 10px;">
                    1. Go to <a href="https://console.firebase.google.com" target="_blank" style="color: #4CAF50;">Firebase Console</a><br>
                    2. Create new project: "games-collection"<br>
                    3. Add web app, copy config to firebase-config.js<br>
                    4. Refresh this page
                </p>
            `;
        }
    } else {
        document.getElementById('firebaseStatus').innerHTML = `
            <p style="color: #FF6B6B;">❌ Firebase SDK not loaded</p>
            <p style="font-size: 14px;">Check internet connection</p>
        `;
    }
});

// Authentication Functions
async function signIn() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showLobby();
    } catch (error) {
        alert('Sign in failed: ' + error.message);
    }
}

async function signUp() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showLobby();
    } catch (error) {
        alert('Sign up failed: ' + error.message);
    }
}

async function signInAnonymously() {
    try {
        await auth.signInAnonymously();
        showLobby();
    } catch (error) {
        alert('Anonymous sign in failed: ' + error.message);
    }
}

async function signOut() {
    try {
        await auth.signOut();
        showAuth();
    } catch (error) {
        alert('Sign out failed: ' + error.message);
    }
}

function showLobby() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('lobbyScreen').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('username').textContent = 
            currentUser.email?.split('@')[0] || currentUser.uid.substring(0, 8);
    }
    
    loadFriends();
    loadActiveGames();
}

function showAuth() {
    document.getElementById('authScreen').style.display = 'block';
    document.getElementById('lobbyScreen').style.display = 'none';
}

// Friends System
async function loadFriends() {
    if (!currentUser || !database) return;
    
    const friendsRef = database.ref(`users/${currentUser.uid}/friends`);
    const snapshot = await friendsRef.once('value');
    const friendIds = snapshot.val() || [];
    
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';
    
    if (friendIds.length === 0) {
        friendsList.innerHTML = `
            <div class="friend-card">
                <p style="color: #CCC;">No friends yet.</p>
                <p style="color: #4CAF50; margin-top: 10px;">Add Steve to start playing!</p>
            </div>
        `;
        return;
    }
    
    for (const friendId of friendIds) {
        const friendRef = database.ref(`users/${friendId}`);
        const friendSnap = await friendRef.once('value');
        const friend = friendSnap.val();
        
        if (friend) {
            const card = document.createElement('div');
            card.className = `friend-card ${friend.online ? 'online' : ''}`;
            card.innerHTML = `
                <h3>${friend.username || friend.email?.split('@')[0]}</h3>
                <p style="color: ${friend.online ? '#4CAF50' : '#999'};">
                    ${friend.online ? '✅ Online' : '⚫ Offline'}
                </p>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="challengeFriend('${friendId}', 'chess')" style="flex: 1; padding: 8px; background: #4CAF50; border: none; color: white; border-radius: 5px; cursor: pointer;">
                        ♟️ Challenge
                    </button>
                </div>
            `;
            friendsList.appendChild(card);
        }
    }
}

function showAddFriend() {
    const email = prompt('Enter friend\'s email (e.g., steve@example.com):');
    if (email) {
        addFriendByEmail(email);
    }
}

async function addFriendByEmail(email) {
    if (!database) return;
    
    // Find user by email
    const usersRef = database.ref('users');
    const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
    
    if (snapshot.exists()) {
        const userData = snapshot.val();
        const friendId = Object.keys(userData)[0];
        
        // Add to friends list
        const myFriendsRef = database.ref(`users/${currentUser.uid}/friends`);
        const currentFriends = (await myFriendsRef.once('value')).val() || [];
        
        if (!currentFriends.includes(friendId)) {
            currentFriends.push(friendId);
            await myFriendsRef.set(currentFriends);
            
            // Add reverse friendship
            const theirFriendsRef = database.ref(`users/${friendId}/friends`);
            const theirFriends = (await theirFriendsRef.once('value')).val() || [];
            if (!theirFriends.includes(currentUser.uid)) {
                theirFriends.push(currentUser.uid);
                await theirFriendsRef.set(theirFriends);
            }
            
            alert('Friend added! You can now challenge them.');
            loadFriends();
        } else {
            alert('Already friends!');
        }
    } else {
        alert('User not found with that email.');
    }
}

// Game Creation
async function createGame(gameType) {
    if (!database) return;
    
    const gameId = generateGameCode();
    const gameRef = database.ref(`games/${gameId}`);
    
    await gameRef.set({
        id: gameId,
        type: gameType,
        host: currentUser.uid,
        hostName: currentUser.email?.split('@')[0] || 'Player',
        status: 'waiting',
        createdAt: Date.now(),
        players: {
            player1: currentUser.uid
        }
    });
    
    alert(`Game created!\n\nGame Code: ${gameId}\n\nSend this code to Steve so he can join!\n\nOr wait in the lobby for him to join.`);
    
    loadActiveGames();
    
    // Watch for opponent joining
    watchForOpponent(gameId, gameType);
}

function generateGameCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function watchForOpponent(gameId, gameType) {
    const gameRef = database.ref(`games/${gameId}`);
    
    gameRef.on('value', snapshot => {
        const game = snapshot.val();
        if (game && game.players.player2) {
            // Opponent joined!
            alert(`Opponent joined! Starting ${gameType}...`);
            gameRef.off(); // Stop watching
            startMultiplayerGame(gameId, gameType);
        }
    });
}

function startMultiplayerGame(gameId, gameType) {
    // Redirect to game with multiplayer params
    window.location.href = `${gameType}.html?multiplayer=true&gameId=${gameId}`;
}

async function loadActiveGames() {
    if (!database) return;
    
    const gamesRef = database.ref('games');
    const snapshot = await gamesRef.orderByChild('status').equalTo('waiting').once('value');
    const games = snapshot.val() || {};
    
    const container = document.getElementById('activeGames');
    container.innerHTML = '';
    
    const gameArray = Object.values(games);
    
    if (gameArray.length === 0) {
        container.innerHTML = '<div style="padding: 20px; color: #CCC; text-align: center;">No active games. Create one!</div>';
        return;
    }
    
    gameArray.forEach(game => {
        const card = document.createElement('div');
        card.className = 'lobby-game-card';
        card.innerHTML = `
            <h3>${getGameIcon(game.type)} ${game.type.toUpperCase()}</h3>
            <p><strong>Host:</strong> ${game.hostName}</p>
            <p><strong>Code:</strong> ${game.id}</p>
            <p style="color: #4CAF50;">⏳ Waiting for opponent...</p>
            ${game.host !== currentUser.uid ? '<button onclick="joinGame(\'' + game.id + '\', \'' + game.type + '\')" style="margin-top: 10px; padding: 10px; width: 100%; background: #4CAF50; border: none; color: white; border-radius: 5px; cursor: pointer;">Join Game</button>' : '<p style="color: #FFD700; margin-top: 10px;">Your game</p>'}
        `;
        container.appendChild(card);
    });
}

async function joinGame(gameId, gameType) {
    if (!database) return;
    
    const gameRef = database.ref(`games/${gameId}`);
    const snapshot = await gameRef.once('value');
    const game = snapshot.val();
    
    if (game && !game.players.player2) {
        await gameRef.update({
            'players/player2': currentUser.uid,
            'player2Name': currentUser.email?.split('@')[0] || 'Player',
            status: 'active'
        });
        
        startMultiplayerGame(gameId, gameType);
    } else {
        alert('Game no longer available');
        loadActiveGames();
    }
}

async function challengeFriend(friendId, gameType) {
    const gameId = generateGameCode();
    const gameRef = database.ref(`games/${gameId}`);
    
    await gameRef.set({
        id: gameId,
        type: gameType,
        host: currentUser.uid,
        hostName: currentUser.email?.split('@')[0] || 'Player',
        status: 'waiting',
        createdAt: Date.now(),
        invitedPlayer: friendId,
        players: {
            player1: currentUser.uid
        }
    });
    
    // Send notification (would use Firebase Cloud Messaging in production)
    alert(`Challenge sent to friend!\n\nGame Code: ${gameId}\n\nWaiting for them to join...`);
    
    watchForOpponent(gameId, gameType);
}

function getGameIcon(gameType) {
    const icons = {
        'chess': '♟️',
        'shogi': '🎌',
        'go': '⚫',
        'gomoku': '⚪',
        'checkers': '🔴',
        'bridge': '🎴',
        'pong': '🏓',
        'snake': '🐍'
    };
    return icons[gameType] || '🎮';
}

// Refresh active games every 5 seconds
setInterval(() => {
    if (currentUser && document.getElementById('lobbyScreen').style.display === 'block') {
        loadActiveGames();
    }
}, 5000);

