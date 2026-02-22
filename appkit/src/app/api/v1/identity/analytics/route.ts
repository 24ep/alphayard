import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'analytics:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('applicationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const verifiedUsers = await prisma.user.count({ where: { isVerified: true } });
    
    // Login stats
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const loginStats = await prisma.loginHistory.groupBy({
      by: ['success'],
      where: {
        createdAt: { gte: start, lte: end },
        ...(applicationId ? { applicationId: String(applicationId) } : {})
      },
      _count: true
    });

    const successLogins = loginStats.find((s: any) => s.success)?._count || 0;
    const failedLogins = loginStats.find((s: any) => !s.success)?._count || 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      verifiedUsers,
      logins: {
        success: successLogins,
        failed: failedLogins,
        total: successLogins + failedLogins
      },
      period: { start, end }
    });
  } catch (error: any) {
    console.error('Error getting identity analytics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
