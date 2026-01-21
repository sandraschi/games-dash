// Text Adventure Game Implementation
// **Timestamp**: 2025-12-04

let currentAdventure = null;
let currentLocation = null;
let inventory = [];
let gameState = {};
let visitedLocations = new Set();

// ZORK - The Great Underground Empire
const ZORK = {
    name: "ZORK",
    title: "ZORK: The Great Underground Empire",
    startLocation: "westOfHouse",
    locations: {
        westOfHouse: {
            name: "West of House",
            description: "You are standing in an open field west of a white house, with a boarded front door. There is a small mailbox here.",
            items: ["leaflet"],
            exits: {north: "northOfHouse", south: "southOfHouse", east: "behindHouse"},
            firstVisit: "ZORK I: The Great Underground Empire\nCopyright (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved.\nZORK is a registered trademark of Infocom, Inc.\nRevision 88 / Serial number 840726\n\nWest of House"
        },
        northOfHouse: {
            name: "North of House",
            description: "You are facing the north side of a white house. There is no door here, and all the windows are boarded up. To the north a narrow path winds through the trees.",
            exits: {south: "westOfHouse", east: "behindHouse", west: "westOfHouse", north: "forest1"},
            items: []
        },
        southOfHouse: {
            name: "South of House",
            description: "You are facing the south side of a white house. There is no door here, and all the windows are boarded. On the ground is a window which is slightly ajar.",
            exits: {north: "westOfHouse", east: "behindHouse", west: "westOfHouse"},
            items: []
        },
        behindHouse: {
            name: "Behind House",
            description: "You are behind the white house. A path leads into the forest to the east. In one corner of the house there is a small window which is slightly ajar.",
            exits: {north: "northOfHouse", south: "southOfHouse", west: "westOfHouse", east: "clearing"},
            items: []
        },
        clearing: {
            name: "Forest Clearing",
            description: "You are in a clearing, with a forest surrounding you on all sides. A path leads south. On the ground is a pile of leaves.",
            exits: {west: "behindHouse", south: "canyon", north: "forest2"},
            items: ["leaves", "grating"]
        },
        canyon: {
            name: "Canyon View",
            description: "You are at the top of the Great Canyon on its west wall. From here there is a marvelous view of the canyon and parts of the Frigid River upstream. Across the canyon, the walls of the White Cliffs join the mighty ramparts of the Flathead Mountains to the east. Following the Canyon upstream to the north, Aragain Falls may be seen, complete with rainbow. The mighty Frigid River flows out from a great dark cavern. To the north is a narrow path on the canyon wall.",
            exits: {north: "clearing", down: "rockyLedge"},
            items: []
        },
        rockyLedge: {
            name: "Rocky Ledge",
            description: "You are on a ledge about halfway up the wall of the river canyon. You can see from here that the main flow from Aragain Falls twists along a passage which it is impossible for you to enter. Below you is the canyon bottom. Above you is more cliff, which appears climbable.",
            exits: {up: "canyon", down: "canyonBottom"},
            items: []
        },
        canyonBottom: {
            name: "Canyon Bottom",
            description: "You are beneath the walls of the river canyon which may be climbable here. The lesser part of the runoff of Aragain Falls flows by below. To the north is a narrow path.",
            exits: {up: "rockyLedge", north: "end"},
            items: []
        },
        end: {
            name: "End of Rainbow",
            description: "You are on a small, rocky beach on the continuation of the Frigid River past the Falls. The beach is narrow due to the presence of the White Cliffs. The river canyon opens here and sunlight shines in from above. A rainbow crosses over the falls to the east and a narrow path continues to the southwest.",
            exits: {south: "canyonBottom"},
            items: ["pot-of-gold"],
            special: "rainbow_end"
        },
        forest1: {
            name: "Forest",
            description: "This is a forest, with trees in all directions. To the east, there appears to be sunlight.",
            exits: {south: "northOfHouse", east: "clearing", west: "forest1"},
            items: []
        },
        forest2: {
            name: "Forest",
            description: "This is a dimly lit forest, with large trees all around.",
            exits: {south: "clearing", north: "forest2", east: "forest2", west: "forest2"},
            special: "grue_warning"
        }
    },
    items: {
        leaflet: {name: "small leaflet", description: "\"WELCOME TO ZORK!\n\nZORK is a game of adventure, danger, and low cunning. In it you will explore some of the most amazing territory ever seen by mortals. No computer should be without one!\"", takeable: true},
        leaves: {name: "pile of leaves", description: "A pile of leaves. Looks like someone might have hidden something underneath.", takeable: false, canMove: true},
        grating: {name: "grating", description: "The grating is locked. You'll need to find a way to open it.", takeable: false, locked: true},
        "pot-of-gold": {name: "pot of gold", description: "A pot of gold! It's quite heavy but you manage to take it.", takeable: true, points: 10}
    },
    specialActions: {
        "move leaves": function() {
            if (currentLocation.name === "Forest Clearing" && !gameState.leavesMoved) {
                gameState.leavesMoved = true;
                print("In disturbing the pile of leaves, a grating is revealed!");
                currentLocation.items = currentLocation.items.filter(i => i !== "leaves");
                if (!currentLocation.items.includes("grating")) {
                    currentLocation.items.push("grating");
                }
                return true;
            }
            return false;
        }
    }
};

