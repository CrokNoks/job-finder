#!/bin/bash

# Environment validation script for Job Finder
echo "🔍 Validating environment variables..."

# Required variables for Firebase Functions
REQUIRED_FUNCTIONS_VARS=(
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "FIREBASE_PROJECT_ID"
)

# Required variables for Next.js
REQUIRED_WEB_VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
)

echo "📋 Checking functions environment..."

# Check functions environment
for var in "${REQUIRED_FUNCTIONS_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    MISSING_FUNIONS=true
  else
    echo "✅ $var is set"
  fi
done

echo ""
echo "📋 Checking web environment..."

# Check web environment
for var in "${REQUIRED_WEB_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    MISSING_WEB=true
  else
    echo "✅ $var is set"
  fi
done

echo ""
if [ "$MISSING_FUNIONS" = true ] || [ "$MISSING_WEB" = true ]; then
  echo "❌ Environment validation failed. Please set missing variables."
  echo "💡 Copy .env.example to .env.local and configure your credentials."
  exit 1
else
  echo "🎉 All required environment variables are set!"
  echo "🚀 You can start the application with: npm run dev"
fi

# Optional validation
echo ""
echo "🔍 Optional validation..."

if [ -n "$SUPABASE_URL" ]; then
  if [[ $SUPABASE_URL == *.supabase.co ]]; then
    echo "✅ Supabase URL format is valid"
  else
    echo "⚠️  Supabase URL format may be invalid"
  fi
fi

if [ -n "$FIREBASE_PROJECT_ID" ]; then
  echo "✅ Firebase project ID is set"
fi