import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = params.id
    if (!UUID_REGEX.test(appId)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 })
    }

    const templates = await prisma.emailTemplate.findMany({
      where: { applicationId: appId },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Failed to fetch email templates:', error)
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appId = params.id
    if (!UUID_REGEX.test(appId)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const htmlContent = typeof body.htmlContent === 'string' ? body.htmlContent : ''
    const textContent = typeof body.textContent === 'string' ? body.textContent : ''
    const variables = Array.isArray(body.variables) ? body.variables : []

    if (!name || !slug || !subject) {
      return NextResponse.json({ error: 'name, slug, and subject are required' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.create({
      data: {
        applicationId: appId,
        name,
        slug,
        subject,
        htmlContent,
        textContent,
        variables,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create email template:', error)
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 })
  }
}
