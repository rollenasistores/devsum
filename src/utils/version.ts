import { VersionManager } from './version-manager.js';

/**
 * Legacy function exports for backward compatibility
 * These delegate to the VersionManager class
 */

/**
 * Get the current version from package.json
 * @returns The version string from package.json
 */
export function getVersion(): string {
  return VersionManager.getVersion();
}

/**
 * Get a formatted version string with prefix
 * @param prefix Optional prefix (default: 'v')
 * @returns Formatted version string like 'v1.0.0'
 */
export function getFormattedVersion(prefix: string = 'v'): string {
  return VersionManager.getFormattedVersion(prefix);
}

/**
 * Check if this is a development build
 * @returns True if NODE_ENV is development
 */
export function isDevelopment(): boolean {
  return VersionManager.isDevelopment();
}

/**
 * Get version with development suffix if applicable
 * @returns Version string with -dev suffix if in development
 */
export function getVersionWithEnv(): string {
  return VersionManager.getVersionWithEnv();
}

// Export the VersionManager class for new code
export { VersionManager };