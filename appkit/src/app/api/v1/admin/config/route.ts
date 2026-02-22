import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

// Get complete app configuration bundle
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');
    if (!appId) return NextResponse.json({ error: 'appId is required' }, { status: 400 });
    
    const app = await prisma.application.findUnique({
      where: { id: appId }
    });
    return NextResponse.json({ config: app?.branding || {} });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Assets placeholder (POST)
export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });

  if (!hasPermission(auth.admin, 'settings:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  return NextResponse.json({ message: 'Asset upserted (placeholder)' });
}
