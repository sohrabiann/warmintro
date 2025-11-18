# Fix Vercel Deployment Issues

## Issue 1: Database Connection During Build

The build is failing because Prisma can't connect to the database during build time. 

### Solution: Skip migrations during build

**In Vercel, change the Build Command to:**
```
prisma generate && next build
```

Migrations should already be applied to your database. If not, run them manually:
```bash
npx prisma migrate deploy
```

## Issue 2: Use Supabase Connection Pooler

For production (Vercel), use Supabase's **Connection Pooler** URL instead of direct connection:

1. Go to your Supabase project dashboard
2. Go to **Settings** → **Database**
3. Find **Connection string** section
4. Select **Connection pooling** tab
5. Copy the **Transaction** mode URL (port 5432)
   - Format: `postgresql://postgres:[PASSWORD]@[PROJECT-REF].pooler.supabase.com:5432/postgres?pgbouncer=true`
6. Update `DATABASE_URL` in Vercel environment variables with this pooler URL

## Issue 3: Fix NEXTAUTH_URL

Your `NEXTAUTH_URL` has a closing parenthesis. It should be:
```
https://warmintro-6ac7.vercel.app
```
(Remove the `)` at the end)

## Quick Fix Steps:

1. **In Vercel project settings:**
   - Build Command: Change to `prisma generate && next build`
   - Remove `prisma migrate deploy` from build command

2. **Update DATABASE_URL:**
   - Get connection pooler URL from Supabase
   - Update in Vercel environment variables

3. **Fix NEXTAUTH_URL:**
   - Remove the `)` at the end
   - Should be: `https://warmintro-6ac7.vercel.app`

4. **Redeploy**

