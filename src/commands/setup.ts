import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { Config } from '../types/index.js';
import { getVersion } from '../utils/version.js';

const ASCII_LOGO = `
██████╗ ███████╗██╗   ██╗███████╗██╗   ██╗███╗   ███╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║   ██║████╗ ████║
██║  ██║█████╗  ██║   ██║███████╗██║   ██║██╔████╔██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██║   ██║██║╚██╔╝██║
██████╔╝███████╗ ╚████╔╝ ███████║╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝     ╚═╝
`;

const displayWelcome = () => {
  console.clear();
  console.log(chalk.cyan.bold(ASCII_LOGO));
  console.log(chalk.gray('                    Git Commit Report Generator'));
  console.log(chalk.gray(`                      Powered by AI • v${getVersion()}`));
  console.log(chalk.blue('═'.repeat(60)));
  console.log();
  console.log(chalk.green('🚀 Welcome to DevSum Interactive Setup!'));
  console.log(chalk.gray('   Let\'s configure your development reporting tool...'));
  console.log();
};

const displayProviderInfo = (provider: string) => {
  console.log();
  console.log(chalk.blue('═'.repeat(60)));

  if (provider === 'gemini') {
    console.log(chalk.cyan.bold('🤖 Google Gemini Configuration'));
    console.log(chalk.gray('   Fast, efficient AI for code analysis'));
    console.log();
    console.log(chalk.yellow('📋 Setup Requirements:'));
    console.log(chalk.gray('   • API Key: https://aistudio.google.com/app/apikey'));
    console.log(chalk.gray('   • Models: gemini-2.0-flash (fast), gemini-2.5-pro (detailed), gemini-2.5-flash (detailed)'));
    console.log(chalk.gray('   • Free tier: 15 requests/minute'));
  } else if (provider === 'claude') {
    console.log(chalk.cyan.bold('🧠 Anthropic Claude Configuration'));
    console.log(chalk.gray('   Advanced reasoning for detailed reports'));
    console.log();
    console.log(chalk.yellow('📋 Setup Requirements:'));
    console.log(chalk.gray('   • API Key: https://console.anthropic.com/'));
    console.log(chalk.gray('   • Models: claude-3-sonnet (balanced), claude-3-opus (premium)'));
    console.log(chalk.gray('   • Usage: Pay-per-use pricing'));
  } else if (provider === 'devsum-api') {
    console.log(chalk.magenta.bold('🚀 DevSum API Configuration'));
    console.log(chalk.gray('   Use DevSum API with persistent authentication'));
    console.log();
    console.log(chalk.yellow('📋 Setup Requirements:'));
    console.log(chalk.gray('   • No API key needed - use devsum auth command'));
    console.log(chalk.gray('   • Persistent token that never expires'));
    console.log(chalk.gray('   • Powered by Gemini AI'));
    console.log(chalk.gray('   • Free to use with DevSum account'));
  }
  console.log();
};

const validateApiKey = (apiKey: string, provider: string): boolean | string => {
  if (provider === 'devsum-api') {
    // DevSum API doesn't need an API key here - it will be handled by auth command
    return true;
  }

  if (!apiKey.trim()) {
    return '❌ API key is required';
  }

  if (provider === 'gemini') {
    // Gemini API keys typically start with "AIza" and are 39 characters long
    if (!apiKey.startsWith('AIza')) {
      return '❌ Gemini API key should start with "AIza"';
    }
    if (apiKey.length !== 39) {
      return '❌ Gemini API key should be exactly 39 characters long';
    }
    // Check for valid characters (alphanumeric, hyphens, underscores)
    if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
      return '❌ Gemini API key contains invalid characters';
    }
  } else if (provider === 'claude') {
    // Claude API keys typically start with "sk-ant-" and are longer
    if (!apiKey.startsWith('sk-ant-')) {
      return '❌ Claude API key should start with "sk-ant-"';
    }
    if (apiKey.length < 40) {
      return '❌ Claude API key seems too short';
    }
  } else {
    // Generic validation for other providers
    if (apiKey.length < 10) {
      return '❌ API key seems too short';
    }
  }

  return true;
};

const displaySuccess = (config: Config) => {
  console.log();
  console.log(chalk.green('═'.repeat(60)));
  console.log(chalk.green.bold('✅ Configuration Complete!'));
  console.log();
  console.log(chalk.blue('📁 Configuration Summary:'));
  console.log(chalk.gray(`   Provider: ${config.provider.toUpperCase()}`));
  console.log(chalk.gray(`   Model: ${config.model || 'default'}`));
  console.log(chalk.gray(`   Output: ${config.defaultOutput}`));
  console.log(chalk.gray(`   Config: ${configManager.getConfigPath()}`));
  console.log();

  console.log(chalk.yellow('🚀 Quick Start Commands:'));
  if (config.provider === 'devsum-api') {
    console.log(chalk.cyan('   devsum auth                       '), chalk.gray('# Authenticate with DevSum API'));
    console.log(chalk.cyan('   devsum report --since 7d          '), chalk.gray('# Last 7 days'));
    console.log(chalk.cyan('   devsum report --since 2025-09-01  '), chalk.gray('# Since specific date'));
    console.log(chalk.cyan('   devsum report --author "John Doe" '), chalk.gray('# Specific author'));
    console.log(chalk.cyan('   devsum report --format json       '), chalk.gray('# JSON output'));
  } else {
    console.log(chalk.cyan('   devsum report --since 7d          '), chalk.gray('# Last 7 days'));
    console.log(chalk.cyan('   devsum report --since 2025-09-01  '), chalk.gray('# Since specific date'));
    console.log(chalk.cyan('   devsum report --author "John Doe" '), chalk.gray('# Specific author'));
    console.log(chalk.cyan('   devsum report --format json       '), chalk.gray('# JSON output'));
  }
  console.log();

  console.log(chalk.green('🎉 You\'re all set! Happy coding!'));
  console.log(chalk.blue('═'.repeat(60)));
};

