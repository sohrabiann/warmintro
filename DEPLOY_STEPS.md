# Quick Deployment Steps

## 1. Push to GitHub

After creating your GitHub repo, run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/warmintro.git
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Import your `warmintro` repository
4. Vercel will auto-detect Next.js

## 3. Add Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:

- `DATABASE_URL` = Your Supabase connection string
- `NEXTAUTH_URL` = `https://your-app.vercel.app` (update after first deploy)
- `NEXTAUTH_SECRET` = Generate at https://generate-secret.vercel.app/32
- `LINKEDIN_CLIENT_ID` = Your LinkedIn Client ID
- `LINKEDIN_CLIENT_SECRET` = Your LinkedIn Client Secret  
- `OPENAI_API_KEY` = Your OpenAI API key

## 4. Update LinkedIn OAuth

1. Go to https://www.linkedin.com/developers/apps
2. Select your app → "Auth" tab
3. Add redirect URL: `https://your-app.vercel.app/api/auth/callback/linkedin`
4. Click "Update"

## 5. Deploy & Run Migrations

After first deployment:
- In Vercel project settings → Build & Development Settings
- Override build command: `prisma generate && prisma migrate deploy && next build`
- Redeploy

Then update `NEXTAUTH_URL` with your actual Vercel domain and redeploy.

