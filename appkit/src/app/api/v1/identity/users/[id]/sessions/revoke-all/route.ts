import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const userId = params.id;
    const adminId = auth.admin.id || auth.admin.adminId;

    const result = await prisma.userSession.updateMany({
      where: { 
        userId,
        isActive: true
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
        revokedBy: adminId,
        revokeReason: 'Revoked all sessions by admin'
      }
    });

    return NextResponse.json({ success: true, revokedCount: result.count });
  } catch (error: any) {
    console.error('Revoke all sessions error:', error);
    return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 });
  }
}
