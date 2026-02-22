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
    const { value, isApproved } = await req.json();

    const updateData: any = {};
    if (value !== undefined) updateData.value = value;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    updateData.updatedAt = new Date();

    if (Object.keys(updateData).length <= 1) { // only updatedAt
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const translation = await prisma.translation.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error('Update translation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update translation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'localization:delete')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    await prisma.translation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete translation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete translation' }, { status: 500 });
  }
}
