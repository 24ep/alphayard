import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }

    if (!hasPermission(auth.admin, 'settings:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const enabled = searchParams.get('enabled')
    
    // Build where conditions for Prisma
    const whereConditions: any = {}
    
    if (enabled !== undefined) {
      whereConditions.isEnabled = enabled === 'true'
    }
    
    const result = await prisma.oAuthProvider.findMany({
      where: whereConditions,
      orderBy: [
        { displayOrder: 'asc' },
        { providerName: 'asc' }
      ]
    })
    
    return NextResponse.json({
      success: true,
      providers: result.map((row: any) => ({
        id: row.id,
        name: row.providerName,
        displayName: row.displayName,
        providerType: row.providerName, // Mapping provider_name to providerType
        enabled: row.isEnabled,
        clientId: row.clientId,
        clientSecret: row.clientSecret ? '********' : null,
        authorizationUrl: row.authorizationUrl,
        tokenUrl: row.tokenUrl,
        userinfoUrl: row.userinfoUrl,
        jwksUrl: row.jwksUrl,
        scopes: row.scopes,
        redirectUri: row.redirectUri,
        additionalConfig: row.additionalConfig,
        displayOrder: row.displayOrder,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }))
    })
    
  } catch (error: any) {
    console.error('SSO providers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SSO providers' },
      { status: 500 }
    )
  }
}
