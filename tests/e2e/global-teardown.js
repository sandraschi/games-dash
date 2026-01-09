/**
 * Global Teardown for Playwright E2E Tests
 * Cleans up test environment and generates reports
 */

const fs = require('fs');
const path = require('path');

async function globalTeardown(config) {
  console.log('🧹 Cleaning up E2E test environment...');
  
  const testResultsDir = path.join(process.cwd(), 'test-results');
  
  // Generate test summary
  const summaryData = {
    testEndTime: new Date().toISOString(),
    testResultsDir: testResultsDir,
    generatedReports: [],
  };
  
  // Check for generated reports
  const reports = [
    { name: 'HTML Report', path: path.join(testResultsDir, 'playwright-report') },
    { name: 'JSON Results', path: path.join(testResultsDir, 'test-results.json') },
    { name: 'JUnit Results', path: path.join(testResultsDir, 'test-results.xml') },
  ];
  
  reports.forEach(report => {
    if (fs.existsSync(report.path)) {
      summaryData.generatedReports.push(report.name);
      console.log(`📄 ${report.name} generated: ${report.path}`);
    }
  });
  
  // Save summary
  fs.writeFileSync(
    path.join(testResultsDir, 'global-teardown.json'),
    JSON.stringify(summaryData, null, 2)
  );
  
  console.log('✅ E2E test environment cleanup complete!');
  console.log(`📊 Test results available in: ${testResultsDir}`);
}

module.exports = globalTeardown;
