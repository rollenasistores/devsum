import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { configManager } from './config.js';
import { GitService } from './git.js';
import { AIService } from './ai.js';
import { HTMLReportGenerator } from './htmlReportGenerator.js';
import { DisplayService } from './display-service.js';
import { CommitValidator } from './commit-validator.js';
import { ReportOptions, GitCommit, AIProvider } from '../types/index.js';

/**
 * Service responsible for processing report generation
 * Orchestrates the entire report workflow following single responsibility principle
 */
export class ReportProcessor {
  private readonly gitService: GitService;
  private readonly validator: CommitValidator;

  constructor() {
    this.gitService = new GitService();
    this.validator = new CommitValidator();
  }

  /**
   * Process the main report generation workflow
   */
  public async processReport(options: ReportOptions & { 
    noHeader?: boolean; 
    author?: string;
    today?: boolean;
    length?: string;
    light?: boolean;
    short?: boolean;
    detailed?: boolean;
    provider?: string;
    listProviders?: boolean;
  }): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Handle --list-providers option
      if (options.listProviders) {
        await this.handleListProviders();
        return;
      }

      // Handle --today shortcut
      if (options.today) {
        options.since = 'today';
      }

      // Handle length shortcuts
      if (options.light) {
        options.length = 'light';
      } else if (options.short) {
        options.length = 'short';
      } else if (options.detailed) {
        options.length = 'detailed';
      }

      // Validate length parameter
      const lengthError = this.validator.validateReportLength(options.length);
      if (lengthError) {
        console.log();
        console.error(chalk.red('❌ Invalid report length'));
        console.log(chalk.yellow(lengthError));
        this.validator.displayReportLengthHelp();
        process.exit(1);
      }

