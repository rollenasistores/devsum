/**
 * Lazy loader for heavy dependencies
 * Implements dynamic imports to reduce initial bundle size
 */
export class LazyLoader {
  private static loadedModules = new Map<string, any>();

  /**
   * Load AI service dynamically based on provider
   */
  public static async loadAIService(
    provider: string,
    apiKey: string,
    model?: string
  ): Promise<any> {
    const cacheKey = `${provider}-${model || 'default'}`;

    if (this.loadedModules.has(cacheKey)) {
      return this.loadedModules.get(cacheKey);
    }

    const module = await this.importAIService(provider, apiKey, model);
    this.loadedModules.set(cacheKey, module);
    return module;
  }

  /**
   * Load Puppeteer for HTML report generation
   */
  public static async loadPuppeteer(): Promise<any> {
    if (this.loadedModules.has('puppeteer')) {
      return this.loadedModules.get('puppeteer');
    }

    try {
      const puppeteer = await import('puppeteer');
      this.loadedModules.set('puppeteer', puppeteer);
      return puppeteer;
    } catch (error) {
      throw new Error('Puppeteer not available. Install with: npm install puppeteer');
    }
  }

  /**
   * Load Inquirer for interactive prompts
   */
  public static async loadInquirer(): Promise<any> {
    if (this.loadedModules.has('inquirer')) {
      return this.loadedModules.get('inquirer');
    }

    const inquirer = await import('inquirer');
    this.loadedModules.set('inquirer', inquirer);
    return inquirer;
  }

  /**
   * Import AI service based on provider
   */
  private static async importAIService(
    provider: string,
    apiKey: string,
    model?: string
  ): Promise<any> {
    switch (provider) {
      case 'gemini':
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        return new GoogleGenerativeAI(apiKey);

      case 'claude':
        const Anthropic = await import('@anthropic-ai/sdk');
        return new Anthropic.default({ apiKey });

      case 'openai':
        const OpenAI = await import('openai');
        return new OpenAI.default({ apiKey });

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Clear loaded modules cache (useful for testing)
   */
  public static clearCache(): void {
    this.loadedModules.clear();
  }

  /**
   * Get cache statistics
   */
  public static getCacheStats(): { loadedModules: string[]; cacheSize: number } {
    return {
      loadedModules: Array.from(this.loadedModules.keys()),
      cacheSize: this.loadedModules.size,
    };
  }
}
