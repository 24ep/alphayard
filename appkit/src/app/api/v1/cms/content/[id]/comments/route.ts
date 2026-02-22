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
    const comments = await prisma.cmsComment.findMany({
      where: { contentId: params.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('List CMS comments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = { ...body, contentId: params.id };
    const comment = await prisma.cmsComment.create({ data });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error('Create CMS comment error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
