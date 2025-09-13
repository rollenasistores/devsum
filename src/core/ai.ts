import { Config, GitCommit, AIResponse } from '../types/index.js';
import { DevSumApiService } from './api.js';

export class AIService {
  private devsumApiService?: DevSumApiService;

  constructor(private config: Config) {
    if (config.provider === 'devsum-api') {
      this.devsumApiService = new DevSumApiService(config);
    } else {
      throw new Error(`Only DevSum API is supported. Provider: ${config.provider}`);
    }
  }

  async generateReport(commits: GitCommit[], length?: 'short' | 'light' | 'detailed'): Promise<AIResponse> {
    try {
      return await this.generateWithDevSumApi(commits, length);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      throw new Error('Unknown AI service error');
    }
  }


  private async generateWithDevSumApi(commits: GitCommit[], length?: 'short' | 'light' | 'detailed'): Promise<AIResponse> {
    if (!this.devsumApiService) {
      throw new Error('DevSum API service not initialized');
    }

    return await this.devsumApiService.generateReport(commits, length);
  }



  // Helper method to get available models for the current provider
  static getAvailableModels(provider: string): string[] {
    if (provider === 'devsum-api') {
      return ['devsum-gemini']; // DevSum API uses Gemini internally
    }
    return [];
  }

  // Helper method to get default model for a provider
  static getDefaultModel(provider: string): string {
    if (provider === 'devsum-api') {
      return 'devsum-gemini';
    }
    throw new Error(`Unknown provider: ${provider}`);
  }
}