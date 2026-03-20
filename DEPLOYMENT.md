# Aurora OSI - AWS Deployment Guide

This guide covers deploying the Aurora OSI website to AWS and connecting your GoDaddy domain.

---

## 📋 Prerequisites

- AWS Account (with appropriate permissions)
- GoDaddy account with domain: aurora-osi.com
- Git repository (GitHub, GitLab, or Bitbucket)

---

## 🚀 Option 1: AWS Amplify (Recommended)

AWS Amplify is the easiest way to deploy Next.js applications with automatic SSL, CDN, and CI/CD.

### Step 1: Push Code to Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial Aurora OSI website"

# Add remote and push (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/aurora-osi.git
git push -u origin main
```

### Step 2: Create AWS Amplify App

1. Log into [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **AWS Amplify** service
3. Click **New app** → **Host web app**
4. Select your Git provider (GitHub, GitLab, Bitbucket)
5. Authorize AWS to access your repository
6. Select the `aurora-osi` repository
7. Choose branch: `main`

### Step 3: Configure Build Settings

Amplify should auto-detect Next.js. Verify these settings:

- **Framework**: Next.js
- **Build command**: `bun run build`
- **Output directory**: `.next`

If needed, the `amplify.yml` file in the project root will override defaults.

### Step 4: Add Environment Variables (if needed)

In Amplify Console → App settings → Environment variables:

```
NODE_ENV=production
```

### Step 5: Deploy

1. Click **Save and deploy**
2. Wait for build to complete (2-5 minutes)
3. Amplify provides a default URL like: `https://main.xxxxx.amplifyapp.com`

---

## 🌐 Connect GoDaddy Domain to AWS

### Step 1: Request SSL Certificate (AWS Certificate Manager)

1. Go to **AWS Certificate Manager (ACM)**
2. Make sure you're in **US East (N. Virginia) us-east-1** region (required for CloudFront)
3. Click **Request a certificate**
4. Select **Request a public certificate**
5. Add domain names:
   - `aurora-osi.com`
   - `*.aurora-osi.com`
6. Validation method: **DNS validation**
7. Click **Request**

### Step 2: Add DNS Records in GoDaddy

ACM will provide CNAME records for validation. In GoDaddy:

