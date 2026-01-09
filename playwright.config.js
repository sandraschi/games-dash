import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Games Collection
 * Comprehensive E2E testing for 75+ games
 */
export default defineConfig({
  // Global test configuration
  testDir: './tests/e2e',
  testMatch: '**/*.spec.js',
  testIgnore: '**/node_modules/**',
  
  // Test timeout and retries
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],

  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.js',
  globalTeardown: './tests/e2e/global-teardown.js',

  // Projects for different browsers and devices
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPad Safari',
      use: { ...devices['iPad Pro'] },
    },

    // Tablet
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },

    // Custom configurations for specific testing
    {
      name: 'desktop-ci',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    },
    {
      name: 'mobile-ci',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 },
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
      },
    }
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directories
  outputDir: 'test-results',
  
  // Global test settings
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:8080',
    
    // Collect trace when retrying the test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // Default viewport
    viewport: { width: 1280, height: 720 },
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // User agent
    userAgent: 'Games-Collection-E2E-Tests/1.0.0',
    
    // Color scheme preference
    colorScheme: 'dark',
    
    // Reduced motion for accessibility testing
    reducedMotion: 'reduce',
  },

  // Metadata for test organization
  metadata: {
    'test-type': ['e2e', 'integration'],
    'category': ['games', 'ui', 'functionality'],
    'priority': ['critical', 'high', 'medium', 'low'],
    'browser': ['chromium', 'firefox', 'webkit'],
    'device': ['desktop', 'mobile', 'tablet']
  }
});
