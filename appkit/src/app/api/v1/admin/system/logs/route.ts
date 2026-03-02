import { NextRequest, NextResponse } from 'next/server'
import { authenticate, hasPermission } from '@/lib/auth'
import { prisma } from '@/server/lib/prisma'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'
type LogSource = 'server' | 'client' | 'api' | 'auth' | 'database' | 'webhook'

interface SystemLogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  source: LogSource
  context?: Record<string, unknown>
  stack?: string
  userId?: string
  requestId?: string
  duration?: number
}

function levelFromStatus(status: string | null | undefined): LogLevel {
  const value = (status || '').toLowerCase()
  if (value.includes('fail') || value.includes('error')) return 'error'
  if (value.includes('warn')) return 'warn'
  return 'info'
}

function sourceFromAction(action: string | null | undefined): LogSource {
  const value = (action || '').toLowerCase()
  if (value.includes('oauth') || value.includes('auth') || value.includes('login')) return 'auth'
  if (value.includes('webhook')) return 'webhook'
  if (value.includes('db') || value.includes('query')) return 'database'
  if (value.includes('api') || value.includes('http')) return 'api'
  return 'server'
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error || !auth.admin) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 })
    }
    if (!hasPermission(auth.admin, 'system:view')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('q') || '').trim().toLowerCase()
    const levelFilter = ((searchParams.get('level') || 'all').toLowerCase()) as LogLevel | 'all'
    const sourceFilter = ((searchParams.get('source') || 'all').toLowerCase()) as LogSource | 'all'
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 200), 1), 500)

    const [adminActivity, audit, identityAudit, oauthAudit] = await Promise.all([
      prisma.adminActivityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.identityAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.oAuthAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ])

    const logs: SystemLogEntry[] = [
      ...adminActivity.map((row) => ({
        id: `admin-${row.id}`,
        timestamp: row.createdAt.toISOString(),
        level: 'info' as LogLevel,
        source: sourceFromAction(row.action),
        message: row.action,
        userId: row.adminUserId || undefined,
        context: (row.details as Record<string, unknown>) || {},
      })),
      ...audit.map((row) => ({
        id: `audit-${row.id}`,
        timestamp: row.createdAt.toISOString(),
        level: 'info' as LogLevel,
        source: sourceFromAction(row.action),
        message: row.action,
        userId: row.userId || row.actorId || undefined,
        context: (row.details as Record<string, unknown>) || {},
      })),
      ...identityAudit.map((row) => ({
        id: `identity-${row.id}`,
        timestamp: row.createdAt.toISOString(),
        level: row.errorMessage ? 'error' : levelFromStatus(row.status),
        source: 'auth' as LogSource,
        message: row.description || row.action,
        userId: row.actorId || row.targetId || undefined,
        context: {
          action: row.action,
          category: row.actionCategory,
          status: row.status,
          ...(row.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : {}),
        },
        stack: row.errorMessage || undefined,
      })),
      ...oauthAudit.map((row) => ({
        id: `oauth-${row.id}`,
        timestamp: row.createdAt.toISOString(),
        level: (row.success ? 'info' : 'error') as LogLevel,
        source: 'auth' as LogSource,
        message: row.eventType,
        userId: row.userId || undefined,
        context: {
          clientId: row.clientId,
          success: row.success,
          errorCode: row.errorCode,
          errorDescription: row.errorDescription,
          ...(row.details && typeof row.details === 'object' ? (row.details as Record<string, unknown>) : {}),
        },
      })),
    ].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))

    const filtered = logs.filter((entry) => {
      if (levelFilter !== 'all' && entry.level !== levelFilter) return false
      if (sourceFilter !== 'all' && entry.source !== sourceFilter) return false
      if (!search) return true
      const haystack = `${entry.message} ${entry.userId || ''} ${entry.requestId || ''} ${JSON.stringify(entry.context || {})}`.toLowerCase()
      return haystack.includes(search)
    })

    return NextResponse.json({
      logs: filtered.slice(0, limit),
      total: filtered.length,
    })
  } catch (error) {
    console.error('GET system logs error:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
