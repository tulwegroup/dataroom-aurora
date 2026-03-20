import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get document info before deleting
    const document = await db.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete the document
    await db.document.delete({
      where: { id },
    })

    // Log the deletion
    await db.auditLog.create({
      data: {
        action: 'DOCUMENT_DELETED',
        resource: 'DOCUMENT',
        resourceId: id,
        details: JSON.stringify({
          fileName: document.fileName,
          title: document.title,
        }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const document = await db.document.update({
      where: { id },
      data,
    })

    // Log the update
    await db.auditLog.create({
      data: {
        action: 'DOCUMENT_UPDATED',
        resource: 'DOCUMENT',
        resourceId: id,
        details: JSON.stringify(data),
      },
    })

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        accessTier: document.accessTier,
        status: document.status,
      },
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
