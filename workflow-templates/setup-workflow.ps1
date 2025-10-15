#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated workflow template setup script for any project
.DESCRIPTION
    Detects project characteristics and populates workflow templates with appropriate variables
    Supports CI/CD, Git, and Project Management workflow templates
.PARAMETER Template
    Template type: 'cicd', 'git', 'pm', or 'all'
.PARAMETER ProjectPath
    Path to project directory (default: current directory)
.PARAMETER Interactive
    Run in interactive mode to customize settings
.PARAMETER ConfigFile
    Path to custom configuration file (.workflow-config.json)
.PARAMETER Output
    Output directory for generated workflows (default: ./workflows)
.EXAMPLE
    ./setup-workflow.ps1 -Template all -ProjectPath . -Interactive
.EXAMPLE
    ./setup-workflow.ps1 -Template cicd -ConfigFile .\.workflow-config.json
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('cicd', 'git', 'pm', 'all')]
    [string]$Template,
    
    [string]$ProjectPath = ".",
    [switch]$Interactive,
    [string]$ConfigFile = ".\.workflow-config.json",
    [string]$Output = ".\workflows",
    [switch]$ApplyProtection,
    [string]$Branch = "main",
    [switch]$CreateMeetings,
    [string]$Methodology,
    [string]$ConnectTool,
    [switch]$Verbose
)

# Import required modules
if (Get-Module -ListAvailable -Name "powershell-yaml") {
    Import-Module powershell-yaml -ErrorAction SilentlyContinue
}

class ProjectDetector {
    [string]$ProjectPath
    [hashtable]$ProjectInfo
    [hashtable]$GitInfo
    [hashtable]$Dependencies
    
    ProjectDetector([string]$path) {
        $this.ProjectPath = Resolve-Path $path
        $this.ProjectInfo = @{}
        $this.GitInfo = @{}
        $this.Dependencies = @{}
        $this.DetectAll()
    }
    
    [void]DetectAll() {
        $this.DetectProjectBasics()
        $this.DetectGitInfo()
        $this.DetectTechStack()
        $this.DetectProjectType()
        $this.DetectTeamInfo()
        $this.DetectComplexity()
    }
    
    [void]DetectProjectBasics() {
        $folderName = Split-Path $this.ProjectPath -Leaf
        
        # Try to get project name from various sources
        $packageJson = Join-Path $this.ProjectPath "package.json"
        $pyprojectToml = Join-Path $this.ProjectPath "pyproject.toml"
        $csproj = Get-ChildItem -Path $this.ProjectPath -Filter "*.csproj" | Select-Object -First 1
        
        if (Test-Path $packageJson) {
            $pkg = Get-Content $packageJson | ConvertFrom-Json
            $this.ProjectInfo['PROJECT_NAME'] = $pkg.name ?? $folderName
            $this.ProjectInfo['PROJECT_DESCRIPTION'] = $pkg.description ?? ""
            $this.ProjectInfo['PROJECT_VERSION'] = $pkg.version ?? "1.0.0"
        }
        elseif (Test-Path $pyprojectToml) {
            # Parse TOML for Python projects
            $this.ProjectInfo['PROJECT_NAME'] = $folderName
            $this.ProjectInfo['TECH_STACK'] = "Python"
        }
        elseif ($csproj) {
            $this.ProjectInfo['PROJECT_NAME'] = $csproj.BaseName
            $this.ProjectInfo['TECH_STACK'] = ".NET"
        }
        else {
            $this.ProjectInfo['PROJECT_NAME'] = $folderName
        }
    }
    
