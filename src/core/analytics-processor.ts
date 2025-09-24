import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { configManager } from './config.js';
import { GitService } from './git.js';
import { AIService } from './ai.js';
import { AnalyticsDataService } from './analytics-data-service.js';
import { DashboardGenerator } from './dashboard-generator.js';
import { DisplayService } from './display-service.js';
import { CommitValidator } from './commit-validator.js';
import { AnalyticsOptions, AnalyticsData, AIProvider } from '../types/index.js';

/**
 * Service responsible for processing analytics generation
 * Orchestrates the entire analytics workflow following single responsibility principle
 */
export class AnalyticsProcessor {
  private readonly gitService: GitService;
  private readonly validator: CommitValidator;
  private readonly dataService: AnalyticsDataService;
  private readonly dashboardGenerator: DashboardGenerator;

  constructor() {
    this.gitService = new GitService();
    this.validator = new CommitValidator();
    this.dataService = new AnalyticsDataService();
    this.dashboardGenerator = new DashboardGenerator();
  }

  /**
   * Process the main analytics generation workflow
   */
  public async processAnalytics(
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
  ): Promise<void> {
    try {
      // Handle --today shortcut
      if (options.today) {
        options.since = 'today';
      }

      // Validate focus parameter
      const focusError = this.validator.validateAnalyticsFocus(options.focus);
      if (focusError) {
        console.log();
        console.error(chalk.red('❌ Invalid analytics focus'));
        console.log(chalk.yellow(focusError));
        this.validator.displayAnalyticsFocusHelp();
        process.exit(1);
      }

      if (!options.noHeader) {
        DisplayService.displayAnalyticsHeader();
      }

      // Validate date filters early (before processing)
      const dateError = this.validator.validateDateFilters(options.since, options.until);
      if (dateError) {
        console.log();
        console.error(chalk.red('❌ Invalid date filter'));
        console.log(chalk.yellow(dateError));
        this.validator.displayDateFormatHelp();
        process.exit(1);
      }

      // Load configuration and select provider
      DisplayService.displayProgress('Loading configuration...');
      const config = await configManager.loadConfig();
      if (!config) {
        this.displayNoConfigError();
        process.exit(1);
      }

      // Get the selected provider
      const selectedProvider = await configManager.getProvider(options.provider);
      if (!selectedProvider) {
        this.displayProviderError(options.provider, config);
        process.exit(1);
      }

      DisplayService.displayProgress(
        `Using AI provider: ${selectedProvider.name} (${selectedProvider.provider})`,
        true
      );

      // Validate git repository
      DisplayService.displayProgress('Checking git repository...');
      const gitError = await this.validator.validateGitRepository();
      if (gitError) {
        console.log();
        console.error(chalk.red('❌ Git repository validation failed'));
        console.log(chalk.yellow(gitError));
        process.exit(1);
      }

      // Get git commits
      DisplayService.displayProgress('Analyzing git commits...');
      const commits = await this.gitService.getCommits(
        options.since, // No default - will get entire repo history if undefined
        options.until,
        options.author
      );

      if (commits.length === 0) {
        this.displayNoCommitsError(options);
        process.exit(1);
      }

      DisplayService.displayProgress(`Found ${commits.length} commits to analyze`, true);

      // Generate analytics data
      DisplayService.displayProgress('Generating analytics data...');
      const sinceDate = this.parseDateString(options.since);
      const untilDate = this.parseDateString(options.until);
      const focusArea = options.focus || 'all';
      const analyticsData = await this.dataService.generateAnalyticsData(
        [...commits], // Convert readonly array to mutable array
        focusArea as any,
        sinceDate,
        untilDate,
        selectedProvider.name || 'unknown'
      );

      // Generate output based on format
      const outputPath =
        options.output || this.generateDefaultOutputPath(options.format || 'dashboard');

      switch (options.format) {
        case 'json':
          await this.generateJsonOutput(analyticsData, outputPath);
          break;
        case 'summary':
          await this.generateSummaryOutput(analyticsData, outputPath);
          break;
        case 'dashboard':
        default:
          await this.generateDashboardOutput(analyticsData, outputPath, options);
          break;
      }

      this.displaySuccess(analyticsData, outputPath, options.format || 'dashboard');
    } catch (error) {
      this.displayError(error);
      process.exit(1);
    }
  }

