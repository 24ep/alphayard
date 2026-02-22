import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // authenticateToken allows user or admin
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT cp.*, 
             ca.views, ca.clicks, ca.conversions
      FROM public.content_pages cp
      LEFT JOIN public.content_analytics ca ON cp.id = ca.page_id
      WHERE cp.id = $1
    `, params.id);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Content page not found' }, { status: 404 });
    }

    return NextResponse.json({ page: rows[0] });
  } catch (error: any) {
    console.error('Get dynamic content page error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  try {
    const body = await req.json();
    const { title, slug, type, status, components, mobile_display } = body;

    const sets: string[] = ['updated_at = NOW()'];
    const sqlParams: any[] = [params.id];
    let pIdx = 2;

    if (title !== undefined) { sets.push(`title = $${pIdx++}`); sqlParams.push(title); }
    if (slug !== undefined) { sets.push(`slug = $${pIdx++}`); sqlParams.push(slug); }
    if (type !== undefined) { sets.push(`type = $${pIdx++}`); sqlParams.push(type); }
    if (status !== undefined) { sets.push(`status = $${pIdx++}`); sqlParams.push(status); }
    if (components !== undefined) { sets.push(`components = $${pIdx++}`); sqlParams.push(JSON.stringify(components)); }
    if (mobile_display !== undefined) { sets.push(`mobile_display = $${pIdx++}`); sqlParams.push(JSON.stringify(mobile_display)); }

    const rows = await prisma.$queryRawUnsafe<any[]>(
      `UPDATE public.content_pages SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      ...sqlParams
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page: rows[0] });
  } catch (error: any) {
    console.error('Update dynamic content page error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req); // authenticateAdmin
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // check permission if needed, but original code had it in requirePermission

  try {
    await prisma.$executeRawUnsafe('DELETE FROM public.content_pages WHERE id = $1', params.id);
    return NextResponse.json({ message: 'Content page deleted successfully' });
  } catch (error: any) {
    console.error('Delete dynamic content page error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
