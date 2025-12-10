// Gem Cascade - Match-3 Game (THE EVIL ONE - Enhanced!)
// **Timestamp**: 2025-12-03
// WARNING: Dangerously addictive!

let canvas, ctx;

// Initialize canvas when DOM is ready
function initCanvas() {
    if (!canvas) {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return false;
        }
        ctx = canvas.getContext('2d');
    }
    return true;
}

const GRID_SIZE = 8;
const GEM_SIZE = 80;

// Prettier gem colors with gradients
const GEMS = [
    { name: 'Ruby', color1: '#FF0000', color2: '#990000', sparkle: '#FFB3B3' },
    { name: 'Emerald', color1: '#00FF00', color2: '#008800', sparkle: '#B3FFB3' },
    { name: 'Sapphire', color1: '#0000FF', color2: '#000099', sparkle: '#B3B3FF' },
    { name: 'Topaz', color1: '#FFFF00', color2: '#999900', sparkle: '#FFFFB3' },
    { name: 'Amethyst', color1: '#FF00FF', color2: '#990099', sparkle: '#FFB3FF' },
    { name: 'Aquamarine', color1: '#00FFFF', color2: '#009999', sparkle: '#B3FFFF' }
];

// Special gems (match 4+)
const SPECIAL_GEMS = {
    STRIPED: 100, // Clears row or column
    WRAPPED: 101, // Explodes 3x3 area
    COLOR_BOMB: 102 // Removes all of one color
};

let grid = [];
let score = 0;
let moves = 30;
let target = 1000;
let selected = null;
let gameRunning = false;
let playTime = 0;
let playTimer;
let particles = [];
let animatingGems = [];
let gameStartTime = null;
let audioContext = null;

function initGrid() {
    grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            grid[row][col] = Math.floor(Math.random() * GEMS.length);
        }
    }
    // Ensure no initial matches
    while (findMatches().length > 0) {
        removeMatches();
        fillGaps();
    }
}

function draw() {
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!gameRunning) return;
    
    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GEM_SIZE, 0);
        ctx.lineTo(i * GEM_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GEM_SIZE);
        ctx.lineTo(canvas.width, i * GEM_SIZE);
        ctx.stroke();
    }
    
    // Draw gems with prettier gradients
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const gemType = grid[row][col];
            if (gemType >= 0 && gemType < GEMS.length) {
                drawPrettyGem(col * GEM_SIZE, row * GEM_SIZE, gemType, 
                    selected && selected.row === row && selected.col === col);
            } else if (gemType >= 100) {
                drawSpecialGem(col * GEM_SIZE, row * GEM_SIZE, gemType);
            }
        }
    }
    
    // Draw particles
    particles.forEach((p, index) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life <= 0) particles.splice(index, 1);
    });
    
    // Draw animating gems (moving off screen)
    animatingGems.forEach((gem, index) => {
        ctx.save();
        ctx.globalAlpha = gem.alpha;
        ctx.translate(gem.x, gem.y);
        ctx.rotate(gem.rotation);
        ctx.scale(gem.scale, gem.scale);
        
        const g = GEMS[gem.type];
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        gradient.addColorStop(0, g.color1);
        gradient.addColorStop(1, g.color2);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        gem.y += gem.vy;
        gem.vy += 0.5; // Gravity
        gem.rotation += 0.1;
        gem.alpha -= 0.02;
        gem.scale -= 0.01;
        
        if (gem.alpha <= 0) animatingGems.splice(index, 1);
    });
    
    requestAnimationFrame(draw);
}

function drawPrettyGem(x, y, gemType, isSelected) {
    const gem = GEMS[gemType];
    const centerX = x + GEM_SIZE / 2;
    const centerY = y + GEM_SIZE / 2;
    const radius = GEM_SIZE / 2 - 8;
    
    // Radial gradient for depth
    const gradient = ctx.createRadialGradient(
        centerX - 10, centerY - 10, 5,
        centerX, centerY, radius
    );
    gradient.addColorStop(0, gem.sparkle);
    gradient.addColorStop(0.4, gem.color1);
    gradient.addColorStop(1, gem.color2);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Faceted look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
        );
        ctx.stroke();
    }
    
    // Sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY - 12, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Selection highlight with glow
    if (isSelected) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        ctx.strokeRect(x + 2, y + 2, GEM_SIZE - 4, GEM_SIZE - 4);
        ctx.shadowBlur = 0;
    }
}

