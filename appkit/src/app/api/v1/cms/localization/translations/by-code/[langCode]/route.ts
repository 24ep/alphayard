import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { langCode: string } }) {
  // Public access with permission check if needed, but original Express route had view perm
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'localization:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const lang = await prisma.language.findFirst({
      where: { code: params.langCode }
    });
    if (!lang) return NextResponse.json({ translations: {} });

    const rows = await prisma.translation.findMany({
      where: { 
        languageId: lang.id,
        isApproved: true
      },
      include: {
        key: { select: { key: true } }
      }
    });

    const map: Record<string, string> = {};
    rows.forEach((row: any) => { map[row.key.key] = row.value; });

    return NextResponse.json({ translations: map });
  } catch (error: any) {
    console.error('Get translations by langCode error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load translations' }, { status: 500 });
  }
}
