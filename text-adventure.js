// Text Adventure Engine - Classic Interactive Fiction
// **Timestamp**: 2025-12-03
// "You are in a maze of twisty little passages, all alike"

let currentLocation = 'entrance';
let inventory = [];
let gameState = {
    torchLit: false,
    doorUnlocked: false,
    dragonDefeated: false,
    treasureFound: false
};

// Game world definition
const locations = {
    entrance: {
        name: 'Castle Entrance',
        description: 'You stand before a massive stone castle. The entrance hall beckons to the north. Crumbling walls surround you, covered in ancient ivy. To the east, you see a small guard tower.',
        exits: {north: 'hall', east: 'tower'},
        items: []
    },
    hall: {
        name: 'Great Hall',
        description: 'A vast hall with high vaulted ceilings. Dusty tapestries hang on the walls. Passages lead north to the throne room, south to the entrance, and west to the kitchen.',
        exits: {north: 'throne', south: 'entrance', west: 'kitchen'},
        items: ['torch']
    },
    tower: {
        name: 'Guard Tower',
        description: 'A cramped stone tower. Arrow slits look out over the countryside. A rusty weapon rack holds a single sword.',
        exits: {west: 'entrance'},
        items: ['sword']
    },
    kitchen: {
        name: 'Castle Kitchen',
        description: 'Ancient cooking equipment rusts in corners. A large fireplace dominates one wall. The hall is to the east. A dark stairway leads down.',
        exits: {east: 'hall', down: 'cellar'},
        items: ['bread', 'key']
    },
    cellar: {
        name: 'Dark Cellar',
        description: () => {
            if (gameState.torchLit) {
                return 'The torch illuminates wine racks and stored provisions. A locked door stands to the north.';
            } else {
                return 'It is pitch black. You might be eaten by a grue. (You need light!)';
            }
        },
        exits: {up: 'kitchen', north: 'treasure'},
        items: [],
        needsLight: true
    },
    treasure: {
        name: 'Treasure Room',
        description: 'Gold and jewels sparkle in the torchlight! A magnificent treasure chest sits in the center. You hear a low rumbling...',
        exits: {south: 'cellar'},
        items: ['treasure'],
        needsKey: true
    },
    throne: {
        name: 'Throne Room',
        description: 'A majestic throne sits on a raised dais. The hall is to the south. A passage leads east to the dragon\'s lair.',
        exits: {south: 'hall', east: 'dragon'},
        items: []
    },
    dragon: {
        name: 'Dragon\'s Lair',
        description: () => {
            if (gameState.dragonDefeated) {
                return 'The defeated dragon lies in a heap. You can explore freely now.';
            } else {
                return 'A MASSIVE DRAGON blocks your path! Its eyes glow with menace. It looks hungry...';
            }
        },
        exits: {west: 'throne'},
        items: [],
        hasDragon: true
    },
    maze1: {
        name: 'Twisty Passage',
        description: 'You are in a maze of twisty little passages, all alike.',
        exits: {north: 'maze2', south: 'maze3', east: 'maze1', west: 'maze4'},
        items: []
    },
    maze2: {
        name: 'Little Passage',
        description: 'You are in a little maze of twisty passages, all alike.',
        exits: {north: 'maze1', south: 'maze2', east: 'maze3', west: 'maze1'},
        items: []
    },
    maze3: {
        name: 'Twisting Corridor',
        description: 'You are in a twisting maze of little passages, all different.',
        exits: {north: 'hall', south: 'maze1', east: 'maze2', west: 'maze3'},
        items: []
    },
    maze4: {
        name: 'Winding Path',
        description: 'You are in a maze of twisty passages, all alike. Or are they?',
        exits: {north: 'maze3', south: 'maze4', east: 'maze1', west: 'hall'},
        items: []
    }
};

const items = {
    torch: {name: 'torch', description: 'A wooden torch wrapped in oilcloth. It could be lit.'},
    sword: {name: 'sword', description: 'A rusty but serviceable sword. Good for dragon-slaying.'},
    bread: {name: 'bread', description: 'A loaf of stale bread. Still edible.'},
    key: {name: 'key', description: 'An ornate brass key. It looks important.'},
    treasure: {name: 'treasure', description: 'A magnificent treasure chest filled with gold and jewels! YOU WIN!'}
};

function init() {
    print(getLocationDescription());
    document.getElementById('commandInput').focus();
    
    document.getElementById('commandInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processCommand();
        }
    });
}

