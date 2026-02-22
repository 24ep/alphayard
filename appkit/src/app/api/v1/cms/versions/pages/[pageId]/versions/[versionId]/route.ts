import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { pageId: string, versionId: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const version = await prisma.pageVersion.findFirst({
      where: { 
        pageId: params.pageId,
        id: params.versionId 
      },
      include: {
        page: { select: { id: true, title: true } }
      }
    });
    
    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json({ version });
  } catch (error: any) {
    console.error('Get page version error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { pageId: string, versionId: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  try {
    const count = await prisma.pageVersion.count({
      where: { pageId: params.pageId }
    });

    if (count <= 1) {
      return NextResponse.json({ error: 'Cannot delete the only version' }, { status: 400 });
    }

    await prisma.pageVersion.delete({
      where: { 
        id: params.versionId 
      }
    });

    return NextResponse.json({ message: 'Version deleted successfully' });
  } catch (error: any) {
    console.error('Delete page version error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
