/**
 * Main Page E2E Tests
 * Tests the games collection main page functionality
 */

import { test, expect } from '@playwright/test';
import { devices } from '@playwright/test';

test.describe('Main Page - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load main page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Games Collection/);
  });

  test('should display game header and navigation', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Games Collection');
    await expect(page.locator('.back-button')).toBeVisible();
    await expect(page.locator('a[href="/games/multiplayer.html"]')).toBeVisible();
  });

  test('should display games grid with multiple games', async ({ page }) => {
    const gamesGrid = page.locator('.games-grid');
    await expect(gamesGrid).toBeVisible();
    
    const gameLinks = gamesGrid.locator('a');
    const gameCount = await gameLinks.count();
    expect(gameCount).toBeGreaterThan(50); // We have 75+ games
    
    // Check first few games are visible
    await expect(gameLinks.first()).toBeVisible();
    await expect(gameLinks.nth(0)).toContainText('Chess');
  });

  test('should have working game search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="games"]');
    await expect(searchInput).toBeVisible();
    
    // Test search
    await searchInput.fill('chess');
    await page.waitForTimeout(500); // Wait for search to debounce
    
    const visibleGames = page.locator('.games-grid a:visible');
    const visibleCount = await visibleGames.count();
    expect(visibleCount).toBeGreaterThan(0);
    
    // All visible games should contain "chess"
    for (let i = 0; i < Math.min(visibleCount, 5); i++) {
      const gameText = await visibleGames.nth(i).textContent();
      expect(gameText.toLowerCase()).toContain('chess');
    }
  });

  test('should have working theme switcher', async ({ page }) => {
    const themeSelector = page.locator('select[title*="Theme"]');
    await expect(themeSelector).toBeVisible();
    
    // Test theme switching
    await themeSelector.selectOption('Purple');
    await page.waitForTimeout(200);
    
    // Check theme was applied (you might need to check for specific theme classes)
    const body = page.locator('body');
    await expect(body).toHaveClass(/theme-/);
  });

  test('should have working jump navigation', async ({ page }) => {
    const jumpSelect = page.locator('select[title*="Jump"]');
    await expect(jumpSelect).toBeVisible();
    
    // Test jumping to board games section
    await jumpSelect.selectOption('Board Games');
    await page.waitForTimeout(500);
    
    // Should scroll to board games section
    const boardGamesSection = page.locator('h2:has-text("Board Games")');
    await expect(boardGamesSection).toBeVisible();
  });

  test('should display game categories correctly', async ({ page }) => {
    const categories = [
      'Board Games',
      'Arcade', 
      'Puzzle & Word',
      'Math Puzzles',
      'Casino',
      'Dice Games',
      'Japanese Learning',
      'Card Games',
      'Party Games',
      'Classic Adventures'
    ];
    
    for (const category of categories) {
      const categoryHeader = page.locator(`h2:has-text("${category}")`);
      await expect(categoryHeader).toBeVisible();
    }
  });

  test('should have working favorite toggle functionality', async ({ page }) => {
    const firstGame = page.locator('.games-grid a').first();
    await expect(firstGame).toBeVisible();
    
    const favoriteButton = firstGame.locator('button[title*="favorite"]');
    if (await favoriteButton.isVisible()) {
      const initialText = await favoriteButton.textContent();
      await favoriteButton.click();
      
      // Wait for toggle to update
      await page.waitForTimeout(200);
      
      const updatedText = await favoriteButton.textContent();
      expect(updatedText).not.toBe(initialText);
    }
  });

  test('should be responsive and work on different viewports', async ({ page }) => {
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await expect(page.locator('.games-grid')).toBeVisible();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await expect(page.locator('.games-grid')).toBeVisible();
    
    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await expect(page.locator('.games-grid')).toBeVisible();
  });

  test('should have working game links', async ({ page }) => {
    const chessLink = page.locator('a[href*="chess.html"]');
    await expect(chessLink).toBeVisible();
    
    // Click chess link and verify navigation
    await chessLink.click();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/chess\.html/);
    await expect(page.locator('h1')).toContainText('Chess');
    
    // Navigate back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Main Page - Mobile', () => {
  test.use(devices['iPhone 12']);
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Games Collection');
    await expect(page.locator('.games-grid')).toBeVisible();
    
    // Mobile-specific elements
    const gameCount = await page.locator('.games-grid a').count();
    expect(gameCount).toBeGreaterThan(50);
  });

  test('should have mobile-friendly navigation', async ({ page }) => {
    // Check if navigation is mobile-friendly
    const header = page.locator('.game-header');
    await expect(header).toBeVisible();
    
    // Test touch interactions
    const firstGame = page.locator('.games-grid a').first();
    await firstGame.tap();
    await page.waitForLoadState('networkidle');
    
    // Should navigate to game page
    expect(page.url()).toMatch(/\.html$/);
  });

  test('should have working mobile search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="games"]');
    await expect(searchInput).toBeVisible();
    
    // Test mobile search
    await searchInput.fill('tetris');
    await page.waitForTimeout(500);
    
    const visibleGames = page.locator('.games-grid a:visible');
    const visibleCount = await visibleGames.count();
    expect(visibleCount).toBeGreaterThan(0);
  });
});

test.describe('Main Page - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    const h2Elements = page.locator('h2');
    const h2Count = await h2Elements.count();
    expect(h2Count).toBeGreaterThan(5);
  });

  test('should have accessible navigation', async ({ page }) => {
    const navigationLinks = page.locator('a[href]');
    const linkCount = await navigationLinks.count();
    expect(linkCount).toBeGreaterThan(10);
    
    // Check that links have proper text or aria-labels
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = navigationLinks.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should have accessible game cards', async ({ page }) => {
    const gameCards = page.locator('.games-grid a');
    const cardCount = await gameCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = gameCards.nth(i);
      
      // Check for accessible name
      const cardText = await card.textContent();
      expect(cardText.trim().length).toBeGreaterThan(0);
      
      // Check for proper button/focus handling
      await expect(card).toBeVisible();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through navigation
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    }
  });
});
