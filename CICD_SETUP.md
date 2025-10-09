# CI/CD Setup Guide - GitHub Actions + Fly.io

This guide will help you set up automatic deployments to Fly.io using GitHub Actions. Every push to `main` will automatically deploy your application.

## 🚀 Quick Overview

**Current Setup:**
- ✅ Dockerfile configured
- ✅ Fly.io app created (`streetcredrx1`)
- ✅ GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- ⚠️ Need to add secrets to GitHub

**What Happens Automatically:**
1. You push code to `main` branch
2. GitHub Actions runs tests and builds the app
3. If tests pass, it deploys to Fly.io using Docker
4. Your site updates at https://streetcredrx1.fly.dev/

## 📋 Setup Steps

### Step 1: Get Your Fly.io API Token

1. **Get your Fly.io API token:**
   ```bash
   fly auth token
   ```
   
2. **Copy the token** (it will look like: `fo1_xxxxxxxxxxxx...`)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/Swimhack/SCRED

2. Click **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret** and add these three secrets:

   **Secret 1: FLY_API_TOKEN**
   - Name: `FLY_API_TOKEN`
   - Value: Your token from Step 1 (starts with `fo1_`)

   **Secret 2: VITE_SUPABASE_URL**
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL (from `.env` file)

   **Secret 3: VITE_SUPABASE_ANON_KEY**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key (from `.env` file)

### Step 3: Test the Workflow

**Option A: Push to trigger deployment**
```bash
git add .
git commit -m "feat: Add CI/CD with GitHub Actions"
git push origin main
```

**Option B: Manual trigger**
1. Go to **Actions** tab in GitHub
2. Click **Deploy to Fly.io** workflow
3. Click **Run workflow** → **Run workflow**

### Step 4: Monitor Deployment

1. Go to **Actions** tab in your GitHub repo
2. Click on the running workflow
3. Watch the deployment progress in real-time
4. When complete, visit https://streetcredrx1.fly.dev/

## 📊 Workflow Details

### What the Workflow Does

**On Pull Request:**
- ✅ Runs tests and linter
- ✅ Builds the application
- ⚠️ Does NOT deploy (only tests)

**On Push to Main:**
- ✅ Runs tests and linter
- ✅ Builds the application
- ✅ Deploys to Fly.io
- ✅ Verifies deployment

### Workflow Jobs

```yaml
1. Test & Build (always runs)
   - Install dependencies
   - Run linter
   - Run tests
   - Build app
   - Upload artifacts

2. Deploy (only on main branch push)
   - Setup Fly CLI
   - Deploy to Fly.io
   - Verify deployment
   - Show deployment info

3. Notify (only on failure)
   - Send failure notification
```

## 🔧 Customization

### Modify Deployment Trigger

Edit `.github/workflows/deploy.yml`:

**Deploy on tag instead of push:**
```yaml
on:
  push:
    tags:
      - 'v*'  # Deploy on version tags like v1.0.0
```

**Deploy on specific branches:**
```yaml
on:
  push:
    branches: [ main, staging, production ]
```

### Add Deployment Environments

Add staging and production environments:

```yaml
deploy-staging:
  name: Deploy to Staging
  environment: staging
  # ... deployment steps for staging

deploy-production:
  name: Deploy to Production
  environment: production
  needs: deploy-staging
  # ... deployment steps for production
```

### Add Slack/Discord Notifications

Add this step to the `notify` job:

```yaml
- name: Send Slack notification
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "❌ Deployment failed: ${{ github.event.head_commit.message }}"
      }
```

## 🐛 Troubleshooting

### Deployment Fails with "fly: command not found"

**Solution:** The workflow uses `flyctl`, not `fly`. If you see this error, the Fly CLI setup step failed. Check the workflow logs.

### Build Fails - Environment Variables Missing

**Solution:** Make sure you added all three secrets in GitHub:
- `FLY_API_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Deploy Step Skipped

**Solution:** Deployment only runs on pushes to `main` branch. Make sure:
- You're pushing to `main` (not a feature branch)
- The test job passed

### Docker Build Fails

**Solution:** 
1. Test Docker build locally:
   ```bash
   docker build -t test .
   ```
2. Check the Dockerfile is present and valid
3. Verify all necessary files are not in `.dockerignore`

### Fly.io Authentication Failed

**Solution:**
1. Verify your API token is correct:
   ```bash
   fly auth token
   ```
2. Copy the new token and update the `FLY_API_TOKEN` secret in GitHub

## 📈 Monitoring Deployments

### View Deployment History

**GitHub:**
- Go to **Actions** tab
- See all deployment runs and their status

**Fly.io:**
```bash
# View deployment history
fly releases

# View specific deployment logs
fly logs

# Check app status
fly status
```

### Rollback a Deployment

If a deployment causes issues:

**Via Fly.io:**
```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback <version-number>
```

**Via GitHub:**
- Re-run a previous successful workflow
- Or revert the git commit and push

## 🔐 Security Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Rotate API tokens** regularly
3. **Use environment protection rules** for production
4. **Require approvals** for production deployments
5. **Limit secret access** to necessary jobs only

## 🎯 Next Steps

### Recommended Improvements

1. **Add Testing**
   - Unit tests with Jest/Vitest
   - Integration tests with Playwright
   - E2E tests for critical flows

2. **Add Environments**
   - Staging environment for testing
   - Production environment with approvals
   - Preview deployments for PRs

3. **Add Monitoring**
   - Set up Sentry for error tracking
   - Configure uptime monitoring
   - Add performance monitoring

4. **Improve Workflow**
   - Add code coverage reports
   - Implement semantic versioning
   - Add changelog generation

## 📚 Resources

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Fly.io Docs**: https://fly.io/docs
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/

## 🆘 Getting Help

**Workflow not running?**
1. Check `.github/workflows/deploy.yml` exists
2. Verify GitHub Actions are enabled for your repo
3. Check the Actions tab for error messages

**Deployment failing?**
1. Check the workflow logs in Actions tab
2. Test deployment manually: `fly deploy`
3. Verify secrets are set correctly

**Need more help?**
- Check workflow logs in GitHub Actions
- Run `fly logs` to see app logs
- Review Fly.io documentation

---

## 📝 Quick Reference

### Essential Commands

```bash
# Get Fly.io API token
fly auth token

# Test deployment locally
fly deploy --ha=false

# Check deployment status
fly status

# View logs
fly logs

# Rollback deployment
fly releases rollback <version>

# Test workflow locally (with act)
act push -s FLY_API_TOKEN=<your-token>
```

### Workflow File Location
`.github/workflows/deploy.yml`

### Secrets to Add
- `FLY_API_TOKEN` (from `fly auth token`)
- `VITE_SUPABASE_URL` (from your Supabase dashboard)
- `VITE_SUPABASE_ANON_KEY` (from your Supabase dashboard)

---

**Last Updated**: October 8, 2025  
**Maintained by**: Development Team
