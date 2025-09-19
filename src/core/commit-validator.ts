import chalk from 'chalk';
import { GitService } from './git.js';

/**
 * Service responsible for validating commit command inputs and options
 * Follows single responsibility principle for input validation
 */
export class CommitValidator {
  private readonly gitService: GitService;

  constructor() {
    this.gitService = new GitService();
  }

  /**
   * Validate message length parameter
   */
  public validateMessageLength(length?: string): string | null {
    const validLengths = ['short', 'medium', 'detailed'];
    if (length && !validLengths.includes(length)) {
      return `Invalid message length: "${length}". Valid options: ${validLengths.join(', ')}`;
    }
    return null;
  }

  /**
   * Validate git repository exists
   */
  public async validateGitRepository(): Promise<string | null> {
    const isGitRepo = await this.gitService.isGitRepository();
    if (!isGitRepo) {
      return 'Not a git repository. Please run this command from within a git repository.';
    }
    return null;
  }

  /**
   * Validate that staged changes exist
   */
  public async validateStagedChanges(): Promise<{
    isValid: boolean;
    error?: string;
    changes?: any;
  }> {
    try {
      const changes = await this.gitService.getStagedChanges();
      if (changes.stagedFiles.length === 0) {
        return {
          isValid: false,
          error: 'No staged changes found. Stage your changes first with "git add ."',
        };
      }
      return { isValid: true, changes };
    } catch (error) {
      return {
        isValid: false,
        error: `Failed to check staged changes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Validate branch name format
   */
  public validateBranchName(branchName: string): string | null {
    if (!branchName.trim()) {
      return 'Branch name cannot be empty';
    }

    // Check for invalid characters
    const invalidChars = /[^a-zA-Z0-9\/\-_]/;
    if (invalidChars.test(branchName)) {
      return 'Branch name contains invalid characters. Use only letters, numbers, hyphens, underscores, and forward slashes.';
    }

    // Check for reserved names
    const reservedNames = ['HEAD', 'refs', 'heads', 'remotes', 'tags'];
    if (reservedNames.includes(branchName.toLowerCase())) {
      return `"${branchName}" is a reserved branch name`;
    }

    // Check length
    if (branchName.length > 250) {
      return 'Branch name is too long (maximum 250 characters)';
    }

    return null;
  }

  /**
   * Validate date filters for report command
   */
  public validateDateFilters(since?: string, until?: string): string | null {
    // Handle 'today' keyword - it's always valid
    if (since?.toLowerCase() === 'today' || until?.toLowerCase() === 'today') {
      // 'today' is always valid, no need to validate further for this case
    }

    if (since && !this.gitService.isValidDate(since)) {
      return `Invalid --since date: "${since}". Use formats like: today, 7d, 2w, 1m, or YYYY-MM-DD`;
    }

    if (until && !this.gitService.isValidDate(until)) {
      return `Invalid --until date: "${until}". Use format: YYYY-MM-DD or today`;
    }

    // Check logical date order for absolute dates (skip if since/until is 'today')
    if (since && since.toLowerCase() !== 'today' && until && until.toLowerCase() !== 'today') {
      const sinceDate = new Date(since);
      const untilDate = new Date(until);

      if (!isNaN(sinceDate.getTime()) && !isNaN(untilDate.getTime()) && sinceDate > untilDate) {
        return `--since date (${since}) cannot be after --until date (${until})`;
      }
    }

    // Check if 'today' with until makes sense
    if (since?.toLowerCase() === 'today' && until && until.toLowerCase() !== 'today') {
      const today = new Date().toISOString().split('T')[0];
      const untilDate = new Date(until);

      if (!isNaN(untilDate.getTime()) && today && until < today) {
        return `--until date (${until}) cannot be before today when using --since today`;
      }
    }

    return null;
  }

  /**
   * Validate report length parameter
   */
  public validateReportLength(length?: string): string | null {
    const validLengths = ['light', 'short', 'detailed'];
    if (length && !validLengths.includes(length)) {
      return `Invalid report length: "${length}". Valid options: ${validLengths.join(', ')}`;
    }
    return null;
  }

  /**
   * Display validation error with helpful information
   */
  public displayValidationError(error: string, context: string): void {
    console.log();
    console.log(chalk.red('═'.repeat(55)));
    console.log(chalk.red.bold(`❌ ${context} Validation Failed`));
    console.log();
    console.log(chalk.red('Error:'), error);
    console.log();

    console.log(chalk.yellow('🔧 Troubleshooting:'));
    console.log(chalk.gray('   • Check your input parameters'));
    console.log(chalk.gray("   • Ensure you're in a git repository"));
    console.log(chalk.gray('   • Verify date formats are correct'));
    console.log(chalk.gray('   • Run "devsum --help" for usage information'));
    console.log();
    console.log(chalk.blue('For help: https://github.com/rollenasistores/devsum/issues'));
    console.log(chalk.red('═'.repeat(55)));
  }

  /**
   * Display help for message length options
   */
  public displayMessageLengthHelp(): void {
    console.log();
    console.log(chalk.blue('💡 Message length options:'));
    console.log(
      chalk.white('   --length short     '),
      chalk.gray('# Brief, concise message (1-2 lines)')
    );
    console.log(
      chalk.white('   --length medium    '),
      chalk.gray('# Balanced message (2-3 lines)')
    );
    console.log(
      chalk.white('   --length detailed  '),
      chalk.gray('# Comprehensive message (3-5 lines)')
    );
  }

  /**
   * Display help for report length options
   */
  public displayReportLengthHelp(): void {
    console.log();
    console.log(chalk.blue('💡 Report length options:'));
    console.log(
      chalk.white('   --length light     '),
      chalk.gray('# Brief executive summary (3-5 accomplishments)')
    );
    console.log(
      chalk.white('   --length short     '),
      chalk.gray('# Quick daily/weekly update (5-8 accomplishments)')
    );
    console.log(
      chalk.white('   --length detailed  '),
      chalk.gray('# Comprehensive analysis (8-15 accomplishments)')
    );
    console.log();
    console.log(chalk.blue('💡 Shortcut options:'));
    console.log(chalk.white('   --light            '), chalk.gray('# Same as --length light'));
    console.log(chalk.white('   --short            '), chalk.gray('# Same as --length short'));
    console.log(chalk.white('   --detailed         '), chalk.gray('# Same as --length detailed'));
  }

  /**
   * Display help for date format options
   */
  public displayDateFormatHelp(): void {
    console.log();
    console.log(chalk.blue('💡 Valid date formats:'));
    console.log(
      chalk.white('   --since today           '),
      chalk.gray('# All commits from today (00:00 to now)')
    );
    console.log(
      chalk.white('   --today                 '),
      chalk.gray('# Shortcut for --since today')
    );
    console.log(chalk.white('   --since 7d              '), chalk.gray('# Last 7 days'));
    console.log(chalk.white('   --since 2w              '), chalk.gray('# Last 2 weeks'));
    console.log(chalk.white('   --since 1m              '), chalk.gray('# Last 1 month'));
    console.log(chalk.white('   --since 2024-01-01      '), chalk.gray('# Since specific date'));
    console.log(chalk.white('   --until 2024-12-31      '), chalk.gray('# Until specific date'));
    console.log(chalk.white('   --until today           '), chalk.gray('# Until end of today'));
  }

  /**
   * Display help for no staged changes
   */
  public displayNoStagedChangesHelp(): void {
    console.log();
    console.log(chalk.blue('💡 Stage your changes first:'));
    console.log(chalk.white('  git add .                    '), chalk.gray('# Stage all changes'));
    console.log(
      chalk.white('  git add <file>               '),
      chalk.gray('# Stage specific file')
    );
    console.log(
      chalk.white('  git add -p                   '),
      chalk.gray('# Interactive staging')
    );
    console.log();
    console.log(chalk.cyan('💡 Then run:'), chalk.white('devsum commit'));
  }

  /**
   * Display help for no commits found
   */
  public displayNoCommitsHelp(filters?: { since?: string; until?: string; author?: string }): void {
    console.log();
    console.log(chalk.blue('💡 Try adjusting your filters:'));
    console.log(
      chalk.white('  devsum report --today            '),
      chalk.gray('# All commits from today only')
    );
    console.log(
      chalk.white('  devsum report --since today      '),
      chalk.gray('# All commits from today (00:00 to now)')
    );
    console.log(chalk.white('  devsum report --since 30d        '), chalk.gray('# Last 30 days'));
    console.log(
      chalk.white('  devsum report --since 2025-01-01 '),
      chalk.gray('# Since specific date')
    );
    console.log(chalk.white('  devsum report                    '), chalk.gray('# All commits'));

    // Show current filters for debugging
    if (filters?.since || filters?.until || filters?.author) {
      console.log();
      console.log(chalk.gray('Current filters applied:'));
      if (filters.since) {
        const displaySince =
          filters.since.toLowerCase() === 'today'
            ? `today (${new Date().toISOString().split('T')[0]} 00:00:00 to now)`
            : filters.since;
        console.log(chalk.gray(`  --since: ${displaySince}`));
      }
      if (filters.until) {
        const displayUntil =
          filters.until.toLowerCase() === 'today'
            ? `today (until ${new Date().toISOString().split('T')[0]} 23:59:59)`
            : filters.until;
        console.log(chalk.gray(`  --until: ${displayUntil}`));
      }
      if (filters.author) console.log(chalk.gray(`  --author: ${filters.author}`));
    }
  }
}
