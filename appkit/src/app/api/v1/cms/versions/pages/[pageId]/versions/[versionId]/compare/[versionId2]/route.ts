import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { pageId: string, versionId: string, versionId2: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'pages:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const versions = await prisma.pageVersion.findMany({
      where: {
        pageId: params.pageId,
        id: { in: [params.versionId, params.versionId2] }
      }
    });

    if (versions.length !== 2) {
      return NextResponse.json({ error: 'One or both versions not found' }, { status: 404 });
    }

    const v1 = versions.find((v: any) => v.id === params.versionId);
    const v2 = versions.find((v: any) => v.id === params.versionId2);

    if (!v1 || !v2) return NextResponse.json({ error: 'Version mismatch' }, { status: 404 });

    const parseComponents = (comp: any) => {
      try {
        return typeof comp === 'string' ? JSON.parse(comp) : comp;
      } catch (e) {
        return comp;
      }
    };

    const c1 = parseComponents(v1.components);
    const c2 = parseComponents(v2.components);
    
    const count1 = Array.isArray(c1) ? c1.length : (Array.isArray(c1?.components) ? c1.components.length : 0);
    const count2 = Array.isArray(c2) ? c2.length : (Array.isArray(c2?.components) ? c2.components.length : 0);

    const diff = {
      version1: { id: v1.id, versionNumber: v1.versionNumber, createdAt: v1.createdAt, component_count: count1 },
      version2: { id: v2.id, versionNumber: v2.versionNumber, createdAt: v2.createdAt, component_count: count2 },
      changes: { component_count_diff: count2 - count1, time_diff: new Date(v2.createdAt).getTime() - new Date(v1.createdAt).getTime() }
    };

    return NextResponse.json({ diff });
  } catch (error: any) {
    console.error('Compare versions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
