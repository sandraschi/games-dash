// Theme Switcher for Games Collection
// **Timestamp**: 2025-12-05

const themes = {
    default: {
        name: 'Default Purple',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    darkBlue: {
        name: 'Dark Blue',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    },
    darkerBlue: {
        name: 'Darker Blue',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
    },
    midnight: {
        name: 'Midnight',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
    },
    ocean: {
        name: 'Ocean Deep',
        background: 'linear-gradient(135deg, #0a1929 0%, #1a365d 50%, #2d4a7c 100%)'
    },
    forest: {
        name: 'Forest',
        background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
    },
    sunset: {
        name: 'Sunset',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    dark: {
        name: 'Dark Mode',
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
    }
};

let currentTheme = 'default';

function initTheme() {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('gamesTheme');
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
    }
    applyTheme(currentTheme);
    updateThemeSelector();
}

function applyTheme(themeName) {
    if (!themes[themeName]) return;
    
    currentTheme = themeName;
    const theme = themes[themeName];
    
    // Apply to body
    document.body.style.background = theme.background;
    
    // Save to localStorage
    localStorage.setItem('gamesTheme', themeName);
    
    // Update selector if it exists
    updateThemeSelector();
}

function updateThemeSelector() {
    const selector = document.getElementById('themeSelector');
    if (selector) {
        selector.value = currentTheme;
    }
}

function createThemeSelector() {
    // If selector already exists in HTML, just update it
    const existingSelector = document.getElementById('themeSelector');
    if (existingSelector) {
        // Add event listener if not already added
        if (!existingSelector.hasAttribute('data-listener-added')) {
            existingSelector.addEventListener('change', (e) => applyTheme(e.target.value));
            existingSelector.setAttribute('data-listener-added', 'true');
        }
        updateThemeSelector();
        return;
    }
    
    // Otherwise, create it dynamically for pages that don't have it in HTML
    const header = document.querySelector('header');
    const gameHeader = document.querySelector('.game-header');
    
    let insertTarget = null;
    let insertPosition = 'after';
    
    if (header) {
        insertTarget = header;
    } else if (gameHeader) {
        insertTarget = gameHeader;
    } else {
        // Try to find container or first element
        const container = document.querySelector('.container, .game-container');
        if (container && container.firstChild) {
            insertTarget = container.firstChild;
            insertPosition = 'before';
        }
    }
    
    if (!insertTarget) return;
    
    const themeContainer = document.createElement('div');
    themeContainer.style.cssText = 'text-align: center; margin: 15px 0; padding: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 10px; border: 2px solid rgba(255, 255, 255, 0.2);';
    
    const label = document.createElement('label');
    label.style.cssText = 'color: #FFD700; font-weight: bold; margin-right: 10px;';
    label.textContent = '🎨 Theme:';
    label.setAttribute('for', 'themeSelector');
    
    const select = document.createElement('select');
    select.id = 'themeSelector';
    select.style.cssText = 'padding: 8px 15px; font-size: 0.95em; border-radius: 8px; background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.3); color: #fff; cursor: pointer;';
    select.addEventListener('change', (e) => applyTheme(e.target.value));
    
    // Add theme options
    Object.keys(themes).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = themes[key].name;
        select.appendChild(option);
    });
    
    themeContainer.appendChild(label);
    themeContainer.appendChild(select);
    
    // Insert in appropriate location
    if (insertPosition === 'after') {
        insertTarget.parentNode.insertBefore(themeContainer, insertTarget.nextSibling);
    } else {
        insertTarget.parentNode.insertBefore(themeContainer, insertTarget);
    }
    
    // Set current selection
    updateThemeSelector();
}

// Initialize when DOM is ready
function initializeThemeSwitcher() {
    initTheme();
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        createThemeSelector();
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeThemeSwitcher);
} else {
    initializeThemeSwitcher();
}

// Export for use in other pages
window.GamesTheme = {
    apply: applyTheme,
    getCurrent: () => currentTheme,
    themes: themes
};

