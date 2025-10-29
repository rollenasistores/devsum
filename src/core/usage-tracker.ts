import { v4 as uuidv4 } from 'uuid';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir, platform, arch, cpus, totalmem, freemem } from 'os';
import { configManager } from './config.js';

interface UsageConfig {
  enabled: boolean;
  userId: string;
}

interface UsageData {
  commandType: 'commit' | 'report' | 'analyze';
  userId: string;
  success: boolean;
  metadata?: {
    duration?: number;
    fileCount?: number;
    outputFormat?: string;
    provider?: string;
  };
}

interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  cliVersion: string;
  cpuCount: number;
  totalMemory: number;
  freeMemory: number;
  timezone: string;
  locale: string;
}

export class UsageTracker {
  private config: UsageConfig;
  private configPath: string;
  private readonly API_ENDPOINT = 'https://devsum.rollenasistores.site/api/usage/track';

  constructor() {
    this.configPath = join(homedir(), '.devsum', 'usage-config.json');
    this.config = { enabled: true, userId: uuidv4() };
    this.initializeConfig();
  }

  private async initializeConfig(): Promise<void> {
    this.config = await this.loadConfig();
  }

  private async loadConfig(): Promise<UsageConfig> {
    try {
      // Try to load from main config first
      const mainConfig = await configManager.loadConfig();
      if (mainConfig?.telemetry) {
        return {
          enabled: mainConfig.telemetry.enabled,
          userId: this.getOrCreateUserId(),
        };
      }

      // Fallback to usage-specific config
      if (existsSync(this.configPath)) {
        const configData = readFileSync(this.configPath, 'utf8');
        return JSON.parse(configData);
      }
    } catch (error) {
      console.warn('Failed to load usage config:', error);
    }

    // Default config
    return {
      enabled: true,
      userId: this.getOrCreateUserId(),
    };
  }

  private getOrCreateUserId(): string {
    try {
      if (existsSync(this.configPath)) {
        const configData = readFileSync(this.configPath, 'utf8');
        const config = JSON.parse(configData);
        if (config.userId) {
          return config.userId;
        }
      }
    } catch (error) {
      // Ignore errors, will create new ID
    }
    return uuidv4();
  }

  private async saveConfig(): Promise<void> {
    try {
      const configDir = join(homedir(), '.devsum');
      if (!existsSync(configDir)) {
        const { mkdirSync } = await import('fs');
        mkdirSync(configDir, { recursive: true });
      }
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.warn('Failed to save usage config:', error);
    }
  }

  public async trackUsage(data: UsageData): Promise<void> {
    // Ensure config is loaded
    if (!this.config.userId) {
      this.config = await this.loadConfig();
    }

    if (!this.config.enabled) {
      return;
    }

    try {
      // Get system information
      const systemInfo = this.getSystemInfo();

      // Enhanced metadata with system info
      const enhancedMetadata = {
        ...data.metadata,
        system: systemInfo,
        cli: {
          version: this.getCliVersion(),
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      };

      const payload = {
        commandType: data.commandType,
        userId: this.config.userId,
        success: data.success,
        metadata: enhancedMetadata,
      };

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `devsum-cli/${this.getCliVersion()} (${systemInfo.platform}; ${systemInfo.arch})`,
          'X-Timezone': systemInfo.timezone,
          'X-Locale': systemInfo.locale,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.warn('⚠️  Failed to track usage:', {
          status: response.status,
          statusText: response.statusText,
          endpoint: this.API_ENDPOINT,
          error: errorText,
        });
      }
    } catch (error) {
      // Silently fail - don't interrupt user workflow
      console.warn('⚠️  Usage tracking failed:', {
        error: error instanceof Error ? error.message : String(error),
        endpoint: this.API_ENDPOINT,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private getSystemInfo(): SystemInfo {
    return {
      platform: platform(),
      arch: arch(),
      nodeVersion: process.version,
      cliVersion: this.getCliVersion(),
      cpuCount: cpus().length,
      totalMemory: totalmem(),
      freeMemory: freemem(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
    };
  }

  private getCliVersion(): string {
    try {
      // Try to get version from package.json
      const packagePath = join(__dirname, '..', '..', 'package.json');
      if (existsSync(packagePath)) {
        const packageData = JSON.parse(readFileSync(packagePath, 'utf8'));
        return packageData.version || '1.0.0';
      }
    } catch (error) {
      // Fallback version
    }
    return '1.0.0';
  }

  public async setEnabled(enabled: boolean): Promise<void> {
    this.config.enabled = enabled;
    await this.saveConfig();
  }

  public async isEnabled(): Promise<boolean> {
    this.config = await this.loadConfig();
    return this.config.enabled;
  }

  public async getUserId(): Promise<string> {
    this.config = await this.loadConfig();
    return this.config.userId;
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();
