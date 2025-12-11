# Test Suite

This directory contains automated tests for the games app.

## Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-runs on file changes)
npm run test:ui       # Visual test UI
npm run test:coverage # Generate coverage report
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

- **Game Logic**: 80%+ coverage
- **Move Validation**: 100% coverage
- **Win Conditions**: 100% coverage
- **Edge Cases**: All known edge cases covered

## What to Test

✅ **DO Test:**
- Move validation logic
- Win/draw detection
- Game state management
- Puzzle solving algorithms
- Statistics tracking
- Local storage operations

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

