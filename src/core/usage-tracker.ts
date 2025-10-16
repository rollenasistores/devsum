import { v4 as uuidv4 } from 'uuid'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

interface UsageConfig {
  enabled: boolean
  userId: string
  apiEndpoint: string
}

interface UsageData {
  commandType: 'commit' | 'report' | 'analyze'
  userId: string
  success: boolean
  metadata?: {
    duration?: number
    fileCount?: number
    outputFormat?: string
    provider?: string
  }
}

export class UsageTracker {
  private config: UsageConfig
  private configPath: string

  constructor() {
    this.configPath = join(homedir(), '.devsum', 'usage-config.json')
    this.config = this.loadConfig()
  }

  private loadConfig(): UsageConfig {
    try {
      if (existsSync(this.configPath)) {
        const configData = readFileSync(this.configPath, 'utf8')
        return JSON.parse(configData)
      }
    } catch (error) {
      console.warn('Failed to load usage config:', error)
    }

    // Default config
    return {
      enabled: true,
      userId: uuidv4(),
      apiEndpoint: 'https://devsum.vercel.app/api/usage/track'
    }
  }

  private saveConfig(): void {
    try {
      const configDir = join(homedir(), '.devsum')
      if (!existsSync(configDir)) {
        require('fs').mkdirSync(configDir, { recursive: true })
      }
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.warn('Failed to save usage config:', error)
    }
  }

  public async trackUsage(data: UsageData): Promise<void> {
    if (!this.config.enabled) {
      return
    }

    try {
      const payload = {
        commandType: data.commandType,
        userId: this.config.userId,
        success: data.success,
        metadata: data.metadata
      }

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'devsum-cli'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        console.warn('Failed to track usage:', response.statusText)
      }
    } catch (error) {
      // Silently fail - don't interrupt user workflow
      console.warn('Usage tracking failed:', error)
    }
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    this.saveConfig()
  }

  public isEnabled(): boolean {
    return this.config.enabled
  }

  public getUserId(): string {
    return this.config.userId
  }

  public setApiEndpoint(endpoint: string): void {
    this.config.apiEndpoint = endpoint
    this.saveConfig()
  }
}

// Singleton instance
export const usageTracker = new UsageTracker()
