# 👨‍💻 Development Guide

Welcome! This guide helps developers understand how the Games Collection works and how to contribute new games or improvements.

## 🎯 What Makes This Project Special

### Architecture Overview
The Games Collection runs entirely in web browsers using:
- **Frontend**: HTML/CSS/JavaScript (no frameworks needed!)
- **Backend**: Python servers for AI engines
- **Multiplayer**: Real-time WebSocket connections
- **Storage**: Browser localStorage + optional server databases

### Key Technologies
- **Chess AI**: Stockfish (professional chess engine)
- **Go AI**: KataGo (world-class Go AI)
- **Shogi AI**: YaneuraOu (strong Shogi engine)
- **WebRTC**: Real-time multiplayer gaming
- **PWA**: Installable web app for mobile devices

## 🚀 Getting Started with Development

### Quick Setup (5 minutes)
```bash
# 1. Download the project
git clone https://github.com/your-org/games-app.git
cd games-app

# 2. Install dependencies
pip install -r requirements.txt
npm install

# 3. Start everything
.\START_ALL_SERVERS.ps1  # Start AI engines
python -m http.server 9876  # Start web server

# 4. Open http://localhost:9876 in your browser
```

### Development Workflow
1. **Edit Files**: Make changes to HTML/JS/CSS files
2. **Test Locally**: Refresh browser to see changes
3. **Run Tests**: `./run-tests.sh` (if available)
4. **Commit**: `git add . && git commit -m "Your changes"`
5. **Push**: `git push origin your-branch`

## 🎮 Adding New Games

### Game Structure
Each game lives in its own folder under `games/`:
```
games/
  your-game/
    index.html      # Main game page
    game.js         # Game logic
    styles.css      # Game-specific styles (optional)
    assets/         # Images, sounds, etc. (optional)
```

### Simple Game Template
```html
<!-- games/your-game/index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Your Game - Games Collection</title>
    <link rel="stylesheet" href="../../styles.css">
</head>
<body>
    <div class="container">
        <h1>Your Game</h1>
        <div id="game-board"></div>
        <div class="controls">
            <button id="new-game">New Game</button>
            <div id="score">Score: 0</div>
        </div>
    </div>

    <script src="your-game.js"></script>
</body>
</html>
```

```javascript
// games/your-game/your-game.js
class YourGame {
    constructor() {
        this.score = 0;
        this.board = document.getElementById('game-board');
        this.scoreDisplay = document.getElementById('score');

        document.getElementById('new-game').addEventListener('click', () => {
            this.newGame();
        });

        this.newGame();
    }

    newGame() {
        this.score = 0;
        this.updateDisplay();
        // Initialize your game logic here
    }

    updateDisplay() {
        this.scoreDisplay.textContent = `Score: ${this.score}`;
    }
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new YourGame();
});
```

### Adding to Main Index
1. **Add HTML**: Create your game folder and files
2. **Update index.html**: Add your game card to the appropriate category
3. **Test**: Make sure it loads and works
4. **Style**: Match the existing design patterns

Example index.html addition:
```html
<a href="games/your-game/index.html" class="game-card">
    <div class="game-icon">🎯</div>
    <h3>Your Game</h3>
    <p>Description of your game</p>
</a>
```

## 🤖 Working with AI Engines

### Chess Integration
```javascript
// Connect to Stockfish server
const stockfish = new WebSocket('ws://localhost:8080');

stockfish.onmessage = (event) => {
    const move = parseStockfishMove(event.data);
    makeMove(move);
};

function getBestMove(fen) {
    stockfish.send(`position fen ${fen}`);
    stockfish.send('go movetime 1000'); // 1 second thinking
}
```

### Go Integration
```javascript
// Connect to KataGo server
const katago = new WebSocket('ws://localhost:8081');

function analyzePosition(sgf) {
    katago.send(`analyze ${sgf}`);
}
```

### Custom AI for Your Game
```python
# Add to backend/your_ai_server.py
from flask import Flask, request
import your_ai_library

app = Flask(__name__)

@app.route('/best-move', methods=['POST'])
def get_best_move():
    game_state = request.json['state']
    move = your_ai_library.find_best_move(game_state)
    return {'move': move}

if __name__ == '__main__':
    app.run(port=8082)
```