function processCommand() {
    const input = document.getElementById('commandInput').value.trim().toLowerCase();
    document.getElementById('commandInput').value = '';
    
    if (!input) return;
    
    // Echo command
    print(`\n<span class="command-line">&gt; ${input}</span>\n`);
    
    const words = input.split(' ');
    const verb = words[0];
    const noun = words.slice(1).join(' ');
    
    // Parse command
    if (['n', 'north'].includes(verb)) move('north');
    else if (['s', 'south'].includes(verb)) move('south');
    else if (['e', 'east'].includes(verb)) move('east');
    else if (['w', 'west'].includes(verb)) move('west');
    else if (['u', 'up'].includes(verb)) move('up');
    else if (['d', 'down'].includes(verb)) move('down');
    else if (['l', 'look'].includes(verb)) look();
    else if (['x', 'examine', 'inspect'].includes(verb)) examine(noun);
    else if (['take', 'get', 'pick'].includes(verb)) take(noun);
    else if (['drop', 'discard'].includes(verb)) drop(noun);
    else if (['use', 'light', 'ignite'].includes(verb)) use(noun);
    else if (['i', 'inv', 'inventory'].includes(verb)) showInventory();
    else if (['attack', 'kill', 'fight'].includes(verb)) attack(noun);
    else if (['eat'].includes(verb)) eat(noun);
    else if (['help', '?'].includes(verb)) showHelp();
    else if (['quit', 'exit'].includes(verb)) quit();
    else {
        print(`<span class="error-text">I don't understand "${input}".</span>`);
        print(`Type 'help' for a list of commands.`);
    }
    
    updateInventoryDisplay();
}

function getLocationDescription() {
    const loc = locations[currentLocation];
    const desc = typeof loc.description === 'function' ? loc.description() : loc.description;
    
    let output = `\n<span class="location-name">${loc.name}</span>\n\n${desc}`;
    
    // List items
    if (loc.items && loc.items.length > 0) {
        output += '\n\nYou can see:';
        loc.items.forEach(item => {
            output += `\n  • <span class="item-name">${item}</span>`;
        });
    }
    
    // List exits
    const exits = Object.keys(loc.exits);
    if (exits.length > 0) {
        output += `\n\nExits: ${exits.join(', ')}`;
    }
    
    return output;
}

function move(direction) {
    const loc = locations[currentLocation];
    
    if (!loc.exits[direction]) {
        print(`<span class="error-text">You can't go that way.</span>`);
        return;
    }
    
    const newLocation = loc.exits[direction];
    const newLoc = locations[newLocation];
    
    // Check for light requirement
    if (newLoc.needsLight && !gameState.torchLit) {
        print(`<span class="error-text">It's too dark to proceed! You need light.</span>`);
        return;
    }
    
    // Check for key requirement
    if (newLoc.needsKey && !gameState.doorUnlocked) {
        if (inventory.includes('key')) {
            print(`You use the brass key to unlock the door...`);
            gameState.doorUnlocked = true;
        } else {
            print(`<span class="error-text">The door is locked. You need a key.</span>`);
            return;
        }
    }
    
    // Check for dragon
    if (newLoc.hasDragon && !gameState.dragonDefeated) {
        print(`<span class="error-text">The dragon roars and blocks your path!</span>`);
        print(`You need a weapon to fight it.`);
        return;
    }
    
    currentLocation = newLocation;
    print(getLocationDescription());
}

function look() {
    print(getLocationDescription());
}

function examine(noun) {
    if (!noun) {
        look();
        return;
    }
    
    // Check inventory
    if (inventory.includes(noun)) {
        const item = items[noun];
        if (item) {
            print(`<span class="item-name">${item.name}</span>: ${item.description}`);
        }
        return;
    }
    
    // Check current location
    const loc = locations[currentLocation];
    if (loc.items.includes(noun)) {
        const item = items[noun];
        if (item) {
            print(`<span class="item-name">${item.name}</span>: ${item.description}`);
        }
    } else {
        print(`<span class="error-text">You don't see that here.</span>`);
    }
}

function take(noun) {
    if (!noun) {
        print(`<span class="error-text">Take what?</span>`);
        return;
    }
    
    const loc = locations[currentLocation];
    const itemIndex = loc.items.indexOf(noun);
    
    if (itemIndex === -1) {
        print(`<span class="error-text">There's no ${noun} here.</span>`);
        return;
    }
    
    loc.items.splice(itemIndex, 1);
    inventory.push(noun);
    print(`Taken: <span class="item-name">${noun}</span>`);
    
    // Check for winning condition
    if (noun === 'treasure') {
        setTimeout(winGame, 1000);
    }
}

