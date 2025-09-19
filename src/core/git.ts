import { simpleGit, SimpleGit } from 'simple-git';
import { GitCommit, StagedChanges } from '../types/index.js';

export class GitService {
  private git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir || process.cwd());
  }

  async getCommits(since?: string, until?: string, author?: string): Promise<GitCommit[]> {
    // Validate dates before using them
    if (since && !this.isValidDate(since)) {
      throw new Error(`Invalid 'since' date format: ${since}. Use YYYY-MM-DD or relative dates like 7d, 2w, 1m`);
    }
    
    if (until && !this.isValidDate(until)) {
      throw new Error(`Invalid 'until' date format: ${until}. Use YYYY-MM-DD format`);
    }

    // Build git log command with raw arguments
    const args = ['log', '--max-count=100', '--pretty=format:%H|%ai|%s|%an <%ae>'];

    if (since) {
      // Convert 'today' to specific date string for consistent behavior
      const sinceDate = since.toLowerCase() === 'today' 
        ? new Date().toISOString().split('T')[0] + ' 00:00:00'
        : since;
      args.push(`--since=${sinceDate}`);
    }
    
    if (until) {
      // Convert 'today' to specific date string for consistent behavior
      const untilDate = until.toLowerCase() === 'today'
        ? new Date().toISOString().split('T')[0] + ' 23:59:59'
        : until;
      args.push(`--until=${untilDate}`);
    }
    
    if (author) {
      // FIX: Use single argument format for author
      args.push(`--author=${author}`);
    }

    try {
      // Execute raw git command
      const result = await this.git.raw(args);
      
      // FIX: Handle empty result case
      if (!result || !result.trim()) {
        return [];
      }
      
      const lines = result.trim().split('\n').filter(line => line.trim());
      
      const commits: GitCommit[] = [];
      
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 4) {
          const hash = parts[0];
          const date = parts[1];
          const message = parts[2];
          const authorInfo = parts[3];
          
          try {
            // Get file changes and stats for each commit
            const show = await this.git.show([
              hash,
              '--name-only',
              '--pretty=format:'
            ]);
            
            const files = show.split('\n').filter(line => line.trim().length > 0);
            
            // Get commit stats (insertions/deletions)
            let insertions = 0;
            let deletions = 0;
            
            try {
              const stats = await this.git.raw([
                'show',
                '--format=',
                '--numstat',
                hash
              ]);
              
              const statLines = stats.trim().split('\n').filter(line => line.trim());
              for (const statLine of statLines) {
                const [add, del] = statLine.split('\t');
                if (add !== '-') insertions += parseInt(add) || 0;
                if (del !== '-') deletions += parseInt(del) || 0;
              }
            } catch (error) {
              // Stats are optional, continue without them
            }
            
            commits.push({
              hash,
              date,
              message,
              author: authorInfo,
              files,
              insertions,
              deletions,
            });
          } catch (error) {
            // FIX: Skip commits that fail to process but continue with others
            console.warn(`Warning: Failed to process commit ${hash}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      return commits;
    } catch (error) {
      // FIX: Provide more helpful error messages
      if (error instanceof Error && error.message.includes('bad revision')) {
        throw new Error(`Invalid date range or no commits found for the specified criteria. Check your --since and --until dates.`);
      }
      throw new Error(`Failed to get git commits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Get all unique authors from the repository
   */
  async getAuthors(since?: string): Promise<string[]> {
    try {
      const args = ['log', '--pretty=format:%an <%ae>'];
      
      if (since) {
        // Convert 'today' to specific date string for consistent behavior
        const sinceDate = since.toLowerCase() === 'today' 
          ? new Date().toISOString().split('T')[0] + ' 00:00:00'
          : since;
        args.push(`--since=${sinceDate}`);
      }
      
      const result = await this.git.raw(args);
      const authors = result.trim().split('\n')
        .filter(line => line.trim())
        .filter((author, index, array) => array.indexOf(author) === index) // Remove duplicates
        .sort();
      
      return authors;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get repository statistics
   */
  async getRepoStats(): Promise<{
    totalCommits: number;
    authors: number;
    branches: number;
    firstCommit?: string;
    lastCommit?: string;
  }> {
    try {
      // Total commits
      const totalCommitsResult = await this.git.raw(['rev-list', '--all', '--count']);
      const totalCommits = parseInt(totalCommitsResult.trim()) || 0;

      // All authors
      const authors = await this.getAuthors();
      
      // All branches
      const branchesResult = await this.git.raw(['branch', '-a']);
      const branches = branchesResult.split('\n')
        .filter(line => line.trim())
        .filter(line => !line.includes('->')) // Remove symbolic refs
        .length;

      // First and last commit dates
      let firstCommit: string | undefined;
      let lastCommit: string | undefined;

      try {
        const firstCommitResult = await this.git.raw(['log', '--reverse', '--pretty=format:%ai', '--max-count=1']);
        firstCommit = firstCommitResult.trim();
      } catch {}

      try {
        const lastCommitResult = await this.git.raw(['log', '--pretty=format:%ai', '--max-count=1']);
        lastCommit = lastCommitResult.trim();
      } catch {}

      return {
        totalCommits,
        authors: authors.length,
        branches,
        firstCommit,
        lastCommit,
      };
    } catch (error) {
      return {
        totalCommits: 0,
        authors: 0,
        branches: 0,
      };
    }
  }

  /**
   * FIX: Enhanced date validation with ISO timestamp support
   */
  isValidDate(dateString: string): boolean {
    // Check for relative dates like 7d, 2w, 1m, 3y
    if (dateString.match(/^\d+[dwmy]$/)) {
      return true;
    }
    
    // Check for "yesterday", "today", etc.
    if (['yesterday', 'today', 'now'].includes(dateString.toLowerCase())) {
      return true;
    }
    
    // Check for ISO dates (YYYY-MM-DD)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    }
    
    // Check for ISO timestamps (YYYY-MM-DDTHH:mm:ss.sssZ)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/)) {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    }
    
    // Check for other common date formats
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Get current user's git config
   */
  async getCurrentUser(): Promise<{ name?: string; email?: string }> {
    try {
      const name = await this.git.raw(['config', 'user.name']).catch(() => '');
      const email = await this.git.raw(['config', 'user.email']).catch(() => '');
      
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
  async getStagedChanges(): Promise<StagedChanges> {
    try {
      // Get staged files
      const stagedResult = await this.git.raw(['diff', '--cached', '--name-only']);
      const stagedFiles = stagedResult.trim().split('\n').filter(file => file.trim());

      // Get status for file categorization
      const statusResult = await this.git.status();
      const modifiedFiles = statusResult.modified || [];
      const addedFiles = statusResult.created || [];
      const deletedFiles = statusResult.deleted || [];

      // Get diff stats
      const diffStatsResult = await this.git.raw(['diff', '--cached', '--numstat']);
      let insertions = 0;
      let deletions = 0;

      if (diffStatsResult.trim()) {
        const statLines = diffStatsResult.trim().split('\n');
        for (const line of statLines) {
          const [add, del] = line.split('\t');
          if (add !== '-') insertions += parseInt(add) || 0;
          if (del !== '-') deletions += parseInt(del) || 0;
        }
      }

      return {
        stagedFiles,
        modifiedFiles,
        addedFiles,
        deletedFiles,
        diffStats: {
          insertions,
          deletions
        }
      };
    } catch (error) {
      throw new Error(`Failed to get staged changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Commit changes with a message
   */
  async commitChanges(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get diff content for staged files
   */
  async getStagedDiff(): Promise<string> {
    try {
      const diffResult = await this.git.raw(['diff', '--cached']);
      return diffResult;
    } catch (error) {
      throw new Error(`Failed to get staged diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file changes summary for AI analysis
   */
  async getChangesSummary(): Promise<{
    files: string[];
    changes: { [file: string]: { insertions: number; deletions: number; type: string } };
    totalInsertions: number;
    totalDeletions: number;
  }> {
    try {
      const stagedChanges = await this.getStagedChanges();
      const changes: { [file: string]: { insertions: number; deletions: number; type: string } } = {};
      
      let totalInsertions = 0;
      let totalDeletions = 0;

      // Get detailed stats for each file
      for (const file of stagedChanges.stagedFiles) {
        try {
          const fileStats = await this.git.raw(['diff', '--cached', '--numstat', '--', file]);
          const lines = fileStats.trim().split('\n');
          
          let insertions = 0;
          let deletions = 0;
          
          for (const line of lines) {
            const [add, del] = line.split('\t');
            if (add !== '-') insertions += parseInt(add) || 0;
            if (del !== '-') deletions += parseInt(del) || 0;
          }

          // Determine file type
          let type = 'modified';
          if (stagedChanges.addedFiles.includes(file)) {
            type = 'added';
          } else if (stagedChanges.deletedFiles.includes(file)) {
            type = 'deleted';
          }

          changes[file] = { insertions, deletions, type };
          totalInsertions += insertions;
          totalDeletions += deletions;
        } catch (error) {
          // Skip files that can't be analyzed
          changes[file] = { insertions: 0, deletions: 0, type: 'unknown' };
        }
      }

      return {
        files: stagedChanges.stagedFiles,
        changes,
        totalInsertions,
        totalDeletions
      };
    } catch (error) {
      throw new Error(`Failed to get changes summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all available branches
   */
  async getBranches(): Promise<{ local: string[]; remote: string[]; current: string }> {
    try {
      // Get local branches
      const localBranchesResult = await this.git.raw(['branch', '--format=%(refname:short)']);
      const localBranches = localBranchesResult.trim().split('\n').filter(branch => branch.trim());

      // Get remote branches
      const remoteBranchesResult = await this.git.raw(['branch', '-r', '--format=%(refname:short)']);
      const remoteBranches = remoteBranchesResult.trim().split('\n')
        .filter(branch => branch.trim() && !branch.includes('HEAD'))
        .map(branch => branch.replace('origin/', ''));

      // Get current branch
      const currentBranch = await this.getCurrentBranch();

      return {
        local: localBranches,
        remote: remoteBranches,
        current: currentBranch
      };
    } catch (error) {
      throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string, checkout: boolean = true): Promise<void> {
    try {
      if (checkout) {
        await this.git.checkoutLocalBranch(branchName);
      } else {
        await this.git.branch([branchName]);
      }
    } catch (error) {
      throw new Error(`Failed to create branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch to an existing branch
   */
  async switchBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName);
    } catch (error) {
      throw new Error(`Failed to switch to branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create and switch to a new branch
   */
  async createAndSwitchBranch(branchName: string): Promise<void> {
    try {
      await this.createBranch(branchName, true);
    } catch (error) {
      throw new Error(`Failed to create and switch to branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a branch exists
   */
  async branchExists(branchName: string): Promise<boolean> {
    try {
      const branches = await this.getBranches();
      return branches.local.includes(branchName) || branches.remote.includes(branchName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get branch information
   */
  async getBranchInfo(): Promise<{
    current: string;
    isClean: boolean;
    hasStagedChanges: boolean;
    hasUnstagedChanges: boolean;
    lastCommit?: string;
  }> {
    try {
      const currentBranch = await this.getCurrentBranch();
      const status = await this.git.status();
      
      // Get last commit info
      let lastCommit: string | undefined;
      try {
        const lastCommitResult = await this.git.raw(['log', '--oneline', '-1']);
        lastCommit = lastCommitResult.trim();
      } catch {
        // No commits yet
      }

      return {
        current: currentBranch,
        isClean: status.isClean(),
        hasStagedChanges: status.staged.length > 0,
        hasUnstagedChanges: status.modified.length > 0 || status.not_added.length > 0 || status.deleted.length > 0,
        lastCommit
      };
    } catch (error) {
      throw new Error(`Failed to get branch info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add all changes to staging area
   */
  async addAll(): Promise<void> {
    try {
      await this.git.add('.');
    } catch (error) {
      throw new Error(`Failed to add all changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add specific files to staging area
   */
  async addFiles(files: string[]): Promise<void> {
    try {
      await this.git.add(files);
    } catch (error) {
      throw new Error(`Failed to add files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get unstaged changes
   */
  async getUnstagedChanges(): Promise<{
    modified: string[];
    untracked: string[];
    deleted: string[];
  }> {
    try {
      const status = await this.git.status();
      return {
        modified: status.modified || [],
        untracked: status.not_added || [],
        deleted: status.deleted || []
      };
    } catch (error) {
      throw new Error(`Failed to get unstaged changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Push current branch to remote
   */
  async pushBranch(branchName?: string, setUpstream: boolean = true): Promise<void> {
    try {
      const currentBranch = branchName || await this.getCurrentBranch();
      
      if (setUpstream) {
        await this.git.push(['-u', 'origin', currentBranch]);
      } else {
        await this.git.push(['origin', currentBranch]);
      }
    } catch (error) {
      throw new Error(`Failed to push branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if remote exists
   */
  async hasRemote(): Promise<boolean> {
    try {
      const remotes = await this.git.getRemotes();
      return remotes.length > 0;
    } catch {
      return false;
    }
  }
}