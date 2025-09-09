import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { Config } from '../types/index.js';

export const setupCommand = new Command('setup')
  .description('Interactive setup for devsum configuration')
  .action(async () => {
    console.log(chalk.blue('🚀 Welcome to DevSum setup!\n'));

    try {
      const existingConfig = await configManager.loadConfig();
      
      if (existingConfig) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'Configuration already exists. Do you want to overwrite it?',
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log(chalk.yellow('Setup cancelled.'));
          return;
        }
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: 'Choose your AI provider:',
          choices: [
            { name: 'Gemini (Google)', value: 'gemini' },
            { name: 'Claude (Anthropic)', value: 'claude' },
          ],
          default: 'gemini',
        },
        {
          type: 'password',
          name: 'apiKey',
          message: (answers: any) => {
            const keyName = answers.provider === 'gemini' ? 'Gemini API key' : 'Claude API key';
            return `Enter your ${keyName}:`;
          },
          validate: (input) => {
            if (!input.trim()) {
              return 'API key is required';
            }
            return true;
          },
        },
        {
          type: 'input',
          name: 'defaultOutput',
          message: 'Default output directory:',
          default: './reports',
          validate: (input) => {
            if (!input.trim()) {
              return 'Output directory is required';
            }
            return true;
          },
        },
        {
          type: 'input',
          name: 'model',
          message: 'AI Model (optional):',
          default: (answers: any) => {
            return answers.provider === 'gemini' ? 'gemini-1.5-flash' : 'claude-3-sonnet-20240229';
          },
          when: (answers) => answers.provider === 'claude' || answers.provider === 'gemini',
        },
      ]);

      const config: Config = {
        provider: answers.provider,
        apiKey: answers.apiKey,
        defaultOutput: answers.defaultOutput,
        ...(answers.model && { model: answers.model }),
      };

      await configManager.saveConfig(config);

      console.log(chalk.green('\n✅ Configuration saved successfully!'));
      console.log(chalk.gray(`Config file: ${configManager.getConfigPath()}`));
      
      const exampleCommand = answers.provider === 'gemini' 
        ? 'devsum report --since 2025-09-01' 
        : 'devsum report --since 2025-09-01';
      
      console.log(chalk.blue(`\nYou can now use: ${exampleCommand}`));

      // Show provider-specific setup info
      if (answers.provider === 'gemini') {
        console.log(chalk.cyan('\n📝 Gemini Setup Notes:'));
        console.log(chalk.gray('• Get your API key from: https://aistudio.google.com/app/apikey'));
        console.log(chalk.gray('• Available models: gemini-1.5-flash, gemini-1.5-pro'));
      } else if (answers.provider === 'claude') {
        console.log(chalk.cyan('\n📝 Claude Setup Notes:'));
        console.log(chalk.gray('• Get your API key from: https://console.anthropic.com/'));
        console.log(chalk.gray('• Available models: claude-3-sonnet-20240229, claude-3-opus-20240229'));
      }

    } catch (error) {
      console.error(chalk.red('Setup failed:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });