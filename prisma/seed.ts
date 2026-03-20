import { config } from 'dotenv';
config();

import { PrismaClient, UserRole, AccessTier, DealRoomStatus, DocumentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default deal room
  const dealRoom = await prisma.dealRoom.upsert({
    where: { id: 'default-deal-room' },
    update: {},
    create: {
      id: 'default-deal-room',
      name: 'Aurora Data Room',
      description: 'Main data room for Aurora OSI confidential documents',
      status: DealRoomStatus.ACTIVE,
    },
  });

  console.log('Created deal room:', dealRoom.name);

  // Create super admin
  const superAdmin = await prisma.dataRoomUser.upsert({
    where: { email: 'admin@aurora-osi.com' },
    update: {},
    create: {
      email: 'admin@aurora-osi.com',
      name: 'Aurora Admin',
      company: 'Aurora OSI',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('Created super admin:', superAdmin.email);

  // Give admin access to the deal room
  await prisma.accessGrant.upsert({
    where: {
      userId_dealRoomId: {
        userId: superAdmin.id,
        dealRoomId: dealRoom.id,
      }
    },
    update: {},
    create: {
      userId: superAdmin.id,
      dealRoomId: dealRoom.id,
      accessTier: AccessTier.TRANSACTION,
      grantedBy: superAdmin.id,
    },
  });

  // Create sample documents for each tier
  const sampleDocuments = [
    {
      title: 'Company Overview',
      description: 'Introduction to Aurora OSI and our technology platform',
      fileName: 'company-overview.pdf',
      fileSize: 2500000,
      accessTier: AccessTier.TEASER,
      category: 'Marketing',
    },
    {
      title: 'Investment Thesis',
      description: 'Key investment highlights and market opportunity',
      fileName: 'investment-thesis.pdf',
      fileSize: 1800000,
      accessTier: AccessTier.TEASER,
      category: 'Marketing',
    },
    {
      title: 'Financial Summary',
      description: 'Historical and projected financial performance',
      fileName: 'financial-summary.xlsx',
      fileSize: 500000,
      accessTier: AccessTier.QUALIFIED,
      category: 'Financial',
    },
    {
      title: 'Technology Overview',
      description: 'Detailed technical architecture and capabilities',
      fileName: 'technology-overview.pdf',
      fileSize: 4500000,
      accessTier: AccessTier.QUALIFIED,
      category: 'Technical',
    },
    {
      title: 'Due Diligence Report',
      description: 'Complete due diligence documentation',
      fileName: 'due-diligence-report.pdf',
      fileSize: 12000000,
      accessTier: AccessTier.TRANSACTION,
      category: 'Legal',
    },
  ];

  for (const doc of sampleDocuments) {
    await prisma.document.upsert({
      where: {
        id: `sample-${doc.fileName.replace(/\./g, '-')}`
      },
      update: {},
      create: {
        id: `sample-${doc.fileName.replace(/\./g, '-')}`,
        dealRoomId: dealRoom.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        accessTier: doc.accessTier,
        status: DocumentStatus.APPROVED,
        category: doc.category,
        uploadedBy: superAdmin.id,
      },
    });
  }

  console.log('Created sample documents');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
