import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from '../middleware/auth';
import { getSupabaseClient } from '../services/supabaseService';
import { storageService } from '../services/storageService';
import { exec } from 'child_process';

const router = Router();

type BrandingSettings = {
  adminAppName?: string;
  mobileAppName?: string;
  logoUrl?: string;
  iconUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
};

const SETTINGS_TABLE = 'app_settings';
const BRANDING_KEY = 'branding';
const INTEGRATIONS_KEY = 'integrations';

function getLocalSettingsPath(): string {
  const base = path.join(process.cwd(), 'uploads', 'settings');
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
  return path.join(base, 'branding.json');
}

async function readFromSupabaseBranding(): Promise<BrandingSettings | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .eq('key', BRANDING_KEY)
      .single();
    if (error || !data) return null;
    return (data.value as BrandingSettings) || null;
  } catch {
    return null;
  }
}

async function writeToSupabaseBranding(value: BrandingSettings): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    // Upsert by key
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({ key: BRANDING_KEY, value }, { onConflict: 'key' });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

function readFromFile(): BrandingSettings | null {
  try {
    const p = getLocalSettingsPath();
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeToFile(value: BrandingSettings): boolean {
  try {
    const p = getLocalSettingsPath();
    fs.writeFileSync(p, JSON.stringify(value, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

router.get('/branding', async (req, res) => {
  // Try Supabase first, fall back to file
  const fromDb = await readFromSupabaseBranding();
  if (fromDb) return res.json({ branding: fromDb });
  const fromFile = readFromFile();
  return res.json({ branding: fromFile || {} });
});

router.put('/branding', authenticateToken as any, async (req: any, res) => {
  const body = req.body as Partial<BrandingSettings>;
  const existing = (await readFromSupabaseBranding()) || readFromFile() || {};
  const updated: BrandingSettings = {
    ...existing,
    ...body,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user?.id || 'system'
  };

  // Try to persist to Supabase; fall back to file system
  const dbOk = await writeToSupabaseBranding(updated);
  const fsOk = dbOk ? true : writeToFile(updated);

  if (!dbOk && !fsOk) {
    return res.status(500).json({ error: 'FAILED_TO_SAVE' });
  }
  return res.json({ branding: updated });
});

// Integrations settings
type IntegrationsSettings = Record<string, any>;

async function readIntegrations(): Promise<IntegrationsSettings | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .eq('key', INTEGRATIONS_KEY)
      .single();
    if (error || !data) return null;
    return (data.value as IntegrationsSettings) || null;
  } catch {
    return null;
  }
}

async function writeIntegrations(value: IntegrationsSettings): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert({ key: INTEGRATIONS_KEY, value }, { onConflict: 'key' });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

function isAdmin(req: any): boolean {
  try {
    // const authHeader = req.headers['authorization'] as string | undefined // Not used
    const role = (req as any).userRole || (req as any).user?.role || undefined
    // Prefer explicit role attached upstream; fallback to JWT claim parsed by gateway if present
    // In our system, we will treat lack of role as non-admin
    return role === 'admin'
  } catch { return false }
}

router.get('/integrations', authenticateToken as any, async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN' })
  const existing = await readIntegrations();
  return res.json({ integrations: existing || {} });
});

router.put('/integrations', authenticateToken as any, async (req: any, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN' })
  const body = (req.body || {}) as IntegrationsSettings;
  const merged = { ...(await readIntegrations()), ...body, updatedAt: new Date().toISOString(), updatedBy: req.user?.id || 'system' };
  const ok = await writeIntegrations(merged);
  if (!ok) return res.status(500).json({ error: 'FAILED_TO_SAVE' });
  return res.json({ integrations: merged });
});

export default router;

// Upload branding logo
router.post(
  '/branding/logo',
  authenticateToken as any,
  storageService.getMulterConfig({
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    generateThumbnails: false,
    compressImages: true
  }).single('file'),
  async (req: any, res) => {
    try {
      const file = (req as any).file as Express.Multer.File
      if (!file) return res.status(400).json({ error: 'NO_FILE' })
      const uploaded = await storageService.uploadFile(file, req.user?.id || 'system')
      return res.json({ url: uploaded.url })
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'UPLOAD_FAILED' })
    }
  }
)

// Trigger mobile branding asset generation (executes mobile script server-side)
router.post('/branding/generate-mobile-assets', authenticateToken as any, async (req: any, res) => {
  try {
    const repoRoot = path.resolve(__dirname, '../../..')
    const mobileDir = path.join(repoRoot, 'mobile')
    const cmd = process.platform === 'win32'
      ? `cd /d "${mobileDir}" && node ./scripts/branding-assets.js`
      : `cd "${mobileDir}" && node ./scripts/branding-assets.js`

    exec(cmd, { env: { ...process.env } }, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: 'EXEC_FAILED', details: stderr?.toString() || error.message })
      }
      return res.json({ ok: true, output: stdout?.toString() })
    })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'UNKNOWN_ERROR' })
  }
})

// Upload branding icon
router.post(
  '/branding/icon',
  authenticateToken as any,
  storageService.getMulterConfig({
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    generateThumbnails: false,
    compressImages: true
  }).single('file'),
  async (req: any, res) => {
    try {
      const file = (req as any).file as Express.Multer.File
      if (!file) return res.status(400).json({ error: 'NO_FILE' })
      const uploaded = await storageService.uploadFile(file, req.user?.id || 'system')
      return res.json({ url: uploaded.url })
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'UPLOAD_FAILED' })
    }
  }
)


