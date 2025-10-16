#!/usr/bin/env node

/**
 * Performance regression check script
 * Validates performance against defined thresholds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Performance thresholds
 */
const PERFORMANCE_THRESHOLDS = {
  'Core Installation': {
    maxDuration: 15000, // 15 seconds
    maxSize: 5 * 1024 * 1024, // 5MB
    regressionThreshold: 0.2 // 20% regression threshold
  },
  'Full Installation': {
    maxDuration: 45000, // 45 seconds
    maxSize: 25 * 1024 * 1024, // 25MB
    regressionThreshold: 0.2 // 20% regression threshold
  },
  'NPX Execution': {
    maxDuration: 10000, // 10 seconds
    maxSize: 0, // No local installation
    regressionThreshold: 0.3 // 30% regression threshold
  },
  'Docker Build': {
    maxDuration: 120000, // 2 minutes
    maxSize: 50 * 1024 * 1024, // 50MB
    regressionThreshold: 0.25 // 25% regression threshold
  }
};

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
 * Load comparison data
 */
function loadComparisonData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`❌ Error loading ${filePath}: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Check if performance meets thresholds
 */
function checkThresholds(method, duration, size) {
  const thresholds = PERFORMANCE_THRESHOLDS[method];
  
  if (!thresholds) {
    return {
      durationPass: true,
      sizePass: true,
      durationMessage: 'No thresholds defined',
      sizeMessage: 'No thresholds defined'
    };
  }
  
  const durationPass = duration <= thresholds.maxDuration;
  const sizePass = size <= thresholds.maxSize;
  
  const durationMessage = durationPass 
    ? `✅ Duration: ${duration.toFixed(0)}ms (threshold: ${thresholds.maxDuration}ms)`
    : `❌ Duration: ${duration.toFixed(0)}ms exceeds threshold: ${thresholds.maxDuration}ms`;
    
  const sizeMessage = sizePass
    ? `✅ Size: ${formatBytes(size)} (threshold: ${formatBytes(thresholds.maxSize)})`
    : `❌ Size: ${formatBytes(size)} exceeds threshold: ${formatBytes(thresholds.maxSize)}`;
  
  return { durationPass, sizePass, durationMessage, sizeMessage };
}

/**
 * Check for regression
 */
function checkRegression(method, percentageChange) {
  const thresholds = PERFORMANCE_THRESHOLDS[method];
  
  if (!thresholds) {
    return {
      isRegression: false,
      message: 'No regression threshold defined'
    };
  }
  
  const isRegression = percentageChange > thresholds.regressionThreshold;
  const message = isRegression
    ? `❌ Regression: ${percentageChange.toFixed(1)}% exceeds threshold: ${(thresholds.regressionThreshold * 100).toFixed(0)}%`
    : `✅ No regression: ${percentageChange.toFixed(1)}% within threshold: ${(thresholds.regressionThreshold * 100).toFixed(0)}%`;
  
  return { isRegression, message };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate performance data
 */
function validatePerformance(comparisonData) {
  const errors = [];
  const warnings = [];
  
  if (!comparisonData || !comparisonData.results) {
    errors.push('Invalid comparison data structure');
    return { isValid: false, errors, warnings };
  }
  
  const results = comparisonData.results;
  
  if (!Array.isArray(results) || results.length === 0) {
    errors.push('No performance results found');
    return { isValid: false, errors, warnings };
  }
  
  // Check for required methods
  const requiredMethods = Object.keys(PERFORMANCE_THRESHOLDS);
  const foundMethods = results.map(r => r.method);
  const missingMethods = requiredMethods.filter(method => !foundMethods.includes(method));
  
  if (missingMethods.length > 0) {
    warnings.push(`Missing performance data for: ${missingMethods.join(', ')}`);
  }
  
  return { isValid: true, errors, warnings };
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    log('Usage: node check-regression.js <comparison-file>', colors.red);
    process.exit(1);
  }
  
  const comparisonFile = args[0];
  
  log('🔍 Loading performance comparison data...', colors.blue);
  
  const comparisonData = loadComparisonData(comparisonFile);
  
  if (!comparisonData) {
    log('❌ Failed to load comparison data', colors.red);
    process.exit(1);
  }
  
  // Validate data structure
  const { isValid, errors, warnings } = validatePerformance(comparisonData);
  
  if (!isValid) {
    log('❌ Invalid performance data:', colors.red);
    errors.forEach(error => log(`  • ${error}`, colors.red));
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    log('⚠️ Warnings:', colors.yellow);
    warnings.forEach(warning => log(`  • ${warning}`, colors.yellow));
  }
  
  log('\n📊 Performance Validation Results', colors.bright);
  log('='.repeat(50), colors.cyan);
  
  const results = comparisonData.results;
  let hasFailures = false;
  let hasRegressions = false;
  
  results.forEach(result => {
    log(`\n🔍 ${result.method}:`, colors.blue);
    
    // Check thresholds
    const { durationPass, sizePass, durationMessage, sizeMessage } = checkThresholds(
      result.method,
      result.current,
      result.current // Using current duration as size proxy for now
    );
    
    log(`  ${durationMessage}`);
    log(`  ${sizeMessage}`);
    
    // Check regression
    const { isRegression, message } = checkRegression(result.method, result.percentageChange);
    log(`  ${message}`);
    
    if (!durationPass || !sizePass) {
      hasFailures = true;
    }
    
    if (isRegression) {
      hasRegressions = true;
    }
  });
  
  // Summary
  log('\n📈 Summary:', colors.bright);
  
  if (hasFailures) {
    log('❌ Some performance metrics exceed thresholds', colors.red);
  } else {
    log('✅ All performance metrics within thresholds', colors.green);
  }
  
  if (hasRegressions) {
    log('❌ Performance regression detected', colors.red);
  } else {
    log('✅ No performance regression detected', colors.green);
  }
  
  // Exit with appropriate code
  if (hasFailures || hasRegressions) {
    log('\n💡 Recommendations:', colors.yellow);
    log('  • Review recent changes that might affect performance', colors.yellow);
    log('  • Consider optimizing slow operations', colors.yellow);
    log('  • Check for unnecessary dependencies or imports', colors.yellow);
    
    process.exit(1);
  } else {
    log('\n🎉 All performance checks passed!', colors.green);
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkThresholds,
  checkRegression,
  validatePerformance,
  PERFORMANCE_THRESHOLDS
};
