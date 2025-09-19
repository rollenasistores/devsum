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
} from '../types/index.js';

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

  private constructor(provider: AIProviderType, apiKey: string, model: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;

    this.initializeClients();
  }

  /**
   * Create AIService instance from provider configuration
   */
  public static fromProvider(provider: AIProvider): AIService {
    const model = provider.model ?? AIService.getDefaultModel(provider.provider);
    return new AIService(provider.provider, provider.apiKey, model);
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
    };

    return models[provider] ?? [];
  }

  /**
   * Fetch available models from the AI provider's API
   */
  public static async fetchAvailableModels(
    provider: AIProviderType,
    apiKey: string
  ): Promise<readonly string[]> {
    try {
      switch (provider) {
        case 'gemini':
          return await AIService.fetchGeminiModels(apiKey);
        case 'claude':
          return await AIService.fetchClaudeModels(apiKey);
        case 'openai':
          return await AIService.fetchOpenAIModels(apiKey);
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
   * Get default model for a provider
   */
  public static getDefaultModel(provider: AIProviderType): string {
    const defaultModels = {
      gemini: 'gemini-2.0-flash',
      claude: 'claude-3-5-sonnet-20241022',
      openai: 'gpt-4',
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

  private buildCommitPrompt(changes: StagedChanges, options: CommitMessageOptions): string {
    const { conventional, emoji, length } = options;

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

    // Build length instructions
    let lengthInstructions = '';
    switch (length) {
      case 'short':
        lengthInstructions = 'Generate a SHORT commit message (1 line, under 50 characters)';
        break;
      case 'medium':
        lengthInstructions =
          'Generate a MEDIUM commit message (1-2 lines, under 72 characters per line)';
        break;
      case 'detailed':
        lengthInstructions =
          'Generate a DETAILED commit message (2-3 lines, with context and impact)';
        break;
    }

    return `Generate a commit message for the following changes:

${changeSummary}

Requirements:
${lengthInstructions}
${formatInstructions}

Focus on:
- What was changed (not how)
- Why it was changed (if obvious)
- Impact or benefit
- Use present tense ("add feature" not "added feature")
- Be concise but descriptive

Generate only the commit message, no additional text:`;
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

    // Join lines and clean up
    let message = cleanedLines.join(' ').trim();

    // Remove quotes if the entire message is wrapped in them
    if (message.startsWith('"') && message.endsWith('"')) {
      message = message.slice(1, -1);
    }
    if (message.startsWith("'") && message.endsWith("'")) {
      message = message.slice(1, -1);
    }

    // Ensure we have a message
    if (!message) {
      message = 'Update files';
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
}