    [void]DetectGitInfo() {
        if (Test-Path (Join-Path $this.ProjectPath ".git")) {
            try {
                $remoteUrl = git -C $this.ProjectPath remote get-url origin 2>$null
                $currentBranch = git -C $this.ProjectPath branch --show-current 2>$null
                $contributors = @(git -C $this.ProjectPath shortlog -sn --all 2>$null)
                
                $this.GitInfo['REPO_URL'] = $remoteUrl ?? ""
                $this.GitInfo['MAIN_BRANCH'] = $currentBranch ?? "main"
                $this.GitInfo['CONTRIBUTOR_COUNT'] = $contributors.Count
                $this.GitInfo['HAS_GIT'] = $true
                
                # Detect primary branch
                $branches = @(git -C $this.ProjectPath branch -r 2>$null | ForEach-Object { $_.Trim() -replace 'origin/', '' })
                if ($branches -contains "main") {
                    $this.GitInfo['MAIN_BRANCH'] = "main"
                }
                elseif ($branches -contains "master") {
                    $this.GitInfo['MAIN_BRANCH'] = "master"
                }
                elseif ($branches -contains "develop") {
                    $this.GitInfo['TARGET_BRANCH'] = "develop"
                }
            }
            catch {
                Write-Warning "Could not access git information: $($_.Exception.Message)"
                $this.GitInfo['HAS_GIT'] = $false
            }
        }
        else {
            $this.GitInfo['HAS_GIT'] = $false
        }
    }
    
    [void]DetectTechStack() {
        $files = Get-ChildItem -Path $this.ProjectPath -Recurse -Depth 2 | Where-Object { -not $_.PSIsContainer }
        
        # Detect by file extensions and config files
        $indicators = @{
            'Node.js' = @('package.json', '*.js', '*.ts', '*.jsx', '*.tsx', 'yarn.lock', 'pnpm-lock.yaml')
            'Python' = @('requirements.txt', 'setup.py', 'pyproject.toml', '*.py', 'Pipfile')
            '.NET' = @('*.csproj', '*.sln', '*.cs', '*.vb', 'appsettings.json')
            'Java' = @('pom.xml', 'build.gradle', '*.java', 'gradle.properties')
            'Go' = @('go.mod', 'go.sum', '*.go')
            'PHP' = @('composer.json', '*.php')
            'Ruby' = @('Gemfile', '*.rb', 'Rakefile')
            'Rust' = @('Cargo.toml', '*.rs')
        }
        
        $detectedStacks = @()
        foreach ($stack in $indicators.Keys) {
            $hasIndicators = $false
            foreach ($indicator in $indicators[$stack]) {
                if ($files.Name -like $indicator -or (Test-Path (Join-Path $this.ProjectPath $indicator))) {
                    $hasIndicators = $true
                    break
                }
            }
            if ($hasIndicators) {
                $detectedStacks += $stack
            }
        }
        
        $this.ProjectInfo['TECH_STACK'] = if ($detectedStacks.Count -gt 0) { 
            $detectedStacks -join ', '
        } else { 'Unknown' }
        
        # Detect shell type
        $this.ProjectInfo['SHELL_TYPE'] = if ($IsWindows -or $env:OS -eq "Windows_NT") { 'pwsh' } else { 'bash' }
    }
    
    [void]DetectProjectType() {
        $hasWebFiles = (Get-ChildItem -Path $this.ProjectPath -Recurse -Include "*.html", "*.css", "index.*" -Depth 3).Count -gt 0
        $hasApiFiles = (Get-ChildItem -Path $this.ProjectPath -Recurse -Include "*api*", "*controller*", "*route*" -Depth 3).Count -gt 0
        $hasTestFiles = (Get-ChildItem -Path $this.ProjectPath -Recurse -Include "*test*", "*spec*" -Depth 3).Count -gt 0
        $hasDockerfile = Test-Path (Join-Path $this.ProjectPath "Dockerfile")
        
        if ($hasWebFiles -and $hasApiFiles) {
            $this.ProjectInfo['PROJECT_TYPE'] = 'Full-Stack Web App'
        }
        elseif ($hasWebFiles) {
            $this.ProjectInfo['PROJECT_TYPE'] = 'Web App'
        }
        elseif ($hasApiFiles) {
            $this.ProjectInfo['PROJECT_TYPE'] = 'API Service'
        }
        elseif ($hasDockerfile) {
            $this.ProjectInfo['PROJECT_TYPE'] = 'Containerized App'
        }
        else {
            $this.ProjectInfo['PROJECT_TYPE'] = 'Library/Tool'
        }
    }
    
