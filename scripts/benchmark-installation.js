#!/usr/bin/env node

/**
 * Installation speed benchmark script
 * Measures and compares different installation methods
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test configuration
 */
const TEST_CONFIG = {
  iterations: 3,
  cleanup: true,
  tempDir: '/tmp/devsum-benchmark',
  packageName: '@rollenasistores/devsum'
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
 * Create temporary directory
 */
function createTempDir() {
  const tempDir = path.join(TEST_CONFIG.tempDir, `test-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 */
function cleanupTempDir(dir) {
  try {
    execSync(`rm -rf "${dir}"`, { stdio: 'ignore' });
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Measure command execution time
 */
function measureCommand(command, cwd) {
  const startTime = process.hrtime.bigint();
  
  try {
    execSync(command, { 
      cwd, 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    
    return { duration, success: true };
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1_000_000;
    
    return { 
      duration, 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
}

/**
 * Get directory size
 */
function getDirectorySize(dirPath) {
  try {
    const result = execSync(`du -sb "${dirPath}"`, { encoding: 'utf8' });
    return parseInt(result.split('\t')[0]);
  } catch (error) {
    return 0;
  }
}

/**
 * Test core installation
 */
function testCoreInstallation() {
  log('🧪 Testing Core Installation...', colors.blue);
  
  const tempDir = createTempDir();
  const startTime = Date.now();
  
  try {
    // Create package.json for testing
    const packageJson = {
      name: 'devsum-test',
      version: '1.0.0',
      dependencies: {
        'chalk': '5.3.0',
        'commander': '12.1.0',
        'marked': '16.2.1',
        'simple-git': '3.25.0'
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
    
    // Measure npm install
    const { duration, success, error } = measureCommand('npm install', tempDir);
    
    const size = getDirectorySize(path.join(tempDir, 'node_modules'));
    
    if (TEST_CONFIG.cleanup) {
      cleanupTempDir(tempDir);
    }
    
    return {
      method: 'Core Installation',
      duration,
      size,
      success,
      error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (TEST_CONFIG.cleanup) {
      cleanupTempDir(tempDir);
    }
    
    return {
      method: 'Core Installation',
      duration: 0,
      size: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test full installation
 */
function testFullInstallation() {
  log('🧪 Testing Full Installation...', colors.blue);
  
  const tempDir = createTempDir();
  
  try {
    // Create package.json with all dependencies
    const packageJson = {
      name: 'devsum-test',
      version: '1.0.0',
      dependencies: {
        'chalk': '5.3.0',
        'commander': '12.1.0',
        'marked': '16.2.1',
        'simple-git': '3.25.0'
      },
      optionalDependencies: {
        '@anthropic-ai/sdk': '^0.24.3',
        '@google/generative-ai': '^0.24.1',
        'inquirer': '^9.2.15',
        'openai': '^5.20.2',
        'puppeteer': '^24.19.0'
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'package.json'), 
      JSON.stringify(packageJson, null, 2)
    );
    
    // Measure npm install
    const { duration, success, error } = measureCommand('npm install', tempDir);
    
    const size = getDirectorySize(path.join(tempDir, 'node_modules'));
    
    if (TEST_CONFIG.cleanup) {
      cleanupTempDir(tempDir);
    }
    
    return {
      method: 'Full Installation',
      duration,
      size,
      success,
      error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (TEST_CONFIG.cleanup) {
      cleanupTempDir(tempDir);
    }
    
    return {
      method: 'Full Installation',
      duration: 0,
      size: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test npx execution
 */
function testNpxExecution() {
  log('🧪 Testing NPX Execution...', colors.blue);
  
  try {
    const { duration, success, error } = measureCommand('npx @rollenasistores/devsum@latest --version');
    
    return {
      method: 'NPX Execution',
      duration,
      size: 0, // NPX doesn't install locally
      success,
      error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      method: 'NPX Execution',
      duration: 0,
      size: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test Docker build
 */
function testDockerBuild() {
  log('🧪 Testing Docker Build...', colors.blue);
  
  const tempDir = createTempDir();
  
  try {
    // Copy necessary files for Docker build
    const filesToCopy = [
      'package.json',
      'tsconfig.json',
      'src/',
      'bin/',
      'Dockerfile'
    ];
    
    filesToCopy.forEach(file => {
      const src = path.join(process.cwd(), file);
      const dest = path.join(tempDir, file);
      
      if (fs.existsSync(src)) {
        if (fs.statSync(src).isDirectory()) {
          execSync(`cp -r "${src}" "${dest}"`, { stdio: 'ignore' });
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    });
    
    // Measure Docker build
    const { duration, success, error } = measureCommand(
      `docker build -t devsum-benchmark .`, 
      tempDir
    );
    
    // Get Docker image size
    let size = 0;
    if (success) {
      try {
        const sizeResult = execSync('docker images devsum-benchmark --format "{{.Size}}"', { encoding: 'utf8' });
        // Parse size (e.g., "123MB" -> 123 * 1024 * 1024)
        const sizeMatch = sizeResult.match(/(\d+(?:\.\d+)?)(MB|GB)/);
        if (sizeMatch) {
          const value = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2];
          size = unit === 'GB' ? value * 1024 * 1024 * 1024 : value * 1024 * 1024;
        }
      } catch (sizeError) {
        // Ignore size parsing errors
      }
    }
    
    if (TEST_CONFIG.cleanup) {
      cleanupTempDir(tempDir);
      try {
        execSync('docker rmi devsum-benchmark', { stdio: 'ignore' });
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    
    return {
      method: 'Docker Build',
      duration,
      size,
      success,
      error,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (TEST_CONFIG.cleanup) {
      cleanupTempDir(tempDir);
    }
    
    return {
      method: 'Docker Build',
      duration: 0,
      size: 0,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run benchmark for a specific method
 */
async function runBenchmark(method) {
  const results = [];
  
  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    log(`\n🔄 Iteration ${i + 1}/${TEST_CONFIG.iterations}`, colors.yellow);
    
    const result = method();
    results.push(result);
    
    if (result.success) {
      log(`✅ ${result.method}: ${result.duration.toFixed(2)}ms, ${formatBytes(result.size)}`, colors.green);
    } else {
      log(`❌ ${result.method}: Failed - ${result.error}`, colors.red);
    }
    
    // Wait between iterations
    if (i < TEST_CONFIG.iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

/**
 * Calculate statistics
 */
function calculateStats(results) {
  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    return {
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      avgSize: 0,
      successRate: 0
    };
  }
  
  const durations = successfulResults.map(r => r.duration);
  const sizes = successfulResults.map(r => r.size);
  
  return {
    avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
    successRate: (successfulResults.length / results.length) * 100
  };
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
 * Display results table
 */
function displayResults(allResults) {
  log('\n📊 Benchmark Results Summary', colors.bright);
  log('='.repeat(80), colors.cyan);
  
  const methods = Object.keys(allResults);
  const tableData = methods.map(method => {
    const results = allResults[method];
    const stats = calculateStats(results);
    
    return {
      method,
      avgDuration: stats.avgDuration,
      minDuration: stats.minDuration,
      maxDuration: stats.maxDuration,
      avgSize: stats.avgSize,
      successRate: stats.successRate
    };
  });
  
  // Sort by average duration
  tableData.sort((a, b) => a.avgDuration - b.avgDuration);
  
  log('\n| Method           | Avg Time | Min Time | Max Time | Avg Size | Success |', colors.cyan);
  log('|------------------|----------|----------|----------|----------|---------|', colors.cyan);
  
  tableData.forEach(data => {
    const method = data.method.padEnd(16);
    const avgTime = `${data.avgDuration.toFixed(0)}ms`.padStart(8);
    const minTime = `${data.minDuration.toFixed(0)}ms`.padStart(8);
    const maxTime = `${data.maxDuration.toFixed(0)}ms`.padStart(8);
    const avgSize = formatBytes(data.avgSize).padStart(8);
    const success = `${data.successRate.toFixed(0)}%`.padStart(7);
    
    log(`| ${method} | ${avgTime} | ${minTime} | ${maxTime} | ${avgSize} | ${success} |`);
  });
  
  log('\n🏆 Performance Ranking:', colors.bright);
  tableData.forEach((data, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
    log(`${medal} ${index + 1}. ${data.method}: ${data.avgDuration.toFixed(0)}ms avg`, colors.yellow);
  });
}

/**
 * Save results to file
 */
function saveResults(allResults) {
  const resultsFile = path.join(process.cwd(), 'benchmark-results.json');
  const summary = {
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG,
    results: allResults,
    summary: Object.keys(allResults).reduce((acc, method) => {
      acc[method] = calculateStats(allResults[method]);
      return acc;
    }, {})
  };
  
  fs.writeFileSync(resultsFile, JSON.stringify(summary, null, 2));
  log(`\n💾 Results saved to: ${resultsFile}`, colors.green);
}

/**
 * Main benchmark function
 */
async function main() {
  log('🚀 DevSum CLI Installation Speed Benchmark', colors.bright);
  log('='.repeat(50), colors.cyan);
  log(`\n📋 Configuration:`, colors.yellow);
  log(`   • Iterations: ${TEST_CONFIG.iterations}`);
  log(`   • Cleanup: ${TEST_CONFIG.cleanup ? 'Enabled' : 'Disabled'}`);
  log(`   • Temp Directory: ${TEST_CONFIG.tempDir}`);
  
  const allResults = {};
  
  // Test each method
  const methods = [
    { name: 'Core Installation', fn: testCoreInstallation },
    { name: 'Full Installation', fn: testFullInstallation },
    { name: 'NPX Execution', fn: testNpxExecution },
    { name: 'Docker Build', fn: testDockerBuild }
  ];
  
  for (const method of methods) {
    log(`\n🧪 Testing ${method.name}...`, colors.magenta);
    allResults[method.name] = await runBenchmark(method.fn);
  }
  
  // Display results
  displayResults(allResults);
  
  // Save results
  saveResults(allResults);
  
  log('\n✅ Benchmark completed!', colors.green);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`\n❌ Benchmark failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

export {
  testCoreInstallation,
  testFullInstallation,
  testNpxExecution,
  testDockerBuild,
  calculateStats,
  formatBytes
};