// ENCHANTED CASTLE Adventure
const CASTLE = {
    name: "CASTLE",
    title: "The Enchanted Castle",
    startLocation: "courtyard",
    locations: {
        courtyard: {
            name: "Castle Courtyard",
            description: "You stand in the grand courtyard of an ancient castle. Moss-covered walls tower above you. To the north is the main entrance, east leads to the gardens, and west to the stables.",
            items: ["sword"],
            exits: {north: "hallway", east: "garden", west: "stable"}
        },
        hallway: {
            name: "Grand Hallway",
            description: "A long hallway with faded tapestries. Doors lead east and west, and stairs go up.",
            exits: {south: "courtyard", east: "library", west: "kitchen", up: "tower"},
            items: []
        },
        library: {
            name: "Library",
            description: "Dusty books line the shelves. A magical tome glows on a pedestal.",
            exits: {west: "hallway"},
            items: ["tome", "key"]
        },
        kitchen: {
            name: "Kitchen",
            description: "An old kitchen with a cold fireplace. There's a pantry to the north.",
            exits: {east: "hallway", north: "pantry"},
            items: ["bread"]
        },
        pantry: {
            name: "Pantry",
            description: "A dark pantry with shelves of food. Something glitters in the corner.",
            exits: {south: "kitchen"},
            items: ["gold-coin"]
        },
        garden: {
            name: "Castle Garden",
            description: "A beautiful garden with wilted flowers. A fountain sits in the center.",
            exits: {west: "courtyard"},
            items: ["rose"]
        },
        stable: {
            name: "Stable",
            description: "An empty stable with old hay. A horse saddle hangs on the wall.",
            exits: {east: "courtyard"},
            items: ["lantern"]
        },
        tower: {
            name: "Tower Room",
            description: "You've reached the top of the tower. A locked chest sits here, and through the window you can see the entire kingdom. The dragon's lair must be nearby...",
            exits: {down: "hallway"},
            items: ["chest"],
            special: "final_room"
        }
    },
    items: {
        sword: {name: "rusty sword", description: "An old but sturdy sword. Good for fighting!", takeable: true},
        tome: {name: "magical tome", description: "A glowing book of spells. It radiates power.", takeable: true, points: 5},
        key: {name: "brass key", description: "A small brass key. Might unlock something important.", takeable: true},
        bread: {name: "loaf of bread", description: "Fresh bread. You could eat this if hungry.", takeable: true},
        "gold-coin": {name: "gold coin", description: "A shiny gold coin!", takeable: true, points: 3},
        rose: {name: "red rose", description: "A beautiful red rose that never wilts.", takeable: true},
        lantern: {name: "old lantern", description: "A lantern that still has oil. Useful in dark places.", takeable: true},
        chest: {name: "locked chest", description: "A heavy chest with a brass lock.", takeable: false, locked: true, contains: "crown"}
    }
};