    [void]DetectTeamInfo() {
        $contributorCount = $this.GitInfo['CONTRIBUTOR_COUNT'] ?? 1
        
        if ($contributorCount -eq 1) {
            $this.ProjectInfo['TEAM_SIZE'] = '1 (Solo)'
            $this.ProjectInfo['RECOMMENDED_METHODOLOGY'] = 'Kanban'
        }
        elseif ($contributorCount -le 3) {
            $this.ProjectInfo['TEAM_SIZE'] = "$contributorCount (Small)"
            $this.ProjectInfo['RECOMMENDED_METHODOLOGY'] = 'GitHub Flow + Kanban'
        }
        elseif ($contributorCount -le 9) {
            $this.ProjectInfo['TEAM_SIZE'] = "$contributorCount (Medium)"
            $this.ProjectInfo['RECOMMENDED_METHODOLOGY'] = 'Scrum'
        }
        else {
            $this.ProjectInfo['TEAM_SIZE'] = "$contributorCount (Large)"
            $this.ProjectInfo['RECOMMENDED_METHODOLOGY'] = 'SAFe'
        }
    }
    
    [void]DetectComplexity() {
        $fileCount = (Get-ChildItem -Path $this.ProjectPath -Recurse -File).Count
        $dirCount = (Get-ChildItem -Path $this.ProjectPath -Recurse -Directory).Count
        $hasTests = (Get-ChildItem -Path $this.ProjectPath -Recurse -Include "*test*", "*spec*").Count -gt 0
        $hasCI = Test-Path (Join-Path $this.ProjectPath ".github") -or Test-Path (Join-Path $this.ProjectPath ".gitlab-ci.yml")
        
        $complexityScore = 0
        if ($fileCount -gt 100) { $complexityScore += 2 }
        elseif ($fileCount -gt 50) { $complexityScore += 1 }
        
        if ($dirCount -gt 20) { $complexityScore += 2 }
        elseif ($dirCount -gt 10) { $complexityScore += 1 }
        
        if ($hasTests) { $complexityScore += 1 }
        if ($hasCI) { $complexityScore += 1 }
        
        if ($complexityScore -ge 5) {
            $this.ProjectInfo['PROJECT_COMPLEXITY'] = 'Complex'
        }
        elseif ($complexityScore -ge 3) {
            $this.ProjectInfo['PROJECT_COMPLEXITY'] = 'Medium'
        }
        else {
            $this.ProjectInfo['PROJECT_COMPLEXITY'] = 'Simple'
        }
    }
    
    [hashtable]GetAllInfo() {
        $combined = @{}
        $this.ProjectInfo.GetEnumerator() | ForEach-Object { $combined[$_.Key] = $_.Value }
        $this.GitInfo.GetEnumerator() | ForEach-Object { $combined[$_.Key] = $_.Value }
        return $combined
    }
}

class TemplateGenerator {
    [hashtable]$ProjectInfo
    [hashtable]$DefaultConfig
    [string]$TemplateDir
    [string]$OutputDir
    
    TemplateGenerator([hashtable]$projectInfo, [string]$templateDir, [string]$outputDir) {
        $this.ProjectInfo = $projectInfo
        $this.TemplateDir = $templateDir
        $this.OutputDir = $outputDir
        $this.LoadDefaults()
    }
    
