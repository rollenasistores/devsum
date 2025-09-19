import { Command } from 'commander';
import { SetupProcessor } from '../core/setup-processor.js';

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
    await this.processor.execute();
  }
}

// Create command instance
const setupCommandInstance = new SetupCommand();

export const setupCommand = new Command('setup')
  .description('Interactive setup for devsum configuration')
  .action(async () => {
    await setupCommandInstance.execute();
  });