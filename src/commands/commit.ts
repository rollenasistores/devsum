import { Command } from 'commander';
import { CommitProcessor } from '../core/commit-processor.js';
import { CommitOptions } from '../types/index.js';

/**
 * Commit command class following TypeScript guidelines
 * Handles AI-powered commit message generation
 */
export class CommitCommand {
  private readonly processor: CommitProcessor;

  constructor() {
    this.processor = new CommitProcessor();
  }

  /**
   * Execute the commit command
   */
  public async execute(
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
      report?: boolean;
      noAuto?: boolean;
    }
  ): Promise<void> {
    // Enable auto mode by default unless --no-auto is specified
    const autoOptions = {
      ...options,
      auto: options.noAuto ? false : options.auto !== false, // Default to true unless --no-auto or explicitly false
      length: options.length || 'detailed', // Default to detailed for better commit messages
      conventional: options.conventional !== false, // Default to conventional format
    };

    await this.processor.processCommit(autoOptions);
  }
}

// Create command instance
const commitCommandInstance = new CommitCommand();

export const commitCommand = new Command('commit')
  .description(
    'Generate AI-powered commit messages from your changes (auto mode enabled by default)'
  )
  .option(
    '-a, --auto',
    'Full automation: generate branch, add files, commit with detailed messages, and optionally push (enabled by default)'
  )
  .option('--no-auto', 'Disable auto mode and use interactive mode instead')
  .option('-c, --conventional', 'Generate conventional commit format')
  .option('-e, --emoji', 'Include emojis in commit message')
  .option(
    '-l, --length <length>',
    'Message length (short|medium|detailed). Auto mode uses detailed by default.',
    'medium'
  )
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option('--dry-run', 'Show what would be committed without actually committing')
  .option('--no-header', 'Skip the fancy header display')
  .option('-b, --branch <name>', 'Create and switch to a new branch before committing')
  .option('--new-branch <name>', 'Create a new branch (alias for --branch)')
  .option('-s, --switch-branch <name>', 'Switch to an existing branch before committing')
  .option('--list-branches', 'List all available branches and exit')
  .option('--auto-branch', 'Auto-generate branch name and ask for confirmation')
  .option('--auto-add', 'Automatically add all changes (git add .)')
  .option('--auto-push', 'Automatically push after committing')
  .option('--report', "Generate a report for today's commits after committing")
  .action(
    async (
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
        report?: boolean;
        noAuto?: boolean;
      }
    ) => {
      await commitCommandInstance.execute(options);
    }
  );
