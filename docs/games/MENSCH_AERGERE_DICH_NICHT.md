# Mensch ärgere dich nicht! 🎲

**Timestamp**: 2025-12-04

## What is it?

**"Mensch, ärgere dich nicht!"** (literally "Man, don't get annoyed!") is the classic German board game - a variant of Ludo that's been a beloved childhood memory for generations. The name is perfectly apt because when you get sent back home by another player... well, you know! 😄

## Game Features

### Authentic German Layout
- **Red home** (top-left corner)
- **Yellow home** (top-right corner)
- **Green home** (bottom-left corner)
- **Blue home** (bottom-right corner)

### Board Structure
- **40 squares** on main path (10 per side)
- **5-square colored home stretch** for each player
- **Single center finish space** marked "ZIEL" (Goal)
- **Start squares** marked with arrows (→ ↑ ← ↓)
- **No safe spaces** - unlike Ludo, any square can be captured!

### Game Rules
1. Roll **6** to get a piece out of home (start)
2. Move pieces **clockwise** around the board
3. Land on opponent = **send them home!** (Mensch, ärgere dich nicht! 😄)
4. Follow your **colored path** to reach center
5. Get **all 4 pieces** to "ZIEL" to win!
6. Roll **6** = bonus turn!

## Technical Implementation

### Built with Konva.js
- Proper canvas rendering with Konva v10
- Interactive pieces with click handlers
- Smooth hover effects
- AI opponents for 3 other players

### Key Features
```javascript
// Main path: 40 squares
mainPathCoords = generateMainPath();

// Home stretch: 5 squares per color
homeStretchCoords = generateHomeStretches();

// Capture mechanic
function checkCapture(color, piece, index) {
    // Send opponents home when landing on same space
    // Only on main path (not in home stretch)
}
```

### Start Positions
- **Red**: Position 0 (middle of left edge, → arrow)
- **Green**: Position 10 (middle of bottom edge, ↑ arrow)
- **Blue**: Position 20 (middle of right edge, ↑ arrow)
- **Yellow**: Position 30 (middle of top edge, ↓ arrow)

### Home Stretch Entry
Each player enters their colored home stretch before the final lap:
- **Red**: After position 39
- **Green**: After position 9
- **Blue**: After position 19
- **Yellow**: After position 29

## Files

- **mensch.html** - Main game page with Konva.js
- **mensch.js** - Complete game logic

## How to Play

1. Open: `http://localhost:8080/mensch.html`
2. Click "New Game" to start
3. Click dice to roll
4. Click your pieces (red) to move
5. AI controls yellow, green, and blue

**Viel Glück!** (Good luck!)

## Differences from Standard Ludo

| Feature | Mensch ärgere dich nicht | Standard Ludo |
|---------|-------------------------|---------------|
| Main path | 40 squares | 52 squares |
| Home stretch | 5 colored squares | 6 colored squares |
| Safe spaces | None | 4 marked spaces |
| Corner positions | Red TL, Yellow TR, Green BL, Blue BR | Varies |
| Capture rules | Anywhere on main path | Except safe spaces |

## Why "Mensch, ärgere dich nicht!"?

The name perfectly captures the frustration of getting sent back home when you're almost at the goal! It's a reminder to stay calm and not get angry - easier said than done when your opponent rolls exactly the right number to capture you! 😄

**Fun fact**: This game has been a German household staple since 1914, making it over 100 years old!

## Verification

✅ Konva.js loads successfully
✅ No console errors
✅ Board renders correctly:
  - 4 corner home bases with colored circles
  - 40-square main path
  - 5-square home stretches per color
  - Center "ZIEL" finish space
  - Start squares with arrows
✅ All pieces clickable
✅ Capture mechanic works
✅ AI opponents functional
✅ Win detection active

**Das Spiel funktioniert perfekt!** 🎉

