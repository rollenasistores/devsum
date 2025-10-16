#!/usr/bin/env node

/**
 * Post-installation setup script for DevSum CLI
 * Handles initial configuration and setup
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Create configuration directory
 */
function createConfigDirectory() {
  const configDir = path.join(os.homedir(), '.config', 'devsum');
  
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`✅ Created config directory: ${configDir}`);
    } else {
      console.log(`✅ Config directory already exists: ${configDir}`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not create config directory: ${error.message}`);
  }
}

/**
 * Create reports directory
 */
function createReportsDirectory() {
  const reportsDir = path.join(process.cwd(), 'reports');
  
  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
      console.log(`✅ Created reports directory: ${reportsDir}`);
    } else {
      console.log(`✅ Reports directory already exists: ${reportsDir}`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not create reports directory: ${error.message}`);
  }
}

/**
 * Check for existing configuration
 */
function checkExistingConfig() {
  const configFile = path.join(os.homedir(), '.config', 'devsum', 'config.json');
  
  if (fs.existsSync(configFile)) {
    console.log('✅ Existing configuration found');
    return true;
  } else {
    console.log('ℹ️  No existing configuration found');
    console.log('   Run "devsum setup" to configure your AI providers');
    return false;
  }
}

/**
 * Display installation success message
 */
function displaySuccessMessage() {
  console.log('\n🎉 DevSum CLI installed successfully!');
  console.log('\n📚 Quick Start:');
  console.log('   devsum setup          # Configure AI providers');
  console.log('   devsum report         # Generate your first report');
  console.log('   devsum commit         # Generate commit messages');
  console.log('   devsum analytics      # View development analytics');
  console.log('\n📖 Documentation:');
  console.log('   https://github.com/rollenasistores/devsum#readme');
  console.log('\n💡 Pro Tips:');
  console.log('   • Use "devsum report --today" for today\'s commits');
  console.log('   • Use "devsum commit --auto" for automated workflow');
  console.log('   • Use "devsum analytics --focus productivity" for insights');
}

/**
 * Check optional dependencies
 */
function checkOptionalDependencies() {
  const optionalDeps = [
    '@anthropic-ai/sdk',
    '@google/generative-ai', 
    'openai',
    'puppeteer',
    'inquirer'
  ];
  
  console.log('\n🔍 Checking optional dependencies:');
  
  optionalDeps.forEach(dep => {
    try {
      require.resolve(dep);
      console.log(`   ✅ ${dep} - Available`);
    } catch (error) {
      console.log(`   ⚠️  ${dep} - Not installed (optional)`);
    }
  });
  
  console.log('\n💡 To install all optional dependencies:');
  console.log('   npm install --save-optional @anthropic-ai/sdk @google/generative-ai openai puppeteer inquirer');
}

/**
 * Main setup function
 */
function main() {
  console.log('🚀 DevSum CLI - Post-Installation Setup');
  console.log('========================================\n');
  
  try {
    createConfigDirectory();
    createReportsDirectory();
    const hasConfig = checkExistingConfig();
    checkOptionalDependencies();
    displaySuccessMessage();
    
    if (!hasConfig) {
      console.log('\n⚠️  Remember to run "devsum setup" to configure your AI providers!');
    }
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  createConfigDirectory,
  createReportsDirectory,
  checkExistingConfig,
  displaySuccessMessage,
  checkOptionalDependencies
};
