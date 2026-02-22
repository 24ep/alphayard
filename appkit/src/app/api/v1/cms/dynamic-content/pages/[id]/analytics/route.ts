import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'analytics:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM public.content_analytics WHERE page_id = $1',
      params.id
    );

    const analytics = rows[0];

    return NextResponse.json({
      analytics: analytics || {
        views: 0,
        clicks: 0,
        conversions: 0,
        last_viewed: null
      }
    });
  } catch (error: any) {
    console.error('Get dynamic content analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