    [void]LoadDefaults() {
        $this.DefaultConfig = @{
            # CI/CD Defaults
            'MIN_REVIEWERS' = 2
            'CRON_SCHEDULE' = '0 2 * * 1' # Monday 2 AM
            'DEPLOYMENT_STRATEGY' = 'Blue-Green'
            'ROLLBACK_TIME' = '5 minutes'
            
            # Git Defaults
            'MERGE_STRATEGY' = 'squash'
            'AUTO_DELETE_BRANCHES' = $true
            'VERSIONING_SCHEME' = 'Semantic Versioning'
            'TAG_PREFIX' = 'v'
            
            # Project Management Defaults
            'SPRINT_DURATION' = '2 weeks'
            'DAILY_STANDUP_TIME' = '9:00 AM'
            'PLANNING_DURATION' = '2 hours'
            'REVIEW_DURATION' = '1 hour'
            'RETRO_DURATION' = '45 minutes'
        }
        
        # Add tech stack specific defaults
        $techStack = $this.ProjectInfo['TECH_STACK']
        if ($techStack -like "*Node.js*") {
            $this.DefaultConfig['DEPENDENCY_INSTALL'] = 'npm ci'
            $this.DefaultConfig['BUILD_COMMAND'] = 'npm run build'
            $this.DefaultConfig['TEST_COMMAND'] = 'npm test'
            $this.DefaultConfig['LINT_COMMAND'] = 'npm run lint'
        }
        elseif ($techStack -like "*Python*") {
            $this.DefaultConfig['DEPENDENCY_INSTALL'] = 'pip install -r requirements.txt'
            $this.DefaultConfig['BUILD_COMMAND'] = 'python setup.py build'
            $this.DefaultConfig['TEST_COMMAND'] = 'python -m pytest'
            $this.DefaultConfig['LINT_COMMAND'] = 'flake8'
        }
        elseif ($techStack -like "*.NET*") {
            $this.DefaultConfig['DEPENDENCY_INSTALL'] = 'dotnet restore'
            $this.DefaultConfig['BUILD_COMMAND'] = 'dotnet build'
            $this.DefaultConfig['TEST_COMMAND'] = 'dotnet test'
            $this.DefaultConfig['LINT_COMMAND'] = 'dotnet format --verify-no-changes'
        }
    }
    
    [string]ProcessTemplate([string]$templateContent, [hashtable]$additionalVars = @{}) {
        $allVars = @{}
        $this.ProjectInfo.GetEnumerator() | ForEach-Object { $allVars[$_.Key] = $_.Value }
        $this.DefaultConfig.GetEnumerator() | ForEach-Object { $allVars[$_.Key] = $_.Value }
        $additionalVars.GetEnumerator() | ForEach-Object { $allVars[$_.Key] = $_.Value }
        
        $processedContent = $templateContent
        
        # Replace simple variables
        foreach ($key in $allVars.Keys) {
            $value = $allVars[$key]
            $processedContent = $processedContent -replace "{{$key}}", $value
        }
        
        # Process conditional blocks (simplified)
        # This is a basic implementation - for production, consider using a proper template engine
        $processedContent = $this.ProcessConditionals($processedContent, $allVars)
        
        return $processedContent
    }
    
    [string]ProcessConditionals([string]$content, [hashtable]$vars) {
        # Handle {{#if condition}} blocks
        $ifPattern = '{{#if\s+(.+?)}}(.*?){{/if}}'
        while ($content -match $ifPattern) {
            $condition = $matches[1].Trim()
            $block = $matches[2]
            $fullMatch = $matches[0]
            
            $shouldInclude = $this.EvaluateCondition($condition, $vars)
            
            if ($shouldInclude) {
                $content = $content -replace [regex]::Escape($fullMatch), $block
            }
            else {
                $content = $content -replace [regex]::Escape($fullMatch), ''
            }
        }
        
        # Handle {{#each array}} blocks (simplified)
        $eachPattern = '{{#each\s+(.+?)}}(.*?){{/each}}'
        while ($content -match $eachPattern) {
            $arrayName = $matches[1].Trim()
            $template = $matches[2]
            $fullMatch = $matches[0]
            
            $replacement = $this.ProcessEach($arrayName, $template, $vars)
            $content = $content -replace [regex]::Escape($fullMatch), $replacement
        }
        
        return $content
    }
    
    [bool]EvaluateCondition([string]$condition, [hashtable]$vars) {
        # Simple condition evaluation
        if ($condition -match '\(eq\s+(.+?)\s+"(.+?)"\)') {
            $variable = $matches[1].Trim()
            $expectedValue = $matches[2].Trim()
            $actualValue = $vars[$variable]
            return $actualValue -eq $expectedValue
        }
        
        # Simple variable check
        $varValue = $vars[$condition]
        return $varValue -and $varValue -ne $false -and $varValue -ne "false"
    }
    
