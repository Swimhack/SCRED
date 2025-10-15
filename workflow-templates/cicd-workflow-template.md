# CI/CD Workflow Template

## Overview
This template defines the Continuous Integration and Continuous Deployment workflow for **{{PROJECT_NAME}}** project.

*Auto-detected project type: **{{PROJECT_TYPE}}** | Tech stack: **{{TECH_STACK}}***

## Workflow Triggers
- [x] Push to {{MAIN_BRANCH}} branch
- [x] Pull request creation
- [x] Pull request updates
- [ ] Manual trigger
- [ ] Scheduled runs: {{CRON_SCHEDULE}}

## Pre-Deployment Checklist
- [x] Code review completed ({{MIN_REVIEWERS}} reviewers)
- [x] All tests passing
- [x] Security scan passed
- [x] Performance benchmarks met
- [x] Documentation updated
{{#if HAS_MIGRATIONS}}
- [x] Database migrations reviewed
- [x] Migration rollback plan ready
{{/if}}

## Build Process

### 1. Environment Setup
```{{SHELL_TYPE}}
{{ENVIRONMENT_SETUP}}
```

### 2. Dependencies Installation
```{{SHELL_TYPE}}
{{DEPENDENCY_INSTALL}}
```

### 3. Code Quality Checks
{{#each CODE_QUALITY_TOOLS}}
- [x] {{this.name}}: `{{this.command}}`
{{/each}}

### 4. Testing Strategy
{{#each TEST_TYPES}}
- [x] {{this.name}}: `{{this.command}}`
{{/each}}

### 5. Build & Package
```{{SHELL_TYPE}}
{{BUILD_COMMAND}}
{{PACKAGE_COMMAND}}
```

## Deployment Stages

### Development Environment
- **Trigger**: Every commit to feature branches
- **Approval**: Automatic
- **URL**: {{DEV_URL}}
- **Rollback**: Automatic on failure

### Staging Environment
- **Trigger**: Merge to {{MAIN_BRANCH}} branch
- **Approval**: Automatic
- **URL**: {{STAGING_URL}}
- **Testing**: Full test suite + smoke tests
- **Rollback**: Manual trigger

### Production Environment
- **Trigger**: {{PROD_TRIGGER}}
- **Approval**: {{PROD_APPROVAL}}
- **URL**: {{PROD_URL}}
- **Strategy**: {{DEPLOYMENT_STRATEGY}}
- **Monitoring**: {{MONITORING_TOOLS}}
- **Rollback**: {{ROLLBACK_STRATEGY}}

## Notification Settings
{{#each NOTIFICATION_CHANNELS}}
- [x] {{this.event}}: {{this.channel}} ({{this.recipients}})
{{/each}}

## Rollback Procedures
1. **Immediate Rollback**
   ```{{SHELL_TYPE}}
   {{ROLLBACK_COMMAND}}
   ```
   - Time estimate: {{ROLLBACK_TIME}}
   - Monitoring: {{ROLLBACK_MONITORING}}

{{#if HAS_DATABASE}}
2. **Database Rollback** 
   ```{{SHELL_TYPE}}
   {{DB_ROLLBACK_COMMAND}}
   ```
   - Recovery point: {{RECOVERY_POINT}}
   - Data backup: {{BACKUP_STRATEGY}}
{{/if}}

## Monitoring and Alerts
{{#each MONITORING_CHECKS}}
- [x] {{this.name}}: {{this.description}}
{{/each}}

## Emergency Procedures
1. **Hotfix Process**
   ```{{SHELL_TYPE}}
   # Create hotfix branch
   git checkout {{MAIN_BRANCH}}
   git pull origin {{MAIN_BRANCH}}
   git checkout -b hotfix/{{ISSUE_ID}}
   
   # After fix, fast-track deployment
   {{HOTFIX_DEPLOY_COMMAND}}
   ```

2. **Incident Response**
   - **Alert channels**: {{INCIDENT_CHANNELS}}
   - **Response team**: {{INCIDENT_TEAM}}
   - **Escalation**: {{ESCALATION_PROCESS}}
   - **Communication**: {{COMMUNICATION_PLAN}}

## Template Variables Reference

*This template uses Handlebars-style syntax for dynamic content. Variables are automatically populated based on project detection or can be manually configured.*

### Auto-Detected Variables
These are automatically detected from your project:
- `{{PROJECT_NAME}}` - Extracted from package.json, project folder, or git repo
- `{{PROJECT_TYPE}}` - Web App, API, Mobile App, Desktop App, Library
- `{{TECH_STACK}}` - Node.js, Python, .NET, Java, Go, etc.
- `{{MAIN_BRANCH}}` - main, master, or develop
- `{{SHELL_TYPE}}` - bash, pwsh, cmd based on OS

### Environment Commands (Auto-Generated)
```handlebars
{{ENVIRONMENT_SETUP}} - OS and runtime setup
{{DEPENDENCY_INSTALL}} - npm install, pip install, etc.
{{BUILD_COMMAND}} - Build command for your stack
{{PACKAGE_COMMAND}} - Packaging/containerization
```

### Customizable Variables
Edit these in `.workflow-config.json`:
```json
{
  "MIN_REVIEWERS": 2,
  "CRON_SCHEDULE": "0 2 * * 1",
  "DEV_URL": "https://dev.example.com",
  "STAGING_URL": "https://staging.example.com",
  "PROD_URL": "https://example.com",
  "PROD_TRIGGER": "Tag-based (v*.*.*)",
  "PROD_APPROVAL": "Team Lead + DevOps",
  "DEPLOYMENT_STRATEGY": "Blue-Green",
  "ROLLBACK_TIME": "5 minutes",
  "CODE_QUALITY_TOOLS": [
    {"name": "ESLint", "command": "npm run lint"},
    {"name": "Prettier", "command": "npm run format:check"}
  ],
  "TEST_TYPES": [
    {"name": "Unit Tests", "command": "npm run test:unit"},
    {"name": "Integration Tests", "command": "npm run test:integration"}
  ],
  "NOTIFICATION_CHANNELS": [
    {"event": "Build Success", "channel": "Slack", "recipients": "#dev-team"},
    {"event": "Build Failure", "channel": "Email + Slack", "recipients": "#dev-alerts"}
  ]
}
```

## Quick Setup
Run this command in your project root to generate a customized workflow:
```powershell
./setup-workflow.ps1 -Template cicd -ProjectPath . -Interactive
```
