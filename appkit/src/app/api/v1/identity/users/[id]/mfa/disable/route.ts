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
    const { mfaType } = await req.json();

    if (mfaType) {
      await prisma.userMFA.update({
        where: { 
          userId_mfaType: { userId, mfaType }
        },
        data: { isEnabled: false }
      });
    } else {
      // Disable all MFA types for user
      await prisma.userMFA.updateMany({
        where: { userId },
        data: { isEnabled: false }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Disable MFA error:', error);
    return NextResponse.json({ error: 'Failed to disable MFA' }, { status: 500 });
  }
}
