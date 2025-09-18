import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { GitService } from '../core/git.js';
import { AIService } from '../core/ai.js';
import { HTMLReportGenerator } from '../core/htmlReportGenerator.js';
import { ReportOptions } from '../types/index.js';

const REPORT_ICON = `
 ██████╗ ███████╗██████╗  ██████╗ ██████╗ ████████╗
 ██╔══██╗██╔════╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
 ██████╔╝█████╗  ██████╔╝██║   ██║██████╔╝   ██║   
 ██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║██╔══██╗   ██║   
 ██║  ██║███████╗██║     ╚██████╔╝██║  ██║   ██║   
 ╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
`;

const displayHeader = () => {
  console.clear();
  console.log(chalk.yellow.bold(REPORT_ICON));
  console.log(chalk.gray('          AI-Powered Git Accomplishment Reports'));
  console.log(chalk.blue('═'.repeat(55)));
  console.log();
};

const displayProgress = (step: string, isComplete: boolean = false) => {
  const icon = isComplete ? '✅' : '⏳';
  const color = isComplete ? chalk.green : chalk.blue;
  console.log(color(`${icon} ${step}`));
};

const displayCommitStats = (commits: any[], branch: string, filters?: {
  since?: string;
  until?: string;
  author?: string;
}) => {
  console.log();
  console.log(chalk.blue('═'.repeat(55)));
  console.log(chalk.cyan.bold('📊 Repository Analysis'));
  console.log();
  console.log(chalk.white(`🌿 Branch: ${chalk.yellow(branch)}`));
  console.log(chalk.white(`📝 Commits: ${chalk.green(commits.length)}`));
  
  // Show applied filters
  if (filters?.since || filters?.until || filters?.author) {
    console.log();
    console.log(chalk.yellow('🔍 Applied Filters:'));
    if (filters.since) {
      // Enhanced display for today filter
      const displaySince = filters.since.toLowerCase() === 'today' 
        ? `today (${new Date().toISOString().split('T')[0]} 00:00:00 to now)` 
        : filters.since;
      console.log(chalk.gray(`   📅 Since: ${displaySince}`));
    }
    if (filters.until) {
      const displayUntil = filters.until.toLowerCase() === 'today'
        ? `today (${new Date().toISOString().split('T')[0]} 23:59:59)`
        : filters.until;
      console.log(chalk.gray(`   📅 Until: ${displayUntil}`));
    }
    if (filters.author) {
      console.log(chalk.gray(`   👤 Author: ${filters.author}`));
    }
  }
  
  // Calculate stats
  const authors = [...new Set(commits.map(c => c.author))];
  
  // Show today's date range when using 'today'
  let dateRange = null;
  if (commits.length > 0) {
    if (filters?.since?.toLowerCase() === 'today') {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 8); // HH:MM:SS format
      dateRange = {
        oldest: `${today} 00:00:00`,
        newest: `${today} ${timeStr}`
      };
    } else {
      dateRange = {
        oldest: commits[commits.length - 1].date.split('T')[0],
        newest: commits[0].date.split('T')[0]
      };
    }
  }
  
  console.log();
  console.log(chalk.white(`👥 Authors: ${chalk.cyan(authors.length)}`));
  if (dateRange) {
    console.log(chalk.white(`📅 Period: ${chalk.gray(dateRange.oldest)} → ${chalk.gray(dateRange.newest)}`));
  }
  
  // Show top contributors
  if (authors.length > 1) {
    const authorCounts = commits.reduce((acc: any, commit) => {
      acc[commit.author] = (acc[commit.author] || 0) + 1;
      return acc;
    }, {});
    
    const topAuthors = Object.entries(authorCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    console.log();
    console.log(chalk.yellow('🏆 Top Contributors:'));
    topAuthors.forEach(([author, count], index) => {
      const medal = ['🥇', '🥈', '🥉'][index] || '👤';
      console.log(chalk.gray(`   ${medal} ${author}: ${count} commits`));
    });
  }
  
  console.log();
  console.log(chalk.blue('═'.repeat(55)));
};

