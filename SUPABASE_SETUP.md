# Supabase Database Setup Guide

This guide shows you how to set up a free PostgreSQL database on Supabase for the Aurora Data Room.

---

## Step 1: Create a Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub or email
4. Verify your email

---

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Name:** `aurora-dataroom`
   - **Database Password:** (create a strong password, save it!)
   - **Region:** Choose closest to your users (e.g., US East)
   - **Plan:** Free tier is sufficient for starting

3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be created

---

## Step 3: Get Your Database Connection Strings

1. In your Supabase project dashboard, click **"Project Settings"** (gear icon)
2. Click **"Database"** in the left sidebar
3. Scroll down to **"Connection string"** section

### Connection Strings You Need:

#### For `DATABASE_URL` (Connection Pooler):
1. Under **"Connection string"** → Select **"URI"** tab
2. Select **"Connection pooling"** mode
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

#### For `DIRECT_DATABASE_URL` (Direct Connection):
1. Under **"Connection string"** → Select **"URI"** tab
2. Select **"Direct connection"** mode
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## Step 4: Add Environment Variables in AWS Amplify

1. Go to AWS Amplify Console
2. Select your app
3. Go to **"App settings"** → **"Environment variables"**
4. Click **"Manage variables"**
5. Add these variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres` |
| `DIRECT_DATABASE_URL` | `postgresql://postgres.[ref]:[password]@...supabase.com:5432/postgres` |

> **Note:** Use the Connection Pooler URL for `DATABASE_URL` and Direct Connection for `DIRECT_DATABASE_URL`

---

## Step 5: Initialize the Database Schema

The first deployment will automatically run Prisma migrations. However, for the initial setup, you may need to run migrations manually.

### Option A: Local Development
```bash
# Set environment variables locally
export DATABASE_URL="your-connection-string"
export DIRECT_DATABASE_URL="your-direct-connection-string"

# Push schema to database
npx prisma db push

# Seed with demo data
npx prisma db seed
```

### Option B: Via Supabase SQL Editor
1. In Supabase dashboard, go to **"SQL Editor"**
2. Run the Prisma-generated SQL (from `prisma/migrations`)

---

## Step 6: Configure Row Level Security (Optional but Recommended)

For production, enable Row Level Security (RLS) in Supabase:

1. Go to **"Authentication"** → **"Policies"**
2. Enable RLS on tables that need it
3. Create policies for each user role

Example policy for `documents` table:
```sql
-- Users can only see documents they have access to
CREATE POLICY "Users can view accessible documents" ON documents
  FOR SELECT USING (
    access_tier IN (
      SELECT access_tier FROM access_grants 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR EXISTS (
      SELECT 1 FROM data_room_users 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );
```

---

## Connection String Format Summary

### DATABASE_URL (Connection Pooler - for Prisma client)
```
postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### DIRECT_DATABASE_URL (Direct Connection - for migrations)
```
postgresql://postgres.[project-ref]:[PASSWORD]@db.[project-ref].supabase.co:5432/postgres
```

> **Important:** Replace `[PASSWORD]` with your actual database password and `[project-ref]` with your project reference.

---

## Free Tier Limits

Supabase Free Tier includes:
- **500 MB** database storage
- **1 GB** file storage
- **5 GB** bandwidth per month
- **50,000** monthly active users

This is sufficient for a data room with hundreds of documents and users.

---

## Troubleshooting

### Connection Timeout
- Make sure you're using the correct connection string format
- Check that your IP is not blocked (Supabase has no IP restrictions by default)

### Migration Fails
- Ensure `DIRECT_DATABASE_URL` is set correctly
- Check that the database user has necessary permissions

### Pooler Connection Issues
- Use port `6543` for connection pooling
- Use port `5432` for direct connections

---

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Prisma with Supabase:** https://www.prisma.io/docs/guides/database/supabase

---

*Guide created: January 2026*