// LOST IN SPACE Adventure
const SPACESHIP = {
    name: "SPACESHIP",
    title: "Lost in Space",
    startLocation: "bridge",
    locations: {
        bridge: {
            name: "Ship Bridge",
            description: "You wake up on the bridge of your damaged spaceship. Alarms are blaring. The main console is sparking. You need to assess the damage and make repairs. Exits: south to corridor, down to engineering.",
            items: ["tablet"],
            exits: {south: "corridor", down: "engineering"}
        },
        corridor: {
            name: "Main Corridor",
            description: "A long corridor with flickering lights. Doors lead to various ship sections. North to bridge, east to crew quarters, west to cargo bay, south to airlock.",
            exits: {north: "bridge", east: "quarters", west: "cargo", south: "airlock"},
            items: []
        },
        quarters: {
            name: "Crew Quarters",
            description: "Your sleeping area. Personal items float in zero-g. A photo of Earth hangs crooked on the wall.",
            exits: {west: "corridor"},
            items: ["medkit", "photo"]
        },
        cargo: {
            name: "Cargo Bay",
            description: "Large cargo containers are secured here. One container is open, revealing tools.",
            exits: {east: "corridor"},
            items: ["wrench", "wire"]
        },
        airlock: {
            name: "Airlock",
            description: "The inner airlock door. Through the window you can see the vastness of space. A spacesuit hangs on the wall.",
            exits: {north: "corridor"},
            items: ["spacesuit"]
        },
        engineering: {
            name: "Engineering Bay",
            description: "The ship's engineering section. The main reactor is offline. Conduits spark with electrical discharges. Repair panels are accessible here.",
            exits: {up: "bridge"},
            items: ["reactor-core"],
            special: "final_room"
        }
    },
    items: {
        tablet: {name: "data tablet", description: "Ship's log: Day 47. Life support failing. Reactor offline. Must repair before oxygen runs out.", takeable: true},
        medkit: {name: "medical kit", description: "Emergency medical supplies. Might save your life.", takeable: true},
        photo: {name: "photo of Earth", description: "A reminder of home. Gives you hope.", takeable: true},
        wrench: {name: "space wrench", description: "Essential for repairs. Heavy-duty.", takeable: true},
        wire: {name: "power cable", description: "Could bypass damaged circuits.", takeable: true},
        spacesuit: {name: "EVA spacesuit", description: "Spaceworthy suit. Fully charged O2.", takeable: true},
        "reactor-core": {name: "reactor core", description: "The ship's power source. It's cold and dark.", takeable: false, repairable: true}
    }
};

const ADVENTURES = {
    zork: ZORK,
    castle: CASTLE,
    spaceship: SPACESHIP
};

function selectAdventure(adventureName) {
    currentAdventure = ADVENTURES[adventureName];
    gameState = {};
    inventory = [];
    visitedLocations = new Set();
    
    // Show game UI, hide selector
    document.getElementById('adventureSelector').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    document.getElementById('inventoryPanel').style.display = 'block';
    document.getElementById('commandsPanel').style.display = 'block';
    
    // Update title
    document.getElementById('gameTitle').textContent = currentAdventure.title;
    
    // Start game
    currentLocation = currentAdventure.locations[currentAdventure.startLocation];
    
    const output = document.getElementById('output');
    output.innerHTML = '';
    
    print(`<p style="color: #FFD700; font-size: 20px; text-align: center; margin: 20px 0;">═══════════════════════════════════════</p>`);
    print(`<p style="color: #FFD700; font-size: 20px; text-align: center;">${currentAdventure.title.toUpperCase()}</p>`);
    print(`<p style="color: #00FFFF; text-align: center;">A Classic Text Adventure</p>`);
    print(`<p style="color: #FFD700; font-size: 20px; text-align: center; margin: 20px 0;">═══════════════════════════════════════</p>`);
    
    if (currentLocation.firstVisit) {
        print(currentLocation.firstVisit);
        print("");
    }
    
    describeLocation();
    updateInventory();
}

