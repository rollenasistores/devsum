import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Version manager class following TypeScript guidelines
 * Handles version-related operations and caching
 */
export class VersionManager {
  private static cachedVersion: string | undefined;

  /**
   * Get the current version from package.json
   * @returns The version string from package.json
   */
  public static getVersion(): string {
    if (this.cachedVersion) return this.cachedVersion;

    try {
      // Method 1: Try to use import.meta.url (works in ES modules)
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      // Go up from dist/src/utils/version.js to package.json
      const packagePath = join(__dirname, '../../../package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      this.cachedVersion = packageJson.version;
      return this.cachedVersion as string;
    } catch (error) {
      try {
        // Method 2: Try from current working directory
        const packagePath = join(process.cwd(), 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
        this.cachedVersion = packageJson.version;
        return this.cachedVersion as string;
      } catch (fallbackError) {
        try {
          // Method 3: Try from __dirname (if available)
          // @ts-ignore - __dirname might not be available but worth trying
          const packagePath = join(__dirname || '.', '../../../package.json');
          const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
          this.cachedVersion = packageJson.version;
          return this.cachedVersion as string;
        } catch (finalError) {
          // Final fallback version
          this.cachedVersion = '1.0.0';
          return this.cachedVersion;
        }
      }
    }
  }

  /**
   * Get a formatted version string with prefix
   * @param prefix Optional prefix (default: 'v')
   * @returns Formatted version string like 'v1.0.0'
   */
  public static getFormattedVersion(prefix: string = 'v'): string {
    return `${prefix}${this.getVersion()}`;
  }

  /**
   * Check if this is a development build
   * @returns True if NODE_ENV is development
   */
  public static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Get version with development suffix if applicable
   * @returns Version string with -dev suffix if in development
   */
  public static getVersionWithEnv(): string {
    const version = this.getVersion();
    return this.isDevelopment() ? `${version}-dev` : version;
  }

  /**
   * Clear cached version (useful for testing)
   */
  public static clearCache(): void {
    this.cachedVersion = undefined;
  }

  /**
   * Get version info object
   * @returns Object containing version information
   */
  public static getVersionInfo(): {
    version: string;
    formatted: string;
    isDevelopment: boolean;
    withEnv: string;
  } {
    return {
      version: this.getVersion(),
      formatted: this.getFormattedVersion(),
      isDevelopment: this.isDevelopment(),
      withEnv: this.getVersionWithEnv(),
    };
  }
}