const displayAIProgress = (provider: string, model: string) => {
  console.log();
  console.log(chalk.magenta.bold('🤖 AI Analysis in Progress...'));
  console.log(chalk.gray(`   Provider: ${provider.toUpperCase()}`));
  console.log(chalk.gray(`   Model: ${model}`));
  console.log(chalk.gray(`   Analyzing commit patterns and generating insights...`));
  console.log();
};

const displaySuccess = (outputPath: string, commits: any[], processingTime: number, reportLength?: string) => {
  console.log();
  console.log(chalk.green('═'.repeat(55)));
  console.log(chalk.green.bold('🎉 Report Generated Successfully!'));
  console.log();
  console.log(chalk.blue('📄 Report Details:'));
  console.log(chalk.gray(`   Location: ${outputPath}`));
  console.log(chalk.gray(`   Size: ${commits.length} commits analyzed`));
  console.log(chalk.gray(`   Length: ${reportLength || 'detailed'}`));
  console.log(chalk.gray(`   Processing time: ${processingTime.toFixed(2)}s`));
  console.log();
  
  console.log(chalk.yellow('📖 What\'s in your report:'));
  console.log(chalk.gray('   ✅ Executive summary of accomplishments'));
  console.log(chalk.gray('   ✅ Key achievements and milestones'));
  console.log(chalk.gray('   ✅ Technical improvements identified'));
  console.log(chalk.gray('   ✅ Detailed commit analysis'));
  console.log(chalk.gray('   ✅ Actionable recommendations'));
  console.log();
  
  console.log(chalk.cyan('💡 Next Steps:'));
  console.log(chalk.white(`   cat "${outputPath}"              `), chalk.gray('# View report'));
  console.log(chalk.white(`   code "${outputPath}"             `), chalk.gray('# Edit in VS Code'));
  console.log(chalk.white(`   devsum report --format json      `), chalk.gray('# Generate JSON'));
  console.log(chalk.white(`   devsum report --format html      `), chalk.gray('# Generate HTML'));
  console.log();
  console.log(chalk.green('🚀 Great work! Share your accomplishments with the team!'));
  console.log(chalk.green('═'.repeat(55)));
};

