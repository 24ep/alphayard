import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/server/lib/prisma'
import { config } from '@/server/config/env'
import { auditService, AuditAction } from '@/server/services/auditService'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: true,
        adminUserApplications: {
          include: { application: true }
        }
      }
    })

    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create permissions array
    let permissions: string[] = []
    if (adminUser.isSuperAdmin) {
      permissions = ['*']
    } else if (adminUser.role) {
      // Fetch permissions for the role
      const rolePermissions = await prisma.adminRolePermission.findMany({
        where: { roleId: adminUser.roleId! },
        include: { permission: true }
      })
      permissions = rolePermissions.map((rp: any) => `${rp.permission.module}:${rp.permission.action}`)
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: adminUser.id, // admin_users.id
        adminId: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.name.split(' ')[0] || '',
        lastName: adminUser.name.split(' ').slice(1).join(' ') || '',
        role: adminUser.role?.name || 'admin',
        type: 'admin',
        isSuperAdmin: adminUser.isSuperAdmin,
        permissions
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() }
    })

    // Audit login
    await auditService.logAuthEvent(
      adminUser.id,
      AuditAction.LOGIN,
      'AdminUser',
      {},
      request.ip,
      request.headers.get('User-Agent') || undefined
    )

    return NextResponse.json({
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role?.name,
        isSuperAdmin: adminUser.isSuperAdmin,
        avatarUrl: adminUser.avatarUrl
      }
    })

  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
