import { Command } from 'commander';
import chalk from 'chalk';
import { getVersion } from '../utils/version.js';
import { usageTracker } from '../core/usage-tracker.js';
import { authManager } from '../core/auth.js';
import { configManager } from '../core/config.js';

/**
 * Login command class following TypeScript guidelines
 * Handles authentication and welcome display
 */
export class LoginCommand {
  private static readonly FREE_FEATURES = [
    '✅ Unlimited local git repository analysis',
    '✅ AI-powered commit summarization',
    '✅ Multiple output formats (Markdown, JSON, HTML)',
    '✅ Customizable date ranges and filters',
    '✅ Support for Gemini and Claude AI',
    '✅ Offline configuration management',
  ];

  private static readonly COMING_SOON = [
    '🚧 Team collaboration features',
    '🚧 Cloud report storage',
    '🚧 Advanced analytics dashboard',
    '🚧 Integration with project management tools',
    '🚧 Custom report templates',
    '🚧 Multi-repository support',
  ];

  /**
   * Execute the login command
   */
  public async execute(options: { logout?: boolean; status?: boolean }): Promise<void> {
    const startTime = Date.now()
    let success = false
    let metadata: any = {}

    try {
      if (options.logout) {
        await this.handleLogout();
        success = true
      } else if (options.status) {
        await this.handleStatus();
        success = true
      } else {
        await this.handleLogin();
        success = true
      }
    } catch (error) {
      success = false
      throw error
    }

    // Track usage after execution
    const duration = Date.now() - startTime
    metadata = {
      duration,
      command: 'login',
      action: options.logout ? 'logout' : options.status ? 'status' : 'login'
    }

    await usageTracker.trackUsage({
      commandType: 'commit', // Use commit as the closest match for login
      userId: await usageTracker.getUserId(),
      success,
      metadata
    })
  }

  /**
   * Display welcome header
   */
  private displayWelcome(): void {
    console.clear();
    console.log(
      chalk.cyan.bold(`
██████╗ ███████╗██╗   ██╗███████╗██╗   ██╗███╗   ███╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║   ██║████╗ ████║
██║  ██║█████╗  ██║   ██║███████╗██║   ██║██╔████╔██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██║   ██║██║╚██╔╝██║
██████╔╝███████╗ ╚████╔╝ ███████║╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝     ╚═╝
`)
    );
    console.log(chalk.gray('                    Git Commit Report Generator'));
    console.log(chalk.gray(`                      Powered by AI • v${getVersion()}`));
    console.log(chalk.blue('═'.repeat(60)));
    console.log();
  }

  /**
   * Display free mode information
   */
  private displayFreeMode(): void {
    console.log(chalk.green.bold('🎉 Welcome to DevSum Free Mode!'));
    console.log(chalk.gray('   No authentication required - start building reports now!'));
    console.log();

    console.log(chalk.blue('═'.repeat(60)));
    console.log(chalk.yellow.bold("📦 What's Included (FREE):"));
    console.log();

    LoginCommand.FREE_FEATURES.forEach(feature => {
      console.log(chalk.gray('   '), feature);
    });

    console.log();
    console.log(chalk.blue('═'.repeat(60)));
  }

  /**
   * Display quick start guide
   */
  private displayQuickStart(): void {
    console.log(chalk.cyan.bold('🚀 Quick Start Guide:'));
    console.log();

    console.log(chalk.yellow('1️⃣  Setup your AI provider:'));
    console.log(chalk.white('   devsum setup'));
    console.log(chalk.gray('   Configure Gemini or Claude API credentials'));
    console.log();

    console.log(chalk.yellow('2️⃣  Generate your first report:'));
    console.log(chalk.white('   devsum report --since 7d'));
    console.log(chalk.gray('   Create a report for the last 7 days'));
    console.log();

    console.log(chalk.yellow('3️⃣  Explore more options:'));
    console.log(chalk.white('   devsum report --help'));
    console.log(chalk.gray('   See all available commands and filters'));
    console.log();
  }

  /**
   * Display example commands
   */
  private displayExampleCommands(): void {
    console.log(chalk.blue('═'.repeat(60)));
    console.log(chalk.cyan.bold('💡 Example Commands:'));
    console.log();

    console.log(
      chalk.white('  devsum report --since 2025-09-01'),
      chalk.gray('  # Reports since date')
    );
    console.log(chalk.white('  devsum report --since 7d'), chalk.gray('          # Last 7 days'));
    console.log(
      chalk.white('  devsum report --author "John"'),
      chalk.gray('      # Filter by author')
    );
    console.log(chalk.white('  devsum report --format json'), chalk.gray('       # JSON output'));
    console.log(
      chalk.white('  devsum report --output ./team'),
      chalk.gray('     # Custom output dir')
    );
    console.log();
  }

