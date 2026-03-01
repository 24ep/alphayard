import { NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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

function normalizeIdentityConfig(input: unknown, fallback?: any) {
  const source = input && typeof input === 'object' ? (input as any) : (fallback || {})
  const scopes = source.scopes && typeof source.scopes === 'object' ? source.scopes : {}
  const model = typeof source.model === 'string' && source.model.trim() ? source.model.trim() : 'Email-based'
  return {
    model,
    scopes: {
      openid: scopes.openid !== false,
      profile: scopes.profile !== false,
      email: scopes.email !== false,
      phone: scopes.phone === true,
      address: scopes.address === true
    }
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 })
    }

    const app = await prisma.application.findUnique({
      where: { id },
      select: { id: true, settings: true }
    })
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const payload = await request.json().catch(() => ({}))
    const currentSettings = parseSettings(app.settings)
    const identityConfig = normalizeIdentityConfig(payload, currentSettings.identityConfig)

    await prisma.application.update({
      where: { id },
      data: {
        settings: {
          ...currentSettings,
          identityConfig
        }
      }
    })

    return NextResponse.json({ identityConfig })
  } catch (error) {
    console.error('Error saving application identity config:', error)
    return NextResponse.json({ error: 'Failed to save identity settings' }, { status: 500 })
  }
}

