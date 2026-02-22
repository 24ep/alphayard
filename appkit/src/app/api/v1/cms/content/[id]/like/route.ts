import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const content = await prisma.cmsContent.update({
      where: { id: params.id },
      data: { likeCount: { increment: 1 } }
    });
    return NextResponse.json({ likeCount: content.likeCount });
  } catch (error: any) {
    console.error('Like CMS content error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
