import { AnalyticsData, DashboardConfig } from '../types/index.js';

/**
 * Service responsible for generating interactive HTML dashboards
 * Creates beautiful, responsive analytics dashboards with charts and visualizations
 */
export class DashboardGenerator {
  /**
   * Generate interactive HTML dashboard
   */
  public async generateDashboard(
    analyticsData: AnalyticsData,
    config: DashboardConfig
  ): Promise<string> {
    const theme = this.determineTheme(config.theme);
    const chartsConfig = config.charts;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevSum Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/index.min.js"></script>
    <style>
        ${this.generateStyles(theme)}
    </style>
</head>
<body>
    <div class="dashboard-container">
        ${this.generateHeader(analyticsData)}
        ${this.generateMetricsOverview(analyticsData)}
        ${this.generateChartsSection(analyticsData, chartsConfig)}
        ${this.generateInsightsSection(analyticsData)}
        ${this.generateFooter(analyticsData)}
    </div>
    
    <script>
        ${this.generateJavaScript(analyticsData, config)}
    </script>
</body>
</html>`;
  }

  /**
   * Generate CSS styles for the dashboard
   */
  private generateStyles(theme: 'light' | 'dark'): string {
    // Minimalist black and white design
    const bgColor = '#ffffff';
    const textColor = '#000000';
    const cardBg = '#ffffff';
    const borderColor = '#000000';
    const accentColor = '#000000';
    const successColor = '#000000';
    const warningColor = '#666666';
    const dangerColor = '#000000';

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: ${bgColor};
            color: ${textColor};
            line-height: 1.4;
            font-size: 14px;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            border: 2px solid ${borderColor};
            background: ${cardBg};
            color: ${textColor};
        }

        .header h1 {
            font-size: 1.8rem;
            margin-bottom: 8px;
            font-weight: 400;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .header .subtitle {
            font-size: 0.9rem;
            font-weight: 300;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .metric-card {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            padding: 20px;
            text-align: center;
            position: relative;
        }

        .metric-value {
            font-size: 2rem;
            font-weight: 300;
            margin-bottom: 8px;
            color: ${textColor};
        }

        .metric-label {
            font-size: 0.8rem;
            color: ${textColor};
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 300;
        }

        .metric-change {
            font-size: 0.7rem;
            margin-top: 8px;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .metric-change.positive {
            color: ${textColor};
        }

        .metric-change.negative {
            color: ${warningColor};
        }

        .charts-section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: ${textColor};
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-bottom: 1px solid ${borderColor};
            padding-bottom: 10px;
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        .chart-container {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            padding: 20px;
            position: relative;
        }

        .chart-title {
            font-size: 0.9rem;
            margin-bottom: 15px;
            color: ${textColor};
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .chart-canvas {
            position: relative;
            height: 300px;
        }

        .insights-section {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            padding: 20px;
            margin-bottom: 40px;
        }

        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }

        .insight-card {
            padding: 15px;
            border: 1px solid ${borderColor};
            background: ${cardBg};
        }

        .insight-title {
            font-size: 0.9rem;
            font-weight: 300;
            margin-bottom: 8px;
            color: ${textColor};
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .insight-content {
            color: ${textColor};
            font-size: 0.8rem;
            line-height: 1.4;
        }

        .suggestion-list {
            list-style: none;
            padding: 0;
        }

        .suggestion-list li {
            padding: 8px 0;
            border-bottom: 1px solid ${borderColor};
        }

        .suggestion-list li:last-child {
            border-bottom: none;
        }

        .suggestion-list li::before {
            content: '•';
            margin-right: 8px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: ${textColor};
            border-top: 1px solid ${borderColor};
            font-size: 0.8rem;
            font-weight: 300;
        }

        .export-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }

        .export-btn {
            padding: 8px 16px;
            background: ${cardBg};
            color: ${textColor};
            border: 1px solid ${borderColor};
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 300;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .export-btn:hover {
            background: ${textColor};
            color: ${cardBg};
        }

        .heatmap-container {
            display: grid;
            grid-template-columns: repeat(53, 1fr);
            gap: 2px;
            margin: 20px 0;
        }

        .heatmap-day {
            width: 12px;
            height: 12px;
            background: #f0f0f0;
            border: 1px solid ${borderColor};
        }

        .heatmap-day:hover {
            background: ${textColor};
        }

        .heatmap-legend {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            font-size: 0.7rem;
            font-weight: 300;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }

        @media (max-width: 768px) {
            .dashboard-container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .metrics-grid {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            font-size: 1.1rem;
            color: ${textColor};
            opacity: 0.7;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid ${borderColor};
            border-top: 2px solid ${accentColor};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Theme-specific styles */
        .dark-theme {
            --bg-color: #1a1a1a;
            --text-color: #ffffff;
            --card-bg: #2d2d2d;
            --border-color: #404040;
        }
        
        .light-theme {
            --bg-color: #ffffff;
            --text-color: #333333;
            --card-bg: #f8f9fa;
            --border-color: #e9ecef;
        }
        
        /* Apply theme variables when classes are present */
        .dark-theme body {
            background-color: var(--bg-color);
            color: var(--text-color);
        }
        
        .light-theme body {
            background-color: var(--bg-color);
            color: var(--text-color);
        }
    `;
  }

