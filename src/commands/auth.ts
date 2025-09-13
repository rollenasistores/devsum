import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { DevSumApiService } from '../core/api.js';
import { Config } from '../types/index.js';

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
    console.log(chalk.gray('                    DevSum API Authentication'));
    console.log(chalk.blue('═'.repeat(60)));
    console.log();
};

const displaySuccess = (message: string) => {
    console.log(chalk.green.bold('✅'), message);
    console.log();
};

const displayError = (message: string) => {
    console.log(chalk.red.bold('❌'), message);
    console.log();
};

const promptForCredentials = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter your full name:',
            validate: (input: string) => input.trim().length > 0 || 'Name is required',
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email address:',
            validate: (input: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(input) || 'Please enter a valid email address';
            },
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password (min 8 characters):',
            validate: (input: string) => input.length >= 8 || 'Password must be at least 8 characters',
        },
    ]);

    return answers;
};

const promptForLogin = async () => {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'email',
            message: 'Enter your email address:',
            validate: (input: string) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(input) || 'Please enter a valid email address';
            },
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter your password:',
            validate: (input: string) => input.length > 0 || 'Password is required',
        },
    ]);

    return answers;
};

// Default API URL - no need to prompt user
const DEFAULT_API_URL = 'https://api-devsum.rollenasistores.site/api';