function drawSpecialGem(x, y, type) {
    const centerX = x + GEM_SIZE / 2;
    const centerY = y + GEM_SIZE / 2;
    
    // Rainbow gradient for special gems
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, GEM_SIZE / 2
    );
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.3, '#FFD700');
    gradient.addColorStop(0.6, '#FF00FF');
    gradient.addColorStop(1, '#00FFFF');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, GEM_SIZE / 2 - 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Star symbol
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('*', centerX, centerY);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x + GEM_SIZE / 2,
            y: y + GEM_SIZE / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8 - 2,
            size: Math.random() * 4 + 2,
            color: color || '#FFD700',
            life: 1
        });
    }
}

function animateGemAway(row, col, gemType) {
    const x = col * GEM_SIZE + GEM_SIZE / 2;
    const y = row * GEM_SIZE + GEM_SIZE / 2;
    
    animatingGems.push({
        x, y,
        type: gemType,
        vy: -5, // Initial upward velocity
        rotation: 0,
        alpha: 1,
        scale: 1
    });
}

function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            return false;
        }
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return true;
}

function playSound(type) {
    if (!initAudioContext() || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'match') {
            // Subtle, pleasant match sound - soft pop
            oscillator.type = 'sine';
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime); // Lower volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } else if (type === 'combo') {
            // Slightly higher pitch for combos
            oscillator.type = 'sine';
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } else if (type === 'special') {
            // Pleasant chime for special gems
            oscillator.type = 'sine';
            oscillator.frequency.value = 1000;
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        }
    } catch (e) {
        console.warn('Error playing sound:', e);
    }
}

function findMatches() {
    const matches = [];
    
    // Check horizontal
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 2; col++) {
            const gem = grid[row][col];
            if (gem === grid[row][col + 1] && gem === grid[row][col + 2]) {
                matches.push({row, col}, {row, col: col+1}, {row, col: col+2});
            }
        }
    }
    
    // Check vertical
    for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 2; row++) {
            const gem = grid[row][col];
            if (gem === grid[row + 1][col] && gem === grid[row + 2][col]) {
                matches.push({row, col}, {row: row+1, col}, {row: row+2, col});
            }
        }
    }
    
    return matches;
}

function removeMatches() {
    const matches = findMatches();
    if (matches.length === 0) return 0;
    
    // Create particles and animate gems away
    matches.forEach(match => {
        const gemType = grid[match.row][match.col];
        if (gemType >= 0 && gemType < GEMS.length) {
            const x = match.col * GEM_SIZE;
            const y = match.row * GEM_SIZE;
            const gem = GEMS[gemType];
            
            createParticles(x, y, gem.color1);
            animateGemAway(match.row, match.col, gemType);
        }
        grid[match.row][match.col] = -1; // Mark for removal
    });
    
    // Play sound
    playSound('match');
    
    // Check for special gem creation (match 4+)
    const matchGroups = groupMatches(matches);
    matchGroups.forEach(group => {
        if (group.length >= 4) {
            // Create special gem at first position
            const pos = group[0];
            setTimeout(() => {
                grid[pos.row][pos.col] = SPECIAL_GEMS.STRIPED;
                playSound('special');
            }, 300);
        }
    });
    
    return matches.length;
}

function groupMatches(matches) {
    // Group connected matches
    const groups = [];
    const used = new Set();
    
    matches.forEach(match => {
        const key = `${match.row},${match.col}`;
        if (used.has(key)) return;
        
        const group = [match];
        used.add(key);
        
        // Find connected matches
        for (let i = 0; i < group.length; i++) {
            const current = group[i];
            matches.forEach(m => {
                const mkey = `${m.row},${m.col}`;
                if (!used.has(mkey)) {
                    const adjacent = Math.abs(m.row - current.row) + Math.abs(m.col - current.col) === 1;
                    if (adjacent && grid[m.row][m.col] === grid[current.row][current.col]) {
                        group.push(m);
                        used.add(mkey);
                    }
                }
            });
        }
        
        groups.push(group);
    });
    
    return groups;
}

function fillGaps() {
    for (let col = 0; col < GRID_SIZE; col++) {
        let gaps = 0;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (grid[row][col] === -1) {
                gaps++;
            } else if (gaps > 0) {
                grid[row + gaps][col] = grid[row][col];
                grid[row][col] = -1;
            }
        }
        // Fill top with new gems
        for (let row = 0; row < gaps; row++) {
            grid[row][col] = Math.floor(Math.random() * GEMS.length);
        }
    }
}

