import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ALLOWED_BILLING_MODES = new Set(['perCircleLevel', 'perAccount'])

function parseSettings(input: unknown): Record<string, any> {
  if (typeof input === 'string') {
    try {
      return JSON.parse(input || '{}')
    } catch {
      return {}
    }
  }
  return input && typeof input === 'object' ? { ...(input as Record<string, any>) } : {}
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = params.id
    if (!UUID_REGEX.test(appId)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const billingMode = typeof body.billingMode === 'string' ? body.billingMode.trim() : ''
    if (!ALLOWED_BILLING_MODES.has(billingMode)) {
      return NextResponse.json({ error: 'Invalid billing mode' }, { status: 400 })
    }

    const app = await prisma.application.findUnique({
      where: { id: appId },
      select: { id: true, settings: true },
    })
    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    const settings = parseSettings(app.settings)
    const nextSettings = {
      ...settings,
      circleBillingMode: billingMode,
    }

    await prisma.application.update({
      where: { id: appId },
      data: { settings: nextSettings },
    })

    return NextResponse.json({ billingMode })
  } catch (error) {
    console.error('Failed to update billing mode:', error)
    return NextResponse.json({ error: 'Failed to update billing mode' }, { status: 500 })
  }
}
