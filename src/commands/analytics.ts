import { Command } from 'commander';
import { AnalyticsProcessor } from '../core/analytics-processor.js';
import { AnalyticsOptions } from '../types/index.js';
import { usageTracker } from '../core/usage-tracker.js';

/**
 * Analytics command class following TypeScript guidelines
 * Handles AI-powered analytics and dashboard generation
 */
export class AnalyticsCommand {
  private readonly processor: AnalyticsProcessor;

  constructor() {
    this.processor = new AnalyticsProcessor();
  }

  /**
   * Execute the analytics command
   */
  public async execute(
    options: AnalyticsOptions & {
      noHeader?: boolean;
      author?: string;
      today?: boolean;
      focus?: string;
      compare?: string;
      interactive?: boolean;
      export?: string;
    }
  ): Promise<void> {
    const startTime = Date.now();
    let success = false;
    let metadata: any = {};

    try {
      await this.processor.processAnalytics(options);
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
      focus: options.focus,
      compare: options.compare,
      interactive: options.interactive,
      export: options.export,
    };

    await usageTracker.trackUsage({
      commandType: 'analyze',
      userId: await usageTracker.getUserId(),
      success,
      metadata,
    });
  }
}

// Create command instance
const analyticsCommandInstance = new AnalyticsCommand();

export const analyticsCommand = new Command('analytics')
  .description('Generate interactive analytics dashboard and insights from git commits')
  .option(
    '-s, --since <date>',
    'Include commits since this date (YYYY-MM-DD, "today", or relative like "7d")'
  )
  .option('-u, --until <date>', 'Include commits until this date (YYYY-MM-DD or "today")')
  .option('-a, --author <name>', 'Filter commits by author name')
  .option('-o, --output <path>', 'Output file path for dashboard')
  .option(
    '-f, --format <format>',
    'Output format (dashboard|json|summary) [default: dashboard]',
    'dashboard'
  )
  .option(
    '--focus <focus>',
    'Focus area (productivity|quality|collaboration|patterns|all) [default: all]',
    'all'
  )
  .option('--compare <period>', 'Compare with previous period (7d|30d|90d|1y) for trend analysis')
  .option('--no-header', 'Skip the fancy header display')
  .option('--today', 'Shortcut for --since today (get commits from today only)')
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option(
    '--interactive',
    'Generate interactive dashboard with hover effects and animations [default: true]',
    true
  )
  .option('--export <format>', 'Export dashboard as (png|pdf|svg|html) for sharing')
  .option('--theme <theme>', 'Dashboard theme (light|dark|auto) [default: auto]', 'auto')
  .option(
    '--charts <charts>',
    'Comma-separated list of charts to include (heatmap,trends,files,collab,quality)'
  )
  .action(
    async (
      options: AnalyticsOptions & {
        noHeader?: boolean;
        author?: string;
        today?: boolean;
        focus?: string;
        compare?: string;
        interactive?: boolean;
        export?: string;
        theme?: string;
        charts?: string;
      }
    ) => {
      await analyticsCommandInstance.execute(options);
    }
  );
