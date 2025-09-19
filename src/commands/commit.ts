import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { GitService } from '../core/git.js';
import { AIService } from '../core/ai.js';
import { CommitOptions } from '../types/index.js';

const COMMIT_ICON = `
 ██████╗ ██████╗ ███╗   ███╗██╗██╗   ██╗████████╗
██╔════╝██╔═══██╗████╗ ████║██║██║   ██║╚══██╔══╝
██║     ██║   ██║██╔████╔██║██║██║   ██║   ██║   
██║     ██║   ██║██║╚██╔╝██║██║██║   ██║   ██║   
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║╚██████╔╝   ██║   
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝ ╚═════╝    ╚═╝   
`;

const displayHeader = () => {
  console.clear();
  console.log(chalk.yellow.bold(COMMIT_ICON));
  console.log(chalk.gray('          AI-Powered Commit Message Generator'));
  console.log(chalk.blue('═'.repeat(55)));
  console.log();
};

const displayProgress = (step: string, isComplete: boolean = false) => {
  const icon = isComplete ? '✅' : '⏳';
  const color = isComplete ? chalk.green : chalk.blue;
  console.log(color(`${icon} ${step}`));
};

const displayChanges = (changes: {
  stagedFiles: string[];
  modifiedFiles: string[];
  addedFiles: string[];
  deletedFiles: string[];
  diffStats: { insertions: number; deletions: number };
}) => {
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
  console.log(chalk.white(`📈 Changes: +${changes.diffStats.insertions} -${changes.diffStats.deletions}`));
  console.log(chalk.blue('═'.repeat(55)));
};

const displayAIProgress = (provider: string, model: string) => {
  console.log();
  console.log(chalk.magenta.bold('🤖 AI Analysis in Progress...'));
  console.log(chalk.gray(`   Provider: ${provider.toUpperCase()}`));
  console.log(chalk.gray(`   Model: ${model}`));
  console.log(chalk.gray(`   Analyzing changes and generating commit message...`));
  console.log();
};

const displayCommitMessage = (message: string, options: { conventional?: boolean; emoji?: boolean }) => {
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
  console.log(chalk.green('🚀 Ready to commit!'));
  console.log(chalk.green('═'.repeat(55)));
};

const displayError = (error: unknown, context: string) => {
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
};

export const commitCommand = new Command('commit')
  .description('Generate AI-powered commit messages from your changes')
  .option('-a, --auto', 'Automatically commit with the generated message')
  .option('-c, --conventional', 'Generate conventional commit format')
  .option('-e, --emoji', 'Include emojis in commit message')
  .option('-l, --length <length>', 'Message length (short|medium|detailed)', 'medium')
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option('--dry-run', 'Show what would be committed without actually committing')
  .option('--no-header', 'Skip the fancy header display')
  .action(async (options: CommitOptions & { 
    auto?: boolean;
    conventional?: boolean;
    emoji?: boolean;
    length?: string;
    provider?: string;
    dryRun?: boolean;
    noHeader?: boolean;
  }) => {
    const startTime = Date.now();
    
    try {
      // Validate length parameter
      const validLengths = ['short', 'medium', 'detailed'];
      if (options.length && !validLengths.includes(options.length)) {
        console.log();
        console.error(chalk.red('❌ Invalid message length'));
        console.log(chalk.yellow(`Valid options: ${validLengths.join(', ')}`));
        console.log();
        console.log(chalk.blue('💡 Message length options:'));
        console.log(chalk.white('   --length short     '), chalk.gray('# Brief, concise message (1-2 lines)'));
        console.log(chalk.white('   --length medium    '), chalk.gray('# Balanced message (2-3 lines)'));
        console.log(chalk.white('   --length detailed  '), chalk.gray('# Comprehensive message (3-5 lines)'));
        process.exit(1);
      }

      if (!options.noHeader) {
        displayHeader();
      }

      // Load configuration and select provider
      displayProgress('Loading configuration...');
      const config = await configManager.loadConfig();
      if (!config) {
        console.log();
        console.error(chalk.red('❌ No configuration found'));
        console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('first to configure your settings'));
        process.exit(1);
      }

      // Get the selected provider
      const selectedProvider = await configManager.getProvider(options.provider);
      if (!selectedProvider) {
        console.log();
        if (options.provider) {
          console.error(chalk.red(`❌ Provider '${options.provider}' not found`));
          console.log(chalk.blue('💡 Available providers:'));
          config.providers.forEach(p => {
            const isDefault = p.isDefault ? chalk.green(' (DEFAULT)') : '';
            console.log(chalk.gray(`   • ${p.name}${isDefault}`));
          });
        } else {
          console.error(chalk.red('❌ No AI providers configured'));
          console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('to configure providers'));
        }
        process.exit(1);
      }

      displayProgress(`Using AI provider: ${selectedProvider.name} (${selectedProvider.provider})`, true);

      // Validate git repository
      displayProgress('Checking git repository...');
      const gitService = new GitService();
      const isGitRepo = await gitService.isGitRepository();
      if (!isGitRepo) {
        console.log();
        console.error(chalk.red('❌ Not a git repository'));
        console.log(chalk.gray('Please run this command from within a git repository'));
        process.exit(1);
      }
      displayProgress('Git repository verified', true);

      // Get staged changes
      displayProgress('Analyzing staged changes...');
      const changes = await gitService.getStagedChanges();
      
      if (changes.stagedFiles.length === 0) {
        console.log();
        console.log(chalk.yellow('⚠️  No staged changes found'));
        console.log();
        console.log(chalk.blue('💡 Stage your changes first:'));
        console.log(chalk.white('  git add .                    '), chalk.gray('# Stage all changes'));
        console.log(chalk.white('  git add <file>               '), chalk.gray('# Stage specific file'));
        console.log(chalk.white('  git add -p                   '), chalk.gray('# Interactive staging'));
        console.log();
        console.log(chalk.cyan('💡 Then run:'), chalk.white('devsum commit'));
        process.exit(0);
      }

      displayProgress(`Found ${changes.stagedFiles.length} staged files`, true);
      displayChanges(changes);

      // Generate AI commit message
      displayAIProgress(selectedProvider.provider, selectedProvider.model || 'default');
      const aiService = AIService.fromProvider(selectedProvider);
      const messageLength = (options.length as 'short' | 'medium' | 'detailed') || 'medium';
      const commitMessage = await aiService.generateCommitMessage(changes, {
        conventional: options.conventional || false,
        emoji: options.emoji || false,
        length: messageLength
      });
      displayProgress('AI analysis complete', true);

      // Display the generated message
      displayCommitMessage(commitMessage, {
        conventional: options.conventional || false,
        emoji: options.emoji || false
      });

      // Handle auto-commit or dry-run
      if (options.auto || options.dryRun) {
        console.log();
        if (options.dryRun) {
          console.log(chalk.blue('🔍 Dry Run Mode - No actual commit will be made'));
          console.log(chalk.gray('Command that would be executed:'));
          console.log(chalk.white(`   git commit -m "${commitMessage}"`));
        } else {
          displayProgress('Committing changes...');
          try {
            await gitService.commitChanges(commitMessage);
            displayProgress('Changes committed successfully', true);
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

      const processingTime = (Date.now() - startTime) / 1000;
      console.log();
      console.log(chalk.gray(`⏱️  Processing time: ${processingTime.toFixed(2)}s`));

    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;
      console.log(chalk.gray(`\n⏱️  Processing time: ${processingTime.toFixed(2)}s`));
      displayError(error, 'Commit message generation');
      process.exit(1);
    }
  });