  /**
   * Generate JSON output
   */
  private async generateJsonOutput(
    analyticsData: AnalyticsData,
    outputPath: string
  ): Promise<void> {
    DisplayService.displayProgress('Generating JSON output...');

    const jsonContent = JSON.stringify(analyticsData, null, 2);

    // Ensure the directory exists before writing the file
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(outputPath, jsonContent, 'utf-8');
  }

  /**
   * Generate summary output
   */
  private async generateSummaryOutput(
    analyticsData: AnalyticsData,
    outputPath: string
  ): Promise<void> {
    DisplayService.displayProgress('Generating summary output...');

    const summary = this.generateTextSummary(analyticsData);

    // Ensure the directory exists before writing the file
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(outputPath, summary, 'utf-8');
  }

  /**
   * Generate interactive dashboard output
   */
  private async generateDashboardOutput(
    analyticsData: AnalyticsData,
    outputPath: string,
    options: any
  ): Promise<void> {
    DisplayService.displayProgress('Generating interactive dashboard...');

    const dashboardConfig = {
      theme: options.theme || 'auto',
      charts: this.parseChartsOption(options.charts),
      interactive: options.interactive !== false,
      exportable: true,
      responsive: true,
    };

    const dashboardHtml = await this.dashboardGenerator.generateDashboard(
      analyticsData,
      dashboardConfig
    );

    // Ensure the directory exists before writing the file
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(outputPath, dashboardHtml, 'utf-8');
  }

  /**
   * Generate default output path
   */
  private generateDefaultOutputPath(format: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportsDir = './reports';

    switch (format) {
      case 'json':
        return path.join(reportsDir, `analytics-${timestamp}.json`);
      case 'summary':
        return path.join(reportsDir, `analytics-${timestamp}.txt`);
      case 'dashboard':
      default:
        return path.join(reportsDir, `analytics-dashboard-${timestamp}.html`);
    }
  }

  /**
   * Parse charts option string
   */
  private parseChartsOption(chartsStr?: string): any {
    if (!chartsStr) {
      return {
        commitHeatmap: true,
        productivityTrends: true,
        fileAnalytics: true,
        collaborationMetrics: true,
        qualityIndicators: true,
      };
    }

    const charts = chartsStr.split(',').map(c => c.trim());
    return {
      commitHeatmap: charts.includes('heatmap'),
      productivityTrends: charts.includes('trends'),
      fileAnalytics: charts.includes('files'),
      collaborationMetrics: charts.includes('collab'),
      qualityIndicators: charts.includes('quality'),
    };
  }

  /**
   * Generate text summary
   */
  private generateTextSummary(analyticsData: AnalyticsData): string {
    const { commits, productivity, collaboration, quality } = analyticsData;

    return `
# 📊 Development Analytics Summary

**Period:** ${analyticsData.period.since} to ${analyticsData.period.until} (${analyticsData.period.days === 0 ? 'All time' : `${analyticsData.period.days} days`})
**Repository:** ${analyticsData.repository.name} (${analyticsData.repository.branch})
**Generated:** ${new Date(analyticsData.generatedAt).toLocaleString()}

## 📈 Key Metrics

### Commits
- **Total Commits:** ${commits.totalCommits}
- **Average per Day:** ${commits.averageCommitsPerDay.toFixed(1)}
- **Most Active Day:** ${commits.mostActiveDay}
- **Peak Productivity Time:** ${commits.peakProductivityTime}

### Productivity
- **Productivity Score:** ${productivity.productivityScore}/100
- **Coding Streak:** ${productivity.codingStreak} days
- **Longest Streak:** ${productivity.longestStreak} days
- **Average Commits/Week:** ${productivity.averageCommitsPerWeek.toFixed(1)}

### Collaboration
- **Total Authors:** ${collaboration.totalAuthors}
- **Collaboration Score:** ${collaboration.collaborationScore}/100
- **Most Collaborative Day:** ${collaboration.mostCollaborativeDay}

### Code Quality
- **Quality Score:** ${quality.qualityScore}/100
- **Refactoring Frequency:** ${quality.refactoringFrequency.toFixed(1)}%
- **Bug Fix Percentage:** ${quality.bugFixPercentage.toFixed(1)}%
- **Average Commit Size:** ${quality.averageCommitSize.toFixed(1)} files

## 🎯 Top Contributors
${collaboration.authorActivity
  .slice(0, 5)
  .map(
    author => `- **${author.author}:** ${author.commits} commits (${author.percentage.toFixed(1)}%)`
  )
  .join('\n')}

## 💡 Improvement Suggestions
${quality.improvementSuggestions.map(suggestion => `- ${suggestion}`).join('\n')}

---
*Generated by DevSum Analytics*
`.trim();
  }

