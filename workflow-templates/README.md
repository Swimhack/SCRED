# Dynamic Workflow Templates

> **Intelligent workflow templates that automatically adapt to any project**

These templates use dynamic variables and smart detection to generate customized workflows for CI/CD, Git, and Project Management practices. No more manual find-and-replace of placeholder text!

## 🚀 Quick Start

```powershell
# Generate all workflows for your current project
./setup-workflow.ps1 -Template all -ProjectPath . -Interactive

# Generate specific workflow type
./setup-workflow.ps1 -Template git -ProjectPath .

# Use existing configuration file
./setup-workflow.ps1 -Template cicd -ConfigFile .\.workflow-config.json
```

## 📋 What's Included

### 1. CI/CD Workflow Template (`cicd-workflow-template.md`)
- **Auto-detects**: Tech stack, build commands, testing tools
- **Adapts to**: Node.js, Python, .NET, Java, Go, and more
- **Includes**: Environment-specific deployment stages, rollback procedures
- **Features**: Dynamic notification channels, monitoring setups

### 2. Git Workflow Template (`git-workflow-template.md`)
- **Auto-detects**: Branch strategy, team size, repository info
- **Supports**: GitFlow, GitHub Flow, GitLab Flow methodologies
- **Includes**: Branch protection rules, commit conventions, release processes
- **Features**: Conditional sections based on team methodology

### 3. Project Management Template (`project-management-template.md`)
- **Auto-detects**: Team size, project complexity, recommended methodology
- **Supports**: Scrum, Kanban, SAFe methodologies
- **Includes**: Sprint planning, daily standups, retrospectives
- **Features**: Methodology-specific meeting templates and processes

### 4. Setup Script (`setup-workflow.ps1`)
- **Detects**: Project type, tech stack, team size, git info
- **Generates**: Customized workflow files in `./workflows/` directory
- **Interactive**: Prompts for user preferences and customizations
- **Configurable**: Uses `.workflow-config.json` for persistent settings

## 🔍 How It Works

### Auto-Detection Features

The setup script automatically analyzes your project and detects:

- **Project Info**: Name (from package.json, folder), type, tech stack
- **Git Info**: Repository URL, main branch, contributor count
- **Team Info**: Team size, recommended methodology
- **Complexity**: Based on file count, directory structure, existing CI/CD

### Dynamic Variables

Templates use Handlebars-style syntax for dynamic content:

```handlebars
{{PROJECT_NAME}} - Your project name
{{TECH_STACK}} - Detected technology stack
{{MAIN_BRANCH}} - Primary git branch
{{TEAM_SIZE}} - Number of team members
{{METHODOLOGY}} - Recommended project methodology
```

### Conditional Content

Templates include conditional sections that appear only when relevant:

```handlebars
{{#if HAS_DATABASE}}
- Database migration checks
- Backup procedures
{{/if}}

{{#if (eq METHODOLOGY "Scrum")}}
### Sprint Planning Process
...
{{/if}}
```

## 🎯 Usage Examples

### Generate All Workflows (Interactive)
```powershell
# Analyzes project and prompts for preferences
./setup-workflow.ps1 -Template all -Interactive
```

**Sample Output:**
```
🔍 Project Analysis Results:
─────────────────────────────
📁 Project: streetcredrx1
🏗️  Type: Web App
💻 Tech Stack: Node.js, PHP
👥 Team Size: 3 (Small)
📊 Complexity: Medium
🔧 Recommended Methodology: GitHub Flow + Kanban
🌿 Git Branch: main
🔗 Repository: https://github.com/username/streetcredrx1.git

✓ Generated cicd workflow: .\workflows\cicd-workflow.md
✓ Generated git workflow: .\workflows\git-workflow.md  
✓ Generated project-management workflow: .\workflows\project-management-workflow.md
```

### Use Custom Configuration
```powershell
# First, create your config file
./setup-workflow.ps1 -Template all -Interactive
# Select option 1 to generate .workflow-config.json

# Then use it for future runs
./setup-workflow.ps1 -Template all -ConfigFile .\.workflow-config.json
```

### Team-Specific Workflows
```powershell
# Solo developer
./setup-workflow.ps1 -Template git  # → GitHub Flow + Kanban

# Small team (2-3 people)  
./setup-workflow.ps1 -Template all  # → GitHub Flow + Kanban

# Medium team (4-9 people)
./setup-workflow.ps1 -Template all  # → Scrum methodology

# Large team (10+ people)
./setup-workflow.ps1 -Template all  # → SAFe methodology
```

