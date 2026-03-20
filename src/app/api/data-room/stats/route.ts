import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [totalDocuments, activeDealRooms, pendingRequests, recentActivity] = await Promise.all([
      db.document.count({ where: { status: 'APPROVED' } }),
      db.dealRoom.count({ where: { status: 'ACTIVE' } }),
      db.accessRequest.count({ where: { status: 'PENDING' } }),
      db.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return NextResponse.json({
      totalDocuments,
      activeDealRooms,
      pendingRequests,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
