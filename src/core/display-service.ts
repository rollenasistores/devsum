import chalk from 'chalk';

/**
 * Service responsible for all console display operations
 * Follows single responsibility principle and provides consistent UI
 */
export class DisplayService {
  private static readonly COMMIT_ICON = `
  ██████╗  ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗
 ██╔═══██╗██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝
 ██║      ██║   ██║██╔████╔██║██╔████╔██║██║   ██║   
 ██║      ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║   
 ╚██████╗ ╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║   
  ╚═════╝  ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   
`;

  private static readonly REPORT_ICON = `
 ██████╗ ███████╗██████╗  ██████╗ ██████╗ ████████╗
██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
██████╔╝█████╗  ██████╔╝██║   ██║██████╔╝   ██║   
██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║██╔══██╗   ██║   
██║  ██║███████╗██║     ╚██████╔╝██║  ██║   ██║   
╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
`;

  private static readonly ASCII_LOGO = `
██████╗ ███████╗██╗   ██╗███████╗██╗   ██╗███╗   ███╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║   ██║████╗ ████║
██║  ██║█████╗  ██║   ██║███████╗██║   ██║██╔████╔██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██║   ██║██║╚██╔╝██║
██████╔╝███████╗ ╚████╔╝ ███████║╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝     ╚═╝
`;

  /**
   * Display commit command header
   */
  public static displayCommitHeader(): void {
    console.clear();
    console.log(chalk.yellow.bold(this.COMMIT_ICON));
    console.log(chalk.gray('          AI-Powered Commit Message Generator'));
    console.log(chalk.blue('═'.repeat(55)));
    console.log();
  }

  /**
   * Display report command header
   */
  public static displayReportHeader(): void {
    console.clear();
    console.log(chalk.yellow.bold(this.REPORT_ICON));
    console.log(chalk.gray('          AI-Powered Git Accomplishment Reports'));
    console.log(chalk.blue('═'.repeat(55)));
    console.log();
  }

  /**
   * Display main application logo
   */
  public static displayMainLogo(): void {
    console.clear();
    console.log(chalk.cyan.bold(this.ASCII_LOGO));
    console.log(chalk.gray('                    Git Commit Report Generator'));
  }

  /**
   * Display progress indicator
   */
  public static displayProgress(step: string, isComplete: boolean = false): void {
    const icon = isComplete ? '✅' : '⏳';
    const color = isComplete ? chalk.green : chalk.blue;
    console.log(color(`${icon} ${step}`));
  }

  /**
   * Display branch information
   */
  public static displayBranchInfo(branchInfo: {
    current: string;
    isClean: boolean;
    hasStagedChanges: boolean;
    hasUnstagedChanges: boolean;
    lastCommit?: string;
  }): void {
    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('🌿 Branch Information'));
    console.log();

    console.log(chalk.white(`Current Branch: ${chalk.yellow(branchInfo.current)}`));

    if (branchInfo.lastCommit) {
      console.log(chalk.gray(`Last Commit: ${branchInfo.lastCommit}`));
    }

    console.log();
    console.log(chalk.white('Status:'));
    if (branchInfo.isClean) {
      console.log(chalk.green('   ✅ Working directory clean'));
    } else {
      if (branchInfo.hasStagedChanges) {
        console.log(chalk.yellow('   📝 Has staged changes'));
      }
      if (branchInfo.hasUnstagedChanges) {
        console.log(chalk.red('   ⚠️  Has unstaged changes'));
      }
    }

