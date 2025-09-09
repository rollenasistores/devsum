import { GoogleGenerativeAI } from '@google/generative-ai';
import { Config, GitCommit, AIResponse } from '../types/index.js';

export class AIService {
  private client: GoogleGenerativeAI;

  constructor(private config: Config) {
    if (config.provider !== 'gemini') {
      throw new Error('Only Gemini provider is currently supported');
    }
    
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateReport(commits: GitCommit[]): Promise<AIResponse> {
    const prompt = this.buildPrompt(commits);
    
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.config.model || 'gemini-1.5-flash'
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      throw new Error('Unknown AI service error');
    }
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
    // Simple parsing - in production you might want more robust parsing
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
}