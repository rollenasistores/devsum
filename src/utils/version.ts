// src/utils/version.ts

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

let cachedVersion: string | undefined;

/**
 * Get the current version from package.json
 * @returns The version string from package.json
 */
export function getVersion(): string {
  if (cachedVersion) return cachedVersion;
  
  try {
    // Method 1: Try to use import.meta.url (works in ES modules)
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Go up from dist/src/utils/version.js to package.json
    const packagePath = join(__dirname, '../../../package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    cachedVersion = packageJson.version;
    return cachedVersion as string;
  } catch (error) {
    try {
      // Method 2: Try from current working directory
      const packagePath = join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
      cachedVersion = packageJson.version;
      return cachedVersion as string;
    } catch (fallbackError) {
      try {
        // Method 3: Try from __dirname (if available)
        // @ts-ignore - __dirname might not be available but worth trying
        const packagePath = join(__dirname || '.', '../../../package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
        cachedVersion = packageJson.version;
        return cachedVersion as string;
      } catch (finalError) {
        // Final fallback version
        cachedVersion = '1.0.0';
        return cachedVersion;
      }
    }
  }
}

/**
 * Get a formatted version string with prefix
 * @param prefix Optional prefix (default: 'v')
 * @returns Formatted version string like 'v1.0.0'
 */
export function getFormattedVersion(prefix: string = 'v'): string {
  return `${prefix}${getVersion()}`;
}

/**
 * Check if this is a development build
 * @returns True if NODE_ENV is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get version with development suffix if applicable
 * @returns Version string with -dev suffix if in development
 */
export function getVersionWithEnv(): string {
  const version = getVersion();
  return isDevelopment() ? `${version}-dev` : version;
}