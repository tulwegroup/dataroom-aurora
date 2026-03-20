import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const user = await db.dataRoomUser.update({
      where: { id },
      data,
    })

    // Log the action
    await db.auditLog.create({
      data: {
        action: 'USER_UPDATED',
        resource: 'USER',
        resourceId: id,
        details: JSON.stringify(data),
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        title: user.title,
        role: user.role,
        isActive: user.isActive,
      },
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.dataRoomUser.delete({
      where: { id },
    })

    // Log the action
    await db.auditLog.create({
      data: {
        action: 'USER_DELETED',
        resource: 'USER',
        resourceId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
