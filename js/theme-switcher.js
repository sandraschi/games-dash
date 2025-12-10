// Theme Switcher for Games Collection
// **Timestamp**: 2025-12-05

const themes = {
    default: {
        name: 'Purple',
        background: 'linear-gradient(135deg, #2d1b4e 0%, #3d1f5e 50%, #4a2370 100%)'
    },
    darkBlue: {
        name: 'Dark Blue',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    },
    darkerBlue: {
        name: 'Darker Blue',
        background: 'linear-gradient(135deg, #00051f 0%, #001a3d 50%, #002855 100%)'
    },
    midnight: {
        name: 'Midnight',
        background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)'
    },
    forest: {
        name: 'Forest',
        background: 'linear-gradient(135deg, #0d2818 0%, #1a4d2e 50%, #2d5a3d 100%)'
    },
    sunset: {
        name: 'Pink',
        background: 'linear-gradient(135deg, #8b1a5c 0%, #6b1a4a 50%, #4a1a3a 100%)'
    },
    dark: {
        name: 'Black',
        background: 'linear-gradient(135deg, #000000 0%, #000000 100%)'
    }
};

let currentTheme = 'dark';

function initTheme() {
    // Load saved theme from localStorage, or use dark as default
    const savedTheme = localStorage.getItem('gamesTheme');
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
    } else {
        // Default to black theme if no saved preference
        currentTheme = 'dark';
    }
    applyTheme(currentTheme);
    updateThemeSelector();
}

function applyTheme(themeName) {
    if (!themes[themeName]) return;
    
    currentTheme = themeName;
    const theme = themes[themeName];
    
    // Remove existing theme override style if it exists
    let existingOverride = document.getElementById('theme-override-style');
    if (existingOverride) {
        existingOverride.remove();
    }
    
    // Inject a style tag with !important to override body/html background only
    // Use specific selectors to avoid affecting child elements
    const styleOverride = document.createElement('style');
    styleOverride.id = 'theme-override-style';
    styleOverride.textContent = `
        html {
            background: ${theme.background} !important;
        }
        body {
            background: ${theme.background} !important;
        }
    `;
    document.head.appendChild(styleOverride);
    
    // Also apply directly to body and html for immediate effect
    if (document.body) {
        document.body.style.setProperty('background', theme.background, 'important');
    }
    if (document.documentElement) {
        document.documentElement.style.setProperty('background', theme.background, 'important');
    }
    
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
    themeContainer.className = 'theme-selector-container';
    themeContainer.style.cssText = 'text-align: center; margin: 10px 0; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); opacity: 0.5; transition: opacity 0.2s ease;';
    
    // Make container more visible on hover
    themeContainer.addEventListener('mouseenter', () => {
        themeContainer.style.opacity = '0.75';
    });
    themeContainer.addEventListener('mouseleave', () => {
        themeContainer.style.opacity = '0.5';
    });
    
    const label = document.createElement('label');
    label.style.cssText = 'color: #FFD700; font-weight: normal; margin-right: 8px; font-size: 0.85em; opacity: 0.7;';
    label.textContent = '🎨 Theme:';
    label.setAttribute('for', 'themeSelector');
    
    const select = document.createElement('select');
    select.id = 'themeSelector';
    select.style.cssText = 'padding: 6px 12px; font-size: 0.85em; border-radius: 6px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.15); color: #FFD700; cursor: pointer; opacity: 0.8;';
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

