import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // SSO providers list is public — needed by the login page to show SSO buttons
    // Fetch OAuth providers from the database (CORE schema table)
    const providers = await prisma.oAuthProvider.findMany({
      where: { isEnabled: true },
      orderBy: { displayOrder: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: { providers: providers || [] },
      message: 'SSO providers retrieved successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Local SSO providers fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch SSO providers' }, { status: 500 })
  }
}
