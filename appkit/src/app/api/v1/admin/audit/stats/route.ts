import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import auditService from '@/server/services/auditService';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const result = await auditService.getAuditStatistics({ 
      startDate: startDate ? new Date(startDate) : undefined, 
      endDate: endDate ? new Date(endDate) : undefined 
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/v1/admin/audit/stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
