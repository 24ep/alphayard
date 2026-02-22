import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import auditService from '@/server/services/auditService';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'audit:export')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    const result: any = await auditService.exportAuditLogs({
      startDate: startDate ? new Date(startDate) : undefined, 
      endDate: endDate ? new Date(endDate) : undefined,
      format: (format.toLowerCase() as 'csv' | 'json')
    });

    const filename = `audit_logs_${Date.now()}.${format}`;
    
    const headers = new Headers();
    let body = result;
    if (format === 'json') {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(result);
    } else {
      headers.set('Content-Type', 'text/csv');
    }
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return new NextResponse(body, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('GET /api/v1/admin/audit/export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
