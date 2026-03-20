import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { accessTier, dealRoomId } = await request.json();

    const accessRequest = await db.accessRequest.findUnique({
      where: { id }
    });

    if (!accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Get or create default deal room
    let targetDealRoomId = dealRoomId;
    if (!targetDealRoomId) {
      const defaultDealRoom = await db.dealRoom.findFirst({
        where: { status: 'ACTIVE' }
      });
      if (defaultDealRoom) {
        targetDealRoomId = defaultDealRoom.id;
      } else {
        // Create a default deal room
        const newDealRoom = await db.dealRoom.create({
          data: {
            name: 'Aurora Data Room',
            description: 'Default data room for Aurora OSI'
          }
        });
        targetDealRoomId = newDealRoom.id;
      }
    }

    // Create user
    const newUser = await db.dataRoomUser.create({
      data: {
        email: accessRequest.email,
        name: accessRequest.name,
        company: accessRequest.company,
        title: accessRequest.title,
        phone: accessRequest.phone,
        role: 'VIEWER',
        isActive: true,
      }
    });

    // Create access grant
    await db.accessGrant.create({
      data: {
        userId: newUser.id,
        dealRoomId: targetDealRoomId,
        accessTier: accessTier || accessRequest.requestedTier,
        grantedBy: user.id,
      }
    });

    // Update request status
    await db.accessRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Approve request error:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
}
