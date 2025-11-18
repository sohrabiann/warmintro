# Vercel Deployment Guide

## Step 1: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/warmintro.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `warmintro` repository
4. Vercel will auto-detect Next.js settings

## Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

### Required Variables:

1. **DATABASE_URL**
   - Value: Your Supabase PostgreSQL connection string
   - Example: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

2. **NEXTAUTH_URL**
   - Value: Your Vercel deployment URL (will be something like `https://warmintro.vercel.app`)
   - ⚠️ Update this after first deployment with your actual domain

3. **NEXTAUTH_SECRET**
   - Generate a secure random string:
     ```bash
     openssl rand -base64 32
     ```
   - Or use: https://generate-secret.vercel.app/32

4. **LINKEDIN_CLIENT_ID**
   - Your LinkedIn OAuth Client ID

5. **LINKEDIN_CLIENT_SECRET**
   - Your LinkedIn OAuth Client Secret

6. **OPENAI_API_KEY**
   - Your OpenAI API key

## Step 4: Update LinkedIn OAuth Redirect URLs

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to "Auth" tab
4. Under "Redirect URLs", add:
   - `https://YOUR_VERCEL_DOMAIN.vercel.app/api/auth/callback/linkedin`
   - If you have a custom domain, also add:
     - `https://YOUR_CUSTOM_DOMAIN/api/auth/callback/linkedin`
5. Click "Update"

## Step 5: Run Database Migrations

After first deployment, run migrations on Vercel:

1. Go to your Vercel project dashboard
2. Open the terminal/deployment logs
3. Or use Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   npx prisma migrate deploy
   ```

Alternatively, you can add a build command that runs migrations:
- In Vercel project settings → Build & Development Settings
- Override build command: `prisma generate && prisma migrate deploy && next build`

## Step 6: Deploy!

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Once deployed, update `NEXTAUTH_URL` with your actual Vercel URL
4. Redeploy (or it will auto-redeploy)

## Troubleshooting

### Database Connection Issues
- Make sure your Supabase database allows connections from Vercel IPs
- Check that `DATABASE_URL` doesn't have quotes around it
- Verify password is correct in connection string

### Authentication Errors
- Verify `NEXTAUTH_URL` matches your actual Vercel domain
- Check that LinkedIn redirect URL is added correctly
- Ensure `NEXTAUTH_SECRET` is set

### Build Errors
- Check that all environment variables are set
- Verify Prisma migrations are up to date
- Check build logs in Vercel dashboard

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] LinkedIn redirect URL updated
- [ ] Database migrations run
- [ ] First deployment successful
- [ ] `NEXTAUTH_URL` updated with actual domain
- [ ] Test sign-in works
- [ ] Test email generation works

