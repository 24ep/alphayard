import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'content:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const pageNum = parseInt(searchParams.get('page') || '1');
    const pageSizeNum = parseInt(searchParams.get('page_size') || '20');
    const search = searchParams.get('search');

    let sql = `
      SELECT cp.*, 
             ca.views, ca.clicks, ca.conversions
      FROM public.content_pages cp
      LEFT JOIN public.content_analytics ca ON cp.id = ca.page_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let pIdx = 1;

    if (type && type !== 'all') {
      sql += ` AND cp.type = $${pIdx}`;
      params.push(type);
      pIdx++;
    }

    if (status && status !== 'all') {
      sql += ` AND cp.status = $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (search) {
      sql += ` AND (cp.title ILIKE $${pIdx} OR cp.slug ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }

    sql += ` ORDER BY cp.updated_at DESC`;

    const offset = (pageNum - 1) * pageSizeNum;
    sql += ` LIMIT $${pIdx} OFFSET $${pIdx + 1}`;
    params.push(pageSizeNum, offset);

    const pages = await prisma.$queryRawUnsafe<any[]>(sql, ...params);
    return NextResponse.json({ pages: pages || [] });
  } catch (error: any) {
    console.error('List dynamic content pages error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'content:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, slug, type, status = 'draft', components = [], mobile_display = {} } = body;

    if (!title || !slug || !type) {
      return NextResponse.json({ error: 'Title, slug, and type are required' }, { status: 400 });
    }

    const adminId = auth.admin.adminId || auth.admin.id || 'admin';

    const rows = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO public.content_pages (title, slug, type, status, components, mobile_display, created_by, updated_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, title, slug, type, status, JSON.stringify(components), JSON.stringify(mobile_display), adminId, adminId);

    return NextResponse.json({ page: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create dynamic content page error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
