import { db } from '../src/lib/db'

async function main() {
  console.log('Seeding database...')

  // Create super admin
  const admin = await db.dataRoomUser.upsert({
    where: { email: 'admin@aurora-osi.com' },
    update: {},
    create: {
      email: 'admin@aurora-osi.com',
      name: 'System Administrator',
      company: 'Aurora OSI',
      title: 'Administrator',
      role: 'SUPER_ADMIN',
      isActive: true,
      mfaEnabled: false,
    },
  })

  console.log('Created admin user:', admin.email)

  // Create a TEASER-only test user
  const teaserUser = await db.dataRoomUser.upsert({
    where: { email: 'investor@example.com' },
    update: {},
    create: {
      email: 'investor@example.com',
      name: 'Test Investor',
      company: 'Investment Partners LLC',
      title: 'Managing Director',
      role: 'VIEWER',
      isActive: true,
      mfaEnabled: false,
    },
  })

  // Create a QUALIFIED test user
  const qualifiedUser = await db.dataRoomUser.upsert({
    where: { email: 'qualified@example.com' },
    update: {},
    create: {
      email: 'qualified@example.com',
      name: 'Qualified Investor',
      company: 'Capital Ventures',
      title: 'Partner',
      role: 'VIEWER',
      isActive: true,
      mfaEnabled: false,
    },
  })

  console.log('Created test users:', teaserUser.email, qualifiedUser.email)

  // Create demo deal rooms
  const dealRoom1 = await db.dealRoom.upsert({
    where: { id: 'demo-deal-room-1' },
    update: {},
    create: {
      id: 'demo-deal-room-1',
      name: 'Project Aurora Investment',
      description: 'Confidential investment materials for Project Aurora',
      status: 'ACTIVE',
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  })

  const dealRoom2 = await db.dealRoom.upsert({
    where: { id: 'demo-deal-room-2' },
    update: {},
    create: {
      id: 'demo-deal-room-2',
      name: 'Technology Partnership',
      description: 'Technical documentation and partnership agreements',
      status: 'ACTIVE',
    },
  })

  console.log('Created deal rooms:', dealRoom1.name, dealRoom2.name)

  // Create sample documents with different access tiers
  const documents = [
    {
      id: 'demo-doc-1',
      dealRoomId: dealRoom1.id,
      title: 'Executive Summary',
      description: 'High-level overview of the investment opportunity',
      fileName: 'Executive_Summary.pdf',
      fileSize: 245000,
      mimeType: 'application/pdf',
      s3Key: 'documents/executive-summary.pdf',
      accessTier: 'TEASER',
      status: 'APPROVED',
      category: 'Overview',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-2',
      dealRoomId: dealRoom1.id,
      title: 'Company Presentation',
      description: 'Investor pitch deck',
      fileName: 'Company_Presentation.pdf',
      fileSize: 320000,
      mimeType: 'application/pdf',
      s3Key: 'documents/presentation.pdf',
      accessTier: 'TEASER',
      status: 'APPROVED',
      category: 'Marketing',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-3',
      dealRoomId: dealRoom1.id,
      title: 'Financial Projections',
      description: '5-year financial forecast and analysis',
      fileName: 'Financial_Projections.xlsx',
      fileSize: 156000,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      s3Key: 'documents/financials.xlsx',
      accessTier: 'QUALIFIED',
      status: 'APPROVED',
      category: 'Financial',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-4',
      dealRoomId: dealRoom1.id,
      title: 'Market Analysis',
      description: 'Market size and competitive landscape',
      fileName: 'Market_Analysis.pdf',
      fileSize: 410000,
      mimeType: 'application/pdf',
      s3Key: 'documents/market-analysis.pdf',
      accessTier: 'QUALIFIED',
      status: 'APPROVED',
      category: 'Research',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-5',
      dealRoomId: dealRoom1.id,
      title: 'Due Diligence Report',
      description: 'Comprehensive due diligence findings',
      fileName: 'Due_Diligence_Report.pdf',
      fileSize: 520000,
      mimeType: 'application/pdf',
      s3Key: 'documents/due-diligence.pdf',
      accessTier: 'TRANSACTION',
      status: 'APPROVED',
      category: 'Legal',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-6',
      dealRoomId: dealRoom1.id,
      title: 'Share Purchase Agreement',
      description: 'Draft transaction documents',
      fileName: 'SPA_Draft.pdf',
      fileSize: 280000,
      mimeType: 'application/pdf',
      s3Key: 'documents/spa.pdf',
      accessTier: 'TRANSACTION',
      status: 'APPROVED',
      category: 'Legal',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-7',
      dealRoomId: dealRoom2.id,
      title: 'Partnership Overview',
      description: 'Introduction to partnership opportunity',
      fileName: 'Partnership_Overview.pdf',
      fileSize: 180000,
      mimeType: 'application/pdf',
      s3Key: 'documents/partnership.pdf',
      accessTier: 'TEASER',
      status: 'APPROVED',
      category: 'Overview',
      uploadedBy: admin.id,
    },
    {
      id: 'demo-doc-8',
      dealRoomId: dealRoom2.id,
      title: 'Technical Architecture',
      description: 'System architecture and technical specifications',
      fileName: 'Technical_Architecture.pdf',
      fileSize: 890000,
      mimeType: 'application/pdf',
      s3Key: 'documents/architecture.pdf',
      accessTier: 'QUALIFIED',
      status: 'APPROVED',
      category: 'Technical',
      uploadedBy: admin.id,
    },
  ]

  for (const doc of documents) {
    await db.document.upsert({
      where: { id: doc.id },
      update: {},
      create: doc,
    })
  }

  console.log('Created', documents.length, 'sample documents')

  // Grant admin access to all deal rooms (TRANSACTION level)
  await db.accessGrant.upsert({
    where: {
      userId_dealRoomId: {
        userId: admin.id,
        dealRoomId: dealRoom1.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      dealRoomId: dealRoom1.id,
      accessTier: 'TRANSACTION',
    },
  })

  await db.accessGrant.upsert({
    where: {
      userId_dealRoomId: {
        userId: admin.id,
        dealRoomId: dealRoom2.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      dealRoomId: dealRoom2.id,
      accessTier: 'TRANSACTION',
    },
  })

  // Grant TEASER user access to deal room 1 (TEASER level only)
  await db.accessGrant.upsert({
    where: {
      userId_dealRoomId: {
        userId: teaserUser.id,
        dealRoomId: dealRoom1.id,
      },
    },
    update: {},
    create: {
      userId: teaserUser.id,
      dealRoomId: dealRoom1.id,
      accessTier: 'TEASER',
    },
  })

  // Grant QUALIFIED user access to deal room 1 (QUALIFIED level)
  await db.accessGrant.upsert({
    where: {
      userId_dealRoomId: {
        userId: qualifiedUser.id,
        dealRoomId: dealRoom1.id,
      },
    },
    update: {},
    create: {
      userId: qualifiedUser.id,
      dealRoomId: dealRoom1.id,
      accessTier: 'QUALIFIED',
    },
  })

  console.log('Granted access permissions')
  console.log('\nSeeding complete!')
  console.log('\n========================================')
  console.log('DEMO CREDENTIALS')
  console.log('========================================')
  console.log('\n🔐 Admin (Full Access):')
  console.log('   Email: admin@aurora-osi.com')
  console.log('   Password: (any password)')
  console.log('   Access: All documents (TRANSACTION tier)')
  console.log('\n📊 TEASER User (Limited Access):')
  console.log('   Email: investor@example.com')
  console.log('   Password: (any password)')
  console.log('   Access: Only TEASER documents')
  console.log('\n📋 QUALIFIED User (Medium Access):')
  console.log('   Email: qualified@example.com')
  console.log('   Password: (any password)')
  console.log('   Access: TEASER + QUALIFIED documents')
  console.log('\n========================================')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
