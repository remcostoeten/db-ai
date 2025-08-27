#!/bin/bash

echo "🚀 Deploying DB Studio Monorepo to Cloudflare..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    echo "   or"
    echo "   bun add -g wrangler"
    exit 1
fi

# Check if logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "   wrangler login"
    exit 1
fi

echo "✅ Wrangler CLI ready"

# Deploy backend (Workers)
echo "🔧 Deploying backend to Cloudflare Workers..."
cd apps/server
if bun run deploy; then
    echo "✅ Backend deployed successfully!"
    WORKER_URL=$(wrangler whoami | grep "Account" | awk '{print $2}' | sed 's/\.workers\.dev//')
    echo "🌐 Backend URL: https://db-palace-server.${WORKER_URL}.workers.dev"
else
    echo "❌ Backend deployment failed"
    exit 1
fi

cd ../..

# Deploy frontend (Pages)
echo "🎨 Deploying frontend to Cloudflare Pages..."
cd apps/web
if bun run deploy; then
    echo "✅ Frontend deployed successfully!"
    echo "🌐 Frontend URL: https://db-palace.pages.dev"
else
    echo "❌ Frontend deployment failed"
    exit 1
fi

cd ../..

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Frontend: https://db-palace.pages.dev"
echo "🔧 Backend:  https://db-palace-server.${WORKER_URL}.workers.dev"
echo ""
echo "💡 Don't forget to:"
echo "   1. Update CORS_ORIGIN in server wrangler.jsonc with your frontend URL"
echo "   2. Set environment variables: wrangler secret put DATABASE_URL"
echo "   3. Test your deployed app!"
echo ""
echo "🚀 Your monorepo is now live for free! 🎉"
