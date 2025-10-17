import { Command } from 'commander';
import { reportCommand } from './report.js';

/**
 * Analyze command - alias for report command to match website documentation
 * This provides the 'devsum analyze' command that's shown on the website
 */
export const analyzeCommand = new Command('analyze')
  .description('Analyze git commits and generate a summary report')
  .option(
    '-s, --since <date>',
    'Include commits since this date (YYYY-MM-DD, "today", or relative like "7d")'
  )
  .option('-u, --until <date>', 'Include commits until this date (YYYY-MM-DD or "today")')
  .option('-a, --author <name>', 'Filter commits by author name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (markdown|json|html|pdf)', 'markdown')
  .option('-l, --length <length>', 'Report length (light|short|detailed)', 'detailed')
  .option('--light', 'Shortcut for --length light (brief executive summary)')
  .option('--short', 'Shortcut for --length short (quick daily update)')
  .option('--detailed', 'Shortcut for --length detailed (comprehensive analysis)')
  .option('--no-header', 'Skip the fancy header display')
  .option('--today', 'Shortcut for --since today (get commits from today only)')
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option('--list-providers', 'List available AI providers and exit')
  .option('--list-models', 'List available models for configured providers and exit')
  .action(async (options) => {
    // Import and execute the report command with the same options
    const { ReportCommand } = await import('./report.js');
    const reportCommandInstance = new ReportCommand();
    await reportCommandInstance.execute(options);
  });
