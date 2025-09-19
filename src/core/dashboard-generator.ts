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
    const isDark = theme === 'dark';
    const bgColor = isDark ? '#1a1a1a' : '#ffffff';
    const textColor = isDark ? '#ffffff' : '#333333';
    const cardBg = isDark ? '#2d2d2d' : '#f8f9fa';
    const borderColor = isDark ? '#404040' : '#e9ecef';
    const accentColor = '#007bff';
    const successColor = '#28a745';
    const warningColor = '#ffc107';
    const dangerColor = '#dc3545';

    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: ${bgColor};
            color: ${textColor};
            line-height: 1.6;
            transition: all 0.3s ease;
        }

        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, ${accentColor}, #0056b3);
            border-radius: 15px;
            color: white;
            box-shadow: 0 10px 30px rgba(0, 123, 255, 0.3);
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
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
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, ${accentColor}, ${successColor});
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 8px;
            color: ${accentColor};
        }

        .metric-label {
            font-size: 1rem;
            color: ${textColor};
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .metric-change {
            font-size: 0.9rem;
            margin-top: 8px;
            font-weight: 600;
        }

        .metric-change.positive {
            color: ${successColor};
        }

        .metric-change.negative {
            color: ${dangerColor};
        }

        .charts-section {
            margin-bottom: 40px;
        }

        .section-title {
            font-size: 1.8rem;
            margin-bottom: 25px;
            color: ${textColor};
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: '';
            width: 4px;
            height: 30px;
            background: linear-gradient(180deg, ${accentColor}, ${successColor});
            border-radius: 2px;
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
            border-radius: 12px;
            padding: 25px;
            position: relative;
        }

        .chart-title {
            font-size: 1.2rem;
            margin-bottom: 20px;
            color: ${textColor};
            font-weight: 600;
        }

        .chart-canvas {
            position: relative;
            height: 300px;
        }

        .insights-section {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
        }

        .insights-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
        }

        .insight-card {
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${accentColor};
            background: ${isDark ? '#3a3a3a' : '#f1f3f4'};
        }

        .insight-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: ${textColor};
        }

        .insight-content {
            color: ${textColor};
            opacity: 0.8;
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
            content: '💡';
            margin-right: 10px;
        }

        .footer {
            text-align: center;
            padding: 30px;
            color: ${textColor};
            opacity: 0.7;
            border-top: 1px solid ${borderColor};
        }

        .export-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }

        .export-btn {
            padding: 10px 20px;
            background: ${accentColor};
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.3s ease;
        }

        .export-btn:hover {
            background: #0056b3;
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
            border-radius: 2px;
            background: ${isDark ? '#2d2d2d' : '#f0f0f0'};
            transition: all 0.3s ease;
        }

        .heatmap-day:hover {
            transform: scale(1.2);
            z-index: 10;
            position: relative;
        }

        .heatmap-legend {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            font-size: 0.9rem;
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
                    <div class="legend-color" style="background: #ebedf0;"></div>
                    <span>No commits</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #c6e48b;"></div>
                    <span>1-3 commits</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #7bc96f;"></div>
                    <span>4-6 commits</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #239a3b;"></div>
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
            initializeCharts();
            generateHeatmap();
        });
        
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
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
                            '#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
                            '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#17a2b8'
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
                        backgroundColor: '#007bff'
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
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.2)',
                        pointBackgroundColor: '#007bff'
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
            if (commits === 0) return '#ebedf0';
            if (commits <= 3) return '#c6e48b';
            if (commits <= 6) return '#7bc96f';
            return '#239a3b';
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
      // Check system preference
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }
}
