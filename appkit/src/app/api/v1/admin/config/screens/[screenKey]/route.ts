import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { screenKey: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');
    if (!appId) return NextResponse.json({ error: 'appId is required' }, { status: 400 });

    const setting = await prisma.appSetting.findFirst({
      where: { applicationId: appId, key: `screen_${params.screenKey}` }
    });
    return NextResponse.json({ config: setting?.value || {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { screenKey: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { appId, config } = await req.json();
    const setting = await prisma.appSetting.upsert({
      where: { applicationId_key: { applicationId: appId, key: `screen_${params.screenKey}` } },
      update: { value: config },
      create: { applicationId: appId, key: `screen_${params.screenKey}`, value: config }
    });
    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
