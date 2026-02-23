import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { screenKey: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { screenKey } = params;
    const { appId, config } = body;

    if (!appId || !config) {
      return NextResponse.json({ error: 'appId and config are required' }, { status: 400 });
    }

    const setting = await prisma.appSetting.upsert({
      where: { applicationId_key: { applicationId: appId, key: `screen_${screenKey}` } },
      update: { value: config },
      create: { applicationId: appId, key: `screen_${screenKey}`, value: config }
    });

    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
