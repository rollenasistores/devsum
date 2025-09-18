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
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🎯 Features](#-features) • [🤖 AI Providers](#-ai-providers) • [💡 Examples](#-examples)

</div>

---

## 🎯 What is DevSum?

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

### 📊 **Multiple Output Formats**
- Beautiful Markdown reports
- Structured JSON data
- Stunning HTML presentations
- PDF exports *(coming soon)*

</td>
</tr>
<tr>
<td>

### ⚙️ **Flexible Filtering**
- Date range selection
- Author-specific reports
- Branch filtering
- Custom time periods

</td>
<td>

### 🌟 **Developer Experience**
- Interactive setup wizard
- Beautiful terminal UI
- Comprehensive error handling
- Offline configuration

</td>
</tr>
</table>

## 🚀 Quick Start

### 📦 Installation

```bash
# Install globally via npm
npm install -g @rollenasistores/devsum

# Or use with npx (no installation needed)
npx devsum setup
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
devsum report --since 7d

# Generate report for specific date range
devsum report --since 2025-09-01

# Generate report for specific author
devsum report --author "John Doe" --since 30d

# Generate JSON report
devsum report --format json --since 2025-08-01

# Generate HTML presentation
devsum report --format html --since 7d

# Generate different report lengths
devsum report --light           # Brief executive summary
devsum report --short           # Quick daily update
devsum report --detailed        # Comprehensive analysis (default)

# Or use the long form
devsum report --length light    # Brief executive summary
devsum report --length short    # Quick daily update
devsum report --length detailed # Comprehensive analysis (default)
```

## 🤖 AI Providers

DevSum supports multiple AI providers to fit your needs and budget:

### 🤖 **Google Gemini** *(Recommended for beginners)*
- ✅ **Free tier available** (15 requests/minute)
- ⚡ Fast processing with `gemini-2.0-flash`
- 🧠 Detailed analysis with `gemini-1.5-pro`
- 🧠 Balanced performance with `gemini-1.5-flash`
- 🔗 [Get API Key](https://aistudio.google.com/app/apikey)

### 🧠 **Anthropic Claude** *(Advanced reasoning)*
- 🎯 Superior reasoning capabilities  
- 📝 High-quality report generation
- 💰 Pay-per-use pricing
- 🔗 [Get API Key](https://console.anthropic.com/)

### 🚀 **OpenAI GPT-4** *(Industry leading)*
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

#### `devsum report`
Generate accomplishment reports from git commits.

```bash
devsum report [options]

Options:
  -s, --since <date>     Include commits since this date (YYYY-MM-DD or relative like "7d")
  -u, --until <date>     Include commits until this date (YYYY-MM-DD)  
  -a, --author <name>    Filter commits by author name
  -o, --output <path>    Custom output file path
  -f, --format <format>  Output format (markdown|json|html) [default: markdown]
  -l, --length <length>  Report length (light|short|detailed) [default: detailed]
  --light               Shortcut for --length light (brief executive summary)
  --short               Shortcut for --length short (quick daily update)
  --detailed            Shortcut for --length detailed (comprehensive analysis)
  --no-header           Skip the fancy header display
```

#### `devsum login`
View information about DevSum's free mode and available features.

```bash
devsum login
```

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
```

### 📁 Output Structure

Reports are saved to `./reports/` by default (configurable) with timestamped filenames:

```
reports/
├── report-2025-09-10T14-30-45.md           # Detailed report with timestamp
├── report-2025-09-10T14-30-45-light.html   # Light HTML presentation
├── report-2025-09-10T14-30-45-short.json   # Short JSON report
└── team-sprint-report.html                 # Custom HTML report
```

## 💡 Examples

### 📊 Weekly Team Report

```bash
# Generate team accomplishment report for the last week
devsum report --since 7d --output ./reports/weekly-team-report.md
```

**Sample Output:**

```markdown
# 🚀 Development Accomplishment Report

**Generated:** September 10, 2025, 2:30:45 PM  
**Branch:** `main`  
**Period:** 7d to present  
**Commits Analyzed:** 23

## 📋 Executive Summary

The development team has demonstrated strong productivity this week with significant 
progress across multiple features. Key highlights include the implementation of user 
authentication, performance optimizations, and comprehensive testing coverage...

## 🎯 Key Accomplishments

- Implemented OAuth2 authentication system with Google and GitHub providers
- Optimized database queries resulting in 40% faster page load times  
- Added comprehensive unit tests bringing coverage to 85%
- Fixed critical security vulnerability in user input validation
- Deployed new CI/CD pipeline reducing deployment time by 60%
```

### 🎯 Personal Performance Review

```bash
# Generate personal report for performance review
devsum report --author "$(git config user.name)" --since 3m --format json
```

### 📈 Sprint Retrospective

```bash
# Generate sprint report for specific date range
devsum report --since 2025-08-26 --until 2025-09-08 --output sprint-15-report.md
```

### 📊 Report Length Examples

```bash
# Light report - Perfect for executive summaries
devsum report --light --since 7d

# Short report - Great for daily standups
devsum report --short --since today

# Detailed report - Comprehensive analysis (default)
devsum report --detailed --since 30d

# Or use the long form
devsum report --length light --since 7d
devsum report --length short --since today
devsum report --length detailed --since 30d

# Generate HTML presentations
devsum report --format html --light --since 7d
devsum report --format html --short --since today
devsum report --format html --detailed --since 30d
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
devsum report --since 30d

# Or check if commits exist
git log --oneline
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

## 📜 License

This project is licensed under the **Apache License 2.0** - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/rollenasistores/devsum/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/rollenasistores/devsum/discussions)
- 📧 **Email:** support@devsum.dev
- 🐦 **Twitter:** [@devsum_cli](https://twitter.com/devsum_cli)

## 🗺️ Roadmap

- [x] **HTML Report Generation** - Beautiful web reports with modern styling
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
