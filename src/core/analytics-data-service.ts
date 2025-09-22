import { GitService } from './git.js';
import {
  AnalyticsData,
  CommitAnalytics,
  FileChangeAnalytics,
  ProductivityAnalytics,
  CollaborationAnalytics,
  CodeQualityAnalytics,
  GitCommit,
  AnalyticsFocus,
  FileChangeType,
} from '../types/index.js';

/**
 * Service responsible for aggregating and analyzing git data for analytics
 * Provides comprehensive data analysis following single responsibility principle
 */
export class AnalyticsDataService {
  private readonly gitService: GitService;

  constructor() {
    this.gitService = new GitService();
  }

  /**
   * Generate comprehensive analytics data from git commits
   */
  public async generateAnalyticsData(
    commits: GitCommit[],
    focus: AnalyticsFocus,
    since: string,
    until: string,
    provider: string
  ): Promise<AnalyticsData> {
    const commitAnalytics = this.analyzeCommits(commits);
    const fileAnalytics = this.analyzeFileChanges(commits);
    const productivityAnalytics = this.analyzeProductivity(commits);
    const collaborationAnalytics = this.analyzeCollaboration(commits);
    const qualityAnalytics = this.analyzeCodeQuality(commits);

    const days = this.calculateDaysDifference(since, until);
    const repositoryName = await this.getRepositoryName();

    return {
      period: {
        since,
        until,
        days,
      },
      repository: {
        name: repositoryName,
        branch: await this.getCurrentBranch(),
        totalCommits: commits.length,
      },
      commits: commitAnalytics,
      files: fileAnalytics,
      productivity: productivityAnalytics,
      collaboration: collaborationAnalytics,
      quality: qualityAnalytics,
      generatedAt: new Date().toISOString(),
      metadata: {
        focus,
        format: 'dashboard',
        provider,
      },
    };
  }

  /**
   * Analyze commit patterns and statistics
   */
  private analyzeCommits(commits: GitCommit[]): CommitAnalytics {
    const commitsByDay: Record<string, number> = {};
    const commitsByHour: Record<string, number> = {};
    const commitsByAuthor: Record<string, number> = {};
    const commitsByBranch: Record<string, number> = {};

    let totalCommits = 0;
    let mostActiveDay = '';
    let mostActiveHour = 0;
    let maxDayCommits = 0;
    let maxHourCommits = 0;

    for (const commit of commits) {
      totalCommits++;

      // Analyze by day
      const day = new Date(commit.date).toISOString().split('T')[0];
      if (day) {
        commitsByDay[day] = (commitsByDay[day] || 0) + 1;
        if (commitsByDay[day] > maxDayCommits) {
          maxDayCommits = commitsByDay[day];
          mostActiveDay = day;
        }
      }

      // Analyze by hour
      const hour = new Date(commit.date).getHours();
      const hourKey = `${hour}:00`;
      if (hourKey) {
        commitsByHour[hourKey] = (commitsByHour[hourKey] || 0) + 1;
        if (commitsByHour[hourKey] > maxHourCommits) {
          maxHourCommits = commitsByHour[hourKey];
          mostActiveHour = hour;
        }
      }

      // Analyze by author
      commitsByAuthor[commit.author] = (commitsByAuthor[commit.author] || 0) + 1;

      // Analyze by branch (if available in commit message or metadata)
      const branch = this.extractBranchFromCommit(commit);
      if (branch) {
        commitsByBranch[branch] = (commitsByBranch[branch] || 0) + 1;
      }
    }

    const averageCommitsPerDay = totalCommits / Math.max(Object.keys(commitsByDay).length, 1);
    const peakProductivityTime = this.calculatePeakProductivityTime(commitsByHour);

    return {
      totalCommits,
      commitsByDay,
      commitsByHour,
      commitsByAuthor,
      commitsByBranch,
      averageCommitsPerDay,
      mostActiveDay,
      mostActiveHour,
      peakProductivityTime,
    };
  }

