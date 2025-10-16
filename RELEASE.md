# 🚀 Release Process

## 📋 **Overview**

DevSum CLI uses [Semantic Release](https://semantic-release.gitbook.io/) for
automated versioning and publishing based on
[Conventional Commits](https://www.conventionalcommits.org/).

## 🔄 **How It Works**

### **Automatic Versioning**

- **Patch Release** (1.0.0 → 1.0.1): Bug fixes, performance improvements,
  documentation
- **Minor Release** (1.0.0 → 1.1.0): New features
- **Major Release** (1.0.0 → 2.0.0): Breaking changes

### **Release Triggers**

- **Main Branch**: Creates stable releases
- **Develop Branch**: Creates beta pre-releases
- **Pull Requests**: No releases (testing only)

## 📝 **Commit Message Format**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **Types**

- `feat`: New feature → **Minor Release**
- `fix`: Bug fix → **Patch Release**
- `perf`: Performance improvement → **Patch Release**
- `docs`: Documentation → **Patch Release**
- `style`: Code style → **Patch Release**
- `refactor`: Code refactoring → **Patch Release**
- `test`: Tests → **Patch Release**
- `chore`: Maintenance → **Patch Release**
- `ci`: CI changes → **Patch Release**
- `build`: Build changes → **Patch Release**

### **Breaking Changes**

Use `BREAKING CHANGE:` in commit body for major releases:

```
feat(cli): redesign command interface

BREAKING CHANGE: The --output flag has been replaced with --format
```

## 🛠️ **Development Workflow**

### **1. Feature Development**

```bash
# Create feature branch
git checkout -b feat/new-feature

# Make changes
# ...

# Use commit helper
npm run commit

# Push and create PR
git push origin feat/new-feature
```

### **2. Release Process**

```bash
# Merge to main branch
git checkout main
git merge feat/new-feature

# Push to trigger release
git push origin main
```

### **3. Automated Release**

1. **Analyze Commits**: Determine version bump
2. **Generate Changelog**: Update CHANGELOG.md
3. **Update Version**: Bump package.json version
4. **Publish to NPM**: Publish new version
5. **Create GitHub Release**: With release notes
6. **Commit Changes**: Push version updates

## 📊 **Release Branches**

### **Main Branch** (`main`)

- **Releases**: Stable versions (1.0.0, 1.1.0, 2.0.0)
- **Trigger**: Push to main
- **NPM**: Published to `@rollenasistores/devsum`

### **Develop Branch** (`develop`)

- **Releases**: Beta pre-releases (1.1.0-beta.1, 1.1.0-beta.2)
- **Trigger**: Push to develop
- **NPM**: Published as beta versions

## 🔧 **Configuration**

### **Semantic Release Config** (`.releaserc.json`)

```json
{
  "branches": [
    "main",
    {
      "name": "develop",
      "prerelease": "beta"
    }
  ],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### **GitHub Actions** (`.github/workflows/release.yml`)

- **Trigger**: Push to main/develop
- **Steps**: Checkout → Setup Node → Install → Build → Test → Release
- **Secrets**: `GITHUB_TOKEN`, `NPM_TOKEN`

## 📋 **Release Checklist**

### **Before Release**

- [ ] All tests pass
- [ ] Performance tests pass
- [ ] Documentation updated
- [ ] Changelog reviewed
- [ ] Breaking changes documented

### **During Release**

- [ ] Semantic release analyzes commits
- [ ] Version is determined
- [ ] Changelog is generated
- [ ] Package is published to NPM
- [ ] GitHub release is created
- [ ] Version is committed back

### **After Release**

- [ ] Verify NPM package
- [ ] Check GitHub release
- [ ] Test installation
- [ ] Update documentation if needed

## 🚨 **Troubleshooting**

### **Release Failed**

1. Check GitHub Actions logs
2. Verify NPM_TOKEN is set
3. Check commit message format
4. Ensure all tests pass

### **Wrong Version Bump**

1. Check commit message types
2. Verify breaking change format
3. Review semantic-release logs

### **Missing Release Notes**

1. Check commit message format
2. Verify conventional commits
3. Review release notes generator

## 📚 **Useful Commands**

### **Local Testing**

```bash
# Test semantic release (dry run)
npx semantic-release --dry-run

# Check commit message format
npm run commit

# Switch to development mode
npm run dev-mode dev
```

### **Manual Release** (if needed)

```bash
# Create release manually
npm version patch|minor|major
npm publish
git push --tags
```

## 🎯 **Best Practices**

### **Commit Messages**

- Use conventional commit format
- Be descriptive but concise
- Include scope when relevant
- Document breaking changes

### **Branch Strategy**

- Use feature branches
- Merge to develop for testing
- Merge to main for releases
- Keep branches up to date

### **Release Management**

- Test thoroughly before merging
- Review changelog before release
- Monitor release process
- Verify published package

## 📈 **Release History**

See [CHANGELOG.md](./CHANGELOG.md) for detailed release history.

---

**Need Help?** Check the [Contributing Guide](./CONTRIBUTING.md) or open an
issue.
