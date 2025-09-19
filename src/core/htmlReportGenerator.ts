import { GitCommit, ReportLength } from '../types/index.js';

export interface HTMLReportMetadata {
  since?: string;
  until?: string;
  author?: string;
  branch: string;
  generatedAt: string;
  length?: string;
  commitsAnalyzed: number;
  authors: number;
  filesModified: number;
  dateRange: string;
}

export class HTMLReportGenerator {
  generateReport(report: any, commits: GitCommit[], metadata: HTMLReportMetadata): string {
    const periodDescription = this.getPeriodDescription(metadata);
    const lengthDisplay = this.getLengthDisplay(metadata.length);
    const authorFilter = metadata.author ? ` (Author: ${metadata.author})` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Development Accomplishment Report</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="container">
        ${this.generateHeader(metadata, periodDescription, authorFilter, lengthDisplay)}
        ${this.generateExecutiveSummary(report)}
        ${this.generateAccomplishments(report)}
        ${this.generateTechnicalImprovements(report)}
        ${this.generateCommitAnalysis(commits)}
        ${this.generateStatistics(metadata, commits)}
        ${this.generateCharts(commits)}
        ${this.generateFilters(metadata)}
        ${this.generateFooter()}
    </div>
</body>
</html>`;
  }

  private getStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            line-height: 1.6;
            color: #0d1117;
            background: linear-gradient(135deg, #f6f8fa 0%, #ffffff 100%);
            min-height: 100vh;
            padding: 24px;
            font-size: 16px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 
                0 1px 3px rgba(0, 0, 0, 0.05),
                0 8px 24px rgba(0, 0, 0, 0.08),
                0 16px 48px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            backdrop-filter: blur(10px);
        }

        .header {
            background: linear-gradient(135deg, #0d1117 0%, #21262d 100%);
            color: #ffffff;
            padding: 80px 48px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 50%);
        }

        .header-content {
            position: relative;
            z-index: 1;
        }

        .title {
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 16px;
            letter-spacing: -0.025em;
            background: linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: 1.25rem;
            font-weight: 400;
            margin-bottom: 48px;
            opacity: 0.8;
            letter-spacing: 0.01em;
        }

        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 24px;
            margin-top: 48px;
        }

        .metadata-item {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 24px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            text-align: left;
            transition: all 0.3s ease;
        }

        .metadata-item:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
        }

        .metadata-label {
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
            opacity: 0.7;
        }

        .metadata-value {
            font-size: 1.375rem;
            font-weight: 700;
            letter-spacing: -0.01em;
        }

        .section {
            padding: 64px 48px;
            border-bottom: 1px solid #e1e4e8;
        }

        .section:last-child {
            border-bottom: none;
        }

        .section-title {
            font-size: 2.25rem;
            color: #0d1117;
            margin-bottom: 32px;
            display: flex;
            align-items: center;
            gap: 16px;
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        .section-icon {
            font-size: 1.5rem;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #0969da 0%, #218bff 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .summary {
            font-size: 1.125rem;
            line-height: 1.8;
            color: #24292f;
            background: #f6f8fa;
            padding: 32px;
            border-radius: 12px;
            border-left: 4px solid #0969da;
            font-weight: 400;
        }

        .accomplishments {
            display: grid;
            gap: 16px;
        }

        .accomplishment {
            background: #ffffff;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e1e4e8;
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .accomplishment:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            border-color: #0969da;
        }

        .accomplishment::before {
            content: '';
            position: absolute;
            top: 24px;
            left: 24px;
            width: 8px;
            height: 8px;
            background: #0969da;
            border-radius: 50%;
        }

        .accomplishment-text {
            font-weight: 500;
            line-height: 1.6;
            font-size: 1rem;
            margin-left: 24px;
            color: #24292f;
        }

        .technical-improvements {
            display: grid;
            gap: 16px;
        }

        .improvement {
            background: #ffffff;
            padding: 24px;
            border-radius: 12px;
            border: 1px solid #e1e4e8;
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .improvement:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            border-color: #1f883d;
        }

        .improvement::before {
            content: '';
            position: absolute;
            top: 24px;
            left: 24px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-bottom: 8px solid #1f883d;
        }

        .commits-grid {
            display: grid;
            gap: 16px;
        }

        .commit {
            background: #ffffff;
            border: 1px solid #e1e4e8;
            border-radius: 12px;
            padding: 24px;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .commit:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            border-color: #0969da;
        }

        .commit-message {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0d1117;
            margin-bottom: 16px;
            line-height: 1.4;
        }

        .commit-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            font-size: 0.875rem;
            color: #656d76;
        }

        .commit-meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #f6f8fa;
            border-radius: 8px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 48px;
        }

        .stat-card {
            background: #ffffff;
            padding: 32px 24px;
            border-radius: 16px;
            text-align: center;
            border: 1px solid #e1e4e8;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .stat-card:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
            transform: translateY(-4px);
        }

        .stat-card:nth-child(1) { border-top: 4px solid #0969da; }
        .stat-card:nth-child(2) { border-top: 4px solid #1f883d; }
        .stat-card:nth-child(3) { border-top: 4px solid #d1242f; }
        .stat-card:nth-child(4) { border-top: 4px solid #8b5cf6; }

        .stat-number {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
            color: #0d1117;
        }

        .stat-label {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #656d76;
        }

        .chart-container {
            background: #ffffff;
            border: 1px solid #e1e4e8;
            border-radius: 16px;
            padding: 32px;
            margin: 32px 0;
            transition: all 0.3s ease;
        }

        .chart-container:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .chart-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 24px;
            color: #0d1117;
            letter-spacing: -0.01em;
        }

        .chart {
            width: 100%;
            height: 300px;
            background: #f6f8fa;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
        }

        .bar-chart {
            display: flex;
            align-items: end;
            height: 100%;
            padding: 24px;
            gap: 16px;
        }

        .bar {
            flex: 1;
            background: linear-gradient(180deg, #0969da 0%, #0550ae 100%);
            min-height: 24px;
            position: relative;
            transition: all 0.3s ease;
            border-radius: 6px 6px 0 0;
            cursor: pointer;
        }

        .bar:hover {
            background: linear-gradient(180deg, #218bff 0%, #0969da 100%);
            transform: scale(1.05);
        }

        .bar:nth-child(even) {
            background: linear-gradient(180deg, #1f883d 0%, #1a7f37 100%);
        }

        .bar:nth-child(even):hover {
            background: linear-gradient(180deg, #2ea043 0%, #1f883d 100%);
        }

        .bar-label {
            position: absolute;
            bottom: -32px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.75rem;
            font-weight: 600;
            color: #656d76;
            white-space: nowrap;
        }

        .bar-value {
            position: absolute;
            top: -28px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.875rem;
            font-weight: 700;
            color: #0d1117;
            background: #ffffff;
            padding: 4px 8px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .filters {
            background: #f6f8fa;
            padding: 32px;
            border-radius: 12px;
            border: 1px solid #e1e4e8;
        }

        .filter-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-top: 24px;
        }

        .filter-item {
            background: #ffffff;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #e1e4e8;
            transition: all 0.3s ease;
        }

        .filter-item:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transform: translateY(-1px);
        }

        .filter-label {
            font-weight: 600;
            color: #0d1117;
            margin-bottom: 8px;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .filter-value {
            color: #656d76;
            font-weight: 500;
            font-size: 0.875rem;
        }

        .footer {
            background: linear-gradient(135deg, #0d1117 0%, #21262d 100%);
            color: #ffffff;
            padding: 48px;
            text-align: center;
        }

        .footer-content {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 24px;
            flex-wrap: wrap;
        }

        .footer-text {
            font-size: 1.125rem;
            font-weight: 600;
            letter-spacing: -0.01em;
        }

        .footer-subtext {
            opacity: 0.7;
            font-size: 0.875rem;
            font-weight: 400;
        }

        /* Scroll behavior */
        html {
            scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #f1f3f4;
        }

        ::-webkit-scrollbar-thumb {
            background: #c1c8cd;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #a8b3ba;
        }

        @media (max-width: 768px) {
            body {
                padding: 16px;
            }

            .container {
                border-radius: 12px;
            }

            .header {
                padding: 48px 24px;
            }

            .title {
                font-size: 2.5rem;
            }

            .section {
                padding: 48px 24px;
            }

            .metadata {
                grid-template-columns: 1fr;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }

            .bar-chart {
                flex-direction: column;
                height: auto;
                gap: 12px;
            }

            .bar {
                height: 48px;
                margin-bottom: 32px;
                border-radius: 0 6px 6px 0;
            }

            .bar-label {
                position: static;
                transform: none;
                margin-top: 8px;
                text-align: center;
            }

            .bar-value {
                position: static;
                transform: none;
                margin-bottom: 8px;
                display: inline-block;
            }
        }

        /* Animation for page load */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .section {
            animation: fadeInUp 0.6s ease-out;
        }

        .section:nth-child(even) {
            animation-delay: 0.1s;
        }

        .section:nth-child(odd) {
            animation-delay: 0.2s;
        }
    `;
  }

