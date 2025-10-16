#!/usr/bin/env node

/**
 * Performance monitoring script
 * Tracks real-time performance metrics during development
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Performance monitor state
 */
let metrics = [];
let startTime = Date.now();
let startCpuUsage = process.cpuUsage();

/**
 * Start monitoring an operation
 */
function startOperation(operation) {
  const startTime = process.hrtime.bigint();
  const startCpuUsage = process.cpuUsage();
  
  return () => {
    const endTime = process.hrtime.bigint();
    const endCpuUsage = process.cpuUsage(startCpuUsage);
    const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
    
    const metric = {
      timestamp: new Date().toISOString(),
      operation,
      duration,
      memoryUsage: process.memoryUsage(),
      cpuUsage: endCpuUsage
    };
    
    metrics.push(metric);
    return metric;
  };
}

/**
 * Get current metrics
 */
function getMetrics() {
  return [...metrics];
}

/**
 * Get summary statistics
 */
function getSummary() {
  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  const memoryPeak = Math.max(...metrics.map(m => m.memoryUsage.heapUsed));
  const cpuPeak = Math.max(...metrics.map(m => m.cpuUsage.user + m.cpuUsage.system));
  
  const operations = {};
  
  metrics.forEach(metric => {
    if (!operations[metric.operation]) {
      operations[metric.operation] = { count: 0, avgDuration: 0, totalDuration: 0 };
    }
    
    operations[metric.operation].count++;
    operations[metric.operation].totalDuration += metric.duration;
    operations[metric.operation].avgDuration = operations[metric.operation].totalDuration / operations[metric.operation].count;
  });
  
  return {
    totalOperations: metrics.length,
    totalDuration,
    averageDuration: totalDuration / metrics.length || 0,
    memoryPeak,
    cpuPeak,
    operations
  };
}

/**
 * Save metrics to file
 */
function saveMetrics(filename) {
  const file = filename || path.join(process.cwd(), 'performance-metrics.json');
  const data = {
    summary: getSummary(),
    metrics: metrics,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`📊 Performance metrics saved to: ${file}`);
}

/**
 * Clear metrics
 */
function clear() {
  metrics = [];
  startTime = Date.now();
  startCpuUsage = process.cpuUsage();
}

/**
 * Measure bundle size
 */
function measureBundleSize() {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      return 0;
    }
    
    const result = execSync(`du -sb "${distPath}"`, { encoding: 'utf8' });
    return parseInt(result.split('\t')[0]);
  } catch (error) {
    return 0;
  }
}

/**
 * Count dependencies
 */
function countDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {}).length;
    const optionalDeps = Object.keys(packageJson.optionalDependencies || {}).length;
    return deps + optionalDeps;
  } catch (error) {
    return 0;
  }
}

/**
 * Monitor build process
 */
function monitorBuild() {
  console.log('🔍 Monitoring build process...');
  
  const endBuild = startOperation('Build');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    
    const metric = endBuild();
    metric.bundleSize = measureBundleSize();
    metric.dependenciesCount = countDependencies();
    
    console.log(`✅ Build completed in ${metric.duration.toFixed(2)}ms`);
    console.log(`📦 Bundle size: ${formatBytes(metric.bundleSize || 0)}`);
    console.log(`📚 Dependencies: ${metric.dependenciesCount}`);
  } catch (error) {
    console.error('❌ Build failed:', error);
  }
}

/**
 * Monitor test process
 */
function monitorTests() {
  console.log('🧪 Monitoring test process...');
  
  const endTests = startOperation('Tests');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    
    const metric = endTests();
    console.log(`✅ Tests completed in ${metric.duration.toFixed(2)}ms`);
  } catch (error) {
    console.error('❌ Tests failed:', error);
  }
}

/**
 * Monitor installation process
 */
function monitorInstallation() {
  console.log('📦 Monitoring installation process...');
  
  const endInstall = startOperation('Installation');
  
  try {
    // Create temporary package.json for testing
    const tempDir = '/tmp/devsum-perf-test';
    fs.mkdirSync(tempDir, { recursive: true });
    
    const packageJson = {
      name: 'devsum-perf-test',
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
    
    execSync('npm install', { cwd: tempDir, stdio: 'pipe' });
    
    const metric = endInstall();
    console.log(`✅ Installation completed in ${metric.duration.toFixed(2)}ms`);
    
    // Cleanup
    execSync(`rm -rf "${tempDir}"`, { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Installation failed:', error);
  }
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
 * Display performance summary
 */
function displaySummary() {
  const summary = getSummary();
  
  console.log('\n📊 Performance Summary');
  console.log('='.repeat(50));
  console.log(`Total Operations: ${summary.totalOperations}`);
  console.log(`Total Duration: ${summary.totalDuration.toFixed(2)}ms`);
  console.log(`Average Duration: ${summary.averageDuration.toFixed(2)}ms`);
  console.log(`Memory Peak: ${formatBytes(summary.memoryPeak)}`);
  console.log(`CPU Peak: ${summary.cpuPeak}μs`);
  
  console.log('\n📋 Operation Breakdown:');
  Object.entries(summary.operations).forEach(([operation, stats]) => {
    console.log(`  ${operation}: ${stats.count} runs, ${stats.avgDuration.toFixed(2)}ms avg`);
  });
}

/**
 * Main monitoring function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  console.log('🚀 DevSum CLI Performance Monitor');
  console.log('='.repeat(40));
  
  switch (command) {
    case 'build':
      monitorBuild();
      break;
    case 'test':
      monitorTests();
      break;
    case 'install':
      monitorInstallation();
      break;
    case 'all':
      monitorBuild();
      monitorTests();
      monitorInstallation();
      break;
    default:
      console.log('Usage: node monitor-performance.js [build|test|install|all]');
      process.exit(1);
  }
  
  displaySummary();
  saveMetrics();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  startOperation, 
  getMetrics, 
  getSummary, 
  saveMetrics, 
  clear,
  monitorBuild,
  monitorTests,
  monitorInstallation
};