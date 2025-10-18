import {
  CloudAIProvider,
  AIResponse,
  StagedChanges,
  CommitMessageOptions,
} from '../types/index.js';

/**
 * Cloud AI Service for proxying requests through backend API
 * Handles authentication and request routing
 */
export class CloudAIService {
  private readonly baseUrl: string;
  private readonly authToken: string;

  constructor(provider: CloudAIProvider) {
    this.baseUrl = provider.baseUrl || 'https://devsum.vercel.app';
    this.authToken = provider.apiKey;
  }

  /**
   * Generate accomplishment report from git commits
   */
  public async generateReport(
    commits: readonly any[],
    length: string = 'detailed'
  ): Promise<AIResponse> {
    const prompt = this.buildReportPrompt(commits, length);

    const response = await this.makeRequest({
      provider: 'gemini', // Default to Gemini for reports
      operation: 'generateReport',
      prompt,
      options: { length },
    });

    return response.result;
  }

  /**
   * Generate commit message from staged changes
   */
  public async generateCommitMessage(
    changes: StagedChanges,
    options: CommitMessageOptions
  ): Promise<string> {
    const prompt = this.buildCommitPrompt(changes, options);

    const response = await this.makeRequest({
      provider: 'gemini', // Default to Gemini for commits
      operation: 'generateCommit',
      prompt,
      options,
    });

    return response.result;
  }

  /**
   * Generate branch name from staged changes
   */
  public async generateBranchName(changes: StagedChanges): Promise<string> {
    const prompt = this.buildBranchNamePrompt(changes);

    const response = await this.makeRequest({
      provider: 'gemini',
      operation: 'generateBranchName',
      prompt,
    });

    return response.result;
  }

  /**
   * Generate pull request title from staged changes
   */
  public async generatePullRequestTitle(changes: StagedChanges): Promise<string> {
    const prompt = this.buildPullRequestTitlePrompt(changes);

    const response = await this.makeRequest({
      provider: 'gemini',
      operation: 'generatePullRequestTitle',
      prompt,
    });

    return response.result;
  }

  /**
   * Generate commit message with detailed diff analysis
   */
  public async generateDetailedCommitMessage(
    changes: StagedChanges,
    diffContent: string,
    options: CommitMessageOptions
  ): Promise<string> {
    const prompt = this.buildDetailedCommitPrompt(changes, diffContent, options);

    const response = await this.makeRequest({
      provider: 'gemini',
      operation: 'generateCommit',
      prompt,
      options,
    });

    return response.result;
  }

  /**
   * Generate alternative branch name when there's a conflict
   */
  public async generateAlternativeBranchName(
    changes: StagedChanges,
    existingBranches: string[],
    originalName: string
  ): Promise<string> {
    const prompt = this.buildAlternativeBranchNamePrompt(changes, existingBranches, originalName);

    const response = await this.makeRequest({
      provider: 'gemini',
      operation: 'generateBranchName',
      prompt,
    });

    return response.result;
  }

  /**
   * Make authenticated request to backend API
   */
  private async makeRequest(requestData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/ai/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.authToken}`,
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please run "devsum login" to re-authenticate.');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Build report generation prompt
   */
  private buildReportPrompt(commits: readonly any[], length: string): string {
    const commitSummaries = commits
      .map(commit => {
        const date = commit.date.split('T')[0];
        const files = commit.files.slice(0, 3).join(', ');
        const moreFiles = commit.files.length > 3 ? '...' : '';
        return `- ${date} | ${commit.message} | Files: ${files}${moreFiles}`;
      })
      .join('\n');

    const lengthInstructions = this.getLengthInstructions(length);

    return `Please analyze the following git commits and generate an accomplishment report.

Git Commits:
${commitSummaries}

${lengthInstructions}

Please provide a response in the following format:

**Summary:**
[A brief overview of the work done]

**Key Accomplishments:**
- [Accomplishment 1]
- [Accomplishment 2]
- [Accomplishment 3]

**Technical Highlights:**
- [Technical detail 1]
- [Technical detail 2]

Focus on the impact and value of the changes rather than just listing commits. Group related changes together and highlight the most significant contributions.`;
  }

  /**
   * Get length-specific instructions
   */
  private getLengthInstructions(length: string): string {
    const instructions = {
      light: `Generate a LIGHT report with:
- Very brief summary (1-2 sentences)
- Top 3-5 key accomplishments only
- Minimal technical details
- Focus on high-level impact and business value
- Keep it concise and executive-friendly`,

      short: `Generate a SHORT report with:
- Concise summary (2-3 sentences)
- 5-8 key accomplishments
- Some technical highlights
- Balanced detail level for quick review
- Good for daily/weekly updates`,

      detailed: `Generate a DETAILED report with:
- Comprehensive summary (3-5 sentences)
- 8-15 key accomplishments
- Extensive technical highlights and improvements
- Detailed analysis of patterns and trends
- Recommendations for future work
- Perfect for comprehensive reviews and documentation`,
    };

    return instructions[length as keyof typeof instructions] || instructions.detailed;
  }

  /**
   * Build commit message prompt
   */
  private buildCommitPrompt(changes: StagedChanges, options: CommitMessageOptions): string {
    const { conventional, emoji, length } = options;

    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}

Change Analysis:
- Added files: ${changes.addedFiles.length} (${changes.addedFiles.join(', ') || 'none'})
- Modified files: ${changes.modifiedFiles.length} (${changes.modifiedFiles.join(', ') || 'none'})
- Deleted files: ${changes.deletedFiles.length} (${changes.deletedFiles.join(', ') || 'none'})`;