  private generateHeader(
    metadata: HTMLReportMetadata,
    periodDescription: string,
    authorFilter: string,
    lengthDisplay: string
  ): string {
    return `
    <div class="header">
        <div class="header-content">
            <h1 class="title">🚀 Development Accomplishment Report</h1>
            <p class="subtitle">AI-Powered Git Analysis & Insights</p>
            <div class="metadata">
                <div class="metadata-item">
                    <div class="metadata-label">📅 Generated</div>
                    <div class="metadata-value">${new Date(metadata.generatedAt).toLocaleString()}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">🌿 Branch</div>
                    <div class="metadata-value">${metadata.branch}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">📊 Period</div>
                    <div class="metadata-value">${periodDescription}${authorFilter}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">📝 Commits</div>
                    <div class="metadata-value">${metadata.commitsAnalyzed}</div>
                </div>
                ${lengthDisplay}
            </div>
        </div>
    </div>`;
  }

  private generateExecutiveSummary(report: any): string {
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">📋</span>
            Executive Summary
        </h2>
        <div class="summary">
            ${report.summary}
        </div>
    </div>`;
  }

  private generateAccomplishments(report: any): string {
    if (!report.accomplishments || report.accomplishments.length === 0) {
      return `
      <div class="section">
          <h2 class="section-title">
              <span class="section-icon">🎯</span>
              Key Accomplishments
          </h2>
          <div class="accomplishments">
              <div class="accomplishment">
                  <div class="accomplishment-text">No accomplishments identified</div>
              </div>
          </div>
      </div>`;
    }

    const accomplishments = report.accomplishments
      .map(
        (acc: string) => `
        <div class="accomplishment">
            <div class="accomplishment-text">${acc}</div>
        </div>
      `
      )
      .join('');

    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">🎯</span>
            Key Accomplishments
        </h2>
        <div class="accomplishments">
            ${accomplishments}
        </div>
    </div>`;
  }

