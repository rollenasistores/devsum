import { Command } from 'commander';
import { ReportProcessor } from '../core/report-processor.js';
import { ReportOptions } from '../types/index.js';
import { usageTracker } from '../core/usage-tracker.js';

/**
 * Report command class following TypeScript guidelines
 * Handles AI-powered report generation
 */
export class ReportCommand {
  private readonly processor: ReportProcessor;

  constructor() {
    this.processor = new ReportProcessor();
  }

  /**
   * Execute the report command
   */
  public async execute(
    options: ReportOptions & {
      noHeader?: boolean;
      author?: string;
      today?: boolean;
      length?: string;
      light?: boolean;
      short?: boolean;
      detailed?: boolean;
      provider?: string;
      listProviders?: boolean;
      listModels?: boolean;
    }
  ): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let metadata: any = {};

    try {
      await this.processor.processReport(options);
      success = true;
    } catch (error) {
      success = false;
      throw error;
    }

    // Track usage after execution
    const duration = Date.now() - startTime;
    metadata = {
      duration,
      provider: options.provider,
      format: options.format,
      length: options.length,
      since: options.since,
      until: options.until,
    };

    await usageTracker.trackUsage({
      commandType: 'report',
      userId: await usageTracker.getUserId(),
      success,
      metadata,
    });
  }
}

// Create command instance
const reportCommandInstance = new ReportCommand();

export const reportCommand = new Command('report')
  .description('Generate accomplishment report from git commits')
  .option(
    '-s, --since <date>',
    'Include commits since this date (YYYY-MM-DD, "today", or relative like "7d")'
  )
  .option('-u, --until <date>', 'Include commits until this date (YYYY-MM-DD or "today")')
  .option('-a, --author <name>', 'Filter commits by author name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (markdown|json|html|txt)', 'markdown')
  .option('-l, --length <length>', 'Report length (light|short|detailed)', 'detailed')
  .option('--light', 'Shortcut for --length light (brief executive summary)')
  .option('--short', 'Shortcut for --length short (quick daily update)')
  .option('--detailed', 'Shortcut for --length detailed (comprehensive analysis)')
  .option('--no-header', 'Skip the fancy header display')
  .option('--today', 'Shortcut for --since today (get commits from today only)')
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option('--list-providers', 'List available AI providers and exit')
  .option('--list-models', 'List available models for configured providers and exit')
  .action(
    async (
      options: ReportOptions & {
        noHeader?: boolean;
        author?: string;
        today?: boolean;
        length?: string;
        light?: boolean;
        short?: boolean;
        detailed?: boolean;
        provider?: string;
        listProviders?: boolean;
        listModels?: boolean;
      }
    ) => {
      await reportCommandInstance.execute(options);
    }
  );
