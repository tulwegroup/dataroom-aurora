import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

    // For admins, show all deal rooms
    // For regular users, only show deal rooms they have access to
    const dealRooms = isAdmin 
      ? await db.dealRoom.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' }
        })
      : await db.dealRoom.findMany({
          where: {
            status: 'ACTIVE',
            id: { in: user.accessGrants.map(g => g.dealRoomId) }
          },
          orderBy: { createdAt: 'desc' }
        });

    return NextResponse.json({ dealRooms });
  } catch (error) {
    console.error('Fetch deal rooms error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal rooms' },
      { status: 500 }
    );
  }
}