  /**
   * Display no configuration error
   */
  private displayNoConfigError(): void {
    console.log();
    console.error(chalk.red('❌ No configuration found'));
    console.log();
    console.log(chalk.yellow('Please run setup first:'));
    console.log(chalk.white('  devsum setup'));
    console.log();
  }

  /**
   * Display provider error
   */
  private displayProviderError(provider: string | undefined, config: any): void {
    console.log();
    console.error(chalk.red('❌ Invalid AI provider'));
    console.log();
    if (provider) {
      console.log(chalk.yellow(`Provider "${provider}" not found in configuration`));
    } else {
      console.log(chalk.yellow('No provider specified and no default provider set'));
    }
    console.log();
    console.log(chalk.white('Available providers:'));
    config.providers.forEach((p: AIProvider) => {
      console.log(chalk.gray(`  - ${p.name} (${p.provider})`));
    });
    console.log();
  }

  /**
   * Display no commits error
   */
  private displayNoCommitsError(options: any): void {
    console.log();
    console.error(chalk.red('❌ No commits found'));
    console.log();
    console.log(chalk.yellow('Try adjusting your date range:'));
    console.log(chalk.white('  devsum analytics --since 30d'));
    console.log(chalk.white('  devsum analytics --since 2025-01-01'));
    console.log();
    if (options.author) {
      console.log(
        chalk.yellow(`Or check if author "${options.author}" has commits in this period`)
      );
    }
    console.log();
  }

  /**
   * Display success message
   */
  private displaySuccess(analyticsData: AnalyticsData, outputPath: string, format: string): void {
    console.log();
    console.log(chalk.green('✅ Analytics generated successfully!'));
    console.log();
    console.log(chalk.blue('📊 Summary:'));
    console.log(
      chalk.white(
        `  • Period: ${analyticsData.period.days === 0 ? 'All time' : `${analyticsData.period.days} days`}`
      )
    );
    console.log(chalk.white(`  • Commits: ${analyticsData.commits.totalCommits}`));
    console.log(chalk.white(`  • Authors: ${analyticsData.collaboration.totalAuthors}`));
    console.log(
      chalk.white(`  • Productivity Score: ${analyticsData.productivity.productivityScore}/100`)
    );
    console.log(chalk.white(`  • Quality Score: ${analyticsData.quality.qualityScore}/100`));
    console.log();
    console.log(chalk.blue('📁 Output:'));
    console.log(chalk.white(`  • Format: ${format.toUpperCase()}`));
    console.log(chalk.white(`  • File: ${outputPath}`));
    console.log();

    if (format === 'dashboard') {
      console.log(chalk.cyan('🌐 Open the dashboard in your browser:'));
      console.log(chalk.white(`  file://${path.resolve(outputPath)}`));
      console.log();
    }
  }

  /**
   * Parse date string (handles relative dates like '7d', '30d', etc.)
   */
  private parseDateString(dateStr: string | undefined): string | undefined {
    // Default values
    if (!dateStr) {
      // Return undefined to indicate we want all commits
      return undefined;
    }

    // Type assertion after null check
    const date: string = dateStr as string;

    // Handle relative dates
    if (date.endsWith('d')) {
      const days = parseInt(date.slice(0, -1));
      if (!isNaN(days)) {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - days);
        // @ts-ignore
        return dateObj.toISOString().split('T')[0];
      }
    }

    // Handle 'today'
    if (date === 'today') {
      // @ts-ignore
      return new Date().toISOString().split('T')[0];
    }

    // Handle 'yesterday'
    if (date === 'yesterday') {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - 1);
      // @ts-ignore
      return dateObj.toISOString().split('T')[0];
    }

    // Handle absolute dates (YYYY-MM-DD format)
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Default to today if parsing fails
    // @ts-ignore
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Display error message
   */
  private displayError(error: unknown): void {
    console.log();
    console.error(chalk.red('❌ Analytics generation failed'));
    console.log();
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
    } else {
      console.error(chalk.red('Unknown error occurred'));
    }
    console.log();
  }
}
