import { NextRequest, NextResponse } from 'next/server';
import { authenticate, hasPermission } from '@/lib/auth';
import { prisma } from '@/server/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:view')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase();

    const offset = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      // In the current schema, roles are often stored in preferences json
      where.preferences = {
        path: ['role'],
        equals: role
      };
    }

    if (status) {
       where.isActive = status === 'active';
    }

    const [usersRes, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          phoneNumber: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          preferences: true,
        },
        orderBy: { [sortBy]: sortOrder },
        take: pageSize,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    const users = usersRes.map((user: any) => ({
      ...user,
      displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      status: user.isActive ? 'active' : 'inactive',
      metadata: user.preferences,
      circles: [], // To be implemented if needed
      apps: [] // To be implemented if needed
    }));

    return NextResponse.json({
      users,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error('List users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error || !auth.admin) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  if (!hasPermission(auth.admin, 'users:create')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { 
      email, password, firstName, lastName, phone, role, status, 
      emailVerified, sendWelcomeEmail 
    } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phoneNumber: phone,
        preferences: { role: role || 'user', status: status || 'active' },
        isActive: status !== 'inactive',
        isVerified: emailVerified || false
      }
    });

    // Note: identityService.logIdentityAction would be called here. 
    // Since we are migrating, we might need a Next.js version of identityService or just inline the log.
    // For now, mirroring the Express route logic.

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        isActive: newUser.isActive,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