export const authCommand = new Command('auth')
    .description('Setup and authenticate with DevSum API')
    .option('-r, --register', 'Register a new account')
    .option('-l, --login', 'Login to existing account')
    .option('-u, --url <url>', 'DevSum API URL')
    .option('--dev', 'Use development server (localhost)')
    .option('--logout', 'Logout and remove stored credentials')
    .action(async (options) => {
        displayWelcome();

        try {
            let currentConfig = await configManager.loadConfig();

            // If no config exists, create initial DevSum API config
            if (!currentConfig) {
                console.log(chalk.cyan('🔧 Setting up DevSum API configuration...'));
                console.log();

                const { defaultOutput, aiProvider } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'defaultOutput',
                        message: '📁 Default output directory for reports:',
                        default: './reports',
                        validate: (input) => {
                            if (!input.trim()) {
                                return '❌ Output directory is required';
                            }
                            return true;
                        },
                    },
                    {
                        type: 'list',
                        name: 'aiProvider',
                        message: '🤖 Select AI provider for report generation:',
                        choices: [
                            { name: 'Gemini (Google) - Currently Available', value: 'gemini' },
                            { name: 'Claude (Anthropic) - Coming Soon', value: 'coming-soon' },
                            { name: 'GPT-4 (OpenAI) - Coming Soon', value: 'coming-soon' },
                        ],
                        default: 'gemini',
                    },
                ]);

                // Create initial config
                currentConfig = {
                    provider: 'devsum-api',
                    apiKey: '',
                    defaultOutput,
                    model: 'devsum-gemini',
                    devsumApiUrl: DEFAULT_API_URL,
                    devsumToken: '',
                    aiProvider: aiProvider === 'coming-soon' ? 'gemini' : aiProvider
                };

                await configManager.saveConfig(currentConfig);
                console.log(chalk.green('✅ Configuration saved!'));

                if (aiProvider === 'coming-soon') {
                    console.log(chalk.yellow('🚧 Note: Additional AI providers are coming soon!'));
                    console.log(chalk.gray('   Currently using Gemini for all report generation.'));
                } else {
                    console.log(chalk.blue(`🤖 AI Provider: ${aiProvider.toUpperCase()}`));
                }
                console.log();
            }

            // Handle development server option
            let apiUrl = options.url || (currentConfig?.devsumApiUrl) || DEFAULT_API_URL;
            if (options.dev) {
                apiUrl = 'http://localhost:8000/api';
                console.log(chalk.yellow('🔧 Development mode: Using localhost server'));
                console.log();
            }

            if (options.logout) {
                if (currentConfig && currentConfig.provider === 'devsum-api') {
                    // Try to logout from API if token exists
                    if (currentConfig.devsumToken) {
                        try {
                            const apiService = new DevSumApiService(currentConfig);
                            await apiService.logout();
                            displaySuccess('Logged out from DevSum API');
                        } catch (error) {
                            console.log(chalk.yellow('⚠️  Could not logout from API (token may already be invalid)'));
                        }
                    }

                    // Remove DevSum API configuration
                    const newConfig: Config = {
                        provider: 'devsum-api', // Reset to default provider
                        apiKey: '',
                        defaultOutput: currentConfig.defaultOutput || './reports',
                    };
                    await configManager.saveConfig(newConfig);
                    displaySuccess('DevSum API credentials removed from local configuration');
                } else {
                    displayError('No DevSum API credentials found to logout');
                }
                return;
            }

            // Create temporary config for API service
            const tempConfig: Config = {
                provider: 'devsum-api',
                apiKey: '',
                defaultOutput: './reports',
                devsumApiUrl: apiUrl,
                devsumToken: '',
            };

            const apiService = new DevSumApiService(tempConfig);

            if (options.register) {
                console.log(chalk.cyan('📝 Registering new DevSum API account...'));
                console.log();

                const credentials = await promptForCredentials();

                const response = await apiService.register(
                    credentials.name,
                    credentials.email,
                    credentials.password
                );

                if (response.success && response.token) {
                    displaySuccess('Account created successfully!');

                    // Update configuration with token
                    const config: Config = {
                        ...currentConfig,
                        apiKey: response.token,
                        devsumToken: response.token,
                    };

                    await configManager.saveConfig(config);
                    displaySuccess('Authentication complete! You can now generate reports.');

                    console.log(chalk.blue('💡 Next steps:'));
                    console.log(chalk.gray('  • Run: devsum report --since 7d'));
                    console.log(chalk.gray('  • Try: devsum report --short or --light'));
                    console.log(chalk.gray('  • Use: devsum report --ai claude (coming soon)'));
                    console.log(chalk.gray('  • Generate professional reports from your git commits'));
                }
            } else if (options.login) {
                console.log(chalk.cyan('🔐 Logging into DevSum API...'));
                console.log();

                const credentials = await promptForLogin();

                const response = await apiService.login(
                    credentials.email,
                    credentials.password
                );

                if (response.success && response.token) {
                    displaySuccess('Login successful!');

                    // Update configuration with token
                    const config: Config = {
                        ...currentConfig,
                        apiKey: response.token,
                        devsumToken: response.token,
                    };

                    await configManager.saveConfig(config);
                    displaySuccess('Authentication complete! You can now generate reports.');

                    console.log(chalk.blue('💡 Next steps:'));
                    console.log(chalk.gray('  • Run: devsum report --since 7d'));
                    console.log(chalk.gray('  • Try: devsum report --short or --light'));
                    console.log(chalk.gray('  • Use: devsum report --ai claude (coming soon)'));
                    console.log(chalk.gray('  • Generate professional reports from your git commits'));
                }
            } else {
                // Interactive mode - ask user what they want to do
                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: 'What would you like to do?',
                        choices: [
                            { name: 'Register new account', value: 'register' },
                            { name: 'Login to existing account', value: 'login' },
                            { name: 'Logout and remove credentials', value: 'logout' },
                        ],
                    },
                ]);

                if (action === 'register') {
                    console.log(chalk.cyan('📝 Registering new DevSum API account...'));
                    console.log();

                    const credentials = await promptForCredentials();

                    const response = await apiService.register(
                        credentials.name,
                        credentials.email,
                        credentials.password
                    );

                    if (response.success && response.token) {
                        displaySuccess('Account created successfully!');

                        const config: Config = {
                            ...currentConfig,
                            apiKey: response.token,
                            devsumToken: response.token,
                        };

                        await configManager.saveConfig(config);
                        displaySuccess('Authentication complete! You can now generate reports.');
                    }
                } else if (action === 'login') {
                    console.log(chalk.cyan('🔐 Logging into DevSum API...'));
                    console.log();

                    const credentials = await promptForLogin();

                    const response = await apiService.login(
                        credentials.email,
                        credentials.password
                    );

                    if (response.success && response.token) {
                        displaySuccess('Login successful!');

                        const config: Config = {
                            ...currentConfig,
                            apiKey: response.token,
                            devsumToken: response.token,
                        };

                        await configManager.saveConfig(config);
                        displaySuccess('Authentication complete! You can now generate reports.');
                    }
                } else if (action === 'logout') {
                    if (currentConfig && currentConfig.provider === 'devsum-api') {
                        if (currentConfig.devsumToken) {
                            try {
                                const apiService = new DevSumApiService(currentConfig);
                                await apiService.logout();
                                displaySuccess('Logged out from DevSum API');
                            } catch (error) {
                                console.log(chalk.yellow('⚠️  Could not logout from API (token may already be invalid)'));
                            }
                        }

                        const newConfig: Config = {
                            provider: 'devsum-api',
                            apiKey: '',
                            defaultOutput: currentConfig.defaultOutput || './reports',
                        };
                        await configManager.saveConfig(newConfig);
                        displaySuccess('DevSum API credentials removed from local configuration');
                    } else {
                        displayError('No DevSum API credentials found to logout');
                    }
                }
            }

        } catch (error) {
            displayError(error instanceof Error ? error.message : 'An unexpected error occurred');
            process.exit(1);
        }
    });
