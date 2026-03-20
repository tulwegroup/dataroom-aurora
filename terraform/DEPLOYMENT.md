# Aurora OSI Data Room - Deployment Guide

This guide provides comprehensive instructions for deploying the Aurora OSI Data Room platform on AWS.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Infrastructure Deployment](#infrastructure-deployment)
5. [Application Deployment](#application-deployment)
6. [DNS Configuration](#dns-configuration)
7. [Security Hardening](#security-hardening)
8. [Monitoring and Alerting](#monitoring-and-alerting)
9. [Backup and Recovery](#backup-and-recovery)
10. [Operational Procedures](#operational-procedures)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐     ┌──────────────────────────────────────────┐    │
│   │   Route 53   │────▶│         CloudFront Distribution          │    │
│   │  (DNS/SSL)   │     │  - WAF Protection                        │    │
│   └──────────────┘     │  - Signed Cookies for S3                 │    │
│                        │  - API Gateway Origin                     │    │
│                        └───────────────┬──────────────────────────┘    │
│                                        │                                 │
│          ┌─────────────────────────────┼─────────────────────────────┐  │
│          │                             ▼                             │  │
│          │  ┌──────────────────────────────────────────────────┐    │  │
│          │  │              API Gateway (HTTP API)               │    │  │
│          │  │  - JWT Authorization                              │    │  │
│          │  │  - Rate Limiting                                 │    │  │
│          │  │  - Request/Response Logging                       │    │  │
│          │  └───────────────┬──────────────────────────────────┘    │  │
│          │                  │                                        │  │
│          │                  ▼                                        │  │
│          │  ┌──────────────────────────────────────────────────┐    │  │
│          │  │                 Lambda Functions                  │    │  │
│          │  │  - Document API                                  │    │  │
│          │  │  - User Management API                           │    │  │
│          │  │  - Audit Log API                                 │    │  │
│          │  │  - Watermarking Processor                        │    │  │
│          │  └───────────────┬──────────────────────────────────┘    │  │
│          │                  │                                        │  │
│          │     ┌────────────┴────────────┐                          │  │
│          │     ▼                         ▼                          │  │
│          │  ┌────────────┐         ┌────────────┐                   │  │
│          │  │    S3      │         │  DynamoDB  │                   │  │
│          │  │ (Documents)│         │ (Metadata) │                   │  │
│          │  │  - KMS     │         │  - KMS     │                   │  │
│          │  │  - Version │         │  - PITR    │                   │  │
│          │  └────────────┘         └────────────┘                   │  │
│          │                                                           │  │
│          │                  AWS Services Layer                       │  │
│          └───────────────────────────────────────────────────────────┘  │
│                                                                          │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐        │
│   │    Cognito     │    │      SES       │    │   CloudTrail   │        │
│   │ (Auth + MFA)   │    │    (Email)     │    │   (Audit)      │        │
│   └────────────────┘    └────────────────┘    └────────────────┘        │
│                                                                          │
│   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐        │
│   │  CloudWatch    │    │      KMS       │    │      WAF       │        │
│   │ (Monitoring)   │    │  (Encryption)  │    │ (Protection)   │        │
│   └────────────────┘    └────────────────┘    └────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Access Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOCUMENT ACCESS TIERS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   TEASER (Public Marketing)                                      │
│   ├── Marketing presentations                                    │
│   ├── Company overview                                           │
│   └── Public financials                                          │
│       Access: No NDA required, email registration only           │
│                                                                  │
│   QUALIFIED (NDA Required)                                       │
│   ├── Detailed financials                                        │
│   ├── Technical documentation                                    │
│   ├── Management presentations                                   │
│   └── Market analysis                                            │
│       Access: Signed NDA, verified identity                      │
│                                                                  │
│   TRANSACTION (Deal-Specific)                                    │
│   ├── Full due diligence                                         │
│   ├── Legal documents                                            │
│   ├── IP documentation                                           │
│   ├── Customer contracts                                         │
│   └── Employee data                                              │
│       Access: Active deal, board approval                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Tools

- **Terraform** >= 1.5.0
- **AWS CLI** >= 2.0
- **Node.js** >= 18.x
- **npm** or **bun**

### AWS Account Requirements

1. **Separate AWS Account** - Recommended to use a dedicated account for the data room
2. **AWS CLI configured** with appropriate credentials
3. **Route 53 hosted zone** for the domain (or ability to create one)
4. **ACM Certificate** in us-east-1 for the domain

### Domain Requirements

- Domain registered (e.g., `aurora-osi.com`)
- Subdomain for data room (e.g., `data-room.aurora-osi.com`)

---

## Initial Setup

### 1. Create AWS Account Structure

```bash
# Recommended: Use AWS Organizations for multi-account setup
# Create dedicated account for data room infrastructure

# Set up AWS CLI profile
aws configure --profile aurora-dataroom
```

### 2. Create S3 Bucket for Terraform State

```bash
# Create bucket for state storage
aws s3 mb s3://aurora-osi-terraform-state --profile aurora-dataroom

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket aurora-osi-terraform-state \
  --versioning-configuration Status=Enabled \
  --profile aurora-dataroom

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket aurora-osi-terraform-state \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms"}}]}' \
  --profile aurora-dataroom
```

### 3. Create DynamoDB Table for State Locking

```bash
aws dynamodb create-table \
  --table-name aurora-osi-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --profile aurora-dataroom
```

### 4. Request ACM Certificate

```bash
# Request certificate in us-east-1 (required for CloudFront)
aws acm request-certificate \
  --domain-name data-room.aurora-osi.com \
  --subject-alternative-names "*.data-room.aurora-osi.com" \
  --validation-method DNS \
  --region us-east-1 \
  --profile aurora-dataroom

# Note the certificate ARN for terraform variables
```

---

## Infrastructure Deployment

### 1. Configure Terraform Variables

Create `terraform.tfvars`:

```hcl
aws_region         = "us-east-1"
environment        = "production"
project_name       = "aurora-dataroom"
domain_name        = "data-room.aurora-osi.com"
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"
alert_email        = "alerts@aurora-osi.com"
admin_emails       = ["admin@aurora-osi.com"]

# Security settings
enable_mfa           = true
session_timeout_hours = 24
rate_limit_requests  = 1000

# Compliance
audit_log_retention_days = 2555  # 7 years
```

### 2. Initialize and Deploy

```bash
cd terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan
```

### 3. Note Important Outputs

```bash
# Save these outputs for application configuration
terraform output -json > outputs.json
```

Key outputs needed:
- `cognito_user_pool_id`
- `cognito_user_pool_client_id`
- `nameservers`
- `api_gateway_endpoint`

---

## Application Deployment

### 1. Configure Frontend Environment

Create `.env.production`:

```env
# Cognito
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<from terraform output>
NEXT_PUBLIC_COGNITO_CLIENT_ID=<from terraform output>
NEXT_PUBLIC_COGNITO_DOMAIN=<from terraform output>
NEXT_PUBLIC_AWS_REGION=us-east-1

# API
NEXT_PUBLIC_API_URL=https://data-room.aurora-osi.com/api

# Features
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_MAX_FILE_SIZE_MB=100
```

### 2. Build and Deploy Application

```bash
# Install dependencies
npm ci

# Build application
npm run build

# Deploy to S3 (if using S3 hosting)
aws s3 sync .next/ s3://<web-bucket> --delete

# Or deploy to Amplify
# Connect GitHub repository and configure build settings
```

### 3. Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*" \
  --profile aurora-dataroom
```

---

## DNS Configuration

### 1. Configure Nameservers

If using Route 53:
```bash
# Nameservers are automatically configured via Terraform
```

If using external registrar (e.g., GoDaddy):
1. Get nameservers from Terraform output
2. Update nameservers at registrar

### 2. Verify DNS Propagation

```bash
# Check DNS resolution
dig data-room.aurora-osi.com

# Verify SSL certificate
curl -vI https://data-room.aurora-osi.com
```

---

## Security Hardening

### 1. Configure Security Headers

Add to CloudFront function or Lambda@Edge:

```javascript
function handler(event) {
  var response = event.response;
  var headers = response.headers;
  
  headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubdomains; preload' };
  headers['x-content-type-options'] = { value: 'nosniff' };
  headers['x-frame-options'] = { value: 'DENY' };
  headers['x-xss-protection'] = { value: '1; mode=block' };
  headers['content-security-policy'] = { value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'" };
  
  return response;
}
```

### 2. Enable AWS Config

```bash
aws configservice put-configuration-recorder \
  --configuration-recorder name=aurora-config,roleARN=<CONFIG_ROLE_ARN> \
  --recording-group allSupported=true,includeGlobalResourceTypes=true
```

### 3. Set up GuardDuty

```bash
aws guardduty create-detector \
  --enable \
  --profile aurora-dataroom
```

---

## Monitoring and Alerting

### 1. CloudWatch Dashboard

Create dashboard for:
- API Gateway latency
- Lambda errors
- DynamoDB throttling
- S3 access patterns
- CloudFront metrics
- Cognito authentication events

### 2. Set Up Alerts

```bash
# Subscribe to SNS alerts
aws sns subscribe \
  --topic-arn <ALERTS_TOPIC_ARN> \
  --protocol email \
  --notification-endpoint security@aurora-osi.com
```

### 3. Enable CloudTrail Insights

```bash
aws cloudtrail put-insight-selectors \
  --trail-name aurora-dataroom-cloudtrail \
  --insight-selectors '[{"InsightType": "ApiCallRateInsight"},{"InsightType": "ApiErrorRateInsight"}]'
```

---

## Backup and Recovery

### 1. DynamoDB Point-in-Time Recovery

Enabled automatically via Terraform. Verify:

```bash
aws dynamodb describe-continuous-backups \
  --table-name aurora-dataroom-metadata-production
```

### 2. S3 Cross-Region Replication

For production, enable cross-region replication:

```hcl
# Add to terraform configuration
resource "aws_s3_bucket_replication_configuration" "documents" {
  # ... replication configuration
}
```

### 3. Document Recovery Procedures

```markdown
## Document Recovery Procedure

1. Identify corrupted/deleted document
2. Check S3 version history
3. Restore from version:
   aws s3api list-object-versions --bucket <BUCKET> --prefix <KEY>
   aws s3api get-object --bucket <BUCKET> --key <KEY> --version-id <VERSION> restored.doc
4. Re-upload if necessary
```

---

## Operational Procedures

### Daily Operations

- [ ] Check CloudWatch alarms
- [ ] Review failed authentication attempts
- [ ] Monitor API Gateway metrics
- [ ] Check for security findings

### Weekly Operations

- [ ] Review access requests
- [ ] Audit user permissions
- [ ] Check backup status
- [ ] Review WAF blocked requests

### Monthly Operations

- [ ] Rotate API keys
- [ ] Review IAM policies
- [ ] Update security patches
- [ ] Audit CloudTrail logs

### Quarterly Operations

- [ ] Penetration testing
- [ ] Access review and cleanup
- [ ] Disaster recovery drill
- [ ] Compliance audit

---

## Support Contacts

- **Technical Support**: support@aurora-osi.com
- **Security Issues**: security@aurora-osi.com
- **Data Room Access**: data-room@aurora-osi.com

---

## Troubleshooting

### Common Issues

**Issue**: Login fails with "User not found"
- Verify user exists in Cognito
- Check user status is CONFIRMED
- Verify email is verified

**Issue**: Document upload fails
- Check S3 bucket permissions
- Verify KMS key access
- Check file size limits

**Issue**: CloudFront returns 403
- Verify signed cookie configuration
- Check WAF rules
- Verify origin access identity

---

*Last Updated: 2024*
*Document Version: 1.0*
