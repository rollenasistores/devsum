import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { Config, GitCommit, AIResponse, ReportLength, AIProvider, StagedChanges, CommitMessageOptions } from '../types/index.js';

export class AIService {
  private geminiClient?: GoogleGenerativeAI;
  private claudeClient?: Anthropic;
  private openaiClient?: OpenAI;
  private provider: string;
  private apiKey: string;
  private model?: string;

  constructor(config: Config | { provider: string; apiKey: string; model?: string; defaultOutput: string }) {
    // Handle both old and new config formats
    if ('providers' in config) {
      // New format - should not be used directly, use getProvider instead
      throw new Error('Use AIService.fromProvider() for new config format');
    } else {
      // Old format or direct provider config
      this.provider = config.provider;
      this.apiKey = config.apiKey;
      this.model = config.model;
    }

    if (this.provider === 'gemini') {
      this.geminiClient = new GoogleGenerativeAI(this.apiKey);
    } else if (this.provider === 'claude') {
      this.claudeClient = new Anthropic({
        apiKey: this.apiKey,
      });
    } else if (this.provider === 'openai') {
      this.openaiClient = new OpenAI({
        apiKey: this.apiKey,
      });
    } else {
      throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  static fromProvider(provider: AIProvider): AIService {
    return new AIService({
      provider: provider.provider,
      apiKey: provider.apiKey,
      model: provider.model,
      defaultOutput: './reports' // This will be overridden by the caller
    });
  }

  async generateReport(commits: GitCommit[], length: ReportLength = 'detailed'): Promise<AIResponse> {
    const prompt = this.buildPrompt(commits, length);
    
    try {
      if (this.provider === 'gemini') {
        return await this.generateWithGemini(prompt);
      } else if (this.provider === 'claude') {
        return await this.generateWithClaude(prompt);
      } else if (this.provider === 'openai') {
        return await this.generateWithOpenAI(prompt);
      }
      
      throw new Error(`Unsupported provider: ${this.provider}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      throw new Error('Unknown AI service error');
    }
  }

  private async generateWithGemini(prompt: string): Promise<AIResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({ 
      model: this.model || 'gemini-2.0-flash'
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
          content: prompt
        }
      ]
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
          content: prompt
        }
      ]
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseResponse(text);
  }

  private buildPrompt(commits: GitCommit[], length: ReportLength = 'detailed'): string {
    const commitSummaries = commits.map(commit => 
      `- ${commit.date.split('T')[0]} | ${commit.message} | Files: ${commit.files.slice(0, 3).join(', ')}${commit.files.length > 3 ? '...' : ''}`
    ).join('\n');

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

  private getLengthInstructions(length: ReportLength): string {
    switch (length) {
      case 'light':
        return `Generate a LIGHT report with:
- Very brief summary (1-2 sentences)
- Top 3-5 key accomplishments only
- Minimal technical details
- Focus on high-level impact and business value
- Keep it concise and executive-friendly`;
      
      case 'short':
        return `Generate a SHORT report with:
- Concise summary (2-3 sentences)
- 5-8 key accomplishments
- Some technical highlights
- Balanced detail level for quick review
- Good for daily/weekly updates`;
      
      case 'detailed':
      default:
        return `Generate a DETAILED report with:
- Comprehensive summary (3-5 sentences)
- 8-15 key accomplishments
- Extensive technical highlights and improvements
- Detailed analysis of patterns and trends
- Recommendations for future work
- Perfect for comprehensive reviews and documentation`;
    }
  }

  private parseResponse(response: string): AIResponse {
    const accomplishments: string[] = [];
    const lines = response.split('\n');
    
    let inAccomplishments = false;
    let summary = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('summary:')) {
        inAccomplishments = false;
        continue;
      }
      
      if (trimmedLine.toLowerCase().includes('accomplishments:') || 
          trimmedLine.toLowerCase().includes('highlights:')) {
        inAccomplishments = true;
        continue;
      }
      
      if (inAccomplishments && trimmedLine.startsWith('-')) {
        accomplishments.push(trimmedLine.substring(1).trim());
      } else if (!inAccomplishments && trimmedLine && !trimmedLine.startsWith('**')) {
        summary += trimmedLine + ' ';
      }
    }
    
    return {
      summary: summary.trim() || 'Work completed during the specified period.',
      accomplishments: accomplishments.length > 0 ? accomplishments : ['Various development tasks completed'],
    };
  }

  // Helper method to get available models for the current provider
  static getAvailableModels(provider: string): string[] {
    if (provider === 'gemini') {
      return [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
      ];
    } else if (provider === 'claude') {
      return [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229'
      ];
    } else if (provider === 'openai') {
      return [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo'
      ];
    }
    return [];
  }

  // Helper method to get default model for a provider
  static getDefaultModel(provider: string): string {
    if (provider === 'gemini') {
      return 'gemini-2.0-flash';
    } else if (provider === 'claude') {
      return 'claude-3-5-sonnet-20241022';
    } else if (provider === 'openai') {
      return 'gpt-4';
    }
    throw new Error(`Unknown provider: ${provider}`);
  }

  /**
   * Generate commit message from staged changes
   */
  async generateCommitMessage(changes: StagedChanges, options: CommitMessageOptions): Promise<string> {
    const prompt = this.buildCommitPrompt(changes, options);
    
    try {
      if (this.provider === 'gemini') {
        return await this.generateCommitWithGemini(prompt);
      } else if (this.provider === 'claude') {
        return await this.generateCommitWithClaude(prompt);
      } else if (this.provider === 'openai') {
        return await this.generateCommitWithOpenAI(prompt);
      }
      
      throw new Error(`Unsupported provider: ${this.provider}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      throw new Error('Unknown AI service error');
    }
  }

  /**
   * Generate branch name from staged changes
   */
  async generateBranchName(changes: StagedChanges): Promise<string> {
    const prompt = this.buildBranchNamePrompt(changes);
    
    try {
      if (this.provider === 'gemini') {
        return await this.generateBranchNameWithGemini(prompt);
      } else if (this.provider === 'claude') {
        return await this.generateBranchNameWithClaude(prompt);
      } else if (this.provider === 'openai') {
        return await this.generateBranchNameWithOpenAI(prompt);
      }
      
      throw new Error(`Unsupported provider: ${this.provider}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      throw new Error('Unknown AI service error');
    }
  }

  private async generateCommitWithGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({ 
      model: this.model || 'gemini-2.0-flash'
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
          content: prompt
        }
      ]
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
          content: prompt
        }
      ]
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseCommitResponse(text);
  }

  private buildCommitPrompt(changes: StagedChanges, options: CommitMessageOptions): string {
    const { conventional, emoji, length } = options;
    
    // Build file summary
    const fileSummary = changes.stagedFiles.map(file => {
      const isAdded = changes.addedFiles.includes(file);
      const isDeleted = changes.deletedFiles.includes(file);
      const isModified = changes.modifiedFiles.includes(file);
      
      let status = 'modified';
      if (isAdded) status = 'added';
      else if (isDeleted) status = 'deleted';
      
      return `- ${file} (${status})`;
    }).join('\n');

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
        lengthInstructions = 'Generate a MEDIUM commit message (1-2 lines, under 72 characters per line)';
        break;
      case 'detailed':
        lengthInstructions = 'Generate a DETAILED commit message (2-3 lines, with context and impact)';
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
    const lines = response.split('\n').map(line => line.trim()).filter(line => line);
    
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
      model: this.model || 'gemini-2.0-flash'
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
          content: prompt
        }
      ]
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
          content: prompt
        }
      ]
    });

    const text = response.choices[0]?.message?.content || '';
    return this.parseBranchNameResponse(text);
  }

  private buildBranchNamePrompt(changes: StagedChanges): string {
    // Build file summary
    const fileSummary = changes.stagedFiles.map(file => {
      const isAdded = changes.addedFiles.includes(file);
      const isDeleted = changes.deletedFiles.includes(file);
      const isModified = changes.modifiedFiles.includes(file);
      
      let status = 'modified';
      if (isAdded) status = 'added';
      else if (isDeleted) status = 'deleted';
      
      return `- ${file} (${status})`;
    }).join('\n');

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