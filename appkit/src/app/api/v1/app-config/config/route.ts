import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');
    
    if (!appId) {
      return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    }
    
    const app = await prisma.application.findUnique({
      where: { id: appId }
    });
    
    return NextResponse.json({ config: app?.branding || {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