    let formatInstructions = '';
    if (conventional) {
      formatInstructions = `
Use conventional commit format: <type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
Examples: feat(auth): add login validation
         fix(api): resolve timeout issue
         docs: update README`;
    }

    if (emoji) {
      formatInstructions += `
Use appropriate emojis:
✨ feat: new features
🐛 fix: bug fixes
📚 docs: documentation
🎨 style: formatting
♻️ refactor: code changes
✅ test: testing
🔧 chore: maintenance`;
    }

    let lengthInstructions = '';
    switch (length) {
      case 'short':
        lengthInstructions =
          'Generate a SHORT commit message as a bulleted list (2-3 bullet points, each 50-80 characters). Focus on the most significant changes only with descriptive sentences.';
        break;
      case 'medium':
        lengthInstructions =
          'Generate a MEDIUM commit message as a bulleted list (3-5 bullet points, each 60-100 characters). Include key changes and improvements with detailed descriptions.';
        break;
      case 'detailed':
        lengthInstructions =
          'Generate a DETAILED commit message as a bulleted list (4-7 bullet points, each 80-120 characters). Provide comprehensive analysis of ALL changes made with long, descriptive sentences that explain what was changed, why it was changed, and the impact of the changes.';
        break;
    }

    return `Generate a comprehensive commit message for the following changes:

${changeSummary}

Requirements:
${lengthInstructions}
${formatInstructions}

IMPORTANT: Analyze ALL the changes thoroughly and create detailed bullet points that capture:
- Every significant change made to the codebase
- New functionality that was added
- Bugs that were fixed
- Code refactoring or improvements
- Configuration or documentation updates
- Any architectural changes or optimizations

Format the commit message as a bulleted list where each bullet point describes a specific change:
- Use present tense ("Fix bug" not "Fixed bug")
- Start each bullet with a verb (Fix, Add, Update, Remove, Refactor, etc.)
- Be specific about what was changed and why
- Each bullet should be a long, descriptive sentence (80-120 characters)
- Cover ALL significant changes, not just the main ones
- Include technical details about the implementation and impact

Generate only the commit message as a bulleted list, no additional text:`;
  }

  /**
   * Build branch name prompt
   */
  private buildBranchNamePrompt(changes: StagedChanges): string {
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}`;

    return `Generate a git branch name for the following changes:

${changeSummary}

Requirements:
- Use conventional branch naming: type/description
- Common types: feature, fix, hotfix, chore, docs, refactor, test
- Description should be 2-4 words, kebab-case
- Be descriptive but concise
- Focus on the main purpose of the changes
- Examples: feature/user-authentication, fix/login-bug, refactor/api-endpoints

Generate only the branch name, no additional text:`;
  }

  /**
   * Build pull request title prompt
   */
  private buildPullRequestTitlePrompt(changes: StagedChanges): string {
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}`;

    return `Generate a pull request title for the following changes:

${changeSummary}

Requirements:
- Generate a SINGLE SENTENCE title (under 60 characters)
- Use present tense ("Add feature" not "Added feature")
- Be concise but descriptive
- Focus on the main purpose or impact of the changes
- Start with a verb (Add, Fix, Update, Remove, Refactor, etc.)
- Avoid technical jargon when possible

Examples of good PR titles:
- Add user authentication system
- Fix login validation bug
- Update README with installation guide
- Remove deprecated API endpoints
- Refactor database connection handling

Generate only the pull request title, no additional text:`;
  }

  /**
   * Build detailed commit prompt with diff content
   */
  private buildDetailedCommitPrompt(
    changes: StagedChanges,
    diffContent: string,
    options: CommitMessageOptions
  ): string {
    const { conventional, emoji, length } = options;

    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}

