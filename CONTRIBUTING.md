# 🤝 Contributing to DevSum CLI

## 📋 **Commit Message Convention**

DevSum CLI uses [Conventional Commits](https://www.conventionalcommits.org/) for
automated versioning and changelog generation.

### **Commit Message Format**

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **Types**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or external dependencies

### **Scopes** (optional)

- `cli`: CLI interface changes
- `ai`: AI service changes
- `git`: Git integration changes
- `config`: Configuration changes
- `perf`: Performance improvements
- `deps`: Dependency updates

### **Examples**

#### **Features**

```bash
git commit -m "feat(cli): add new report format option"
git commit -m "feat(ai): support for new AI provider"
```

#### **Bug Fixes**

```bash
git commit -m "fix(git): handle empty repository gracefully"
git commit -m "fix(config): resolve configuration loading issue"
```

#### **Performance**

```bash
git commit -m "perf(install): reduce installation time by 50%"
git commit -m "perf(bundle): optimize bundle size"
```

#### **Breaking Changes**

```bash
git commit -m "feat(cli): redesign command interface

BREAKING CHANGE: The --output flag has been replaced with --format"
```

#### **Documentation**

```bash
git commit -m "docs: update installation guide"
git commit -m "docs(api): add JSDoc comments"
```

## 🚀 **Release Process**

### **Automatic Releases**

Releases are automatically triggered by commit messages:

- **Patch Release** (1.0.0 → 1.0.1): `fix:`, `perf:`, `docs:`, `style:`,
  `refactor:`, `test:`, `chore:`
- **Minor Release** (1.0.0 → 1.1.0): `feat:`
- **Major Release** (1.0.0 → 2.0.0): `BREAKING CHANGE:`

### **Pre-releases**

- **Beta Releases**: Commits to `develop` branch create beta releases
- **Release Candidates**: Use `feat!:` or `fix!:` for release candidates

## 🛠️ **Development Workflow**

### **1. Setup**

```bash
git clone https://github.com/rollenasistores/devsum.git
cd devsum
npm install
npm run dev-mode dev
```

### **2. Make Changes**

```bash
# Create feature branch
git checkout -b feat/new-feature

# Make changes
# ...

# Test changes
npm run test
npm run perf:test
```

### **3. Commit Changes**

```bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "feat(cli): add new feature"

# Push to branch
git push origin feat/new-feature
```

### **4. Create Pull Request**

- Use descriptive title
- Reference issues with `Fixes #123`
- Include breaking changes in description

## 📊 **Performance Requirements**

### **Before Submitting PR**

```bash
# Run all tests
npm run test

# Run performance tests
npm run perf:test

# Check for regressions
npm run check:regression
```

### **Performance Targets**

- **Core Installation**: < 15s
- **NPX Execution**: < 10s
- **Core Bundle**: < 1MB
- **Build Time**: < 5s
- **Memory Peak**: < 10MB

## 🧪 **Testing Guidelines**

### **Unit Tests**

```bash
npm test
npm run test:watch
npm run test:coverage
```

### **Performance Tests**

```bash
npm run benchmark
npm run monitor build
npm run optimize
```

### **Integration Tests**

```bash
# Test CLI commands
npm run dev
devsum --help
devsum setup
```

## 📝 **Code Style**

### **TypeScript**

- Use strict typing
- Add JSDoc comments for public APIs
- Follow existing patterns

### **Formatting**

```bash
npm run format
npm run format:check
```

### **Linting**

```bash
npm run lint
npm run typecheck
```

## 🔍 **Pull Request Guidelines**

### **Title Format**

```
<type>(<scope>): <description>
```

### **Description Template**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Performance improvement
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Performance tests pass
- [ ] Manual testing completed

## Performance Impact

- [ ] No performance impact
- [ ] Performance improvement
- [ ] Performance regression (explain)

## Breaking Changes

- [ ] No breaking changes
- [ ] Breaking changes (describe)
```

## 🚨 **Release Notes**

Semantic release automatically generates release notes based on commit messages:

### **Features**

- `feat:` commits appear in "Features" section
- `feat!:` commits appear in "Breaking Changes" section

### **Bug Fixes**

- `fix:` commits appear in "Bug Fixes" section

### **Performance**

- `perf:` commits appear in "Performance Improvements" section

### **Other Changes**

- `docs:`, `style:`, `refactor:`, `test:`, `chore:` commits appear in "Other
  Changes" section

## 📚 **Resources**

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [DevSum CLI Documentation](https://github.com/rollenasistores/devsum#readme)

---

**Questions?** Open an issue or start a discussion in the
[GitHub repository](https://github.com/rollenasistores/devsum).
