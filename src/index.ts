import { Command } from 'commander';
import chalk from 'chalk';
import { setupCommand } from './commands/setup.js';
import { loginCommand } from './commands/login.js';
import { reportCommand } from './commands/report.js';
import { getVersion } from './utils/version.js';

const program = new Command();

program
  .name('devsum')
  .description('🚀 AI-powered CLI tool that generates professional accomplishment reports from git commits')
  .version(getVersion(), '-v, --version', 'display version number');

// Add commands
program.addCommand(setupCommand);
program.addCommand(loginCommand);
program.addCommand(reportCommand);

// Custom help
program.on('--help', () => {
  console.log('');
  console.log(chalk.cyan('Examples:'));
  console.log(chalk.gray('  $ devsum setup                    # Interactive configuration'));
  console.log(chalk.gray('  $ devsum report --since 7d        # Report for last 7 days'));
  console.log(chalk.gray('  $ devsum report --author "John"   # Filter by author'));
  console.log(chalk.gray('  $ devsum login                    # View free mode info'));
  console.log('');
  console.log(chalk.blue('Documentation:'));
  console.log(chalk.gray('  https://github.com/rollenasistores/devsum#readme'));
  console.log('');
});

// Error handling
program.exitOverride((err) => {
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
program.on('command:*', (operands) => {
  console.error(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log(chalk.blue('💡 Available commands:'));
  console.log(chalk.gray('  setup   - Configure DevSum settings'));
  console.log(chalk.gray('  report  - Generate accomplishment reports'));  
  console.log(chalk.gray('  login   - View free mode information'));
  console.log(chalk.gray('  --help  - Show help information'));
  process.exit(1);
});

export { program };