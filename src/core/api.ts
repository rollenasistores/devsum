import { Config, GitCommit, AIResponse } from '../types/index.js';

export interface DevSumApiResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    token?: string;
    token_type?: string;
}

export class DevSumApiService {
    private baseUrl: string;
    private token: string;

    constructor(config: Config) {
        this.baseUrl = config.devsumApiUrl || 'https://api-devsum.rollenasistores.site/api';
        this.token = config.devsumToken || '';
    }

    /**
     * Register a new user with DevSum API
     */
    async register(name: string, email: string, password: string): Promise<DevSumApiResponse> {
        try {
            console.log(`🔗 Connecting to: ${this.baseUrl}/auth/register`);

            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Registration failed (${response.status})`);
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(`Failed to connect to DevSum API at ${this.baseUrl}. Please check if the server is running.`);
            }
            throw error;
        }
    }

    /**
     * Login user with DevSum API
     */
    async login(email: string, password: string): Promise<DevSumApiResponse> {
        try {
            console.log(`🔗 Connecting to: ${this.baseUrl}/auth/login`);

            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Login failed (${response.status})`);
            }

            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error(`Failed to connect to DevSum API at ${this.baseUrl}. Please check if the server is running.`);
            }
            throw error;
        }
    }

    /**
     * Get user profile
     */
    async getProfile(): Promise<DevSumApiResponse> {
        const response = await fetch(`${this.baseUrl}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get profile');
        }

        return data;
    }

    /**
     * Generate a new token
     */
    async generateToken(): Promise<DevSumApiResponse> {
        const response = await fetch(`${this.baseUrl}/auth/generate-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate token');
        }

        return data;
    }

    /**
     * Logout (revoke current token)
     */
    async logout(): Promise<DevSumApiResponse> {
        const response = await fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Logout failed');
        }

        return data;
    }

    /**
     * Generate AI report using DevSum API
     */
    async generateReport(commits: GitCommit[], length?: 'short' | 'light' | 'detailed'): Promise<AIResponse> {
        const response = await fetch(`${this.baseUrl}/ai/generate-report`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                commits,
                length: length || 'detailed',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error Response:', data);
            throw new Error(data.message || `Failed to generate report (${response.status})`);
        }

        // The Laravel API returns { success: true, data: { summary, accomplishments } }
        // We need to return just the data part
        if (data.success && data.data) {
            return data.data;
        }

        // Fallback if the response format is different
        return data;
    }

    /**
     * Check if the current token is valid
     */
    async validateToken(): Promise<boolean> {
        try {
            await this.getProfile();
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Set the API token
     */
    setToken(token: string): void {
        this.token = token;
    }

    /**
     * Get the current API token
     */
    getToken(): string {
        return this.token;
    }
}
