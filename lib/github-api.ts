interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
}

interface GitHubPackageJson {
  version: string;
}

interface GitHubRepoStats {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  subscribers_count: number;
}

interface GitHubContributor {
  id: number;
  login: string;
  contributions: number;
}

interface NpmDownloadStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

interface AnalyticsData {
  github: {
    stars: number;
    forks: number;
    watchers: number;
    contributors: number;
    downloads: number;
  };
  usage: {
    totalCommands: number;
    commits: number;
    reports: number;
    analytics: number;
    activeUsers: number;
  };
  trends: {
    productivity: string;
    commitsTrend: string;
    filesTrend: string;
    usersTrend: string;
  };
}

export async function getLatestRelease(): Promise<GitHubRelease | null> {
  try {
    const response = await fetch('https://api.github.com/repos/rollenasistores/devsum/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'devsum-web'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No releases found, this is not an error
        return null;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching latest release:', error);
    return null;
  }
}

export async function getPackageVersion(): Promise<string | null> {
  try {
    const response = await fetch('https://raw.githubusercontent.com/rollenasistores/devsum/main/package.json', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'devsum-web'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const packageJson: GitHubPackageJson = await response.json();
    return packageJson.version;
  } catch (error) {
    console.error('Error fetching package version:', error);
    return null;
  }
}

export async function getLatestVersion(): Promise<string> {
  try {
    // Try to get the latest release first
    const release = await getLatestRelease();
    if (release?.tag_name) {
      // Remove 'v' prefix if present
      return release.tag_name.replace(/^v/, '');
    }

    // Fallback to package.json version
    const packageVersion = await getPackageVersion();
    if (packageVersion) {
      return packageVersion;
    }
  } catch (error) {
    console.error('Error fetching version from GitHub:', error);
  }

  // Final fallback - this should match the current CLI version
  return '1.5.4';
}

export async function getRepoStats(): Promise<GitHubRepoStats | null> {
  try {
    const response = await fetch('https://api.github.com/repos/rollenasistores/devsum', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'devsum-web',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Repository not found or private
        return null;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching repo stats:', error);
    return null;
  }
}

export async function getContributorCount(): Promise<number> {
  try {
    const response = await fetch('https://api.github.com/repos/rollenasistores/devsum/contributors?per_page=1', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'devsum-web',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` })
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Repository not found or private
        return 0;
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    // Get total count from Link header
    const linkHeader = response.headers.get('Link');
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        return parseInt(lastPageMatch[1]);
      }
    }

    // Fallback: count contributors from response
    const contributors: GitHubContributor[] = await response.json();
    return contributors.length;
  } catch (error) {
    console.error('Error fetching contributor count:', error);
    return 0;
  }
}

export async function getDownloadStats(): Promise<number> {
  try {
    // Try multiple time periods to get the most accurate count
    const timePeriods = [
      'last-30-days',
      'last-year',
      'last-month'
    ];

    for (const period of timePeriods) {
      try {
        const response = await fetch(`https://api.npmjs.org/downloads/point/${period}/@rollenasistores/devsum`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'devsum-web'
          },
          next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (response.ok) {
          const data: NpmDownloadStats = await response.json();
          if (data.downloads && data.downloads > 0) {
            return data.downloads;
          }
        }
      } catch (periodError) {
        console.warn(`Failed to fetch downloads for ${period}:`, periodError);
        continue;
      }
    }

    // If all periods fail, return 0
    return 0;
  } catch (error) {
    console.error('Error fetching download stats:', error);
    return 0;
  }
}

export async function aggregateAnalytics(usageData: any): Promise<AnalyticsData> {
  try {
    // Fetch GitHub data in parallel
    const [repoStats, contributorCount, downloadStats] = await Promise.all([
      getRepoStats(),
      getContributorCount(),
      getDownloadStats()
    ]);

    // Calculate trends (simplified for now)
    const productivity = '94%';
    const commitsTrend = '+12%';
    const filesTrend = '+8%';
    const usersTrend = '+3';

    return {
      github: {
        stars: repoStats?.stargazers_count || 0,
        forks: repoStats?.forks_count || 0,
        watchers: repoStats?.watchers_count || 0,
        contributors: contributorCount,
        downloads: downloadStats
      },
      usage: {
        totalCommands: usageData?.totalCommands || 0,
        commits: usageData?.commits || 0,
        reports: usageData?.reports || 0,
        analytics: usageData?.analytics || 0,
        activeUsers: usageData?.activeUsers || 0,
        successRate: usageData?.successRate || 0,
        platformStats: usageData?.platformStats || {},
        recentActivity: usageData?.recentActivity || 0
      },
      trends: {
        productivity,
        commitsTrend,
        filesTrend,
        usersTrend
      }
    };
  } catch (error) {
    console.error('Error aggregating analytics:', error);
    // Return fallback data
    return {
      github: {
        stars: 0,
        forks: 0,
        watchers: 0,
        contributors: 0,
        downloads: 0
      },
      usage: {
        totalCommands: 0,
        commits: 0,
        reports: 0,
        analytics: 0,
        activeUsers: 0,
        successRate: 0,
        platformStats: {},
        recentActivity: 0
      },
      trends: {
        productivity: '0%',
        commitsTrend: '+0%',
        filesTrend: '+0%',
        usersTrend: '+0'
      }
    };
  }
}
