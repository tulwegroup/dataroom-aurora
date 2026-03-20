import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.dataRoomUser.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        accessGrants: {
          where: { isActive: true },
          select: {
            dealRoomId: true,
            accessTier: true,
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // For demo purposes, allow password "password" for all users
    // In production, you'd verify the actual hashed password
    const validPassword = password === 'password';

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        accessGrants: user.accessGrants,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
