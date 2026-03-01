import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function mapActivityType(resourceType: string | null): 'config' | 'user' | 'webhook' | 'security' {
  const value = (resourceType || '').toLowerCase()
  if (value.includes('user')) return 'user'
  if (value.includes('webhook')) return 'webhook'
  if (value.includes('security') || value.includes('mfa') || value.includes('auth')) return 'security'
  return 'config'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid application ID format' },
        { status: 400 }
      )
    }

    const appExists = await prisma.application.findUnique({
      where: { id },
      select: { id: true }
    })
    if (!appExists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const logs = await prisma.adminActivityLog.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        adminUser: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    const entries = logs.map((log) => ({
      id: log.id,
      action: log.action,
      user: log.adminUser?.email || log.adminUser?.name || 'system',
      timestamp: log.createdAt.toISOString(),
      type: mapActivityType(log.resourceType)
    }))

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
