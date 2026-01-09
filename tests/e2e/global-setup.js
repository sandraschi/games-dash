/**
 * Global Setup for Playwright E2E Tests
 * Sets up test environment and starts required services
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function globalSetup(config) {
  console.log('🚀 Setting up E2E test environment...');
  
  // Create test results directory
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  // Create screenshots directory
  const screenshotsDir = path.join(testResultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Create videos directory
  const videosDir = path.join(testResultsDir, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }
  
  // Verify test server is accessible
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🔍 Verifying test server accessibility...');
    await page.goto(process.env.TEST_BASE_URL || 'http://localhost:8080');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if main page is accessible
    const title = await page.title();
    console.log(`✅ Test server accessible - Page title: "${title}"`);
    
    // Test basic functionality
    const gameLinks = await page.locator('.games-grid a').count();
    console.log(`📊 Found ${gameLinks} game links on main page`);
    
  } catch (error) {
    console.error('❌ Test server verification failed:', error.message);
    throw new Error('Test server is not accessible. Please ensure the development server is running on port 8080.');
  } finally {
    await context.close();
    await browser.close();
  }
  
  // Store global test data
  const globalData = {
    testStartTime: new Date().toISOString(),
    testEnvironment: process.env.NODE_ENV || 'development',
    browserVersion: await getBrowserVersion(),
  };
  
  fs.writeFileSync(
    path.join(testResultsDir, 'global-setup.json'),
    JSON.stringify(globalData, null, 2)
  );
  
  console.log('✅ E2E test environment setup complete!');
}

async function getBrowserVersion() {
  try {
    const browser = await chromium.launch();
    const version = browser.version();
    await browser.close();
    return version;
  } catch (error) {
    return 'unknown';
  }
}

module.exports = globalSetup;
