import { Command } from 'commander';
import chalk from 'chalk';

export const loginCommand = new Command('login')
  .description('Authenticate with DevSum (currently in free mode)')
  .action(() => {
    console.log(chalk.blue('🎉 DevSum Free Mode'));
    console.log(chalk.gray('Authentication is not required in free mode.'));
    console.log(chalk.green('You can start using DevSum right away!'));
    console.log(chalk.blue('\nCommands available:'));
    console.log(chalk.white('  devsum setup   - Configure your AI provider'));
    console.log(chalk.white('  devsum report  - Generate accomplishment reports'));
    console.log(chalk.gray('\n💡 Pro tip: Run "devsum setup" first to configure your API key.'));
  });