const displayError = (error: unknown) => {
  console.log();
  console.log(chalk.red('═'.repeat(60)));
  console.log(chalk.red.bold('❌ Setup Failed'));
  console.log();
  console.log(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
  console.log();
  console.log(chalk.yellow('💡 Troubleshooting:'));
  console.log(chalk.gray('   • Check your internet connection'));
  console.log(chalk.gray('   • Verify API key permissions'));
  console.log(chalk.gray('   • Ensure write access to config directory'));
  console.log();
  console.log(chalk.blue('For help: https://github.com/your-repo/devsum/issues'));
  console.log(chalk.red('═'.repeat(60)));
};

export const setupCommand = new Command('setup')
  .description('Interactive setup for devsum configuration')
  .action(async () => {
    try {
      displayWelcome();

      const existingConfig = await configManager.loadConfig();

      if (existingConfig) {
        console.log(chalk.yellow('⚠️  Configuration Detected'));
        console.log(chalk.gray(`   Found existing config: ${configManager.getConfigPath()}`));
        console.log();

        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'Would you like to overwrite the existing configuration?',
            default: false,
          },
        ]);

        if (!overwrite) {
          console.log();
          console.log(chalk.yellow('⏹️  Setup cancelled by user'));
          console.log(chalk.gray('   Your existing configuration remains unchanged.'));
          return;
        }
      }

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: '🤖 Choose your AI provider:',
          choices: [
            {
              name: chalk.cyan('🤖 Gemini (Google)') + chalk.gray(' - Fast & Free tier available'),
              value: 'gemini'
            },
            {
              name: chalk.blue('🧠 Claude (Anthropic)') + chalk.gray(' - Advanced reasoning'),
              value: 'claude'
            },
            {
              name: chalk.magenta('🚀 DevSum API') + chalk.gray(' - Persistent auth, no API key needed'),
              value: 'devsum-api'
            },
          ],
          default: 'gemini',
        },
      ]);

      displayProviderInfo(answers.provider);

      let configAnswers: any = {};

      if (answers.provider === 'devsum-api') {
        // For DevSum API, we don't need API key input
        configAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'apiUrl',
            message: '🌐 DevSum API URL:',
            default: 'http://localhost:8000/api',
            validate: (input) => {
              if (!input.trim()) {
                return '❌ API URL is required';
              }
              return true;
            },
          },
          {
            type: 'input',
            name: 'defaultOutput',
            message: '📁 Default output directory:',
            default: './reports',
            validate: (input) => {
              if (!input.trim()) {
                return '❌ Output directory is required';
              }
              return true;
            },
          },
        ]);
        configAnswers.apiKey = ''; // Will be set by auth command
        configAnswers.model = 'devsum-gemini';
      } else {
        // For other providers, ask for API key
        configAnswers = await inquirer.prompt([
          {
            type: 'password',
            name: 'apiKey',
            message: '🔑 Enter your API key:',
            validate: (input) => validateApiKey(input, answers.provider),
          },
          {
            type: 'input',
            name: 'defaultOutput',
            message: '📁 Default output directory:',
            default: './reports',
            validate: (input) => {
              if (!input.trim()) {
                return '❌ Output directory is required';
              }
              return true;
            },
          },
          {
            type: 'input',
            name: 'model',
            message: '⚙️  AI Model (press Enter for default):',
            default: (answers: any) => {
              return answers.provider === 'gemini' ? 'gemini-2.0-flash' : 'claude-3-5-sonnet-20241022';
            },
          },
        ]);
      }

      const config: Config = {
        provider: answers.provider,
        apiKey: configAnswers.apiKey,
        defaultOutput: configAnswers.defaultOutput,
        ...(configAnswers.model && { model: configAnswers.model }),
        ...(answers.provider === 'devsum-api' && {
          devsumApiUrl: configAnswers.apiUrl,
          devsumToken: '' // Will be set by auth command
        }),
      };

      // Show loading animation
      console.log();
      console.log(chalk.blue('💾 Saving configuration...'));

      await configManager.saveConfig(config);

      displaySuccess(config);

    } catch (error) {
      displayError(error);
      process.exit(1);
    }
  });