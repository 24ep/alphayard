import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const templates = await prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM public.content_templates WHERE is_active = true ORDER BY name'
    );

    return NextResponse.json({ templates: templates || [] });
  } catch (error: any) {
    console.error('List dynamic content templates error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
