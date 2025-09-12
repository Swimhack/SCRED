#!/bin/bash

echo "🚀 StreetCredRx Contact Form Deployment Script"
echo "=============================================="

# Step 1: Login to Supabase (interactive)
echo "📝 Step 1: Login to Supabase"
npx supabase login

# Step 2: Link to project (you'll need to provide project ref)
echo "🔗 Step 2: Link to Supabase project"
echo "You'll need your project reference ID from Supabase dashboard"
read -p "Enter your Supabase project ref ID: " PROJECT_REF
npx supabase link --project-ref $PROJECT_REF

# Step 3: Deploy database migration
echo "📊 Step 3: Deploy contact_submissions table"
npx supabase db push

# Step 4: Deploy edge function
echo "⚡ Step 4: Deploy send-contact-email function"
npx supabase functions deploy send-contact-email

# Step 5: Set environment variables
echo "🔧 Step 5: Set environment variables"
echo "Go to your Supabase Dashboard → Settings → API → Environment Variables"
echo ""
echo "Add these environment variables:"
echo "- GMAIL_USER: your-gmail@gmail.com"
echo "- GMAIL_APP_PASSWORD: your-16-digit-app-password"
echo "- CONTACT_RECIPIENT_EMAIL: james@ekaty.com"
echo ""

# Step 6: Test the deployment
echo "🧪 Step 6: Test the deployment"
echo "1. Go to your website's /contact page"
echo "2. Fill out and submit the contact form"
echo "3. Check for success message"
echo "4. Verify email was sent to james@ekaty.com"
echo "5. Check admin dashboard at /contact-submissions"

echo ""
echo "✅ Deployment script complete!"
echo "If there are any errors, check the Supabase dashboard logs."