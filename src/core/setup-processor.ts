import { LazyLoader } from './lazy-loader.js';
import chalk from 'chalk';
import { configManager } from './config.js';
import { Config, AIProvider } from '../types/index.js';
import { getVersion } from '../utils/version.js';
import { AIService } from './ai.js';

/**
 * Service responsible for processing setup operations
 * Handles interactive configuration and provider management
 */
export class SetupProcessor {
  private static readonly ASCII_LOGO = `
██████╗ ███████╗██╗   ██╗███████╗██╗   ██╗███╗   ███╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║   ██║████╗ ████║
██║  ██║█████╗  ██║   ██║███████╗██║   ██║██╔████╔██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██║   ██║██║╚██╔╝██║
██████╔╝███████╗ ╚████╔╝ ███████║╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝     ╚═╝
`;

  /**
   * Execute the setup process
   */
  public async execute(): Promise<void> {
    try {
      this.displayWelcome();

      const existingConfig = await configManager.loadConfig();
      let config: Config;
      let action: string | undefined;

      if (existingConfig) {
        this.displayExistingConfig(existingConfig);
        action = await this.getUserAction();

        if (action === 'cancel') {
          console.log();
          console.log(chalk.yellow('⏹️  Setup cancelled by user'));
          return;
        }

        if (action === 'reset') {
          const shouldReset = await this.confirmReset();
          if (!shouldReset) {
            console.log();
            console.log(chalk.yellow('⏹️  Reset cancelled by user'));
            return;
          }
          config = this.createEmptyConfig();
        } else {
          config = existingConfig;
        }
      } else {
        config = this.createEmptyConfig();
      }

      // Handle different actions
      if (existingConfig && action === 'add') {
        await this.handleAddProvider(config);
      } else if (existingConfig && action === 'edit') {
        await this.handleEditProvider(config);
      } else if (existingConfig && action === 'remove') {
        await this.handleRemoveProvider(config);
      } else if (existingConfig && action === 'default') {
        await this.handleSetDefault(config);
      } else if (!existingConfig || action === 'reset') {
        await this.handleInitialSetup(config);
      }

      // Show loading animation
      console.log();
      console.log(chalk.blue('💾 Saving configuration...'));

      await configManager.saveConfig(config);

      this.displaySuccess(config);
    } catch (error) {
      this.displayError(error);
      process.exit(1);
    }
  }

  /**
   * Display welcome message
   */
  private displayWelcome(): void {
    console.clear();
    console.log(chalk.cyan.bold(SetupProcessor.ASCII_LOGO));
    console.log(chalk.gray('                    Git Commit Report Generator'));
    console.log(chalk.gray(`                      Powered by AI • v${getVersion()}`));
    console.log(chalk.blue('═'.repeat(60)));
    console.log();
    console.log(chalk.green('🚀 Welcome to DevSum Interactive Setup!'));
    console.log(chalk.gray("   Let's configure your development reporting tool..."));
    console.log();
  }

  /**
   * Display existing configuration
   */
  private displayExistingConfig(config: Config): void {
    console.log(chalk.yellow('⚠️  Configuration Detected'));
    console.log(chalk.gray(`   Found existing config: ${configManager.getConfigPath()}`));
    console.log();

    this.displayProviders(config.providers);
  }

  /**
   * Display configured providers
   */
  private displayProviders(providers: AIProvider[]): void {
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
  }

  /**
   * Get user action choice
   */
  private async getUserAction(): Promise<string> {
    const inquirer = await LazyLoader.loadInquirer();
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

    return actionResult.action;
  }

