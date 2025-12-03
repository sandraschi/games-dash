// Gomoku Education System
// **Timestamp**: 2025-12-03

let patterns = [];
let encyclopediaContent = {};

// Load tactical patterns
async function loadPatterns() {
    try {
        console.log('Fetching Gomoku tactical patterns...');
        const response = await fetch('data/gomoku/famous-patterns.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Patterns loaded:', data.patterns.length);
        patterns = data.patterns;
        renderPatterns();
    } catch (error) {
        console.error('Failed to load patterns:', error);
        const list = document.getElementById('patternsList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error: ${error.message}</p>`;
        }
    }
}

function renderPatterns() {
    const list = document.getElementById('patternsList');
    list.innerHTML = '';
    
    patterns.forEach(pattern => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${pattern.name}</h3>
            <p>${pattern.description}</p>
            <div class="status">
                <span class="badge">${pattern.difficulty}</span>
            </div>
        `;
        card.onclick = () => showPatternDetails(pattern);
        list.appendChild(card);
    });
}

function showPatternDetails(pattern) {
    const tab = document.getElementById('patterns-tab');
    tab.innerHTML = `
        <button onclick="loadPatterns(); renderPatterns();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(255, 193, 7, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Patterns</button>
        
        <h2>${pattern.name}</h2>
        
        <div style="margin: 20px 0; padding: 20px; background: rgba(255, 193, 7, 0.1); border-left: 4px solid #FFC107; border-radius: 5px;">
            <h3 style="color: #FFC107;">Description</h3>
            <p style="white-space: pre-line; line-height: 1.8;">${pattern.description}</p>
        </div>
        
        ${pattern.example ? `
            <div style="margin: 20px 0; padding: 20px; background: rgba(76, 175, 80, 0.1); border-left: 4px solid #4CAF50; border-radius: 5px;">
                <h3 style="color: #4CAF50;">Example</h3>
                <p style="white-space: pre-line; line-height: 1.8;">${pattern.example}</p>
            </div>
        ` : ''}
        
        <div style="margin: 20px 0; padding: 20px; background: rgba(33, 150, 243, 0.1); border-left: 4px solid #2196F3; border-radius: 5px;">
            <h3 style="color: #2196F3;">Key Technique</h3>
            <p style="white-space: pre-line; line-height: 1.8;">${pattern.keyTechnique}</p>
        </div>
        
        ${pattern.moves ? `
            <div style="margin: 20px 0; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                <strong>Example Moves:</strong> ${pattern.moves.join(' → ')}
            </div>
        ` : ''}
    `;
}

// Load encyclopedia
async function loadEncyclopedia() {
    console.log('Loading Gomoku encyclopedia...');
    const files = ['rules-strategy'];
    
    for (const file of files) {
        try {
            const response = await fetch(`data/gomoku/encyclopedia/${file}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            encyclopediaContent[file] = data;
            console.log(`Loaded ${file}:`, data.title);
        } catch (error) {
            console.error(`Failed to load ${file}:`, error);
        }
    }
    
    console.log('Gomoku encyclopedia articles loaded:', Object.keys(encyclopediaContent).length);
    renderEncyclopedia();
}

function renderEncyclopedia() {
    const content = document.getElementById('encyclopediaList');
    
    if (Object.keys(encyclopediaContent).length === 0) {
        content.innerHTML = '<p style="color: #FF6B6B;">Encyclopedia content not found.</p>';
        return;
    }
    
    content.innerHTML = '';
    
    Object.entries(encyclopediaContent).forEach(([key, data]) => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${data.title}</h3>
            <p>Click to read full article</p>
            <span class="badge">${data.sections ? data.sections.length : 0} sections</span>
        `;
        card.onclick = () => showEncyclopediaArticle(key);
        content.appendChild(card);
    });
}

function showEncyclopediaArticle(key) {
    const data = encyclopediaContent[key];
    if (!data) return;
    
    const tab = document.getElementById('encyclopedia-tab');
    tab.innerHTML = `
        <button onclick="loadEncyclopedia(); renderEncyclopedia();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(255, 193, 7, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Encyclopedia</button>
        <h2>${data.title}</h2>
        ${data.sections.map(section => `
            <div style="margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <h3 style="color: #FFC107; margin-bottom: 15px;">${section.title}</h3>
                <div style="white-space: pre-line; line-height: 1.8; color: #FFF;">${section.content}</div>
            </div>
        `).join('')}
    `;
}

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading Gomoku education content...');
    loadPatterns();
    loadEncyclopedia();
});