    [string]ProcessEach([string]$arrayName, [string]$template, [hashtable]$vars) {
        $array = $vars[$arrayName]
        if (-not $array) { return '' }
        
        $result = ''
        if ($array -is [array]) {
            foreach ($item in $array) {
                $itemResult = $template
                if ($item -is [hashtable]) {
                    foreach ($key in $item.Keys) {
                        $itemResult = $itemResult -replace "{{this\.$key}}", $item[$key]
                    }
                }
                else {
                    $itemResult = $itemResult -replace "{{this}}", $item
                }
                $result += $itemResult
            }
        }
        
        return $result
    }
    
    [void]GenerateWorkflow([string]$templateName) {
        $templateFile = Join-Path $this.TemplateDir "$templateName-workflow-template.md"
        if (-not (Test-Path $templateFile)) {
            throw "Template file not found: $templateFile"
        }
        
        $templateContent = Get-Content $templateFile -Raw
        $processedContent = $this.ProcessTemplate($templateContent)
        
        # Ensure output directory exists
        if (-not (Test-Path $this.OutputDir)) {
            New-Item -ItemType Directory -Path $this.OutputDir -Force | Out-Null
        }
        
        $outputFile = Join-Path $this.OutputDir "$templateName-workflow.md"
        Set-Content -Path $outputFile -Value $processedContent -Encoding UTF8
        
        Write-Host "✓ Generated $templateName workflow: $outputFile" -ForegroundColor Green
    }
}

