#!/usr/bin/env node

/**
 * Development mode switcher
 * Switches between production and development package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_PACKAGE = 'package.json';
const DEVELOPMENT_PACKAGE = 'package.dev.json';
const BACKUP_PACKAGE = 'package.json.backup';

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log with color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Switch to development mode
 */
function switchToDev() {
  try {
    // Check if already in dev mode
    if (fs.existsSync(BACKUP_PACKAGE)) {
      log('⚠️  Already in development mode', colors.yellow);
      return;
    }

    // Backup production package.json
    fs.copyFileSync(PRODUCTION_PACKAGE, BACKUP_PACKAGE);
    log('✅ Backed up production package.json', colors.green);

    // Switch to development package.json
    fs.copyFileSync(DEVELOPMENT_PACKAGE, PRODUCTION_PACKAGE);
    log('✅ Switched to development mode', colors.green);

    log('\n🛠️  Development mode activated!', colors.bright);
    log('Available performance testing commands:', colors.cyan);
    log('  npm run benchmark          # Installation speed testing', colors.blue);
    log('  npm run monitor build      # Build performance monitoring', colors.blue);
    log('  npm run optimize           # Bundle analysis', colors.blue);
    log('  npm run perf:test          # Complete test suite', colors.blue);
    log('  npm run compare            # Performance comparison', colors.blue);
    log('  npm run check:regression   # Regression detection', colors.blue);

  } catch (error) {
    log(`❌ Failed to switch to development mode: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Switch to production mode
 */
function switchToProd() {
  try {
    // Check if in dev mode
    if (!fs.existsSync(BACKUP_PACKAGE)) {
      log('⚠️  Already in production mode', colors.yellow);
      return;
    }

    // Restore production package.json
    fs.copyFileSync(BACKUP_PACKAGE, PRODUCTION_PACKAGE);
    fs.unlinkSync(BACKUP_PACKAGE);
    log('✅ Switched to production mode', colors.green);

    log('\n📦 Production mode activated!', colors.bright);
    log('Performance testing tools are not available in production mode.', colors.cyan);
    log('Use "npm run dev-mode" to switch back to development mode.', colors.blue);

  } catch (error) {
    log(`❌ Failed to switch to production mode: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Show current mode
 */
function showStatus() {
  const isDevMode = fs.existsSync(BACKUP_PACKAGE);
  const mode = isDevMode ? 'Development' : 'Production';
  const color = isDevMode ? colors.green : colors.blue;

  log(`\n📊 Current mode: ${mode}`, color);
  
  if (isDevMode) {
    log('🛠️  Performance testing tools available', colors.green);
    log('Available commands:', colors.cyan);
    log('  npm run benchmark          # Installation speed testing', colors.blue);
    log('  npm run monitor build      # Build performance monitoring', colors.blue);
    log('  npm run optimize           # Bundle analysis', colors.blue);
    log('  npm run perf:test          # Complete test suite', colors.blue);
  } else {
    log('📦 Production mode - performance tools not available', colors.blue);
    log('Use "npm run dev-mode" to switch to development mode.', colors.cyan);
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  log('🔄 DevSum CLI Mode Switcher', colors.bright);
  log('='.repeat(30), colors.cyan);

  switch (command) {
    case 'dev':
    case 'development':
      switchToDev();
      break;
    case 'prod':
    case 'production':
      switchToProd();
      break;
    case 'status':
    default:
      showStatus();
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { switchToDev, switchToProd, showStatus };
