import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

type SystemSection = 'general' | 'security' | 'api-keys' | 'webhooks' | 'legal'

const SECTION_KEYS: Record<SystemSection, string> = {
  general: 'system.general',
  security: 'system.security',
  'api-keys': 'system.api-keys',
  webhooks: 'system.webhooks',
  legal: 'system.legal',
}

const DEFAULT_CONFIG: Record<SystemSection, any> = {
  general: {
    platformName: 'AppKit',
    supportEmail: 'support@appkit.io',
    timezone: 'UTC',
    language: 'English',
  },
  security: {
    enforceMfa: true,
    ipWhitelistEnabled: false,
    auditLogging: true,
    sessionTimeoutMins: 30,
    corsProtection: true,
  },
  'api-keys': {
    keys: [],
  },
  webhooks: {
    endpoints: [],
  },
  legal: {
    documents: [
      {
        id: 'terms',
        title: 'Terms of Service',
        type: 'terms-of-service',
        version: 'v1.0',
        status: 'Published',
        lastUpdated: new Date().toISOString().split('T')[0],
        content: '',
      },
      {
        id: 'privacy',
        title: 'Privacy Policy',
        type: 'privacy-policy',
        version: 'v1.0',
        status: 'Published',
        lastUpdated: new Date().toISOString().split('T')[0],
        content: '',
      },
    ],
    compliance: {
      gdprMode: true,
      cookieConsent: true,
      dataRetention: false,
      rightToErasure: true,
      dataExport: true,
      ageVerification: false,
    },
    retention: {
      userData: 365,
      auditLog: 90,
      sessionData: 30,
    },
  },
}

function normalizeSection(value: string): SystemSection | null {
  if (value in SECTION_KEYS) {
    return value as SystemSection
  }
  return null
}

async function readSectionConfig(section: SystemSection) {
  const key = SECTION_KEYS[section]
  const row = await prisma.systemConfig.findUnique({ where: { key } })
  return row?.value ?? DEFAULT_CONFIG[section]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    if (!hasPermission(auth.admin, 'settings:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const section = normalizeSection(params.section)
    if (!section) {
      return NextResponse.json({ error: 'Invalid system settings section' }, { status: 400 })
    }

    const config = await readSectionConfig(section)
    return NextResponse.json({ section, config })
  } catch (error) {
    console.error('GET system config error:', error)
    return NextResponse.json({ error: 'Failed to fetch system settings' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    if (!hasPermission(auth.admin, 'settings:edit')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const section = normalizeSection(params.section)
    if (!section) {
      return NextResponse.json({ error: 'Invalid system settings section' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const config = body?.config
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Config object is required' }, { status: 400 })
    }

    const key = SECTION_KEYS[section]
    await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value: config,
        description: `System settings: ${section}`,
      },
      create: {
        key,
        value: config,
        description: `System settings: ${section}`,
        isPublic: false,
      },
    })

    return NextResponse.json({ message: 'Settings saved', section, config })
  } catch (error) {
    console.error('PUT system config error:', error)
    return NextResponse.json({ error: 'Failed to save system settings' }, { status: 500 })
  }
}