  /**
   * Analyze file change patterns
   */
  private analyzeFileChanges(commits: GitCommit[]): FileChangeAnalytics {
    const fileChanges: Record<string, number> = {};
    const filesByType: Record<string, number> = {};
    let totalFilesChanged = 0;
    let largestCommit = { hash: '', filesChanged: 0, date: '' };

    for (const commit of commits) {
      const filesInCommit = commit.files.length;
      totalFilesChanged += filesInCommit;

      if (filesInCommit > largestCommit.filesChanged) {
        largestCommit = {
          hash: commit.hash,
          filesChanged: filesInCommit,
          date: commit.date,
        };
      }

      for (const file of commit.files) {
        fileChanges[file] = (fileChanges[file] || 0) + 1;

        const fileType = this.getFileType(file);
        filesByType[fileType] = (filesByType[fileType] || 0) + 1;
      }
    }

    const mostModifiedFiles = Object.entries(fileChanges)
      .map(([file, changes]) => ({
        file,
        changes,
        type: this.determineFileChangeType(file, changes),
      }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 10);

    const averageFilesPerCommit = totalFilesChanged / Math.max(commits.length, 1);
    const codeComplexityTrend = this.calculateComplexityTrend(commits);

    return {
      totalFilesChanged,
      mostModifiedFiles,
      filesByType,
      averageFilesPerCommit,
      largestCommit,
      codeComplexityTrend,
    };
  }

  /**
   * Analyze productivity patterns
   */
  private analyzeProductivity(commits: GitCommit[]): ProductivityAnalytics {
    const workPatterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const weeklyPattern: Record<string, number> = {};
    const productivityTrend: Array<{ week: string; score: number }> = [];

    let codingStreak = 0;
    let longestStreak = 0;
    let currentStreak = 0;
    let lastCommitDate: string | null = null;

    for (const commit of commits) {
      const date = new Date(commit.date);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Analyze work patterns by time of day
      if (hour >= 6 && hour < 12) workPatterns.morning++;
      else if (hour >= 12 && hour < 17) workPatterns.afternoon++;
      else if (hour >= 17 && hour < 22) workPatterns.evening++;
      else workPatterns.night++;

      // Analyze weekly patterns
      weeklyPattern[dayOfWeek] = (weeklyPattern[dayOfWeek] || 0) + 1;

      // Calculate coding streak
      const commitDate = date.toISOString().split('T')[0];
      if (commitDate) {
        if (lastCommitDate) {
          const daysDiff = this.calculateDaysDifference(lastCommitDate, commitDate);
          if (daysDiff <= 1) {
            currentStreak++;
          } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        lastCommitDate = commitDate;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    codingStreak = currentStreak;

    // Calculate productivity score (0-100)
    const productivityScore = this.calculateProductivityScore(commits, workPatterns);

    // Calculate weekly productivity trend
    const weeks = this.groupCommitsByWeek(commits);
    for (const [week, weekCommits] of Object.entries(weeks)) {
      if (weekCommits) {
        const weekScore = this.calculateProductivityScore(weekCommits, workPatterns);
        productivityTrend.push({ week, score: weekScore });
      }
    }

    const averageCommitsPerWeek = commits.length / Math.max(Object.keys(weeks).length, 1);

    return {
      codingStreak,
      longestStreak,
      averageCommitsPerWeek,
      productivityScore,
      workPatterns,
      weeklyPattern,
      productivityTrend,
    };
  }

  /**
   * Analyze collaboration patterns
   */
  private analyzeCollaboration(commits: GitCommit[]): CollaborationAnalytics {
    const authorActivity: Array<{ author: string; commits: number; percentage: number }> = [];
    const pairProgrammingIndicators: Array<{ date: string; authors: string[] }> = [];
    const branchCollaboration: Record<string, string[]> = {};

    // Group commits by date to find collaboration
    const commitsByDate: Record<string, GitCommit[]> = {};
    for (const commit of commits) {
      const date = new Date(commit.date).toISOString().split('T')[0];
      if (date) {
        if (!commitsByDate[date]) {
          commitsByDate[date] = [];
        }
        commitsByDate[date].push(commit);
      }
    }

    // Find pair programming indicators (multiple authors on same day)
    for (const [date, dayCommits] of Object.entries(commitsByDate)) {
      if (dayCommits) {
        const uniqueAuthors = [...new Set(dayCommits.map(c => c.author))];
        if (uniqueAuthors.length > 1) {
          pairProgrammingIndicators.push({ date, authors: uniqueAuthors });
        }
      }
    }

    // Calculate author activity
    const authorCommits: Record<string, number> = {};
    for (const commit of commits) {
      authorCommits[commit.author] = (authorCommits[commit.author] || 0) + 1;
    }

    const totalCommits = commits.length;
    for (const [author, count] of Object.entries(authorCommits)) {
      authorActivity.push({
        author,
        commits: count,
        percentage: (count / totalCommits) * 100,
      });
    }

    authorActivity.sort((a, b) => b.commits - a.commits);

    const totalAuthors = authorActivity.length;
    const collaborationScore = this.calculateCollaborationScore(
      authorActivity,
      pairProgrammingIndicators
    );
    const mostCollaborativeDay = this.findMostCollaborativeDay(pairProgrammingIndicators);

    return {
      totalAuthors,
      authorActivity,
      collaborationScore,
      mostCollaborativeDay,
      pairProgrammingIndicators,
      branchCollaboration,
    };
  }

  /**
   * Analyze code quality indicators
   */
  private analyzeCodeQuality(commits: GitCommit[]): CodeQualityAnalytics {
    let totalCommitSize = 0;
    let refactoringCommits = 0;
    let bugFixCommits = 0;
    let featureCommits = 0;
    const technicalDebtIndicators: Array<{ file: string; issues: string[] }> = [];

    for (const commit of commits) {
      totalCommitSize += commit.files.length;

      // Analyze commit message for patterns
      const message = commit.message.toLowerCase();
      if (message.includes('refactor') || message.includes('cleanup')) {
        refactoringCommits++;
      }
      if (message.includes('fix') || message.includes('bug') || message.includes('error')) {
        bugFixCommits++;
      }
      if (message.includes('feat') || message.includes('feature') || message.includes('add')) {
        featureCommits++;
      }

      // Analyze files for technical debt indicators
      for (const file of commit.files) {
        const issues = this.identifyTechnicalDebtIssues(file, commit);
        if (issues.length > 0) {
          technicalDebtIndicators.push({ file, issues });
        }
      }
    }

    const averageCommitSize = totalCommitSize / Math.max(commits.length, 1);
    const refactoringFrequency = (refactoringCommits / Math.max(commits.length, 1)) * 100;
    const bugFixPercentage = (bugFixCommits / Math.max(commits.length, 1)) * 100;
    const featureCommitPercentage = (featureCommits / Math.max(commits.length, 1)) * 100;

    const qualityScore = this.calculateQualityScore(
      refactoringFrequency,
      bugFixPercentage,
      averageCommitSize,
      technicalDebtIndicators.length
    );

    const improvementSuggestions = this.generateImprovementSuggestions(
      refactoringFrequency,
      bugFixPercentage,
      technicalDebtIndicators
    );

    return {
      averageCommitSize,
      refactoringFrequency,
      bugFixPercentage,
      featureCommitPercentage,
      qualityScore,
      technicalDebtIndicators,
      improvementSuggestions,
    };
  }

  // Helper methods

  private calculateDaysDifference(since: string, until: string): number {
    const startDate = new Date(since);
    const endDate = new Date(until);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private async getRepositoryName(): Promise<string> {
    try {
      // For now, return a default name since getRemotes doesn't exist
      // This can be enhanced later when the GitService is extended
      return 'Local Repository';
    } catch {
      return 'Local Repository';
    }
  }

  private async getCurrentBranch(): Promise<string> {
    try {
      return await this.gitService.getCurrentBranch();
    } catch {
      return 'unknown';
    }
  }

  private extractBranchFromCommit(commit: GitCommit): string | null {
    // Try to extract branch from commit message or use a default
    const message = commit.message.toLowerCase();
    if (message.includes('merge') && message.includes('branch')) {
      const match = message.match(/branch\s+['"]?([^'"\s]+)['"]?/);
      return match ? match[1] || null : null;
    }
    return null;
  }

  private calculatePeakProductivityTime(commitsByHour: Record<string, number>): string {
    let maxCommits = 0;
    let peakHour = '9:00';

    for (const [hour, count] of Object.entries(commitsByHour)) {
      if (count > maxCommits) {
        maxCommits = count;
        peakHour = hour;
      }
    }

    return peakHour;
  }

  private getFileType(file: string): string {
    const extension = file.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      ts: 'TypeScript',
      js: 'JavaScript',
      tsx: 'React TypeScript',
      jsx: 'React JavaScript',
      py: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      cs: 'C#',
      php: 'PHP',
      rb: 'Ruby',
      go: 'Go',
      rs: 'Rust',
      swift: 'Swift',
      kt: 'Kotlin',
      scala: 'Scala',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      sass: 'Sass',
      less: 'Less',
      json: 'JSON',
      xml: 'XML',
      yaml: 'YAML',
      yml: 'YAML',
      md: 'Markdown',
      txt: 'Text',
      sql: 'SQL',
      sh: 'Shell',
      bash: 'Bash',
      zsh: 'Zsh',
      fish: 'Fish',
      dockerfile: 'Dockerfile',
      dockerignore: 'Docker Ignore',
      gitignore: 'Git Ignore',
      env: 'Environment',
      config: 'Configuration',
    };

    return typeMap[extension || ''] || 'Other';
  }

  private determineFileChangeType(file: string, changes: number): FileChangeType {
    if (changes > 20) return 'modified';
    if (changes > 5) return 'added';
    return 'unknown';
  }

  private calculateComplexityTrend(
    commits: GitCommit[]
  ): Array<{ date: string; complexity: number }> {
    const trend: Array<{ date: string; complexity: number }> = [];
    const commitsByDate: Record<string, GitCommit[]> = {};

    for (const commit of commits) {
      const date = new Date(commit.date).toISOString().split('T')[0];
      if (date) {
        if (!commitsByDate[date]) {
          commitsByDate[date] = [];
        }
        commitsByDate[date].push(commit);
      }
    }

    for (const [date, dayCommits] of Object.entries(commitsByDate)) {
      const complexity = dayCommits.reduce((sum, commit) => sum + commit.files.length, 0);
      trend.push({ date, complexity });
    }

    return trend.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateProductivityScore(commits: GitCommit[], workPatterns: any): number {
    const commitCount = commits.length;
    const fileChanges = commits.reduce((sum, commit) => sum + commit.files.length, 0);
    const consistency = this.calculateConsistencyScore(commits);

    // Weighted score calculation
    const score = commitCount * 0.3 + fileChanges * 0.2 + consistency * 0.5;
    return Math.min(Math.round(score), 100);
  }

  private calculateConsistencyScore(commits: GitCommit[]): number {
    if (commits.length < 2) return 50;

    const dates = commits.map(c => new Date(c.date).getTime()).sort();
    const intervals: number[] = [];

    for (let i = 1; i < dates.length; i++) {
      const current = dates[i];
      const previous = dates[i - 1];
      if (current !== undefined && previous !== undefined) {
        intervals.push(current - previous);
      }
    }

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) /
      intervals.length;
    const consistency = Math.max(0, 100 - variance / (1000 * 60 * 60 * 24)); // Normalize by days

    return Math.min(consistency, 100);
  }

  private groupCommitsByWeek(commits: GitCommit[]): Record<string, GitCommit[]> {
    const weeks: Record<string, GitCommit[]> = {};

    for (const commit of commits) {
      const date = new Date(commit.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (weekKey) {
        if (!weeks[weekKey]) {
          weeks[weekKey] = [];
        }
        weeks[weekKey].push(commit);
      }
    }

    return weeks;
  }

  private calculateCollaborationScore(
    authorActivity: Array<{ author: string; commits: number; percentage: number }>,
    pairProgrammingIndicators: Array<{ date: string; authors: string[] }>
  ): number {
    const authorCount = authorActivity.length;
    const pairProgrammingDays = pairProgrammingIndicators.length;
    const totalDays = Math.max(authorActivity.length, 1);

    const diversityScore = Math.min((authorCount / 5) * 50, 50); // Max 50 points for diversity
    const collaborationScore = Math.min((pairProgrammingDays / totalDays) * 50, 50); // Max 50 points for collaboration

    return Math.round(diversityScore + collaborationScore);
  }

  private findMostCollaborativeDay(
    pairProgrammingIndicators: Array<{ date: string; authors: string[] }>
  ): string {
    if (pairProgrammingIndicators.length === 0) return 'None';

    const dayCounts: Record<string, number> = {};
    for (const indicator of pairProgrammingIndicators) {
      dayCounts[indicator.date] = (dayCounts[indicator.date] || 0) + 1;
    }

    let maxCount = 0;
    let mostCollaborativeDay = '';
    for (const [date, count] of Object.entries(dayCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCollaborativeDay = date;
      }
    }

    return mostCollaborativeDay;
  }

  private identifyTechnicalDebtIssues(file: string, commit: GitCommit): string[] {
    const issues: string[] = [];

    // Check for common technical debt indicators
    if (file.includes('test') && commit.message.toLowerCase().includes('skip')) {
      issues.push('Skipped tests');
    }

    if (file.includes('todo') || file.includes('fixme') || file.includes('hack')) {
      issues.push('TODO/FIXME comments');
    }

    if (file.includes('legacy') || file.includes('old') || file.includes('deprecated')) {
      issues.push('Legacy code');
    }

    if (commit.files.length > 20) {
      issues.push('Large commit (many files changed)');
    }

    return issues;
  }

  private calculateQualityScore(
    refactoringFrequency: number,
    bugFixPercentage: number,
    averageCommitSize: number,
    technicalDebtCount: number
  ): number {
    // Higher refactoring frequency is good (up to 30%)
    const refactoringScore = Math.min((refactoringFrequency / 30) * 30, 30);

    // Lower bug fix percentage is good (up to 20% is acceptable)
    const bugFixScore = (Math.max(0, 20 - bugFixPercentage) / 20) * 20;

    // Moderate commit size is good (5-15 files per commit)
    const commitSizeScore =
      averageCommitSize >= 5 && averageCommitSize <= 15
        ? 20
        : averageCommitSize < 5
          ? (averageCommitSize / 5) * 20
          : Math.max(0, 20 - ((averageCommitSize - 15) / 10) * 20);

    // Lower technical debt is good
    const technicalDebtScore = Math.max(0, 30 - technicalDebtCount * 2);

    return Math.round(refactoringScore + bugFixScore + commitSizeScore + technicalDebtScore);
  }

  private generateImprovementSuggestions(
    refactoringFrequency: number,
    bugFixPercentage: number,
    technicalDebtIndicators: Array<{ file: string; issues: string[] }>
  ): string[] {
    const suggestions: string[] = [];

    if (refactoringFrequency < 10) {
      suggestions.push('Consider more frequent refactoring to maintain code quality');
    }

    if (bugFixPercentage > 30) {
      suggestions.push('High bug fix rate suggests need for better testing and code review');
    }

    if (technicalDebtIndicators.length > 10) {
      suggestions.push('Address technical debt indicators to improve code maintainability');
    }

    if (suggestions.length === 0) {
      suggestions.push('Code quality looks good! Keep up the excellent work.');
    }

    return suggestions;
  }
}
