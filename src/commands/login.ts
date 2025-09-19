import { Command } from 'commander';
import chalk from 'chalk';
import { getVersion } from '../utils/version.js';

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
  public async execute(): Promise<void> {
    this.displayWelcome();
    this.displayFreeMode();
    this.displayQuickStart();
    this.displayExampleCommands();
    this.displayComingSoon();
    this.displayFooter();
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
      chalk.cyan('https://github.com/rollenasistores/devsum')
    );
    console.log();
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
  .description('Authenticate with DevSum (currently in free mode)')
  .action(async () => {
    await loginCommandInstance.execute();
  });
