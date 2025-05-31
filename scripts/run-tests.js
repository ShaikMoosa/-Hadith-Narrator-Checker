#!/usr/bin/env node

/**
 * Test Runner for Hadith Narrator Checker
 * This script sets up and runs Playwright tests
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'blue');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Please run from project root.', 'red');
    process.exit(1);
  }
  
  // Check if Playwright is installed
  try {
    require.resolve('@playwright/test');
    log('✅ Playwright is installed', 'green');
    return true;
  } catch (error) {
    log('⚠️  Playwright not found. Installing...', 'yellow');
    return false;
  }
}

function installPlaywright() {
  log('\n📦 Installing Playwright...', 'blue');
  
  try {
    execSync('npm install --save-dev @playwright/test', { 
      stdio: 'inherit',
      timeout: 300000 // 5 minutes
    });
    
    log('✅ Playwright installed successfully', 'green');
    
    log('\n🌐 Installing browsers...', 'blue');
    execSync('npx playwright install', { 
      stdio: 'inherit',
      timeout: 600000 // 10 minutes
    });
    
    log('✅ Browsers installed successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to install Playwright: ${error.message}`, 'red');
    return false;
  }
}

function checkServer() {
  log('\n🌐 Checking if development server is running...', 'blue');
  
  try {
    const { execSync } = require('child_process');
    const result = execSync('netstat -ano | findstr ":3001"', { encoding: 'utf8' });
    
    if (result.trim()) {
      log('✅ Development server is running on port 3001', 'green');
      return true;
    }
  } catch (error) {
    // Server not running
  }
  
  log('⚠️  Development server not detected on port 3001', 'yellow');
  log('   Please start the server with: npm run dev', 'yellow');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Would you like to start the server automatically? (y/n): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        log('\n🚀 Starting development server...', 'blue');
        
        const serverProcess = spawn('npm', ['run', 'dev'], {
          stdio: 'pipe',
          detached: true
        });
        
        // Wait for server to start
        setTimeout(() => {
          log('✅ Development server started', 'green');
          resolve(true);
        }, 5000);
        
        // Keep server running in background
        serverProcess.unref();
      } else {
        log('⚠️  Please start the development server manually and try again', 'yellow');
        resolve(false);
      }
    });
  });
}

async function runTests(mode = 'default') {
  log('\n🧪 Running Playwright tests...', 'blue');
  
  const testCommands = {
    default: 'npx playwright test',
    ui: 'npx playwright test --ui',
    debug: 'npx playwright test --debug',
    headed: 'npx playwright test --headed',
    specific: 'npx playwright test tests/hadith-app.spec.ts'
  };
  
  const command = testCommands[mode] || testCommands.default;
  
  try {
    log(`\n📋 Command: ${command}`, 'blue');
    execSync(command, { 
      stdio: 'inherit',
      timeout: 600000 // 10 minutes
    });
    
    log('\n🎉 All tests completed successfully!', 'green');
    
    // Show test report
    log('\n📊 To view detailed test report, run:', 'blue');
    log('   npx playwright show-report', 'bright');
    
  } catch (error) {
    log('\n❌ Tests failed or were interrupted', 'red');
    log('\n📊 To view test report with failures, run:', 'blue');
    log('   npx playwright show-report', 'bright');
    
    process.exit(1);
  }
}

async function main() {
  log(`${colors.bright}
╔═══════════════════════════════════════════════════════════════════╗
║             Hadith Narrator Checker - Test Runner                ║
║                                                                   ║
║  Comprehensive UI Testing with Playwright                        ║
╚═══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // Get command line arguments
  const args = process.argv.slice(2);
  const mode = args[0] || 'default';
  
  if (args.includes('--help') || args.includes('-h')) {
    log(`
Usage: node scripts/run-tests.js [mode]

Modes:
  default    Run all tests in headless mode
  ui         Run tests with interactive UI
  debug      Run tests in debug mode
  headed     Run tests with visible browser
  specific   Run only the main test suite

Examples:
  node scripts/run-tests.js
  node scripts/run-tests.js ui
  node scripts/run-tests.js debug
`, 'blue');
    return;
  }
  
  try {
    // Step 1: Check prerequisites
    const playwrightInstalled = checkPrerequisites();
    
    // Step 2: Install Playwright if needed
    if (!playwrightInstalled) {
      const installed = installPlaywright();
      if (!installed) {
        log('\n❌ Setup failed. Please install Playwright manually:', 'red');
        log('   npm install --save-dev @playwright/test', 'yellow');
        log('   npx playwright install', 'yellow');
        process.exit(1);
      }
    }
    
    // Step 3: Check/start development server
    const serverRunning = await checkServer();
    if (!serverRunning) {
      log('\n❌ Development server is required to run tests', 'red');
      process.exit(1);
    }
    
    // Step 4: Run tests
    await runTests(mode);
    
  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, runTests, checkPrerequisites, installPlaywright }; 