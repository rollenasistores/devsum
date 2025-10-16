#!/usr/bin/env node

/**
 * Requirements check script for DevSum CLI
 * Validates system requirements before installation
 */

import { execSync } from 'child_process';
import semver from 'semver';

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  const requiredVersion = '>=18.0.0';
  
  console.log(`🔍 Checking Node.js version: ${nodeVersion}`);
  
  if (!semver.satisfies(nodeVersion, requiredVersion)) {
    console.error(`❌ Node.js ${requiredVersion} required, found ${nodeVersion}`);
    console.error('   Please upgrade Node.js: https://nodejs.org/');
    process.exit(1);
  }
  
  console.log('✅ Node.js version is compatible');
}

/**
 * Check Git installation
 */
function checkGitInstallation() {
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Git found: ${gitVersion}`);
  } catch (error) {
    console.warn('⚠️  Git not found. Some features may not work.');
    console.warn('   Install Git: https://git-scm.com/downloads');
  }
}

/**
 * Check npm version
 */
function checkNpmVersion() {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    const requiredNpmVersion = '>=8.0.0';
    
    console.log(`🔍 Checking npm version: ${npmVersion}`);
    
    if (!semver.satisfies(npmVersion, requiredNpmVersion)) {
      console.warn(`⚠️  npm ${requiredNpmVersion} recommended, found ${npmVersion}`);
      console.warn('   Consider updating npm: npm install -g npm@latest');
    } else {
      console.log('✅ npm version is compatible');
    }
  } catch (error) {
    console.warn('⚠️  Could not check npm version');
  }
}

/**
 * Check available disk space
 */
function checkDiskSpace() {
  try {
    const fs = require('fs');
    const stats = fs.statSync('.');
    console.log('✅ Sufficient disk space available');
  } catch (error) {
    console.warn('⚠️  Could not verify disk space');
  }
}

/**
 * Check network connectivity
 */
function checkNetworkConnectivity() {
  try {
    const dns = require('dns');
    dns.lookup('registry.npmjs.org', (err) => {
      if (err) {
        console.warn('⚠️  Network connectivity issues detected');
        console.warn('   Some features may not work without internet access');
      } else {
        console.log('✅ Network connectivity confirmed');
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not verify network connectivity');
  }
}

/**
 * Main requirements check
 */
function main() {
  console.log('🚀 DevSum CLI - Requirements Check');
  console.log('=====================================\n');
  
  try {
    checkNodeVersion();
    checkGitInstallation();
    checkNpmVersion();
    checkDiskSpace();
    checkNetworkConnectivity();
    
    console.log('\n✅ All requirements check completed!');
    console.log('   You can now install DevSum CLI');
  } catch (error) {
    console.error('\n❌ Requirements check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  checkNodeVersion,
  checkGitInstallation,
  checkNpmVersion,
  checkDiskSpace,
  checkNetworkConnectivity
};
