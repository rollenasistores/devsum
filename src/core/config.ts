import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { Config } from '../types/index.js';

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
      return JSON.parse(data);
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
}

export const configManager = new ConfigManager();