function print(message) {
    const output = document.getElementById('output');
    const p = document.createElement('p');
    p.innerHTML = message;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

function describeLocation() {
    visitedLocations.add(currentLocation.name);
    
    print(`<span class="location-name">${currentLocation.name}</span>`);
    print(currentLocation.description);
    
    if (currentLocation.items && currentLocation.items.length > 0) {
        const itemDescriptions = currentLocation.items.map(itemId => {
            const item = currentAdventure.items[itemId];
            return `<span class="item-name">${item.name}</span>`;
        });
        print(`You can see: ${itemDescriptions.join(', ')}`);
    }
    
    // Special location messages
    if (currentLocation.special === "grue_warning" && !gameState.grueWarned) {
        gameState.grueWarned = true;
        print('<span class="error-text">It is pitch black. You are likely to be eaten by a grue.</span>');
    }
    
    if (currentLocation.special === "rainbow_end" && !gameState.rainbowSeen) {
        gameState.rainbowSeen = true;
        print('<span style="color: #FFD700;">You have found the end of the rainbow! And there IS a pot of gold here!</span>');
    }
}

function processCommand(input) {
    const command = input.toLowerCase().trim();
    print(`<span class="command-line">&gt; ${input}</span>`);
    
    if (!command) return;
    
    const words = command.split(' ');
    const verb = words[0];
    const noun = words.slice(1).join(' ');
    
    // Movement commands
    const directions = {
        'north': 'north', 'n': 'north',
        'south': 'south', 's': 'south',
        'east': 'east', 'e': 'east',
        'west': 'west', 'w': 'west',
        'up': 'up', 'u': 'up',
        'down': 'down', 'd': 'down'
    };
    
    if (directions[verb]) {
        move(directions[verb]);
        return;
    }
    
    // Game commands
    switch(verb) {
        case 'look':
        case 'l':
            describeLocation();
            break;
            
        case 'examine':
        case 'x':
            examine(noun);
            break;
            
        case 'take':
        case 'get':
            take(noun);
            break;
            
        case 'drop':
            drop(noun);
            break;
            
        case 'inventory':
        case 'i':
            showInventory();
            break;
            
        case 'use':
            useItem(noun);
            break;
            
        case 'open':
            openItem(noun);
            break;
            
        case 'move':
            if (currentAdventure.specialActions && currentAdventure.specialActions[command]) {
                if (!currentAdventure.specialActions[command]()) {
                    print("Nothing happens.");
                }
            } else {
                print("You can't move that.");
            }
            break;
            
        case 'help':
            showHelp();
            break;
            
        case 'quit':
        case 'restart':
            if (confirm('Start over?')) {
                location.reload();
            }
            break;
            
        default:
            print('<span class="error-text">I don\'t understand that command. Type "help" for a list of commands.</span>');
    }
}

function move(direction) {
    if (currentLocation.exits && currentLocation.exits[direction]) {
        currentLocation = currentAdventure.locations[currentLocation.exits[direction]];
        describeLocation();
    } else {
        print('<span class="error-text">You can\'t go that way.</span>');
    }
}

function examine(itemName) {
    if (!itemName) {
        describeLocation();
        return;
    }
    
    // Check inventory
    for (const item of inventory) {
        if (item.name.toLowerCase().includes(itemName)) {
            print(item.description);
            return;
        }
    }
    
    // Check current location
    for (const itemId of currentLocation.items || []) {
        const item = currentAdventure.items[itemId];
        if (item.name.toLowerCase().includes(itemName)) {
            print(item.description);
            return;
        }
    }
    
    print('<span class="error-text">You don\'t see that here.</span>');
}

function take(itemName) {
    if (!itemName) {
        print("Take what?");
        return;
    }
    
    for (const itemId of currentLocation.items || []) {
        const item = currentAdventure.items[itemId];
        if (item.name.toLowerCase().includes(itemName) && item.takeable) {
            inventory.push(item);
            currentLocation.items = currentLocation.items.filter(id => id !== itemId);
            print(`Taken: ${item.name}`);
            updateInventory();
            
            if (item.points) {
                gameState.score = (gameState.score || 0) + item.points;
                print(`<span style="color: #FFD700;">+${item.points} points! Score: ${gameState.score}</span>`);
            }
            return;
        }
    }
    
    print('<span class="error-text">You can\'t take that.</span>');
}

function drop(itemName) {
    if (!itemName) {
        print("Drop what?");
        return;
    }
    
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].name.toLowerCase().includes(itemName)) {
            const item = inventory[i];
            // Find the item ID from the adventure
            const itemId = Object.keys(currentAdventure.items).find(
                id => currentAdventure.items[id].name === item.name
            );
            if (itemId) {
                currentLocation.items = currentLocation.items || [];
                currentLocation.items.push(itemId);
            }
            inventory.splice(i, 1);
            print(`Dropped: ${item.name}`);
            updateInventory();
            return;
        }
    }
    
    print('<span class="error-text">You don\'t have that.</span>');
}

