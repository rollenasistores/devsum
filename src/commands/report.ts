import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { configManager } from '../core/config.js';
import { GitService } from '../core/git.js';
import { AIService } from '../core/ai.js';
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
      .sort(([, a], [, b]) => (b as number) - (a as number))
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

const displaySuccess = (outputPath: string, commits: any[], processingTime: number) => {
  console.log();
  console.log(chalk.green('═'.repeat(55)));
  console.log(chalk.green.bold('🎉 Report Generated Successfully!'));
  console.log();
  console.log(chalk.blue('📄 Report Details:'));
  console.log(chalk.gray(`   Location: ${outputPath}`));
  console.log(chalk.gray(`   Size: ${commits.length} commits analyzed`));
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
  .option('--no-header', 'Skip the fancy header display')
  .option('--today', 'Shortcut for --since today (get commits from today only)')
  .option('--short', 'Generate a short, concise report')
  .option('--light', 'Generate a light, minimal report')
  .option('--ai <provider>', 'Select AI provider (gemini|claude|gpt-4|coming-soon)', 'gemini')
  .action(async (options: ReportOptions & {
    noHeader?: boolean;
    author?: string;
    today?: boolean;
    short?: boolean;
    light?: boolean;
    ai?: string;
  }) => {
    const startTime = Date.now();

    try {
      // Handle --today shortcut
      if (options.today) {
        options.since = 'today';
      }

      // Determine report length
      if (options.light) {
        options.length = 'light';
      } else if (options.short) {
        options.length = 'short';
      } else {
        options.length = 'detailed';
      }

      // Handle AI provider selection
      if (options.ai && options.ai !== 'gemini') {
        if (options.ai === 'coming-soon') {
          console.log();
          console.log(chalk.yellow('🚧 Coming Soon!'));
          console.log(chalk.gray('Additional AI providers (Claude, GPT-4) are coming soon.'));
          console.log(chalk.gray('Currently using Gemini for report generation.'));
          console.log();
        } else {
          console.log();
          console.log(chalk.yellow(`🤖 AI Provider: ${options.ai.toUpperCase()}`));
          console.log(chalk.gray('Note: All providers currently use the DevSum API backend.'));
          console.log();
        }
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

      // Load configuration
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
      displayProgress('Configuration loaded', true);

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
      displayAIProgress(config.provider, config.model || 'default');
      const aiService = new AIService(config);
      const report = await aiService.generateReport(commits, options.length);
      displayProgress('AI analysis complete', true);

      // Prepare output with full timestamp
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const timestamp = `${dateStr}_${timeStr}`;
      const defaultName = `report-${timestamp}.${options.format === 'json' ? 'json' : 'md'}`;
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
            filters: {
              since: options.since,
              until: options.until,
              author: options.author
            }
          },
          report,
          commits: commits.slice(0, 50) // Limit commits in JSON
        }, null, 2);
      } else {
        reportContent = generateMarkdownReport(report, commits, {
          since: options.since,
          until: options.until,
          author: options.author,
          branch,
          generatedAt: new Date().toISOString(),
          length: options.length,
        });
      }

      // Save report
      await fs.writeFile(outputPath, reportContent);
      displayProgress('Report saved', true);

      const processingTime = (Date.now() - startTime) / 1000;
      displaySuccess(outputPath, commits, processingTime);

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
    length?: 'short' | 'light' | 'detailed';
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

  // Determine report length
  const isLight = metadata.length === 'light';
  const isShort = metadata.length === 'short';
  const isDetailed = metadata.length === 'detailed' || !metadata.length;

  // Light report - minimal content
  if (isLight) {
    return `# 🚀 Dev Report

**Period:** ${periodDescription}${authorFilter} | **Commits:** ${commits.length}

## Summary
${report.summary}

## Key Points
${report.accomplishments?.slice(0, 3).map((acc: string) => `• ${acc}`).join('\n') || '• Work completed'}

---
*Generated by DevSum CLI*
`;
  }

  // Short report - concise but complete
  if (isShort) {
    return `# 🚀 Development Report

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}  
**Branch:** \`${metadata.branch}\` | **Period:** ${periodDescription}${authorFilter} | **Commits:** ${commits.length}

---

## 📋 Summary

${report.summary}

## 🎯 Key Accomplishments

${report.accomplishments?.map((acc: string) => `- ${acc}`).join('\n') || '- No accomplishments identified'}

---

## 📊 Recent Commits

${commits.slice(0, 8).map(commit =>
      `**${commit.message}** - ${commit.date.split('T')[0]} (${commit.author})
`
    ).join('')}

${commits.length > 8 ? `*... and ${commits.length - 8} more commits*\n` : ''}

---
*Generated by DevSum CLI*
`;
  }

  // Detailed report - full content
  return `# 🚀 Development Accomplishment Report

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}  
**Branch:** \`${metadata.branch}\`  
**Period:** ${periodDescription}${authorFilter}  
**Commits Analyzed:** ${commits.length}

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