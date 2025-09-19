import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Config, AIProvider } from '../types/index.js';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'devsum');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Configuration manager for DevSum settings
 * Handles configuration persistence and provider management
 */
export class ConfigManager {
  /**
   * Ensure configuration directory exists
   */
  public async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(CONFIG_DIR);
    } catch {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
    }
  }

  /**
   * Save configuration to file
   */
  public async saveConfig(config: Config): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  /**
   * Load configuration from file
   */
  public async loadConfig(): Promise<Config | null> {
    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);

      // Handle migration from old config format
      if (this.isLegacyConfig(config)) {
        const migratedConfig = this.migrateLegacyConfig(config);
        await this.saveConfig(migratedConfig);
        return migratedConfig;
      }

      return config;
    } catch {
      return null;
    }
  }

  /**
   * Check if configuration file exists
   */
  public async configExists(): Promise<boolean> {
    try {
      await fs.access(CONFIG_FILE);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration file path
   */
  public getConfigPath(): string {
    return CONFIG_FILE;
  }

  /**
   * Check if config is in legacy format
   */
  private isLegacyConfig(config: any): boolean {
    return config.provider && !config.providers;
  }

  /**
   * Migrate legacy config to new format
   */
  private migrateLegacyConfig(legacyConfig: any): Config {
    return {
      providers: [
        {
          name: 'default',
          provider: legacyConfig.provider,
          apiKey: legacyConfig.apiKey,
          model: legacyConfig.model,
          isDefault: true,
        },
      ],
      defaultOutput: legacyConfig.defaultOutput,
      defaultProvider: 'default',
    };
  }

  /**
   * Add or update a provider
   */
  public async addProvider(provider: AIProvider): Promise<void> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No configuration found. Please run setup first.');
    }

    const updatedProviders = this.updateProviderInList(config.providers, provider);
    const updatedConfig = this.updateDefaultProvider(
      {
        ...config,
        providers: updatedProviders,
      },
      provider
    );

    await this.saveConfig(updatedConfig);
  }

  /**
   * Update provider in the providers list
   */
  private updateProviderInList(providers: AIProvider[], newProvider: AIProvider): AIProvider[] {
    const existingIndex = providers.findIndex(p => p.name === newProvider.name);

    if (existingIndex >= 0) {
      const updated = [...providers];
      updated[existingIndex] = newProvider;
      return updated;
    } else {
      return [...providers, newProvider];
    }
  }

  /**
   * Update default provider if needed
   */
  private updateDefaultProvider(config: Config, provider: AIProvider): Config {
    if (config.providers.length === 1 || provider.isDefault) {
      return {
        ...config,
        defaultProvider: provider.name,
        providers: config.providers.map(p => ({
          ...p,
          isDefault: p.name === provider.name,
        })),
      };
    }
    return config;
  }

  /**
   * Remove a provider
   */
  public async removeProvider(providerName: string): Promise<void> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No configuration found.');
    }

    const updatedConfig = this.removeProviderFromConfig(config, providerName);
    await this.saveConfig(updatedConfig);
  }

  /**
   * Set default provider
   */
  public async setDefaultProvider(providerName: string): Promise<void> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No configuration found.');
    }

    const provider = config.providers.find(p => p.name === providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found.`);
    }

    const updatedConfig = this.setDefaultProviderInConfig(config, providerName);
    await this.saveConfig(updatedConfig);
  }

  /**
   * Get a specific provider or default provider
   */
  public async getProvider(providerName?: string): Promise<AIProvider | null> {
    const config = await this.loadConfig();
    if (!config || config.providers.length === 0) {
      return null;
    }

    if (providerName) {
      return config.providers.find(p => p.name === providerName) || null;
    }

    // Return default provider
    return config.providers.find(p => p.isDefault) || config.providers[0] || null;
  }

  /**
   * List all providers
   */
  public async listProviders(): Promise<readonly AIProvider[]> {
    const config = await this.loadConfig();
    return config?.providers || [];
  }

  /**
   * Remove provider from config
   */
  private removeProviderFromConfig(config: Config, providerName: string): Config {
    const filteredProviders = config.providers.filter(p => p.name !== providerName);

    if (config.defaultProvider === providerName) {
      if (filteredProviders.length > 0) {
        return {
          ...config,
          providers: filteredProviders.map((p, index) => ({
            ...p,
            isDefault: index === 0,
          })),
          defaultProvider: filteredProviders[0]?.name,
        };
      } else {
        return {
          ...config,
          providers: filteredProviders,
          defaultProvider: undefined,
        };
      }
    }

    return {
      ...config,
      providers: filteredProviders,
    };
  }

  /**
   * Set default provider in config
   */
  private setDefaultProviderInConfig(config: Config, providerName: string): Config {
    return {
      ...config,
      defaultProvider: providerName,
      providers: config.providers.map(p => ({
        ...p,
        isDefault: p.name === providerName,
      })),
    };
  }
}

export const configManager = new ConfigManager();
