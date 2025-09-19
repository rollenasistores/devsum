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
    autoAdd?: boolean;
    autoPush?: boolean;
    report?: boolean;
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

      // Handle auto workflow
      if (options.auto) {
        await this.handleAutoWorkflow(aiService, options, changes);
        return;
      }

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

      // Handle report generation
      if (options.report && !options.dryRun) {
        await this.handleReportGeneration(options);
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
   * Handle report generation for today's commits
   */
  private async handleReportGeneration(options: CommitOptions & { 
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
    autoAdd?: boolean;
    autoPush?: boolean;
    report?: boolean;
  }): Promise<void> {
    try {
      console.log();
      console.log(chalk.blue('📊 Generating report for today\'s commits...'));
      
      // Import ReportProcessor dynamically to avoid circular dependencies
      const { ReportProcessor } = await import('./report-processor.js');
      const reportProcessor = new ReportProcessor();
      
      // Generate report for today's commits
      await reportProcessor.processReport({
        since: 'today',
        length: 'detailed',
        provider: options.provider,
        noHeader: true
      });
      
    } catch (error) {
      console.log();
      console.error(chalk.red('❌ Failed to generate report'));
      console.log(chalk.yellow('Error:'), error instanceof Error ? error.message : 'Unknown error');
      // Don't throw error, just log it and continue
    }
  }

  /**
   * Handle full auto workflow
   */
  private async handleAutoWorkflow(
    aiService: AIService, 
    options: CommitOptions & { 
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
      autoAdd?: boolean;
      autoPush?: boolean;
    }, 
    changes: StagedChanges
  ): Promise<void> {
    console.log();
    console.log(chalk.blue('🚀 Starting Auto Workflow...'));
    console.log();

    try {
      // Step 1: Generate and create branch
      DisplayService.displayProgress('🤖 Generating branch name...');
      const generatedBranchName = await aiService.generateBranchName(changes);
      DisplayService.displayProgress(`Generated branch: ${generatedBranchName}`, true);

      // Ask for branch confirmation
      const shouldCreateBranch = await this.askConfirmation(
        chalk.cyan(`🌿 Create and switch to branch "${generatedBranchName}"? (Y/n): `)
      );

      if (shouldCreateBranch) {
        DisplayService.displayProgress(`Creating branch: ${generatedBranchName}...`);
        await this.branchManager.createOrSwitchBranch(generatedBranchName);
        DisplayService.displayProgress(`Switched to branch: ${generatedBranchName}`, true);
      } else {
        console.log(chalk.yellow('⚠️  Skipping branch creation, using current branch'));
      }

      // Step 2: Handle file adding
      const unstagedChanges = await this.gitService.getUnstagedChanges();
      const hasUnstagedChanges = unstagedChanges.modified.length > 0 || 
                                unstagedChanges.untracked.length > 0 || 
                                unstagedChanges.deleted.length > 0;

      if (hasUnstagedChanges) {
        console.log();
        console.log(chalk.yellow('📁 Unstaged changes detected:'));
        if (unstagedChanges.modified.length > 0) {
          console.log(chalk.gray(`   Modified: ${unstagedChanges.modified.join(', ')}`));
        }
        if (unstagedChanges.untracked.length > 0) {
          console.log(chalk.gray(`   New files: ${unstagedChanges.untracked.join(', ')}`));
        }
        if (unstagedChanges.deleted.length > 0) {
          console.log(chalk.gray(`   Deleted: ${unstagedChanges.deleted.join(', ')}`));
        }

        const addAll = await this.askConfirmation(
          chalk.cyan('📦 Add all changes to staging? (Y/n): ')
        );

        if (addAll) {
          DisplayService.displayProgress('Adding all changes...');
          await this.gitService.addAll();
          DisplayService.displayProgress('All changes added to staging', true);
        } else {
          // Let user select specific files
          await this.handleSelectiveFileAdding(unstagedChanges);
        }
      }

      // Step 3: Generate commit message from all staged changes
      const updatedChanges = await this.gitService.getStagedChanges();
      if (updatedChanges.stagedFiles.length === 0) {
        console.log();
        console.log(chalk.yellow('⚠️  No staged changes found'));
        console.log(chalk.blue('💡 Use git add to stage changes first'));
        return;
      }

      DisplayService.displayProgress('🤖 Generating commit message...');
      const messageLength = (options.length as 'short' | 'medium' | 'detailed') || 'detailed';
      const commitMessage = await aiService.generateCommitMessage(updatedChanges, {
        conventional: options.conventional || false,
        emoji: options.emoji || false,
        length: messageLength
      });
      DisplayService.displayProgress('Commit message generated', true);

      // Display the generated message
      DisplayService.displayCommitMessage(commitMessage, {
        conventional: options.conventional || false,
        emoji: options.emoji || false
      });

      // Step 4: Commit changes
      const shouldCommit = await this.askConfirmation(
        chalk.cyan('💾 Commit these changes? (Y/n): ')
      );

      if (shouldCommit) {
        DisplayService.displayProgress('Committing changes...');
        await this.gitService.commitChanges(commitMessage);
        DisplayService.displayProgress('Changes committed successfully', true);
        console.log();
        console.log(chalk.green('🎉 Commit completed!'));
        console.log(chalk.gray(`   Message: ${commitMessage}`));
        console.log(chalk.gray(`   Files: ${updatedChanges.stagedFiles.length} files`));
        console.log(chalk.gray(`   Changes: +${updatedChanges.diffStats.insertions} -${updatedChanges.diffStats.deletions}`));

        // Step 5: Push changes
        const hasRemote = await this.gitService.hasRemote();
        if (hasRemote) {
          const shouldPush = await this.askConfirmation(
            chalk.cyan('🚀 Push changes to remote? (Y/n): ')
          );

          if (shouldPush) {
            DisplayService.displayProgress('Pushing to remote...');
            await this.gitService.pushBranch();
            DisplayService.displayProgress('Changes pushed successfully', true);
            console.log();
            console.log(chalk.green('🚀 Push completed!'));
          } else {
            console.log(chalk.yellow('⚠️  Skipping push'));
          }
        } else {
          console.log(chalk.yellow('⚠️  No remote repository configured, skipping push'));
        }
      } else {
        console.log(chalk.yellow('❌ Commit cancelled by user'));
      }

      // Handle report generation in auto workflow
      if (options.report) {
        await this.handleReportGeneration(options);
      }

    } catch (error) {
      console.log();
      console.error(chalk.red('❌ Auto workflow failed'));
      console.log(chalk.yellow('Error:'), error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Handle selective file adding
   */
  private async handleSelectiveFileAdding(unstagedChanges: {
    modified: string[];
    untracked: string[];
    deleted: string[];
  }): Promise<void> {
    const allFiles = [
      ...unstagedChanges.modified,
      ...unstagedChanges.untracked,
      ...unstagedChanges.deleted
    ];

    if (allFiles.length === 0) {
      return;
    }

    console.log();
    console.log(chalk.blue('📁 Select files to add:'));
    allFiles.forEach((file, index) => {
      const status = unstagedChanges.modified.includes(file) ? 'modified' :
                    unstagedChanges.untracked.includes(file) ? 'new' : 'deleted';
      console.log(chalk.gray(`   ${index + 1}. ${file} (${status})`));
    });

    const addAll = await this.askConfirmation(
      chalk.cyan('📦 Add all files? (Y/n): ')
    );

    if (addAll) {
      DisplayService.displayProgress('Adding all files...');
      await this.gitService.addFiles(allFiles);
      DisplayService.displayProgress('All files added', true);
    } else {
      // For now, just add all files. In a more advanced version, we could implement
      // interactive file selection
      console.log(chalk.yellow('⚠️  Selective file adding not implemented yet, adding all files'));
      DisplayService.displayProgress('Adding all files...');
      await this.gitService.addFiles(allFiles);
      DisplayService.displayProgress('All files added', true);
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
