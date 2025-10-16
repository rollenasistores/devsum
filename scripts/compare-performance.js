#!/usr/bin/env node

/**
 * Performance comparison script
 * Compares current performance with baseline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Load performance data
 */
function loadPerformanceData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`❌ Error loading ${filePath}: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Compare performance metrics
 */
function comparePerformance(baselineData, currentData) {
  const results = [];
  
  if (!baselineData || !currentData) {
    return results;
  }
  
  const baselineSummary = baselineData.summary || {};
  const currentSummary = currentData.summary || {};
  
  // Compare each method
  const methods = new Set([
    ...Object.keys(baselineSummary),
    ...Object.keys(currentSummary)
  ]);
  
  for (const method of methods) {
    const baseline = baselineSummary[method];
    const current = currentSummary[method];
    
    if (!baseline || !current) {
      continue;
    }
    
    const baselineDuration = baseline.avgDuration || 0;
    const currentDuration = current.avgDuration || 0;
    const difference = currentDuration - baselineDuration;
    const percentageChange = baselineDuration > 0 ? (difference / baselineDuration) * 100 : 0;
    
    let status;
    let significance;
    
    if (Math.abs(percentageChange) < 5) {
      status = 'unchanged';
      significance = 'low';
    } else if (Math.abs(percentageChange) < 20) {
      significance = 'medium';
      status = percentageChange < 0 ? 'improved' : 'regressed';
    } else {
      significance = 'high';
      status = percentageChange < 0 ? 'improved' : 'regressed';
    }
    
    results.push({
      method,
      baseline: baselineDuration,
      current: currentDuration,
      difference,
      percentageChange,
      status,
      significance
    });
  }
  
  return results;
}

/**
 * Display comparison results
 */
function displayResults(results) {
  log('\n📊 Performance Comparison Results', colors.bright);
  log('='.repeat(60), colors.cyan);
  
  if (results.length === 0) {
    log('⚠️ No comparison data available', colors.yellow);
    return;
  }
  
  // Sort by significance and percentage change
  results.sort((a, b) => {
    const significanceOrder = { high: 3, medium: 2, low: 1 };
    const significanceDiff = significanceOrder[b.significance] - significanceOrder[a.significance];
    
    if (significanceDiff !== 0) {
      return significanceDiff;
    }
    
    return Math.abs(b.percentageChange) - Math.abs(a.percentageChange);
  });
  
  log('\n| Method           | Baseline | Current | Change   | Status    |', colors.cyan);
  log('|------------------|----------|---------|----------|-----------|', colors.cyan);
  
  results.forEach(result => {
    const method = result.method.padEnd(16);
    const baseline = `${result.baseline.toFixed(0)}ms`.padStart(8);
    const current = `${result.current.toFixed(0)}ms`.padStart(7);
    const change = `${result.percentageChange > 0 ? '+' : ''}${result.percentageChange.toFixed(1)}%`.padStart(8);
    
    let statusColor = colors.reset;
    let statusText = result.status;
    
    switch (result.status) {
      case 'improved':
        statusColor = colors.green;
        statusText = '✅ Improved';
        break;
      case 'regressed':
        statusColor = colors.red;
        statusText = '❌ Regressed';
        break;
      case 'unchanged':
        statusColor = colors.yellow;
        statusText = '➖ Unchanged';
        break;
    }
    
    const status = statusText.padStart(9);
    
    log(`| ${method} | ${baseline} | ${current} | ${change} | ${statusColor}${status}${colors.reset} |`);
  });
  
  // Summary statistics
  const improved = results.filter(r => r.status === 'improved').length;
  const regressed = results.filter(r => r.status === 'regressed').length;
  const unchanged = results.filter(r => r.status === 'unchanged').length;
  
  log('\n📈 Summary:', colors.bright);
  log(`  ✅ Improved: ${improved}`, colors.green);
  log(`  ❌ Regressed: ${regressed}`, colors.red);
  log(`  ➖ Unchanged: ${unchanged}`, colors.yellow);
  
  // Highlight significant changes
  const significantChanges = results.filter(r => r.significance === 'high');
  if (significantChanges.length > 0) {
    log('\n🚨 Significant Changes:', colors.bright);
    significantChanges.forEach(result => {
      const direction = result.percentageChange < 0 ? 'improved' : 'regressed';
      const color = result.percentageChange < 0 ? colors.green : colors.red;
      log(`  • ${result.method}: ${Math.abs(result.percentageChange).toFixed(1)}% ${direction}`, color);
    });
  }
}

/**
 * Save comparison results
 */
function saveResults(results) {
  const comparisonData = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      improved: results.filter(r => r.status === 'improved').length,
      regressed: results.filter(r => r.status === 'regressed').length,
      unchanged: results.filter(r => r.status === 'unchanged').length,
      significantChanges: results.filter(r => r.significance === 'high').length
    }
  };
  
  const outputFile = path.join(process.cwd(), 'performance-comparison.json');
  fs.writeFileSync(outputFile, JSON.stringify(comparisonData, null, 2));
  log(`\n💾 Comparison results saved to: ${outputFile}`, colors.green);
}

/**
 * Check for performance regression
 */
function checkRegression(results) {
  const significantRegressions = results.filter(r => 
    r.status === 'regressed' && r.significance === 'high'
  );
  
  if (significantRegressions.length > 0) {
    log('\n❌ Performance regression detected!', colors.red);
    significantRegressions.forEach(result => {
      log(`  • ${result.method}: ${result.percentageChange.toFixed(1)}% slower`, colors.red);
    });
    return true;
  }
  
  log('\n✅ No significant performance regression detected', colors.green);
  return false;
}

/**
 * Main comparison function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    log('Usage: node compare-performance.js <baseline-file> <current-file>', colors.red);
    process.exit(1);
  }
  
  const baselineFile = args[0];
  const currentFile = args[1];
  
  log('🔍 Loading performance data...', colors.blue);
  
  const baselineData = loadPerformanceData(baselineFile);
  const currentData = loadPerformanceData(currentFile);
  
  if (!baselineData || !currentData) {
    log('❌ Failed to load performance data', colors.red);
    process.exit(1);
  }
  
  log('📊 Comparing performance metrics...', colors.blue);
  
  const results = comparePerformance(baselineData, currentData);
  
  displayResults(results);
  saveResults(results);
  
  const hasRegression = checkRegression(results);
  
  if (hasRegression) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  comparePerformance,
  displayResults,
  saveResults,
  checkRegression
};
