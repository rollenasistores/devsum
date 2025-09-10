// src/commands/update.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { UpdateChecker } from '../core/updateChecker.js';
import { getVersion } from '../utils/version.js';

const displayUpdateStatus = (hasUpdate: boolean, currentVersion: string, latestVersion?: string) => {
  console.log();
  console.log(chalk.blue('═'.repeat(55)));
  console.log(chalk.cyan.bold('📦 DevSum Update Status'));
  console.log();
  
  if (hasUpdate && latestVersion) {
    console.log(chalk.green('🎉 New version available!'));
    console.log();
    console.log(chalk.white(`📍 Current version: ${chalk.red(currentVersion)}`));
    console.log(chalk.white(`🚀 Latest version:  ${chalk.green(latestVersion)}`));
    console.log();
    
    console.log(chalk.yellow('📋 What\'s new:'));
    console.log(chalk.gray('   • Check release notes for latest features'));
    console.log(chalk.gray('   • Bug fixes and improvements'));
    console.log(chalk.gray('   • Enhanced performance'));
    console.log();
    
    console.log(chalk.cyan.bold('⬆️  Update Instructions:'));
    console.log();
    console.log(chalk.white('   npm install -g devsum'));
    console.log();
    console.log(chalk.gray('   or if you installed with yarn:'));
    console.log(chalk.white('   yarn global add devsum'));
    console.log();
    
    console.log(chalk.blue('📖 Release Notes:'));
    console.log(chalk.gray('   https://github.com/rollenasistores/devsum/releases'));
    
  } else {
    console.log(chalk.green('✅ You\'re up to date!'));
    console.log();
    console.log(chalk.white(`📍 Current version: ${chalk.green(currentVersion)}`));
    console.log(chalk.white(`🚀 Latest version:  ${chalk.green(latestVersion || currentVersion)}`));
    console.log();
    console.log(chalk.gray('🎯 You\'re running the latest version of DevSum.'));
    console.log(chalk.gray('   Keep generating amazing reports!'));
  }
  
  console.log();
  console.log(chalk.blue('═'.repeat(55)));
};

export const updateCommand = new Command('update')
  .description('Check for DevSum updates')
  .option('--check-only', 'Only check for updates without prompting')
  .action(async (options: { checkOnly?: boolean }) => {
    try {
      console.log(chalk.blue('🔍 Checking for DevSum updates...'));
      
      const currentVersion = getVersion();
      const updateChecker = new UpdateChecker('@rollenasistores/devsum', currentVersion);
      
      // Force check for latest version
      const updateInfo = await updateChecker.forceCheckForUpdates();
      
      displayUpdateStatus(
        updateInfo.hasUpdate || false,
        currentVersion,
        updateInfo.latestVersion
      );
      
      if (updateInfo.hasUpdate && !options.checkOnly) {
        console.log();
        console.log(chalk.yellow('💡 Run the update command above to get the latest features!'));
      }
      
    } catch (error) {
      console.log();
      console.log(chalk.red('═'.repeat(55)));
      console.log(chalk.red.bold('❌ Update Check Failed'));
      console.log();
      console.log(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      console.log();
      console.log(chalk.yellow('🔧 Troubleshooting:'));
      console.log(chalk.gray('   • Check your internet connection'));
      console.log(chalk.gray('   • Verify npm registry access'));
      console.log(chalk.gray('   • Try again in a few moments'));
      console.log();
      console.log(chalk.blue('Manual check: https://www.npmjs.com/package/@rollenasistores/devsum'));
      console.log(chalk.red('═'.repeat(55)));
      process.exit(1);
    }
  });