function useItem(itemName) {
    if (!itemName) {
        print("Use what?");
        return;
    }
    
    // Check if player has a key and is at the chest
    if (itemName.includes('key') && currentLocation.items?.includes('chest')) {
        const hasKey = inventory.some(item => item.name.includes('key'));
        if (hasKey) {
            print('<span style="color: #4CAF50;">You unlock the chest with the key!</span>');
            print('<span style="color: #FFD700;">Inside you find the ancient crown! You\'ve won the game!</span>');
            gameState.won = true;
            return;
        }
    }
    
    // Zork special: Use wrench on reactor
    if (itemName.includes('wrench') && currentLocation.name === "Engineering Bay") {
        const hasWrench = inventory.some(item => item.name.includes('wrench'));
        const hasWire = inventory.some(item => item.name.includes('wire'));
        
        if (hasWrench && hasWire) {
            print('<span style="color: #4CAF50;">You repair the reactor with the wrench and power cable!</span>');
            print('<span style="color: #FFD700;">The ship hums to life! Systems online! You\'ve survived! YOU WIN!</span>');
            gameState.won = true;
            return;
        }
    }
    
    print("Nothing happens.");
}

function openItem(itemName) {
    if (itemName.includes('mailbox') && currentLocation.name === "West of House") {
        if (currentLocation.items.includes('leaflet')) {
            print("Opening the small mailbox reveals a leaflet.");
        } else {
            print("The mailbox is empty.");
        }
        return;
    }
    
    print("You can't open that.");
}

function showInventory() {
    if (inventory.length === 0) {
        print("You are empty-handed.");
    } else {
        print("You are carrying:");
        inventory.forEach(item => {
            print(`  - ${item.name}`);
        });
    }
}

function updateInventory() {
    const display = document.getElementById('inventoryDisplay');
    if (inventory.length === 0) {
        display.innerHTML = '<span style="color: #888;">Empty</span>';
    } else {
        display.innerHTML = inventory.map(item => 
            `<span class="item-name">${item.name}</span>`
        ).join('<br>');
    }
}

function showHelp() {
    print('<span style="color: #FFD700;">AVAILABLE COMMANDS:</span>');
    print('Movement: north/n, south/s, east/e, west/w, up/u, down/d');
    print('Actions: look, examine [item], take [item], drop [item]');
    print('Actions: use [item], open [item], inventory/i');
    print('Special: help, quit, restart');
    
    if (currentAdventure.name === "ZORK") {
        print('<span style="color: #00FFFF;">ZORK TIP: Try "open mailbox", "move leaves", "take all"</span>');
    }
}

// Set up input handling - wait for DOM to load
window.addEventListener('load', () => {
    const input = document.getElementById('commandInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const value = this.value;
                if (value.trim()) {
                    processCommand(value);
                    this.value = '';
                }
            }
        });
    }
});
