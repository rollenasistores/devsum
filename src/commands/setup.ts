import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { Config, AIProvider } from '../types/index.js';
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
    console.log(chalk.gray('   • Models: gemini-2.0-flash (fast), gemini-1.5-pro (detailed)'));
    console.log(chalk.gray('   • Free tier: 15 requests/minute'));
  } else if (provider === 'claude') {
    console.log(chalk.cyan.bold('🧠 Anthropic Claude Configuration'));
    console.log(chalk.gray('   Advanced reasoning for detailed reports'));
    console.log();
    console.log(chalk.yellow('📋 Setup Requirements:'));
    console.log(chalk.gray('   • API Key: https://console.anthropic.com/'));
    console.log(chalk.gray('   • Models: claude-3-5-sonnet (balanced), claude-3-opus (premium)'));
    console.log(chalk.gray('   • Usage: Pay-per-use pricing'));
  } else if (provider === 'openai') {
    console.log(chalk.green.bold('🚀 OpenAI GPT Configuration'));
    console.log(chalk.gray('   Industry-leading AI with GPT-4 support'));
    console.log();
    console.log(chalk.yellow('📋 Setup Requirements:'));
    console.log(chalk.gray('   • API Key: https://platform.openai.com/api-keys'));
    console.log(chalk.gray('   • Models: gpt-4 (premium), gpt-4-turbo (fast), gpt-3.5-turbo (economical)'));
    console.log(chalk.gray('   • Usage: Pay-per-use pricing'));
  }
  console.log();
};

const validateApiKey = (apiKey: string, provider: string): boolean | string => {
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
  } else if (provider === 'openai') {
    // OpenAI API keys typically start with "sk-" and are longer
    if (!apiKey.startsWith('sk-')) {
      return '❌ OpenAI API key should start with "sk-"';
    }
    if (apiKey.length < 40) {
      return '❌ OpenAI API key seems too short';
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
  console.log(chalk.gray(`   Providers: ${config.providers.length} configured`));
  console.log(chalk.gray(`   Default: ${config.defaultProvider || 'None'}`));
  console.log(chalk.gray(`   Output: ${config.defaultOutput}`));
  console.log(chalk.gray(`   Config: ${configManager.getConfigPath()}`));
  console.log();
  
  console.log(chalk.yellow('🚀 Quick Start Commands:'));
  console.log(chalk.cyan('   devsum report --since 7d          '), chalk.gray('# Last 7 days'));
  console.log(chalk.cyan('   devsum report --since 2025-09-01  '), chalk.gray('# Since specific date'));
  console.log(chalk.cyan('   devsum report --author "John Doe" '), chalk.gray('# Specific author'));
  console.log(chalk.cyan('   devsum report --format json       '), chalk.gray('# JSON output'));
  console.log(chalk.cyan('   devsum report --format html       '), chalk.gray('# HTML presentation'));
  console.log(chalk.cyan('   devsum report --length light      '), chalk.gray('# Brief executive summary'));
  console.log(chalk.cyan('   devsum report --length short      '), chalk.gray('# Quick daily update'));
  console.log(chalk.cyan('   devsum report --length detailed   '), chalk.gray('# Comprehensive analysis'));
  console.log(chalk.cyan('   devsum report --provider <name>   '), chalk.gray('# Use specific AI provider'));
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

const displayProviders = (providers: AIProvider[]) => {
  console.log();
  console.log(chalk.blue('═'.repeat(60)));
  console.log(chalk.cyan.bold('📋 Configured AI Providers'));
  console.log();
  
  if (providers.length === 0) {
    console.log(chalk.gray('   No providers configured yet.'));
  } else {
    providers.forEach((provider, index) => {
      const isDefault = provider.isDefault ? chalk.green(' (DEFAULT)') : '';
      console.log(chalk.white(`   ${index + 1}. ${provider.name}${isDefault}`));
      console.log(chalk.gray(`      Provider: ${provider.provider.toUpperCase()}`));
      console.log(chalk.gray(`      Model: ${provider.model || 'default'}`));
      console.log();
    });
  }
  
  console.log(chalk.blue('═'.repeat(60)));
};

const addProvider = async (): Promise<AIProvider> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '🏷️  Provider name (e.g., "work-gemini", "personal-claude"):',
      validate: (input) => {
        if (!input.trim()) {
          return '❌ Provider name is required';
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return '❌ Provider name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'provider',
      message: '🤖 Choose AI provider type:',
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
          name: chalk.green('🚀 OpenAI (GPT-4)') + chalk.gray(' - Industry leading AI'), 
          value: 'openai' 
        },
      ],
    },
  ]);

  displayProviderInfo(answers.provider);

  const configAnswers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: '🔑 Enter your API key:',
      validate: (input) => validateApiKey(input, answers.provider),
    },
    {
      type: 'input',
      name: 'model',
      message: '⚙️  AI Model (press Enter for default):',
      default: () => {
        if (answers.provider === 'gemini') return 'gemini-2.0-flash';
        if (answers.provider === 'claude') return 'claude-3-5-sonnet-20241022';
        if (answers.provider === 'openai') return 'gpt-4';
        return 'gemini-2.0-flash';
      },
    },
    {
      type: 'confirm',
      name: 'isDefault',
      message: '⭐ Set as default provider?',
      default: false,
    },
  ]);

  return {
    name: answers.name,
    provider: answers.provider,
    apiKey: configAnswers.apiKey,
    model: configAnswers.model,
    isDefault: configAnswers.isDefault,
  };
};