  /**
   * Display coming soon features
   */
  private displayComingSoon(): void {
    console.log(chalk.blue('═'.repeat(60)));
    console.log(chalk.magenta.bold('🔮 Coming Soon (Pro Features):'));
    console.log();

    LoginCommand.COMING_SOON.forEach(feature => {
      console.log(chalk.gray('   '), feature);
    });

    console.log();
    console.log(
      chalk.gray('   Stay tuned for updates! '),
      chalk.cyan('http://devsum.rollenasistores.site/')
    );
    console.log();
  }

  /**
   * Handle login flow
   */
  private async handleLogin(): Promise<void> {
    console.clear();
    this.displayWelcome();
    
    // Check if already authenticated
    const isAuthenticated = await authManager.isAuthenticated();
    if (isAuthenticated) {
      console.log(chalk.green('✅ You are already authenticated!'));
      console.log(chalk.gray('   Use "devsum login --logout" to sign out'));
      console.log(chalk.gray('   Use "devsum login --status" to check status'));
      return;
    }

    console.log(chalk.blue('═'.repeat(60)));
    console.log(chalk.cyan.bold('🔐 DevSum Cloud Authentication'));
    console.log();
    console.log(chalk.gray('   Authenticate to use cloud AI features:'));
    console.log(chalk.gray('   • No need to configure API keys'));
    console.log(chalk.gray('   • Access to latest AI models'));
    console.log(chalk.gray('   • Usage tracking and analytics'));
    console.log();

    try {
      console.log(chalk.yellow('🌐 Opening browser for authentication...'));
      const token = await authManager.startOAuthFlow();
      
      // Get user info from token (simplified for now)
      const authConfig = {
        token,
        userId: 'temp-user-id',
        email: 'user@example.com',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        baseUrl: 'https://devsum.vercel.app',
      };

      await configManager.saveAuthConfig(authConfig);
      
      console.log(chalk.green('✅ Authentication successful!'));
      console.log(chalk.gray('   You can now use DevSum with cloud AI features'));
      console.log();
      console.log(chalk.cyan('💡 Next steps:'));
      console.log(chalk.white('   devsum setup --cloud'));
      console.log(chalk.gray('   Configure DevSum to use cloud AI'));
      
    } catch (error) {
      console.log(chalk.red('❌ Authentication failed'));
      console.log(chalk.gray('   Error:'), error instanceof Error ? error.message : 'Unknown error');
      console.log();
      console.log(chalk.yellow('💡 You can still use DevSum with local AI providers:'));
      console.log(chalk.white('   devsum setup'));
      console.log(chalk.gray('   Configure Gemini or Claude API keys locally'));
    }
  }

  /**
   * Handle logout
   */
  private async handleLogout(): Promise<void> {
    console.clear();
    this.displayWelcome();
    
    const isAuthenticated = await authManager.isAuthenticated();
    if (!isAuthenticated) {
      console.log(chalk.yellow('ℹ️  You are not currently authenticated'));
      return;
    }

    await configManager.clearAuthConfig();
    console.log(chalk.green('✅ Successfully logged out'));
    console.log(chalk.gray('   You can still use DevSum with local AI providers'));
  }

  /**
   * Handle status check
   */
  private async handleStatus(): Promise<void> {
    console.clear();
    this.displayWelcome();
    
    const isAuthenticated = await authManager.isAuthenticated();
    if (isAuthenticated) {
      const authConfig = await configManager.loadAuthConfig();
      console.log(chalk.green('✅ Authenticated with DevSum Cloud'));
      console.log(chalk.gray('   Email:'), authConfig?.email || 'Unknown');
      console.log(chalk.gray('   Expires:'), authConfig?.expiresAt ? new Date(authConfig.expiresAt).toLocaleDateString() : 'Unknown');
    } else {
      console.log(chalk.yellow('ℹ️  Not authenticated'));
      console.log(chalk.gray('   Run "devsum login" to authenticate'));
    }
  }

  /**
   * Display footer with next steps
   */
  private displayFooter(): void {
    console.log(chalk.blue('═'.repeat(60)));
    console.log(chalk.green('🎯 Ready to get started? Run:'), chalk.cyan.bold('devsum setup'));
    console.log(chalk.gray('   Need help?'), chalk.cyan('devsum --help'));
    console.log();
    console.log(chalk.yellow('Happy coding! 🚀'));
    console.log(chalk.blue('═'.repeat(60)));
  }
}

// Create command instance
const loginCommandInstance = new LoginCommand();

export const loginCommand = new Command('login')
  .description('Authenticate with DevSum Cloud for AI features')
  .option('--logout', 'Sign out from DevSum Cloud')
  .option('--status', 'Check authentication status')
  .action(async (options) => {
    await loginCommandInstance.execute(options);
  });