function Show-ProjectSummary {
    param([hashtable]$ProjectInfo)
    
    Write-Host "`n🔍 Project Analysis Results:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────" -ForegroundColor DarkGray
    Write-Host "📁 Project: $($ProjectInfo['PROJECT_NAME'])" -ForegroundColor Yellow
    Write-Host "🏗️  Type: $($ProjectInfo['PROJECT_TYPE'])" -ForegroundColor Yellow
    Write-Host "💻 Tech Stack: $($ProjectInfo['TECH_STACK'])" -ForegroundColor Yellow
    Write-Host "👥 Team Size: $($ProjectInfo['TEAM_SIZE'])" -ForegroundColor Yellow
    Write-Host "📊 Complexity: $($ProjectInfo['PROJECT_COMPLEXITY'])" -ForegroundColor Yellow
    Write-Host "🔧 Recommended Methodology: $($ProjectInfo['RECOMMENDED_METHODOLOGY'])" -ForegroundColor Yellow
    
    if ($ProjectInfo['HAS_GIT']) {
        Write-Host "🌿 Git Branch: $($ProjectInfo['MAIN_BRANCH'])" -ForegroundColor Yellow
        Write-Host "🔗 Repository: $($ProjectInfo['REPO_URL'])" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Get-UserPreferences {
    param([hashtable]$ProjectInfo)
    
    Write-Host "🎯 Interactive Configuration" -ForegroundColor Cyan
    Write-Host "Press Enter to accept default values`n" -ForegroundColor DarkGray
    
    $preferences = @{}
    
    # Basic project info
    $projectName = Read-Host "Project Name [$($ProjectInfo['PROJECT_NAME'])]"
    if ($projectName) { $preferences['PROJECT_NAME'] = $projectName }
    
    # Methodology selection
    $methodologies = @('Scrum', 'Kanban', 'GitHub Flow', 'GitFlow', 'SAFe')
    Write-Host "`nAvailable methodologies: $($methodologies -join ', ')"
    $methodology = Read-Host "Preferred Methodology [$($ProjectInfo['RECOMMENDED_METHODOLOGY'])]"
    if ($methodology -and $methodology -in $methodologies) { 
        $preferences['METHODOLOGY'] = $methodology 
    }
    
    # Team preferences
    $teamSize = Read-Host "Team Size [$($ProjectInfo['TEAM_SIZE'])]"
    if ($teamSize) { $preferences['TEAM_SIZE'] = $teamSize }
    
    $pmName = Read-Host "Project Manager Name [Auto-detect from git]"
    if ($pmName) { $preferences['PM_NAME'] = $pmName }
    
    return $preferences
}

function Load-ConfigFile {
    param([string]$ConfigPath)
    
    if (Test-Path $ConfigPath) {
        try {
            $configContent = Get-Content $ConfigPath -Raw | ConvertFrom-Json -AsHashtable
            Write-Host "✓ Loaded configuration from $ConfigPath" -ForegroundColor Green
            return $configContent
        }
        catch {
            Write-Warning "Could not parse config file: $($_.Exception.Message)"
            return @{}
        }
    }
    else {
        return @{}
    }
}

# Main execution
function Main {
    Write-Host "🚀 Workflow Template Setup" -ForegroundColor Cyan
    Write-Host "─────────────────────────────" -ForegroundColor DarkGray
    
    try {
        # Detect project characteristics
        Write-Host "Analyzing project..." -ForegroundColor Yellow
        $detector = [ProjectDetector]::new($ProjectPath)
        $projectInfo = $detector.GetAllInfo()
        
        Show-ProjectSummary $projectInfo
        
        # Load existing configuration
        $config = Load-ConfigFile $ConfigFile
        
        # Get user preferences if interactive
        if ($Interactive) {
            $userPrefs = Get-UserPreferences $projectInfo
            foreach ($key in $userPrefs.Keys) {
                $projectInfo[$key] = $userPrefs[$key]
            }
        }
        
        # Merge config file settings
        foreach ($section in $config.Keys) {
            foreach ($key in $config[$section].Keys) {
                $projectInfo[$key] = $config[$section][$key]
            }
        }
        
        # Generate templates
        $templateDir = Split-Path $MyInvocation.MyCommand.Path
        $generator = [TemplateGenerator]::new($projectInfo, $templateDir, $Output)
        
        switch ($Template) {
            'all' {
                $generator.GenerateWorkflow('cicd')
                $generator.GenerateWorkflow('git') 
                $generator.GenerateWorkflow('project-management')
            }
            'cicd' { $generator.GenerateWorkflow('cicd') }
            'git' { $generator.GenerateWorkflow('git') }
            'pm' { $generator.GenerateWorkflow('project-management') }
        }
        
        Write-Host "`n✅ Workflow setup complete!" -ForegroundColor Green
        Write-Host "📁 Generated files are in: $Output" -ForegroundColor Cyan
        
        # Offer additional setup options
        if ($Interactive) {
            Write-Host "`n🔧 Additional Setup Options:" -ForegroundColor Cyan
            Write-Host "1. Generate .workflow-config.json for future use"
            Write-Host "2. Create Git branch protection rules"
            Write-Host "3. Setup CI/CD pipeline files"
            Write-Host "4. Generate meeting calendar invites"
            
            $choice = Read-Host "`nSelect option (1-4) or press Enter to finish"
            
            switch ($choice) {
                '1' { 
                    $configOutput = @{
                        'project' = $projectInfo
                        'generatedAt' = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
                    }
                    $configOutput | ConvertTo-Json -Depth 5 | Set-Content "$ProjectPath/.workflow-config.json"
                    Write-Host "✓ Generated .workflow-config.json" -ForegroundColor Green
                }
                '2' {
                    Write-Host "🚧 Branch protection setup requires repository admin access" -ForegroundColor Yellow
                    Write-Host "Manual setup instructions added to git workflow file" -ForegroundColor Cyan
                }
                '3' {
                    Write-Host "🚧 CI/CD pipeline generation coming in future version" -ForegroundColor Yellow
                }
                '4' {
                    Write-Host "🚧 Calendar integration coming in future version" -ForegroundColor Yellow
                }
            }
        }
        
    }
    catch {
        Write-Error "Setup failed: $($_.Exception.Message)"
        exit 1
    }
}

# Execute main function
Main