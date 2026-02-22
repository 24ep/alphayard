import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { timestamp } = await req.json();

    await prisma.$executeRawUnsafe(`
      INSERT INTO public.content_analytics (page_id, views, last_viewed)
      VALUES ($1, 1, $2)
      ON CONFLICT (page_id) 
      DO UPDATE SET 
        views = public.content_analytics.views + 1,
        last_viewed = $2
    `, params.id, timestamp || new Date().toISOString());

    return NextResponse.json({ message: 'View tracked successfully' });
  } catch (error: any) {
    console.error('Track view error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
