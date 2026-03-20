import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (userId) where.userId = userId

    const logs = await db.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    const total = await db.auditLog.count({ where })

    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id,
        userId: l.userId,
        userName: l.user?.name || l.user?.email || 'Unknown',
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        ipAddress: l.ipAddress,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, action, resource, resourceId, details } = data

    const log = await db.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({ success: true, logId: log.id })
  } catch (error) {
    console.error('Error creating audit log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
