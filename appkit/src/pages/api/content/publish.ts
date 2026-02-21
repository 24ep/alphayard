import { NextApiRequest, NextApiResponse } from 'next'
import { ContentPage } from '../../../services/productionCmsService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const content: ContentPage = req.body

    // Validate required fields
    if (!content.title || !content.slug) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and slug are required' 
      })
    }

    // Forward to the backend CMS API for persistence and publishing
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    // First save/update content
    const saveResponse = await fetch(`${backendUrl}/api/admin/cms/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}),
        ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}),
      },
      body: JSON.stringify({
        ...content,
        status: 'published',
        publishedAt: new Date().toISOString(),
      }),
    })

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json().catch(() => ({}))
      return res.status(saveResponse.status).json({
        success: false,
        message: errorData.error || 'Failed to publish content',
      })
    }

    const savedContent = await saveResponse.json()

    // Generate published URL
    const publishedUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/content/${content.slug}`

    res.status(200).json({
      success: true,
      message: 'Content published successfully',
      data: savedContent.content || savedContent,
      publishedUrl
    })

  } catch (error) {
    console.error('Publish error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
