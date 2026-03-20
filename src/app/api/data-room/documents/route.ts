import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Access tier hierarchy: TEASER < QUALIFIED < TRANSACTION
const TIER_HIERARCHY: Record<string, string[]> = {
  'TEASER': ['TEASER'],
  'QUALIFIED': ['TEASER', 'QUALIFIED'],
  'TRANSACTION': ['TEASER', 'QUALIFIED', 'TRANSACTION'],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dealRoomId = searchParams.get('dealRoomId')
    const userTier = searchParams.get('userTier') || 'TEASER'
    const userRole = searchParams.get('userRole') || 'VIEWER'

    // Build where clause
    const where: Record<string, unknown> = { status: 'APPROVED' }
    if (dealRoomId) {
      where.dealRoomId = dealRoomId
    }

    // Filter by access tier based on user's tier
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      const allowedTiers = TIER_HIERARCHY[userTier] || ['TEASER']
      where.accessTier = { in: allowedTiers }
    }

    const documents = await db.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      documents: documents.map(d => ({
        id: d.id,
        dealRoomId: d.dealRoomId,
        title: d.title,
        description: d.description,
        fileName: d.fileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
        accessTier: d.accessTier,
        status: d.status,
        category: d.category,
        tags: d.tags ? JSON.parse(d.tags) : [],
        version: d.version,
        hasWatermark: d.hasWatermark,
        createdAt: d.createdAt.toISOString(),
        uploadedBy: d.uploadedBy,
      })),
      userTier,
      allowedTiers: TIER_HIERARCHY[userTier] || ['TEASER'],
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      dealRoomId, 
      title, 
      description, 
      fileName, 
      fileSize, 
      mimeType, 
      s3Key,
      accessTier,
      category,
      tags,
      uploadedBy,
      userRole 
    } = data

    if (!dealRoomId || !title || !fileName) {
      return NextResponse.json(
        { error: 'Deal room ID, title, and file name are required' },
        { status: 400 }
      )
    }

    // Only admins can upload documents
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can upload documents' },
        { status: 403 }
      )
    }

    const document = await db.document.create({
      data: {
        dealRoomId,
        title,
        description,
        fileName,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        s3Key: s3Key || `documents/${Date.now()}-${fileName}`,
        accessTier: accessTier || 'QUALIFIED',
        category,
        tags: tags ? JSON.stringify(tags) : null,
        uploadedBy,
        status: 'APPROVED',
      },
    })

    // Log the action
    await db.auditLog.create({
      data: {
        action: 'DOCUMENT_UPLOADED',
        resource: 'DOCUMENT',
        resourceId: document.id,
        userId: uploadedBy,
        details: JSON.stringify({ fileName, accessTier, dealRoomId }),
      },
    })

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName,
        accessTier: document.accessTier,
        status: document.status,
      },
    })
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
