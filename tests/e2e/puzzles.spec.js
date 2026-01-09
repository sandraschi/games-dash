/**
 * Puzzle Games E2E Tests
 * Tests crossword, word search, sliding puzzle, and other puzzle games
 */

import { test, expect } from '@playwright/test';
import { devices } from '@playwright/test';

test.describe('Crossword Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/crossword.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load crossword with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/SOTA Crossword Master/);
  });

  test('should display crossword grid and controls', async ({ page }) => {
    await expect(page.locator('#crossword-grid')).toBeVisible();
    await expect(page.locator('button:has-text("Generate New Puzzle")')).toBeVisible();
    await expect(page.locator('select[title*="Size"]')).toBeVisible();
    await expect(page.locator('select[title*="Difficulty"]')).toBeVisible();
  });

  test('should generate crossword puzzle', async ({ page }) => {
    await page.locator('button:has-text("Generate New Puzzle")').click();
    await page.waitForTimeout(2000); // Wait for generation
    
    // Check if puzzle was generated
    const grid = page.locator('#crossword-grid');
    await expect(grid).toBeVisible();
    
    // Should have puzzle info
    const puzzleInfo = page.locator('.puzzle-info');
    if (await puzzleInfo.isVisible()) {
      const infoText = await puzzleInfo.textContent();
      expect(infoText).toMatch(/Generated \w+ \w+×\w+ crossword/);
    }
  });

  test('should have clue lists', async ({ page }) => {
    await page.locator('button:has-text("Generate New Puzzle")').click();
    await page.waitForTimeout(2000);
    
    const acrossClues = page.locator('h3:has-text("Across")');
    const downClues = page.locator('h3:has-text("Down")');
    
    await expect(acrossClues).toBeVisible();
    await expect(downClues).toBeVisible();
    
    // Should have clue lists
    const acrossList = acrossClues.locator('~ .list, acrossClues + .list');
    const downList = downClues.locator('~ .list, downClues + .list');
    
    if (await acrossList.isVisible()) {
      const acrossItems = acrossList.locator('li');
      expect(await acrossItems.count()).toBeGreaterThan(0);
    }
    
    if (await downList.isVisible()) {
      const downItems = downList.locator('li');
      expect(await downItems.count()).toBeGreaterThan(0);
    }
  });

  test('should allow size selection', async ({ page }) => {
    const sizeSelect = page.locator('select[title*="Size"]');
    await expect(sizeSelect).toBeVisible();
    
    const options = ['Small (11x11)', 'Standard (15x15)', 'Large (19x19)', 'Expert (21x21)'];
    
    for (const option of options) {
      await sizeSelect.selectOption(option);
      await page.waitForTimeout(200);
      expect(sizeSelect).toHaveValue(option);
    }
  });

  test('should allow difficulty selection', async ({ page }) => {
    const difficultySelect = page.locator('select[title*="Difficulty"]');
    await expect(difficultySelect).toBeVisible();
    
    const difficulties = ['Easy', 'Medium', 'Hard'];
    
    for (const difficulty of difficulties) {
      await difficultySelect.selectOption(difficulty);
      await page.waitForTimeout(200);
      expect(difficultySelect).toHaveValue(difficulty);
    }
  });

  test('should have save and export functionality', async ({ page }) => {
    await expect(page.locator('button:has-text("Save Puzzle")')).toBeVisible();
    await expect(page.locator('button:has-text("Print View")')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('#crossword-grid')).toBeVisible();
    await expect(page.locator('button:has-text("Generate New Puzzle")')).toBeVisible();
  });
});

