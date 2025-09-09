import { simpleGit, SimpleGit } from 'simple-git';
import { GitCommit } from '../types/index.js';

export class GitService {
  private git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir || process.cwd());
  }

  async getCommits(since?: string, until?: string, author?: string): Promise<GitCommit[]> {
    // Build git log command with raw arguments
    const args = ['log', '--max-count=100', '--pretty=format:%H|%ai|%s|%an <%ae>'];
    
    if (since) {
      // Handle relative dates (7d, 2w, 1m, etc.)
      if (since.match(/^\d+[dwmy]$/)) {
        args.push(`--since="${since}"`);
      } else {
        // Handle absolute dates
        args.push(`--since="${since}"`);
      }
    }
    
    if (until) {
      args.push(`--until="${until}"`);
    }
    
    if (author) {
      // Support partial author matching (case-insensitive)
      args.push(`--author="${author}"`);
    }

    try {
      // Execute raw git command
      const result = await this.git.raw(args);
      const lines = result.trim().split('\n').filter(line => line.trim());
      
      const commits: GitCommit[] = [];
      
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 4) {
          const hash = parts[0];
          const date = parts[1];
          const message = parts[2];
          const authorInfo = parts[3];
          
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
        }
      }

      return commits;
    } catch (error) {
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
        args.push(`--since="${since}"`);
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
   * Validate if a date string is valid for git
   */
  isValidDate(dateString: string): boolean {
    // Check for relative dates like 7d, 2w, 1m, 3y
    if (dateString.match(/^\d+[dwmy]$/)) {
      return true;
    }
    
    // Check for absolute dates
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
}