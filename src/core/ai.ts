import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  GitCommit,
  AIResponse,
  ReportLength,
  AIProvider,
  AIProviderType,
  StagedChanges,
  CommitMessageOptions,
  CloudAIProvider,
} from '../types/index.js';
import { CloudAIService } from './cloud-ai-service.js';

/**
 * AI Service class for generating reports and commit messages
 * Follows single responsibility principle and proper TypeScript practices
 */
export class AIService {
  private geminiClient?: GoogleGenerativeAI;
  private claudeClient?: Anthropic;
  private openaiClient?: OpenAI;
  private readonly provider: AIProviderType;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl?: string;

  private constructor(provider: AIProviderType, apiKey: string, model: string, baseUrl?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;

    this.initializeClients();
  }

  /**
   * Create AIService instance from provider configuration
   */
  public static fromProvider(provider: AIProvider): AIService | CloudAIService {
    // If it's a cloud provider, return CloudAIService instance
    if (provider.provider === 'devsum-cloud') {
      return new CloudAIService(provider as CloudAIProvider);
    }

    const model = provider.model ?? AIService.getDefaultModel(provider.provider);
    return new AIService(provider.provider, provider.apiKey, model, provider.baseUrl);
  }

  /**
   * Initialize AI clients based on provider type
   */
  private initializeClients(): void {
    switch (this.provider) {
      case 'gemini':
        this.geminiClient = new GoogleGenerativeAI(this.apiKey);
        break;
      case 'claude':
        this.claudeClient = new Anthropic({ apiKey: this.apiKey });
        break;
      case 'openai':
        this.openaiClient = new OpenAI({ apiKey: this.apiKey });
        break;
      case 'ollama':
        // Ollama uses direct HTTP requests, no SDK client needed
        break;
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  /**
   * Generate accomplishment report from git commits
   */
  public async generateReport(
    commits: readonly GitCommit[],
    length: ReportLength = 'detailed'
  ): Promise<AIResponse> {
    const prompt = this.buildReportPrompt(commits, length);

    try {
      return await this.executeGeneration(prompt);
    } catch (error) {
      throw this.handleGenerationError(error);
    }
  }

  /**
   * Generate commit message from staged changes
   */
  public async generateCommitMessage(
    changes: StagedChanges,
    options: CommitMessageOptions
  ): Promise<string> {
    const prompt = this.buildCommitPrompt(changes, options);

    try {
      return await this.executeCommitGeneration(prompt);
    } catch (error) {
      throw this.handleGenerationError(error);
    }
  }

  /**
   * Generate branch name from staged changes
   */
  public async generateBranchName(changes: StagedChanges): Promise<string> {
    const prompt = this.buildBranchNamePrompt(changes);

    try {
      return await this.executeBranchNameGeneration(prompt);
    } catch (error) {
      throw this.handleGenerationError(error);
    }
  }

  /**
   * Generate alternative branch name when there's a conflict
   */
  public async generateAlternativeBranchName(
    changes: StagedChanges,
    existingBranches: string[],
    originalName: string
  ): Promise<string> {
    const prompt = this.buildAlternativeBranchNamePrompt(changes, existingBranches, originalName);

    try {
      return await this.executeBranchNameGeneration(prompt);
    } catch (error) {
      throw this.handleGenerationError(error);
    }
  }

  /**
   * Generate commit message with detailed diff analysis
   */
  public async generateDetailedCommitMessage(
    changes: StagedChanges,
    diffContent: string,
    options: CommitMessageOptions
  ): Promise<string> {
    const prompt = this.buildDetailedCommitPrompt(changes, diffContent, options);

    try {
      return await this.executeCommitGeneration(prompt);
    } catch (error) {
      throw this.handleGenerationError(error);
    }
  }

  /**
   * Generate pull request title from staged changes
   */
  public async generatePullRequestTitle(changes: StagedChanges): Promise<string> {
    const prompt = this.buildPullRequestTitlePrompt(changes);

    try {
      return await this.executePullRequestTitleGeneration(prompt);
    } catch (error) {
      throw this.handleGenerationError(error);
    }
  }

  /**
   * Execute report generation based on provider
   */
  private async executeGeneration(prompt: string): Promise<AIResponse> {
    switch (this.provider) {
      case 'gemini':
        return await this.generateWithGemini(prompt);
      case 'claude':
        return await this.generateWithClaude(prompt);
      case 'openai':
        return await this.generateWithOpenAI(prompt);
      case 'ollama':
        return await this.generateWithOllama(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Execute commit message generation based on provider
   */
  private async executeCommitGeneration(prompt: string): Promise<string> {
    switch (this.provider) {
      case 'gemini':
        return await this.generateCommitWithGemini(prompt);
      case 'claude':
        return await this.generateCommitWithClaude(prompt);
      case 'openai':
        return await this.generateCommitWithOpenAI(prompt);
      case 'ollama':
        return await this.generateCommitWithOllama(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Execute branch name generation based on provider
   */
  private async executeBranchNameGeneration(prompt: string): Promise<string> {
    switch (this.provider) {
      case 'gemini':
        return await this.generateBranchNameWithGemini(prompt);
      case 'claude':
        return await this.generateBranchNameWithClaude(prompt);
      case 'openai':
        return await this.generateBranchNameWithOpenAI(prompt);
      case 'ollama':
        return await this.generateBranchNameWithOllama(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Execute pull request title generation based on provider
   */
  private async executePullRequestTitleGeneration(prompt: string): Promise<string> {
    switch (this.provider) {
      case 'gemini':
        return await this.generatePullRequestTitleWithGemini(prompt);
      case 'claude':
        return await this.generatePullRequestTitleWithClaude(prompt);
      case 'openai':
        return await this.generatePullRequestTitleWithOpenAI(prompt);
      case 'ollama':
        return await this.generatePullRequestTitleWithOllama(prompt);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Handle generation errors consistently
   */
  private handleGenerationError(error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`AI service error: ${error.message}`);
    }
    return new Error('Unknown AI service error');
  }

  private async generateWithGemini(prompt: string): Promise<AIResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: this.model || 'gemini-2.0-flash',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseResponse(text);
  }

  private async generateWithClaude(prompt: string): Promise<AIResponse> {
    if (!this.claudeClient) {
      throw new Error('Claude client not initialized');
    }

    const response = await this.claudeClient.messages.create({
      model: this.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    return this.parseResponse(text);
  }

  private async generateWithOpenAI(prompt: string): Promise<AIResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: this.model || 'gpt-4',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseResponse(text);
  }

  private async generateWithOllama(prompt: string): Promise<AIResponse> {
    const baseUrl = this.baseUrl || 'http://localhost:11434';
    const model = this.model || 'phi3:mini';

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.response || '';

      return this.parseResponse(text);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to Ollama at ${baseUrl}. Make sure Ollama is running.`
        );
      }
      throw error;
    }
  }

  /**
   * Build report generation prompt
   */
  private buildReportPrompt(
    commits: readonly GitCommit[],
    length: ReportLength = 'detailed'
  ): string {
    const commitSummaries = this.formatCommitSummaries(commits);
    const lengthInstructions = this.getLengthInstructions(length);

    return `Please analyze the following git commits and generate an accomplishment report.

Git Commits:
${commitSummaries}

${lengthInstructions}

Please provide a response in the following format:

**Summary:**
[A brief overview of the work done]

**Key Accomplishments:**
- [Accomplishment 1]
- [Accomplishment 2]
- [Accomplishment 3]

**Technical Highlights:**
- [Technical detail 1]
- [Technical detail 2]

Focus on the impact and value of the changes rather than just listing commits. Group related changes together and highlight the most significant contributions.`;
  }

  /**
   * Format commit summaries for prompt
   */
  private formatCommitSummaries(commits: readonly GitCommit[]): string {
    return commits
      .map(commit => {
        const date = commit.date.split('T')[0];
        const files = commit.files.slice(0, 3).join(', ');
        const moreFiles = commit.files.length > 3 ? '...' : '';
        return `- ${date} | ${commit.message} | Files: ${files}${moreFiles}`;
      })
      .join('\n');
  }

  /**
   * Get length-specific instructions for report generation
   */
  private getLengthInstructions(length: ReportLength): string {
    const instructions = {
      light: `Generate a LIGHT report with:
- Very brief summary (1-2 sentences)
- Top 3-5 key accomplishments only
- Minimal technical details
- Focus on high-level impact and business value
- Keep it concise and executive-friendly`,

      short: `Generate a SHORT report with:
- Concise summary (2-3 sentences)
- 5-8 key accomplishments
- Some technical highlights
- Balanced detail level for quick review
- Good for daily/weekly updates`,

      detailed: `Generate a DETAILED report with:
- Comprehensive summary (3-5 sentences)
- 8-15 key accomplishments
- Extensive technical highlights and improvements
- Detailed analysis of patterns and trends
- Recommendations for future work
- Perfect for comprehensive reviews and documentation`,
    };

    return instructions[length];
  }

  /**
   * Parse AI response into structured format
   */
  private parseResponse(response: string): AIResponse {
    const lines = response.split('\n');
    const accomplishments: string[] = [];
    let inAccomplishments = false;
    let summary = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (this.isSummarySection(trimmedLine)) {
        inAccomplishments = false;
        continue;
      }

      if (this.isAccomplishmentsSection(trimmedLine)) {
        inAccomplishments = true;
        continue;
      }

      if (inAccomplishments && this.isAccomplishmentItem(trimmedLine)) {
        accomplishments.push(this.extractAccomplishmentText(trimmedLine));
      } else if (!inAccomplishments && this.isSummaryText(trimmedLine)) {
        summary += trimmedLine + ' ';
      }
    }

    return {
      summary: this.getDefaultSummary(summary),
      accomplishments: this.getDefaultAccomplishments(accomplishments),
    };
  }

  /**
   * Check if line indicates summary section
   */
  private isSummarySection(line: string): boolean {
    return line.toLowerCase().includes('summary:');
  }

  /**
   * Check if line indicates accomplishments section
   */
  private isAccomplishmentsSection(line: string): boolean {
    return (
      line.toLowerCase().includes('accomplishments:') || line.toLowerCase().includes('highlights:')
    );
  }

  /**
   * Check if line is an accomplishment item
   */
  private isAccomplishmentItem(line: string): boolean {
    return line.startsWith('-');
  }

  /**
   * Extract accomplishment text from line
   */
  private extractAccomplishmentText(line: string): string {
    return line.substring(1).trim();
  }

  /**
   * Check if line contains summary text
   */
  private isSummaryText(line: string): boolean {
    return Boolean(line) && !line.startsWith('**');
  }

  /**
   * Get default summary if none provided
   */
  private getDefaultSummary(summary: string): string {
    return summary.trim() || 'Work completed during the specified period.';
  }

  /**
   * Get default accomplishments if none provided
   */
  private getDefaultAccomplishments(accomplishments: string[]): readonly string[] {
    return accomplishments.length > 0 ? accomplishments : ['Various development tasks completed'];
  }

  /**
   * Get available models for a provider
   */
  public static getAvailableModels(provider: AIProviderType): readonly string[] {
    const models = {
      gemini: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'] as const,
      claude: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
      ] as const,
      openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] as const,
      ollama: [
        'phi3:mini',
        'llama3.2:1b',
        'llama3.2:3b',
        'gemma2:2b',
        'tinyllama',
        'llama3.2',
        'llama3',
        'mistral',
        'codellama',
      ] as const,
      'devsum-cloud': ['gemini-2.0-flash', 'claude-3-5-sonnet-20241022', 'gpt-4'] as const,
    };

    return models[provider] ?? [];
  }

  /**
   * Fetch available models from the AI provider's API
   */
  public static async fetchAvailableModels(
    provider: AIProviderType,
    apiKey: string,
    baseUrl?: string
  ): Promise<readonly string[]> {
    try {
      switch (provider) {
        case 'gemini':
          return await AIService.fetchGeminiModels(apiKey);
        case 'claude':
          return await AIService.fetchClaudeModels(apiKey);
        case 'openai':
          return await AIService.fetchOpenAIModels(apiKey);
        case 'ollama':
          return await AIService.fetchOllamaModels(baseUrl || 'http://localhost:11434');
        default:
          return [];
      }
    } catch (error) {
      console.warn(
        `Failed to fetch models for ${provider}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      // Fallback to static models if API fetch fails
      return AIService.getAvailableModels(provider);
    }
  }

  /**
   * Fetch available Gemini models
   */
  private static async fetchGeminiModels(apiKey: string): Promise<readonly string[]> {
    const client = new GoogleGenerativeAI(apiKey);

    try {
      const knownModels = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash-8b',
        'gemini-1.0-pro',
      ] as const;

      const availableModels = await AIService.testModelsAvailability(client, knownModels);
      return availableModels.length > 0 ? availableModels : AIService.getAvailableModels('gemini');
    } catch (error) {
      return AIService.getAvailableModels('gemini');
    }
  }

  /**
   * Test model availability for Gemini
   */
  private static async testModelsAvailability(
    client: GoogleGenerativeAI,
    models: readonly string[]
  ): Promise<readonly string[]> {
    const availableModels: string[] = [];

    for (const modelName of models) {
      try {
        const model = client.getGenerativeModel({ model: modelName });
        await model.generateContent('test');
        availableModels.push(modelName);
      } catch {
        // Model not available, skip it
        continue;
      }
    }

    return [...availableModels];
  }

  /**
   * Fetch available Claude models
   */
  private static async fetchClaudeModels(apiKey: string): Promise<readonly string[]> {
    const client = new Anthropic({ apiKey });

    try {
      const knownModels = [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
      ] as const;

      const availableModels = await AIService.testClaudeModelsAvailability(client, knownModels);
      return availableModels.length > 0 ? availableModels : AIService.getAvailableModels('claude');
    } catch (error) {
      return AIService.getAvailableModels('claude');
    }
  }

  /**
   * Test Claude model availability
   */
  private static async testClaudeModelsAvailability(
    client: Anthropic,
    models: readonly string[]
  ): Promise<readonly string[]> {
    const availableModels: string[] = [];

    for (const modelName of models) {
      try {
        await client.messages.create({
          model: modelName,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        });
        availableModels.push(modelName);
      } catch {
        // Model not available, skip it
        continue;
      }
    }

    return [...availableModels];
  }

  /**
   * Fetch available OpenAI models
   */
  private static async fetchOpenAIModels(apiKey: string): Promise<readonly string[]> {
    const client = new OpenAI({ apiKey });

    try {
      const response = await client.models.list();
      const models = response.data
        .filter(
          model =>
            model.id.includes('gpt-4') ||
            model.id.includes('gpt-3.5') ||
            model.id.includes('gpt-4o')
        )
        .map(model => model.id)
        .sort();

      return models.length > 0 ? [...models] : AIService.getAvailableModels('openai');
    } catch (error) {
      return AIService.getAvailableModels('openai');
    }
  }

  /**
   * Fetch available Ollama models
   */
  public static async fetchOllamaModels(baseUrl: string): Promise<readonly string[]> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const models = (data.models || [])
        .map((model: any) => model.name || model.model)
        .filter((name: string) => name)
        .sort();

      return models.length > 0 ? [...models] : AIService.getAvailableModels('ollama');
    } catch (error) {
      return AIService.getAvailableModels('ollama');
    }
  }

  /**
   * Get default model for a provider
   */
  public static getDefaultModel(provider: AIProviderType): string {
    const defaultModels = {
      gemini: 'gemini-2.0-flash',
      claude: 'claude-3-5-sonnet-20241022',
      openai: 'gpt-4',
      ollama: 'phi3:mini',
      'devsum-cloud': 'gemini-2.0-flash',
    } as const;

    return defaultModels[provider];
  }

  private async generateCommitWithGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: this.model || 'gemini-2.0-flash',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseCommitResponse(text);
  }

  private async generateCommitWithClaude(prompt: string): Promise<string> {
    if (!this.claudeClient) {
      throw new Error('Claude client not initialized');
    }

    const response = await this.claudeClient.messages.create({
      model: this.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    return this.parseCommitResponse(text);
  }

  private async generateCommitWithOpenAI(prompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: this.model || 'gpt-4',
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseCommitResponse(text);
  }

  private async generateCommitWithOllama(prompt: string): Promise<string> {
    const baseUrl = this.baseUrl || 'http://localhost:11434';
    const model = this.model || 'phi3:mini';

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.response || '';

      return this.parseCommitResponse(text);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to Ollama at ${baseUrl}. Make sure Ollama is running.`
        );
      }
      throw error;
    }
  }

  private buildCommitPrompt(changes: StagedChanges, options: CommitMessageOptions): string {
    const { conventional, emoji, length } = options;

    // Build detailed file summary with change analysis
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    // Build comprehensive change summary
    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}

Change Analysis:
- Added files: ${changes.addedFiles.length} (${changes.addedFiles.join(', ') || 'none'})
- Modified files: ${changes.modifiedFiles.length} (${changes.modifiedFiles.join(', ') || 'none'})
- Deleted files: ${changes.deletedFiles.length} (${changes.deletedFiles.join(', ') || 'none'})`;

    // Build format instructions
    let formatInstructions = '';
    if (conventional) {
      formatInstructions = `
Use conventional commit format: <type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
Examples: feat(auth): add login validation
         fix(api): resolve timeout issue
         docs: update README`;
    }

    if (emoji) {
      formatInstructions += `
Use appropriate emojis:
✨ feat: new features
🐛 fix: bug fixes
📚 docs: documentation
🎨 style: formatting
♻️ refactor: code changes
✅ test: testing
🔧 chore: maintenance`;
    }

    // Build length instructions with emphasis on detailed analysis
    let lengthInstructions = '';
    switch (length) {
      case 'short':
        lengthInstructions =
          'Generate a SHORT commit message as a bulleted list (2-3 bullet points, each 50-80 characters). Focus on the most significant changes only with descriptive sentences.';
        break;
      case 'medium':
        lengthInstructions =
          'Generate a MEDIUM commit message as a bulleted list (3-5 bullet points, each 60-100 characters). Include key changes and improvements with detailed descriptions.';
        break;
      case 'detailed':
        lengthInstructions =
          'Generate a DETAILED commit message as a bulleted list (4-7 bullet points, each 80-120 characters). Provide comprehensive analysis of ALL changes made with long, descriptive sentences that explain what was changed, why it was changed, and the impact of the changes.';
        break;
    }

    return `Generate a comprehensive commit message for the following changes:

${changeSummary}

Requirements:
${lengthInstructions}
${formatInstructions}

IMPORTANT: Analyze ALL the changes thoroughly and create detailed bullet points that capture:
- Every significant change made to the codebase
- New functionality that was added
- Bugs that were fixed
- Code refactoring or improvements
- Configuration or documentation updates
- Any architectural changes or optimizations

Format the commit message as a bulleted list where each bullet point describes a specific change:
- Use present tense ("Fix bug" not "Fixed bug")
- Start each bullet with a verb (Fix, Add, Update, Remove, Refactor, etc.)
- Be specific about what was changed and why
- Each bullet should be a long, descriptive sentence (80-120 characters)
- Cover ALL significant changes, not just the main ones
- Include technical details about the implementation and impact

Examples of good detailed bulleted commit messages:
- Fix authentication validation bug in login form that was causing users to be incorrectly rejected during login attempts
- Add user profile editing functionality with comprehensive validation to ensure data integrity and prevent unauthorized modifications
- Update README with detailed installation and configuration instructions to help new developers get started quickly
- Remove deprecated API endpoints and update client code to use the new RESTful endpoints for improved performance
- Refactor database connection handling to implement better error management and connection pooling for improved reliability
- Optimize query performance in user search functionality by adding proper database indexes and query optimization
- Add comprehensive error handling for file upload operations to prevent crashes and provide better user feedback

Generate only the commit message as a bulleted list, no additional text:`;
  }

  /**
   * Build detailed commit prompt with diff content
   */
  private buildDetailedCommitPrompt(
    changes: StagedChanges,
    diffContent: string,
    options: CommitMessageOptions
  ): string {
    const { conventional, emoji, length } = options;

    // Build detailed file summary with change analysis
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    // Build comprehensive change summary
    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}

Change Analysis:
- Added files: ${changes.addedFiles.length} (${changes.addedFiles.join(', ') || 'none'})
- Modified files: ${changes.modifiedFiles.length} (${changes.modifiedFiles.join(', ') || 'none'})
- Deleted files: ${changes.deletedFiles.length} (${changes.deletedFiles.join(', ') || 'none'})`;

    // Build format instructions
    let formatInstructions = '';
    if (conventional) {
      formatInstructions = `
Use conventional commit format: <type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
Examples: feat(auth): add login validation
         fix(api): resolve timeout issue
         docs: update README`;
    }

    if (emoji) {
      formatInstructions += `
Use appropriate emojis:
✨ feat: new features
🐛 fix: bug fixes
📚 docs: documentation
🎨 style: formatting
♻️ refactor: code changes
✅ test: testing
🔧 chore: maintenance`;
    }

    // Build length instructions with emphasis on detailed analysis
    let lengthInstructions = '';
    switch (length) {
      case 'short':
        lengthInstructions =
          'Generate a SHORT commit message as a bulleted list (2-3 bullet points, each 50-80 characters). Focus on the most significant changes only with descriptive sentences.';
        break;
      case 'medium':
        lengthInstructions =
          'Generate a MEDIUM commit message as a bulleted list (3-5 bullet points, each 60-100 characters). Include key changes and improvements with detailed descriptions.';
        break;
      case 'detailed':
        lengthInstructions =
          'Generate a DETAILED commit message as a bulleted list (4-7 bullet points, each 80-120 characters). Provide comprehensive analysis of ALL changes made with long, descriptive sentences that explain what was changed, why it was changed, and the impact of the changes.';
        break;
    }

    // Truncate diff content if it's too long (keep first 2000 characters)
    const truncatedDiff =
      diffContent.length > 2000
        ? diffContent.substring(0, 2000) + '\n... (diff truncated for brevity)'
        : diffContent;

    return `Generate a comprehensive commit message for the following changes:

${changeSummary}

Detailed Code Changes:
${truncatedDiff}

Requirements:
${lengthInstructions}
${formatInstructions}

IMPORTANT: Analyze the actual code changes in the diff above and create detailed bullet points that capture:
- Every significant change made to the codebase based on the actual diff
- New functionality that was added (analyze the + lines)
- Bugs that were fixed (analyze the - and + lines)
- Code refactoring or improvements (analyze the changes)
- Configuration or documentation updates
- Any architectural changes or optimizations
- Specific methods, functions, or classes that were modified

Format the commit message as a bulleted list where each bullet point describes a specific change:
- Use present tense ("Fix bug" not "Fixed bug")
- Start each bullet with a verb (Fix, Add, Update, Remove, Refactor, etc.)
- Be specific about what was changed and why based on the actual diff
- Each bullet should be a long, descriptive sentence (80-120 characters)
- Cover ALL significant changes visible in the diff
- Include technical details about the implementation and impact

Examples of good detailed bulleted commit messages:
- Fix authentication validation bug in login form that was causing users to be incorrectly rejected during login attempts
- Add user profile editing functionality with comprehensive validation to ensure data integrity and prevent unauthorized modifications
- Update README with detailed installation and configuration instructions to help new developers get started quickly
- Remove deprecated API endpoints and update client code to use the new RESTful endpoints for improved performance
- Refactor database connection handling to implement better error management and connection pooling for improved reliability
- Optimize query performance in user search functionality by adding proper database indexes and query optimization
- Add comprehensive error handling for file upload operations to prevent crashes and provide better user feedback

Generate only the commit message as a bulleted list, no additional text:`;
  }

  private parseCommitResponse(response: string): string {
    // Clean up the response and extract the commit message
    const lines = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    // Remove common prefixes that AI might add
    const cleanedLines = lines.map(line =>
      line.replace(/^(commit message:|message:|commit:)/i, '').trim()
    );

    // Filter for bulleted lines (starting with - or *)
    const bulletLines = cleanedLines.filter(
      line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•')
    );

    // If we have bulleted lines, use them; otherwise fall back to all lines
    const messageLines = bulletLines.length > 0 ? bulletLines : cleanedLines;

    // Join lines with newlines to preserve bulleted format
    let message = messageLines.join('\n').trim();

    // Remove quotes if the entire message is wrapped in them
    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1);
    }
    if (message.startsWith("'") && message.endsWith("'")) {
      message = message.slice(1, -1);
    }

    // Ensure we have a message
    if (!message) {
      message = '- Update files';
    }

    return message;
  }

  private async generateBranchNameWithGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: this.model || 'gemini-2.0-flash',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseBranchNameResponse(text);
  }

  private async generateBranchNameWithClaude(prompt: string): Promise<string> {
    if (!this.claudeClient) {
      throw new Error('Claude client not initialized');
    }

    const response = await this.claudeClient.messages.create({
      model: this.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    return this.parseBranchNameResponse(text);
  }

  private async generateBranchNameWithOpenAI(prompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: this.model || 'gpt-4',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseBranchNameResponse(text);
  }

  private async generateBranchNameWithOllama(prompt: string): Promise<string> {
    const baseUrl = this.baseUrl || 'http://localhost:11434';
    const model = this.model || 'phi3:mini';

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.response || '';

      return this.parseBranchNameResponse(text);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to Ollama at ${baseUrl}. Make sure Ollama is running.`
        );
      }
      throw error;
    }
  }

  private buildBranchNamePrompt(changes: StagedChanges): string {
    // Build file summary
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    // Build change summary
    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}`;

    return `Generate a git branch name for the following changes:

${changeSummary}

Requirements:
- Use conventional branch naming: type/description
- Common types: feature, fix, hotfix, chore, docs, refactor, test
- Description should be 2-4 words, kebab-case
- Be descriptive but concise
- Focus on the main purpose of the changes
- Examples: feature/user-authentication, fix/login-bug, refactor/api-endpoints

Generate only the branch name, no additional text:`;
  }

  /**
   * Build alternative branch name prompt when there's a conflict
   */
  private buildAlternativeBranchNamePrompt(
    changes: StagedChanges,
    existingBranches: string[],
    originalName: string
  ): string {
    // Build file summary
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    // Build change summary
    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}`;

    // Build existing branches list
    const existingBranchesList = existingBranches.length > 0 ? existingBranches.join(', ') : 'none';

    return `Generate a DIFFERENT git branch name for the following changes:

${changeSummary}

IMPORTANT: The branch name "${originalName}" already exists in this repository.

Existing branches: ${existingBranchesList}

Requirements:
- Use conventional branch naming: type/description
- Common types: feature, fix, hotfix, chore, docs, refactor, test
- Description should be 2-4 words, kebab-case
- Be descriptive but concise
- Focus on the main purpose of the changes
- Generate a COMPLETELY DIFFERENT name from "${originalName}"
- Avoid using similar words or patterns from existing branches
- Examples: feature/user-authentication, fix/login-bug, refactor/api-endpoints

Generate only the branch name, no additional text:`;
  }

  private buildPullRequestTitlePrompt(changes: StagedChanges): string {
    // Build file summary
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    // Build change summary
    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}`;

    return `Generate a pull request title for the following changes:

${changeSummary}

Requirements:
- Generate a SINGLE SENTENCE title (under 60 characters)
- Use present tense ("Add feature" not "Added feature")
- Be concise but descriptive
- Focus on the main purpose or impact of the changes
- Start with a verb (Add, Fix, Update, Remove, Refactor, etc.)
- Avoid technical jargon when possible

Examples of good PR titles:
- Add user authentication system
- Fix login validation bug
- Update README with installation guide
- Remove deprecated API endpoints
- Refactor database connection handling

Generate only the pull request title, no additional text:`;
  }

  private parseBranchNameResponse(response: string): string {
    // Clean up the response and extract the branch name
    let branchName = response.trim();

    // Remove common prefixes
    branchName = branchName.replace(/^(branch name:|branch:|name:)/i, '').trim();

    // Remove quotes
    if (branchName.startsWith('"') && branchName.endsWith('"')) {
      branchName = branchName.slice(1, -1);
    }
    if (branchName.startsWith("'") && branchName.endsWith("'")) {
      branchName = branchName.slice(1, -1);
    }

    // Ensure it follows git branch naming conventions
    branchName = branchName
      .toLowerCase()
      .replace(/[^a-z0-9\/\-_]/g, '-') // Replace invalid chars with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Ensure we have a valid branch name
    if (!branchName || branchName.length < 3) {
      branchName = 'feature/auto-generated-branch';
    }

    // Ensure it starts with a type prefix if it doesn't already
    if (!branchName.includes('/')) {
      branchName = `feature/${branchName}`;
    }

    return branchName;
  }

  private async generatePullRequestTitleWithGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: this.model || 'gemini-2.0-flash',
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parsePullRequestTitleResponse(text);
  }

  private async generatePullRequestTitleWithClaude(prompt: string): Promise<string> {
    if (!this.claudeClient) {
      throw new Error('Claude client not initialized');
    }

    const response = await this.claudeClient.messages.create({
      model: this.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from Claude's response
    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as any).text)
      .join('\n');

    return this.parsePullRequestTitleResponse(text);
  }

  private async generatePullRequestTitleWithOpenAI(prompt: string): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: this.model || 'gpt-4',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parsePullRequestTitleResponse(text);
  }

  private async generatePullRequestTitleWithOllama(prompt: string): Promise<string> {
    const baseUrl = this.baseUrl || 'http://localhost:11434';
    const model = this.model || 'phi3:mini';

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.response || '';

      return this.parsePullRequestTitleResponse(text);
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Failed to connect to Ollama at ${baseUrl}. Make sure Ollama is running.`
        );
      }
      throw error;
    }
  }

  private parsePullRequestTitleResponse(response: string): string {
    // Clean up the response and extract the pull request title
    let title = response.trim();

    // Remove common prefixes
    title = title.replace(/^(pull request title:|pr title:|title:)/i, '').trim();

    // Remove quotes
    if (title.startsWith('"') && title.endsWith('"')) {
      title = title.slice(1, -1);
    }
    if (title.startsWith("'") && title.endsWith("'")) {
      title = title.slice(1, -1);
    }

    // Ensure it's a single sentence
    title = title.split('\n')[0]?.trim() || title;

    // Ensure we have a valid title
    if (!title || title.length < 3) {
      title = 'Update files';
    }

    // Ensure it's under 60 characters
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    return title;
  }
}
