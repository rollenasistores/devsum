// src/index.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { setupCommand } from './commands/setup.js';
import { loginCommand } from './commands/login.js';
import { reportCommand } from './commands/report.js';
import { updateCommand } from './commands/update.js';
import { commitCommand } from './commands/commit.js';
import { analyticsCommand } from './commands/analytics.js';
import { UpdateChecker } from './core/updateChecker.js';
import { getVersion } from './utils/version.js';

const program = new Command();

// Initialize update checker
const currentVersion = getVersion();
const updateChecker = new UpdateChecker('devsum', currentVersion);

program
  .name('devsum')
  .description(
    '🚀 AI-powered CLI tool that generates professional accomplishment reports from git commits'
  )
  .version(currentVersion, '-v, --version', 'display version number');

// Add commands
program.addCommand(setupCommand);
program.addCommand(loginCommand);
program.addCommand(reportCommand);
program.addCommand(analyticsCommand);
program.addCommand(updateCommand);
program.addCommand(commitCommand);

// Custom help
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('Examples:'));
  console.log(chalk.gray('  $ devsum setup                    # Interactive configuration'));
  console.log(chalk.gray('  $ devsum report --since 7d        # Report for last 7 days'));
  console.log(chalk.gray('  $ devsum analytics --since 30d    # Interactive analytics dashboard'));
  console.log(chalk.gray('  $ devsum commit --auto            # Generate and commit with AI'));
  console.log(chalk.gray('  $ devsum update                   # Check for updates'));
  console.log(chalk.gray('  $ devsum login                    # View free mode info'));
  console.log('');
  console.log(chalk.blue('Documentation:'));
  console.log(chalk.gray('  https://github.com/rollenasistores/devsum#readme'));
  console.log('');
});

// Error handling
program.exitOverride(err => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  console.error(chalk.red('❌ Error:'), err.message);
  process.exit(1);
});

// Handle unknown commands
program.on('command:*', operands => {
  console.error(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log(chalk.blue('💡 Available commands:'));
  console.log(chalk.gray('  setup     - Configure DevSum settings'));
  console.log(chalk.gray('  report    - Generate accomplishment reports'));
  console.log(chalk.gray('  analytics - Interactive analytics dashboard'));
  console.log(chalk.gray('  commit    - Generate AI commit messages'));
  console.log(chalk.gray('  update    - Check for DevSum updates'));
  console.log(chalk.gray('  login     - View free mode information'));
  console.log(chalk.gray('  --help    - Show help information'));
  process.exit(1);
});

// Enhanced program execution with update notifications
export async function runWithUpdateCheck() {
  try {
    // Check for updates in background (non-blocking)
    const updatePromise = updateChecker.checkForUpdates().catch(() => null);

    // Parse commands first
    await program.parseAsync();

    // Show update notification after command execution
    const updateInfo = await updatePromise;

    // Only show update notification for main commands (not for version/help)
    const showNotification =
      process.argv.length > 2 &&
      !process.argv.includes('--version') &&
      !process.argv.includes('-v') &&
      !process.argv.includes('--help') &&
      !process.argv.includes('update'); // Don't show notification on update command

    if (showNotification && updateInfo?.hasUpdate) {
      UpdateChecker.displayUpdateNotification(updateInfo);
    }
  } catch (error) {
    // Handle any unexpected errors
    if (error instanceof Error && error.message.includes('commander.')) {
      // Commander errors are handled by exitOverride
      return;
    }

    console.error(
      chalk.red('❌ Unexpected error:'),
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}

export { program };

// If this file is run directly (not imported), run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  runWithUpdateCheck();
}
