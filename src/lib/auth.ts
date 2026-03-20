import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { DataRoomUser, UserRole, AccessTier } from '@prisma/client';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  company: string | null;
  accessGrants: Array<{
    dealRoomId: string;
    accessTier: AccessTier;
  }>;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  
  if (!sessionToken) return null;
  
  try {
    const user = await db.dataRoomUser.findUnique({
      where: { id: sessionToken },
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
    
    if (!user || !user.isActive) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      accessGrants: user.accessGrants,
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

export async function createSession(userId: string): Promise<string> {
  const cookieStore = await cookies();
  cookieStore.set('session_token', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  await db.dataRoomUser.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() }
  });
  
  return userId;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
}

export function canAccessTier(userTier: AccessTier, documentTier: AccessTier): boolean {
  const tierOrder = { TEASER: 1, QUALIFIED: 2, TRANSACTION: 3 };
  return tierOrder[userTier] >= tierOrder[documentTier];
}

export function isAdmin(role: UserRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}
