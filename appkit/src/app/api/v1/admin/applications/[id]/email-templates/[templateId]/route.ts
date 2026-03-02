import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; templateId: string } }
) {
  try {
    const appId = params.id
    const templateId = params.templateId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(templateId)) {
      return NextResponse.json({ error: 'Invalid application or template ID format' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const next = {
      ...(typeof body.name === 'string' ? { name: body.name.trim() } : {}),
      ...(typeof body.slug === 'string' ? { slug: body.slug.trim() } : {}),
      ...(typeof body.subject === 'string' ? { subject: body.subject.trim() } : {}),
      ...(typeof body.htmlContent === 'string' ? { htmlContent: body.htmlContent } : {}),
      ...(typeof body.textContent === 'string' ? { textContent: body.textContent } : {}),
      ...(Array.isArray(body.variables) ? { variables: body.variables } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    }

    const existing = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, applicationId: true },
    })
    if (!existing || existing.applicationId !== appId) {
      return NextResponse.json({ error: 'Template not found for this application' }, { status: 404 })
    }

    const template = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: next,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to update email template:', error)
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; templateId: string } }
) {
  try {
    const appId = params.id
    const templateId = params.templateId
    if (!UUID_REGEX.test(appId) || !UUID_REGEX.test(templateId)) {
      return NextResponse.json({ error: 'Invalid application or template ID format' }, { status: 400 })
    }

    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, applicationId: true },
    })
    if (!template || template.applicationId !== appId) {
      return NextResponse.json({ error: 'Template not found for this application' }, { status: 404 })
    }

    await prisma.emailTemplate.delete({ where: { id: templateId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete email template:', error)
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 })
  }
}
