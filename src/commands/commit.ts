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
  public async execute(options: CommitOptions & { 
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
    await this.processor.processCommit(options);
  }
}

// Create command instance
const commitCommandInstance = new CommitCommand();

export const commitCommand = new Command('commit')
  .description('Generate AI-powered commit messages from your changes')
  .option('-a, --auto', 'Automatically commit with the generated message')
  .option('-c, --conventional', 'Generate conventional commit format')
  .option('-e, --emoji', 'Include emojis in commit message')
  .option('-l, --length <length>', 'Message length (short|medium|detailed)', 'medium')
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option('--dry-run', 'Show what would be committed without actually committing')
  .option('--no-header', 'Skip the fancy header display')
  .option('-b, --branch <name>', 'Create and switch to a new branch before committing')
  .option('--new-branch <name>', 'Create a new branch (alias for --branch)')
  .option('-s, --switch-branch <name>', 'Switch to an existing branch before committing')
  .option('--list-branches', 'List all available branches and exit')
  .option('--auto-branch', 'Auto-generate branch name and ask for confirmation')
  .action(async (options: CommitOptions & { 
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
  }) => {
    await commitCommandInstance.execute(options);
  });
