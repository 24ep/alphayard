import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '@/server/config/env';
import { auditService, AuditAction } from '@/server/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as any;
        const adminId = decoded.adminId;

        if (adminId) {
          // Audit logout
          await auditService.logAuthEvent(
            adminId,
            AuditAction.LOGOUT,
            'AdminUser',
            {},
            req.headers.get('x-forwarded-for') || '127.0.0.1',
            req.headers.get('user-agent') || 'Unknown'
          );
        }
      } catch (err) {
        // Token might be expired, still return success for logout
      }
    }

    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
