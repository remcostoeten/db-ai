# 🚀 Free Deployment Guide - Cloudflare

Deploy your DB Studio monorepo completely free using Cloudflare's generous free tier!

## 📊 Free Tier Limits

- **Cloudflare Pages**: 100,000 requests/month
- **Cloudflare Workers**: 100,000 requests/day
- **Neon Database**: 3GB storage, 10GB transfer/month

## 🛠️ Prerequisites

1. **Cloudflare Account** (free)
2. **Neon Database** (already configured)
3. **GitHub Repository** (for automatic deployments)

## 🔑 Setup Steps

### 1. Install Cloudflare CLI

```bash
npm install -g wrangler
# or
bun add -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Set Environment Variables

```bash
# For the server (Workers)
cd apps/server
wrangler secret put DATABASE_URL
wrangler secret put AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# Set your admin email
wrangler secret put ADMIN_EMAIL
```

### 4. Deploy Backend (Server)

```bash
cd apps/server
bun run deploy
```

This will deploy to: `https://db-palace-server.your-subdomain.workers.dev`

### 5. Deploy Frontend (Web App)

```bash
cd apps/web
bun run deploy
```

This will deploy to: `https://db-palace.pages.dev`

## 🔄 Automatic Deployments

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install -g wrangler
      - run: cd apps/server && npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm install -g wrangler
      - run: cd apps/web && npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Option 2: Manual Deployment

```bash
# Deploy both apps
cd apps/server && bun run deploy
cd ../web && bun run deploy
```

## 🌐 Custom Domain (Optional)

1. **Add Custom Domain** in Cloudflare Pages dashboard
2. **Update CORS** in server wrangler.jsonc
3. **Update Environment Variables**

## 🔧 Environment Variables

### Server (Workers)

- `DATABASE_URL`: Neon database connection string
- `AUTH_SECRET`: Random string for auth encryption
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `ADMIN_EMAIL`: Your admin email address

### Frontend (Pages)

- `VITE_API_URL`: Your Workers URL (e.g., `https://db-palace-server.workers.dev`)

## 📱 Update Frontend API URL

After deploying the server, update your frontend to use the new API URL:

```typescript
// apps/web/src/core/utilities/platform.ts
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://db-palace-server.your-subdomain.workers.dev";
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Check `CORS_ORIGIN` in server config
2. **Database Connection**: Verify `DATABASE_URL` secret is set
3. **Build Failures**: Check TypeScript errors with `bun run check-types`

### Debug Commands

```bash
# Test server locally
cd apps/server && bun run dev

# Test frontend locally
cd apps/web && bun run dev

# Check server logs
wrangler tail

# View deployment status
wrangler whoami
```

## 💰 Cost Breakdown

- **Cloudflare Pages**: $0/month (100k requests)
- **Cloudflare Workers**: $0/month (100k requests/day)
- **Neon Database**: $0/month (3GB storage)
- **Total**: **$0/month** 🎉

## 🔄 Update Process

1. **Push to main branch**
2. **GitHub Actions auto-deploy** (if configured)
3. **Or manually deploy**:
   ```bash
   cd apps/server && bun run deploy
   cd ../web && bun run deploy
   ```

## 📞 Support

- **Cloudflare Docs**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **Workers Discord**: [discord.gg/cloudflare](https://discord.gg/cloudflare)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)

---

**Your monorepo is now ready for free, production deployment! 🎉**
