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
  format?: 'markdown' | 'json' | 'html' | 'txt';
  length?: ReportLength;
}

export interface AIResponse {
  summary: string;
  accomplishments: string[];
  recommendations?: string[];
}

export interface StagedChanges {
  stagedFiles: string[];
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  diffStats: {
    insertions: number;
    deletions: number;
  };
}

export interface CommitOptions {
  auto?: boolean;
  conventional?: boolean;
  emoji?: boolean;
  length?: 'short' | 'medium' | 'detailed';
  provider?: string;
  dryRun?: boolean;
  noHeader?: boolean;
  branch?: string;
  newBranch?: string;
  switchBranch?: string;
  listBranches?: boolean;
  autoBranch?: boolean;
  autoAdd?: boolean;
  autoPush?: boolean;
  report?: boolean;
}

export interface CommitMessageOptions {
  conventional: boolean;
  emoji: boolean;
  length: 'short' | 'medium' | 'detailed';
}