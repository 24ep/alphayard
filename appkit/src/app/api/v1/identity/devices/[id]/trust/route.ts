import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const deviceId = params.id;
    const { trusted } = await req.json();

    const device = await prisma.userDevice.findUnique({
      where: { id: deviceId }
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    await prisma.userDevice.update({
      where: { id: deviceId },
      data: { isTrusted: trusted }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update device trust error:', error);
    return NextResponse.json({ error: 'Failed to update device trust' }, { status: 500 });
  }
}
