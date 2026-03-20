import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET - List all access requests (admin only)
export async function GET() {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await db.accessRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new access request
export async function POST(request: NextRequest) {
  try {
    const { email, name, company, title, phone, message, requestedTier } = await request.json();

    if (!email || !name || !company) {
      return NextResponse.json(
        { error: 'Email, name, and company are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.dataRoomUser.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if request already exists
    const existingRequest = await db.accessRequest.findFirst({
      where: { 
        email: email.toLowerCase(),
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending request already exists for this email' },
        { status: 400 }
      );
    }

    const accessRequest = await db.accessRequest.create({
      data: {
        email: email.toLowerCase(),
        name,
        company,
        title,
        phone,
        message,
        requestedTier: requestedTier || 'TEASER',
        status: 'PENDING',
      }
    });

    return NextResponse.json({ 
      success: true, 
      request: accessRequest 
    });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
