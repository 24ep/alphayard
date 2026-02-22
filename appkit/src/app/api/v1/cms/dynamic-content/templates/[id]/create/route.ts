import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'templates:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { title, slug } = await req.json();

    const templates = await prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM public.content_templates WHERE id = $1',
      params.id
    );

    const template = templates[0];
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const pages = await prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO public.content_pages (title, slug, type, status, components, mobile_display, created_by, updated_by, created_at, updated_at)
       VALUES ($1, $2, $3, 'draft', $4, $5, $6, $6, NOW(), NOW())
       RETURNING *`,
      title || template.name,
      slug || `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      template.type,
      JSON.stringify(template.components),
      JSON.stringify(template.mobile_display || {}),
      auth.admin.adminId || auth.admin.id || 'admin'
    );

    return NextResponse.json({ page: pages[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create page from template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
