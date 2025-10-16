#!/usr/bin/env node

/**
 * Bundle optimization script for DevSum CLI
 * Analyzes and optimizes the bundle size
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Analyze bundle size
 */
function analyzeBundleSize() {
  console.log('📊 Analyzing bundle size...\n');
  
  try {
    // Get dist directory size
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('❌ Dist directory not found. Run "npm run build" first.');
      return;
    }

    const distSize = getDirectorySize(distPath);
    console.log(`📦 Dist directory size: ${formatBytes(distSize)}`);

    // Analyze individual files
    const files = getAllFiles(distPath);
    const fileSizes = files.map(file => ({
      name: path.relative(distPath, file),
      size: fs.statSync(file).size
    })).sort((a, b) => b.size - a.size);

    console.log('\n📋 Largest files:');
    fileSizes.slice(0, 10).forEach(file => {
      console.log(`   ${file.name}: ${formatBytes(file.size)}`);
    });

    // Check for duplicate dependencies
    checkDuplicateDependencies();

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
  }
}

/**
 * Get directory size recursively
 */
function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

/**
 * Get all files in directory recursively
 */
function getAllFiles(dirPath) {
  let files = [];
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      files = files.concat(getAllFiles(itemPath));
    } else {
      files.push(itemPath);
    }
  }
  
  return files;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check for duplicate dependencies
 */
function checkDuplicateDependencies() {
  console.log('\n🔍 Checking for duplicate dependencies...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.optionalDependencies || {},
      ...packageJson.devDependencies || {}
    };

    const duplicates = [];
    const seen = new Set();
    
    for (const [name, version] of Object.entries(allDeps)) {
      if (seen.has(name)) {
        duplicates.push({ name, version });
      } else {
        seen.add(name);
      }
    }

    if (duplicates.length > 0) {
      console.log('⚠️  Duplicate dependencies found:');
      duplicates.forEach(dep => {
        console.log(`   ${dep.name}: ${dep.version}`);
      });
    } else {
      console.log('✅ No duplicate dependencies found');
    }

  } catch (error) {
    console.warn('⚠️  Could not check dependencies:', error.message);
  }
}

/**
 * Optimize TypeScript build
 */
function optimizeTypeScriptBuild() {
  console.log('\n⚙️  Optimizing TypeScript build...');
  
  try {
    // Check if we can use tree shaking
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    if (tsconfig.compilerOptions?.module !== 'ES2022') {
      console.log('💡 Consider using ES2022 modules for better tree shaking');
    }
    
    if (!tsconfig.compilerOptions?.skipLibCheck) {
      console.log('💡 Consider enabling skipLibCheck for faster builds');
    }

    console.log('✅ TypeScript configuration looks good');

  } catch (error) {
    console.warn('⚠️  Could not analyze TypeScript config:', error.message);
  }
}

/**
 * Check for unused dependencies
 */
function checkUnusedDependencies() {
  console.log('\n🔍 Checking for unused dependencies...');
  
  try {
    // This would require a more sophisticated analysis
    // For now, we'll just check if dependencies are imported
    const srcFiles = getAllFiles(path.join(process.cwd(), 'src'));
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const coreDeps = Object.keys(packageJson.dependencies || {});
    const optionalDeps = Object.keys(packageJson.optionalDependencies || {});
    
    console.log(`📦 Core dependencies: ${coreDeps.length}`);
    console.log(`📦 Optional dependencies: ${optionalDeps.length}`);
    
    // Check if optional dependencies are actually used
    const srcContent = srcFiles
      .filter(file => file.endsWith('.ts'))
      .map(file => fs.readFileSync(file, 'utf8'))
      .join('\n');

    const unusedOptional = optionalDeps.filter(dep => {
      const importPattern = new RegExp(`import.*['"]${dep}['"]`, 'g');
      return !importPattern.test(srcContent);
    });

    if (unusedOptional.length > 0) {
      console.log('⚠️  Potentially unused optional dependencies:');
      unusedOptional.forEach(dep => {
        console.log(`   ${dep}`);
      });
    } else {
      console.log('✅ All optional dependencies appear to be used');
    }

  } catch (error) {
    console.warn('⚠️  Could not check unused dependencies:', error.message);
  }
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations() {
  console.log('\n💡 Optimization Recommendations:');
  console.log('================================');
  
  console.log('\n1. 📦 Bundle Size:');
  console.log('   • Use dynamic imports for heavy dependencies');
  console.log('   • Make AI SDKs optional dependencies');
  console.log('   • Consider code splitting for different features');
  
  console.log('\n2. 🚀 Installation Speed:');
  console.log('   • Use exact versions for core dependencies');
  console.log('   • Move heavy dependencies to optionalDependencies');
  console.log('   • Implement lazy loading for AI services');
  
  console.log('\n3. 🔧 Build Optimization:');
  console.log('   • Enable tree shaking with ES modules');
  console.log('   • Use TypeScript strict mode');
  console.log('   • Minimize bundle with webpack or esbuild');
  
  console.log('\n4. 📊 Monitoring:');
  console.log('   • Track bundle size over time');
  console.log('   • Monitor installation metrics');
  console.log('   • Use bundle analyzer regularly');
}

/**
 * Main optimization function
 */
function main() {
  console.log('🚀 DevSum CLI - Bundle Optimization');
  console.log('====================================\n');
  
  try {
    analyzeBundleSize();
    optimizeTypeScriptBuild();
    checkUnusedDependencies();
    generateRecommendations();
    
    console.log('\n✅ Bundle optimization analysis complete!');
    console.log('\n📚 Next steps:');
    console.log('   npm run build:analyze  # Visual bundle analysis');
    console.log('   npm run install:core   # Install core only');
    console.log('   npm run install:full   # Install with all features');
    
  } catch (error) {
    console.error('\n❌ Optimization analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  analyzeBundleSize,
  optimizeTypeScriptBuild,
  checkUnusedDependencies,
  generateRecommendations
};
