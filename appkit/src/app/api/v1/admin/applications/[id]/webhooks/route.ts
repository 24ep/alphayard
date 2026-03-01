import { NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'
import { randomBytes } from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const APP_SETTING_KEY = 'webhooks'

type WebhookItem = {
  id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggered: string
}

function normalizeWebhookUrl(input: string): string | null {
  try {
    const parsed = new URL(input.trim())
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    parsed.protocol = parsed.protocol.toLowerCase()
    parsed.hostname = parsed.hostname.toLowerCase()
    if ((parsed.protocol === 'http:' && parsed.port === '80') || (parsed.protocol === 'https:' && parsed.port === '443')) {
      parsed.port = ''
    }
    parsed.hash = ''
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    return parsed.toString()
  } catch {
    return null
  }
}

function normalizeWebhookEvents(input: unknown): string[] {
  const events = Array.isArray(input)
    ? input.filter((evt: unknown): evt is string => typeof evt === 'string' && evt.trim().length > 0).map((evt) => evt.trim())
    : []
  return Array.from(new Set(events))
}

function parseSettingValue(input: unknown): unknown {
  if (typeof input === 'string') {
    try {
      return JSON.parse(input)
    } catch {
      return []
    }
  }
  return input
}

function normalizeWebhookList(input: unknown): WebhookItem[] {
  if (!Array.isArray(input)) return []
  return input
    .map((item: unknown) => {
      const source = item && typeof item === 'object' ? (item as any) : null
      if (!source || typeof source.url !== 'string') return null
      const url = normalizeWebhookUrl(source.url)
      if (!url) return null
      const normalizedEvents = normalizeWebhookEvents(source.events)
      return {
        id: typeof source.id === 'string' && source.id.trim() ? source.id.trim() : randomBytes(8).toString('hex'),
        url,
        events: normalizedEvents.length > 0 ? normalizedEvents : ['user.created'],
        status: source.status === 'inactive' ? 'inactive' : 'active',
        lastTriggered: typeof source.lastTriggered === 'string' ? source.lastTriggered : ''
      } as WebhookItem
    })
    .filter((item: WebhookItem | null): item is WebhookItem => Boolean(item))
}

async function loadWebhooks(applicationId: string): Promise<WebhookItem[]> {
  const setting = await prisma.appSetting.findUnique({
    where: {
      applicationId_key: {
        applicationId,
        key: APP_SETTING_KEY
      }
    },
    select: { value: true }
  })
  return normalizeWebhookList(parseSettingValue(setting?.value))
}

async function saveWebhooks(applicationId: string, webhooks: WebhookItem[]) {
  await prisma.appSetting.upsert({
    where: {
      applicationId_key: {
        applicationId,
        key: APP_SETTING_KEY
      }
    },
    update: {
      value: webhooks as any
    },
    create: {
      applicationId,
      key: APP_SETTING_KEY,
      value: webhooks as any
    }
  })
}

async function ensureApplication(id: string) {
  if (!UUID_REGEX.test(id)) {
    return { error: NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 }) }
  }
  const app = await prisma.application.findUnique({ where: { id }, select: { id: true } })
  if (!app) {
    return { error: NextResponse.json({ error: 'Application not found' }, { status: 404 }) }
  }
  return { app }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ensured = await ensureApplication(params.id)
    if (ensured.error) return ensured.error

    const webhooks = await loadWebhooks(params.id)
    return NextResponse.json({ webhooks })
  } catch (error) {
    console.error('Error fetching webhooks:', error)
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ensured = await ensureApplication(params.id)
    if (ensured.error) return ensured.error

    const body = await request.json().catch(() => ({}))
    const url = typeof body.url === 'string' ? normalizeWebhookUrl(body.url) : null
    const events = normalizeWebhookEvents(body.events)

    if (!url) {
      return NextResponse.json({ error: 'Valid webhook URL is required' }, { status: 400 })
    }

    const current = await loadWebhooks(params.id)
    if (current.some((hook) => normalizeWebhookUrl(hook.url) === url)) {
      return NextResponse.json({ error: 'Webhook URL already exists' }, { status: 409 })
    }

    const next: WebhookItem[] = [
      ...current,
      {
        id: randomBytes(8).toString('hex'),
        url,
        events: events.length > 0 ? events : ['user.created'],
        status: 'active',
        lastTriggered: ''
      }
    ]
    await saveWebhooks(params.id, next)

    return NextResponse.json({ webhooks: next }, { status: 201 })
  } catch (error) {
    console.error('Error creating webhook:', error)
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ensured = await ensureApplication(params.id)
    if (ensured.error) return ensured.error

    const body = await request.json().catch(() => ({}))
    const idFromBody = typeof body.id === 'string' ? body.id.trim() : ''
    const idFromQuery = new URL(request.url).searchParams.get('id') || ''
    const webhookId = (idFromBody || idFromQuery).trim()

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook id is required' }, { status: 400 })
    }

    const current = await loadWebhooks(params.id)
    const next = current.filter((hook) => hook.id !== webhookId)
    if (next.length === current.length) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    await saveWebhooks(params.id, next)
    return NextResponse.json({ webhooks: next })
  } catch (error) {
    console.error('Error deleting webhook:', error)
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ensured = await ensureApplication(params.id)
    if (ensured.error) return ensured.error

    const body = await request.json().catch(() => ({}))
    const webhookId = typeof body.id === 'string' ? body.id.trim() : ''
    const url = typeof body.url === 'string' ? normalizeWebhookUrl(body.url) : null
    const events = normalizeWebhookEvents(body.events)
    const status: 'active' | 'inactive' = body.status === 'inactive' ? 'inactive' : 'active'

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook id is required' }, { status: 400 })
    }
    if (!url) {
      return NextResponse.json({ error: 'Valid webhook URL is required' }, { status: 400 })
    }
    if (events.length === 0) {
      return NextResponse.json({ error: 'At least one event is required' }, { status: 400 })
    }

    const current = await loadWebhooks(params.id)
    const targetIndex = current.findIndex((hook) => hook.id === webhookId)
    if (targetIndex < 0) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    const duplicate = current.some((hook) => hook.id !== webhookId && normalizeWebhookUrl(hook.url) === url)
    if (duplicate) {
      return NextResponse.json({ error: 'Webhook URL already exists' }, { status: 409 })
    }

    const next = [...current]
    next[targetIndex] = {
      ...next[targetIndex],
      url,
      events,
      status
    }

    await saveWebhooks(params.id, next)
    return NextResponse.json({ webhooks: next })
  } catch (error) {
    console.error('Error updating webhook:', error)
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 })
  }
}

