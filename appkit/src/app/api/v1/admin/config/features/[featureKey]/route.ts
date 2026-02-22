import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { featureKey: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { appId, value } = await req.json();
    const existing = await prisma.appSetting.findFirst({
      where: { applicationId: appId, key: 'feature_flags' }
    });
    const flags = (existing?.value as any) || {};
    flags[params.featureKey] = value;
    
    const setting = await prisma.appSetting.upsert({
      where: { applicationId_key: { applicationId: appId, key: 'feature_flags' } },
      update: { value: flags },
      create: { applicationId: appId, key: 'feature_flags', value: flags }
    });
    return NextResponse.json({ setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
