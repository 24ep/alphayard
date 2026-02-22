import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { themeKey: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { appId, themeConfig } = await req.json();
    const setting = await prisma.appSetting.upsert({
      where: { applicationId_key: { applicationId: appId, key: `theme_${params.themeKey}` } },
      update: { value: themeConfig },
      create: { applicationId: appId, key: `theme_${params.themeKey}`, value: themeConfig }
    });
    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
