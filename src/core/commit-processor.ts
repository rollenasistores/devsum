import readline from 'readline';
import chalk from 'chalk';
import { configManager } from './config.js';
import { GitService } from './git.js';
import { AIService } from './ai.js';
import { DisplayService } from './display-service.js';
import { CommitValidator } from './commit-validator.js';
import { BranchManager } from './branch-manager.js';
import { CommitOptions, StagedChanges, AIProvider } from '../types/index.js';

/**
 * Service responsible for processing commit operations
 * Orchestrates the entire commit workflow following single responsibility principle
 */
export class CommitProcessor {
  private readonly gitService: GitService;
  private readonly validator: CommitValidator;
  private readonly branchManager: BranchManager;

  constructor() {
    this.gitService = new GitService();
    this.validator = new CommitValidator();
    this.branchManager = new BranchManager();
  }

  /**
   * Process the main commit workflow
   */
  public async processCommit(options: CommitOptions & { 
    auto?: boolean;
    conventional?: boolean;
    emoji?: boolean;
    length?: string;
    provider?: string;
    dryRun?: boolean;
    noHeader?: boolean;
    branch?: string;
    newBranch?: string;
    switchBranch?: string;
    listBranches?: boolean;
    autoBranch?: boolean;
  }): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Validate length parameter
      const lengthError = this.validator.validateMessageLength(options.length);
      if (lengthError) {
        console.log();
        console.error(chalk.red('❌ Invalid message length'));
        console.log(chalk.yellow(lengthError));
        this.validator.displayMessageLengthHelp();
        process.exit(1);
      }

      // Handle --list-branches option first (no config needed)
      if (options.listBranches) {
        await this.handleListBranches(options.noHeader);
        return;
      }

      if (!options.noHeader) {
        DisplayService.displayCommitHeader();
      }

      // Load configuration and select provider
      DisplayService.displayProgress('Loading configuration...');
      const config = await configManager.loadConfig();
      if (!config) {
        this.displayNoConfigError();
        process.exit(1);
      }

      // Get the selected provider
      const selectedProvider = await configManager.getProvider(options.provider);
      if (!selectedProvider) {
        this.displayProviderError(options.provider, config);
        process.exit(1);
      }

      DisplayService.displayProgress(`Using AI provider: ${selectedProvider.name} (${selectedProvider.provider})`, true);

      // Validate git repository
      DisplayService.displayProgress('Checking git repository...');
      const gitError = await this.validator.validateGitRepository();
      if (gitError) {
        console.log();
        console.error(chalk.red('❌ Not a git repository'));
        console.log(chalk.gray(gitError));
        process.exit(1);
      }
      DisplayService.displayProgress('Git repository verified', true);

      // Handle branch operations
      const branchResult = await this.branchManager.handleBranchOperations({
        branch: options.branch,
        newBranch: options.newBranch,
        switchBranch: options.switchBranch,
        autoBranch: options.autoBranch
      });

      // Show branch information
      DisplayService.displayProgress('Getting branch information...');
      const branchInfo = await this.branchManager.getBranchInfo();
      DisplayService.displayBranchInfo(branchInfo);

      // Get staged changes
      DisplayService.displayProgress('Analyzing staged changes...');
      const changesResult = await this.validator.validateStagedChanges();
      
      if (!changesResult.isValid) {
        console.log();
        console.log(chalk.yellow('⚠️  No staged changes found'));
        this.validator.displayNoStagedChangesHelp();
        process.exit(0);
      }

      const changes = changesResult.changes!;
      DisplayService.displayProgress(`Found ${changes.stagedFiles.length} staged files`, true);
      DisplayService.displayChanges(changes);

      // Generate AI commit message
      DisplayService.displayAIProgress(selectedProvider.provider, selectedProvider.model || 'default');
      const aiService = AIService.fromProvider(selectedProvider);
      const messageLength = (options.length as 'short' | 'medium' | 'detailed') || 'medium';
      const commitMessage = await aiService.generateCommitMessage(changes, {
        conventional: options.conventional || false,
        emoji: options.emoji || false,
        length: messageLength
      });
      DisplayService.displayProgress('AI analysis complete', true);

      // Handle auto-branch generation
      let finalBranchName = branchResult.finalBranchName;
      if (options.autoBranch && !options.branch && !options.switchBranch) {
        await this.handleAutoBranchGeneration(aiService, changes, commitMessage);
        finalBranchName = await this.generateAndCreateBranch(aiService, changes);
      }

      // Display the generated message
      DisplayService.displayCommitMessage(commitMessage, {
        conventional: options.conventional || false,
        emoji: options.emoji || false
      });

      // Handle auto-commit or dry-run
      if (options.auto || options.dryRun) {
        await this.handleCommitExecution(commitMessage, changes, options.dryRun);
      }

