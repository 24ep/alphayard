import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const appId = params.id
    const userId = params.userId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: 'Invalid application ID or user ID format' }, { status: 400 })
    }

    const [loginHistory, auditLogs, sessions] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { applicationId: appId, userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.auditLog.findMany({
        where: { applicationId: appId, OR: [{ userId }, { actorId: userId }] },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.userSession.findMany({
        where: { applicationId: appId, userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ])

    const events = [
      ...loginHistory.map((row) => ({
        id: `login-${row.id}`,
        type: row.success ? 'signin' : 'signin_failed',
        message: row.success ? 'User signed in' : `Sign-in failed${row.failureReason ? `: ${row.failureReason}` : ''}`,
        timestamp: row.createdAt.toISOString(),
        source: 'login_history',
        metadata: {
          ipAddress: row.ipAddress,
          deviceType: row.deviceType,
          method: row.loginMethod,
          provider: row.socialProvider,
          country: row.country,
          city: row.city,
        },
      })),
      ...auditLogs.map((row) => ({
        id: `audit-${row.id}`,
        type: row.action?.toLowerCase().includes('register')
          ? 'register'
          : row.action?.toLowerCase().includes('logout')
            ? 'signout'
            : 'activity',
        message: row.action,
        timestamp: row.createdAt.toISOString(),
        source: 'audit_log',
        metadata: row.details || {},
      })),
      ...sessions
        .filter((row) => row.revokedAt)
        .map((row) => ({
          id: `session-${row.id}`,
          type: 'signout',
          message: `Session ended${row.revokeReason ? `: ${row.revokeReason}` : ''}`,
          timestamp: (row.revokedAt || row.createdAt).toISOString(),
          source: 'user_session',
          metadata: {
            browser: row.browser,
            os: row.os,
            ipAddress: row.ipAddress,
          },
        })),
    ].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch user activity:', error)
    return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 })
  }
}
