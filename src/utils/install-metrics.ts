/**
 * Installation metrics utility
 * Tracks installation performance and user experience
 */

export interface InstallMetrics {
  readonly startTime: number;
  readonly endTime?: number;
  readonly duration?: number;
  dependenciesInstalled: number;
  optionalDependenciesInstalled: number;
  totalSize: number;
  readonly errors: string[];
  readonly warnings: string[];
}

export class InstallMetricsTracker {
  private static instance: InstallMetricsTracker;
  private metrics: InstallMetrics;

  private constructor() {
    this.metrics = {
      startTime: Date.now(),
      dependenciesInstalled: 0,
      optionalDependenciesInstalled: 0,
      totalSize: 0,
      errors: [],
      warnings: [],
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): InstallMetricsTracker {
    if (!InstallMetricsTracker.instance) {
      InstallMetricsTracker.instance = new InstallMetricsTracker();
    }
    return InstallMetricsTracker.instance;
  }

  /**
   * Track dependency installation
   */
  public trackDependencyInstalled(isOptional: boolean = false): void {
    if (isOptional) {
      this.metrics.optionalDependenciesInstalled++;
    } else {
      this.metrics.dependenciesInstalled++;
    }
  }

  /**
   * Track file size
   */
  public trackFileSize(size: number): void {
    this.metrics.totalSize += size;
  }

  /**
   * Track error
   */
  public trackError(error: string): void {
    this.metrics.errors.push(error);
  }

  /**
   * Track warning
   */
  public trackWarning(warning: string): void {
    this.metrics.warnings.push(warning);
  }

  /**
   * Complete installation tracking
   */
  public complete(): InstallMetrics {
    const endTime = Date.now();
    const duration = endTime - this.metrics.startTime;

    this.metrics = {
      ...this.metrics,
      endTime,
      duration,
    };

    return this.metrics;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): InstallMetrics {
    return { ...this.metrics };
  }

  /**
   * Format metrics for display
   */
  public formatMetrics(): string {
    const metrics = this.complete();
    const duration = metrics.duration || 0;
    const sizeInMB = (metrics.totalSize / (1024 * 1024)).toFixed(2);

    return `
📊 Installation Metrics:
   ⏱️  Duration: ${duration}ms
   📦 Dependencies: ${metrics.dependenciesInstalled} core, ${metrics.optionalDependenciesInstalled} optional
   💾 Size: ${sizeInMB}MB
   ❌ Errors: ${metrics.errors.length}
   ⚠️  Warnings: ${metrics.warnings.length}
    `.trim();
  }

  /**
   * Log metrics to console
   */
  public logMetrics(): void {
    console.log(this.formatMetrics());
  }

  /**
   * Save metrics to file
   */
  public async saveMetrics(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const metrics = this.complete();

    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Reset metrics (useful for testing)
   */
  public reset(): void {
    this.metrics = {
      startTime: Date.now(),
      dependenciesInstalled: 0,
      optionalDependenciesInstalled: 0,
      totalSize: 0,
      errors: [],
      warnings: [],
    };
  }
}

/**
 * Global metrics tracker instance
 */
export const installMetrics = InstallMetricsTracker.getInstance();
