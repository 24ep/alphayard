import { Router } from 'express'
import { getSupabaseClient } from '../services/supabaseService'
import path from 'path'
import fs from 'fs'

const router = Router()

// Naive scanner: read mobile navigator and extract screen names
router.get('/routes', async (req, res) => {
  try {
    const repoRoot = path.resolve(__dirname, '../../..')
    const navigatorPath = path.join(repoRoot, 'mobile', 'src', 'navigation', 'MainTabNavigator.tsx')
    const content = fs.readFileSync(navigatorPath, 'utf8')

    const routeNames = new Set<string>()
    const screenRegex = /name\s*=\s*"([A-Za-z0-9_\-]+)"/g
    let match
    while ((match = screenRegex.exec(content)) !== null) {
      routeNames.add(match[1])
    }

    res.json({ routes: Array.from(routeNames).sort() })
  } catch (error: any) {
    res.status(500).json({ error: 'FAILED_TO_SCAN', message: error?.message || 'Unknown error' })
  }
})

export default router
// Branding for mobile
router.get('/branding', async (req, res) => {
  try {
    // Try supabase table first (shared with admin settings route if created)
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .eq('key', 'branding')
      .single();

    if (!error && data?.value) {
      const branding = data.value || {}
      // For mobile, we mainly need names and icons
      return res.json({
        branding: {
          mobileAppName: branding.mobileAppName,
          iconUrl: branding.iconUrl,
          logoUrl: branding.logoUrl
        }
      })
    }
  } catch {}

  // Fallback to local file used by settings route
  try {
    const p = path.join(process.cwd(), 'uploads', 'settings', 'branding.json')
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8')
      const branding = JSON.parse(raw)
      return res.json({
        branding: {
          mobileAppName: branding.mobileAppName,
          iconUrl: branding.iconUrl,
          logoUrl: branding.logoUrl
        }
      })
    }
  } catch {}

  return res.json({ branding: {} })
})