Change Analysis:
- Added files: ${changes.addedFiles.length} (${changes.addedFiles.join(', ') || 'none'})
- Modified files: ${changes.modifiedFiles.length} (${changes.modifiedFiles.join(', ') || 'none'})
- Deleted files: ${changes.deletedFiles.length} (${changes.deletedFiles.join(', ') || 'none'})`;

    let formatInstructions = '';
    if (conventional) {
      formatInstructions = `
Use conventional commit format: <type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, test, chore
Examples: feat(auth): add login validation
         fix(api): resolve timeout issue
         docs: update README`;
    }

    if (emoji) {
      formatInstructions += `
Use appropriate emojis:
✨ feat: new features
🐛 fix: bug fixes
📚 docs: documentation
🎨 style: formatting
♻️ refactor: code changes
✅ test: testing
🔧 chore: maintenance`;
    }

    let lengthInstructions = '';
    switch (length) {
      case 'short':
        lengthInstructions =
          'Generate a SHORT commit message as a bulleted list (2-3 bullet points, each 50-80 characters). Focus on the most significant changes only with descriptive sentences.';
        break;
      case 'medium':
        lengthInstructions =
          'Generate a MEDIUM commit message as a bulleted list (3-5 bullet points, each 60-100 characters). Include key changes and improvements with detailed descriptions.';
        break;
      case 'detailed':
        lengthInstructions =
          'Generate a DETAILED commit message as a bulleted list (4-7 bullet points, each 80-120 characters). Provide comprehensive analysis of ALL changes made with long, descriptive sentences that explain what was changed, why it was changed, and the impact of the changes.';
        break;
    }

    // Truncate diff content if it's too long (keep first 2000 characters)
    const truncatedDiff =
      diffContent.length > 2000
        ? diffContent.substring(0, 2000) + '\n... (diff truncated for brevity)'
        : diffContent;

    return `Generate a comprehensive commit message for the following changes:

${changeSummary}

Detailed Code Changes:
${truncatedDiff}

Requirements:
${lengthInstructions}
${formatInstructions}

IMPORTANT: Analyze the actual code changes in the diff above and create detailed bullet points that capture:
- Every significant change made to the codebase based on the actual diff
- New functionality that was added (analyze the + lines)
- Bugs that were fixed (analyze the - and + lines)
- Code refactoring or improvements (analyze the changes)
- Configuration or documentation updates
- Any architectural changes or optimizations
- Specific methods, functions, or classes that were modified

Format the commit message as a bulleted list where each bullet point describes a specific change:
- Use present tense ("Fix bug" not "Fixed bug")
- Start each bullet with a verb (Fix, Add, Update, Remove, Refactor, etc.)
- Be specific about what was changed and why based on the actual diff
- Each bullet should be a long, descriptive sentence (80-120 characters)
- Cover ALL significant changes visible in the diff
- Include technical details about the implementation and impact

Generate only the commit message as a bulleted list, no additional text:`;
  }

  /**
   * Build alternative branch name prompt when there's a conflict
   */
  private buildAlternativeBranchNamePrompt(
    changes: StagedChanges,
    existingBranches: string[],
    originalName: string
  ): string {
    const fileSummary = changes.stagedFiles
      .map(file => {
        const isAdded = changes.addedFiles.includes(file);
        const isDeleted = changes.deletedFiles.includes(file);
        const isModified = changes.modifiedFiles.includes(file);

        let status = 'modified';
        if (isAdded) status = 'added';
        else if (isDeleted) status = 'deleted';

        return `- ${file} (${status})`;
      })
      .join('\n');

    const changeSummary = `Files changed: ${changes.stagedFiles.length}
Insertions: +${changes.diffStats.insertions}
Deletions: -${changes.diffStats.deletions}

Files:
${fileSummary}`;

    // Build existing branches list
    const existingBranchesList = existingBranches.length > 0 ? existingBranches.join(', ') : 'none';

    return `Generate a DIFFERENT git branch name for the following changes:

${changeSummary}

IMPORTANT: The branch name "${originalName}" already exists in this repository.

Existing branches: ${existingBranchesList}

Requirements:
- Use conventional branch naming: type/description
- Common types: feature, fix, hotfix, chore, docs, refactor, test
- Description should be 2-4 words, kebab-case
- Be descriptive but concise
- Focus on the main purpose of the changes
- Generate a COMPLETELY DIFFERENT name from "${originalName}"
- Avoid using similar words or patterns from existing branches
- Examples: feature/user-authentication, fix/login-bug, refactor/api-endpoints

Generate only the branch name, no additional text:`;
  }
}
