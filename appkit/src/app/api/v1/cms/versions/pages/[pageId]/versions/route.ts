import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { pageId: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'pages:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');
    const offset = (page - 1) * pageSize;
    
    const versions = await prisma.pageVersion.findMany({
      where: { pageId: params.pageId },
      include: {
        page: {
          select: { id: true, title: true }
        }
      },
      orderBy: { versionNumber: 'desc' },
      skip: offset,
      take: pageSize
    });

    return NextResponse.json({ versions: versions || [] });
  } catch (error: any) {
    console.error('List page versions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { pageId: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'pages:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { title, content, change_description } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId: params.pageId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    const version = await prisma.pageVersion.create({
      data: {
        pageId: params.pageId,
        versionNumber: nextVersionNumber,
        components: content,
        authorId: auth.admin.id || auth.admin.adminId,
        commitMessage: change_description || null
      }
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error: any) {
    console.error('Create page version error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
