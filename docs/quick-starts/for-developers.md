# 👨‍💻 Developer's Quick Start Guide

**Get coding on the games collection in 10 minutes!** This guide helps developers set up the development environment and start contributing.

## 🔧 Development Environment Setup

### Prerequisites
- **Python 3.8+** (for AI backend servers)
- **Node.js 18+** (for testing and development)
- **Git** (for version control)
- **Modern browser** (Chrome/Firefox/Edge)

### Step 1: Clone the Repository
```powershell
# Clone the games repository
git clone https://github.com/your-org/ai-games-collection.git
cd ai-games-collection

# Verify you have the code
ls  # Should see: games/, backend/, docs/, etc.
```

### Step 2: Install Dependencies
```powershell
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (for testing)
npm install

# Verify installations
python --version  # Should be 3.8+
node --version    # Should be 18+
npm --version     # Should be 8+
```

### Step 3: Start Development Servers
```powershell
# Terminal 1: Start AI backend servers (Windows only)
.\START_ALL_SERVERS.ps1

# Terminal 2: Start web development server
python -m http.server 9876

# Or use the all-in-one starter
.\START_EVERYTHING.ps1
```

### Step 4: Verify Everything Works
1. Open `http://localhost:9876` in your browser
2. Try playing a simple game (Tic-Tac-Toe, Snake)
3. Test AI functionality (Chess, Go)
4. Run the test suite: `npm test`

## 🏗️ Project Architecture

### Frontend (Web Games)
```
games/                    # 75+ individual game implementations
├── chess.html           # Chess game interface
├── tetris.html          # Tetris game
├── sudoku.html          # Sudoku puzzle
└── [game-name].html     # Each game is a separate HTML file

js/                      # Shared JavaScript modules
├── achievements.js      # Achievement system
├── game-stats.js        # Statistics tracking
├── multiplayer/         # Multiplayer logic
└── core/               # Core game engine
```

### Backend (AI Servers)
```
backend/                 # Python AI server implementations
├── stockfish-server.py  # Chess AI (port 9543)
├── shogi-server.py      # Shogi AI (port 9544)
├── go-server.py         # Go AI (port 9545)
├── multiplayer-server.py # WebSocket multiplayer (port 9877)
└── sound-service.py     # Audio generation (port 9878)
```

### Development Tools
```
tests/                   # Comprehensive test suite
├── chess.test.js       # Chess game tests
├── tetris.test.js      # Tetris tests
├── *.test.js           # Tests for each game

scripts/                # Development utilities
├── generate-game-tests.ps1 # Auto-generate test files
└── update-examples.py  # Update example games
```

## 🎮 Adding a New Game

### Quick Game Template
1. **Copy an existing simple game** (like Tic-Tac-Toe)
2. **Modify the game logic** in the HTML file
3. **Add tests** in the `tests/` directory
4. **Update navigation** in `index.html`

### Example: Adding a Simple Puzzle Game
```html
<!-- games/simple-puzzle.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Simple Puzzle</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <div class="game-container">
        <h1>Simple Puzzle</h1>
        <div id="game-board"></div>
        <div class="controls">
            <button id="new-game">New Game</button>
            <div id="score">Score: 0</div>
        </div>
    </div>

    <script>
        // Game logic here
        class SimplePuzzle {
            constructor() {
                this.score = 0;
                this.init();
            }

            init() {
                // Initialize game
                this.createBoard();
                this.bindEvents();
            }

            createBoard() {
                // Create game board
                const board = document.getElementById('game-board');
                // ... game board creation logic
            }

            bindEvents() {
                // Bind event listeners
                document.getElementById('new-game').addEventListener('click', () => {
                    this.reset();
                });
            }

            reset() {
                // Reset game state
                this.score = 0;
                this.updateScore();
                // ... reset logic
            }

            updateScore() {
                document.getElementById('score').textContent = `Score: ${this.score}`;
            }
        }

        // Start game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new SimplePuzzle();
        });
    </script>
</body>
</html>
```

### Adding Tests
```javascript
// tests/simple-puzzle.test.js
import { expect } from 'chai';

describe('Simple Puzzle Game', () => {
    it('should initialize correctly', () => {
        // Test initialization
    });

    it('should handle user interactions', () => {
        // Test game interactions
    });

    it('should track score properly', () => {
        // Test scoring system
    });
});
```

