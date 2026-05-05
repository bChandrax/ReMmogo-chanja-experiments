# Re-Mmogo Deployment Guide

This guide covers deploying the Re-Mmogo application to **Vercel** (frontend) and **Render** (backend).

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render         │────▶│   PostgreSQL    │
│   (Frontend)    │     │   (Backend API)  │     │   (Database)    │
│   React 19      │     │   Node.js/Express│     │   Render DB     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com]
4. **PostgreSQL Database** - Can be created on Render

---

## Backend Deployment (Render)

### Option 1: Using render.yaml (Recommended)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com/dashboard)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the `render.yaml` file
   - Click "Apply"

3. **Configure Environment Variables**
   Render will automatically create:
   - `DATABASE_URL` - From the PostgreSQL database
   - `JWT_SECRET` - Auto-generated secure secret

   You may need to add:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://your-app.vercel.app`

4. **Deploy**
   - Render will automatically build and deploy
   - Initial deployment takes ~5-10 minutes
   - Note your backend URL (e.g., `https://re-mmogo-api.onrender.com`)

### Option 2: Manual Setup

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Choose plan (Starter is free for development)
   - Note the `Internal Database URL` and `External Database URL`

2. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Configure:
     - **Name:** `re-mmogo-api`
     - **Environment:** `Node`
     - **Build Command:** `cd backend && npm install`
     - **Start Command:** `cd backend && npm start`
     - **Plan:** Choose appropriate tier

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5175
   DATABASE_URL=<your-render-postgres-url>
   JWT_SECRET=<generate-a-strong-secret>
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

---

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
# Make sure you're in the project root
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
   - Select the `re-mmogo` repository
   - Click "Import"

### Step 3: Configure Build Settings

Vercel auto-detects Vite. Verify:
- **Framework Preset:** Vite
- **Build Command:** `pnpm build` (or `npm run build`)
- **Output Directory:** `dist`

### Step 4: Add Environment Variables

In Vercel project settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important:** Use your actual Render backend URL!

### Step 5: Deploy

- Click "Deploy"
- Wait ~2-3 minutes for build
- Your app will be live at `https://re-mmogo.vercel.app`

---

## Post-Deployment Configuration

### Update Backend CORS

After deploying the frontend, update the backend's `ALLOWED_ORIGINS`:

1. Go to Render Dashboard → Your Web Service → Environment
2. Add/Update:
   ```
   ALLOWED_ORIGINS=https://re-mmogo.vercel.app
   ```
3. Save and redeploy

### Update Frontend API URL

If you change the backend URL:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `VITE_API_URL` to your Render backend URL
3. Redeploy (Vercel auto-redeploys on env var changes)

---

## Database Setup

### Running Migrations

After deploying the database, you need to create tables:

1. **Connect to your database** using pgAdmin or psql:
   ```bash
   psql <your-render-connection-string>
   ```

2. **Run the schema** from `backend/database/remmogo_database.sql`:
   ```bash
   psql <connection-string> -f backend/database/remmogo_database.sql
   ```

3. **Verify tables created:**
   ```sql
   \dt
   ```

### Alternative: Use Render's SQL Editor

1. Go to Render Dashboard → Your Database
2. Click "SQL Editor"
3. Copy/paste contents of `remmogo_database.sql`
4. Click "Run"

---

## Testing Deployment

### 1. Health Check

Visit: `https://your-backend-url.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-05T...",
  "environment": "production"
}
```

### 2. API Test

Visit: `https://your-backend-url.onrender.com/api`

Expected: `{"name": "Re-Mmogo API", ...}`

### 3. Frontend Test

1. Visit your Vercel URL
2. Try registering a new account
3. Login and verify dashboard loads
4. Check browser console for errors

---

## Troubleshooting

### Backend Issues

**Problem: "Cannot connect to database"**
- Check DATABASE_URL is correct in Render env vars
- Verify database is running (check Render dashboard)
- Ensure database allows external connections

**Problem: "CORS Error"**
- Verify ALLOWED_ORIGINS includes your Vercel URL
- Check for trailing slashes in URLs
- Wait 1-2 minutes after env var updates

**Problem: "Token expired"**
- JWT tokens expire after 1 day (by design)
- User needs to login again
- Consider implementing refresh tokens

### Frontend Issues

**Problem: "Unable to connect to server"**
- Check VITE_API_URL is set correctly
- Verify backend is running (check health endpoint)
- Check browser console for exact error

**Problem: Blank page after build**
- Check Vercel build logs for errors
- Verify `vercel.json` rewrites are correct
- Try redeploying

---

## Production Best Practices

### Security

1. **Use strong JWT_SECRET** (min 64 characters)
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Enable HTTPS only** (Vercel/Render do this automatically)

3. **Set secure cookie options** in production

4. **Implement rate limiting** (already configured)

### Performance

1. **Enable caching** for static assets
2. **Use connection pooling** (already configured)
3. **Add database indexes** for frequently queried columns
4. **Consider Redis** for session management

### Monitoring

1. **Render Logs:** Dashboard → Your Service → Logs
2. **Vercel Analytics:** Dashboard → Your Project → Analytics
3. **Error Tracking:** Consider Sentry or LogRocket

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5175` |
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `ALLOWED_ORIGINS` | CORS origins | `https://app.vercel.app` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com/api` |

---

## Cost Estimates

### Free Tier (Development)

- **Vercel:** Free (hobby plan)
- **Render:** Free (web service + PostgreSQL)
  - Note: Free DB expires after 90 days
- **Total:** $0/month

### Production Tier

- **Vercel:** $20/month (Pro plan)
- **Render:** $7/month (Starter web service) + $9/month (Starter DB)
- **Total:** ~$36/month

---

## Continuous Deployment

Both Vercel and Render automatically deploy on push to main branch:

```bash
git add .
git commit -m "Fix bug"
git push origin main
# → Vercel and Render automatically deploy
```

### Preview Deployments

- **Vercel:** Creates preview URL for pull requests
- **Render:** Can configure preview environments

---

## Support

For issues:
1. Check logs (Render/Vercel dashboards)
2. Review this guide
3. Check backend/frontend `.env.example` files
4. Verify all environment variables are set

---

**Last Updated:** May 5, 2026
