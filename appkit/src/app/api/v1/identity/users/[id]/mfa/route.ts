import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const userId = params.id;
    const mfaSettings = await prisma.userMFA.findMany({
      where: { userId },
    });

    return NextResponse.json({ mfaSettings });
  } catch (error: any) {
    console.error('Get MFA settings error:', error);
    return NextResponse.json({ error: 'Failed to get MFA settings' }, { status: 500 });
  }
}