## 🤖 Working with AI Backends

### Connecting to AI Servers
```javascript
// Example: Connecting to chess AI
class ChessGame {
    async getAIMove(fen) {
        try {
            const response = await fetch('/api/stockfish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fen: fen,
                    depth: 15
                })
            });

            const data = await response.json();
            return data.move;
        } catch (error) {
            console.error('AI move failed:', error);
            return null;
        }
    }
}
```

### AI Server Architecture
- **Stockfish** (Chess): Classical engine with neural network evaluation
- **KataGo** (Go): Neural network-based Go engine
- **YaneuraOu** (Shogi): Japanese chess engine
- **Custom Algorithms**: Minimax, alpha-beta pruning for simpler games

## 🧪 Testing & Quality Assurance

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (auto-re-run on changes)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

### Code Quality
```bash
# Python linting (catches 42+ types of errors)
pip install ruff
ruff check .  # Lint all Python files
ruff format . # Auto-format code

# JavaScript testing
npm run test:unit     # Unit tests
npm run test:e2e      # End-to-end tests
```

### Browser Testing
- **Manual testing**: Open games in different browsers
- **Device testing**: Test on mobile devices
- **Performance testing**: Use browser dev tools
- **Accessibility testing**: Screen reader compatibility

## 🚀 Deployment & Distribution

### Local Development
```bash
# Start all services for development
.\START_EVERYTHING.ps1

# Or individual services
.\START_ALL_SERVERS.ps1  # AI engines
python -m http.server 9876  # Web server
```

### Production Deployment
```bash
# Docker deployment (recommended)
docker compose up --build -d

# Manual deployment
pip install -r requirements.txt
python stockfish-server.py &
python go-server.py &
python -m http.server 9876
```

### Remote Access Setup
```bash
# Allow firewall access for remote play
New-NetFirewallRule -DisplayName "Games Remote Access" -Direction Inbound -Protocol TCP -LocalPort 9876,9543-9545,9877 -Action Allow

# Find your IP for remote access
ipconfig | findstr "IPv4"
```

## 🐛 Debugging & Troubleshooting

### Common Development Issues

**"AI servers not responding"**
```bash
# Check if servers are running
Get-Process python

# Check server logs (look for error messages)
# Restart servers
.\START_ALL_SERVERS.ps1
```

**"Games not loading"**
```bash
# Check web server
python -m http.server 9876

# Check browser console for JavaScript errors
# Verify file paths in game HTML files
```

**"Tests failing"**
```bash
# Run specific test
npm test -- --grep "test name"

# Debug with browser dev tools
# Check test file syntax
```

### Development Tools
- **Browser DevTools**: F12 for debugging
- **Console logging**: `console.log()` for debugging
- **Network tab**: Check API calls
- **Performance tab**: Identify bottlenecks

## 📋 Development Workflow

### Daily Development Cycle
1. **Pull latest changes**: `git pull`
2. **Start development servers**: `.\START_EVERYTHING.ps1`
3. **Make changes**: Edit code, add features
4. **Test changes**: Run tests, manual testing
5. **Commit changes**: `git add . && git commit -m "description"`
6. **Push changes**: `git push`

### Contributing Guidelines
1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Write tests** for new functionality
4. **Ensure code quality**: Run linting and tests
5. **Submit a pull request** with description

### Code Standards
- **Python**: Follow PEP 8, use type hints
- **JavaScript**: Use modern ES6+ syntax
- **HTML/CSS**: Semantic markup, responsive design
- **Testing**: 80%+ code coverage target
- **Documentation**: Update docs for new features

## 🎯 Getting Help

### Documentation Resources
- **[Technical Architecture](../development/TECHNICAL.md)**: System design details
- **[How It Was Built](../development/HOW_THIS_IS_BUILT.md)**: Development methodology
- **[API Documentation](../development/TECHNICAL.md#api-documentation)**: Backend APIs

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and help
- **Code Reviews**: Learn from existing code patterns

### Development Tips
- **Start small**: Add simple features first
- **Test early**: Write tests before implementing
- **Follow patterns**: Study existing games for consistency
- **Ask questions**: Don't hesitate to ask for help

---

**Ready to contribute?** The games collection welcomes developers of all skill levels. Whether you want to add a new game, improve existing ones, or enhance the AI - your contributions are valuable!

**Happy coding!** 👨‍💻✨