test.describe('Word Search Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/wordsearch.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load word search with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Word Search/);
  });

  test('should display word search grid and controls', async ({ page }) => {
    await expect(page.locator('#wordGrid')).toBeVisible();
    await expect(page.locator('button:has-text("New Puzzle")')).toBeVisible();
    await expect(page.locator('button:has-text("Hint")')).toBeVisible();
    await expect(page.locator('button:has-text("Solve All")')).toBeVisible();
  });

  test('should have theme selection', async ({ page }) => {
    const themes = [
      'Animals', 'Countries', 'Technology', 'Food', 
      'Sports', 'Movies', 'Music', 'Science'
    ];
    
    for (const theme of themes) {
      const themeButton = page.locator(`button:has-text("${theme}")`);
      await expect(themeButton).toBeVisible();
    }
  });

  test('should generate word search puzzle', async ({ page }) => {
    await page.locator('button:has-text("New Puzzle")').click();
    await page.waitForTimeout(1000);
    
    const grid = page.locator('#wordGrid');
    await expect(grid).toBeVisible();
    
    // Should have word list
    const wordList = page.locator('.word-list');
    if (await wordList.isVisible()) {
      const words = wordList.locator('div');
      expect(await words.count()).toBeGreaterThan(0);
    }
  });

  test('should have difficulty controls', async ({ page }) => {
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
    
    for (const difficulty of difficulties) {
      const difficultyButton = page.locator(`button:has-text("${difficulty}")`);
      await expect(difficultyButton).toBeVisible();
    }
  });

  test('should allow word selection', async ({ page }) => {
    await page.locator('button:has-text("New Puzzle")').click();
    await page.waitForTimeout(1000);
    
    const gridCells = page.locator('#wordGrid .cell');
    if (await gridCells.count() > 0) {
      await gridCells.first().click();
      await page.waitForTimeout(200);
      
      // Should show selection state
      const selectedCell = gridCells.first();
      expect(await selectedCell.evaluate(el => el.classList.contains('selected'))).toBeTruthy();
    }
  });

  test('should have advanced options', async ({ page }) => {
    const advancedOptions = page.locator('.advanced-options');
    if (await advancedOptions.isVisible()) {
      await expect(advancedOptions.locator('text:has-text("Advanced Options")')).toBeVisible();
      
      const allowDiagonals = advancedOptions.locator('input[id="allowDiagonals"]');
      const allowBackwards = advancedOptions.locator('input[id="allowAnagrams"]');
      
      if (await allowDiagonals.isVisible()) {
        await expect(allowDiagonals).toBeVisible();
      }
      
      if (await allowBackwards.isVisible()) {
        expect(allowBackwards).toBeVisible();
      }
    }
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('#wordGrid')).toBeVisible();
    await expect(page.locator('button:has-text("New Puzzle")')).toBeVisible();
    
    // Test theme selection on mobile
    const animalTheme = page.locator('button:has-text("Animals")');
    await expect(animalTheme).toBeVisible();
    await animalTheme.click();
    await page.waitForTimeout(500);
  });
});

test.describe('Classical Sliding Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/classical-puzzle.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load sliding puzzle with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Classical Puzzle/);
  });

  test('should display puzzle grid and controls', async ({ page }) => {
    await expect(page.locator('.puzzle-grid')).toBeVisible();
    await expect(page.locator('button:has-text("Shuffle")')).toBeVisible();
    await expect(page.locator('button:has-text("Auto-Solve")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();
  });

  test('should have difficulty selection', async ({ page }) => {
    const difficultySelect = page.locator('select');
    await expect(difficultySelect).toBeVisible();
    
    const options = ['Tiny Tot (3×3, 8 pieces)', 'Beginner (4×4, 15 pieces)', 'Kid Champ (5×5, 24 pieces)'];
    
    for (const option of options) {
      await difficultySelect.selectOption(option);
      await page.waitForTimeout(200);
      expect(difficultySelect).toHaveValue(option);
    }
  });

  test('should shuffle puzzle', async ({ page }) => {
    const shuffleButton = page.locator('button:has-text("Shuffle")');
    await shuffleButton.click();
    await page.waitForTimeout(1000);
    
    const grid = page.locator('.puzzle-grid');
    await expect(grid).toBeVisible();
    
    // Should have move counter
    const moveCounter = page.locator('text:has-text("Moves:")');
    if (await moveCounter.isVisible()) {
      const moveText = await moveCounter.textContent();
      expect(moveText).toMatch(/Moves: \d+/);
    }
  });

  test('should have image upload functionality', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload Photo")');
    await expect(uploadButton).toBeVisible();
    
    // Note: We can't actually test file upload without a real file,
    // but we can verify the button exists and is clickable
    await expect(uploadButton).toBeEnabled();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('.puzzle-grid')).toBeVisible();
    await expect(page.locator('button:has-text("Shuffle")')).toBeVisible();
    
    // Test touch interaction
    const shuffleButton = page.locator('button:has-text("Shuffle")');
    await shuffleButton.tap();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('.puzzle-grid')).toBeVisible();
  });
});

