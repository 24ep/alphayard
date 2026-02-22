import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'localization:edit')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { name, native_name, direction, is_active, is_default, flag_emoji } = await req.json();

    if (is_default === true) {
      await prisma.language.updateMany({
        where: { id: { not: params.id } },
        data: { isDefault: false }
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (native_name !== undefined) updateData.nativeName = native_name;
    if (direction !== undefined) updateData.direction = direction;
    if (is_active !== undefined) updateData.isActive = is_active;
    if (is_default !== undefined) updateData.isDefault = is_default;
    if (flag_emoji !== undefined) updateData.flagEmoji = flag_emoji;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const language = await prisma.language.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ language });
  } catch (error: any) {
    console.error('Update language error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update language' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // check permission if needed...

  try {
    await prisma.language.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete language error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete language' }, { status: 500 });
  }
}
