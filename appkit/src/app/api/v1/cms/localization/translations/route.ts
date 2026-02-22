import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // Perm check if needed, but the Express route had it open to authenticated admins.

  try {
    const { searchParams } = new URL(req.url);
    const languageId = searchParams.get('language_id');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '50'), 200);
    const search = searchParams.get('search');
    const offset = (page - 1) * pageSize;

    const whereConditions: any = {};
    if (languageId) whereConditions.languageId = languageId;
    if (category && category !== 'all') whereConditions.key = { category };
    if (search) whereConditions.key = { key: { contains: search, mode: 'insensitive' } };

    const rows = await prisma.translation.findMany({
      where: whereConditions,
      include: {
        key: {
          select: { id: true, key: true, category: true, description: true }
        },
        language: {
          select: { id: true, code: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: pageSize
    });

    const formattedRows = rows.map((t: any) => ({
      ...t,
      translationKeys: t.key,
      languages: t.language
    }));
    
    return NextResponse.json({ translations: formattedRows });
  } catch (error: any) {
    console.error('List translations error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'localization:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { key, value, language, category, description, isActive, isApproved } = await req.json();
    if (!key || !value || !language) {
      return NextResponse.json({ error: 'key, value, and language are required' }, { status: 400 });
    }

    // Upsert key
    const translationKey = await prisma.translationKey.upsert({
      where: { key },
      update: {
        category: category || 'general',
        description: description || null,
        isActive: isActive !== false
      },
      create: {
        key,
        category: category || 'general',
        description: description || null,
        isActive: isActive !== false,
        context: 'mobile_app'
      }
    });

    const langRecord = await prisma.language.findUnique({ where: { code: language } });
    if (!langRecord) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });

    const translation = await prisma.translation.upsert({
      where: {
        keyId_languageId: {
          keyId: translationKey.id,
          languageId: langRecord.id
        }
      },
      update: {
        value,
        isApproved: Boolean(isApproved)
      },
      create: {
        keyId: translationKey.id,
        languageId: langRecord.id,
        value,
        isApproved: Boolean(isApproved)
      }
    });

    return NextResponse.json({ translation }, { status: 201 });
  } catch (error: any) {
    console.error('Create translation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
