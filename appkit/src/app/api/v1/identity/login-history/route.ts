import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'audit:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const success = searchParams.get('success');
    const suspicious = searchParams.get('suspicious');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (userId) where.userId = userId;
    if (email) where.email = email;
    if (success !== null) {
      where.success = success === 'true';
    }
    if (suspicious !== null) {
      where.isSuspicious = suspicious === 'true';
    }

    const [entries, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.loginHistory.count({ where }),
    ]);

    return NextResponse.json({ entries, total });
  } catch (error: any) {
    console.error('Get login history error:', error);
    return NextResponse.json({ error: 'Failed to get login history' }, { status: 500 });
  }
}