    console.log(chalk.blue('═'.repeat(55)));
  }

  /**
   * Display available branches
   */
  public static displayBranches(branches: {
    local: string[];
    remote: string[];
    current: string;
  }): void {
    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('🌿 Available Branches'));
    console.log();

    console.log(chalk.white('Local Branches:'));
    branches.local.forEach(branch => {
      const isCurrent = branch === branches.current;
      const icon = isCurrent ? '🌿' : '📁';
      const color = isCurrent ? chalk.green : chalk.gray;
      console.log(color(`   ${icon} ${branch}${isCurrent ? ' (current)' : ''}`));
    });

    if (branches.remote.length > 0) {
      console.log();
      console.log(chalk.white('Remote Branches:'));
      branches.remote.slice(0, 10).forEach(branch => {
        console.log(chalk.gray(`   📡 ${branch}`));
      });
      if (branches.remote.length > 10) {
        console.log(chalk.gray(`   ... and ${branches.remote.length - 10} more remote branches`));
      }
    }

    console.log();
    console.log(chalk.blue('═'.repeat(55)));
  }

  /**
   * Display staged changes information
   */
  public static displayChanges(changes: {
    stagedFiles: string[];
    modifiedFiles: string[];
    addedFiles: string[];
    deletedFiles: string[];
    diffStats: { insertions: number; deletions: number };
  }): void {
    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('📊 Changes Analysis'));
    console.log();

    if (changes.stagedFiles.length > 0) {
      console.log(chalk.green(`📁 Staged Files: ${changes.stagedFiles.length}`));
      changes.stagedFiles.slice(0, 5).forEach(file => {
        console.log(chalk.gray(`   • ${file}`));
      });
      if (changes.stagedFiles.length > 5) {
        console.log(chalk.gray(`   ... and ${changes.stagedFiles.length - 5} more`));
      }
    }

    if (changes.modifiedFiles.length > 0) {
      console.log(chalk.yellow(`📝 Modified Files: ${changes.modifiedFiles.length}`));
      changes.modifiedFiles.slice(0, 3).forEach(file => {
        console.log(chalk.gray(`   • ${file}`));
      });
      if (changes.modifiedFiles.length > 3) {
        console.log(chalk.gray(`   ... and ${changes.modifiedFiles.length - 3} more`));
      }
    }

    if (changes.addedFiles.length > 0) {
      console.log(chalk.green(`➕ Added Files: ${changes.addedFiles.length}`));
      changes.addedFiles.slice(0, 3).forEach(file => {
        console.log(chalk.gray(`   • ${file}`));
      });
      if (changes.addedFiles.length > 3) {
        console.log(chalk.gray(`   ... and ${changes.addedFiles.length - 3} more`));
      }
    }

    if (changes.deletedFiles.length > 0) {
      console.log(chalk.red(`🗑️  Deleted Files: ${changes.deletedFiles.length}`));
      changes.deletedFiles.slice(0, 3).forEach(file => {
        console.log(chalk.gray(`   • ${file}`));
      });
      if (changes.deletedFiles.length > 3) {
        console.log(chalk.gray(`   ... and ${changes.deletedFiles.length - 3} more`));
      }
    }

    console.log();
    console.log(
      chalk.white(`📈 Changes: +${changes.diffStats.insertions} -${changes.diffStats.deletions}`)
    );
    console.log(chalk.blue('═'.repeat(55)));
  }

  /**
   * Display AI processing progress
   */
  public static displayAIProgress(provider: string, model: string): void {
    console.log();
    console.log(chalk.magenta.bold('🤖 AI Analysis in Progress...'));
    console.log(chalk.gray(`   Provider: ${provider.toUpperCase()}`));
    console.log(chalk.gray(`   Model: ${model}`));
    console.log(chalk.gray(`   Analyzing changes and generating commit message...`));
    console.log();
  }

  /**
   * Display generated commit message
   */
  public static displayCommitMessage(
    message: string,
    options: { conventional?: boolean; emoji?: boolean }
  ): void {
    console.log();
    console.log(chalk.green('═'.repeat(55)));
    console.log(chalk.green.bold('💬 Generated Commit Message'));
    console.log();
    console.log(chalk.white('📝 Message:'));
    console.log(chalk.gray('┌' + '─'.repeat(53) + '┐'));
    console.log(chalk.gray('│'), chalk.white(message), chalk.gray('│'));
    console.log(chalk.gray('└' + '─'.repeat(53) + '┘'));
    console.log();

    if (options.conventional) {
      console.log(chalk.blue('📋 Conventional Commits Format:'));
      console.log(chalk.gray('   <type>(<scope>): <description>'));
      console.log(chalk.gray('   Examples: feat(auth): add login validation'));
      console.log(chalk.gray('            fix(api): resolve timeout issue'));
      console.log(chalk.gray('            docs: update README'));
    }

    if (options.emoji) {
      console.log();
      console.log(chalk.blue('🎨 Emoji Support:'));
      console.log(chalk.gray('   ✨ feat: new features'));
      console.log(chalk.gray('   🐛 fix: bug fixes'));
      console.log(chalk.gray('   📚 docs: documentation'));
      console.log(chalk.gray('   🎨 style: formatting'));
      console.log(chalk.gray('   ♻️  refactor: code changes'));
    }

    console.log();
    console.log(chalk.cyan('💡 Next Steps:'));
    console.log(chalk.white(`   git commit -m "${message}"`), chalk.gray('# Use this message'));
    console.log(chalk.white(`   git commit -m "${message}" --dry-run`), chalk.gray('# Test first'));
    console.log(chalk.white(`   devsum commit --auto`), chalk.gray('# Auto-commit with message'));
    console.log();
    console.log(chalk.blue('🌿 Branch Operations:'));
    console.log(
      chalk.white(`   devsum commit --branch feature-name`),
      chalk.gray('# Create new branch and commit')
    );
    console.log(
      chalk.white(`   devsum commit --switch main`),
      chalk.gray('# Switch to existing branch')
    );
    console.log(
      chalk.white(`   devsum commit --auto-branch`),
      chalk.gray('# Auto-generate branch name')
    );
    console.log(chalk.white(`   devsum commit --list-branches`), chalk.gray('# List all branches'));
    console.log();
    console.log(chalk.green('🚀 Ready to commit!'));
    console.log(chalk.green('═'.repeat(55)));
  }

  /**
   * Display auto-branch proposal
   */
  public static displayAutoBranchProposal(
    branchName: string,
    commitMessage: string,
    changes: {
      stagedFiles: string[];
      diffStats: { insertions: number; deletions: number };
    }
  ): void {
    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('🤖 AI-Generated Branch & Commit Proposal'));
    console.log();

    console.log(chalk.white('🌿 Proposed Branch:'));
    console.log(chalk.yellow(`   ${branchName}`));
    console.log();

    console.log(chalk.white('💬 Proposed Commit Message:'));
    console.log(chalk.gray('┌' + '─'.repeat(53) + '┐'));
    console.log(chalk.gray('│'), chalk.white(commitMessage), chalk.gray('│'));
    console.log(chalk.gray('└' + '─'.repeat(53) + '┘'));
    console.log();

    console.log(chalk.white('📊 Changes Summary:'));
    console.log(chalk.gray(`   Files: ${changes.stagedFiles.length}`));
    console.log(
      chalk.gray(`   Changes: +${changes.diffStats.insertions} -${changes.diffStats.deletions}`)
    );
    console.log();

    console.log(chalk.blue('═'.repeat(55)));
  }

  /**
   * Display error message
   */
  public static displayError(error: unknown, context: string): void {
    console.log();
    console.log(chalk.red('═'.repeat(55)));
    console.log(chalk.red.bold('❌ Commit Message Generation Failed'));
    console.log();
    console.log(chalk.red('Context:'), context);
    console.log(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    console.log();

    console.log(chalk.yellow('🔧 Troubleshooting:'));
    console.log(chalk.gray('   • Ensure you have staged changes (git add .)'));
    console.log(chalk.gray('   • Check your API key configuration'));
    console.log(chalk.gray('   • Verify internet connectivity'));
    console.log(chalk.gray('   • Run "devsum setup" to reconfigure'));
    console.log();
    console.log(chalk.blue('For help: https://github.com/rollenasistores/devsum/issues'));
    console.log(chalk.red('═'.repeat(55)));
  }

  /**
   * Display commit statistics
   */
  public static displayCommitStats(
    commits: any[],
    branch: string,
    filters?: {
      since?: string;
      until?: string;
      author?: string;
    }
  ): void {
    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('📊 Repository Analysis'));
    console.log();
    console.log(chalk.white(`🌿 Branch: ${chalk.yellow(branch)}`));
    console.log(chalk.white(`📝 Commits: ${chalk.green(commits.length)}`));

    // Show applied filters
    if (filters?.since || filters?.until || filters?.author) {
      console.log();
      console.log(chalk.yellow('🔍 Applied Filters:'));
      if (filters.since) {
        const displaySince =
          filters.since.toLowerCase() === 'today'
            ? `today (${new Date().toISOString().split('T')[0]} 00:00:00 to now)`
            : filters.since;
        console.log(chalk.gray(`   📅 Since: ${displaySince}`));
      }
      if (filters.until) {
        const displayUntil =
          filters.until.toLowerCase() === 'today'
            ? `today (${new Date().toISOString().split('T')[0]} 23:59:59)`
            : filters.until;
        console.log(chalk.gray(`   📅 Until: ${displayUntil}`));
      }
      if (filters.author) {
        console.log(chalk.gray(`   👤 Author: ${filters.author}`));
      }
    }

    // Calculate stats
    const authors = [...new Set(commits.map(c => c.author))];

    // Show today's date range when using 'today'
    let dateRange = null;
    if (commits.length > 0) {
      if (filters?.since?.toLowerCase() === 'today') {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0]?.substring(0, 8) ?? '00:00:00';
        dateRange = {
          oldest: `${today} 00:00:00`,
          newest: `${today} ${timeStr}`,
        };
      } else {
        dateRange = {
          oldest: commits[commits.length - 1].date.split('T')[0],
          newest: commits[0].date.split('T')[0],
        };
      }
    }

    console.log();
    console.log(chalk.white(`👥 Authors: ${chalk.cyan(authors.length)}`));
    if (dateRange) {
      console.log(
        chalk.white(`📅 Period: ${chalk.gray(dateRange.oldest)} → ${chalk.gray(dateRange.newest)}`)
      );
    }

    // Show top contributors
    if (authors.length > 1) {
      const authorCounts = commits.reduce((acc: any, commit) => {
        acc[commit.author] = (acc[commit.author] || 0) + 1;
        return acc;
      }, {});

      const topAuthors = Object.entries(authorCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3);

      console.log();
      console.log(chalk.yellow('🏆 Top Contributors:'));
      topAuthors.forEach(([author, count], index) => {
        const medal = ['🥇', '🥈', '🥉'][index] || '👤';
        console.log(chalk.gray(`   ${medal} ${author}: ${count} commits`));
      });
    }

    console.log();
    console.log(chalk.blue('═'.repeat(55)));
  }

  /**
   * Display success message for report generation
   */
  public static displayReportSuccess(
    outputPath: string,
    commits: any[],
    processingTime: number,
    reportLength?: string
  ): void {
    console.log();
    console.log(chalk.green('═'.repeat(55)));
    console.log(chalk.green.bold('🎉 Report Generated Successfully!'));
    console.log();
    console.log(chalk.blue('📄 Report Details:'));
    console.log(chalk.gray(`   Location: ${outputPath}`));
    console.log(chalk.gray(`   Size: ${commits.length} commits analyzed`));
    console.log(chalk.gray(`   Length: ${reportLength || 'detailed'}`));
    console.log(chalk.gray(`   Processing time: ${processingTime.toFixed(2)}s`));
    console.log();

    console.log(chalk.yellow("📖 What's in your report:"));
    console.log(chalk.gray('   ✅ Executive summary of accomplishments'));
    console.log(chalk.gray('   ✅ Key achievements and milestones'));
    console.log(chalk.gray('   ✅ Technical improvements identified'));
    console.log(chalk.gray('   ✅ Detailed commit analysis'));
    console.log(chalk.gray('   ✅ Actionable recommendations'));
    console.log();

    console.log(chalk.cyan('💡 Next Steps:'));
    console.log(chalk.white(`   cat "${outputPath}"              `), chalk.gray('# View report'));
    console.log(
      chalk.white(`   code "${outputPath}"             `),
      chalk.gray('# Edit in VS Code')
    );
    console.log(chalk.white(`   devsum report --format json      `), chalk.gray('# Generate JSON'));
    console.log(chalk.white(`   devsum report --format html      `), chalk.gray('# Generate HTML'));
    console.log();
    console.log(chalk.green('🚀 Great work! Share your accomplishments with the team!'));
    console.log(chalk.green('═'.repeat(55)));
  }
}