      const processingTime = (Date.now() - startTime) / 1000;
      console.log();
      console.log(chalk.gray(`⏱️  Processing time: ${processingTime.toFixed(2)}s`));

    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;
      console.log(chalk.gray(`\n⏱️  Processing time: ${processingTime.toFixed(2)}s`));
      DisplayService.displayError(error, 'Commit message generation');
      process.exit(1);
    }
  }

  /**
   * Handle list branches operation
   */
  private async handleListBranches(noHeader?: boolean): Promise<void> {
    if (!noHeader) {
      DisplayService.displayCommitHeader();
    }
    DisplayService.displayProgress('Loading branch information...');
    const gitError = await this.validator.validateGitRepository();
    if (gitError) {
      console.log();
      console.error(chalk.red('❌ Not a git repository'));
      console.log(chalk.gray(gitError));
      process.exit(1);
    }
    
    const branches = await this.branchManager.getAllBranches();
    DisplayService.displayBranches(branches);
  }

  /**
   * Handle auto-branch generation workflow
   */
  private async handleAutoBranchGeneration(
    aiService: AIService, 
    changes: StagedChanges, 
    commitMessage: string
  ): Promise<void> {
    DisplayService.displayProgress('Generating branch name...');
    const generatedBranchName = await aiService.generateBranchName(changes);
    DisplayService.displayProgress('Branch name generated', true);
    
    // Show proposal and ask for confirmation
    DisplayService.displayAutoBranchProposal(generatedBranchName, commitMessage, changes);
    
    const shouldProceed = await this.askConfirmation(chalk.cyan('🤔 Do you want to proceed with this branch and commit? (Y/n): '));
    
    if (!shouldProceed) {
      console.log();
      console.log(chalk.yellow('❌ Operation cancelled by user'));
      console.log(chalk.blue('💡 You can still commit manually or try different options'));
      process.exit(0);
    }
  }

  /**
   * Generate and create branch for auto-branch mode
   */
  private async generateAndCreateBranch(aiService: AIService, changes: StagedChanges): Promise<string> {
    const generatedBranchName = await aiService.generateBranchName(changes);
    
    // Create the branch
    DisplayService.displayProgress(`Creating branch: ${generatedBranchName}...`);
    try {
      await this.branchManager.createOrSwitchBranch(generatedBranchName);
      DisplayService.displayProgress(`Switched to branch: ${generatedBranchName}`, true);
      return generatedBranchName;
    } catch (error) {
      console.log();
      console.error(chalk.red('❌ Failed to create/switch branch'));
      console.log(chalk.yellow('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  /**
   * Handle commit execution (auto-commit or dry-run)
   */
  private async handleCommitExecution(
    commitMessage: string, 
    changes: StagedChanges, 
    dryRun?: boolean
  ): Promise<void> {
    console.log();
    if (dryRun) {
      console.log(chalk.blue('🔍 Dry Run Mode - No actual commit will be made'));
      console.log(chalk.gray('Command that would be executed:'));
      console.log(chalk.white(`   git commit -m "${commitMessage}"`));
    } else {
      DisplayService.displayProgress('Committing changes...');
      try {
        await this.gitService.commitChanges(commitMessage);
        DisplayService.displayProgress('Changes committed successfully', true);
        console.log();
        console.log(chalk.green('🎉 Commit completed!'));
        console.log(chalk.gray(`   Message: ${commitMessage}`));
        console.log(chalk.gray(`   Files: ${changes.stagedFiles.length} files`));
        console.log(chalk.gray(`   Changes: +${changes.diffStats.insertions} -${changes.diffStats.deletions}`));
      } catch (error) {
        console.log();
        console.error(chalk.red('❌ Failed to commit changes'));
        console.log(chalk.yellow('Error:'), error instanceof Error ? error.message : 'Unknown error');
        console.log();
        console.log(chalk.blue('💡 You can still commit manually:'));
        console.log(chalk.white(`   git commit -m "${commitMessage}"`));
      }
    }
  }

  /**
   * Ask for user confirmation
   */
  private async askConfirmation(question: string): Promise<boolean> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(question, (answer) => {
        rl.close();
        const response = answer.toLowerCase().trim();
        resolve(response === 'y' || response === 'yes' || response === '');
      });
    });
  }

  /**
   * Display no configuration error
   */
  private displayNoConfigError(): void {
    console.log();
    console.error(chalk.red('❌ No configuration found'));
    console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('first to configure your settings'));
  }

  /**
   * Display provider error
   */
  private displayProviderError(providerName?: string, config?: any): void {
    console.log();
    if (providerName) {
      console.error(chalk.red(`❌ Provider '${providerName}' not found`));
      console.log(chalk.blue('💡 Available providers:'));
      config?.providers.forEach((p: AIProvider) => {
        const isDefault = p.isDefault ? chalk.green(' (DEFAULT)') : '';
        console.log(chalk.gray(`   • ${p.name}${isDefault}`));
      });
    } else {
      console.error(chalk.red('❌ No AI providers configured'));
      console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('to configure providers'));
    }
  }
}