  private generateTechnicalImprovements(report: any): string {
    if (!report.technicalImprovements || report.technicalImprovements.length === 0) {
      return '';
    }

    const improvements = report.technicalImprovements
      .map(
        (imp: string) => `
        <div class="improvement">
            <div class="accomplishment-text">${imp}</div>
        </div>
      `
      )
      .join('');

    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">⚡</span>
            Technical Improvements
        </h2>
        <div class="technical-improvements">
            ${improvements}
        </div>
    </div>`;
  }

  private generateCommitAnalysis(commits: GitCommit[]): string {
    const displayCommits = commits.slice(0, 15);
    const remainingCount = commits.length - 15;

    const commitCards = displayCommits
      .map(
        commit => `
      <div class="commit">
          <div class="commit-message">${commit.message}</div>
          <div class="commit-meta">
              <div class="commit-meta-item">
                  <span>📅</span>
                  <span>${commit.date.split('T')[0]}</span>
              </div>
              <div class="commit-meta-item">
                  <span>👤</span>
                  <span>${commit.author}</span>
              </div>
              <div class="commit-meta-item">
                  <span>📁</span>
                  <span>${commit.files.slice(0, 3).join(', ')}${commit.files.length > 3 ? '...' : ''}</span>
              </div>
              ${
                commit.insertions || commit.deletions
                  ? `
              <div class="commit-meta-item">
                  <span>📈</span>
                  <span>+${commit.insertions || 0} -${commit.deletions || 0}</span>
              </div>
              `
                  : ''
              }
          </div>
      </div>
    `
      )
      .join('');

    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">📊</span>
            Commit Analysis
        </h2>
        <div class="commits-grid">
            ${commitCards}
            ${
              remainingCount > 0
                ? `
            <div class="commit" style="text-align: center; background: #f8f9ff; border: 2px dashed #667eea;">
                <div class="commit-message">📎 ... and ${remainingCount} more commits</div>
            </div>
            `
                : ''
            }
        </div>
    </div>`;
  }