  /**
   * Generate dashboard header
   */
  private generateHeader(analyticsData: AnalyticsData): string {
    const { repository, period, generatedAt } = analyticsData;
    const generatedDate = new Date(generatedAt).toLocaleDateString();

    return `
        <div class="header">
            <h1>📊 DevSum Analytics Dashboard</h1>
            <div class="subtitle">
                ${repository.name} • ${repository.branch} • ${period.days} days analyzed
            </div>
            <div style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
                Generated on ${generatedDate}
            </div>
        </div>
    `;
  }

  /**
   * Generate metrics overview section
   */
  private generateMetricsOverview(analyticsData: AnalyticsData): string {
    const { commits, productivity, collaboration, quality } = analyticsData;

    return `
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${commits.totalCommits}</div>
                <div class="metric-label">Total Commits</div>
                <div class="metric-change positive">+${commits.averageCommitsPerDay.toFixed(1)} avg/day</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${productivity.productivityScore}</div>
                <div class="metric-label">Productivity Score</div>
                <div class="metric-change ${productivity.productivityScore >= 70 ? 'positive' : 'negative'}">
                    ${productivity.productivityScore >= 70 ? 'Excellent' : 'Needs Improvement'}
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${collaboration.collaborationScore}</div>
                <div class="metric-label">Collaboration Score</div>
                <div class="metric-change ${collaboration.collaborationScore >= 60 ? 'positive' : 'negative'}">
                    ${collaboration.collaborationScore >= 60 ? 'Great Teamwork' : 'More Collaboration'}
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${quality.qualityScore}</div>
                <div class="metric-label">Code Quality Score</div>
                <div class="metric-change ${quality.qualityScore >= 75 ? 'positive' : 'negative'}">
                    ${quality.qualityScore >= 75 ? 'High Quality' : 'Room for Improvement'}
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${collaboration.totalAuthors}</div>
                <div class="metric-label">Contributors</div>
                <div class="metric-change positive">Active Team</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${productivity.codingStreak}</div>
                <div class="metric-label">Current Streak</div>
                <div class="metric-change positive">Keep it up!</div>
            </div>
        </div>
    `;
  }

  /**
   * Generate charts section
   */
  private generateChartsSection(analyticsData: AnalyticsData, chartsConfig: any): string {
    let chartsHtml = '<div class="charts-section">';

    if (chartsConfig.commitHeatmap) {
      chartsHtml += this.generateCommitHeatmapChart(analyticsData);
    }

    if (chartsConfig.productivityTrends) {
      chartsHtml += this.generateProductivityTrendsChart(analyticsData);
    }

    if (chartsConfig.fileAnalytics) {
      chartsHtml += this.generateFileAnalyticsChart(analyticsData);
    }

    if (chartsConfig.collaborationMetrics) {
      chartsHtml += this.generateCollaborationChart(analyticsData);
    }

    if (chartsConfig.qualityIndicators) {
      chartsHtml += this.generateQualityChart(analyticsData);
    }

    chartsHtml += '</div>';
    return chartsHtml;
  }

