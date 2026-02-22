import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const flags = await prisma.appSetting.findFirst({
      where: { key: 'feature_flags' }
    });
    return NextResponse.json({ flags: flags?.value || {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
