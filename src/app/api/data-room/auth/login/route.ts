import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await db.dataRoomUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    // For demo purposes, accept any password for existing users
    // In production, verify password hash

    // Generate session token
    const token = randomBytes(32).toString('hex')

    // Update last login
    await db.dataRoomUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log the login
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'USER',
        resourceId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Get user's highest access tier from their grants
    const grants = await db.accessGrant.findMany({
      where: { userId: user.id, isActive: true },
      select: { accessTier: true },
    })

    // Determine highest tier (TRANSACTION > QUALIFIED > TEASER)
    const tierPriority = { TRANSACTION: 3, QUALIFIED: 2, TEASER: 1 }
    let highestTier = 'TEASER'
    for (const grant of grants) {
      if ((tierPriority as Record<string, number>)[grant.accessTier] > (tierPriority as Record<string, number>)[highestTier]) {
        highestTier = grant.accessTier
      }
    }

    // Admins get TRANSACTION tier
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      highestTier = 'TRANSACTION'
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        title: user.title,
        role: user.role,
        accessTier: highestTier,
        isActive: user.isActive,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt?.toISOString(),
        createdAt: user.createdAt.toISOString(),
      },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
