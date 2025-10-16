#!/usr/bin/env node

/**
 * Interactive commit helper for conventional commits
 */

import { execSync } from 'child_process';
import readline from 'readline';

interface CommitType {
  value: string;
  description: string;
}

interface CommitScope {
  value: string;
  description: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => 
  new Promise((resolve) => rl.question(query, resolve));

const types: CommitType[] = [
  { value: 'feat', description: 'A new feature' },
  { value: 'fix', description: 'A bug fix' },
  { value: 'docs', description: 'Documentation only changes' },
  { value: 'style', description: 'Changes that do not affect the meaning of the code' },
  { value: 'refactor', description: 'A code change that neither fixes a bug nor adds a feature' },
  { value: 'perf', description: 'A code change that improves performance' },
  { value: 'test', description: 'Adding missing tests or correcting existing tests' },
  { value: 'chore', description: 'Changes to the build process or auxiliary tools' },
  { value: 'ci', description: 'Changes to CI configuration files and scripts' },
  { value: 'build', description: 'Changes that affect the build system or external dependencies' }
];

const scopes: CommitScope[] = [
  { value: 'cli', description: 'CLI interface changes' },
  { value: 'ai', description: 'AI service changes' },
  { value: 'git', description: 'Git integration changes' },
  { value: 'config', description: 'Configuration changes' },
  { value: 'perf', description: 'Performance improvements' },
  { value: 'deps', description: 'Dependency updates' },
  { value: '', description: 'No scope' }
];

async function main(): Promise<void> {
  console.log('🚀 DevSum CLI - Conventional Commit Helper');
  console.log('='.repeat(50));
  
  // Select type
  console.log('\n📝 Select commit type:');
  types.forEach((type, index) => {
    console.log(`  ${index + 1}. ${type.value} - ${type.description}`);
  });
  
  const typeIndex = await question('\nEnter type number: ');
  const selectedType = types[parseInt(typeIndex) - 1];
  
  if (!selectedType) {
    console.log('❌ Invalid type selection');
    process.exit(1);
  }
  
  // Select scope
  console.log('\n🎯 Select scope (optional):');
  scopes.forEach((scope, index) => {
    console.log(`  ${index + 1}. ${scope.value || 'none'} - ${scope.description}`);
  });
  
  const scopeIndex = await question('\nEnter scope number (or press Enter for none): ');
  const selectedScope = scopeIndex ? scopes[parseInt(scopeIndex) - 1] : scopes[scopes.length - 1];
  
  // Get description
  const description = await question('\n📄 Enter commit description: ');
  
  if (!description.trim()) {
    console.log('❌ Description is required');
    process.exit(1);
  }
  
  // Get body (optional)
  const body = await question('\n📝 Enter commit body (optional, press Enter to skip): ');
  
  // Get breaking change (optional)
  const breakingChange = await question('\n💥 Breaking change? (y/N): ');
  
  // Build commit message
  let commitMessage = selectedType.value;
  
  if (selectedScope && selectedScope.value) {
    commitMessage += `(${selectedScope.value})`;
  }
  
  commitMessage += `: ${description}`;
  
  if (body.trim()) {
    commitMessage += `\n\n${body}`;
  }
  
  if (breakingChange.toLowerCase() === 'y' || breakingChange.toLowerCase() === 'yes') {
    commitMessage += '\n\nBREAKING CHANGE: ';
    const breakingDescription = await question('Describe the breaking change: ');
    commitMessage += breakingDescription;
  }
  
  // Show preview
  console.log('\n📋 Commit message preview:');
  console.log('='.repeat(50));
  console.log(commitMessage);
  console.log('='.repeat(50));
  
  // Confirm
  const confirm = await question('\n✅ Proceed with this commit? (Y/n): ');
  
  if (confirm.toLowerCase() === 'n' || confirm.toLowerCase() === 'no') {
    console.log('❌ Commit cancelled');
    process.exit(0);
  }
  
  // Execute commit
  try {
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    console.log('\n✅ Commit created successfully!');
  } catch (error) {
    console.log('\n❌ Failed to create commit:', (error as Error).message);
    process.exit(1);
  }
  
  rl.close();
}

main().catch((error: Error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
