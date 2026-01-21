// Interactive Demos for Sudoku Education
// **Timestamp**: 2025-12-03

// Demo 1: Naked Singles Interactive
function createNakedSingleDemo() {
    const demo = document.getElementById('nakedSingleDemo');
    if (!demo) return;

    const container = document.createElement('div');
    container.style.background = 'rgba(76, 175, 80, 0.1)';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';
    container.style.margin = '20px 0';

    container.innerHTML = `
        <h3 style="color: #4CAF50; margin-bottom: 15px;">🎯 Interactive: Naked Single</h3>
        <p style="margin-bottom: 15px;">This row has 1-8 already. What number goes in the empty cell?</p>
        <div id="nakedSingleGrid" style="display: grid; grid-template-columns: repeat(9, 50px); gap: 2px; margin: 20px auto; width: fit-content;"></div>
        <div style="margin-top: 20px;">
            <p id="nakedSingleFeedback" style="color: #FFD700; font-weight: bold; min-height: 30px;"></p>
            <button onclick="checkNakedSingle(9)" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">9</button>
            <button onclick="checkNakedSingle(7)" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">7</button>
            <button onclick="checkNakedSingle(5)" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px;">5</button>
        </div>
    `;

    demo.appendChild(container);

    const grid = document.getElementById('nakedSingleGrid');
    const row = [1, 2, 3, 4, 5, 6, 7, 8, '?'];
    
    row.forEach((num, idx) => {
        const cell = document.createElement('div');
        cell.style.width = '50px';
        cell.style.height = '50px';
        cell.style.background = idx === 8 ? '#FFEB3B' : '#E8F5E9';
        cell.style.color = '#000';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontWeight = 'bold';
        cell.style.fontSize = '20px';
        cell.style.border = '2px solid #333';
        cell.id = `cell-${idx}`;
        cell.textContent = num;
        grid.appendChild(cell);
    });
}

function checkNakedSingle(answer) {
    const feedback = document.getElementById('nakedSingleFeedback');
    const cell = document.getElementById('cell-8');
    
    if (answer === 9) {
        feedback.textContent = '✅ Correct! The only missing number is 9!';
        feedback.style.color = '#4CAF50';
        cell.textContent = '9';
        cell.style.background = '#81C784';
    } else {
        feedback.textContent = `❌ Not quite! ${answer} is already in the row. Try again!`;
        feedback.style.color = '#FF5252';
    }
}

// Demo 2: Hidden Singles
function createHiddenSingleDemo() {
    const demo = document.getElementById('hiddenSingleDemo');
    if (!demo) return;

    const container = document.createElement('div');
    container.style.background = 'rgba(33, 150, 243, 0.1)';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';
    container.style.margin = '20px 0';

    container.innerHTML = `
        <h3 style="color: #2196F3; margin-bottom: 15px;">💎 Interactive: Hidden Single</h3>
        <p style="margin-bottom: 15px;">In this 3×3 box, where can the number 5 go?</p>
        <div id="hiddenSingleBox" style="display: grid; grid-template-columns: repeat(3, 60px); gap: 2px; margin: 20px auto; width: fit-content;"></div>
        <p id="hiddenSingleFeedback" style="color: #FFD700; font-weight: bold; margin-top: 15px; min-height: 30px;"></p>
    `;

    demo.appendChild(container);

    const box = document.getElementById('hiddenSingleBox');
    const boxData = [
        {num: 1, can5: false},
        {num: 2, can5: false},
        {num: 3, can5: false},
        {num: 4, can5: false},
        {num: '', can5: true},
        {num: 6, can5: false},
        {num: 7, can5: false},
        {num: 8, can5: false},
        {num: 9, can5: false}
    ];

    boxData.forEach((data, idx) => {
        const cell = document.createElement('div');
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.background = data.num === '' ? '#FFEB3B' : '#E3F2FD';
        cell.style.color = '#000';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontWeight = 'bold';
        cell.style.fontSize = '24px';
        cell.style.border = '2px solid #333';
        cell.style.cursor = data.can5 ? 'pointer' : 'default';
        cell.textContent = data.num;

        if (data.can5) {
            cell.addEventListener('click', () => {
                cell.textContent = '5';
                cell.style.background = '#81C784';
                document.getElementById('hiddenSingleFeedback').textContent = 
                    '✅ Correct! 5 can only go in that cell in this box!';
                document.getElementById('hiddenSingleFeedback').style.color = '#4CAF50';
            });
        }

        box.appendChild(cell);
    });
}

// Demo 3: X-Wing Pattern Visualization
function createXWingDemo() {
    const demo = document.getElementById('xwingDemo');
    if (!demo) return;

    const container = document.createElement('div');
    container.style.background = 'rgba(255, 152, 0, 0.1)';
    container.style.padding = '20px';
    container.style.borderRadius = '10px';
    container.style.margin = '20px 0';

    container.innerHTML = `
        <h3 style="color: #FF9800; margin-bottom: 15px;">🦈 X-Wing Pattern (Advanced)</h3>
        <p style="margin-bottom: 15px;">When a number forms a rectangle pattern, you can eliminate it from the columns/rows!</p>
        <svg width="300" height="300" style="margin: 20px auto; display: block;">
            <!-- Grid -->
            ${[...Array(10)].map((_, i) => `
                <line x1="${i * 30 + 30}" y1="30" x2="${i * 30 + 30}" y2="300" stroke="#666" stroke-width="1"/>
                <line x1="30" y1="${i * 30 + 30}" x2="300" y2="${i * 30 + 30}" stroke="#666" stroke-width="1"/>
            `).join('')}
            
            <!-- X-Wing pattern (4 corners highlighted) -->
            <circle cx="60" cy="60" r="10" fill="#FF5252" opacity="0.7"/>
            <circle cx="240" cy="60" r="10" fill="#FF5252" opacity="0.7"/>
            <circle cx="60" cy="180" r="10" fill="#FF5252" opacity="0.7"/>
            <circle cx="240" cy="180" r="10" fill="#FF5252" opacity="0.7"/>
            
            <!-- X-Wing lines -->
            <line x1="60" y1="60" x2="240" y2="60" stroke="#FF5252" stroke-width="3" opacity="0.5"/>
            <line x1="60" y1="180" x2="240" y2="180" stroke="#FF5252" stroke-width="3" opacity="0.5"/>
            <line x1="60" y1="60" x2="60" y2="180" stroke="#2196F3" stroke-width="3" opacity="0.5"/>
            <line x1="240" y1="60" x2="240" y2="180" stroke="#2196F3" stroke-width="3" opacity="0.5"/>
        </svg>
        <p style="text-align: center; color: #FFD700;">
            Red circles form an X-Wing! Eliminate candidates from blue columns.
        </p>
    `;

    demo.appendChild(container);
}

// Initialize all demos
document.addEventListener('DOMContentLoaded', () => {
    createNakedSingleDemo();
    createHiddenSingleDemo();
    createXWingDemo();
});

