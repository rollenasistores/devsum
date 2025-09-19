/**
 * AI Provider configuration interface
 * Represents a configured AI service provider
 */
export interface AIProvider {
  name: string;
  provider: AIProviderType;
  apiKey: string;
  model?: string;
  isDefault?: boolean;
}

/**
 * Supported AI provider types
 */
export type AIProviderType = 'claude' | 'openai' | 'gemini';

/**
 * Main configuration interface
 * Contains all application settings and provider configurations
 */
export interface Config {
  providers: AIProvider[];
  defaultOutput: string;
  defaultProvider?: string | undefined;
}

/**
 * Git commit information interface
 * Represents a single git commit with metadata
 */
export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
  files: string[];
  insertions?: number;
  deletions?: number;
}

/**
 * Report length options
 */
export type ReportLength = 'light' | 'short' | 'detailed';

/**
 * Report generation options
 */
export interface ReportOptions {
  since?: string | undefined;
  until?: string | undefined;
  output?: string | undefined;
  format?: ReportFormat | undefined;
  length?: ReportLength | undefined;
  author?: string | undefined;
  provider?: string | undefined;
  noHeader?: boolean | undefined;
  today?: boolean | undefined;
  light?: boolean | undefined;
  short?: boolean | undefined;
  detailed?: boolean | undefined;
  listProviders?: boolean | undefined;
  listModels?: boolean | undefined;
}

/**
 * Supported report output formats
 */
export type ReportFormat = 'markdown' | 'json' | 'html' | 'txt';

/**
 * AI response interface
 * Contains the generated report content
 */
export interface AIResponse {
  readonly summary: string;
  readonly accomplishments: readonly string[];
  readonly recommendations?: readonly string[];
}

/**
 * Staged changes information
 * Represents the current state of staged files
 */
export interface StagedChanges {
  stagedFiles: string[];
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  diffStats: DiffStats;
}

/**
 * Diff statistics interface
 */
export interface DiffStats {
  readonly insertions: number;
  readonly deletions: number;
}

/**
 * Commit generation options
 */
export interface CommitOptions {
  auto?: boolean | undefined;
  conventional?: boolean | undefined;
  emoji?: boolean | undefined;
  length?: CommitLength | undefined;
  provider?: string | undefined;
  dryRun?: boolean | undefined;
  noHeader?: boolean | undefined;
  branch?: string | undefined;
  newBranch?: string | undefined;
  switchBranch?: string | undefined;
  listBranches?: boolean | undefined;
  autoBranch?: boolean | undefined;
  autoAdd?: boolean | undefined;
  autoPush?: boolean | undefined;
  report?: boolean | undefined;
  generatedBranchName?: string | undefined;
}

/**
 * Commit message length options
 */
export type CommitLength = 'short' | 'medium' | 'detailed';

/**
 * Commit message generation options
 */
export interface CommitMessageOptions {
  readonly conventional: boolean;
  readonly emoji: boolean;
  readonly length: CommitLength;
}

/**
 * Branch information interface
 */
export interface BranchInfo {
  readonly current: string;
  readonly isClean: boolean;
  readonly hasStagedChanges: boolean;
  readonly hasUnstagedChanges: boolean;
  readonly lastCommit?: string | undefined;
}

/**
 * Repository statistics interface
 */
export interface RepositoryStats {
  readonly totalCommits: number;
  readonly authors: number;
  readonly branches: number;
  readonly firstCommit?: string | undefined;
  readonly lastCommit?: string | undefined;
}

/**
 * File change information interface
 */
export interface FileChangeInfo {
  readonly insertions: number;
  readonly deletions: number;
  readonly type: FileChangeType;
}

/**
 * File change types
 */
export type FileChangeType = 'added' | 'modified' | 'deleted' | 'unknown';

/**
 * Changes summary interface
 */
export interface ChangesSummary {
  readonly files: readonly string[];
  readonly changes: Readonly<Record<string, FileChangeInfo>>;
  readonly totalInsertions: number;
  readonly totalDeletions: number;
}

/**
 * Unstaged changes interface
 */
export interface UnstagedChanges {
  modified: string[];
  untracked: string[];
  deleted: string[];
}

/**
 * Branches information interface
 */
export interface BranchesInfo {
  local: string[];
  remote: string[];
  current: string;
}

/**
 * Git user configuration interface
 */
export interface GitUserConfig {
  readonly name?: string | undefined;
  readonly email?: string | undefined;
}

/**
 * Update information interface
 */
export interface UpdateInfo {
  readonly hasUpdate: boolean;
  readonly currentVersion: string;
  readonly latestVersion: string;
  readonly updateUrl?: string | undefined;
}

/**
 * HTML report metadata interface
 */
export interface HTMLReportMetadata {
  since?: string | undefined;
  until?: string | undefined;
  author?: string | undefined;
  branch: string;
  generatedAt: string;
  length: string;
  commitsAnalyzed: number;
  authors: number;
  filesModified: number;
  dateRange: string;
}

/**
 * Plain text report metadata interface
 */
export interface PlainTextReportMetadata {
  since?: string | undefined;
  until?: string | undefined;
  author?: string | undefined;
  branch: string;
  generatedAt: string;
  length: string;
  commitsAnalyzed: number;
  authors: number;
  filesModified: number;
  dateRange: string;
}
