# Aurora OSI - Quick Deployment Reference

## 🚀 Quick Start (5-Step Deployment)

### 1. Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### 2. AWS Amplify Setup
- Go to: https://console.aws.amazon.com/amplify
- Click: **New app** → **Host web app**
- Select: Your GitHub repository
- Branch: `main`
- Click: **Save and deploy**

### 3. Request SSL Certificate (ACM)
- Region: **US East (N. Virginia)** - us-east-1
- Domains: `aurora-osi.com`, `*.aurora-osi.com`
- Validation: DNS
- Add CNAME records from ACM to GoDaddy DNS

### 4. Add Custom Domain (Amplify)
- Amplify Console → **Domain management**
- Add domain: `aurora-osi.com`
- Select SSL certificate
- Configure: `www` → redirect to root

### 5. Update GoDaddy DNS
- Option A: Change name servers to AWS (recommended)
- Option B: Add A/CNAME records pointing to Amplify

---

## 📋 GoDaddy DNS Settings

### Name Servers Option (Recommended)
Replace GoDaddy name servers with AWS Amplify name servers:
```
ns-xxx.awsdns-xx.com
ns-xxx.awsdns-xx.net
ns-xxx.awsdns-xx.org
ns-xxx.awsdns-xx.co.uk
```

### A/CNAME Option (Alternative)
| Type | Name | Value |
|------|------|-------|
| A | @ | Amplify-provided IPs |
| CNAME | www | [amplify-id].amplifyapp.com |

---

## 🔒 Security Checklist

### GoDaddy Domain Protection
- [ ] Enable Domain Lock (prevent transfers)
- [ ] Enable 2-Factor Authentication
- [ ] Enable WHOIS Privacy
- [ ] Enable Auto-Renew
- [ ] Use strong password

### AWS Security
- [ ] Enable MFA on root account
- [ ] Create IAM user for daily use
- [ ] Enable CloudTrail logging
- [ ] Configure AWS WAF rules
- [ ] Review security headers (already configured)

---

## 💰 Monthly Cost Estimate

| Service | Cost |
|---------|------|
| Amplify | $1-5 |
| CloudFront | $1-10 |
| Route 53 | $0.50 |
| WAF | $5-15 |
| **Total** | **$8-30/mo** |

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| SSL pending | Check DNS CNAME records match ACM |
| 404 errors | Wait for DNS propagation (up to 48h) |
| Build fails | Check Node.js version, dependencies |
| Domain not resolving | Verify name servers or A records |

---

## 📞 Support Resources

- AWS Support: https://console.aws.amazon.com/support
- GoDaddy Support: https://www.godaddy.com/help
- DNS Checker: https://dnschecker.org
- SSL Test: https://www.ssllabs.com/ssltest/

---

## 🔗 Important URLs

- **AWS Console**: https://console.aws.amazon.com
- **Amplify Console**: https://console.aws.amazon.com/amplify
- **ACM (Certificates)**: https://console.aws.amazon.com/acm
- **Route 53 (DNS)**: https://console.aws.amazon.com/route53
- **WAF**: https://console.aws.amazon.com/waf
- **GoDaddy DNS**: https://dcc.godaddy.com/manage/dns

---

## 📧 Contact Email

- **Site Contact**: briefing@aurora-osi.com
- Configure email in GoDaddy or AWS SES
