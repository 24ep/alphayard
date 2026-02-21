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

    // Forward to the backend CMS API for persistence
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/admin/cms/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}),
        ...(req.headers.cookie ? { 'Cookie': req.headers.cookie } : {}),
      },
      body: JSON.stringify({
        ...content,
        status: 'draft',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        success: false,
        message: errorData.error || 'Failed to save content',
      })
    }

    const savedContent = await response.json()

    res.status(200).json({
      success: true,
      message: 'Content saved successfully',
      data: savedContent.content || savedContent
    })

  } catch (error) {
    console.error('Save error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
