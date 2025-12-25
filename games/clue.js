// Clue Game Logic

const SUSPECTS = ['Colonel Mustard', 'Miss Scarlet', 'Professor Plum', 'Mr. Green', 'Mrs. White', 'Mrs. Peacock'];
const WEAPONS = ['Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench'];
const ROOMS = ['Ballroom', 'Billiard Room', 'Conservatory', 'Dining Room', 'Hall', 'Kitchen', 'Library', 'Lounge', 'Study'];

// Game state
let gameState = {
    solution: {
        suspect: null,
        weapon: null,
        room: null
    },
    eliminated: {
        suspects: [],
        weapons: [],
        rooms: []
    },
    selected: {
        suspect: null,
        weapon: null,
        room: null
    },
    gameActive: true
};

// Initialize game
function newGame() {
    // Random solution
    gameState.solution = {
        suspect: SUSPECTS[Math.floor(Math.random() * SUSPECTS.length)],
        weapon: WEAPONS[Math.floor(Math.random() * WEAPONS.length)],
        room: ROOMS[Math.floor(Math.random() * ROOMS.length)]
    };
    
    gameState.eliminated = {
        suspects: [],
        weapons: [],
        rooms: []
    };
    
    gameState.selected = {
        suspect: null,
        weapon: null,
        room: null
    };
    
    gameState.gameActive = true;
    
    renderCards();
    updateAccusation();
    updateStatus('Investigate! Click cards to eliminate them. Make your final accusation when ready!');
}

// Render cards
function renderCards() {
    // Suspects
    const suspectsEl = document.getElementById('suspects');
    suspectsEl.innerHTML = '';
    SUSPECTS.forEach(suspect => {
        const card = document.createElement('div');
        card.className = 'card';
        if (gameState.eliminated.suspects.includes(suspect)) {
            card.classList.add('eliminated');
        }
        if (gameState.selected.suspect === suspect) {
            card.classList.add('selected');
        }
        card.textContent = suspect;
        card.onclick = () => selectCard('suspect', suspect);
        suspectsEl.appendChild(card);
    });
    
    // Weapons
    const weaponsEl = document.getElementById('weapons');
    weaponsEl.innerHTML = '';
    WEAPONS.forEach(weapon => {
        const card = document.createElement('div');
        card.className = 'card';
        if (gameState.eliminated.weapons.includes(weapon)) {
            card.classList.add('eliminated');
        }
        if (gameState.selected.weapon === weapon) {
            card.classList.add('selected');
        }
        card.textContent = weapon;
        card.onclick = () => selectCard('weapon', weapon);
        weaponsEl.appendChild(card);
    });
    
    // Rooms
    const roomsEl = document.getElementById('rooms');
    roomsEl.innerHTML = '';
    ROOMS.forEach(room => {
        const card = document.createElement('div');
        card.className = 'card';
        if (gameState.eliminated.rooms.includes(room)) {
            card.classList.add('eliminated');
        }
        if (gameState.selected.room === room) {
            card.classList.add('selected');
        }
        card.textContent = room;
        card.onclick = () => selectCard('room', room);
        roomsEl.appendChild(card);
    });
}

// Select card
function selectCard(type, value) {
    if (!gameState.gameActive) return;
    
    if (type === 'suspect') {
        if (gameState.selected.suspect === value) {
            // Toggle elimination
            const index = gameState.eliminated.suspects.indexOf(value);
            if (index > -1) {
                gameState.eliminated.suspects.splice(index, 1);
                gameState.selected.suspect = value;
            } else {
                gameState.eliminated.suspects.push(value);
                gameState.selected.suspect = null;
            }
        } else {
            gameState.selected.suspect = value;
        }
    } else if (type === 'weapon') {
        if (gameState.selected.weapon === value) {
            const index = gameState.eliminated.weapons.indexOf(value);
            if (index > -1) {
                gameState.eliminated.weapons.splice(index, 1);
                gameState.selected.weapon = value;
            } else {
                gameState.eliminated.weapons.push(value);
                gameState.selected.weapon = null;
            }
        } else {
            gameState.selected.weapon = value;
        }
    } else if (type === 'room') {
        if (gameState.selected.room === value) {
            const index = gameState.eliminated.rooms.indexOf(value);
            if (index > -1) {
                gameState.eliminated.rooms.splice(index, 1);
                gameState.selected.room = value;
            } else {
                gameState.eliminated.rooms.push(value);
                gameState.selected.room = null;
            }
        } else {
            gameState.selected.room = value;
        }
    }
    
    renderCards();
    updateAccusation();
}

// Update accusation display
function updateAccusation() {
    const accusationEl = document.getElementById('accusation');
    const accuseBtn = document.getElementById('accuse-btn');
    
    if (gameState.selected.suspect && gameState.selected.weapon && gameState.selected.room) {
        accusationEl.textContent = `${gameState.selected.suspect} with the ${gameState.selected.weapon} in the ${gameState.selected.room}`;
        accuseBtn.disabled = false;
    } else {
        accusationEl.textContent = 'Select suspect, weapon, and room above';
        accuseBtn.disabled = true;
    }
}

// Make accusation
function makeAccusation() {
    if (!gameState.selected.suspect || !gameState.selected.weapon || !gameState.selected.room) {
        return;
    }
    
    const correct = 
        gameState.selected.suspect === gameState.solution.suspect &&
        gameState.selected.weapon === gameState.solution.weapon &&
        gameState.selected.room === gameState.solution.room;
    
    gameState.gameActive = false;
    
    if (correct) {
        updateStatus(`🎉 Correct! ${gameState.selected.suspect} did it with the ${gameState.selected.weapon} in the ${gameState.selected.room}!`);
    } else {
        updateStatus(`❌ Wrong! The solution was: ${gameState.solution.suspect} with the ${gameState.solution.weapon} in the ${gameState.solution.room}.`);
    }
    
    document.getElementById('accuse-btn').disabled = true;
}

// Update status
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    newGame();
});