export const setupCommand = new Command('setup')
  .description('Interactive setup for devsum configuration')
  .action(async () => {
    try {
      displayWelcome();

      const existingConfig = await configManager.loadConfig();
      let config: Config;
      let action: string | undefined;
      
      if (existingConfig) {
        console.log(chalk.yellow('⚠️  Configuration Detected'));
        console.log(chalk.gray(`   Found existing config: ${configManager.getConfigPath()}`));
        console.log();
        
        displayProviders(existingConfig.providers);
        
        const actionResult = await inquirer.prompt([
          {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
              { name: '➕ Add new AI provider', value: 'add' },
              { name: '✏️  Edit existing provider', value: 'edit' },
              { name: '🗑️  Remove provider', value: 'remove' },
              { name: '⭐ Set default provider', value: 'default' },
              { name: '🔄 Reset all configuration', value: 'reset' },
              { name: '❌ Cancel', value: 'cancel' },
            ],
          },
        ]);

        action = actionResult.action;

        if (action === 'cancel') {
          console.log();
          console.log(chalk.yellow('⏹️  Setup cancelled by user'));
          return;
        }

        if (action === 'reset') {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: 'Are you sure you want to reset all configuration?',
              default: false,
            },
          ]);
          
          if (!confirm) {
            console.log();
            console.log(chalk.yellow('⏹️  Reset cancelled by user'));
            return;
          }
          
          config = {
            providers: [],
            defaultOutput: './reports',
          };
        } else {
          config = existingConfig;
        }
      } else {
        config = {
          providers: [],
          defaultOutput: './reports',
        };
      }

      // Handle different actions
      if (existingConfig && action === 'add') {
        const newProvider = await addProvider();
        await configManager.addProvider(newProvider);
        const updatedConfig = await configManager.loadConfig();
        if (!updatedConfig) throw new Error('Failed to load updated config');
        config = updatedConfig;
      } else if (existingConfig && action === 'edit') {
        const { providerName } = await inquirer.prompt([
          {
            type: 'list',
            name: 'providerName',
            message: 'Select provider to edit:',
            choices: existingConfig.providers.map(p => ({
              name: `${p.name} (${p.provider})`,
              value: p.name,
            })),
          },
        ]);
        
        const newProvider = await addProvider();
        newProvider.name = providerName; // Keep the same name
        await configManager.addProvider(newProvider);
        const updatedConfig = await configManager.loadConfig();
        if (!updatedConfig) throw new Error('Failed to load updated config');
        config = updatedConfig;
      } else if (existingConfig && action === 'remove') {
        const { providerName } = await inquirer.prompt([
          {
            type: 'list',
            name: 'providerName',
            message: 'Select provider to remove:',
            choices: existingConfig.providers.map(p => ({
              name: `${p.name} (${p.provider})`,
              value: p.name,
            })),
          },
        ]);
        
        await configManager.removeProvider(providerName);
        const updatedConfig = await configManager.loadConfig();
        if (!updatedConfig) throw new Error('Failed to load updated config');
        config = updatedConfig;
      } else if (existingConfig && action === 'default') {
        const { providerName } = await inquirer.prompt([
          {
            type: 'list',
            name: 'providerName',
            message: 'Select default provider:',
            choices: existingConfig.providers.map(p => ({
              name: `${p.name} (${p.provider})`,
              value: p.name,
            })),
          },
        ]);
        
        await configManager.setDefaultProvider(providerName);
        const updatedConfig = await configManager.loadConfig();
        if (!updatedConfig) throw new Error('Failed to load updated config');
        config = updatedConfig;
      } else if (!existingConfig || action === 'reset') {
        // Initial setup or reset
        const { defaultOutput } = await inquirer.prompt([
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
        
        config.defaultOutput = defaultOutput;
        
        // Add first provider
        const firstProvider = await addProvider();
        firstProvider.isDefault = true; // First provider is always default
        config.providers = [firstProvider];
        config.defaultProvider = firstProvider.name;
      }

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