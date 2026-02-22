import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const activeOnly = searchParams.get('active_only') === 'true';

    const whereConditions: any = {};
    if (category) whereConditions.category = category;
    if (activeOnly) whereConditions.isActive = true;
    if (search) whereConditions.key = { contains: search, mode: 'insensitive' };

    const rows = await prisma.translationKey.findMany({
      where: whereConditions
    });
    return NextResponse.json({ keys: rows });
  } catch (error: any) {
    console.error('List localization keys error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load translation keys' }, { status: 500 });
  }
}