const displayError = (error: unknown, context: string) => {
  console.log();
  console.log(chalk.red('═'.repeat(55)));
  console.log(chalk.red.bold('❌ Report Generation Failed'));
  console.log();
  console.log(chalk.red('Context:'), context);
  console.log(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
  console.log();
  
  console.log(chalk.yellow('🔧 Troubleshooting:'));
  console.log(chalk.gray('   • Ensure you\'re in a git repository'));
  console.log(chalk.gray('   • Check your API key configuration'));
  console.log(chalk.gray('   • Verify internet connectivity'));
  console.log(chalk.gray('   • Run "devsum setup" to reconfigure'));
  console.log(chalk.gray('   • Check date format (YYYY-MM-DD, today, or 7d, 2w, 1m)'));
  console.log();
  console.log(chalk.blue('For help: https://github.com/rollenasistores/devsum/issues'));
  console.log(chalk.red('═'.repeat(55)));
};

// Enhanced validation helper with today support
const validateDateFilters = (since?: string, until?: string): string | null => {
  const gitService = new GitService();
  
  // Handle 'today' keyword - it's always valid
  if (since?.toLowerCase() === 'today' || until?.toLowerCase() === 'today') {
    // 'today' is always valid, no need to validate further for this case
  }
  
  if (since && !gitService.isValidDate(since)) {
    return `Invalid --since date: "${since}". Use formats like: today, 7d, 2w, 1m, or YYYY-MM-DD`;
  }
  
  if (until && !gitService.isValidDate(until)) {
    return `Invalid --until date: "${until}". Use format: YYYY-MM-DD or today`;
  }
  
  // Check logical date order for absolute dates (skip if since/until is 'today')
  if (since && since.toLowerCase() !== 'today' && until && until.toLowerCase() !== 'today') {
    const sinceDate = new Date(since);
    const untilDate = new Date(until);
    
    if (!isNaN(sinceDate.getTime()) && !isNaN(untilDate.getTime()) && sinceDate > untilDate) {
      return `--since date (${since}) cannot be after --until date (${until})`;
    }
  }
  
  // Check if 'today' with until makes sense
  if (since?.toLowerCase() === 'today' && until && until.toLowerCase() !== 'today') {
    const today = new Date().toISOString().split('T')[0];
    const untilDate = new Date(until);
    
    if (!isNaN(untilDate.getTime()) && until < today) {
      return `--until date (${until}) cannot be before today when using --since today`;
    }
  }
  
  return null;
};

export const reportCommand = new Command('report')
  .description('Generate accomplishment report from git commits')
  .option('-s, --since <date>', 'Include commits since this date (YYYY-MM-DD, "today", or relative like "7d")')
  .option('-u, --until <date>', 'Include commits until this date (YYYY-MM-DD or "today")')
  .option('-a, --author <name>', 'Filter commits by author name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (markdown|json|html)', 'markdown')
  .option('-l, --length <length>', 'Report length (light|short|detailed)', 'detailed')
  .option('--light', 'Shortcut for --length light (brief executive summary)')
  .option('--short', 'Shortcut for --length short (quick daily update)')
  .option('--detailed', 'Shortcut for --length detailed (comprehensive analysis)')
  .option('--no-header', 'Skip the fancy header display')
  .option('--today', 'Shortcut for --since today (get commits from today only)')
  .option('-p, --provider <name>', 'Use specific AI provider by name')
  .option('--list-providers', 'List available AI providers and exit')
  .action(async (options: ReportOptions & { 
    noHeader?: boolean; 
    author?: string;
    today?: boolean;
    length?: string;
    light?: boolean;
    short?: boolean;
    detailed?: boolean;
    provider?: string;
    listProviders?: boolean;
  }) => {
    const startTime = Date.now();
    
    try {
      // Handle --list-providers option
      if (options.listProviders) {
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
      const validLengths = ['light', 'short', 'detailed'];
      if (options.length && !validLengths.includes(options.length)) {
        console.log();
        console.error(chalk.red('❌ Invalid report length'));
        console.log(chalk.yellow(`Valid options: ${validLengths.join(', ')}`));
        console.log();
        console.log(chalk.blue('💡 Report length options:'));
        console.log(chalk.white('   --length light     '), chalk.gray('# Brief executive summary (3-5 accomplishments)'));
        console.log(chalk.white('   --length short     '), chalk.gray('# Quick daily/weekly update (5-8 accomplishments)'));
        console.log(chalk.white('   --length detailed  '), chalk.gray('# Comprehensive analysis (8-15 accomplishments)'));
        console.log();
        console.log(chalk.blue('💡 Shortcut options:'));
        console.log(chalk.white('   --light            '), chalk.gray('# Same as --length light'));
        console.log(chalk.white('   --short            '), chalk.gray('# Same as --length short'));
        console.log(chalk.white('   --detailed         '), chalk.gray('# Same as --length detailed'));
        process.exit(1);
      }

      if (!options.noHeader) {
        displayHeader();
      }

      // Validate date filters early (before processing)
      const dateError = validateDateFilters(options.since, options.until);
      if (dateError) {
        console.log();
        console.error(chalk.red('❌ Invalid date filter'));
        console.log(chalk.yellow(dateError));
        console.log();
        console.log(chalk.blue('💡 Valid date formats:'));
        console.log(chalk.white('   --since today           '), chalk.gray('# All commits from today (00:00 to now)'));
        console.log(chalk.white('   --today                 '), chalk.gray('# Shortcut for --since today'));
        console.log(chalk.white('   --since 7d              '), chalk.gray('# Last 7 days'));
        console.log(chalk.white('   --since 2w              '), chalk.gray('# Last 2 weeks'));
        console.log(chalk.white('   --since 1m              '), chalk.gray('# Last 1 month'));
        console.log(chalk.white('   --since 2024-01-01      '), chalk.gray('# Since specific date'));
        console.log(chalk.white('   --until 2024-12-31      '), chalk.gray('# Until specific date'));
        console.log(chalk.white('   --until today           '), chalk.gray('# Until end of today'));
        process.exit(1);
      }

      // Load configuration and select provider
      displayProgress('Loading configuration...');
      const config = await configManager.loadConfig();
      if (!config) {
        console.log();
        console.error(chalk.red('❌ No configuration found'));
        console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('first to configure your settings'));
        console.log();
        console.log(chalk.gray('Quick setup:'));
        console.log(chalk.white('  devsum setup  '), chalk.gray('# Interactive configuration'));
        process.exit(1);
      }

      // Get the selected provider
      const selectedProvider = await configManager.getProvider(options.provider);
      if (!selectedProvider) {
        console.log();
        if (options.provider) {
          console.error(chalk.red(`❌ Provider '${options.provider}' not found`));
          console.log(chalk.blue('💡 Available providers:'));
          config.providers.forEach(p => {
            const isDefault = p.isDefault ? chalk.green(' (DEFAULT)') : '';
            console.log(chalk.gray(`   • ${p.name}${isDefault}`));
          });
          console.log();
          console.log(chalk.cyan('💡 Use --list-providers to see all available providers'));
        } else {
          console.error(chalk.red('❌ No AI providers configured'));
          console.log(chalk.blue('💡 Run'), chalk.cyan('"devsum setup"'), chalk.blue('to configure providers'));
        }
        process.exit(1);
      }

      displayProgress(`Using AI provider: ${selectedProvider.name} (${selectedProvider.provider})`, true);

      // Validate git repository
      displayProgress('Checking git repository...');
      const gitService = new GitService();
      const isGitRepo = await gitService.isGitRepository();
      if (!isGitRepo) {
        console.log();
        console.error(chalk.red('❌ Not a git repository'));
        console.log(chalk.gray('Please run this command from within a git repository'));
        console.log();
        console.log(chalk.yellow('💡 Initialize a git repo:'));
        console.log(chalk.white('  git init'));
        console.log(chalk.white('  git add .'));
        console.log(chalk.white('  git commit -m "Initial commit"'));
        process.exit(1);
      }
      displayProgress('Git repository verified', true);

      // Get git commits - GitService now handles 'today' processing internally
      displayProgress('Analyzing commit history...');
      const commits = await gitService.getCommits(options.since, options.until, options.author);
            
      if (commits.length === 0) {
        console.log();
        console.log(chalk.yellow('⚠️  No commits found matching your criteria'));
        console.log();
        console.log(chalk.blue('💡 Try adjusting your filters:'));
        console.log(chalk.white('  devsum report --today            '), chalk.gray('# All commits from today only'));
        console.log(chalk.white('  devsum report --since today      '), chalk.gray('# All commits from today (00:00 to now)'));
        console.log(chalk.white('  devsum report --since 30d        '), chalk.gray('# Last 30 days'));
        console.log(chalk.white('  devsum report --since 2025-01-01 '), chalk.gray('# Since specific date'));
        console.log(chalk.white('  devsum report                    '), chalk.gray('# All commits'));
        
        // Show current filters for debugging
        if (options.since || options.until || options.author) {
          console.log();
          console.log(chalk.gray('Current filters applied:'));
          if (options.since) {
            const displaySince = options.since.toLowerCase() === 'today' 
              ? `today (${new Date().toISOString().split('T')[0]} 00:00:00 to now)`
              : options.since;
            console.log(chalk.gray(`  --since: ${displaySince}`));
          }
          if (options.until) {
            const displayUntil = options.until.toLowerCase() === 'today'
              ? `today (until ${new Date().toISOString().split('T')[0]} 23:59:59)`
              : options.until;
            console.log(chalk.gray(`  --until: ${displayUntil}`));
          }
          if (options.author) console.log(chalk.gray(`  --author: ${options.author}`));
        }
        
        process.exit(0);
      }

      const branch = await gitService.getCurrentBranch();
      displayProgress(`Found ${commits.length} commits`, true);
      
      // Pass filters to display function
      displayCommitStats(commits, branch, {
        since: options.since,
        until: options.until,
        author: options.author
      });

      // Generate AI report
      displayAIProgress(selectedProvider.provider, selectedProvider.model || 'default');
      const aiService = AIService.fromProvider(selectedProvider);
      const reportLength = (options.length as 'light' | 'short' | 'detailed') || 'detailed';
      const report = await aiService.generateReport(commits, reportLength);
      displayProgress('AI analysis complete', true);

      // Prepare output with full timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').split('.')[0]; // YYYY-MM-DDTHH-MM-SS
      const lengthSuffix = reportLength !== 'detailed' ? `-${reportLength}` : '';
      const fileExtension = options.format === 'json' ? 'json' : options.format === 'html' ? 'html' : 'md';
      const defaultName = `report-${timestamp}${lengthSuffix}.${fileExtension}`;
      const outputPath = options.output || path.join(config.defaultOutput, defaultName);
      
      // Ensure output directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Generate report content
      displayProgress('Generating report file...');
      let reportContent: string;
      
      if (options.format === 'json') {
        reportContent = JSON.stringify({
          metadata: {
            generatedAt: new Date().toISOString(),
            branch,
            period: options.since ? `${options.since}${options.until ? ` to ${options.until}` : ' to present'}` : 'All commits',
            commitsAnalyzed: commits.length,
            author: options.author || 'All authors',
            reportLength: reportLength,
            filters: {
              since: options.since,
              until: options.until,
              author: options.author
            }
          },
          report,
          commits: commits.slice(0, 50) // Limit commits in JSON
        }, null, 2);
      } else if (options.format === 'html') {
        const htmlGenerator = new HTMLReportGenerator();
        const authors = [...new Set(commits.map(c => c.author))];
        const filesModified = [...new Set(commits.flatMap(c => c.files))].length;
        const dateRange = commits.length > 0 
          ? `${commits[commits.length - 1].date.split('T')[0]} → ${commits[0].date.split('T')[0]}`
          : 'N/A';

        reportContent = htmlGenerator.generateReport(report, commits, {
          since: options.since,
          until: options.until,
          author: options.author,
          branch,
          generatedAt: new Date().toISOString(),
          length: reportLength,
          commitsAnalyzed: commits.length,
          authors: authors.length,
          filesModified,
          dateRange
        });
      } else {
        reportContent = generateMarkdownReport(report, commits, {
          since: options.since,
          until: options.until,
          author: options.author,
          branch,
          generatedAt: new Date().toISOString(),
          length: reportLength,
        });
      }

      // Save report
      await fs.writeFile(outputPath, reportContent);
      displayProgress('Report saved', true);

      const processingTime = (Date.now() - startTime) / 1000;
      displaySuccess(outputPath, commits, processingTime, reportLength);

    } catch (error) {
      const processingTime = (Date.now() - startTime) / 1000;
      console.log(chalk.gray(`\n⏱️  Processing time: ${processingTime.toFixed(2)}s`));
      displayError(error, 'Report generation');
      process.exit(1);
    }
  });

function generateMarkdownReport(
  report: any,
  commits: any[],
  metadata: {
    since?: string;
    until?: string;
    author?: string;
    branch: string;
    generatedAt: string;
    length?: string;
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

  const lengthDisplay = metadata.length && metadata.length !== 'detailed' 
    ? `  \n**Report Length:** ${metadata.length.charAt(0).toUpperCase() + metadata.length.slice(1)}` : '';

  return `# 🚀 Development Accomplishment Report

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}  
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