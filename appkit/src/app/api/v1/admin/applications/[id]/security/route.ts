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

function normalizeSecurityConfig(input: unknown, fallback?: any) {
  const source = input && typeof input === 'object' ? (input as any) : (fallback || {})
  const mfa = source.mfa && typeof source.mfa === 'object' ? source.mfa : {}
  const password = source.password && typeof source.password === 'object' ? source.password : {}
  const session = source.session && typeof source.session === 'object' ? source.session : {}
  return {
    mfa: {
      totp: mfa.totp !== false,
      sms: mfa.sms === true,
      email: mfa.email !== false,
      fido2: mfa.fido2 === true
    },
    password: {
      minLength: Number.isFinite(password.minLength) ? Number(password.minLength) : 8,
      maxAttempts: Number.isFinite(password.maxAttempts) ? Number(password.maxAttempts) : 5,
      expiryDays: Number.isFinite(password.expiryDays) ? Number(password.expiryDays) : 90,
      lockoutMinutes: Number.isFinite(password.lockoutMinutes) ? Number(password.lockoutMinutes) : 30,
      requireUppercase: password.requireUppercase !== false,
      requireLowercase: password.requireLowercase !== false,
      requireNumber: password.requireNumber !== false,
      requireSpecial: password.requireSpecial === true
    },
    session: {
      timeoutMinutes: Number.isFinite(session.timeoutMinutes) ? Number(session.timeoutMinutes) : 60,
      maxConcurrent: Number.isFinite(session.maxConcurrent) ? Number(session.maxConcurrent) : 3
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
    const securityConfig = normalizeSecurityConfig(payload, currentSettings.securityConfig)

    await prisma.application.update({
      where: { id },
      data: {
        settings: {
          ...currentSettings,
          securityConfig
        }
      }
    })

    return NextResponse.json({ securityConfig })
  } catch (error) {
    console.error('Error saving application security config:', error)
    return NextResponse.json({ error: 'Failed to save security settings' }, { status: 500 })
  }
}