  /**
   * Generate commit heatmap chart
   */
  private generateCommitHeatmapChart(analyticsData: AnalyticsData): string {
    return `
        <div class="chart-container">
            <div class="chart-title">📅 Commit Activity Heatmap</div>
            <div class="heatmap-container" id="heatmap-container">
                <div class="loading">
                    <div class="spinner"></div>
                    Loading heatmap...
                </div>
            </div>
            <div class="heatmap-legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #f0f0f0;"></div>
                    <span>No commits</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #cccccc;"></div>
                    <span>1-3 commits</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #666666;"></div>
                    <span>4-6 commits</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #000000;"></div>
                    <span>7+ commits</span>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate productivity trends chart
   */
  private generateProductivityTrendsChart(analyticsData: AnalyticsData): string {
    return `
        <div class="chart-container">
            <div class="chart-title">📈 Productivity Trends</div>
            <div class="chart-canvas">
                <canvas id="productivityChart"></canvas>
            </div>
        </div>
    `;
  }

  /**
   * Generate file analytics chart
   */
  private generateFileAnalyticsChart(analyticsData: AnalyticsData): string {
    return `
        <div class="chart-container">
            <div class="chart-title">📁 File Change Analytics</div>
            <div class="chart-canvas">
                <canvas id="fileChart"></canvas>
            </div>
        </div>
    `;
  }

  /**
   * Generate collaboration chart
   */
  private generateCollaborationChart(analyticsData: AnalyticsData): string {
    return `
        <div class="chart-container">
            <div class="chart-title">👥 Collaboration Metrics</div>
            <div class="chart-canvas">
                <canvas id="collaborationChart"></canvas>
            </div>
        </div>
    `;
  }

  /**
   * Generate quality indicators chart
   */
  private generateQualityChart(analyticsData: AnalyticsData): string {
    return `
        <div class="chart-container">
            <div class="chart-title">🔍 Code Quality Indicators</div>
            <div class="chart-canvas">
                <canvas id="qualityChart"></canvas>
            </div>
        </div>
    `;
  }

  /**
   * Generate insights section
   */
  private generateInsightsSection(analyticsData: AnalyticsData): string {
    const { productivity, quality, collaboration } = analyticsData;

    return `
        <div class="insights-section">
            <div class="section-title">💡 Insights & Recommendations</div>
            <div class="insights-grid">
                <div class="insight-card">
                    <div class="insight-title">🎯 Productivity Insights</div>
                    <div class="insight-content">
                        <p>Your peak productivity time is <strong>${productivity.workPatterns.morning > productivity.workPatterns.afternoon ? 'morning' : 'afternoon'}</strong> with ${Math.max(productivity.workPatterns.morning, productivity.workPatterns.afternoon)} commits during that period.</p>
                        <p>Current coding streak: <strong>${productivity.codingStreak} days</strong> (longest: ${productivity.longestStreak} days)</p>
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-title">🤝 Collaboration Insights</div>
                    <div class="insight-content">
                        <p>You have <strong>${collaboration.totalAuthors} contributors</strong> with a collaboration score of <strong>${collaboration.collaborationScore}/100</strong>.</p>
                        <p>Most collaborative day: <strong>${collaboration.mostCollaborativeDay}</strong></p>
                    </div>
                </div>
                
                <div class="insight-card">
                    <div class="insight-title">🔧 Quality Improvements</div>
                    <div class="insight-content">
                        <ul class="suggestion-list">
                            ${quality.improvementSuggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate dashboard footer
   */
  private generateFooter(analyticsData: AnalyticsData): string {
    return `
        <div class="footer">
            <p>Generated by <strong>DevSum Analytics</strong> • ${analyticsData.metadata.provider}</p>
            <div class="export-buttons">
                <button class="export-btn" onclick="exportAsPNG()">Export as PNG</button>
                <button class="export-btn" onclick="exportAsPDF()">Export as PDF</button>
                <button class="export-btn" onclick="exportAsJSON()">Export as JSON</button>
            </div>
        </div>
    `;
  }

  /**
   * Generate JavaScript for interactive functionality
   */
  private generateJavaScript(analyticsData: AnalyticsData, config: DashboardConfig): string {
    return `
        // Analytics data
        const analyticsData = ${JSON.stringify(analyticsData, null, 2)};
        
        // Initialize charts when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Apply theme detection for auto theme
            applyThemeDetection();
            initializeCharts();
            generateHeatmap();
        });
        
        function applyThemeDetection() {
            // Check if we're in auto theme mode and apply system preference
            const body = document.body;
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            if (prefersDark) {
                body.classList.add('dark-theme');
            } else {
                body.classList.add('light-theme');
            }
        }
        
        function initializeCharts() {
            // Productivity trends chart
            if (document.getElementById('productivityChart')) {
                createProductivityChart();
            }
            
            // File analytics chart
            if (document.getElementById('fileChart')) {
                createFileChart();
            }
            
            // Collaboration chart
            if (document.getElementById('collaborationChart')) {
                createCollaborationChart();
            }
            
            // Quality chart
            if (document.getElementById('qualityChart')) {
                createQualityChart();
            }
        }
        
        function createProductivityChart() {
            const ctx = document.getElementById('productivityChart').getContext('2d');
            const data = analyticsData.productivity.productivityTrend;
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.week),
                    datasets: [{
                        label: 'Productivity Score',
                        data: data.map(d => d.score),
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        function createFileChart() {
            const ctx = document.getElementById('fileChart').getContext('2d');
            const data = analyticsData.files.filesByType;
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        data: Object.values(data),
                        backgroundColor: [
                            '#000000', '#333333', '#666666', '#999999', '#cccccc',
                            '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        function createCollaborationChart() {
            const ctx = document.getElementById('collaborationChart').getContext('2d');
            const data = analyticsData.collaboration.authorActivity.slice(0, 10);
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(a => a.author),
                    datasets: [{
                        label: 'Commits',
                        data: data.map(a => a.commits),
                        backgroundColor: '#000000'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        function createQualityChart() {
            const ctx = document.getElementById('qualityChart').getContext('2d');
            const data = analyticsData.quality;
            
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Refactoring', 'Bug Fixes', 'Features', 'Commit Size', 'Technical Debt'],
                    datasets: [{
                        label: 'Quality Metrics',
                        data: [
                            data.refactoringFrequency,
                            data.bugFixPercentage,
                            data.featureCommitPercentage,
                            Math.min(data.averageCommitSize * 5, 100),
                            Math.max(100 - data.technicalDebtIndicators.length * 10, 0)
                        ],
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        pointBackgroundColor: '#000000'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
        
        function generateHeatmap() {
            const container = document.getElementById('heatmap-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            // Generate heatmap data for the last year
            const commitsByDay = analyticsData.commits.commitsByDay;
            const startDate = new Date(analyticsData.period.since);
            const endDate = new Date(analyticsData.period.until);
            
            // Create a grid of days
            for (let i = 0; i < 365; i++) {
                const day = new Date(startDate);
                day.setDate(day.getDate() + i);
                
                if (day > endDate) break;
                
                const dayStr = day.toISOString().split('T')[0];
                const commits = commitsByDay[dayStr] || 0;
                
                const dayElement = document.createElement('div');
                dayElement.className = 'heatmap-day';
                dayElement.style.backgroundColor = getHeatmapColor(commits);
                dayElement.title = \`\${dayStr}: \${commits} commits\`;
                
                container.appendChild(dayElement);
            }
        }
        
        function getHeatmapColor(commits) {
            if (commits === 0) return '#f0f0f0';
            if (commits <= 3) return '#cccccc';
            if (commits <= 6) return '#666666';
            return '#000000';
        }
        
        // Export functions
        function exportAsPNG() {
            // Simple implementation - in a real app, you'd use html2canvas
            alert('PNG export would be implemented with html2canvas library');
        }
        
        function exportAsPDF() {
            // Simple implementation - in a real app, you'd use jsPDF
            alert('PDF export would be implemented with jsPDF library');
        }
        
        function exportAsJSON() {
            const dataStr = JSON.stringify(analyticsData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'analytics-data.json';
            link.click();
            URL.revokeObjectURL(url);
        }
    `;
  }

  /**
   * Determine theme based on configuration
   */
  private determineTheme(theme: 'light' | 'dark' | 'auto'): 'light' | 'dark' {
    if (theme === 'auto') {
      // In Node.js environment, default to light theme
      // The actual theme detection will happen in the browser when the HTML is opened
      return 'light';
    }
    return theme;
  }
}
