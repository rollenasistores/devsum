# Changelog

All notable changes to DevSum CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2025-01-13

### Added
- **Timestamped report files** - Reports now include full timestamps (YYYY-MM-DD_HH-MM-SS) to prevent overwrites
- **Development mode support** - Added `--dev` flag for localhost development
- **Enhanced file organization** - Multiple reports per day without data loss

### Changed
- **Default API URL** - Updated to production server `https://api-devsum.rollenasistores.site/api`
- **File naming convention** - Reports now use format: `report-2025-09-13_14-30-45.md`
- **Documentation** - Updated README with timestamp examples and development instructions

### Fixed
- **Report overwrites** - Each report generation creates a unique file
- **Development workflow** - Easy switching between production and localhost

## [2.0.0] - 2025-01-13

### Added
- **DevSum API Integration** - Centralized cloud service for AI processing
- **Multiple Report Lengths** - Light, Short, and Detailed report options
- **AI Provider Selection** - Support for Gemini, Claude, and GPT-4 (coming soon)
- **User Authentication** - Registration, login, and token management
- **Report Length Options** - `--light`, `--short` flags for different use cases
- **AI Provider Flags** - `--ai` flag for selecting AI providers
- **Development Mode** - `--dev` flag for localhost development

### Changed
- **Architecture** - Moved from direct AI API calls to centralized DevSum API
- **Authentication** - Replaced API key management with DevSum account system
- **Command Structure** - Updated `devsum auth` for setup and authentication
- **Configuration** - Simplified config with DevSum API integration

### Removed
- **Direct AI API Integration** - No more individual API key management
- **Setup Command** - Merged into `devsum auth`
- **Login Command** - Integrated into authentication flow

## [1.3.0] - 2025-01-12

### Added
- **Multiple AI Providers** - Support for Gemini and Claude
- **Flexible Date Formats** - Relative dates (7d, 2w, 1m) and absolute dates
- **Author Filtering** - Filter commits by specific authors
- **JSON Output Format** - Structured data export option
- **Enhanced Error Handling** - Better error messages and troubleshooting

### Changed
- **Date Processing** - Improved date parsing and validation
- **Report Generation** - Enhanced AI prompt engineering
- **User Experience** - Better progress indicators and success messages

## [1.2.0] - 2025-01-11

### Added
- **Git Integration** - Automatic commit analysis and processing
- **Markdown Reports** - Beautiful formatted output
- **Interactive Setup** - Guided configuration wizard
- **Progress Indicators** - Visual feedback during processing

### Changed
- **CLI Interface** - Improved command structure and options
- **Error Handling** - Better error messages and recovery

## [1.1.0] - 2025-01-10

### Added
- **Basic Report Generation** - Initial AI-powered commit analysis
- **Command Line Interface** - Core CLI functionality
- **Configuration Management** - User settings and preferences

## [1.0.0] - 2025-01-09

### Added
- **Initial Release** - First version of DevSum CLI
- **Core Features** - Basic git commit analysis and report generation
- **Documentation** - README and setup instructions
