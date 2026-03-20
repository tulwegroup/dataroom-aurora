# Aurora OSI Data Room - Production Deployment Guide

## Quick Start: Deploy to Production

### Option 1: AWS Amplify (Recommended for Next.js)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial data room commit"
   git branch -M main
   git remote add origin https://github.com/tulwegroup/aurora-dataroom.git
   git push -u origin main
   ```

2. **Connect to AWS Amplify**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure Build Settings**
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
   ```

4. **Add Environment Variables**
   ```
   DATABASE_URL=file:./db/custom.db
   ```

5. **Deploy**
   - Click "Save and deploy"

---

### Option 2: Self-Hosted with Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npx prisma generate
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/db ./db
   COPY --from=builder /app/prisma ./prisma

   EXPOSE 3000
   ENV NODE_ENV=production
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t aurora-dataroom .
   docker run -p 3000:3000 aurora-dataroom
   ```

---

## Document Upload in Production

### How Admins Upload Documents

1. **Log in** with admin credentials (admin@aurora-osi.com)
2. **Navigate** to a Deal Room from the Dashboard
3. **Click "Upload Document"** button (visible only to admins)
4. **Fill in details:**
   - Select file (PDF, Excel, Word, images supported)
   - Enter title
   - Add description (optional)
   - Set access tier (TEASER, QUALIFIED, or TRANSACTION)
   - Choose category
5. **Click "Upload Document"**

### Access Tier Enforcement

The system enforces strict tier-based access:

| User Tier | Can Access |
|-----------|------------|
| TEASER | TEASER documents only |
| QUALIFIED | TEASER + QUALIFIED documents |
| TRANSACTION | All documents (TEASER, QUALIFIED, TRANSACTION) |

### Managing User Access Tiers

As an admin, you can change a user's access tier:

1. Go to **Admin Console** → **Users** tab
2. Click the **more options (⋯)** menu on a user
3. Select **Edit**
4. Update their access tier
5. Click **Save**

---

## Adding Real S3 Document Storage

For production, documents should be stored in S3:

### 1. Create S3 Bucket

```bash
aws s3 mb s3://aurora-osi-dataroom-documents
aws s3api put-bucket-versioning --bucket aurora-osi-dataroom-documents --versioning-configuration Status=Enabled
```

### 2. Update Document Upload API

Create `/api/data-room/documents/upload/route.ts`:

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: 'us-east-1' })

export async function POST(request: Request) {
  const { fileName, fileType, dealRoomId } = await request.json()
  
  const key = `${dealRoomId}/${Date.now()}-${fileName}`
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_DOCUMENTS_BUCKET!,
    Key: key,
    ContentType: fileType,
  })
  
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 })
  
  return Response.json({ uploadUrl, key })
}
```

### 3. Update Frontend Upload

```typescript
// 1. Get presigned URL
const { uploadUrl, key } = await fetch('/api/data-room/documents/upload', {
  method: 'POST',
  body: JSON.stringify({ fileName: file.name, fileType: file.type, dealRoomId }),
}).then(r => r.json())

// 2. Upload directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
})

// 3. Save metadata to database
await fetch('/api/data-room/documents', {
  method: 'POST',
  body: JSON.stringify({ ...metadata, s3Key: key }),
})
```

---

## Adding Real Authentication

For production, replace demo auth with Cognito:

### 1. Set up Cognito User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name aurora-dataroom-users \
  --policies '{"PasswordPolicy":{"MinimumLength":12,"RequireUppercase":true,"RequireLowercase":true,"RequireNumbers":true,"RequireSymbols":true}}'
```

### 2. Install Amplify

```bash
npm install aws-amplify @aws-amplify/ui-react
```

### 3. Configure Amplify

```typescript
// src/lib/amplify.ts
import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
})
```

### 4. Replace Login Component

```typescript
import { Authenticator } from '@aws-amplify/ui-react'

export function LoginView() {
  return (
    <Authenticator>
      {({ user }) => <DashboardView user={user} />}
    </Authenticator>
  )
}
```

---

## Production Checklist

### Security
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up WAF rules
- [ ] Enable CloudTrail logging
- [ ] Configure backup policies
- [ ] Set up rate limiting
- [ ] Enable MFA for admins

### Database
- [ ] Migrate to PostgreSQL (from SQLite)
- [ ] Enable point-in-time recovery
- [ ] Set up read replicas
- [ ] Configure connection pooling

### Storage
- [ ] Configure S3 bucket policies
- [ ] Enable server-side encryption
- [ ] Set up lifecycle policies
- [ ] Configure CORS for uploads

### Monitoring
- [ ] Set up CloudWatch alarms
- [ ] Configure error tracking (Sentry)
- [ ] Enable performance monitoring
- [ ] Set up log aggregation

### Backup
- [ ] Database backup strategy
- [ ] S3 cross-region replication
- [ ] Document recovery procedures

---

## Support

- **Technical Issues**: support@aurora-osi.com
- **Data Room Access**: data-room@aurora-osi.com
- **Security Concerns**: security@aurora-osi.com

---

*Last Updated: January 2026*
