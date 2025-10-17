import chalk from 'chalk';
import { UpdateChecker } from './updateChecker.js';
import { getVersion } from '../utils/version.js';

export class ForcedUpdate {
  private updateChecker: UpdateChecker;

  constructor() {
    this.updateChecker = new UpdateChecker('@rollenasistores/devsum', getVersion());
  }

  /**
   * Check and enforce forced updates
   */
  async checkAndEnforce(): Promise<boolean> {
    try {
      // Check for bypass environment variable
      if (process.env.DEVSUM_SKIP_UPDATE_CHECK === 'true' || 
          process.env.CI === 'true' || 
          process.env.NODE_ENV === 'test') {
        return true; // Skip forced update checks in CI/test environments
      }

      const { required, updateInfo } = await this.updateChecker.checkForcedUpdate();
      
      if (!required || !updateInfo) {
        return true; // No forced update required, continue
      }

      this.displayForcedUpdateMessage(updateInfo);
      return false; // Block execution
    } catch (error) {
      // If update check fails, allow execution to continue
      return true;
    }
  }

  /**
   * Display forced update message
   */
  private displayForcedUpdateMessage(updateInfo: any): void {
    console.clear();
    console.log(chalk.red.bold('🚨 CRITICAL UPDATE REQUIRED'));
    console.log();
    console.log(chalk.yellow('Your DevSum CLI is significantly outdated and must be updated to continue.'));
    console.log();
    console.log(chalk.white(`Current version: ${chalk.red(updateInfo.currentVersion)}`));
    console.log(chalk.white(`Latest version:  ${chalk.green(updateInfo.latestVersion)}`));
    console.log();

    if (updateInfo.criticalUpdate) {
      console.log(chalk.red.bold('⚠️  CRITICAL UPDATE DETECTED'));
      console.log(chalk.yellow('This is a major version update with breaking changes and security fixes.'));
      console.log();
    } else {
      console.log(chalk.yellow.bold('📦 SIGNIFICANT UPDATE DETECTED'));
      console.log(chalk.gray('You are more than 2 minor versions behind the latest release.'));
      console.log();
    }

    console.log(chalk.cyan.bold('🔄 Update Instructions:'));
    console.log();
    console.log(chalk.white('   npm install -g @rollenasistores/devsum'));
    console.log();
    console.log(chalk.gray('   or if you installed with yarn:'));
    console.log(chalk.white('   yarn global add @rollenasistores/devsum'));
    console.log();
    console.log(chalk.blue('📖 Release Notes:'));
    console.log(chalk.gray('   https://github.com/rollenasistores/devsum/releases'));
    console.log();
    console.log(chalk.red.bold('❌ DevSum CLI execution blocked until update is completed.'));
    console.log(chalk.gray('   Please update and try again.'));
    console.log();
    console.log(chalk.blue('═'.repeat(60)));
  }

  /**
   * Check for updates without blocking (for non-critical updates)
   */
  async checkForUpdates(): Promise<void> {
    try {
      const updateInfo = await this.updateChecker.checkForUpdates();
      
      if (updateInfo?.hasUpdate && !updateInfo.criticalUpdate) {
        this.displayUpdateAvailable(updateInfo);
      }
    } catch (error) {
      // Silently fail for non-critical update checks
    }
  }

  /**
   * Display non-critical update available message
   */
  private displayUpdateAvailable(updateInfo: any): void {
    console.log();
    console.log(chalk.blue('═'.repeat(50)));
    console.log(chalk.yellow('📦 Update Available'));
    console.log(chalk.gray(`   Current: ${updateInfo.currentVersion}`));
    console.log(chalk.gray(`   Latest:  ${updateInfo.latestVersion}`));
    console.log(chalk.gray('   Run "devsum update" to update'));
    console.log(chalk.blue('═'.repeat(50)));
    console.log();
  }
}

export const forcedUpdate = new ForcedUpdate();
