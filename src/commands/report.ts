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
  
  // FIX: Show applied filters
  if (filters?.since || filters?.until || filters?.author) {
    console.log();
    console.log(chalk.yellow('🔍 Applied Filters:'));
    if (filters.since) {
      console.log(chalk.gray(`   📅 Since: ${filters.since}`));
    }
    if (filters.until) {
      console.log(chalk.gray(`   📅 Until: ${filters.until}`));
    }
    if (filters.author) {
      console.log(chalk.gray(`   👤 Author: ${filters.author}`));
    }
  }
  
  // Calculate stats
  const authors = [...new Set(commits.map(c => c.author))];
  const dateRange = commits.length > 0 ? {
    oldest: commits[commits.length - 1].date.split('T')[0],
    newest: commits[0].date.split('T')[0]
  } : null;
  
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
  console.log(chalk.gray('   • Check date format (YYYY-MM-DD or 7d, 2w, 1m)'));
  console.log();
  console.log(chalk.blue('For help: https://github.com/rollenasistores/devsum/issues'));
  console.log(chalk.red('═'.repeat(55)));
};

// FIX: Enhanced validation helper
const validateDateFilters = (since?: string, until?: string): string | null => {
  const gitService = new GitService();
  
  if (since && !gitService.isValidDate(since)) {
    return `Invalid --since date: "${since}". Use formats like: 7d, 2w, 1m, or YYYY-MM-DD`;
  }
  
  if (until && !gitService.isValidDate(until)) {
    return `Invalid --until date: "${until}". Use format: YYYY-MM-DD`;
  }
  
  // Check logical date order for absolute dates
  if (since && until) {
    const sinceDate = new Date(since);
    const untilDate = new Date(until);
    
    if (!isNaN(sinceDate.getTime()) && !isNaN(untilDate.getTime()) && sinceDate > untilDate) {
      return `--since date (${since}) cannot be after --until date (${until})`;
    }
  }
  
  return null;
};

export const reportCommand = new Command('report')
  .description('Generate accomplishment report from git commits')
  .option('-s, --since <date>', 'Include commits since this date (YYYY-MM-DD or relative like "7d")')
  .option('-u, --until <date>', 'Include commits until this date (YYYY-MM-DD)')
  .option('-a, --author <name>', 'Filter commits by author name')
  .option('-o, --output <path>', 'Output file path')
  .option('-f, --format <format>', 'Output format (markdown|json|html)', 'markdown')
  .option('--no-header', 'Skip the fancy header display')
  .action(async (options: ReportOptions & { noHeader?: boolean; author?: string }) => {
    const startTime = Date.now();
    
    try {
      if (!options.noHeader) {
        displayHeader();
      }

      // FIX: Validate date filters early
      const dateError = validateDateFilters(options.since, options.until);
      if (dateError) {
        console.log();
        console.error(chalk.red('❌ Invalid date filter'));
        console.log(chalk.yellow(dateError));
        console.log();
        console.log(chalk.blue('💡 Valid date formats:'));
        console.log(chalk.white('   --since 7d              '), chalk.gray('# Last 7 days'));
        console.log(chalk.white('   --since 2w              '), chalk.gray('# Last 2 weeks'));
        console.log(chalk.white('   --since 1m              '), chalk.gray('# Last 1 month'));
        console.log(chalk.white('   --since 2024-01-01      '), chalk.gray('# Since specific date'));
        console.log(chalk.white('   --until 2024-12-31      '), chalk.gray('# Until specific date'));
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

      // Get git commits
      displayProgress('Analyzing commit history...');
      const commits = await gitService.getCommits(options.since, options.until, options.author);
      
      if (commits.length === 0) {
        console.log();
        console.log(chalk.yellow('⚠️  No commits found matching your criteria'));
        console.log();
        console.log(chalk.blue('💡 Try adjusting your filters:'));
        console.log(chalk.white('  devsum report --since 30d    '), chalk.gray('# Last 30 days'));
        console.log(chalk.white('  devsum report --since 2025-01-01'), chalk.gray('# Since specific date'));
        console.log(chalk.white('  devsum report                '), chalk.gray('# All commits'));
        
        // FIX: Show current filters for debugging
        if (options.since || options.until || options.author) {
          console.log();
          console.log(chalk.gray('Current filters applied:'));
          if (options.since) console.log(chalk.gray(`  --since: ${options.since}`));
          if (options.until) console.log(chalk.gray(`  --until: ${options.until}`));
          if (options.author) console.log(chalk.gray(`  --author: ${options.author}`));
        }
        
        process.exit(0);
      }

      const branch = await gitService.getCurrentBranch();
      displayProgress(`Found ${commits.length} commits`, true);
      
      // FIX: Pass filters to display function
      displayCommitStats(commits, branch, {
        since: options.since,
        until: options.until,
        author: options.author
      });

      // Generate AI report
      displayAIProgress(config.provider, config.model || 'default');
      const aiService = new AIService(config);
      const report = await aiService.generateReport(commits);
      displayProgress('AI analysis complete', true);

      // Prepare output
      const timestamp = new Date().toISOString().split('T')[0];
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
  }
): string {
  const dateRange = metadata.since 
    ? `${metadata.since}${metadata.until ? ` to ${metadata.until}` : ' to present'}`
    : 'All commits';

  const authorFilter = metadata.author ? ` (Author: ${metadata.author})` : '';

  // FIX: Better period description
  let periodDescription = dateRange;
  if (metadata.since && metadata.since.match(/^\d+[dwmy]$/)) {
    const unit = metadata.since.slice(-1);
    const num = metadata.since.slice(0, -1);
    const unitName = unit === 'd' ? 'days' : unit === 'w' ? 'weeks' : unit === 'm' ? 'months' : 'years';
    periodDescription = `Last ${num} ${unitName}`;
    if (metadata.until) {
      periodDescription += ` (until ${metadata.until})`;
    }
  }

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

${metadata.since ? `- **Since:** ${metadata.since}` : ''}
${metadata.until ? `- **Until:** ${metadata.until}` : ''}
${metadata.author ? `- **Author:** ${metadata.author}` : ''}
` : ''}
---

<div align="center">
  <sub>Generated by <strong>DevSum CLI</strong> 🤖</sub><br>
  <sub>Powered by AI • Making developers productive</sub>
</div>
`;
}