1. Log into [GoDaddy](https://www.godaddy.com/)
2. Go to **My Products** → **DNS**
3. Find domain `aurora-osi.com`
4. Click **DNS**
5. Add the CNAME records provided by ACM:
   - Name: `_xxxxxxxx.aurora-osi.com`
   - Value: `_yyyyyyyy.acm-validations.aws`
6. Wait for validation (5-30 minutes)

### Step 3: Add Custom Domain in Amplify

1. In Amplify Console, go to **App settings** → **Domain management**
2. Click **Add domain**
3. Enter: `aurora-osi.com`
4. Select the SSL certificate you created
5. Configure subdomains:
   - `www.aurora-osi.com` → Redirect to `aurora-osi.com`
6. Click **Save**

### Step 4: Update GoDaddy DNS to Point to AWS

Amplify will provide DNS records. In GoDaddy DNS settings:

**Option A: Using Name Servers (Recommended)**
1. In GoDaddy, scroll to **Name Servers**
2. Click **Change**
3. Select **I'll use my own name servers**
4. Add AWS Amplify name servers (provided in Amplify console):
   ```
   ns-xxx.awsdns-xx.com
   ns-xxx.awsdns-xx.net
   ns-xxx.awsdns-xx.org
   ns-xxx.awsdns-xx.co.uk
   ```
5. Click **Save**

**Option B: Using A/CNAME Records**
1. Keep GoDaddy name servers
2. Add these records:
   
   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | @ | [Amplify IP addresses] | 600 |
   | CNAME | www | [Amplify domain] | 600 |

### Step 5: Wait for DNS Propagation

- DNS changes can take 10 minutes to 48 hours
- Check status in Amplify Console → Domain management
- Look for green checkmarks indicating successful configuration

---

## 🔒 Security Configuration

### AWS WAF (Web Application Firewall)

1. Go to **AWS WAF** service
2. Create **Web ACL**:
   - Name: `aurora-osi-waf`
   - Resource type: CloudFront distributions
   - Select your Amplify distribution

3. Add managed rules:
   - **AWS-AWSManagedRulesCommonRuleSet** (Core rule set)
   - **AWS-AWSManagedRulesKnownBadInputsRuleSet**
   - **AWS-AWSManagedRulesSQLiRuleSet** (SQL injection)
   - **AWS-AWSManagedRulesLinuxRuleSet**
   - **AWS-AWSManagedRulesPHPRuleSet**

4. Set default action: **Allow**
5. Create Web ACL

### Rate Limiting (Optional)

In AWS WAF, add a rate-based rule:
- Name: `RateLimitRule`
- Rate limit: 2000 requests per 5 minutes per IP
- Action: Block

### AWS Shield (DDoS Protection)

- **AWS Shield Standard**: Free, automatically enabled
- **AWS Shield Advanced**: $3,000/month for enterprise protection

For a corporate site, Shield Standard is typically sufficient.

---

## 📊 Monitoring & Logging

### CloudWatch

1. In Amplify Console → App settings → Notifications
2. Enable email notifications for:
   - Build failures
   - Deployment failures

### CloudFront Access Logs (Optional)

1. Go to CloudFront distribution for Amplify
2. Enable access logging
3. Set S3 bucket for log storage

---

## 🔄 CI/CD Pipeline

Amplify automatically deploys when you push to main branch.

### Production Workflow

```bash
# Development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create Pull Request
# Merge to main when ready

# Amplify auto-deploys on merge to main
```

### Manual Deployments

In Amplify Console:
1. Select branch
2. Click **Run build**

---

## 💰 Estimated AWS Costs

| Service | Monthly Cost |
|---------|--------------|
| Amplify Hosting | $1-5 (free tier) |
| CloudFront CDN | $1-10 |
| Route 53 (DNS) | $0.50 per zone |
| ACM (SSL) | Free |
| WAF | $5-15 |
| **Total** | **$8-30/month** |

*Costs vary based on traffic volume*

---

## 🔧 Alternative: AWS S3 + CloudFront (Static Export)

If you prefer static hosting without SSR:

### Step 1: Modify next.config.ts

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  // ... rest of config
};
```

### Step 2: Build Static Site

```bash
bun run build
# Output will be in /out folder
```

### Step 3: Create S3 Bucket

1. Create S3 bucket: `aurora-osi-static`
2. Upload contents of `/out` folder
3. Enable static website hosting

### Step 4: Create CloudFront Distribution

1. Create CloudFront distribution
2. Origin: S3 website endpoint
3. Viewer Protocol: Redirect HTTP to HTTPS
4. Add custom SSL certificate
5. Set default root object: `index.html`

---

## ✅ Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Amplify app created and connected
- [ ] SSL certificate requested in ACM
- [ ] DNS validation completed
- [ ] Custom domain added in Amplify
- [ ] GoDaddy DNS updated
- [ ] DNS propagation confirmed
- [ ] HTTPS working (https://aurora-osi.com)
- [ ] www redirect working
- [ ] AWS WAF configured
- [ ] Monitoring enabled
- [ ] Build notifications configured

---

## 🆘 Troubleshooting

### DNS Not Propagating
- Use [DNS Checker](https://dnschecker.org/) to verify
- Wait up to 48 hours
- Clear browser DNS cache

### SSL Certificate Pending
- Verify CNAME records in GoDaddy match ACM values
- Check certificate status in ACM console

### Build Failures
- Check build logs in Amplify Console
- Verify `package.json` dependencies
- Ensure Node.js version compatibility

### 404 Errors on Pages
- For SPA routing, add a rewrite rule in `amplify.yml`
- Check CloudFront error pages configuration

---

## 📞 Support

For issues with:
- **AWS**: AWS Support Center
- **GoDaddy**: GoDaddy Customer Support
- **Domain DNS**: Use `dig` or `nslookup` commands

---

## 🔐 Domain Protection Best Practices

1. **Domain Lock**: Enable in GoDaddy (prevents unauthorized transfers)
2. **Two-Factor Auth**: Enable on GoDaddy account
3. **Domain Privacy**: Enable WHOIS privacy (hides personal info)
4. **Auto-Renew**: Enable to prevent accidental expiration
5. **Registrar Lock**: Ensure domain is locked

### AWS Security Best Practices

1. **IAM Policies**: Use least-privilege access
2. **MFA**: Enable on AWS root account
3. **CloudTrail**: Enable for audit logging
4. **Security Hub**: Enable for security posture monitoring
