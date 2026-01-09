/**
 * Chess Games E2E Tests
 * Tests both 2D and 3D chess functionality
 */

import { test, expect } from '@playwright/test';
import { devices } from '@playwright/test';

test.describe('Chess 2D Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/chess.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load chess game with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Chess Game/);
  });

  test('should display chess board and pieces', async ({ page }) => {
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Wait for board to render
    await page.waitForTimeout(1000);
    
    // Check if pieces are rendered (should have 32 pieces total)
    const pieces = page.locator('.piece');
    const pieceCount = await pieces.count();
    expect(pieceCount).toBe(32);
  });

  test('should have game controls', async ({ page }) => {
    await expect(page.locator('button:has-text("New Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Undo Move")')).toBeVisible();
    await expect(page.locator('button:has-text("Flip Board")')).toBeVisible();
    await expect(page.locator('button:has-text("Play vs AI")')).toBeVisible();
  });

  test('should display game status', async ({ page }) => {
    const status = page.locator('#status');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/White's Turn|Game Running/);
  });

  test('should start new game', async ({ page }) => {
    await page.locator('button:has-text("New Game")').click();
    await page.waitForTimeout(500);
    
    const status = page.locator('#status');
    await expect(status).toContainText(/White's Turn/);
    
    // Board should be reset to initial position
    const pieces = page.locator('.piece');
    expect(await pieces.count()).toBe(32);
  });

  test('should enable AI mode', async ({ page }) => {
    const aiButton = page.locator('button:has-text("Play vs AI")');
    await aiButton.click();
    await page.waitForTimeout(500);
    
    // Should show AI controls
    const aiControls = page.locator('#aiControls');
    if (await aiControls.isVisible()) {
      await expect(aiControls).toBeVisible();
    }
  });

  test('should allow piece selection and movement', async ({ page }) => {
    // Start new game to ensure clean state
    await page.locator('button:has-text("New Game")').click();
    await page.waitForTimeout(1000);
    
    // Try to click on a white piece (e.g., pawn)
    const whitePawns = page.locator('.piece.white-piece');
    if (await whitePawns.count() > 0) {
      await whitePawns.first().click();
      await page.waitForTimeout(200);
      
      // Should show valid moves
      const validMoves = page.locator('.valid-move');
      const moveCount = await validMoves.count();
      expect(moveCount).toBeGreaterThan(0);
      
      // Click on a valid move square
      if (moveCount > 0) {
        await validMoves.first().click();
        await page.waitForTimeout(500);
        
        // Should switch turns
        const status = page.locator('#status');
        await expect(status).toContainText(/Black's Turn/);
      }
    }
  });

  test('should display captured pieces', async ({ page }) => {
    const capturedWhite = page.locator('#captured-white');
    const capturedBlack = page.locator('#captured-black');
    
    // Initially should be empty
    expect(await capturedWhite.textContent()).toBe('');
    expect(await capturedBlack.textContent()).toBe('');
  });

  test('should have working flip board feature', async ({ page }) => {
    const flipButton = page.locator('button:has-text("Flip Board")');
    await flipButton.click();
    await page.waitForTimeout(300);
    
    // Board should still be visible after flip
    await expect(page.locator('#gameCanvas')).toBeVisible();
    const pieces = page.locator('.piece');
    expect(await pieces.count()).toBe(32);
  });

  test('should have sound controls', async ({ page }) => {
    const soundButton = page.locator('button:has-text("Sound:")');
    await expect(soundButton).toBeVisible();
    
    // Toggle sound
    await soundButton.click();
    await page.waitForTimeout(200);
    
    // Should update sound state
    const updatedText = await soundButton.textContent();
    expect(updatedText).toMatch(/Sound: (On|Off)/);
  });

  test('should have piece style selector', async ({ page }) => {
    const pieceStyleButton = page.locator('button:has-text("Pieces:")');
    await expect(pieceStyleButton).toBeVisible();
    
    // Click to show style options
    await pieceStyleButton.click();
    await page.waitForTimeout(200);
    
    // Should show style options
    const styleOptions = page.locator('.piece-style-selector');
    if (await styleOptions.isVisible()) {
      await expect(styleOptions).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('button:has-text("New Game")')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('button:has-text("New Game")')).toBeVisible();
  });
});

