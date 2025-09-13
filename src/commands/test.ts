import { Command } from 'commander';
import chalk from 'chalk';

export const testCommand = new Command('test')
    .description('Test connection to DevSum API')
    .option('--dev', 'Use development server (localhost)')
    .action(async (options) => {
        console.log(chalk.cyan('🧪 Testing DevSum API Connection'));
        console.log();

        const apiUrl = options.dev ? 'http://localhost:8000/api' : 'https://api-devsum.rollenasistores.site/api';

        if (options.dev) {
            console.log(chalk.yellow('🔧 Development mode: Testing localhost server'));
        }

        console.log(chalk.gray(`Testing: ${apiUrl}`));
        console.log();

        try {
            // Test health endpoint first
            console.log(chalk.blue('1️⃣ Testing health endpoint...'));
            const healthResponse = await fetch(`${apiUrl}/health`);

            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log(chalk.green('✅ Health check passed!'));
                console.log(chalk.gray(`   Status: ${healthData.status}`));
                console.log(chalk.gray(`   Message: ${healthData.message}`));
            } else {
                console.log(chalk.red(`❌ Health check failed: ${healthResponse.status}`));
            }

            console.log();

            // Test auth endpoint
            console.log(chalk.blue('2️⃣ Testing auth endpoint...'));
            const authResponse = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                }),
            });

            const authData = await authResponse.json();

            if (authResponse.ok) {
                console.log(chalk.green('✅ Auth endpoint working!'));
                console.log(chalk.gray(`   Response: ${authData.message}`));
            } else {
                console.log(chalk.yellow('⚠️  Auth endpoint responded with error (this is expected for test data)'));
                console.log(chalk.gray(`   Status: ${authResponse.status}`));
                console.log(chalk.gray(`   Message: ${authData.message}`));
            }

            console.log();
            console.log(chalk.green('🎉 API connection test completed!'));
            console.log(chalk.blue('💡 You can now run: devsum auth'));

        } catch (error) {
            console.log(chalk.red('❌ Connection failed:'));
            console.log(chalk.red(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
            console.log();

            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.log(chalk.yellow('💡 Troubleshooting:'));
                console.log(chalk.gray('   • Make sure your Laravel API server is running:'));
                console.log(chalk.gray('     cd devsum-api'));
                console.log(chalk.gray('     php artisan serve'));
                console.log();
                console.log(chalk.gray('   • Check if the server is running on the correct port'));
                console.log(chalk.gray('   • Verify there are no firewall issues'));
            }
        }
    });
