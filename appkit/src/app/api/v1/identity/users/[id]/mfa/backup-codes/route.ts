import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:manage')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const userId = params.id;
    
    // Generate 10 new backup codes
    const codes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
    
    await prisma.userMFA.updateMany({
        where: { userId, mfaType: 'totp' }, // Usually backup codes are linked to TOTP
        data: {
            backupCodes: codes,
            backupCodesGeneratedAt: new Date(),
            backupCodesUsed: 0
        }
    });

    return NextResponse.json({ codes });
  } catch (error: any) {
    console.error('Generate backup codes error:', error);
    return NextResponse.json({ error: 'Failed to generate backup codes' }, { status: 500 });
  }
}
