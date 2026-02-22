import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const categories = await prisma.cmsCategory.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('List CMS categories error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'content:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const category = await prisma.cmsCategory.create({ data });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Create CMS category error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
