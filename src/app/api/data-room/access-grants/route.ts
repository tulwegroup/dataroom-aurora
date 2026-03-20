import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dealRoomId = searchParams.get('dealRoomId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const where: Record<string, unknown> = { userId, isActive: true }
    if (dealRoomId) {
      where.dealRoomId = dealRoomId
    }

    const grants = await db.accessGrant.findMany({
      where,
      include: {
        dealRoom: {
          select: { id: true, name: true, status: true }
        }
      }
    })

    // Return single grant if dealRoomId specified
    if (dealRoomId && grants.length === 1) {
      return NextResponse.json({ grant: grants[0] })
    }

    return NextResponse.json({ grants })
  } catch (error) {
    console.error('Error fetching access grants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