      if (!options.noHeader) {
        DisplayService.displayReportHeader();
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

      DisplayService.displayProgress(`Using AI provider: ${selectedProvider.name} (${selectedProvider.provider})`, true);

      // Validate git repository
      DisplayService.displayProgress('Checking git repository...');
      const gitError = await this.validator.validateGitRepository();
      if (gitError) {
        console.log();
        console.error(chalk.red('❌ Not a git repository'));
        console.log(chalk.gray(gitError));
        this.displayGitInitHelp();
        process.exit(1);
      }
      DisplayService.displayProgress('Git repository verified', true);

      // Get git commits
      DisplayService.displayProgress('Analyzing commit history...');
      const commits = await this.gitService.getCommits(options.since, options.until, options.author);
            
      if (commits.length === 0) {
        console.log();
        console.log(chalk.yellow('⚠️  No commits found matching your criteria'));
        this.validator.displayNoCommitsHelp({
          since: options.since,
          until: options.until,
          author: options.author
        });
        process.exit(0);
      }

      const branch = await this.gitService.getCurrentBranch();
      DisplayService.displayProgress(`Found ${commits.length} commits`, true);
      
      // Pass filters to display function
      DisplayService.displayCommitStats(commits, branch, {
        since: options.since,
        until: options.until,
        author: options.author
      });

      // Generate AI report
      DisplayService.displayAIProgress(selectedProvider.provider, selectedProvider.model || 'default');
      const aiService = AIService.fromProvider(selectedProvider);
      const reportLength = (options.length as 'light' | 'short' | 'detailed') || 'detailed';
      const report = await aiService.generateReport(commits, reportLength);
      DisplayService.displayProgress('AI analysis complete', true);

      // Prepare output with full timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0];
      const lengthSuffix = reportLength !== 'detailed' ? `-${reportLength}` : '';
      const fileExtension = options.format === 'json' ? 'json' : options.format === 'html' ? 'html' : 'md';
      const defaultName = `report-${timestamp}${lengthSuffix}.${fileExtension}`;
      const outputPath = options.output || path.join(config.defaultOutput, defaultName);
      
      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Generate report content
      DisplayService.displayProgress('Generating report file...');
      let reportContent: string;
      
      if (options.format === 'json') {
        reportContent = this.generateJsonReport(report, commits, {
          since: options.since,
          until: options.until,
          author: options.author,
          branch,
          reportLength
        });
      } else if (options.format === 'html') {
        reportContent = this.generateHtmlReport(report, commits, {
          since: options.since,
          until: options.until,
          author: options.author,
          branch,
          reportLength
        });
      } else {
        reportContent = this.generateMarkdownReport(report, commits, {
          since: options.since,
          until: options.until,
          author: options.author,
          branch,
          reportLength
        });
      }

      // Save report
      await fs.writeFile(outputPath, reportContent);
      DisplayService.displayProgress('Report saved', true);

      const processingTime = (Date.now() - startTime) / 1000;
      DisplayService.displayReportSuccess(outputPath, commits, processingTime, reportLength);

    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;
      console.log(chalk.gray(`\n⏱️  Processing time: ${processingTime.toFixed(2)}s`));
      DisplayService.displayError(error, 'Report generation');
      process.exit(1);
    }
  }

  /**
   * Handle list providers operation
   */
  private async handleListProviders(): Promise<void> {
    const config = await configManager.loadConfig();
    if (!config || config.providers.length === 0) {
      console.log();
      console.log(chalk.yellow('⚠️  No AI providers configured'));
      console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('to configure providers'));
      return;
    }

    console.log();
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan.bold('🤖 Available AI Providers'));
    console.log();
    
    config.providers.forEach((provider, index) => {
      const isDefault = provider.isDefault ? chalk.green(' (DEFAULT)') : '';
      console.log(chalk.white(`   ${index + 1}. ${provider.name}${isDefault}`));
      console.log(chalk.gray(`      Provider: ${provider.provider.toUpperCase()}`));
      console.log(chalk.gray(`      Model: ${provider.model || 'default'}`));
      console.log();
    });
    
    console.log(chalk.blue('═'.repeat(55)));
    console.log(chalk.cyan('💡 Usage: devsum report --provider <name>'));
  }

  /**
   * Generate JSON report
   */
  private generateJsonReport(
    report: any,
    commits: GitCommit[],
    metadata: {
      since?: string;
      until?: string;
      author?: string;
      branch: string;
      reportLength: string;
    }
  ): string {
    return JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        branch: metadata.branch,
        period: metadata.since ? `${metadata.since}${metadata.until ? ` to ${metadata.until}` : ' to present'}` : 'All commits',
        commitsAnalyzed: commits.length,
        author: metadata.author || 'All authors',
        reportLength: metadata.reportLength,
        filters: {
          since: metadata.since,
          until: metadata.until,
          author: metadata.author
        }
      },
      report,
      commits: commits.slice(0, 50) // Limit commits in JSON
    }, null, 2);
  }

  /**
   * Generate HTML report
   */
  private generateHtmlReport(
    report: any,
    commits: GitCommit[],
    metadata: {
      since?: string;
      until?: string;
      author?: string;
      branch: string;
      reportLength: string;
    }
  ): string {
    const htmlGenerator = new HTMLReportGenerator();
    const authors = [...new Set(commits.map(c => c.author))];
    const filesModified = [...new Set(commits.flatMap(c => c.files))].length;
    const dateRange = commits.length > 0 
      ? `${commits[commits.length - 1].date.split('T')[0]} → ${commits[0].date.split('T')[0]}`
      : 'N/A';

    return htmlGenerator.generateReport(report, commits, {
      since: metadata.since,
      until: metadata.until,
      author: metadata.author,
      branch: metadata.branch,
      generatedAt: new Date().toISOString(),
      length: metadata.reportLength,
      commitsAnalyzed: commits.length,
      authors: authors.length,
      filesModified,
      dateRange
    });
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(
    report: any,
    commits: GitCommit[],
    metadata: {
      since?: string;
      until?: string;
      author?: string;
      branch: string;
      reportLength: string;
    }
  ): string {
    const dateRange = metadata.since 
      ? `${metadata.since}${metadata.until ? ` to ${metadata.until}` : ' to present'}`
      : 'All commits';

    const authorFilter = metadata.author ? ` (Author: ${metadata.author})` : '';

    // Enhanced period description with today support
    let periodDescription = dateRange;
    if (metadata.since?.toLowerCase() === 'today') {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
      const todayDate = new Date().toISOString().split('T')[0];
      periodDescription = `Today (${todayDate} 00:00:00 to ${timeStr})`;
      if (metadata.until) {
        periodDescription += ` (until ${metadata.until})`;
      }
    } else if (metadata.until?.toLowerCase() === 'today') {
      const todayDate = new Date().toISOString().split('T')[0];
      periodDescription = dateRange.replace('today', `today (until ${todayDate} 23:59:59)`);
    } else if (metadata.since && metadata.since.match(/^\d+[dwmy]$/)) {
      const unit = metadata.since.slice(-1);
      const num = metadata.since.slice(0, -1);
      const unitName = unit === 'd' ? 'days' : unit === 'w' ? 'weeks' : unit === 'm' ? 'months' : 'years';
      periodDescription = `Last ${num} ${unitName}`;
      if (metadata.until) {
        periodDescription += ` (until ${metadata.until})`;
      }
    }

    const lengthDisplay = metadata.reportLength && metadata.reportLength !== 'detailed' 
      ? `  \n**Report Length:** ${metadata.reportLength.charAt(0).toUpperCase() + metadata.reportLength.slice(1)}` : '';

    return `# 🚀 Development Accomplishment Report

**Generated:** ${new Date().toISOString().split('T')[0]}  
**Branch:** \`${metadata.branch}\`  
**Period:** ${periodDescription}${authorFilter}  
**Commits Analyzed:** ${commits.length}${lengthDisplay}

---

## 📋 Executive Summary

${report.summary}

## 🎯 Key Accomplishments

${report.accomplishments?.map((acc: string) => `- ${acc}`).join('\n') || '- No accomplishments identified'}

${report.technicalImprovements ? `## ⚡ Technical Improvements

${report.technicalImprovements.map((imp: string) => `- ${imp}`).join('\n')}

` : ''}${report.recommendations ? `## 💡 Recommendations

${report.recommendations.map((rec: string) => `- ${rec}`).join('\n')}

` : ''}---

## 📊 Commit Analysis

${commits.slice(0, 15).map(commit => 
  `### 📝 ${commit.message}
**📅 Date:** ${commit.date.split('T')[0]}  
**👤 Author:** ${commit.author}  
**📁 Files:** ${commit.files.slice(0, 5).join(', ')}${commit.files.length > 5 ? ` (+${commit.files.length - 5} more)` : ''}
${commit.insertions || commit.deletions ? `**📈 Changes:** +${commit.insertions || 0} -${commit.deletions || 0}` : ''}

`
).join('')}

${commits.length > 15 ? `📎 *... and ${commits.length - 15} more commits*\n\n` : ''}

---

## 📈 Statistics

- **Total Commits:** ${commits.length}
- **Authors:** ${[...new Set(commits.map(c => c.author))].length}
- **Files Modified:** ${[...new Set(commits.flatMap(c => c.files))].length}
- **Date Range:** ${commits.length > 0 ? `${commits[commits.length - 1].date.split('T')[0]} → ${commits[0].date.split('T')[0]}` : 'N/A'}
${metadata.since || metadata.until || metadata.author ? `
## 🔍 Applied Filters

${metadata.since ? `- **Since:** ${metadata.since.toLowerCase() === 'today' ? `today (${new Date().toISOString().split('T')[0]} 00:00:00 to now)` : metadata.since}` : ''}
${metadata.until ? `- **Until:** ${metadata.until.toLowerCase() === 'today' ? `today (${new Date().toISOString().split('T')[0]} 23:59:59)` : metadata.until}` : ''}
${metadata.author ? `- **Author:** ${metadata.author}` : ''}
` : ''}
---

<div align="center">
  <sub>Generated by <strong>DevSum CLI</strong> 🤖</sub><br>
  <sub>Powered by AI • Making developers productive</sub>
</div>
`;
  }

  /**
   * Display no configuration error
   */
  private displayNoConfigError(): void {
    console.log();
    console.error(chalk.red('❌ No configuration found'));
    console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('first to configure your settings'));
    console.log();
    console.log(chalk.gray('Quick setup:'));
    console.log(chalk.white('  devsum setup  '), chalk.gray('# Interactive configuration'));
  }

  /**
   * Display provider error
   */
  private displayProviderError(providerName?: string, config?: any): void {
    console.log();
    if (providerName) {
      console.error(chalk.red(`❌ Provider '${providerName}' not found`));
      console.log(chalk.blue('💡 Available providers:'));
      config?.providers.forEach((p: AIProvider) => {
        const isDefault = p.isDefault ? chalk.green(' (DEFAULT)') : '';
        console.log(chalk.gray(`   • ${p.name}${isDefault}`));
      });
      console.log();
      console.log(chalk.cyan('💡 Use --list-providers to see all available providers'));
    } else {
      console.error(chalk.red('❌ No AI providers configured'));
      console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('to configure providers'));
    }
  }

  /**
   * Display git init help
   */
  private displayGitInitHelp(): void {
    console.log();
    console.log(chalk.yellow('💡 Initialize a git repo:'));
    console.log(chalk.white('  git init'));
    console.log(chalk.white('  git add .'));
    console.log(chalk.white('  git commit -m "Initial commit"'));
  }
}