async function handleClick(event) {
    if (!gameRunning) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const col = Math.floor(x / GEM_SIZE);
    const row = Math.floor(y / GEM_SIZE);
    
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return;
    
    if (!selected) {
        selected = {row, col};
        draw();
    } else {
        // Check if adjacent
        const rowDiff = Math.abs(selected.row - row);
        const colDiff = Math.abs(selected.col - col);
        
        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            // Swap gems with animation
            const temp = grid[selected.row][selected.col];
            grid[selected.row][selected.col] = grid[row][col];
            grid[row][col] = temp;
            
            draw();
            await sleep(200);
            
            // Check for matches
            const matched = findMatches();
            if (matched.length > 0) {
                await processMatches();
                moves--;
                updateScore();
                if (moves <= 0) checkGameOver();
            } else {
                // Swap back if no match
                const temp2 = grid[selected.row][selected.col];
                grid[selected.row][selected.col] = grid[row][col];
                grid[row][col] = temp2;
                draw();
            }
        }
        
        selected = null;
        draw();
    }
}

async function processMatches() {
    let combo = 0;
    while (findMatches().length > 0) {
        const matchCount = removeMatches();
        score += matchCount * 10 * (1 + combo);
        
        if (combo > 0) {
            playSound('combo');
            // Show combo text
            showComboText(combo);
        }
        
        combo++;
        await sleep(300); // Animation delay
        fillGaps();
        await sleep(200);
    }
}

function showComboText(combo) {
    ctx.save();
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.fillText(`${combo}x COMBO!`, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkGameOver() {
    gameRunning = false;
    clearInterval(playTimer);
    
    const duration = gameStartTime ? Date.now() - gameStartTime : playTime * 1000;
    const result = score >= target ? 'win' : 'loss';
    
    // Unobtrusive stats recording
    if (window.recordGameStats) {
        window.recordGameStats('gem-cascade', result, score, duration, { 
            moves: moves, 
            target: target,
            playTimeSeconds: playTime 
        });
    }
    
    if (score >= target) {
        alert(`Level Complete! Score: ${score}\n\nTime played: ${Math.floor(playTime/60)}m ${playTime%60}s\n\nWARNING: You just spent ${Math.floor(playTime/60)} minutes. Go outside!`);
    } else {
        alert(`Game Over! Score: ${score}/${target}\n\nYou can try again... but maybe take a break first? 😅`);
    }
}

function updateScore() {
    document.getElementById('score').textContent = 
        `Score: ${score} | Moves: ${moves} | Target: ${target}`;
}

function startGame() {
    initGrid();
    score = 0;
    moves = 30;
    target = 1000;
    playTime = 0;
    gameRunning = true;
    gameStartTime = Date.now();
    selected = null;
    particles = [];
    animatingGems = [];
    
    // Initialize audio context on first user interaction
    initAudioContext();
    
    document.getElementById('status').textContent = 'WARNING: Addictive! Play responsibly!';
    updateScore();
    
    // Start animation loop
    draw();
    
    // Track play time (for warnings)
    clearInterval(playTimer);
    playTimer = setInterval(() => {
        playTime++;
        if (playTime === 1800) { // 30 minutes
            alert('WARNING: You\'ve been playing 30 minutes! Consider taking a break.');
        }
        if (playTime === 3600) { // 60 minutes
            alert('WARNING: ONE HOUR! Seriously, take a break!');
        }
    }, 1000);
}

// Initialize canvas on page load
window.addEventListener('load', () => {
    if (!initCanvas()) {
        console.error('Failed to initialize canvas!');
        return;
    }
    
    // Initialize grid for preview
    initGrid();
    
    // Draw initial state
    draw();
    
    // Overlay message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click Start to Play!', canvas.width/2, canvas.height/2);
    ctx.font = '20px Arial';
    ctx.fillText('WARNING: Highly Addictive!', canvas.width/2, canvas.height/2 + 40);
    
    // Add click listener
    canvas.addEventListener('click', handleClick);
});

// Also try to initialize if DOM is already ready
if (document.readyState === 'loading') {
    // Wait for load event
} else {
    // DOM already ready, initialize now
    setTimeout(() => {
        if (!canvas && initCanvas()) {
            initGrid();
            draw();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click Start to Play!', canvas.width/2, canvas.height/2);
            canvas.addEventListener('click', handleClick);
        }
    }, 100);
}

