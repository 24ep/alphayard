import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid application ID format' }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image uploads are supported' }, { status: 400 })
    }

    const extFromName = file.name.includes('.') ? file.name.split('.').pop() : ''
    const extFromMime = file.type.split('/')[1] || ''
    const extension = (extFromName || extFromMime || 'bin').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const fileName = `${Date.now()}_${randomBytes(8).toString('hex')}.${extension}`

    const outputDir = path.join(process.cwd(), 'public', 'uploads', 'applications', id)
    await mkdir(outputDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const outputPath = path.join(outputDir, fileName)
    await writeFile(outputPath, buffer)

    const url = `/uploads/applications/${id}/${fileName}`
    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Error uploading application file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

