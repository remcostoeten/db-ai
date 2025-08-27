# 🚀 Quick Start - Deploy in 5 Minutes

## ⚡ Super Fast Deployment

Your monorepo is already configured for free Cloudflare deployment! Here's how to get it live:

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

### 3. Set Your Database Secret

```bash
cd apps/server
wrangler secret put DATABASE_URL
# Paste your Neon database connection string when prompted
```

### 4. Deploy Everything

```bash
# From the root directory
./deploy.sh
```

## 🎯 What You Get

- **Frontend**: `https://db-palace.pages.dev` (Cloudflare Pages)
- **Backend**: `https://db-palace-server.your-subdomain.workers.dev` (Cloudflare Workers)
- **Database**: Your existing Neon database
- **Cost**: **$0/month** 🎉

## 🔧 One-Time Setup

After first deployment, update CORS in `apps/server/wrangler.jsonc`:

```json
"CORS_ORIGIN": "https://db-palace.pages.dev"
```

## 🚨 Troubleshooting

**"Wrangler not found"**

```bash
npm install -g wrangler
```

**"Not logged in"**

```bash
wrangler login
```

**"Database connection failed"**

```bash
cd apps/server
wrangler secret put DATABASE_URL
```

## 📱 Test Your App

1. Visit your frontend URL
2. Try logging in
3. Check the network tab for API calls
4. Verify database operations work

## 🔄 Future Updates

Just push to main branch - GitHub Actions will auto-deploy!

---

**That's it! Your monorepo is now live for free! 🎉**