  private generateStatistics(metadata: HTMLReportMetadata, commits: GitCommit[]): string {
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">📈</span>
            Statistics
        </h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${metadata.commitsAnalyzed}</div>
                <div class="stat-label">Total Commits</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${metadata.authors}</div>
                <div class="stat-label">Authors</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${metadata.filesModified}</div>
                <div class="stat-label">Files Modified</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${commits.length > 0 ? commits.length : 0}</div>
                <div class="stat-label">Commits Analyzed</div>
            </div>
        </div>
    </div>`;
  }

  private generateFilters(metadata: HTMLReportMetadata): string {
    if (!metadata.since && !metadata.until && !metadata.author) {
      return '';
    }

    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">🔍</span>
            Applied Filters
        </h2>
        <div class="filters">
            <div class="filter-list">
                ${
                  metadata.since
                    ? `
                <div class="filter-item">
                    <div class="filter-label">Since</div>
                    <div class="filter-value">${metadata.since.toLowerCase() === 'today' ? `today (${new Date().toISOString().split('T')[0]} 00:00:00 to now)` : metadata.since}</div>
                </div>
                `
                    : ''
                }
                ${
                  metadata.until
                    ? `
                <div class="filter-item">
                    <div class="filter-label">Until</div>
                    <div class="filter-value">${metadata.until.toLowerCase() === 'today' ? `today (${new Date().toISOString().split('T')[0]} 23:59:59)` : metadata.until}</div>
                </div>
                `
                    : ''
                }
                ${
                  metadata.author
                    ? `
                <div class="filter-item">
                    <div class="filter-label">Author</div>
                    <div class="filter-value">${metadata.author}</div>
                </div>
                `
                    : ''
                }
            </div>
        </div>
    </div>`;
  }

  private generateCharts(commits: GitCommit[]): string {
    const commitActivity = this.getCommitActivityData(commits);
    const authorActivity = this.getAuthorActivityData(commits);

    return `
    <div class="section">
        <h2 class="section-title">
            <span class="section-icon">📊</span>
            Data Visualization
        </h2>
        
        <div class="chart-container">
            <div class="chart-title">Commit Activity Over Time</div>
            <div class="chart">
                ${this.generateBarChart(commitActivity)}
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-title">Author Contribution</div>
            <div class="chart">
                ${this.generateAuthorChart(authorActivity)}
            </div>
        </div>
    </div>`;
  }

