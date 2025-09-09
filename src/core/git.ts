import { simpleGit, SimpleGit } from 'simple-git';
import { GitCommit } from '../types/index.js';

export class GitService {
  private git: SimpleGit;

  constructor(baseDir?: string) {
    this.git = simpleGit(baseDir || process.cwd());
  }

  async getCommits(since?: string, until?: string): Promise<GitCommit[]> {
    // Build git log command with raw arguments
    const args = ['log', '--max-count=100', '--pretty=format:%H|%ai|%s|%an <%ae>'];
    
    if (since) {
      args.push(`--since="${since}"`);
    }
    if (until) {
      args.push(`--until="${until}"`);
    }

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
        const author = parts[3];
        
        // Get file changes for each commit
        const show = await this.git.show([
          hash,
          '--name-only',
          '--pretty=format:'
        ]);
        
        const files = show.split('\n').filter(line => line.trim().length > 0);
        
        commits.push({
          hash,
          date,
          message,
          author,
          files,
        });
      }
    }

    return commits;
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
    const status = await this.git.status();
    return status.current || 'unknown';
  }
}