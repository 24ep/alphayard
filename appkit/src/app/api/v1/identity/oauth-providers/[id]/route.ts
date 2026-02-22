import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!hasPermission(auth.admin, 'system:read')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const provider = await prisma.oAuthProvider.findUnique({
      where: { id: params.id },
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json({
      provider: {
        ...provider,
        clientSecret: provider.clientSecret ? '••••••••' : null,
      },
    });
  } catch (error: any) {
    console.error('Get OAuth provider error:', error);
    return NextResponse.json({ error: 'Failed to get OAuth provider' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'system:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const data = await req.json();
    
    // Don't update secret if empty string/placeholder provided
    const updateData: any = { ...data };
    if (data.clientSecret === '••••••••' || !data.clientSecret) {
      delete updateData.clientSecret;
    }

    const provider = await prisma.oAuthProvider.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      provider: {
        ...provider,
        clientSecret: '••••••••',
      },
    });
  } catch (error: any) {
    console.error('Update OAuth provider error:', error);
    return NextResponse.json({ error: 'Failed to update OAuth provider' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (!hasPermission(auth.admin!, 'system:manage')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    try {
      await prisma.oAuthProvider.delete({
        where: { id: params.id }
      });
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Delete OAuth provider error:', error);
      return NextResponse.json({ error: 'Failed to delete OAuth provider' }, { status: 500 });
    }
  }
