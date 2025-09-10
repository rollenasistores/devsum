import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { Config, GitCommit, AIResponse } from '../types/index.js';

export class AIService {
  private geminiClient?: GoogleGenerativeAI;
  private claudeClient?: Anthropic;

  constructor(private config: Config) {
    if (config.provider === 'gemini') {
      this.geminiClient = new GoogleGenerativeAI(config.apiKey);
    } else if (config.provider === 'claude') {
      this.claudeClient = new Anthropic({
        apiKey: config.apiKey,
      });
    } else {
      throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  async generateReport(commits: GitCommit[]): Promise<AIResponse> {
    const prompt = this.buildPrompt(commits);
    
    try {
      if (this.config.provider === 'gemini') {
        return await this.generateWithGemini(prompt);
      } else if (this.config.provider === 'claude') {
        return await this.generateWithClaude(prompt);
      }
      
      throw new Error(`Unsupported provider: ${this.config.provider}`);
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
      model: this.config.model || 'gemini-2.0-flash'
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
      model: this.config.model || 'claude-3-5-sonnet-20241022',
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

  private buildPrompt(commits: GitCommit[]): string {
    const commitSummaries = commits.map(commit => 
      `- ${commit.date.split('T')[0]} | ${commit.message} | Files: ${commit.files.slice(0, 3).join(', ')}${commit.files.length > 3 ? '...' : ''}`
    ).join('\n');

    return `Please analyze the following git commits and generate an accomplishment report.

Git Commits:
${commitSummaries}

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
    }
    return [];
  }

  // Helper method to get default model for a provider
  static getDefaultModel(provider: string): string {
    if (provider === 'gemini') {
      return 'gemini-2.0-flash';
    } else if (provider === 'claude') {
      return 'claude-3-5-sonnet-20241022';
    }
    throw new Error(`Unknown provider: ${provider}`);
  }
}