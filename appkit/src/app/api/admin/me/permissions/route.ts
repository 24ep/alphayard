// Get current user permissions
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { databaseAuthService } from '@/services/databaseAuthService'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Get session from database
    const session = await databaseAuthService.getSessionByToken(token)
    if (!session || !session.isActive) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    // For now, return admin permissions for the admin user
    // In a real app, you'd fetch permissions from the database based on user roles
    const permissions = [
      { module: 'dashboard', action: 'read' },
      { module: 'users', action: 'read' },
      { module: 'users', action: 'write' },
      { module: 'content', action: 'read' },
      { module: 'content', action: 'write' },
      { module: 'settings', action: 'read' },
      { module: 'settings', action: 'write' },
      { module: 'admin', action: 'read' },
      { module: 'admin', action: 'write' }
    ]

    return NextResponse.json({
      permissions: permissions,
      is_super_admin: true
    })

  } catch (error) {
    console.error('Failed to get user permissions:', error)
    return NextResponse.json(
      { error: 'Failed to get permissions' },
      { status: 500 }
    )
  }
}
