// src/core/updateChecker.ts - Windows-safe version
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

interface UpdateInfo {
  lastChecked: string;
  latestVersion?: string;
  currentVersion: string;
  hasUpdate?: boolean;
  isForcedUpdate?: boolean;
  criticalUpdate?: boolean;
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

    // Windows-safe path handling
    const homeDir = os.homedir();
    this.updateFile = path.join(homeDir, '.devsum-update-check');
  }

  /**
   * Check for updates (non-blocking, cached) - Windows safe
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    // On Windows, be extra careful with async operations
    try {
      const updateInfo = await Promise.race([
        this.performUpdateCheck(),
        new Promise<null>(resolve => setTimeout(() => resolve(null), 5000)), // 5s timeout
      ]);

      return updateInfo;
    } catch (error) {
      // Completely silent failure on Windows to avoid console issues
      return null;
    }
  }

  private async performUpdateCheck(): Promise<UpdateInfo | null> {
    try {
      const updateInfo = await this.getUpdateInfo();

      // Check once per day
      const lastChecked = new Date(updateInfo.lastChecked);
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      if (now.getTime() - lastChecked.getTime() < oneDay) {
        return updateInfo;
      }

      // Fetch latest version from npm (with shorter timeout for Windows)
      const latestVersion = await this.fetchLatestVersion();

      const newUpdateInfo: UpdateInfo = {
        lastChecked: now.toISOString(),
        latestVersion,
        currentVersion: this.currentVersion,
        hasUpdate: this.isNewerVersion(latestVersion, this.currentVersion),
      };

      // Save update info (completely fire-and-forget)
      setImmediate(() => {
        this.saveUpdateInfo(newUpdateInfo).catch(() => {});
      });

      return newUpdateInfo;
    } catch (error) {
      return null;
    }
  }

  /**
   * Display update notification if available - Windows safe
   */
  static displayUpdateNotification(updateInfo: UpdateInfo | null) {
    // Add process.stdout check for Windows
    if (!updateInfo?.hasUpdate || !updateInfo.latestVersion || !process.stdout.isTTY) {
      return;
    }

    try {
      console.log();
      console.log(chalk.yellow('┌' + '─'.repeat(58) + '┐'));
      console.log(
        chalk.yellow('│') +
          chalk.bold.cyan('  🚀 DevSum Update Available!') +
          ' '.repeat(28) +
          chalk.yellow('│')
      );
      console.log(chalk.yellow('│') + ' '.repeat(58) + chalk.yellow('│'));
      console.log(
        chalk.yellow('│') +
          `  Current: ${chalk.red(updateInfo.currentVersion)}` +
          ' '.repeat(58 - `  Current: ${updateInfo.currentVersion}`.length) +
          chalk.yellow('│')
      );
      console.log(
        chalk.yellow('│') +
          `  Latest:  ${chalk.green(updateInfo.latestVersion)}` +
          ' '.repeat(58 - `  Latest:  ${updateInfo.latestVersion}`.length) +
          chalk.yellow('│')
      );
      console.log(chalk.yellow('│') + ' '.repeat(58) + chalk.yellow('│'));
      console.log(
        chalk.yellow('│') +
          chalk.white('  Update now: ') +
          chalk.cyan('npm install -g devsum') +
          ' '.repeat(16) +
          chalk.yellow('│')
      );
      console.log(
        chalk.yellow('│') +
          chalk.gray('  Release notes: http://devsum.rollenasistores.site/') +
          ' '.repeat(1) +
          chalk.yellow('│')
      );
      console.log(chalk.yellow('└' + '─'.repeat(58) + '┘'));
      console.log();
    } catch (error) {
      // Silent fail on Windows console issues
    }
  }

  /**
   * Get cached update info - Windows safe
   */
  private async getUpdateInfo(): Promise<UpdateInfo> {
    try {
      const data = await fs.readFile(this.updateFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {
        lastChecked: new Date(0).toISOString(),
        currentVersion: this.currentVersion,
      };
    }
  }

  /**
   * Save update info to cache - Windows safe
   */
  private async saveUpdateInfo(updateInfo: UpdateInfo): Promise<void> {
    try {
      await fs.writeFile(this.updateFile, JSON.stringify(updateInfo, null, 2));
    } catch {
      // Fail silently - file system issues on Windows
    }
  }

  /**
   * Fetch latest version from npm registry - Windows optimized
   */
  private async fetchLatestVersion(): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // Shorter timeout for Windows

    try {
      // Use Node.js fetch if available, otherwise skip
      if (typeof fetch === 'undefined') {
        throw new Error('Fetch not available');
      }

      const response = await fetch(`https://registry.npmjs.org/${this.packageName}`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': `${this.packageName}/${this.currentVersion}`,
        },
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
   * Force check for updates (for update command) - Windows safe
   */
  async forceCheckForUpdates(): Promise<UpdateInfo> {
    try {
      const latestVersion = await this.fetchLatestVersion();
      const hasUpdate = this.isNewerVersion(latestVersion, this.currentVersion);
      const criticalUpdate = this.isCriticalUpdate(latestVersion, this.currentVersion);

      const updateInfo: UpdateInfo = {
        lastChecked: new Date().toISOString(),
        latestVersion,
        currentVersion: this.currentVersion,
        hasUpdate,
        criticalUpdate,
      };

      await this.saveUpdateInfo(updateInfo);
      return updateInfo;
    } catch (error) {
      throw new Error(
        `Failed to check for updates: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if update is critical (major version difference)
   */
  private isCriticalUpdate(latestVersion: string, currentVersion: string): boolean {
    try {
      const latest = this.parseVersion(latestVersion);
      const current = this.parseVersion(currentVersion);

      // Critical if major version is different
      return latest.major > current.major;
    } catch {
      return false;
    }
  }

  /**
   * Parse version string into major.minor.patch
   */
  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version
      .replace(/[^0-9.]/g, '')
      .split('.')
      .map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  }

  /**
   * Check if forced update is required
   */
  async checkForcedUpdate(): Promise<{ required: boolean; updateInfo?: UpdateInfo }> {
    try {
      const updateInfo = await this.forceCheckForUpdates();

      if (updateInfo.criticalUpdate) {
        return { required: true, updateInfo };
      }

      // Check if user is more than 2 minor versions behind
      const latest = this.parseVersion(updateInfo.latestVersion || '0.0.0');
      const current = this.parseVersion(this.currentVersion);

      const isSignificantlyBehind =
        latest.major > current.major ||
        (latest.major === current.major && latest.minor > current.minor + 1);

      if (isSignificantlyBehind) {
        return { required: true, updateInfo };
      }

      return { required: false, updateInfo };
    } catch (error) {
      return { required: false };
    }
  }
}
