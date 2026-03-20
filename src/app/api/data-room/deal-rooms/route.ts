import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const dealRooms = await db.dealRoom.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    })

    return NextResponse.json({
      dealRooms: dealRooms.map(dr => ({
        id: dr.id,
        name: dr.name,
        description: dr.description,
        status: dr.status,
        validFrom: dr.validFrom?.toISOString(),
        validUntil: dr.validUntil?.toISOString(),
        documentCount: dr._count.documents,
        createdAt: dr.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching deal rooms:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description, validFrom, validUntil } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const dealRoom = await db.dealRoom.create({
      data: {
        name,
        description,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({
      dealRoom: {
        id: dealRoom.id,
        name: dealRoom.name,
        description: dealRoom.description,
        status: dealRoom.status,
      },
    })
  } catch (error) {
    console.error('Error creating deal room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
