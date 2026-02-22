import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  try {
    const assets = await prisma.file.findMany({
      where: { mimeType: { contains: params.type } }
    });
    return NextResponse.json({ assets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
