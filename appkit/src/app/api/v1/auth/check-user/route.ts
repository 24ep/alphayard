import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { exists: false, message: 'Email or phone is required' },
        { status: 400 }
      );
    }

    let user = null;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true, isActive: true }
      });
    }

    return NextResponse.json({
      exists: !!user,
      isActive: user?.isActive ?? false,
    });

  } catch (error: any) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { exists: false, message: 'Failed to check user' },
      { status: 500 }
    );
  }
}
