import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Config, AIProvider } from '../types/index.js';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'devsum');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(CONFIG_DIR);
    } catch {
      await fs.mkdir(CONFIG_DIR, { recursive: true });
    }
  }

  async saveConfig(config: Config): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  async loadConfig(): Promise<Config | null> {
    try {
      const data = await fs.readFile(CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);
      
      // Handle migration from old config format
      if (config.provider && !config.providers) {
        const migratedConfig: Config = {
          providers: [{
            name: 'default',
            provider: config.provider,
            apiKey: config.apiKey,
            model: config.model,
            isDefault: true
          }],
          defaultOutput: config.defaultOutput,
          defaultProvider: 'default'
        };
        await this.saveConfig(migratedConfig);
        return migratedConfig;
      }
      
      return config;
    } catch {
      return null;
    }
  }

  async configExists(): Promise<boolean> {
    try {
      await fs.access(CONFIG_FILE);
      return true;
    } catch {
      return false;
    }
  }

  getConfigPath(): string {
    return CONFIG_FILE;
  }

  async addProvider(provider: AIProvider): Promise<void> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No configuration found. Please run setup first.');
    }

    // Check if provider with same name already exists
    const existingIndex = config.providers.findIndex(p => p.name === provider.name);
    if (existingIndex >= 0) {
      config.providers[existingIndex] = provider;
    } else {
      config.providers.push(provider);
    }

    // If this is the first provider or marked as default, set it as default
    if (config.providers.length === 1 || provider.isDefault) {
      config.defaultProvider = provider.name;
      config.providers.forEach(p => p.isDefault = p.name === provider.name);
    }

    await this.saveConfig(config);
  }

  async removeProvider(providerName: string): Promise<void> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No configuration found.');
    }

    config.providers = config.providers.filter(p => p.name !== providerName);
    
    // If we removed the default provider, set a new default
    if (config.defaultProvider === providerName) {
      if (config.providers.length > 0) {
        config.defaultProvider = config.providers[0].name;
        config.providers[0].isDefault = true;
        config.providers.forEach((p, index) => p.isDefault = index === 0);
      } else {
        config.defaultProvider = undefined;
      }
    }

    await this.saveConfig(config);
  }

  async setDefaultProvider(providerName: string): Promise<void> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No configuration found.');
    }

    const provider = config.providers.find(p => p.name === providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found.`);
    }

    config.defaultProvider = providerName;
    config.providers.forEach(p => p.isDefault = p.name === providerName);
    await this.saveConfig(config);
  }

  async getProvider(providerName?: string): Promise<AIProvider | null> {
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

  async listProviders(): Promise<AIProvider[]> {
    const config = await this.loadConfig();
    return config?.providers || [];
  }
}

export const configManager = new ConfigManager();