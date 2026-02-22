import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { pageId: string, versionId: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { restore_description } = await req.json();

    const versionToRestore = await prisma.pageVersion.findFirst({
      where: { 
        pageId: params.pageId,
        id: params.versionId 
      }
    });

    if (!versionToRestore) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId: params.pageId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    await prisma.page.update({
      where: { id: params.pageId },
      data: { 
        components: versionToRestore.components || [],
        versionNumber: { increment: 1 }
      }
    });

    const restoredVersion = await prisma.pageVersion.create({
      data: {
        pageId: params.pageId,
        versionNumber: nextVersionNumber,
        components: versionToRestore.components || [],
        authorId: auth.admin?.id || (auth as any).user?.id || 'admin',
        commitMessage: restore_description || `Restored from version ${versionToRestore.versionNumber}: ${versionToRestore.commitMessage || 'Unknown'}`
      }
    });

    return NextResponse.json({ 
      version: restoredVersion,
      message: 'Version restored successfully'
    });
  } catch (error: any) {
    console.error('Restore version error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