test.describe('24 Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/twentyfour.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load 24 game with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/24 Game/);
  });

  test('should display game interface', async ({ page }) => {
    await expect(page.locator('.numbers')).toBeVisible();
    await expect(page.locator('input[placeholder*="expression"]')).toBeVisible();
    await expect(page.locator('button:has-text("Check")')).toBeVisible();
    await expect(page.locator('button:has-text("New Puzzle")')).toBeVisible();
    await expect(page.locator('button:has-text("Hint")')).toBeVisible();
  });

  test('should have difficulty selection', async ({ page }) => {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    
    for (const difficulty of difficulties) {
      const difficultyButton = page.locator(`button:has-text("${difficulty}")`);
      await expect(difficultyButton).toBeVisible();
    }
  });

  test('should generate puzzle', async ({ page }) => {
    await page.locator('button:has-text("New Puzzle")').click();
    await page.waitForTimeout(500);
    
    const numbers = page.locator('.numbers .number');
    expect(await numbers.count()).toBe(4);
    
    // Each number should be visible
    for (let i = 0; i < 4; i++) {
      await expect(numbers.nth(i)).toBeVisible();
    }
  });

  test('should allow expression input', async ({ page }) => {
    const expressionInput = page.locator('input[placeholder*="expression"]');
    await expect(expressionInput).toBeVisible();
    
    await expressionInput.fill('(2+2)*6');
    await page.waitForTimeout(200);
    expect(expressionInput).toHaveValue('(2+2)*6');
  });

  test('should check solution', async ({ page }) => {
    const expressionInput = page.locator('input[placeholder*="expression"]');
    await expressionInput.fill('8+8+8');
    
    const checkButton = page.locator('button:has-text("Check")');
    await checkButton.click();
    await page.waitForTimeout(500);
    
    // Should show result
    const result = page.locator('.result');
    if (await result.isVisible()) {
      const resultText = await result.textContent();
      expect(resultText).toMatch(/Correct|Incorrect/);
    }
  });

  test('should provide hints', async ({ page }) => {
    const hintButton = page.locator('button:has-text("Hint")');
    await expect(hintButton).toBeVisible();
    
    await hintButton.click();
    await page.waitForTimeout(500);
    
    // Should show hint (implementation dependent)
    const hint = page.locator('.hint');
    if (await hint.isVisible()) {
      expect(hint).toBeVisible();
    }
  });

  test('should track statistics', async ({ page }) => {
    const stats = page.locator('.stats');
    if (await stats.isVisible()) {
      await expect(stats).toBeVisible();
      
      const solvedCount = stats.locator('text:has-text("Solved:")');
      const attemptsCount = stats.locator('text:has-text("Attempts:")');
      
      if (await solvedCount.isVisible()) {
        expect(await solvedCount.textContent()).toMatch(/Solved: \d+/);
      }
      
      if (await attemptsCount.isVisible()) {
        expect(await attemptsCount.textContent()).toMatch(/Attempts: \d+/);
      }
    }
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await expect(page.locator('.numbers')).toBeVisible();
    await expect(page.locator('input[placeholder*="expression"]')).toBeVisible();
    await expect(page.locator('button:has-text("Check")')).toBeVisible();
    
    // Test mobile input
    const expressionInput = page.locator('input[placeholder*="expression"]');
    await expressionInput.tap();
    await expressionInput.fill('6*4');
    await page.waitForTimeout(200);
    
    expect(expressionInput).toHaveValue('6*4');
  });
});

test.describe('Puzzle Games - Performance', () => {
  test('should load puzzles quickly', async ({ page }) => {
    const puzzles = [
      '/games/crossword.html',
      '/games/wordsearch.html',
      '/games/classical-puzzle.html',
      '/games/twentyfour.html'
    ];
    
    for (const puzzleUrl of puzzles) {
      const startTime = Date.now();
      await page.goto(puzzleUrl);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    }
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('/games/wordsearch.html');
    await page.waitForLoadState('networkidle');
    
    // Test rapid theme switching
    const themes = ['Animals', 'Countries', 'Technology'];
    
    for (const theme of themes) {
      await page.locator(`button:has-text("${theme}")`).click();
      await page.waitForTimeout(200);
      await page.locator('button:has-text("New Puzzle")').click();
      await page.waitForTimeout(500);
    }
    
    // Should still be responsive
    await expect(page.locator('#wordGrid')).toBeVisible();
  });
});
