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

    const accessRequest = await db.accessRequest.findUnique({
      where: { id }
    });

    if (!accessRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await db.accessRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject request error:', error);
    return NextResponse.json(
      { error: 'Failed to reject request' },
      { status: 500 }
    );
  }
}
