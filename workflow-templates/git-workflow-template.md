# Git Workflow Template

## Overview
This document defines the Git workflow for **{{PROJECT_NAME}}** using **{{BRANCHING_STRATEGY}}** methodology.

*Team: {{TEAM_SIZE}} developers | Repo: {{REPO_URL}} | Primary branch: {{MAIN_BRANCH}}*

## Branch Strategy: {{BRANCHING_STRATEGY}}

{{#if (eq BRANCHING_STRATEGY "GitFlow")}}
### Main Branches
- **{{MAIN_BRANCH}}**: Production-ready code
- **develop**: Integration branch for features

### Supporting Branches
- **feature/{{FEATURE_NAMING}}**: New features
- **bugfix/{{BUG_NAMING}}**: Bug fixes  
- **hotfix/{{HOTFIX_NAMING}}**: Critical production fixes
- **release/{{RELEASE_NAMING}}**: Release preparation
{{/if}}

{{#if (eq BRANCHING_STRATEGY "GitHub Flow")}}
### Branches
- **{{MAIN_BRANCH}}**: Production-ready code (protected)
- **feature/{{FEATURE_NAMING}}**: All new work branches
- **hotfix/{{HOTFIX_NAMING}}**: Critical fixes
{{/if}}

{{#if (eq BRANCHING_STRATEGY "GitLab Flow")}}
### Environment Branches
- **{{MAIN_BRANCH}}**: Main development
- **pre-production**: Pre-prod environment
- **production**: Production environment
- **feature/{{FEATURE_NAMING}}**: Feature development
{{/if}}

## Development Workflow

### 1. Starting New Work
```{{SHELL_TYPE}}
# Update local {{TARGET_BRANCH}} branch
git checkout {{TARGET_BRANCH}}
git pull origin {{TARGET_BRANCH}}

# Create feature branch with auto-generated name
git checkout -b {{BRANCH_PREFIX}}/{{ISSUE_ID}}-{{FEATURE_DESCRIPTION}}

{{#if HAS_PRE_COMMIT}}
# Install pre-commit hooks if not already done
{{PRE_COMMIT_INSTALL}}
{{/if}}
```

### 2. Development Process
```{{SHELL_TYPE}}
# Make your changes following {{CODING_STANDARDS}}

{{#each QUALITY_CHECKS}}
# {{this.description}}
{{this.command}}
{{/each}}

# Stage changes
git add .

# Commit with conventional format
git commit -m "{{COMMIT_TYPE}}({{SCOPE}}): {{DESCRIPTION}}"
# Examples:
# feat(auth): add OAuth2 integration
# fix(api): resolve timeout error in user endpoint
# docs(readme): update installation instructions

# Push branch to remote
git push -u origin {{BRANCH_PREFIX}}/{{ISSUE_ID}}-{{FEATURE_DESCRIPTION}}
```

### 3. Pull Request Creation
{{#if HAS_PR_TEMPLATE}}
- [x] Auto-populated PR template used
{{/if}}
- [x] Target branch: **{{TARGET_BRANCH}}**
- [x] Reviewers assigned: {{DEFAULT_REVIEWERS}}
- [x] Issue linked: {{ISSUE_TRACKER_INTEGRATION}}
- [x] Labels applied: {{AUTO_LABELS}}
- [x] CI/CD checks configured

### 4. Code Review Process
- [x] **{{MIN_REVIEWERS}}** approvals required
- [x] {{REVIEW_CHECKLIST_NAME}} completed
- [x] All {{CI_CHECKS}} must pass
- [x] Security scan: {{SECURITY_SCAN_TOOL}}
- [x] No unresolved conversations
- [x] Branch up-to-date with {{TARGET_BRANCH}}

### 5. Merge Process
- **Strategy**: {{MERGE_STRATEGY}}
- **Auto-delete**: {{AUTO_DELETE_BRANCHES}}
- **Post-merge**: {{POST_MERGE_ACTIONS}}

## Commit Message Guidelines

### Format
```
[type]([scope]): [description]

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```
feat(auth): add user authentication
fix(api): resolve login endpoint error
docs: update README installation steps
```

## Branching Rules

### Branch Protection (main/master)
- [ ] Require pull request reviews
- [ ] Dismiss stale reviews when new commits are pushed
- [ ] Require status checks to pass
- [ ] Require branches to be up to date before merging
- [ ] Restrict pushes that create files
- [ ] Allow force pushes: **[FORCE_PUSH_POLICY]**

### Branch Naming Convention
```
feature/add-user-dashboard
bugfix/fix-login-redirect
hotfix/security-patch-auth
release/v1.2.0
```

## Release Process

### Version Numbering: {{VERSIONING_SCHEME}}
{{#if (eq VERSIONING_SCHEME "Semantic Versioning")}}
- **Major** (X.0.0): {{MAJOR_CHANGE_DEFINITION}}
- **Minor** (0.X.0): {{MINOR_CHANGE_DEFINITION}}  
- **Patch** (0.0.X): {{PATCH_CHANGE_DEFINITION}}
{{/if}}

{{#if (eq VERSIONING_SCHEME "CalVer")}}
- **Format**: {{CALVER_FORMAT}} (e.g., YYYY.MM.DD)
- **Components**: {{CALVER_COMPONENTS}}
{{/if}}

### Automated Release Pipeline
```{{SHELL_TYPE}}
{{#if (eq BRANCHING_STRATEGY "GitFlow")}}
# GitFlow release process
git checkout develop
git pull origin develop
git checkout -b release/{{RELEASE_VERSION}}

# Auto-update version files
{{VERSION_UPDATE_COMMAND}}

# Generate changelog
{{CHANGELOG_COMMAND}}

# Run release tests
{{RELEASE_TEST_COMMAND}}

# Merge to main and tag
git checkout {{MAIN_BRANCH}}
git merge --no-ff release/{{RELEASE_VERSION}}
git tag -a {{TAG_PREFIX}}{{RELEASE_VERSION}} -m "Release {{RELEASE_VERSION}}"
git push origin {{MAIN_BRANCH}} --tags

# Merge back to develop
git checkout develop
git merge --no-ff {{MAIN_BRANCH}}
git push origin develop
{{/if}}

{{#if (eq BRANCHING_STRATEGY "GitHub Flow")}}
# GitHub Flow release process
# Create release from {{MAIN_BRANCH}}
git checkout {{MAIN_BRANCH}}
git pull origin {{MAIN_BRANCH}}
git tag -a {{TAG_PREFIX}}{{RELEASE_VERSION}} -m "Release {{RELEASE_VERSION}}"
git push origin --tags

# Trigger deployment
{{DEPLOY_COMMAND}}
{{/if}}
```

### Release Checklist
{{#each RELEASE_CHECKLIST}}
- [ ] {{this}}
{{/each}}

## Hotfix Process

### Emergency Fixes
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/[ISSUE_NAME]

# Make minimal fix
# Test thoroughly
# Create PR for review (expedited)

# After merge, tag the hotfix
git tag v[VERSION]
git push origin --tags
```

## Git Hooks

### Pre-commit Hooks
- [ ] Code formatting: **[FORMATTER]**
- [ ] Linting: **[LINTER]**
- [ ] Tests: **[TEST_COMMAND]**
- [ ] Security scan: **[SECURITY_SCAN]**

### Pre-push Hooks
- [ ] Full test suite
- [ ] Build verification

## Best Practices

### Do's
- ✅ Write clear, descriptive commit messages
- ✅ Keep commits small and focused
- ✅ Review code before committing
- ✅ Test changes locally before pushing
- ✅ Keep feature branches short-lived

### Don'ts
- ❌ Commit directly to main/master
- ❌ Force push to shared branches
- ❌ Include sensitive information in commits
- ❌ Commit broken code
- ❌ Use generic commit messages like "fix"

## Troubleshooting

### Common Scenarios
1. **Merge conflicts**
   ```bash
   git fetch origin
   git rebase origin/main
   # Resolve conflicts
   git add .
   git rebase --continue
   ```

2. **Undo last commit**
   ```bash
   git reset --soft HEAD~1  # Keep changes
   git reset --hard HEAD~1  # Discard changes
   ```

3. **Update feature branch with main**
   ```bash
   git checkout feature/branch-name
   git rebase origin/main
   ```

## Template Configuration

*This template auto-detects project settings and can be customized via `.workflow-config.json`*

### Auto-Detected Settings
- `{{PROJECT_NAME}}` - From git config, package.json, or folder name
- `{{REPO_URL}}` - From git remote origin
- `{{MAIN_BRANCH}}` - Current default branch (main/master)
- `{{BRANCHING_STRATEGY}}` - Recommended based on team size and project type
- `{{SHELL_TYPE}}` - Current shell (bash/pwsh/cmd)

### Customizable Configuration
Create `.workflow-config.json` in your project root:
```json
{
  "git": {
    "BRANCHING_STRATEGY": "GitHub Flow",
    "MIN_REVIEWERS": 2,
    "DEFAULT_REVIEWERS": ["@team-leads", "@senior-devs"],
    "MERGE_STRATEGY": "squash",
    "AUTO_DELETE_BRANCHES": true,
    "VERSIONING_SCHEME": "Semantic Versioning",
    "TAG_PREFIX": "v",
    "BRANCH_NAMING": {
      "FEATURE_PREFIX": "feature",
      "BUGFIX_PREFIX": "bugfix",
      "HOTFIX_PREFIX": "hotfix"
    },
    "COMMIT_TYPES": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
    "QUALITY_CHECKS": [
      {"description": "Run linter", "command": "npm run lint"},
      {"description": "Format code", "command": "npm run format"},
      {"description": "Run tests", "command": "npm test"}
    ],
    "RELEASE_CHECKLIST": [
      "Version numbers updated in all files",
      "Changelog updated with new features",
      "All tests passing",
      "Documentation updated",
      "Security review completed"
    ]
  }
}
```

### Branch Protection Rules
*Auto-configured based on your settings:*
- Require {{MIN_REVIEWERS}} reviewer(s)
- Require status checks: {{CI_CHECKS}}
- Require up-to-date branches
- {{#if FORCE_PUSH_RESTRICTED}}Restrict force pushes{{/if}}
- {{#if AUTO_DELETE_BRANCHES}}Delete merged branches{{/if}}

## Quick Setup
```powershell
# Generate workflow configuration
./setup-workflow.ps1 -Template git -ProjectPath . -Interactive

# Apply branch protection rules (requires admin access)
./setup-workflow.ps1 -ApplyProtection -Branch {{MAIN_BRANCH}}
```