  private getCommitActivityData(commits: GitCommit[]): Array<{ label: string; value: number }> {
    const activity: { [key: string]: number } = {};

    commits.forEach(commit => {
      const date = commit.date.split('T')[0];
      if (date) {
        activity[date] = (activity[date] || 0) + 1;
      }
    });

    return Object.entries(activity)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7) // Last 7 days
      .map(([date, count]) => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count,
      }));
  }

  private getAuthorActivityData(commits: GitCommit[]): Array<{ label: string; value: number }> {
    const authorCounts: { [key: string]: number } = {};

    commits.forEach(commit => {
      const author = commit.author.split(' <')[0]; // Remove email part
      if (author) {
        authorCounts[author] = (authorCounts[author] || 0) + 1;
      }
    });

    return Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([author, count]) => ({
        label: author,
        value: count,
      }));
  }

  private generateBarChart(data: Array<{ label: string; value: number }>): string {
    if (data.length === 0)
      return '<div style="text-align: center; padding: 50px; color: #666;">No data available</div>';

    const maxValue = Math.max(...data.map(d => d.value));

    return `
    <div class="bar-chart">
        ${data
          .map(item => {
            const height = (item.value / maxValue) * 100;
            return `
            <div class="bar" style="height: ${height}%">
                <div class="bar-value">${item.value}</div>
                <div class="bar-label">${item.label}</div>
            </div>
          `;
          })
          .join('')}
    </div>`;
  }

  private generateAuthorChart(data: Array<{ label: string; value: number }>): string {
    if (data.length === 0)
      return '<div style="text-align: center; padding: 50px; color: #666;">No data available</div>';

    const maxValue = Math.max(...data.map(d => d.value));

    return `
    <div class="bar-chart">
        ${data
          .map(item => {
            const height = (item.value / maxValue) * 100;
            return `
            <div class="bar" style="height: ${height}%">
                <div class="bar-value">${item.value}</div>
                <div class="bar-label">${item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label}</div>
            </div>
          `;
          })
          .join('')}
    </div>`;
  }

  private generateFooter(): string {
    return `
    <div class="footer">
        <div class="footer-content">
            <div class="footer-text">Generated by <strong>DevSum CLI</strong> 🤖</div>
            <div class="footer-subtext">Powered by AI • Making developers productive</div>
        </div>
    </div>`;
  }

  private getPeriodDescription(metadata: HTMLReportMetadata): string {
    if (!metadata.since) return 'All commits';

    let periodDescription = metadata.since;
    if (metadata.until) {
      periodDescription += ` to ${metadata.until}`;
    } else {
      periodDescription += ' to present';
    }

    // Enhanced period description with today support
    if (metadata.since?.toLowerCase() === 'today') {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0]?.substring(0, 5) ?? '00:00'; // HH:MM format
      const todayDate = new Date().toISOString().split('T')[0];
      periodDescription = `Today (${todayDate} 00:00:00 to ${timeStr})`;
      if (metadata.until) {
        periodDescription += ` (until ${metadata.until})`;
      }
    } else if (metadata.until?.toLowerCase() === 'today') {
      const todayDate = new Date().toISOString().split('T')[0];
      periodDescription = periodDescription.replace('today', `today (until ${todayDate} 23:59:59)`);
    } else if (metadata.since && metadata.since.match(/^\d+[dwmy]$/)) {
      const unit = metadata.since?.slice(-1);
      const num = metadata.since?.slice(0, -1);
      const unitName =
        unit === 'd' ? 'days' : unit === 'w' ? 'weeks' : unit === 'm' ? 'months' : 'years';
      periodDescription = `Last ${num} ${unitName}`;
      if (metadata.until) {
        periodDescription += ` (until ${metadata.until})`;
      }
    }

    return periodDescription;
  }

  private getLengthDisplay(length?: string): string {
    if (!length || length === 'detailed') return '';

    return `
    <div class="metadata-item">
        <div class="metadata-label">📏 Report Length</div>
        <div class="metadata-value">${length.charAt(0).toUpperCase() + length.slice(1)}</div>
    </div>`;
  }
}
