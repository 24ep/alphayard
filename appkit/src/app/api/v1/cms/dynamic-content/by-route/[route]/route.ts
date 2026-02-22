import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { route: string } }) {
  try {
    const pages = await prisma.$queryRawUnsafe<any[]>(
      'SELECT * FROM public.content_pages WHERE route = $1 ORDER BY updated_at DESC LIMIT 1',
      params.route
    );

    return NextResponse.json({ page: pages?.[0] || null });
  } catch (error: any) {
    console.error('Resolve page by route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