  /**
   * Confirm reset action
   */
  private async confirmReset(): Promise<boolean> {
    const inquirer = await LazyLoader.loadInquirer();
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset all configuration?',
        default: false,
      },
    ]);

    return confirm;
  }

  /**
   * Create empty configuration
   */
  private createEmptyConfig(): Config {
    return {
      providers: [],
      defaultOutput: './reports',
    };
  }

  /**
   * Handle add provider action
   */
  private async handleAddProvider(config: Config): Promise<void> {
    const newProvider = await this.addProvider();
    await configManager.addProvider(newProvider);
    const updatedConfig = await configManager.loadConfig();
    if (!updatedConfig) throw new Error('Failed to load updated config');
    Object.assign(config, updatedConfig);
  }

  /**
   * Handle edit provider action
   */
  private async handleEditProvider(config: Config): Promise<void> {
    const inquirer = await LazyLoader.loadInquirer();
    const { providerName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'providerName',
        message: 'Select provider to edit:',
        choices: config.providers.map(p => ({
          name: `${p.name} (${p.provider})`,
          value: p.name,
        })),
      },
    ]);

    const newProvider = await this.addProvider();
    newProvider.name = providerName; // Keep the same name
    await configManager.addProvider(newProvider);
    const updatedConfig = await configManager.loadConfig();
    if (!updatedConfig) throw new Error('Failed to load updated config');
    Object.assign(config, updatedConfig);
  }

  /**
   * Handle remove provider action
   */
  private async handleRemoveProvider(config: Config): Promise<void> {
    const inquirer = await LazyLoader.loadInquirer();
    const { providerName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'providerName',
        message: 'Select provider to remove:',
        choices: config.providers.map(p => ({
          name: `${p.name} (${p.provider})`,
          value: p.name,
        })),
      },
    ]);

    await configManager.removeProvider(providerName);
    const updatedConfig = await configManager.loadConfig();
    if (!updatedConfig) throw new Error('Failed to load updated config');
    Object.assign(config, updatedConfig);
  }

  /**
   * Handle set default provider action
   */
  private async handleSetDefault(config: Config): Promise<void> {
    const inquirer = await LazyLoader.loadInquirer();
    const { providerName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'providerName',
        message: 'Select default provider:',
        choices: config.providers.map(p => ({
          name: `${p.name} (${p.provider})`,
          value: p.name,
        })),
      },
    ]);

    await configManager.setDefaultProvider(providerName);
    const updatedConfig = await configManager.loadConfig();
    if (!updatedConfig) throw new Error('Failed to load updated config');
    Object.assign(config, updatedConfig);
  }

  /**
   * Handle initial setup
   */
  private async handleInitialSetup(config: Config): Promise<void> {
    const inquirer = await LazyLoader.loadInquirer();
    const { defaultOutput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultOutput',
        message: '📁 Default output directory:',
        default: './reports',
        validate: (input: string) => {
          if (!input.trim()) {
            return '❌ Output directory is required';
          }
          return true;
        },
      },
    ]);

    config.defaultOutput = defaultOutput;

    // Add first provider
    const firstProvider = await this.addProvider();
    firstProvider.isDefault = true; // First provider is always default
    config.providers = [firstProvider];
    config.defaultProvider = firstProvider.name;
  }

  /**
   * Add a new provider through interactive prompts
   */
  private async addProvider(): Promise<AIProvider> {
    const inquirer = await LazyLoader.loadInquirer();
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '🏷️  Provider name (e.g., "work-gemini", "personal-claude"):',
        validate: (input: string) => {
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
            value: 'gemini',
          },
          {
            name: chalk.blue('🧠 Claude (Anthropic)') + chalk.gray(' - Advanced reasoning'),
            value: 'claude',
          },
          {
            name: chalk.green('🚀 OpenAI (GPT-4)') + chalk.gray(' - Industry leading AI'),
            value: 'openai',
          },
        ],
      },
    ]);

    this.displayProviderInfo(answers.provider);

    const configAnswers = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: '🔑 Enter your API key:',
        validate: (input: string) => this.validateApiKey(input, answers.provider),
      },
    ]);

    // Fetch available models from the API
    console.log();
    console.log(chalk.blue('🔍 Fetching available models...'));

    const availableModels = await AIService.fetchAvailableModels(
      answers.provider,
      configAnswers.apiKey
    );

    if (availableModels.length === 0) {
      console.log(chalk.yellow('⚠️  Could not fetch models, using defaults'));
    } else {
      console.log(chalk.green(`✅ Found ${availableModels.length} available models`));
    }

    const modelAnswers = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: '⚙️  Choose AI Model:',
        choices:
          availableModels.length > 0
            ? availableModels.map(model => ({
                name: model,
                value: model,
              }))
            : [
                {
                  name: AIService.getDefaultModel(answers.provider) + ' (default)',
                  value: AIService.getDefaultModel(answers.provider),
                },
              ],
        default: AIService.getDefaultModel(answers.provider),
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
      model: modelAnswers.model,
      isDefault: modelAnswers.isDefault,
    };
  }

  /**
   * Display provider information
   */
  private displayProviderInfo(provider: string): void {
    console.log();
    console.log(chalk.blue('═'.repeat(60)));

    if (provider === 'gemini') {
      console.log(chalk.cyan.bold('🤖 Google Gemini Configuration'));
      console.log(chalk.gray('   Fast, efficient AI for code analysis'));
      console.log();
      console.log(chalk.yellow('📋 Setup Requirements:'));
      console.log(chalk.gray('   • API Key: https://aistudio.google.com/app/apikey'));
      console.log(chalk.gray('   • Models: Will fetch available models from your account'));
      console.log(chalk.gray('   • Free tier: 15 requests/minute'));
    } else if (provider === 'claude') {
      console.log(chalk.cyan.bold('🧠 Anthropic Claude Configuration'));
      console.log(chalk.gray('   Advanced reasoning for detailed reports'));
      console.log();
      console.log(chalk.yellow('📋 Setup Requirements:'));
      console.log(chalk.gray('   • API Key: https://console.anthropic.com/'));
      console.log(chalk.gray('   • Models: Will fetch available models from your account'));
      console.log(chalk.gray('   • Usage: Pay-per-use pricing'));
    } else if (provider === 'openai') {
      console.log(chalk.green.bold('🚀 OpenAI GPT Configuration'));
      console.log(chalk.gray('   Industry-leading AI with GPT-4 support'));
      console.log();
      console.log(chalk.yellow('📋 Setup Requirements:'));
      console.log(chalk.gray('   • API Key: https://platform.openai.com/api-keys'));
      console.log(chalk.gray('   • Models: Will fetch available models from your account'));
      console.log(chalk.gray('   • Usage: Pay-per-use pricing'));
    }
    console.log();
  }

  /**
   * Validate API key
   */
  private validateApiKey(apiKey: string, provider: string): boolean | string {
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
  }

  /**
   * Display success message
   */
  private displaySuccess(config: Config): void {
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
    console.log(
      chalk.cyan('   devsum report --since 2025-09-01  '),
      chalk.gray('# Since specific date')
    );
    console.log(
      chalk.cyan('   devsum report --author "John Doe" '),
      chalk.gray('# Specific author')
    );
    console.log(chalk.cyan('   devsum report --format json       '), chalk.gray('# JSON output'));
    console.log(
      chalk.cyan('   devsum report --format html       '),
      chalk.gray('# HTML presentation')
    );
    console.log(
      chalk.cyan('   devsum report --length light      '),
      chalk.gray('# Brief executive summary')
    );
    console.log(
      chalk.cyan('   devsum report --length short      '),
      chalk.gray('# Quick daily update')
    );
    console.log(
      chalk.cyan('   devsum report --length detailed   '),
      chalk.gray('# Comprehensive analysis')
    );
    console.log(
      chalk.cyan('   devsum report --provider <name>   '),
      chalk.gray('# Use specific AI provider')
    );
    console.log();

    console.log(chalk.green("🎉 You're all set! Happy coding!"));
    console.log(chalk.blue('═'.repeat(60)));
  }

  /**
   * Display error message
   */
  private displayError(error: unknown): void {
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
  }
}
