import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const content = await prisma.cmsContent.findUnique({
      where: { id: params.id },
      include: { category: true, comments: true }
    });
    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Get CMS content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const content = await prisma.cmsContent.update({
      where: { id: params.id },
      data
    });
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Update CMS content error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:delete')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    await prisma.cmsContent.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error: any) {
    console.error('Delete CMS content error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
