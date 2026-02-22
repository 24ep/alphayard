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
    const { searchParams } = new URL(req.url);
    const includeExpired = searchParams.get('includeExpired') === 'true';

    const where: any = { userId };
    if (!includeExpired) {
      where.isActive = true;
      where.expiresAt = { gte: new Date() };
    }

    const [sessions, total] = await Promise.all([
      prisma.userSession.findMany({
        where,
        orderBy: { lastActivityAt: 'desc' },
      }),
      prisma.userSession.count({ where }),
    ]);

    return NextResponse.json({ sessions, total });
  } catch (error: any) {
    console.error('Get user sessions error:', error);
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 });
  }
}
