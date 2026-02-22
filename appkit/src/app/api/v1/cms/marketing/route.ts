import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'marketing:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const typeId = searchParams.get('typeId');
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    const where: any = {};
    if (typeId) where.contentTypeId = typeId;
    if (featuredOnly) where.isFeatured = true;

    const contents = await prisma.marketingContent.findMany({
      where,
      include: { contentType: true },
      orderBy: { priority: 'desc' }
    });

    return NextResponse.json({ contents });
  } catch (error: any) {
    console.error('List marketing content error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'marketing:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const content = await prisma.marketingContent.create({
      data,
      include: { contentType: true }
    });
    return NextResponse.json({ content }, { status: 201 });
  } catch (error: any) {
    console.error('Create marketing content error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
