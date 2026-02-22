import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = `SELECT id, email, first_name as "firstName", last_name as "lastName", phone_number as phone, 
                        preferences->>'role' as role, 
                        (CASE WHEN is_active THEN 'active' ELSE 'inactive' END) as status, 
                        is_verified as email_verified, created_at as "createdAt", last_login_at as "lastLoginAt"
                 FROM public.users WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(status === 'active');
    }
    if (role) {
      query += ` AND preferences->>'role' = $${paramIndex++}`;
      params.push(role);
    }
    if (startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const users = await prisma.$queryRawUnsafe<any[]>(query, ...params);

    if (format === 'csv') {
      const headers = 'ID,Email,First Name,Last Name,Phone,Role,Status,Email Verified,Created At,Last Login';
      const rows = users.map((u: any) => 
        `${u.id},${u.email},${u.firstName || ''},${u.lastName || ''},${u.phone || ''},${u.role},${u.status},${u.email_verified},${u.createdAt},${u.lastLoginAt || ''}`
      );
      const csv = [headers, ...rows].join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=users-export.csv',
        },
      });
    }

    return NextResponse.json({ users, total: users.length });
  } catch (error: any) {
    console.error('Export users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
