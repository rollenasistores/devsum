import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AuthConfig } from '../types/index.js';

const AUTH_DIR = path.join(os.homedir(), '.config', 'devsum');
const AUTH_FILE = path.join(AUTH_DIR, 'auth.json');

/**
 * Authentication manager for CLI
 * Handles OAuth flow and token management
 */
export class AuthManager {
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'https://devsum.vercel.app') {
    this.baseUrl = baseUrl;
  }

  /**
   * Ensure auth directory exists
   */
  public async ensureAuthDir(): Promise<void> {
    try {
      await fs.access(AUTH_DIR);
    } catch {
      await fs.mkdir(AUTH_DIR, { recursive: true });
    }
  }

  /**
   * Save authentication token
   */
  public async saveAuthToken(authConfig: AuthConfig): Promise<void> {
    await this.ensureAuthDir();
    await fs.writeFile(AUTH_FILE, JSON.stringify(authConfig, null, 2));
  }

  /**
   * Load authentication token
   */
  public async loadAuthToken(): Promise<AuthConfig | null> {
    try {
      const data = await fs.readFile(AUTH_FILE, 'utf-8');
      const authConfig = JSON.parse(data) as AuthConfig;

      // Check if token is expired
      if (new Date(authConfig.expiresAt) < new Date()) {
        await this.clearAuthToken();
        return null;
      }

      return authConfig;
    } catch {
      return null;
    }
  }

  /**
   * Clear authentication token
   */
  public async clearAuthToken(): Promise<void> {
    try {
      await fs.unlink(AUTH_FILE);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const authConfig = await this.loadAuthToken();
    return authConfig !== null;
  }

  /**
   * Get current auth token
   */
  public async getAuthToken(): Promise<string | null> {
    const authConfig = await this.loadAuthToken();
    return authConfig?.token || null;
  }

  /**
   * Validate token with backend
   */
  public async validateToken(): Promise<boolean> {
    const authConfig = await this.loadAuthToken();
    if (!authConfig) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: authConfig.token }),
      });

      if (!response.ok) {
        // Token is invalid, clear it
        await this.clearAuthToken();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Start OAuth flow
   */
  public async startOAuthFlow(): Promise<string> {
    const { default: open } = await import('open');

    // Generate random port for callback
    const port = Math.floor(Math.random() * 10000) + 30000;

    // Start local callback server
    const { createServer } = await import('http');
    const { URL } = await import('url');

    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        try {
          const url = new URL(req.url!, `http://localhost:${port}`);

          if (url.pathname === '/callback') {
            const token = url.searchParams.get('token');
            const success = url.searchParams.get('success');

            if (success === 'true' && token) {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>DevSum CLI Authentication</title>
                    <style>
                      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                      .success { color: #10b981; }
                      .error { color: #ef4444; }
                    </style>
                  </head>
                  <body>
                    <h1 class="success">✅ Authentication Successful!</h1>
                    <p>You can now close this window and return to the CLI.</p>
                    <script>setTimeout(() => window.close(), 2000);</script>
                  </body>
                </html>
              `);

              server.close();
              resolve(token);
            } else {
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>DevSum CLI Authentication</title>
                    <style>
                      body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                      .error { color: #ef4444; }
                    </style>
                  </head>
                  <body>
                    <h1 class="error">❌ Authentication Failed</h1>
                    <p>Please try again.</p>
                    <script>setTimeout(() => window.close(), 3000);</script>
                  </body>
                </html>
              `);

              server.close();
              reject(new Error('Authentication failed'));
            }
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
          }
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal server error');
          server.close();
          reject(error);
        }
      });

      server.listen(port, () => {
        // Open browser to login page
        const loginUrl = `${this.baseUrl}/auth/login?cli_port=${port}`;
        open(loginUrl);
      });

      // Timeout after 5 minutes
      setTimeout(
        () => {
          server.close();
          reject(new Error('Authentication timeout'));
        },
        5 * 60 * 1000
      );
    });
  }
}

export const authManager = new AuthManager();
