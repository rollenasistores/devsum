import { simpleGit, SimpleGit } from 'simple-git';
import {
  GitCommit,
  StagedChanges,
  BranchInfo,
  RepositoryStats,
  ChangesSummary,
  UnstagedChanges,
  BranchesInfo,
  GitUserConfig,
  FileChangeInfo,
  FileChangeType,
} from '../types/index.js';

/**
 * Git service for repository operations
 * Handles git commands and data extraction
 */
export class GitService {
  private readonly git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir || process.cwd());
  }

  /**
   * Get git commits with optional filtering
   */
  public async getCommits(
    since?: string,
    until?: string,
    author?: string
  ): Promise<readonly GitCommit[]> {
    this.validateDateFilters(since, until);

    const args = this.buildGitLogArgs(since, until, author);

    try {
      const result = await this.git.raw(args);

      if (!result?.trim()) {
        return [];
      }

      const lines = result
        .trim()
        .split('\n')
        .filter(line => line.trim());
      return await this.processCommitLines(lines);
    } catch (error) {
      throw this.handleGitError(error);
    }
  }

  /**
   * Validate date filters
   */
  private validateDateFilters(since?: string, until?: string): void {
    if (since && !this.isValidDate(since)) {
      throw new Error(
        `Invalid 'since' date format: ${since}. Use YYYY-MM-DD or relative dates like 7d, 2w, 1m`
      );
    }

    if (until && !this.isValidDate(until)) {
      throw new Error(`Invalid 'until' date format: ${until}. Use YYYY-MM-DD format`);
    }
  }

  /**
   * Build git log command arguments
   */
  private buildGitLogArgs(since?: string, until?: string, author?: string): string[] {
    const args = ['log', '--max-count=100', '--pretty=format:%H|%ai|%s|%an <%ae>'];

    if (since) {
      const sinceDate = this.normalizeDate(since, '00:00:00');
      args.push(`--since=${sinceDate}`);
    }

    if (until) {
      const untilDate = this.normalizeDate(until, '23:59:59');
      args.push(`--until=${untilDate}`);
    }

    if (author) {
      args.push(`--author=${author}`);
    }

    return args;
  }

  /**
   * Normalize date string for git
   */
  private normalizeDate(date: string, time: string): string {
    return date.toLowerCase() === 'today'
      ? `${new Date().toISOString().split('T')[0]} ${time}`
      : date;
  }

  /**
   * Process commit lines from git log
   */
  private async processCommitLines(lines: string[]): Promise<readonly GitCommit[]> {
    const commits: GitCommit[] = [];

    for (const line of lines) {
      const commit = await this.processCommitLine(line);
      if (commit) {
        commits.push(commit);
      }
    }

    return commits;
  }

  /**
   * Process a single commit line
   */
  private async processCommitLine(line: string): Promise<GitCommit | null> {
    const parts = line.split('|');
    if (parts.length < 4) {
      return null;
    }

    const [hash, date, message, authorInfo] = parts;

    if (!hash || !date || !message || !authorInfo) {
      return null;
    }

    try {
      const files = await this.getCommitFiles(hash);
      const stats = await this.getCommitStats(hash);

      return {
        hash,
        date,
        message,
        author: authorInfo,
        files: [...files],
        insertions: stats.insertions,
        deletions: stats.deletions,
      };
    } catch (error) {
      console.warn(
        `Warning: Failed to process commit ${hash}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return null;
    }
  }

  /**
   * Get files changed in a commit
   */
  private async getCommitFiles(hash: string): Promise<readonly string[]> {
    const show = await this.git.show([hash, '--name-only', '--pretty=format:']);

    return show.split('\n').filter(line => line.trim().length > 0);
  }

  /**
   * Get commit statistics
   */
  private async getCommitStats(hash: string): Promise<{ insertions: number; deletions: number }> {
    try {
      const stats = await this.git.raw(['show', '--format=', '--numstat', hash]);

      let insertions = 0;
      let deletions = 0;

      const statLines = stats
        .trim()
        .split('\n')
        .filter(line => line.trim());
      for (const statLine of statLines) {
        const [add, del] = statLine.split('\t');
        if (add && add !== '-') insertions += parseInt(add) || 0;
        if (del && del !== '-') deletions += parseInt(del) || 0;
      }

      return { insertions, deletions };
    } catch {
      return { insertions: 0, deletions: 0 };
    }
  }

  /**
   * Handle git errors
   */
  private handleGitError(error: unknown): Error {
    if (error instanceof Error && error.message.includes('bad revision')) {
      return new Error(
        'Invalid date range or no commits found for the specified criteria. Check your --since and --until dates.'
      );
    }
    return new Error(
      `Failed to get git commits: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  /**
   * Check if current directory is a git repository
   */
  public async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  public async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get all unique authors from the repository
   */
  public async getAuthors(since?: string): Promise<readonly string[]> {
    try {
      const args = this.buildAuthorsArgs(since);
      const result = await this.git.raw(args);

      return this.extractUniqueAuthors(result);
    } catch {
      return [];
    }
  }

  /**
   * Build arguments for authors query
   */
  private buildAuthorsArgs(since?: string): string[] {
    const args = ['log', '--pretty=format:%an <%ae>'];

    if (since) {
      const sinceDate = this.normalizeDate(since, '00:00:00');
      args.push(`--since=${sinceDate}`);
    }

    return args;
  }

  /**
   * Extract unique authors from git log result
   */
  private extractUniqueAuthors(result: string): readonly string[] {
    return result
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .filter((author, index, array) => array.indexOf(author) === index)
      .sort();
  }

  /**
   * Get repository statistics
   */
  public async getRepoStats(): Promise<RepositoryStats> {
    try {
      const [totalCommits, authors, branches, firstCommit, lastCommit] = await Promise.all([
        this.getTotalCommits(),
        this.getAuthors(),
        this.getBranchCount(),
        this.getFirstCommitDate(),
        this.getLastCommitDate(),
      ]);

      return {
        totalCommits,
        authors: authors.length,
        branches,
        firstCommit,
        lastCommit,
      };
    } catch {
      return {
        totalCommits: 0,
        authors: 0,
        branches: 0,
      };
    }
  }

  /**
   * Get total commit count
   */
  private async getTotalCommits(): Promise<number> {
    try {
      const result = await this.git.raw(['rev-list', '--all', '--count']);
      return parseInt(result.trim()) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get branch count
   */
  private async getBranchCount(): Promise<number> {
    try {
      const result = await this.git.raw(['branch', '-a']);
      return result
        .split('\n')
        .filter(line => line.trim())
        .filter(line => !line.includes('->')).length;
    } catch {
      return 0;
    }
  }

  /**
   * Get first commit date
   */
  private async getFirstCommitDate(): Promise<string | undefined> {
    try {
      const result = await this.git.raw([
        'log',
        '--reverse',
        '--pretty=format:%ai',
        '--max-count=1',
      ]);
      return result.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get last commit date
   */
  private async getLastCommitDate(): Promise<string | undefined> {
    try {
      const result = await this.git.raw(['log', '--pretty=format:%ai', '--max-count=1']);
      return result.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Validate date string format
   */
  public isValidDate(dateString: string): boolean {
    // Check for relative dates like 7d, 2w, 1m, 3y
    if (this.isRelativeDate(dateString)) {
      return true;
    }

    // Check for special keywords
    if (this.isSpecialDate(dateString)) {
      return true;
    }

    // Check for ISO dates (YYYY-MM-DD)
    if (this.isISODate(dateString)) {
      return this.isValidISODate(dateString);
    }

    // Check for ISO timestamps
    if (this.isISOTimestamp(dateString)) {
      return this.isValidISOTimestamp(dateString);
    }

    // Check for other common date formats
    return this.isValidGenericDate(dateString);
  }

  /**
   * Check if string is a relative date
   */
  private isRelativeDate(dateString: string): boolean {
    return /^\d+[dwmy]$/.test(dateString);
  }

  /**
   * Check if string is a special date keyword
   */
  private isSpecialDate(dateString: string): boolean {
    return ['yesterday', 'today', 'now'].includes(dateString.toLowerCase());
  }

  /**
   * Check if string is an ISO date
   */
  private isISODate(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  }

  /**
   * Check if string is an ISO timestamp
   */
  private isISOTimestamp(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(dateString);
  }

  /**
   * Validate ISO date
   */
  private isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate ISO timestamp
   */
  private isValidISOTimestamp(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate generic date
   */
  private isValidGenericDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Get current user's git config
   */
  public async getCurrentUser(): Promise<GitUserConfig> {
    try {
      const [name, email] = await Promise.all([
        this.git.raw(['config', 'user.name']).catch(() => ''),
        this.git.raw(['config', 'user.email']).catch(() => ''),
      ]);

      return {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      };
    } catch {
      return {};
    }
  }

  /**
   * Get staged changes for commit message generation
   */
  public async getStagedChanges(): Promise<StagedChanges> {
    try {
      const [stagedFiles, status, diffStats] = await Promise.all([
        this.getStagedFiles(),
        this.git.status(),
        this.getDiffStats(),
      ]);

      return {
        stagedFiles: [...stagedFiles],
        modifiedFiles: status.modified || [],
        addedFiles: status.created || [],
        deletedFiles: status.deleted || [],
        diffStats,
      };
    } catch (error) {
      throw new Error(
        `Failed to get staged changes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get staged files list
   */
  private async getStagedFiles(): Promise<readonly string[]> {
    const result = await this.git.raw(['diff', '--cached', '--name-only']);
    return result
      .trim()
      .split('\n')
      .filter(file => file.trim());
  }

  /**
   * Get diff statistics
   */
  private async getDiffStats(): Promise<{ insertions: number; deletions: number }> {
    const result = await this.git.raw(['diff', '--cached', '--numstat']);

    if (!result.trim()) {
      return { insertions: 0, deletions: 0 };
    }

    let insertions = 0;
    let deletions = 0;

    const statLines = result.trim().split('\n');
    for (const line of statLines) {
      const [add, del] = line.split('\t');
      if (add && add !== '-') insertions += parseInt(add) || 0;
      if (del && del !== '-') deletions += parseInt(del) || 0;
    }

    return { insertions, deletions };
  }

  /**
   * Commit changes with a message
   */
  public async commitChanges(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(
        `Failed to commit changes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get diff content for staged files
   */
  public async getStagedDiff(): Promise<string> {
    try {
      return await this.git.raw(['diff', '--cached']);
    } catch (error) {
      throw new Error(
        `Failed to get staged diff: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get file changes summary for AI analysis
   */
  public async getChangesSummary(): Promise<ChangesSummary> {
    try {
      const stagedChanges = await this.getStagedChanges();
      const changes = await this.analyzeFileChanges(stagedChanges);

      const totalInsertions = Object.values(changes).reduce(
        (sum, change) => sum + change.insertions,
        0
      );
      const totalDeletions = Object.values(changes).reduce(
        (sum, change) => sum + change.deletions,
        0
      );

      return {
        files: stagedChanges.stagedFiles,
        changes,
        totalInsertions,
        totalDeletions,
      };
    } catch (error) {
      throw new Error(
        `Failed to get changes summary: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze file changes for each staged file
   */
  private async analyzeFileChanges(
    stagedChanges: StagedChanges
  ): Promise<Readonly<Record<string, FileChangeInfo>>> {
    const changes: Record<string, FileChangeInfo> = {};

    for (const file of stagedChanges.stagedFiles) {
      try {
        const fileStats = await this.getFileStats(file);
        const fileType = this.determineFileType(file, stagedChanges);

        changes[file] = {
          insertions: fileStats.insertions,
          deletions: fileStats.deletions,
          type: fileType as FileChangeType,
        };
      } catch {
        changes[file] = { insertions: 0, deletions: 0, type: 'unknown' };
      }
    }

    return changes;
  }

  /**
   * Get file statistics
   */
  private async getFileStats(file: string): Promise<{ insertions: number; deletions: number }> {
    const result = await this.git.raw(['diff', '--cached', '--numstat', '--', file]);
    const lines = result.trim().split('\n');

    let insertions = 0;
    let deletions = 0;

    for (const line of lines) {
      const [add, del] = line.split('\t');
      if (add && add !== '-') insertions += parseInt(add) || 0;
      if (del && del !== '-') deletions += parseInt(del) || 0;
    }

    return { insertions, deletions };
  }

  /**
   * Determine file change type
   */
  private determineFileType(file: string, stagedChanges: StagedChanges): FileChangeType {
    if (stagedChanges.addedFiles.includes(file)) {
      return 'added';
    }
    if (stagedChanges.deletedFiles.includes(file)) {
      return 'deleted';
    }
    return 'modified';
  }

  /**
   * Get all available branches
   */
  public async getBranches(): Promise<BranchesInfo> {
    try {
      const [localBranches, remoteBranches, currentBranch] = await Promise.all([
        this.getLocalBranches(),
        this.getRemoteBranches(),
        this.getCurrentBranch(),
      ]);

      return {
        local: localBranches,
        remote: remoteBranches,
        current: currentBranch,
      };
    } catch (error) {
      throw new Error(
        `Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get local branches
   */
  private async getLocalBranches(): Promise<string[]> {
    const result = await this.git.raw(['branch', '--format=%(refname:short)']);
    return result
      .trim()
      .split('\n')
      .filter(branch => branch.trim());
  }

  /**
   * Get remote branches
   */
  private async getRemoteBranches(): Promise<string[]> {
    const result = await this.git.raw(['branch', '-r', '--format=%(refname:short)']);
    return result
      .trim()
      .split('\n')
      .filter(branch => branch.trim() && !branch.includes('HEAD'))
      .map(branch => branch.replace('origin/', ''));
  }

  /**
   * Create a new branch
   */
  public async createBranch(branchName: string, checkout: boolean = true): Promise<void> {
    try {
      if (checkout) {
        await this.git.checkoutLocalBranch(branchName);
      } else {
        await this.git.branch([branchName]);
      }
    } catch (error) {
      throw new Error(
        `Failed to create branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Switch to an existing branch
   */
  public async switchBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName);
    } catch (error) {
      throw new Error(
        `Failed to switch to branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create and switch to a new branch
   */
  public async createAndSwitchBranch(branchName: string): Promise<void> {
    try {
      await this.createBranch(branchName, true);
    } catch (error) {
      throw new Error(
        `Failed to create and switch to branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a branch exists
   */
  public async branchExists(branchName: string): Promise<boolean> {
    try {
      const branches = await this.getBranches();
      return branches.local.includes(branchName) || branches.remote.includes(branchName);
    } catch {
      return false;
    }
  }

  /**
   * Get branch information
   */
  public async getBranchInfo(): Promise<BranchInfo> {
    try {
      const [currentBranch, status, lastCommit] = await Promise.all([
        this.getCurrentBranch(),
        this.git.status(),
        this.getLastCommitInfo(),
      ]);

      return {
        current: currentBranch,
        isClean: status.isClean(),
        hasStagedChanges: status.staged.length > 0,
        hasUnstagedChanges:
          status.modified.length > 0 || status.not_added.length > 0 || status.deleted.length > 0,
        lastCommit,
      };
    } catch (error) {
      throw new Error(
        `Failed to get branch info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get last commit information
   */
  private async getLastCommitInfo(): Promise<string | undefined> {
    try {
      const result = await this.git.raw(['log', '--oneline', '-1']);
      return result.trim() || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Add all changes to staging area
   */
  public async addAll(): Promise<void> {
    try {
      await this.git.add('.');
    } catch (error) {
      throw new Error(
        `Failed to add all changes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Add specific files to staging area
   */
  public async addFiles(files: readonly string[]): Promise<void> {
    try {
      await this.git.add([...files]);
    } catch (error) {
      throw new Error(
        `Failed to add files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get unstaged changes
   */
  public async getUnstagedChanges(): Promise<UnstagedChanges> {
    try {
      const status = await this.git.status();
      return {
        modified: status.modified || [],
        untracked: status.not_added || [],
        deleted: status.deleted || [],
      };
    } catch (error) {
      throw new Error(
        `Failed to get unstaged changes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Push current branch to remote
   */
  public async pushBranch(branchName?: string, setUpstream: boolean = true): Promise<void> {
    try {
      const currentBranch = branchName || (await this.getCurrentBranch());

      if (setUpstream) {
        await this.git.push(['-u', 'origin', currentBranch]);
      } else {
        await this.git.push(['origin', currentBranch]);
      }
    } catch (error) {
      throw new Error(
        `Failed to push branch: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if remote exists
   */
  public async hasRemote(): Promise<boolean> {
    try {
      const remotes = await this.git.getRemotes();
      return remotes.length > 0;
    } catch {
      return false;
    }
  }
}
