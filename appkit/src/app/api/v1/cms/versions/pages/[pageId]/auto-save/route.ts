import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { pageId: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'pages:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentAutoSave = await prisma.pageVersion.findFirst({
      where: {
        pageId: params.pageId,
        commitMessage: 'Auto-save',
        createdAt: { gte: fiveMinutesAgo }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (recentAutoSave) {
      const updatedVersion = await prisma.pageVersion.update({
        where: { id: recentAutoSave.id },
        data: { components: content }
      });
      return NextResponse.json({ version: updatedVersion, message: 'Auto-save updated' });
    }

    const lastVersion = await prisma.pageVersion.findFirst({
      where: { pageId: params.pageId },
      orderBy: { versionNumber: 'desc' }
    });

    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    const autoSaveVersion = await prisma.pageVersion.create({
      data: {
        pageId: params.pageId,
        versionNumber: nextVersionNumber,
        components: content,
        commitMessage: 'Auto-save',
        authorId: auth.admin.id || auth.admin.adminId
      }
    });

    return NextResponse.json({ version: autoSaveVersion, message: 'Auto-save created' });
  } catch (error: any) {
    console.error('Auto-save version error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
