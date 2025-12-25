// Interactive Demos for Mühle Education
// **Timestamp**: 2025-12-03

// Demo 1: Mill Formation
function createMillDemo() {
    const demo = document.getElementById('millDemo');
    if (!demo) return;

    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.innerHTML = `
        <div style="background: rgba(76, 175, 80, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #4CAF50; margin-bottom: 15px;">🎯 Interactive Mill Formation</h3>
            <p style="margin-bottom: 15px;">Click the positions to form a mill (3 in a row)!</p>
            <canvas id="muhleCanvas" width="400" height="400" style="border: 2px solid #8B4513; border-radius: 10px; background: #DEB887; cursor: pointer;"></canvas>
            <p id="millStatus" style="margin-top: 15px; font-weight: bold; color: #FFD700;">Place your first piece...</p>
            <button onclick="resetMillDemo()" style="margin-top: 10px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Reset Demo</button>
        </div>
    `;
    demo.appendChild(container);

    initializeMuhleCanvas();
}

// Mühle board positions (24 points)
const muhlePositions = [
    // Outer square
    {x: 50, y: 50}, {x: 200, y: 50}, {x: 350, y: 50},
    {x: 50, y: 200}, {x: 350, y: 200},
    {x: 50, y: 350}, {x: 200, y: 350}, {x: 350, y: 350},
    // Middle square
    {x: 100, y: 100}, {x: 200, y: 100}, {x: 300, y: 100},
    {x: 100, y: 200}, {x: 300, y: 200},
    {x: 100, y: 300}, {x: 200, y: 300}, {x: 300, y: 300},
    // Inner square
    {x: 150, y: 150}, {x: 200, y: 150}, {x: 250, y: 150},
    {x: 150, y: 200}, {x: 250, y: 200},
    {x: 150, y: 250}, {x: 200, y: 250}, {x: 250, y: 250}
];

let placedPieces = [];

function initializeMuhleCanvas() {
    const canvas = document.getElementById('muhleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    drawMuhleBoard(ctx);

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find nearest position
        let nearest = null;
        let minDist = 30;

        muhlePositions.forEach((pos, idx) => {
            const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
            if (dist < minDist && !placedPieces.includes(idx)) {
                minDist = dist;
                nearest = idx;
            }
        });

        if (nearest !== null) {
            placedPieces.push(nearest);
            drawMuhleBoard(ctx);
            checkMill();
        }
    });
}

function drawMuhleBoard(ctx) {
    ctx.clearRect(0, 0, 400, 400);

    // Draw board lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Outer square
    ctx.strokeRect(50, 50, 300, 300);
    // Middle square
    ctx.strokeRect(100, 100, 200, 200);
    // Inner square
    ctx.strokeRect(150, 150, 100, 100);

    // Connecting lines
    ctx.beginPath();
    ctx.moveTo(200, 50); ctx.lineTo(200, 150);
    ctx.moveTo(200, 250); ctx.lineTo(200, 350);
    ctx.moveTo(50, 200); ctx.lineTo(150, 200);
    ctx.moveTo(250, 200); ctx.lineTo(350, 200);
    ctx.stroke();

    // Draw positions
    muhlePositions.forEach((pos, idx) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = placedPieces.includes(idx) ? '#DC143C' : '#F5DEB3';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
    });
}

function checkMill() {
    const mills = [
        [0,1,2], [3,0,5], [5,6,7], [2,4,7], // Outer
        [8,9,10], [11,8,13], [13,14,15], [10,12,15], // Middle
        [16,17,18], [19,16,21], [21,22,23], [18,20,23], // Inner
        [0,8,16], [2,10,18], [5,13,21], [7,15,23] // Cross-connections
    ];

    for (const mill of mills) {
        if (mill.every(pos => placedPieces.includes(pos))) {
            document.getElementById('millStatus').innerHTML = 
                '🎉 <span style="color: #4CAF50;">MILL FORMED!</span> You can remove an opponent\'s piece!';
            return;
        }
    }

    if (placedPieces.length < 3) {
        document.getElementById('millStatus').textContent = 
            `Place ${3 - placedPieces.length} more piece(s) to form a mill...`;
    } else {
        document.getElementById('millStatus').textContent = 
            'No mill yet. Try a different pattern!';
    }
}

function resetMillDemo() {
    placedPieces = [];
    const canvas = document.getElementById('muhleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        drawMuhleBoard(ctx);
    }
    document.getElementById('millStatus').textContent = 'Place your first piece...';
}

// Demo 2: Three Phases Visualization
function createPhasesDemo() {
    const demo = document.getElementById('phasesDemo');
    if (!demo) return;

    // Phase progression visualization added inline in HTML
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createMillDemo();
});

