// src/core/updateChecker.ts
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface UpdateInfo {
  lastChecked: string;
  latestVersion?: string;
  currentVersion: string;
  hasUpdate?: boolean;
}

interface PackageInfo {
  name: string;
  version: string;
  'dist-tags': {
    latest: string;
  };
  time: {
    [version: string]: string;
  };
}

export class UpdateChecker {
  private updateFile: string;
  private packageName: string;
  private currentVersion: string;
  
  constructor(packageName: string, currentVersion: string) {
    this.packageName = packageName;
    this.currentVersion = currentVersion;
    this.updateFile = path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.devsum-update-check');
  }

  /**
   * Check for updates (non-blocking, cached)
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const updateInfo = await this.getUpdateInfo();
      
      // Check once per day
      const lastChecked = new Date(updateInfo.lastChecked);
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now.getTime() - lastChecked.getTime() < oneDay) {
        return updateInfo;
      }

      // Fetch latest version from npm (with timeout)
      const latestVersion = await this.fetchLatestVersion();
      
      const newUpdateInfo: UpdateInfo = {
        lastChecked: now.toISOString(),
        latestVersion,
        currentVersion: this.currentVersion,
        hasUpdate: this.isNewerVersion(latestVersion, this.currentVersion)
      };

      // Save update info (don't await to avoid blocking)
      this.saveUpdateInfo(newUpdateInfo).catch(() => {});
      
      return newUpdateInfo;
    } catch (error) {
      // Fail silently for update checks
      return null;
    }
  }

  /**
   * Display update notification if available
   */
  static displayUpdateNotification(updateInfo: UpdateInfo | null) {
    if (!updateInfo?.hasUpdate || !updateInfo.latestVersion) {
      return;
    }

    console.log();
    console.log(chalk.yellow('┌' + '─'.repeat(58) + '┐'));
    console.log(chalk.yellow('│') + chalk.bold.cyan('  🚀 DevSum Update Available!') + ' '.repeat(28) + chalk.yellow('│'));
    console.log(chalk.yellow('│') + ' '.repeat(58) + chalk.yellow('│'));
    console.log(chalk.yellow('│') + `  Current: ${chalk.red(updateInfo.currentVersion)}` + ' '.repeat(58 - `  Current: ${updateInfo.currentVersion}`.length) + chalk.yellow('│'));
    console.log(chalk.yellow('│') + `  Latest:  ${chalk.green(updateInfo.latestVersion)}` + ' '.repeat(58 - `  Latest:  ${updateInfo.latestVersion}`.length) + chalk.yellow('│'));
    console.log(chalk.yellow('│') + ' '.repeat(58) + chalk.yellow('│'));
    console.log(chalk.yellow('│') + chalk.white('  Update now: ') + chalk.cyan('npm install -g devsum') + ' '.repeat(16) + chalk.yellow('│'));
    console.log(chalk.yellow('│') + chalk.gray('  Release notes: https://github.com/your-org/devsum/releases') + ' '.repeat(1) + chalk.yellow('│'));
    console.log(chalk.yellow('└' + '─'.repeat(58) + '┘'));
    console.log();
  }

  /**
   * Get cached update info
   */
  private async getUpdateInfo(): Promise<UpdateInfo> {
    try {
      const data = await fs.readFile(this.updateFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {
        lastChecked: new Date(0).toISOString(),
        currentVersion: this.currentVersion
      };
    }
  }

  /**
   * Save update info to cache
   */
  private async saveUpdateInfo(updateInfo: UpdateInfo): Promise<void> {
    try {
      await fs.writeFile(this.updateFile, JSON.stringify(updateInfo, null, 2));
    } catch {
      // Fail silently
    }
  }

  /**
   * Fetch latest version from npm registry
   */
  private async fetchLatestVersion(): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
      const response = await fetch(`https://registry.npmjs.org/${this.packageName}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': `${this.packageName}/${this.currentVersion}`
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: PackageInfo = await response.json();
      return data['dist-tags'].latest;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  /**
   * Compare semantic versions
   */
  private isNewerVersion(latest: string, current: string): boolean {
    const parseVersion = (version: string) => {
      return version.replace(/^v/, '').split('.').map(Number);
    };

    const latestParts = parseVersion(latest);
    const currentParts = parseVersion(current);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) {
        return true;
      } else if (latestPart < currentPart) {
        return false;
      }
    }

    return false;
  }

  /**
   * Force check for updates (for update command)
   */
  async forceCheckForUpdates(): Promise<UpdateInfo> {
    try {
      const latestVersion = await this.fetchLatestVersion();
      const updateInfo: UpdateInfo = {
        lastChecked: new Date().toISOString(),
        latestVersion,
        currentVersion: this.currentVersion,
        hasUpdate: this.isNewerVersion(latestVersion, this.currentVersion)
      };

      await this.saveUpdateInfo(updateInfo);
      return updateInfo;
    } catch (error) {
      throw new Error(`Failed to check for updates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}