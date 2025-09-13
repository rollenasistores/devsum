export interface Config {
  provider: 'devsum-api';
  apiKey: string;
  defaultOutput: string;
  model?: string;
  // DevSum API configuration
  devsumApiUrl?: string;
  devsumToken?: string;
  // AI provider selection
  aiProvider?: 'gemini' | 'claude' | 'gpt-4' | 'coming-soon';
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

export interface ReportOptions {
  since?: string;
  until?: string;
  output?: string;
  format?: 'markdown' | 'json';
  length?: 'short' | 'light' | 'detailed';
}

export interface AIResponse {
  summary: string;
  accomplishments: string[];
  recommendations?: string[];
}