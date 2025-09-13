# 🚀 DevSum CLI

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

*Transform your git commits into professional accomplishment reports with the power of AI*

[![npm version](https://badge.fury.io/js/@rollenasistores%2Fdevsum.svg)](https://badge.fury.io/js/@rollenasistores%2Fdevsum.svg)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🎯 Features](#-features) • [🤖 AI Providers](#-ai-providers) • [💡 Examples](#-examples)

</div>

---

## 🎯 What is DevSum CLI?

DevSum CLI is a powerful command-line tool that automatically generates professional accomplishment reports from your git commit history using AI. Perfect for:

- **📊 Performance Reviews** - Showcase your technical contributions
- **🎯 Sprint Reports** - Summarize team accomplishments  
- **📝 Project Updates** - Keep stakeholders informed
- **🏆 Portfolio Building** - Document your development journey

## ✨ Features

<table>
<tr>
<td>

### 🤖 **AI-Powered Analysis**
- Smart commit summarization
- Achievement extraction
- Technical insight generation
- Actionable recommendations
- Multiple report lengths (Light, Short, Detailed)

</td>
<td>

### 🌐 **Cloud-Powered Service**
- No API key management needed
- Secure authentication
- Scalable infrastructure
- Always up-to-date AI models
- Zero configuration required

</td>
</tr>
<tr>
<td>

### 📊 **Multiple Output Formats**
- Beautiful Markdown reports
- Structured JSON data
- HTML presentations *(coming soon)*
- PDF exports *(coming soon)*

</td>
<td>

### ⚙️ **Flexible Filtering**
- Date range selection
- Author-specific reports
- Branch filtering
- Custom time periods
- Today's commits support

</td>
</tr>
<tr>
<td>

### 🌟 **Developer Experience**
- Interactive setup wizard
- Beautiful terminal UI
- Comprehensive error handling
- Offline configuration
- Multiple AI provider support

</td>
<td>

### 🔐 **Secure Authentication**
- User registration & login
- Secure token management
- Profile management
- Token generation & revocation

</td>
</tr>
</table>

## 🚀 Quick Start

### 📦 Installation

```bash
# Install globally via npm
npm install -g @rollenasistores/devsum

# Or use with npx (no installation needed)
npx @rollenasistores/devsum auth
```

### ⚡ Setup (One-time)

```bash
# Interactive setup wizard
devsum auth
```

The setup will:
1. Configure your output directory
2. Let you choose your preferred AI provider
3. Register/login to DevSum service
4. Set up authentication tokens

### 📊 Generate Your First Report

```bash
# Generate detailed report for the last 7 days
devsum report --since 7d

# Generate short report for today
devsum report --today --short

# Generate light report for specific author
devsum report --author "John Doe" --since 7d --light

# Generate JSON report
devsum report --format json --since 2025-08-01
```

## 🤖 AI Providers

DevSum supports multiple AI providers through our cloud service:

### 🤖 **Google Gemini** *(Currently Available)*
- ✅ **Powered by DevSum Cloud** - No API key needed
- ⚡ Fast processing with `gemini-2.0-flash`
- 🧠 Advanced analysis capabilities
- 🔄 Automatic token management

### 🧠 **Claude (Anthropic)** *(Coming Soon)*
- 🎯 Advanced reasoning capabilities  
- 📝 Superior report quality
- 🔄 Seamless integration via DevSum Cloud

### 🧠 **GPT-4 (OpenAI)** *(Coming Soon)*
- 🎯 Latest OpenAI models
- 📝 High-quality analysis
- 🔄 Integrated via DevSum Cloud

## 📖 Documentation

### 🛠️ Commands

#### `devsum auth`
Authentication and setup wizard for DevSum service.

```bash
devsum auth                    # Interactive setup
devsum auth --register        # Register new account
devsum auth --login           # Login to existing account
devsum auth --logout          # Logout and revoke token
devsum auth --dev             # Use development server (localhost)
```

#### `devsum report`
Generate accomplishment reports from git commits.

```bash
devsum report [options]

Options:
  -s, --since <date>     Include commits since this date (YYYY-MM-DD, "today", or relative like "7d")
  -u, --until <date>     Include commits until this date (YYYY-MM-DD or "today")
  -a, --author <name>    Filter commits by author name
  -o, --output <path>    Custom output file path
  -f, --format <format>  Output format (markdown|json) [default: markdown]
  --short                Generate short, concise report
  --light                Generate light, minimal report
  --ai <provider>        Select AI provider (gemini|claude|gpt-4|coming-soon) [default: gemini]
  --today                Shortcut for --since today
  --no-header           Skip the fancy header display
```

#### `devsum test`
Test connectivity to DevSum service.

```bash
devsum test              # Test service connection
devsum test --dev        # Test development server (localhost)
```

### 📊 Report Lengths

DevSum offers three report lengths to fit your needs:

#### 🌟 **Light Report** (`--light`)
- **Perfect for:** Daily standups, quick updates
- **Content:** One-sentence summary + top 2-3 accomplishments
- **Size:** ~3-5 lines

#### 📝 **Short Report** (`--short`)
- **Perfect for:** Weekly summaries, team updates
- **Content:** Brief summary + key accomplishments + recent commits
- **Size:** ~15-20 lines

#### 📋 **Detailed Report** (default)
- **Perfect for:** Performance reviews, comprehensive analysis
- **Content:** Full executive summary + all accomplishments + technical highlights + detailed commit analysis
- **Size:** ~50+ lines

### 📅 Date Formats

DevSum supports flexible date formats:

```bash
# Absolute dates
devsum report --since 2025-09-01
devsum report --since 2025-08-15 --until 2025-09-15

# Relative dates  
devsum report --since 7d        # Last 7 days
devsum report --since 2w        # Last 2 weeks
devsum report --since 1m        # Last 1 month
devsum report --since 3m        # Last 3 months

# Today's commits
devsum report --today           # All commits from today
devsum report --since today     # Same as --today
```

### 📁 Output Structure

Reports are saved to `./reports/` by default (configurable):

```
reports/
├── report-2025-09-13.md      # Today's detailed report
├── report-2025-09-12-short.md # Yesterday's short report
├── report-2025-09-11-light.md # Light report
└── team-sprint-report.md     # Custom named report
```

## 💡 Examples

### 📊 Daily Standup (Light Report)

```bash
# Generate light report for today's standup
devsum report --today --light
```

**Sample Output:**
```markdown
# 🚀 Dev Report

**Period:** Today (2025-09-13 00:00:00 to 14:30) | **Commits:** 5

## Summary
Completed user authentication implementation and fixed critical bugs in the payment system.

## Key Points
• Implemented OAuth2 authentication with Google and GitHub
• Fixed payment processing bug affecting 15% of transactions
• Added comprehensive error handling for API endpoints

---
*Generated by DevSum CLI*
```

### 📝 Weekly Team Report (Short Report)

```bash
# Generate short report for weekly team update
devsum report --since 7d --short --output weekly-update.md
```

### 📋 Performance Review (Detailed Report)

```bash
# Generate detailed report for performance review
devsum report --author "$(git config user.name)" --since 3m
```

### 🎯 Sprint Retrospective

```bash
# Generate sprint report for specific date range
devsum report --since 2025-08-26 --until 2025-09-08 --output sprint-15-report.md
```

### 🤖 AI Provider Selection

```bash
# Use different AI providers (coming soon)
devsum report --ai claude --since 7d
devsum report --ai gpt-4 --today --short
```

## ⚙️ Configuration

### 📂 Config File Location

- **Linux/macOS:** `~/.config/devsum/config.json`
- **Windows:** `%APPDATA%\devsum\config.json`

### 🔧 Configuration Structure

```json
{
  "provider": "devsum-api",
  "apiKey": "",
  "defaultOutput": "./reports",
  "model": "devsum-gemini",
  "devsumApiUrl": "https://api-devsum.rollenasistores.site/api",
  "devsumToken": "your-auth-token-here",
  "aiProvider": "gemini"
}
```

## 🚨 Requirements

- **Node.js** 18.0.0 or higher
- **Git** repository (must be run within a git repo)
- **DevSum Account** (free registration)

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
devsum auth
```

#### ❌ "Authentication failed"
```bash
# Re-authenticate
devsum auth --login
```

#### ❌ "No commits found"
```bash
# Try broader date range
devsum report --since 30d

# Or check if commits exist
git log --oneline
```

#### ❌ "Failed to connect to DevSum service"
```bash
# Test service connection
devsum test

# Check your internet connection
ping api-devsum.rollenasistores.site

# For development, use localhost
devsum auth --dev
```

### 🔍 Debug Mode

For detailed error information:

```bash
DEBUG=devsum* devsum report --since 7d
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/rollenasistores/devsum.git`
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

### 🔧 Development Mode

For developers working on DevSum CLI or testing with local API:

```bash
# Use development server (localhost:8000)
devsum auth --dev

# Test with development server
devsum test --dev

# Generate reports using local API
devsum report --since 7d
```

**Note:** Development mode automatically switches to `http://localhost:8000/api` for local testing.

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/rollenasistores/devsum/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/rollenasistores/devsum/discussions)
- 📧 **Email:** support@devsum.com
- 🐦 **Twitter:** [@devsum_cli](https://twitter.com/devsum_cli)

## 🗺️ Roadmap

- [x] **DevSum Cloud Service** - Centralized AI processing
- [x] **Multiple Report Lengths** - Light, Short, Detailed reports
- [x] **User Authentication** - Registration, login, token management
- [x] **AI Provider Selection** - Gemini, Claude, GPT-4 support
- [ ] **HTML Report Generation** - Beautiful web reports
- [ ] **PDF Export** - Professional PDF reports  
- [ ] **Team Collaboration** - Multi-user support
- [ ] **Integration APIs** - Slack, Teams, Jira
- [ ] **Custom Templates** - Personalized report formats
- [ ] **Analytics Dashboard** - Web-based insights
- [ ] **Multi-Repository** - Aggregate reports across repos

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rollenasistores/devsum&type=Date)](https://star-history.com/#rollenasistores/devsum&Date)

---

<div align="center">

**Made with ❤️ by developers, for developers**

*If DevSum helps you showcase your accomplishments, please consider giving it a ⭐!*

[⬆️ Back to Top](#-devsum-cli)

</div>