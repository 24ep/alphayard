import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const rows = await prisma.language.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { code: 'asc' }
      ]
    });

    return NextResponse.json({ languages: rows });
  } catch (error: any) {
    console.error('List languages error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load languages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { code, name, native_name, direction = 'ltr', is_active = true, is_default = false, flag_emoji } = await req.json();

    if (!code || !name) return NextResponse.json({ error: 'code and name are required' }, { status: 400 });

    if (is_default) {
      await prisma.language.updateMany({
        where: { code: { not: code } },
        data: { isDefault: false }
      });
    }

    const language = await prisma.language.upsert({
      where: { code },
      update: {
        name,
        nativeName: native_name || name,
        direction,
        isActive: is_active,
        isDefault: is_default,
        flagEmoji: flag_emoji
      },
      create: {
        code,
        name,
        nativeName: native_name || name,
        direction,
        isActive: is_active,
        isDefault: is_default,
        flagEmoji: flag_emoji
      }
    });

    return NextResponse.json({ language }, { status: 201 });
  } catch (error: any) {
    console.error('Create/Update language error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create language' }, { status: 500 });
  }
}