## ⚙️ Configuration

### Project-Level Configuration (`.workflow-config.json`)

```json
{
  "project": {
    "PROJECT_NAME": "My Awesome App",
    "PM_NAME": "Jane Smith",
    "TEAM_SIZE": "5 developers"
  },
  "cicd": {
    "MIN_REVIEWERS": 2,
    "DEPLOYMENT_STRATEGY": "Blue-Green",
    "NOTIFICATION_CHANNELS": [
      {"event": "Build Failure", "channel": "Slack", "recipients": "#dev-alerts"}
    ]
  },
  "git": {
    "BRANCHING_STRATEGY": "GitHub Flow",
    "MERGE_STRATEGY": "squash",
    "VERSIONING_SCHEME": "Semantic Versioning"
  },
  "projectManagement": {
    "METHODOLOGY": "Scrum",
    "SPRINT_DURATION": "2 weeks",
    "DAILY_STANDUP_TIME": "9:30 AM"
  }
}
```

### Tech Stack Defaults

The system automatically configures commands based on detected tech stack:

| Tech Stack | Dependencies | Build | Test | Lint |
|------------|-------------|-------|------|------|
| Node.js | `npm ci` | `npm run build` | `npm test` | `npm run lint` |
| Python | `pip install -r requirements.txt` | `python setup.py build` | `python -m pytest` | `flake8` |
| .NET | `dotnet restore` | `dotnet build` | `dotnet test` | `dotnet format --verify-no-changes` |

## 🔧 Customization

### Adding Custom Variables

1. Edit the template files to include your custom variables:
```handlebars
- **Custom Setting**: {{MY_CUSTOM_VAR}}
```

2. Add defaults in the setup script or config file:
```json
{
  "custom": {
    "MY_CUSTOM_VAR": "default value"
  }
}
```

### Creating New Templates

1. Create a new template file: `my-custom-workflow-template.md`
2. Use the same variable syntax: `{{VARIABLE_NAME}}`
3. Update the setup script to include your new template
4. Add conditional logic if needed

### Extending Detection Logic

The `ProjectDetector` class can be extended to detect additional project characteristics:

```powershell
[void]DetectCustomFeature() {
    # Your custom detection logic
    if (Test-Path (Join-Path $this.ProjectPath "custom.config")) {
        $this.ProjectInfo['HAS_CUSTOM_FEATURE'] = $true
    }
}
```

## 📝 Integration with Warp IDE

### Standard Workflows
Add these as standard workflows in your Warp IDE configuration:

1. Copy templates to your Warp config directory
2. Update Warp settings to reference these templates
3. Use the setup script to generate project-specific workflows

### Workflow Commands
Create Warp commands for common operations:

```json
{
  "commands": {
    "setup-workflows": {
      "command": "./setup-workflow.ps1 -Template all -Interactive",
      "description": "Generate project workflows"
    },
    "update-git-workflow": {
      "command": "./setup-workflow.ps1 -Template git -ConfigFile .workflow-config.json",
      "description": "Update Git workflow"
    }
  }
}
```

## 🎭 Best Practices

### 1. Version Control Your Configuration
- Commit `.workflow-config.json` to your repository
- Update workflows when project characteristics change
- Use consistent configurations across team projects

### 2. Regular Updates
- Re-run setup when adding new team members
- Update methodology settings based on team growth
- Regenerate workflows after major project changes

### 3. Team Adoption
- Run interactive setup during project onboarding
- Share generated workflows in team documentation
- Use consistent naming conventions across projects

### 4. Integration
- Link generated workflows to your project management tool
- Reference workflows in PR templates and documentation
- Include workflow adherence in code review checklists

## 🆘 Troubleshooting

### Common Issues

**Git detection fails**
```powershell
# Solution: Initialize git repository first
git init
git remote add origin <your-repo-url>
./setup-workflow.ps1 -Template all
```

**Tech stack not detected**
```powershell
# Solution: Add manual configuration
{
  "project": {
    "TECH_STACK": "Your Tech Stack"
  }
}
```

**PowerShell execution policy issues**
```powershell
# Solution: Temporarily allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Debug Mode
```powershell
./setup-workflow.ps1 -Template all -Verbose -Interactive
```

## 📄 License

These templates are designed to be used across any project. Feel free to modify and adapt them to your team's specific needs.

---

**Ready to streamline your project workflows? Start with:**
```powershell
./setup-workflow.ps1 -Template all -Interactive
```