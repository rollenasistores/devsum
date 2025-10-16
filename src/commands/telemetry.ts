import { Command } from 'commander';
import chalk from 'chalk';
import { usageTracker } from '../core/usage-tracker.js';

export const telemetryCommand = new Command('telemetry')
  .description('Manage usage tracking and telemetry settings')
  .option('--enable', 'Enable usage tracking')
  .option('--disable', 'Disable usage tracking')
  .option('--status', 'Show current telemetry status')
  .action(async (options) => {
    if (options.enable) {
      usageTracker.setEnabled(true);
      console.log(chalk.green('✅ Usage tracking enabled'));
      console.log(chalk.gray('DevSum will anonymously track command usage to help improve the tool.'));
    } else if (options.disable) {
      usageTracker.setEnabled(false);
      console.log(chalk.yellow('⚠️  Usage tracking disabled'));
      console.log(chalk.gray('DevSum will not track any usage data.'));
    } else if (options.status) {
      const enabled = usageTracker.isEnabled();
      const userId = usageTracker.getUserId();
      
      console.log(chalk.blue('📊 Telemetry Status:'));
      console.log(chalk.gray(`  Enabled: ${enabled ? chalk.green('Yes') : chalk.red('No')}`));
      console.log(chalk.gray(`  User ID: ${userId}`));
      
      if (enabled) {
        console.log(chalk.gray('\n  DevSum tracks anonymous usage statistics to help improve the tool.'));
        console.log(chalk.gray('  No personal data or git content is collected.'));
        console.log(chalk.gray('  Use "devsum telemetry --disable" to opt out.'));
      } else {
        console.log(chalk.gray('\n  Usage tracking is disabled.'));
        console.log(chalk.gray('  Use "devsum telemetry --enable" to opt in.'));
      }
    } else {
      // Show current status by default
      const enabled = usageTracker.isEnabled();
      const userId = usageTracker.getUserId();
      
      console.log(chalk.blue('📊 Telemetry Status:'));
      console.log(chalk.gray(`  Enabled: ${enabled ? chalk.green('Yes') : chalk.red('No')}`));
      console.log(chalk.gray(`  User ID: ${userId}`));
      
      console.log(chalk.gray('\nUsage:'));
      console.log(chalk.gray('  devsum telemetry --enable    Enable usage tracking'));
      console.log(chalk.gray('  devsum telemetry --disable   Disable usage tracking'));
      console.log(chalk.gray('  devsum telemetry --status    Show current status'));
    }
  });
