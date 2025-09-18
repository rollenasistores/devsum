export interface AIProvider {
  name: string;
  provider: 'claude' | 'openai' | 'gemini';
  apiKey: string;
  model?: string;
  isDefault?: boolean;
}

export interface Config {
  providers: AIProvider[];
  defaultOutput: string;
  defaultProvider?: string; // Name of the default provider
}

export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
  files: string[];
  insertions?: number;  
  deletions?: number; 
}

export type ReportLength = 'light' | 'short' | 'detailed';

export interface ReportOptions {
  since?: string;
  until?: string;
  output?: string;
  format?: 'markdown' | 'json' | 'html';
  length?: ReportLength;
}

export interface AIResponse {
  summary: string;
  accomplishments: string[];
  recommendations?: string[];
}