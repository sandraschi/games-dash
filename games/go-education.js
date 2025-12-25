// Go Education System
// **Timestamp**: 2025-12-03

let famousGames = [];
let encyclopediaContent = {};

// Load famous games
async function loadFamousGames() {
    try {
        console.log('Fetching famous Go games...');
        const response = await fetch('data/go/famous-games.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Famous Go games loaded:', data.games.length);
        famousGames = data.games;
        renderGamesList();
    } catch (error) {
        console.error('Failed to load famous games:', error);
        const list = document.getElementById('gamesList');
        if (list) {
            list.innerHTML = `<p style="color: #FF6B6B;">Error: ${error.message}</p>`;
        }
    }
}

function renderGamesList() {
    const list = document.getElementById('gamesList');
    list.innerHTML = '';
    
    famousGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card-item';
        card.innerHTML = `
            <h3>${game.name}</h3>
            <p><strong>${game.black}</strong> (Black) vs <strong>${game.white}</strong> (White)</p>
            <p>${game.date} | ${game.event}</p>
            <p>${game.description}</p>
            <div class="status">
                <span class="badge">${game.difficulty}</span>
                ${game.themes.map(t => `<span class="badge">#${t}</span>`).join(' ')}
            </div>
        `;
        card.onclick = () => showGameDetails(game);
        list.appendChild(card);
    });
}

function showGameDetails(game) {
    const tab = document.getElementById('famous-tab');
    tab.innerHTML = `
        <button onclick="loadFamousGames(); renderGamesList();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(76, 175, 80, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Games</button>
        
        <h2>${game.name}</h2>
        <div style="margin: 20px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
            <p><strong>${game.black}</strong> (Black) vs <strong>${game.white}</strong> (White)</p>
            <p><strong>Date:</strong> ${game.date}</p>
            <p><strong>Event:</strong> ${game.event}</p>
            <p><strong>Result:</strong> ${game.result}</p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background: rgba(76, 175, 80, 0.1); border-left: 4px solid #4CAF50; border-radius: 5px;">
            <h3 style="color: #4CAF50;">Game Story</h3>
            <p style="white-space: pre-line; line-height: 1.8;">${game.description}</p>
        </div>
        
        <div style="margin: 30px 0;">
            <h3 style="color: #4CAF50;">Key Moments</h3>
            ${Object.entries(game.keyMoments || {}).map(([key, value]) => `
                <div style="margin: 15px 0; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <strong style="color: #FFD700;">${key.replace('_', ' ').toUpperCase()}:</strong>
                    <p style="margin-top: 10px;">${value}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Load encyclopedia
async function loadEncyclopedia() {
    console.log('Loading Go encyclopedia...');
    const files = ['rules-basics'];
    
    for (const file of files) {
        try {
            const response = await fetch(`data/go/encyclopedia/${file}.json`);
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
    
    console.log('Go encyclopedia articles loaded:', Object.keys(encyclopediaContent).length);
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
        <button onclick="loadEncyclopedia(); renderEncyclopedia();" style="margin-bottom: 20px; padding: 10px 20px; background: rgba(76, 175, 80, 0.3); border: none; color: white; border-radius: 5px; cursor: pointer;">← Back to Encyclopedia</button>
        <h2>${data.title}</h2>
        ${data.sections.map(section => `
            <div style="margin: 30px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                <h3 style="color: #4CAF50; margin-bottom: 15px;">${section.title}</h3>
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
    console.log('Loading Go education content...');
    loadFamousGames();
    loadEncyclopedia();
});

