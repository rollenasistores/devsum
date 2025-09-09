import { Command } from 'commander';
import chalk from 'chalk';
import { setupCommand } from './commands/setup.js';
import { loginCommand } from './commands/login.js';
import { reportCommand } from './commands/report.js';

const program = new Command();

program
  .name('devsum')
  .description('Generate accomplishment reports from git commits using AI')
  .version('1.0.0');

// Add commands
program.addCommand(setupCommand);
program.addCommand(loginCommand);
program.addCommand(reportCommand);

// Error handling
program.exitOverride((err) => {
  if (err.code === 'commander.help') {
    process.exit(0);
  }
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});

export { program };