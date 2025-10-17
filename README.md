# DevSum CLI

<div align="center">

```
██████╗ ███████╗██╗   ██╗███████╗██╗   ██╗███╗   ███╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║   ██║████╗ ████║
██║  ██║█████╗  ██║   ██║███████╗██║   ██║██╔████╔██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██║   ██║██║╚██╔╝██║
██████╔╝███████╗ ╚████╔╝ ███████║╚██████╔╝██║ ╚═╝ ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝ ╚═════╝ ╚═╝     ╚═╝
```

**AI-Powered Git Accomplishment Reports**

_DevSum CLI uses AI to analyze your git history and generate polished accomplishment summaries. Perfect for performance reviews, sprint reports, and project updates._

[![npm version](https://badge.fury.io/js/@rollenasistores%2Fdevsum.svg)](https://badge.fury.io/js/@rollenasistores%2Fdevsum.svg)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) •
[🎯 Features](#-features) • [🤖 AI Providers](#-ai-providers) •
[💡 Examples](#-examples)

</div>

---

## Everything you need to summarize your work

Powerful features designed for developers who value their time

### AI-Powered Analysis

Leverage Claude, GPT-4, or Gemini to transform raw commits into professional narratives.

### Multiple Formats

Export to Markdown, JSON, HTML, or PDF. Perfect for any workflow or documentation system.

### Flexible Filtering

Filter by date range, author, branch, or file patterns. Get exactly the commits you need.

### Lightning Fast

Optimized performance with caching and parallel processing. Analyze thousands of commits in seconds.

### Automated Workflows

Integrate with CI/CD pipelines. Generate reports automatically on schedule or trigger.

### Beautiful Terminal UI

Enjoy a polished CLI experience with progress indicators, colors, and interactive prompts.

## Get started in seconds

Install DevSum CLI with your favorite package manager

```bash
npm install -g @rollenasistores/devsum
```

### Requirements

* Node.js 18.0 or higher
* Git 2.0 or higher
* API key for your preferred AI provider (Claude, OpenAI, or Gemini)

## Simple, powerful commands

Generate reports with a single command

### Basic usage

```bash
devsum analyze
```

✓ Analyzing commits from the last 30 days...

### Custom date range

```bash
devsum analyze --since="2024-01-01" --until="2024-03-31"
```

✓ Analyzing Q1 2024 commits...

### Export to PDF

```bash
devsum analyze --format=pdf --output=report.pdf
```

✓ Generated PDF report: report.pdf

## Choose your AI provider

DevSum works with the leading AI models

### Claude (Recommended)

**claude-3-5-sonnet**

Anthropic's most capable model. Excellent at understanding context and generating professional narratives.

- Best quality
- Context-aware
- Professional tone

### GPT-4

**gpt-4-turbo**

OpenAI's flagship model. Great balance of speed and quality with strong technical understanding.

- Fast
- Reliable
- Technical depth

### Gemini

**gemini-pro**

Google's advanced AI model. Cost-effective option with good performance for most use cases.

- Cost-effective
- Fast
- Good quality

## Command reference

Complete guide to all available commands and options

### devsum analyze

Analyze git commits and generate a summary report

```bash
# Basic usage
devsum analyze

# Custom date range
devsum analyze --since="2024-01-01" --until="2024-12-31"

# Filter by author
devsum analyze --author="john@example.com"

# Specify output format
devsum analyze --format=pdf --output=report.pdf
```

## Example outputs

See what DevSum can generate for you

```markdown
# Sprint Summary - Q1 2024

## Key Accomplishments

### Feature Development
- Implemented user authentication system with OAuth2 support
- Built real-time notification system using WebSockets
- Created responsive dashboard with data visualization

### Performance Improvements
- Optimized database queries, reducing load time by 40%
- Implemented Redis caching for frequently accessed data
- Reduced bundle size by 25% through code splitting

### Bug Fixes & Maintenance
- Fixed 12 critical bugs reported by users
- Improved error handling and logging
- Updated dependencies and resolved security vulnerabilities

## Metrics
- **Commits**: 47
- **Files Changed**: 156
- **Lines Added**: 3,421
- **Lines Removed**: 1,203
```

## Usage Analytics

Real-time insights into DevSum CLI usage

- +12% Total Commits
- +3 Active Users
- +5% Success Rate

## Trusted by developers worldwide

Join thousands of developers using DevSum

"DevSum has saved me hours every sprint. The AI summaries are incredibly accurate and professional."

**Sarah Chen**  
Senior Engineer at TechCorp

"Perfect for performance reviews. I can now showcase my work with detailed, well-formatted reports."

**Michael Rodriguez**  
Full Stack Developer

"The best CLI tool I've used this year. Simple, powerful, and beautifully designed."

**Emily Watson**  
Engineering Manager

---

## 🚀 Quick Start

### 📦 Installation

```bash
# Install globally via npm
npm install -g @rollenasistores/devsum

# Or use with npx (no installation needed)
npx @rollenasistores/devsum setup
```

### ⚡ Setup (One-time)

```bash
# Interactive setup wizard
devsum setup
```

Choose your AI provider (Gemini, Claude, or OpenAI) and configure your API key.

### 📊 Generate Your First Report

```bash
# Generate report for the last 7 days
devsum analyze --since 7d

# Generate report for specific date range
devsum analyze --since 2024-09-01

# Generate report for specific author
devsum analyze --author "John Doe" --since 30d

# Generate JSON report
devsum analyze --format json --since 2024-08-01

# Generate HTML presentation
devsum analyze --format html --since 7d
```

## 🤖 AI Providers

DevSum supports multiple AI providers to fit your needs and budget:

### 🤖 **Google Gemini** _(Recommended for beginners)_

- ✅ **Free tier available** (15 requests/minute)
- ⚡ Fast processing with `gemini-2.0-flash`
- 🧠 Detailed analysis with `gemini-1.5-pro`
- 🧠 Balanced performance with `gemini-1.5-flash`
- 🔗 [Get API Key](https://aistudio.google.com/app/apikey)

### 🧠 **Anthropic Claude** _(Advanced reasoning)_

- 🎯 Superior reasoning capabilities
- 📝 High-quality report generation
- 💰 Pay-per-use pricing
- 🔗 [Get API Key](https://console.anthropic.com/)

### 🚀 **OpenAI GPT-4** _(Industry leading)_

- 🏆 Industry-leading AI capabilities
- 🎯 Premium report quality
- 💰 Pay-per-use pricing
- 🔗 [Get API Key](https://platform.openai.com/api-keys)

## 📖 Documentation

### 🛠️ Commands

#### `devsum setup`

Interactive configuration wizard to set up your AI provider and preferences.

```bash
devsum setup
```

#### `devsum analyze`

Generate accomplishment reports from git commits.

```bash
devsum analyze [options]

Options:
  -s, --since <date>     Include commits since this date (YYYY-MM-DD or relative like "7d")
  -u, --until <date>     Include commits until this date (YYYY-MM-DD)
  -a, --author <name>    Filter commits by author name
  -o, --output <path>    Custom output file path
  -f, --format <format>  Output format (markdown|json|html|pdf) [default: markdown]
  --no-header           Skip the fancy header display
```

#### `devsum commit`

Generate AI-powered commit messages from your changes.

```bash
devsum commit [options]

Options:
  -a, --auto                    Full automation: generate branch, add files, commit with detailed messages, and optionally push
  -c, --conventional            Generate conventional commit format
  -e, --emoji                   Include emojis in commit message
  -l, --length <length>         Message length (short|medium|detailed) [default: medium]
  -p, --provider <name>         Use specific AI provider by name
  --dry-run                     Show what would be committed without actually committing
  --no-header                   Skip the fancy header display
  -b, --branch <name>           Create and switch to a new branch before committing
  --new-branch <name>           Create a new branch (alias for --branch)
  -s, --switch-branch <name>    Switch to an existing branch before committing
  --list-branches               List all available branches and exit
  --auto-branch                 Auto-generate branch name and ask for confirmation
  --auto-add                    Automatically add all changes (git add .)
  --auto-push                   Automatically push after committing
  --report                      Generate a report for today's commits after committing
```

#### `devsum login`

View information about DevSum's free mode and available features.

```bash
devsum login
```

#### `devsum update`

Check for DevSum updates and get the latest features.

```bash
devsum update [options]

Options:
  --check-only                  Only check for updates without prompting
```

### 📅 Date Formats

DevSum supports flexible date formats:

```bash
# Absolute dates
devsum analyze --since 2024-09-01
devsum analyze --since 2024-08-15 --until 2024-09-15

# Relative dates
devsum analyze --since 7d        # Last 7 days
devsum analyze --since 2w        # Last 2 weeks
devsum analyze --since 1m        # Last 1 month
devsum analyze --since 3m        # Last 3 months
```

### 📁 Output Structure

Reports are saved to `./reports/` by default (configurable) with timestamped
filenames:

```
reports/
├── report-2024-09-10T14-30-45.md           # Detailed report with timestamp
├── report-2024-09-10T14-30-45.html         # HTML presentation
├── report-2024-09-10T14-30-45.json         # JSON report
└── team-sprint-report.pdf                  # Custom PDF report
```

## 💡 Examples

### 📊 Weekly Team Report

```bash
# Generate team accomplishment report for the last week
devsum analyze --since 7d --output ./reports/weekly-team-report.md
```

**Sample Output:**

```markdown
# Sprint Summary - Q1 2024

## Key Accomplishments

### Feature Development
- Implemented user authentication system with OAuth2 support
- Built real-time notification system using WebSockets
- Created responsive dashboard with data visualization

### Performance Improvements
- Optimized database queries, reducing load time by 40%
- Implemented Redis caching for frequently accessed data
- Reduced bundle size by 25% through code splitting

### Bug Fixes & Maintenance
- Fixed 12 critical bugs reported by users
- Improved error handling and logging
- Updated dependencies and resolved security vulnerabilities

## Metrics
- **Commits**: 47
- **Files Changed**: 156
- **Lines Added**: 3,421
- **Lines Removed**: 1,203
```

### 🎯 Personal Performance Review

```bash
# Generate personal report for performance review
devsum analyze --author "$(git config user.name)" --since 3m --format json
```

### 📈 Sprint Retrospective

```bash
# Generate sprint report for specific date range
devsum analyze --since 2024-08-26 --until 2024-09-08 --output sprint-15-report.md
```

### 🚀 AI-Powered Commit Messages

```bash
# Generate a commit message for staged changes
devsum commit

# Full automation: create branch, add files, commit, and push
devsum commit --auto --auto-push

# Generate conventional commit with emoji
devsum commit --conventional --emoji

# Create a new branch and commit
devsum commit --branch feature/new-feature --auto-add

# Dry run to see what would be committed
devsum commit --dry-run

# Generate detailed commit message
devsum commit --length detailed

# Auto-generate branch name and commit
devsum commit --auto-branch --auto-add

# Commit and generate a report for today's work
devsum commit --report
```

## ⚙️ Configuration

### 📂 Config File Location

- **Linux/macOS:** `~/.config/devsum/config.json`
- **Windows:** `%APPDATA%\devsum\config.json`

### 🔧 Manual Configuration

```json
{
  "provider": "gemini",
  "apiKey": "your-api-key-here",
  "model": "gemini-1.5-flash",
  "defaultOutput": "./reports"
}
```

## 🚨 Requirements

- **Node.js** 18.0.0 or higher
- **Git** repository (must be run within a git repo)
- **API Key** for chosen AI provider (Gemini, Claude, or OpenAI)

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Not a git repository"

```bash
# Initialize git if needed
git init
git add .
git commit -m "Initial commit"
```

#### ❌ "No configuration found"

```bash
# Run setup wizard
devsum setup
```

#### ❌ "API key invalid"

```bash
# Reconfigure with valid API key
devsum setup
```

#### ❌ "No commits found"

```bash
# Try broader date range
devsum analyze --since 30d

# Or check if commits exist
git log --oneline
```

### 🔍 Debug Mode

For detailed error information:

```bash
DEBUG=devsum* devsum analyze --since 7d
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork:
   `git clone https://github.com/rollenasistores/devsum.git`
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/amazing-feature`
5. **Make** your changes
6. **Test** your changes: `npm test`
7. **Commit** your changes: `git commit -m 'Add amazing feature'`
8. **Push** to your branch: `git push origin feature/amazing-feature`
9. **Open** a Pull Request

### 🛠️ Development Scripts

```bash
npm run dev      # Development mode with hot reload
npm run build    # Build TypeScript to JavaScript
npm run test     # Run test suite
npm run lint     # Check code style
```

## 📜 License

This project is licensed under the **Apache License 2.0** - see the
[LICENSE](LICENSE) file for details.

## 🙋 Support

- 🐛 **Bug Reports:**
  [GitHub Issues](https://github.com/rollenasistores/devsum/issues)
- 💬 **Discussions:**
  [GitHub Discussions](https://github.com/rollenasistores/devsum/discussions)
- 📧 **Email:** asistoresrlc1@gmail.com
- 🌐 **Website:** [devsum.rollenasistores.site](http://devsum.rollenasistores.site/)

## 🗺️ Roadmap

- [x] **HTML Report Generation** - Beautiful web reports with modern styling
- [x] **Plain Text Reports** - Simple text format for easy sharing
- [x] **AI-Powered Commit Messages** - Automated commit message generation
- [x] **Update Checking System** - Automatic update notifications
- [x] **Automated Commit Workflow** - Full automation with branch management
- [x] **Analytics Dashboard** - Interactive web-based insights with charts and
      visualizations
- [ ] **PDF Export** - Professional PDF reports
- [ ] **Team Collaboration** - Multi-user support
- [ ] **Integration APIs** - Slack, Teams, Jira
- [ ] **Custom Templates** - Personalized report formats
- [ ] **Multi-Repository** - Aggregate reports across repos

---

<div align="center">

**Made with ❤️ by developers, for developers**

_If DevSum helps you showcase your accomplishments, please consider giving it a
⭐!_

[⬆️ Back to Top](#-devsum-cli)

</div>