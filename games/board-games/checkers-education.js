// Interactive Demos for Checkers Education
// **Timestamp**: 2025-12-03

// Demo 1: Basic Capture Demonstration
function createCaptureDemo() {
    const captureDemo = document.getElementById('captureDemo');
    if (!captureDemo) return;

    const demoPosition = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '⚫', '', '', '', ''],
        ['', '', '🔴', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
    ];

    demoPosition.forEach((row, r) => {
        row.forEach((piece, c) => {
            const square = document.createElement('div');
            square.className = 'demo-square';
            if ((r + c) % 2 === 1) {
                square.classList.add('dark');
            } else {
                square.classList.add('light');
            }
            square.textContent = piece;
            captureDemo.appendChild(square);
        });
    });

    // Animate the capture
    setTimeout(() => {
        const squares = captureDemo.children;
        squares[26].classList.add('highlight'); // Red piece
        setTimeout(() => {
            squares[19].classList.add('highlight'); // Black piece (being captured)
            setTimeout(() => {
                squares[26].textContent = ''; // Red leaves
                squares[12].textContent = '🔴'; // Red arrives
                squares[12].classList.add('highlight');
                squares[19].textContent = ''; // Black disappears
                squares[19].classList.remove('highlight');
                squares[26].classList.remove('highlight');
            }, 500);
        }, 500);
    }, 1000);
}

// Demo 2: Double Jump Demonstration
function createDoubleJumpDemo() {
    const demo = document.getElementById('doubleJumpDemo');
    if (!demo) return;

    const board = document.createElement('div');
    board.className = 'demo-board';
    board.style.marginTop = '20px';

    // Setup position with multiple captures available
    const position = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '⚫', '', '⚫', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '⚫', '', '', '', ''],
        ['', '', '🔴', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
    ];

    position.forEach((row, r) => {
        row.forEach((piece, c) => {
            const square = document.createElement('div');
            square.className = 'demo-square';
            if ((r + c) % 2 === 1) {
                square.classList.add('dark');
            } else {
                square.classList.add('light');
            }
            square.textContent = piece;
            board.appendChild(square);
        });
    });

    demo.appendChild(board);

    // Add description
    const desc = document.createElement('p');
    desc.style.textAlign = 'center';
    desc.style.color = '#FFD700';
    desc.style.marginTop = '10px';
    desc.textContent = 'Red can make a double jump: capture first black, then second black!';
    demo.appendChild(desc);
}

// Demo 3: King Movement
function createKingDemo() {
    const demo = document.getElementById('kingDemo');
    if (!demo) return;

    const board = document.createElement('div');
    board.className = 'demo-board';

    // King in center with movement options
    const position = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '👑', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '']
    ];

    position.forEach((row, r) => {
        row.forEach((piece, c) => {
            const square = document.createElement('div');
            square.className = 'demo-square';
            if ((r + c) % 2 === 1) {
                square.classList.add('dark');
            } else {
                square.classList.add('light');
            }
            square.textContent = piece;
            
            // Highlight valid king moves
            if (r === 3 && c === 3) {
                square.style.border = '3px solid gold';
            }
            // Show possible moves
            if ((r === 2 && c === 2) || (r === 2 && c === 4) || 
                (r === 4 && c === 2) || (r === 4 && c === 4)) {
                square.style.background = 'rgba(255, 215, 0, 0.3)';
                square.textContent = '✨';
            }
            
            board.appendChild(square);
        });
    });

    demo.appendChild(board);
}

// Initialize all demos
document.addEventListener('DOMContentLoaded', () => {
    createCaptureDemo();
    createDoubleJumpDemo();
    createKingDemo();
});

