import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const { requestedTier } = data

    // Get the access request
    const accessRequest = await db.accessRequest.findUnique({
      where: { id },
    })

    if (!accessRequest) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      )
    }

    // Check if user already exists
    let user = await db.dataRoomUser.findUnique({
      where: { email: accessRequest.email },
    })

    if (!user) {
      // Create new user
      user = await db.dataRoomUser.create({
        data: {
          email: accessRequest.email,
          name: accessRequest.name,
          company: accessRequest.company,
          title: accessRequest.title,
          phone: accessRequest.phone,
          role: 'VIEWER',
          isActive: true,
        },
      })
    }

    // Grant access to deal rooms
    if (accessRequest.dealRoomId) {
      await db.accessGrant.upsert({
        where: {
          userId_dealRoomId: {
            userId: user.id,
            dealRoomId: accessRequest.dealRoomId,
          },
        },
        create: {
          userId: user.id,
          dealRoomId: accessRequest.dealRoomId,
          accessTier: requestedTier || 'QUALIFIED',
        },
        update: {
          accessTier: requestedTier || 'QUALIFIED',
          isActive: true,
        },
      })
    } else {
      // Grant access to all active deal rooms
      const dealRooms = await db.dealRoom.findMany({
        where: { status: 'ACTIVE' },
      })

      for (const dealRoom of dealRooms) {
        await db.accessGrant.upsert({
          where: {
            userId_dealRoomId: {
              userId: user.id,
              dealRoomId: dealRoom.id,
            },
          },
          create: {
            userId: user.id,
            dealRoomId: dealRoom.id,
            accessTier: requestedTier || 'TEASER',
          },
          update: {
            accessTier: requestedTier || 'TEASER',
            isActive: true,
          },
        })
      }
    }

    // Update access request status
    await db.accessRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
      },
    })

    // Log the action
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'ACCESS_APPROVED',
        resource: 'ACCESS_REQUEST',
        resourceId: id,
        details: JSON.stringify({ requestedTier }),
      },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Error approving access request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
