import { Command } from 'commander';
import { SetupProcessor } from '../core/setup-processor.js';
import { usageTracker } from '../core/usage-tracker.js';

/**
 * Setup command class following TypeScript guidelines
 * Handles interactive configuration and provider management
 */
export class SetupCommand {
  private readonly processor: SetupProcessor;

  constructor() {
    this.processor = new SetupProcessor();
  }

  /**
   * Execute the setup command
   */
  public async execute(): Promise<void> {
    const startTime = Date.now()
    let success = false
    let metadata: any = {}

    try {
      await this.processor.execute();
      success = true
    } catch (error) {
      success = false
      throw error
    } finally {
      // Track usage
      const duration = Date.now() - startTime
      metadata = {
        duration,
        command: 'setup'
      }

      await usageTracker.trackUsage({
        commandType: 'commit', // Use commit as the closest match for setup
        userId: await usageTracker.getUserId(),
        success,
        metadata
      })
    }
  }
}

// Create command instance
const setupCommandInstance = new SetupCommand();

export const setupCommand = new Command('setup')
  .description('Interactive setup for devsum configuration')
  .action(async () => {
    await setupCommandInstance.execute();
  });
