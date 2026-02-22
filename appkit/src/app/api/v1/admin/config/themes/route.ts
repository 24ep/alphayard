import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const themes = await prisma.appSetting.findMany({
      where: { key: { startsWith: 'theme_' } }
    });
    return NextResponse.json({ themes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
