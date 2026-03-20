import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccessTier } from '@/lib/auth';

// GET documents for a deal room
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dealRoomId = request.nextUrl.searchParams.get('dealRoomId');
    if (!dealRoomId) {
      return NextResponse.json({ error: 'Deal room ID required' }, { status: 400 });
    }

    // Get user's access tier for this deal room
    const userAccess = user.accessGrants.find(g => g.dealRoomId === dealRoomId);
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';

    // Build where clause based on access
    const documents = await db.document.findMany({
      where: {
        dealRoomId,
        status: 'APPROVED',
        // For non-admins, only show documents they can access
        ...( !isAdmin && userAccess ? {
          accessTier: { in: getAccessibleTiers(userAccess.accessTier) }
        } : !isAdmin ? {
          accessTier: 'TEASER' // Default to teaser only if no access grant
        } : {})
      },
      include: {
        dealRoom: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST - Upload a new document
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dealRoomId = formData.get('dealRoomId') as string;
    const accessTier = formData.get('accessTier') as string || 'TEASER';
    const category = formData.get('category') as string;

    if (!file || !title || !dealRoomId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you'd upload to S3 here
    // For now, we'll just store metadata
    const document = await db.document.create({
      data: {
        dealRoomId,
        title,
        description,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        accessTier: accessTier as any,
        category,
        status: 'APPROVED',
        uploadedBy: user.id,
      }
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

function getAccessibleTiers(userTier: string): string[] {
  const tiers = ['TEASER', 'QUALIFIED', 'TRANSACTION'];
  const tierIndex = tiers.indexOf(userTier);
  return tiers.slice(0, tierIndex + 1);
}
