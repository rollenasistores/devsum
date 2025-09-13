export interface Config {
  provider: 'claude' | 'openai' | 'gemini' | 'devsum-api';
  apiKey: string;
  defaultOutput: string;
  model?: string;
  // DevSum API configuration
  devsumApiUrl?: string;
  devsumToken?: string;
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
}

export interface AIResponse {
  summary: string;
  accomplishments: string[];
  recommendations?: string[];
}