## 🎨 Frontend Development

### CSS Architecture
The project uses a simple, consistent CSS structure:
```css
/* Base styles */
body { font-family: Arial, sans-serif; }

/* Game-specific styles */
.game-board { display: grid; }
.game-piece { transition: all 0.3s ease; }

/* Responsive design */
@media (max-width: 768px) {
    .game-board { grid-template-columns: repeat(2, 1fr); }
}
```

### JavaScript Patterns
```javascript
// Game state management
class GameState {
    constructor() {
        this.listeners = [];
    }

    setState(newState) {
        Object.assign(this, newState);
        this.notifyListeners();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this));
    }
}

// Event handling
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case ' ': pauseGame(); break;
    }
});
```

### Mobile Optimization
```css
/* Touch-friendly controls */
.game-button {
    min-height: 44px;  /* iOS minimum touch target */
    min-width: 44px;
}

/* Responsive game boards */
.game-board {
    max-width: 100vw;
    overflow-x: auto;
}
```

## 🔧 Backend Development

### Adding New AI Servers
1. **Create Server**: Python Flask/FastAPI server
2. **Add to START_ALL_SERVERS.ps1**: Include your server startup
3. **Test Connection**: Verify WebSocket/HTTP connectivity
4. **Document**: Add to technical documentation

### Database Integration
```python
# Using SQLite for game statistics
import sqlite3

def save_game_result(game_type, result, player_score):
    conn = sqlite3.connect('games.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO game_results
        (game_type, result, player_score, timestamp)
        VALUES (?, ?, ?, datetime('now'))
    ''', (game_type, result, player_score))

    conn.commit()
    conn.close()
```

## 🧪 Testing

### Manual Testing
- **Cross-browser**: Test in Chrome, Firefox, Safari, Edge
- **Mobile**: Test on iOS Safari, Android Chrome
- **Performance**: Check on slower devices
- **Accessibility**: Keyboard navigation, screen readers

### Automated Testing
```javascript
// Basic game logic test
function testGameLogic() {
    const game = new YourGame();

    // Test initial state
    assert(game.score === 0, 'Initial score should be 0');

    // Test game mechanics
    game.makeMove('valid-move');
    assert(game.score > 0, 'Valid move should increase score');
}
```

## 🚀 Deployment & Distribution

### Building for Production
```bash
# Minify and optimize assets
npm run build

# Create production package
python create_release.py

# Test production build locally
python -m http.server 9876 --directory dist/
```

### Contributing to Main Project
1. **Fork**: Create your fork on GitHub
2. **Branch**: `git checkout -b feature/your-game`
3. **Develop**: Implement your game/feature
4. **Test**: Ensure everything works
5. **Document**: Update README and docs
6. **Pull Request**: Submit for review

## 📚 Learning Resources

### Recommended Skills
- **HTML/CSS**: Basic web development
- **JavaScript**: Game logic and interactivity
- **Python**: Backend AI servers (optional)
- **WebSockets**: Real-time communication (optional)

### Helpful Links
- **[MDN Web Docs](https://developer.mozilla.org/)**: JavaScript/HTML/CSS reference
- **[Game Development Patterns](https://gameprogrammingpatterns.com/)**: Game architecture
- **[WebSockets Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)**: Real-time communication
- **[PWA Guide](https://developers.google.com/web/progressive-web-apps)**: Mobile app features

## 🆘 Getting Help

### Common Development Issues

**"Game doesn't load"**
- Check browser console for JavaScript errors
- Verify file paths are correct
- Test with simple HTML first

**"AI server connection fails"**
- Check if server is running: `netstat -an | find "8080"`
- Verify WebSocket URL is correct
- Test server directly with curl/Postman

**"Mobile layout broken"**
- Add responsive CSS with media queries
- Test touch events vs mouse events
- Check viewport meta tag

### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Pull Request Discussions**: Code review feedback
- **Documentation**: Technical guides and API references

---

Happy coding! 🎮 The Games Collection is all about making game development accessible and fun. Don't hesitate to experiment and contribute your ideas!