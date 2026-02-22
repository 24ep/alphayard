import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import ApplicationService from '@/server/services/ApplicationService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'applications:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const stats = await ApplicationService.getApplicationStats(params.id);
    if (!stats) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get application stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch application stats' }, { status: 500 });
  }
}
