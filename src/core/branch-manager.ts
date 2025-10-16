import chalk from 'chalk';
import { GitService } from './git.js';

/**
 * Service responsible for branch operations and management
 * Follows single responsibility principle for branch-related functionality
 */
export class BranchManager {
  private readonly gitService: GitService;

  constructor() {
    this.gitService = new GitService();
  }

  /**
   * Create a new branch and switch to it
   */
  public async createAndSwitchBranch(branchName: string): Promise<void> {
    try {
      const branchExists = await this.gitService.branchExists(branchName);
      if (branchExists) {
        // If branch exists, try to switch to it instead of throwing error
        console.log(`Branch '${branchName}' already exists, switching to it...`);
        await this.gitService.switchBranch(branchName);
        return;
      }

      await this.gitService.createAndSwitchBranch(branchName);
    } catch (error) {
      throw new Error(
        `Failed to create branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Switch to an existing branch
   */
  public async switchToBranch(branchName: string): Promise<void> {
    try {
      const branchExists = await this.gitService.branchExists(branchName);
      if (!branchExists) {
        throw new Error(`Branch '${branchName}' does not exist`);
      }

      await this.gitService.switchBranch(branchName);
    } catch (error) {
      throw new Error(
        `Failed to switch to branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create branch or switch to existing one
   */
  public async createOrSwitchBranch(branchName: string): Promise<void> {
    try {
      const branchExists = await this.gitService.branchExists(branchName);
      if (branchExists) {
        await this.gitService.switchBranch(branchName);
      } else {
        await this.gitService.createAndSwitchBranch(branchName);
      }
    } catch (error) {
      throw new Error(
        `Failed to create or switch to branch '${branchName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get all available branches
   */
  public async getAllBranches(): Promise<{ local: string[]; remote: string[]; current: string }> {
    try {
      return await this.gitService.getBranches();
    } catch (error) {
      throw new Error(
        `Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get current branch information
   */
  public async getBranchInfo(): Promise<{
    current: string;
    isClean: boolean;
    hasStagedChanges: boolean;
    hasUnstagedChanges: boolean;
    lastCommit?: string;
  }> {
    try {
      return await this.gitService.getBranchInfo();
    } catch (error) {
      throw new Error(
        `Failed to get branch info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if a branch exists
   */
  public async branchExists(branchName: string): Promise<boolean> {
    try {
      return await this.gitService.branchExists(branchName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle branch operations for commit command
   */
  public async handleBranchOperations(options: {
    branch?: string;
    newBranch?: string;
    switchBranch?: string;
    autoBranch?: boolean;
    generatedBranchName?: string;
  }): Promise<{ finalBranchName?: string; switched: boolean }> {
    const branchName = options.branch || options.newBranch;
    const switchBranch = options.switchBranch;

    if (branchName) {
      // Create and switch to new branch
      await this.createAndSwitchBranch(branchName);
      return { finalBranchName: branchName, switched: true };
    } else if (switchBranch) {
      // Switch to existing branch
      await this.switchToBranch(switchBranch);
      return { finalBranchName: switchBranch, switched: true };
    } else if (options.autoBranch && options.generatedBranchName) {
      // Auto-generate branch name and create/switch
      const generatedBranchName = options.generatedBranchName;
      await this.createOrSwitchBranch(generatedBranchName);
      return { finalBranchName: generatedBranchName, switched: true };
    }

    return { switched: false };
  }

  /**
   * Display branch operation error
   */
  public displayBranchError(error: string, operation: string): void {
    console.log();
    console.log(chalk.red('═'.repeat(55)));
    console.log(chalk.red.bold(`❌ Branch ${operation} Failed`));
    console.log();
    console.log(chalk.red('Error:'), error);
    console.log();

    console.log(chalk.yellow('🔧 Troubleshooting:'));
    console.log(chalk.gray('   • Check if branch name is valid'));
    console.log(chalk.gray('   • Ensure you have git permissions'));
    console.log(chalk.gray("   • Verify you're in a git repository"));
    console.log(chalk.gray('   • Use --list-branches to see available branches'));
    console.log();
    console.log(chalk.blue('For help: https://github.com/rollenasistores/devsum/issues'));
    console.log(chalk.red('═'.repeat(55)));
  }

  /**
   * Display branch already exists warning
   */
  public displayBranchExistsWarning(branchName: string): void {
    console.log();
    console.log(chalk.yellow(`⚠️  Branch '${branchName}' already exists`));
    console.log(
      chalk.blue('💡 Use --switch to switch to existing branch or choose a different name')
    );
  }

  /**
   * Display branch not found error
   */
  public displayBranchNotFoundError(branchName: string): void {
    console.log();
    console.log(chalk.red(`❌ Branch '${branchName}' does not exist`));
    console.log(chalk.blue('💡 Use --list-branches to see available branches'));
  }

  /**
   * Display successful branch switch
   */
  public displayBranchSwitchSuccess(branchName: string): void {
    console.log(chalk.green(`✅ Switched to branch: ${branchName}`));
  }

  /**
   * Display successful branch creation
   */
  public displayBranchCreationSuccess(branchName: string): void {
    console.log(chalk.green(`✅ Created and switched to branch: ${branchName}`));
  }

  /**
   * Get all existing branch names for conflict checking
   */
  public async getAllBranchNames(): Promise<string[]> {
    try {
      const branches = await this.getAllBranches();
      return [...branches.local, ...branches.remote];
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if a branch name conflicts with existing branches
   */
  public async hasBranchConflict(branchName: string): Promise<boolean> {
    return await this.branchExists(branchName);
  }
}
