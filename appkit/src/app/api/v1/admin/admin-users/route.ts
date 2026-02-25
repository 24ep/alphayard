// Admin Users Management - Local implementation for Admin Console Administrators
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { authenticate, hasPermission } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'admin-users:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    
    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    const adminUsers = await prisma.adminUser.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isSuperAdmin: true,
        roleId: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      users: adminUsers,
      total: adminUsers.length
    })

  } catch (error: any) {
    console.error('Failed to get admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'admin-users:manage')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, firstName, lastName, roleId, isSuperAdmin = false } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const existingUser = await prisma.adminUser.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Admin user already exists' }, { status: 409 })
    }

    // Combine names if provided separately
    const fullName = name || `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0]

    const newUser = await prisma.adminUser.create({
      data: {
        email,
        name: fullName,
        roleId,
        isSuperAdmin,
        isActive: true,
        // Password would be set by the user during invitation/setup
        passwordHash: '' 
      }
    })

    return NextResponse.json({ success: true, user: newUser }, { status: 201 })

  } catch (error: any) {
    console.error('Create admin user error:', error)
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 })
  }
}
