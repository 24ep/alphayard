import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const rows = await prisma.translationKey.findMany({
      where: { isActive: true },
      select: { category: true }
    });

    const unique = Array.from(new Set(rows.map((r: any) => r.category).filter(Boolean))) as string[];
    const categories = unique.map((name: string) => ({ id: name, name, description: '', color: '#6B7280' }));
    
    return NextResponse.json(categories.length > 0 ? categories : [{ id: 'general', name: 'general', description: '', color: '#6B7280' }]);
  } catch (error: any) {
    console.error('List localization categories error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load categories' }, { status: 500 });
  }
}