function drop(noun) {
    const itemIndex = inventory.indexOf(noun);
    
    if (itemIndex === -1) {
        print(`<span class="error-text">You don't have that.</span>`);
        return;
    }
    
    inventory.splice(itemIndex, 1);
    locations[currentLocation].items.push(noun);
    print(`Dropped: <span class="item-name">${noun}</span>`);
}

function use(noun) {
    if (noun.includes('torch') && inventory.includes('torch')) {
        if (gameState.torchLit) {
            print(`The torch is already lit.`);
        } else {
            gameState.torchLit = true;
            print(`You light the torch. It burns brightly!`);
        }
    } else if (noun.includes('key') && inventory.includes('key')) {
        print(`The key will automatically unlock doors when you approach them.`);
    } else {
        print(`<span class="error-text">You can't use that.</span>`);
    }
}

function attack(noun) {
    if (currentLocation === 'dragon' && !gameState.dragonDefeated) {
        if (inventory.includes('sword')) {
            print(`You brandish the rusty sword and charge the dragon!`);
            print(`After an epic battle, you strike the final blow!`);
            print(`The dragon collapses! You are victorious!`);
            gameState.dragonDefeated = true;
        } else {
            print(`<span class="error-text">You have no weapon! The dragon breathes fire at you.</span>`);
            print(`You flee back to safety.`);
            currentLocation = 'throne';
            print(getLocationDescription());
        }
    } else {
        print(`<span class="error-text">There's nothing to attack here.</span>`);
    }
}

function eat(noun) {
    if (noun.includes('bread') && inventory.includes('bread')) {
        inventory.splice(inventory.indexOf('bread'), 1);
        print(`You eat the stale bread. It's not great, but you feel refreshed.`);
    } else {
        print(`<span class="error-text">You can't eat that!</span>`);
    }
}

function showInventory() {
    if (inventory.length === 0) {
        print(`Your inventory is empty.`);
    } else {
        print(`You are carrying:`);
        inventory.forEach(item => {
            print(`  • <span class="item-name">${item}</span>`);
        });
    }
}

function showHelp() {
    print(`
<span style="color: #FFD700;">═══ HELP ═══</span>

<strong>Movement:</strong>
  north (n), south (s), east (e), west (w), up (u), down (d)

<strong>Actions:</strong>
  look (l) - Examine surroundings
  examine [item] (x) - Look at something closely
  take [item] - Pick up an item
  drop [item] - Drop an item
  use [item] - Use or activate an item
  attack [target] - Fight something
  eat [item] - Consume food

<strong>Information:</strong>
  inventory (i) - Show what you're carrying
  help (?) - Show this help
  quit - Exit game

<strong>Goal:</strong>
Find the treasure! Explore carefully, solve puzzles, defeat monsters!
`);
}

function quit() {
    if (confirm('Are you sure you want to quit?')) {
        print(`\n<span style="color: #FFD700;">Thanks for playing!</span>\n`);
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
}

function winGame() {
    print(`\n\n<span style="color: #FFD700; font-size: 24px;">
═══════════════════════════════════════
        🏆 CONGRATULATIONS! 🏆
═══════════════════════════════════════
</span>`);
    print(`\nYou have found the enchanted treasure!`);
    print(`\nYou are victorious! The castle is yours!`);
    print(`\n<span style="color: #00FFFF;">Game completed! Type 'quit' to exit or reload to play again.</span>`);
}

function print(text) {
    const output = document.getElementById('output');
    const p = document.createElement('p');
    p.innerHTML = text;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
}

function updateInventoryDisplay() {
    const invDisplay = document.getElementById('inventoryDisplay');
    
    if (inventory.length === 0) {
        invDisplay.textContent = 'Empty';
    } else {
        invDisplay.innerHTML = inventory.map(item => 
            `<span class="item-name">${item}</span>`
        ).join(', ');
    }
}

// Easter eggs and special commands
document.getElementById('commandInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const input = document.getElementById('commandInput').value.trim().toLowerCase();
        
        // Zork easter egg
        if (input === 'xyzzy') {
            print(`\n<span style="color: #FF00FF;">✨ *POOF* ✨</span>`);
            print(`A hollow voice says: "Fool."`);
            e.preventDefault();
        }
    }
});

// Initialize game
init();

