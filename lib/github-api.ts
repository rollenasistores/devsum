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
  return '1.6.0';
}
