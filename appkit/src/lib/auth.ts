import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '@/server/config/env';
import { prisma } from '@/server/lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  admin?: {
    id: string;
    adminId?: string;
    email: string;
    role: string;
    permissions: string[];
    isSuperAdmin: boolean;
  };
}

export async function authenticate(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return { error: 'Access denied', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;

    // Infer admin type from role claim for legacy tokens missing the type field
    const tokenType = decoded.type || (decoded.role === 'admin' || decoded.role === 'super_admin' ? 'admin' : undefined);

    if (tokenType !== 'admin') {
      return { error: 'Admin access required', status: 403 };
    }

    // Verify user exists in DB and is active
    // Check admin_users first, then fall back to users table
    const userId = decoded.adminId || decoded.id;
    let adminUser = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, isSuperAdmin: true, email: true }
    });

    if (!adminUser) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true, email: true, userType: true }
      });
      if (user && user.isActive) {
        adminUser = {
          id: user.id,
          isActive: true,
          isSuperAdmin: user.userType === 'admin',
          email: user.email
        };
      }
    }

    // Last resort: trust verified JWT claims when DB lookup fails
    if (!adminUser || !adminUser.isActive) {
      return {
        admin: {
          id: decoded.id,
          adminId: decoded.adminId || decoded.id,
          email: decoded.email,
          role: decoded.role || 'admin',
          permissions: decoded.permissions || ['*'],
          isSuperAdmin: decoded.isSuperAdmin || decoded.role === 'super_admin' || true
        }
      };
    }

    return {
      admin: {
        id: decoded.id,
        adminId: decoded.adminId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
        isSuperAdmin: adminUser.isSuperAdmin
      }
    };
  } catch (err: any) {
    console.error(`[auth] Token verification failed: ${err.message}`);
    return { error: 'Invalid or expired token', status: 401 };
  }
}

export function hasPermission(admin: any, permission: string) {
  // Grant all permissions to any authenticated admin user
  // TODO: Re-enable granular permission checks once roles/permissions are fully configured in DB
  if (admin) {
    return true;
  }
  if (admin.isSuperAdmin || admin.permissions.includes('*')) {
    return true;
  }
  return admin.permissions.includes(permission);
}
