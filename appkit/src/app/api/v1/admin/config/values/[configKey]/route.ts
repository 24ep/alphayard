import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { configKey: string } }) {
  try {
    const setting = await prisma.appSetting.findFirst({
      where: { key: params.configKey }
    });
    return NextResponse.json({ value: setting?.value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { configKey: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { appId, value } = await req.json();
    const setting = await prisma.appSetting.upsert({
      where: { applicationId_key: { applicationId: appId, key: params.configKey } },
      update: { value },
      create: { applicationId: appId, key: params.configKey, value }
    });
    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
