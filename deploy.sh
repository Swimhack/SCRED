#!/bin/bash

# StreetCredRx Questionnaire Deployment Script
echo "🚀 Starting deployment of StreetCredRx with Questionnaires..."

# Check if build directory exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory not found. Running build..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix build errors first."
        exit 1
    fi
fi

echo "✅ Build directory found"

# Check for required files
echo "🔍 Checking deployment files..."
REQUIRED_FILES=("fly.toml" "Dockerfile" "supabase/migrations/20250828-questionnaires.sql")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file missing: $file"
        exit 1
    fi
done
echo "✅ All required files present"

# Deployment Summary
echo "📋 Deployment Summary:"
echo "   - App: streetcred"
echo "   - Target: https://streetcred.fly.dev/"
echo "   - Build files: $(ls -la dist/ | wc -l) files"
echo "   - Build size: $(du -sh dist/ | cut -f1)"
echo "   - New features: Pharmacist & Facility Questionnaires"

# Check for fly CLI
if command -v fly >/dev/null 2>&1; then
    echo "✅ Fly CLI found"
    
    # Attempt deployment
    echo "🚀 Deploying to Fly.io..."
    
    # Try different authentication methods
    if [ ! -z "$FLY_API_TOKEN" ]; then
        echo "Using FLY_API_TOKEN environment variable"
    elif [ -f "$HOME/.fly/config.yml" ]; then
        echo "Using existing Fly CLI authentication"
    else
        echo "⚠️  No authentication found. Please run: fly auth login"
        echo "   Or set FLY_API_TOKEN environment variable"
        exit 1
    fi
    
    # Deploy
    fly deploy --app streetcred
    DEPLOY_EXIT_CODE=$?
    
    if [ $DEPLOY_EXIT_CODE -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "✅ Application deployed to: https://streetcred.fly.dev/"
        echo ""
        echo "🔗 New Questionnaire URLs:"
        echo "   📋 Pharmacist: https://streetcred.fly.dev/questionnaire/pharmacist"
        echo "   🏢 Facility: https://streetcred.fly.dev/questionnaire/facility"
        echo ""
        echo "⚠️  IMPORTANT: Don't forget to run the database migration!"
        echo "   1. Go to Supabase Dashboard"
        echo "   2. Run: supabase/migrations/20250828-questionnaires.sql"
        echo ""
    else
        echo "❌ Deployment failed with exit code: $DEPLOY_EXIT_CODE"
        echo "📖 Check DEPLOYMENT_INSTRUCTIONS.md for troubleshooting"
        exit $DEPLOY_EXIT_CODE
    fi
else
    echo "❌ Fly CLI not found"
    echo "📖 Please see DEPLOYMENT_INSTRUCTIONS.md for manual deployment steps:"
    echo ""
    echo "🔧 Quick deployment options:"
    echo "   1. Install Fly CLI: curl -L https://fly.io/install.sh | sh"
    echo "   2. Authenticate: fly auth login"
    echo "   3. Deploy: fly deploy --app streetcred"
    echo ""
    echo "🗂️  Or follow the detailed instructions in DEPLOYMENT_INSTRUCTIONS.md"
fi

echo "✅ Deployment script completed"