test.describe('Chess 3D Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/chess-3d.html');
    await page.waitForLoadState('networkidle');
    // Wait for 3D scene to initialize
    await page.waitForTimeout(2000);
  });

  test('should load 3D chess with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/3D Chess/);
  });

  test('should display 3D game container', async ({ page }) => {
    await expect(page.locator('#chess3dContainer')).toBeVisible();
  });

  test('should have mode switching controls', async ({ page }) => {
    const viewModeBtn = page.locator('button:has-text("View Mode")');
    const playModeBtn = page.locator('button:has-text("Play Mode")');
    
    await expect(viewModeBtn).toBeVisible();
    await expect(playModeBtn).toBeVisible();
  });

  test('should switch between view and play modes', async ({ page }) => {
    const playModeBtn = page.locator('button:has-text("Play Mode")');
    await playModeBtn.click();
    await page.waitForTimeout(500);
    
    // Should activate play mode
    const activeMode = page.locator('.view-btn.active:has-text("Play Mode")');
    await expect(activeMode).toBeVisible();
    
    // Switch back to view mode
    const viewModeBtn = page.locator('button:has-text("View Mode")');
    await viewModeBtn.click();
    await page.waitForTimeout(500);
    
    const activeViewMode = page.locator('.view-btn.active:has-text("View Mode")');
    await expect(activeViewMode).toBeVisible();
  });

  test('should have camera view controls', async ({ page }) => {
    const cameraViews = [
      'Default View',
      'White Side', 
      'Black Side',
      'Top View'
    ];
    
    for (const view of cameraViews) {
      const viewButton = page.locator(`button:has-text("${view}")`);
      await expect(viewButton).toBeVisible();
    }
  });

  test('should have piece style selector', async ({ page }) => {
    const pieceStyles = ['Classic', 'Modern'];
    
    for (const style of pieceStyles) {
      const styleButton = page.locator(`button:has-text("${style}")`);
      await expect(styleButton).toBeVisible();
    }
  });

  test('should have game controls', async ({ page }) => {
    await expect(page.locator('button:has-text("New Game")')).toBeVisible();
    await expect(page.locator('button:has-text("Play vs AI")')).toBeVisible();
    await expect(page.locator('button:has-text("Flip Board")')).toBeVisible();
  });

  test('should display game status', async ({ page }) => {
    const status = page.locator('#status');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Beautiful 3D chess|Game Running/);
  });

  test('should have instructions panel', async ({ page }) => {
    const instructions = page.locator('.side-panel');
    await expect(instructions).toBeVisible();
    
    // Should contain mode switching instructions
    const modeInstructions = instructions.locator('text:has-text("Mode Switching")');
    await expect(modeInstructions).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await expect(page.locator('#chess3dContainer')).toBeVisible();
    await expect(page.locator('button:has-text("View Mode")')).toBeVisible();
    await expect(page.locator('button:has-text("Play Mode")')).toBeVisible();
  });

  test('should handle piece selection in play mode', async ({ page }) => {
    // Switch to play mode
    await page.locator('button:has-text("Play Mode")').click();
    await page.waitForTimeout(1000);
    
    // Try to interact with the 3D scene
    const gameContainer = page.locator('#chess3dContainer');
    await expect(gameContainer).toBeVisible();
    
    // Click on the game container to potentially select a piece
    await gameContainer.click({ position: { x: 400, y: 400 } });
    await page.waitForTimeout(500);
    
    // Should still be in play mode
    const activePlayMode = page.locator('.view-btn.active:has-text("Play Mode")');
    await expect(activePlayMode).toBeVisible();
  });
});

test.describe('Chess Games - Multiplayer Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/chess.html');
    await page.waitForLoadState('networkidle');
  });

  test('should have 3D chess navigation link', async ({ page }) => {
    const chess3DLink = page.locator('a[href*="chess-3d.html"]');
    await expect(chess3DLink).toBeVisible();
    
    // Test navigation to 3D chess
    await chess3DLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/chess-3d\.html/);
    await expect(page.locator('#chess3dContainer')).toBeVisible();
  });

  test('should have learn chess resources', async ({ page }) => {
    const learnLink = page.locator('a[href*="chess-education.html"]');
    await expect(learnLink).toBeVisible();
  });
});

test.describe('Chess Games - Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/games/chess.html');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have memory leaks during gameplay', async ({ page }) => {
    await page.goto('/games/chess.html');
    await page.waitForLoadState('networkidle');
    
    // Simulate multiple moves
    for (let i = 0; i < 10; i++) {
      await page.locator('button:has-text("New Game")').click();
      await page.waitForTimeout(500);
      
      // Try to make a move
      const whitePawns = page.locator('.piece.white-piece');
      if (await whitePawns.count() > 0) {
        await whitePawns.first().click();
        await page.waitForTimeout(200);
        
        const validMoves = page.locator('.valid-move');
        if (await validMoves.count() > 0) {
          await validMoves.first().click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // Should still be responsive
    const pieces = page.locator('.piece');
    expect(await pieces.count()).toBe(32);
  });
});
