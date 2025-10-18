import { Command } from 'commander';
import chalk from 'chalk';
import { UpdateChecker } from '../core/updateChecker.js';
import { getVersion } from '../utils/version.js';
import { usageTracker } from '../core/usage-tracker.js';

/**
 * Update command class following TypeScript guidelines
 * Handles update checking and status display
 */
export class UpdateCommand {
  private readonly updateChecker: UpdateChecker;
  private readonly currentVersion: string;

  constructor() {
    this.currentVersion = getVersion();
    this.updateChecker = new UpdateChecker('@rollenasistores/devsum', this.currentVersion);
  }

  /**
   * Execute the update command
   */
  public async execute(options: { checkOnly?: boolean }): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let metadata: any = {};

    try {
      console.log(chalk.blue('🔍 Checking for DevSum updates...'));

      // Force check for latest version
      const updateInfo = await this.updateChecker.forceCheckForUpdates();

      this.displayUpdateStatus(
        updateInfo.hasUpdate || false,
        this.currentVersion,
        updateInfo.latestVersion
      );

      if (updateInfo.hasUpdate && !options.checkOnly) {
        console.log();
        console.log(chalk.yellow('💡 Run the update command above to get the latest features!'));
      }

      success = true;
    } catch (error) {
      this.displayUpdateError(error);
      success = false;
      process.exit(1);
    }

    // Track usage after execution
    const duration = Date.now() - startTime;
    metadata = {
      duration,
      command: 'update',
      checkOnly: options.checkOnly || false,
    };

    await usageTracker.trackUsage({
      commandType: 'commit', // Use commit as the closest match for update
      userId: await usageTracker.getUserId(),
      success,
      metadata,
    });
  }

  /**
   * Display update status information
   */
  private displayUpdateStatus(
    hasUpdate: boolean,
    currentVersion: string,
    latestVersion?: string
  ): void {
    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('📦 DevSum Update Status'));
    console.log();

    if (hasUpdate && latestVersion) {
      this.displayUpdateAvailable(currentVersion, latestVersion);
    } else {
      this.displayUpToDate(currentVersion, latestVersion);
    }

    console.log();
    console.log(chalk.blue('═'.repeat(55)));
  }

  /**
   * Display update available information
   */
  private displayUpdateAvailable(currentVersion: string, latestVersion: string): void {
    console.log(chalk.green('🎉 New version available!'));
    console.log();
    console.log(chalk.white(`📍 Current version: ${chalk.red(currentVersion)}`));
    console.log(chalk.white(`🚀 Latest version:  ${chalk.green(latestVersion)}`));
    console.log();

    console.log(chalk.yellow("📋 What's new:"));
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
    console.log(chalk.gray('   http://devsum.rollenasistores.site/'));
  }

  /**
   * Display up-to-date information
   */
  private displayUpToDate(currentVersion: string, latestVersion?: string): void {
    console.log(chalk.green("✅ You're up to date!"));
    console.log();
    console.log(chalk.white(`📍 Current version: ${chalk.green(currentVersion)}`));
    console.log(chalk.white(`🚀 Latest version:  ${chalk.green(latestVersion || currentVersion)}`));
    console.log();
    console.log(chalk.gray("🎯 You're running the latest version of DevSum."));
    console.log(chalk.gray('   Keep generating amazing reports!'));
  }

  /**
   * Display update error
   */
  private displayUpdateError(error: unknown): void {
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
  }
}

// Create command instance
const updateCommandInstance = new UpdateCommand();

export const updateCommand = new Command('update')
  .description('Check for DevSum updates')
  .option('--check-only', 'Only check for updates without prompting')
  .action(async (options: { checkOnly?: boolean }) => {
    await updateCommandInstance.execute(options);
  });
