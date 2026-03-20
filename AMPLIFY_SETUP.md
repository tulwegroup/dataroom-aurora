# AWS Amplify Setup Guide for Aurora Data Room

## Step-by-Step Deployment Instructions

---

## Step 1: Access AWS Amplify Console

1. Log in to AWS Console: https://console.aws.amazon.com
2. Search for **"Amplify"** in the services search bar
3. Click **"AWS Amplify"** to open the Amplify Console

---

## Step 2: Create New App

1. Click **"New app"** button
2. Select **"Host web app"**

![Amplify New App](https://docs.amplify.aws/images/hosting/new-app.png)

---

## Step 3: Connect GitHub Repository

1. Select **"GitHub"** as the source provider
2. Click **"Connect branch"**
3. If prompted, authorize AWS Amplify to access your GitHub:
   - Click **"Authorize AWS Amplify"**
   - Select **"Only select repositories"**
   - Choose **"tulwegroup/dataroom-aurora"**
   - Click **"Install"** or **"Save"**

4. Back in Amplify Console:
   - Repository: **tulwegroup/dataroom-aurora**
   - Branch: **main**
   - Click **"Next"**

---

## Step 4: Configure Build Settings

The build settings should be auto-detected. Verify these settings:

### Build Settings:
```
Framework: Next.js

Build command: npm run build
Output directory: .next
```

### Environment Variables:
Click **"Add environment variable"** and add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `file:./db/custom.db` |

### amplify.yml (Create this file if not auto-detected):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

Click **"Next"**

---

## Step 5: Review and Deploy

1. Review all settings
2. Click **"Save and deploy"**
3. Wait for the build to complete (usually 3-5 minutes)

The build log will show progress. Look for:
- ✅ Provisioning
- ✅ PreBuild
- ✅ Build
- ✅ PostBuild
- ✅ Deploying

---

## Step 6: Add Custom Domain (dataroom.aurora-osi.com)

### Prerequisite: Domain in Route 53 (or accessible)

If your domain (aurora-osi.com) is already in Route 53:

1. In Amplify Console, select your app
2. Go to **"Domain management"** in the left sidebar
3. Click **"Add domain"**
4. Enter: **aurora-osi.com**
5. Click **"Configure domain"**

### Configure Subdomain:

1. For subdomain, enter: **dataroom**
2. Select your branch: **main**
3. Click **"Save"**

### DNS Configuration:

If using Route 53 (hosted in same account):
- Amplify will automatically create DNS records
- Click **"Create record"** when prompted

If using external DNS (GoDaddy):
- Amplify will provide CNAME records to add
- Go to GoDaddy DNS Management
- Add the provided CNAME records

Example DNS records needed:
```
Type: CNAME
Name: dataroom
Value: [provided by Amplify, e.g., d12345abcdef.cloudfront.net]
TTL: 600
```

### Wait for SSL Certificate:

- Amplify automatically provisions SSL via AWS Certificate Manager
- This can take 15-30 minutes
- Status will show **"Verified"** when complete

---

## Step 7: Update GoDaddy DNS (If Using GoDaddy)

1. Log in to GoDaddy: https://dcc.godaddy.com/manage/
2. Go to **DNS Management** for aurora-osi.com
3. Add new record:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | dataroom | [Amplify domain] | 600 |

The Amplify domain looks like: `dxxxx.cloudfront.net` (from Amplify Console → Domain management)

---

## Step 8: Verify Deployment

1. Wait for all checks to pass:
   - ✅ Domain verified
   - ✅ SSL certificate provisioned
   - ✅ DNS propagated

2. Visit your site: **https://dataroom.aurora-osi.com**

3. Test login with demo credentials:
   - Admin: `admin@aurora-osi.com`
   - TEASER User: `investor@example.com`
   - QUALIFIED User: `qualified@example.com`

---

## Troubleshooting

### Build Fails:
1. Check build logs in Amplify Console
2. Common issues:
   - Missing environment variables
   - Node version mismatch
   - Dependency errors

### Domain Not Resolving:
1. Check DNS propagation: https://dnschecker.org
2. Verify CNAME record is correct
3. Wait up to 48 hours for full propagation

### SSL Certificate Pending:
1. Verify domain ownership
2. Check DNS records are correct
3. Contact AWS Support if stuck > 24 hours

---

## Post-Deployment Configuration

### Update for Production:

1. **Environment Variables** (in Amplify Console → App settings → Environment variables):

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://dataroom.aurora-osi.com/api` |

2. **Branch Protection** (optional):
   - Set up a staging branch
   - Configure branch previews

3. **Monitoring**:
   - Enable CloudWatch alerts
   - Set up error tracking (e.g., Sentry)

---

## Amplify Console URLs

- **Main Console**: https://console.aws.amazon.com/amplify
- **Your App**: https://console.aws.amazon.com/amplify/home?region=us-east-1#/apps/dataroom-aurora

---

## Need Help?

- **AWS Amplify Docs**: https://docs.amplify.aws
- **Support**: support@aurora-osi.com

---

*Guide created: January 2026*
