# Test Suite

This directory contains automated tests for the games app.

## 🚨 **CRITICAL: Massive Testing Gap**

**Current Status:**
- ✅ **188 HTML game files** exist
- ❌ **Only 10 test files** (5.3% coverage)
- ❌ **178 games completely untested**
- ❌ **No integration or E2E tests**

**Impact:**
- Bugs can be introduced in any of the 178 untested games
- Refactoring is risky without test coverage
- Multiplayer features lack validation
- AI opponents have no automated testing

## 📖 **Comprehensive Testing Strategy**

See [`TESTING_STRATEGY.md`](TESTING_STRATEGY.md) for the complete 16-week testing roadmap covering:
- All 188 games organized by priority
- Unit, integration, and E2E testing frameworks
- Performance and accessibility testing
- CI/CD pipeline setup

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-runs on file changes)
npm run test:ui       # Visual test UI
npm run test:coverage # Generate coverage report
```

## Quick Start: Generate Missing Tests

Use the automated test generator for games missing tests:

```powershell
# Generate tests for all games missing coverage
.\scripts\generate-game-tests.ps1

# Generate test for specific game
.\scripts\generate-game-tests.ps1 -GameName chess

# Force overwrite existing tests
.\scripts\generate-game-tests.ps1 -Force
```

## Test Structure

- **Unit Tests**: Test individual game logic functions
- **Integration Tests**: Test interactions between components
- **E2E Tests**: Full game playthroughs (coming soon)

## Adding New Tests

1. Create a new test file: `tests/gamename.test.js`
2. Import Vitest: `import { describe, it, expect } from 'vitest'`
3. Extract testable logic from game files
4. Write test cases

### Example Test Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

// Extract game logic class/function
class GameLogic {
  // ... game logic here
}

describe('Game Name', () => {
  let game;

  beforeEach(() => {
    game = new GameLogic();
  });

  it('should do something', () => {
    expect(game.someMethod()).toBe(expected);
  });
});
```

## Test Coverage Goals

- **Game Logic**: 95%+ coverage (currently ~5%)
- **Move Validation**: 100% coverage
- **Win Conditions**: 100% coverage
- **Edge Cases**: All known edge cases covered
- **AI Integration**: All AI opponents tested
- **Multiplayer**: WebSocket and Firebase tested

## What to Test

✅ **DO Test:**
- Move validation logic
- Win/draw detection
- Game state management
- Puzzle solving algorithms
- Statistics tracking
- Local storage operations
- AI opponent integration
- Multiplayer synchronization

❌ **DON'T Test:**
- DOM manipulation (use E2E tests)
- Visual rendering
- User interactions (use E2E tests)
- Third-party libraries

## CI/CD

Tests run automatically on:
- Every push to main/master/develop
- Every pull request
- Coverage reports uploaded to Codecov

## 📊 **Progress Tracking**

| Category | Games | Tests | Coverage | Status |
|----------|-------|-------|----------|--------|
| Board Games | 17 | 4 | 23% | 🚧 In Progress |
| Card Games | 12 | 0 | 0% | ❌ Not Started |
| Arcade Games | 15 | 2 | 13% | 🚧 In Progress |
| Puzzle Games | 13 | 2 | 15% | 🚧 In Progress |
| Strategy Games | 4 | 0 | 0% | ❌ Not Started |
| Dice/Casino | 6 | 0 | 0% | ❌ Not Started |
| Japanese Learning | 7 | 0 | 0% | ❌ Not Started |
| Party/Kids | 7 | 0 | 0% | ❌ Not Started |
| **TOTAL** | **188** | **10** | **5.3%** | 🚨 **CRITICAL GAP** |

## 🎯 **Immediate Action Required**

1. **Run test generator**: `.\scripts\generate-game-tests.ps1`
2. **Start with board games**: Chess, Shogi, Go (highest complexity)
3. **Extract game logic**: Move JavaScript from HTML to testable classes
4. **Implement core tests**: Move validation, win detection, state management
5. **Add AI testing**: Stockfish, YaneuraOu, KataGo integration tests

**Goal:** Reach 50% coverage (94 games tested) within 8 weeks.

