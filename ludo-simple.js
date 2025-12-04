// Ludo - Simple Canvas Version That WORKS
// **Timestamp**: 2025-12-04

const canvas = document.getElementById('ludoCanvas');
const ctx = canvas.getContext('2d');

let pieces = {
    red: [{x: 100, y: 600, home: true}, {x: 150, y: 600, home: true}, {x: 100, y: 650, home: true}, {x: 150, y: 650, home: true}],
    blue: [{x: 550, y: 600, home: true}, {x: 600, y: 600, home: true}, {x: 550, y: 650, home: true}, {x: 600, y: 650, home: true}],
    green: [{x: 100, y: 50, home: true}, {x: 150, y: 50, home: true}, {x: 100, y: 100, home: true}, {x: 150, y: 100, home: true}],
    yellow: [{x: 550, y: 50, home: true}, {x: 600, y: 50, home: true}, {x: 550, y: 100, home: true}, {x: 600, y: 100, home: true}]
};

let currentPlayer = 'red';
let diceValue = 0;

function newGame() {
    pieces = {
        red: [{x: 100, y: 600, home: true}, {x: 150, y: 600, home: true}, {x: 100, y: 650, home: true}, {x: 150, y: 650, home: true}],
        blue: [{x: 550, y: 600, home: true}, {x: 600, y: 600, home: true}, {x: 550, y: 650, home: true}, {x: 600, y: 650, home: true}],
        green: [{x: 100, y: 50, home: true}, {x: 150, y: 50, home: true}, {x: 100, y: 100, home: true}, {x: 150, y: 100, home: true}],
        yellow: [{x: 550, y: 50, home: true}, {x: 600, y: 50, home: true}, {x: 550, y: 100, home: true}, {x: 600, y: 100, home: true}]
    };
    currentPlayer = 'red';
    diceValue = 0;
    draw();
}

function rollDice() {
    diceValue = Math.floor(Math.random() * 6) + 1;
    document.getElementById('status').textContent = `Rolled ${diceValue}! Click a ${currentPlayer} piece to move.`;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw home bases (small, rounded, in corners)
    const homeConfigs = [
        {color: '#FF6B6B', x: 20, y: 520, label: 'RED'},
        {color: '#4ECDC4', x: 520, y: 520, label: 'BLUE'},
        {color: '#95E1D3', x: 20, y: 20, label: 'GREEN'},
        {color: '#FFD93D', x: 520, y: 20, label: 'YELLOW'}
    ];
    
    homeConfigs.forEach(home => {
        ctx.fillStyle = home.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        roundRect(ctx, home.x, home.y, 160, 160, 15);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(home.label, home.x + 80, home.y + 15);
    });
    
    // Draw cross path (simplified - just outline for now)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    
    // Horizontal bars
    ctx.fillRect(20, 280, 660, 44);
    ctx.fillRect(20, 376, 660, 44);
    
    // Vertical bars
    ctx.fillRect(280, 20, 44, 660);
    ctx.fillRect(376, 20, 44, 660);
    
    // Center victory square
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(350, 350, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', 350, 350);
    
    // Draw pieces
    Object.keys(pieces).forEach(color => {
        const colorHex = {red: '#FF0000', blue: '#0000FF', green: '#00FF00', yellow: '#FFFF00'}[color];
        
        pieces[color].forEach((piece, index) => {
            ctx.fillStyle = colorHex;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(piece.x, piece.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    });
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Initialize
draw();

