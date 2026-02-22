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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [entries, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.loginHistory.count({ where: { userId } }),
    ]);

    return NextResponse.json({ entries, total });
  } catch (error: any) {
    console.error('Get user login history error:', error);
    return NextResponse.json({ error: 'Failed to get login history' }, { status: 500 });
  }
}
