import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const requests = await db.accessRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      requests: requests.map(r => ({
        id: r.id,
        email: r.email,
        name: r.name,
        company: r.company,
        title: r.title,
        requestedTier: r.requestedTier,
        status: r.status,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Error fetching access requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, email, company, title, phone, requestedTier, message, dealRoomId } = data

    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Name, email, and company are required' },
        { status: 400 }
      )
    }

    // Check if request already exists
    const existingRequest = await db.accessRequest.findFirst({
      where: { email: email.toLowerCase(), status: 'PENDING' },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending access request' },
        { status: 400 }
      )
    }

    // Create access request
    const accessRequest = await db.accessRequest.create({
      data: {
        email: email.toLowerCase(),
        name,
        company,
        title,
        phone,
        requestedTier: requestedTier || 'TEASER',
        message,
        dealRoomId,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      requestId: accessRequest.id,
    })
  } catch (error) {
    console.error('Error creating access request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
