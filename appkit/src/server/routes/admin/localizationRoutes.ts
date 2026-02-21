import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';


const router = Router();

// Apply admin auth to all routes
router.use(authenticateAdmin as any);

// GET /cms/localization/languages
router.get('/languages', requirePermission('localization', 'view'), async (_req, res) => {
  try {
    const rows = await prisma.language.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { code: 'asc' }
      ]
    });

    return res.json({ languages: rows });
  } catch (e: any) {
    console.error('Error loading languages:', e);
    return res.status(500).json({ error: e.message || 'Failed to load languages' });
  }
});

// POST /cms/localization/languages
router.post('/languages', async (req, res) => {
  try {
    const { code, name, native_name, direction = 'ltr', is_active = true, is_default = false, flag_emoji } = req.body || {};

    if (!code || !name) return res.status(400).json({ error: 'code and name are required' });

    // Ensure only one default language
    if (is_default) {
      await prisma.language.updateMany({
        where: { code: { not: code } },
        data: { isDefault: false }
      });
    }

    const language = await prisma.language.upsert({
      where: { code },
      update: {
        name,
        nativeName: native_name || name,
        direction,
        isActive: is_active,
        isDefault: is_default,
        flagEmoji: flag_emoji
      },
      create: {
        code,
        name,
        nativeName: native_name || name,
        direction,
        isActive: is_active,
        isDefault: is_default,
        flagEmoji: flag_emoji
      }
    });

    return res.status(201).json({ language });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create language' });
  }
});

// PUT /cms/localization/languages/:id
router.put('/languages/:id', requirePermission('localization', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, native_name, direction, is_active, is_default, flag_emoji } = req.body || {};

    if (is_default === true) {
      await prisma.language.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false }
      });
    }

    const updateData: any = {};

    if (name !== undefined) { updateData.name = name; }
    if (native_name !== undefined) { updateData.nativeName = native_name; }
    if (direction !== undefined) { updateData.direction = direction; }
    if (is_active !== undefined) { updateData.isActive = is_active; }
    if (is_default !== undefined) { updateData.isDefault = is_default; }
    if (flag_emoji !== undefined) { updateData.flagEmoji = flag_emoji; }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const language = await prisma.language.update({
      where: { id },
      data: updateData
    });

    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }

    return res.json({ language });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update language' });
  }
});

// DELETE /cms/localization/languages/:id
router.delete('/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const language = await prisma.language.delete({
      where: { id }
    });
    
    if (!language) {
      return res.status(404).json({ error: 'Language not found' });
    }
    
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete language' });
  }
});

// GET /cms/localization/categories
router.get('/categories', requirePermission('localization', 'view'), async (_req, res) => {
  try {
    const rows = await prisma.translationKey.findMany({
      where: { isActive: true },
      select: { category: true }
    });

    const unique = Array.from(new Set(rows.map((r: any) => r.category).filter(Boolean))) as string[];
    const categories = unique.map((name: string) => ({ id: name, name, description: '', color: '#6B7280' }));
    return res.json(categories.length > 0 ? categories : [{ id: 'general', name: 'general', description: '', color: '#6B7280' }]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load categories' });
  }
});

// GET /cms/localization/keys
router.get('/keys', async (req, res) => {
  try {
    const { category, search, active_only } = req.query as any;

    const whereConditions: any = {};

    if (category) { whereConditions.category = category; }
    if (active_only === 'true') { whereConditions.isActive = true; }
    if (search) { whereConditions.key = { contains: search, mode: 'insensitive' }; }

    const rows = await prisma.translationKey.findMany({
      where: whereConditions
    });
    return res.json({ keys: rows });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load translation keys' });
  }
});

// GET /cms/timezones
router.get('/timezones', requirePermission('localization', 'view'), async (_req, res) => {
  const timezones = [
    { id: 'America/New_York', name: 'Eastern Time', offset: 'UTC-05:00', region: 'North America' },
    { id: 'America/Los_Angeles', name: 'Pacific Time', offset: 'UTC-08:00', region: 'North America' },
    { id: 'Europe/London', name: 'Greenwich Mean Time', offset: 'UTC+00:00', region: 'Europe' },
    { id: 'Asia/Tokyo', name: 'Japan Standard Time', offset: 'UTC+09:00', region: 'Asia' },
    { id: 'Asia/Bangkok', name: 'Thailand Time', offset: 'UTC+07:00', region: 'Asia' },
  ];
  return res.json({ timezones });
});

// GET /cms/localization/translations
router.get('/translations', async (req, res) => {
  try {
    const { language_id: languageId, category, page = '1', page_size = '50', search } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(page_size) || 50, 1), 200);
    const offset = (pageNum - 1) * pageSize;

    const whereConditions: any = {};

    if (languageId) { whereConditions.languageId = languageId; }
    if (category && category !== 'all') { whereConditions.key = { category }; }
    if (search) { whereConditions.key = { key: { contains: search, mode: 'insensitive' } }; }

    const rows = await prisma.translation.findMany({
      where: whereConditions,
      include: {
        key: {
          select: { id: true, key: true, category: true, description: true }
        },
        language: {
          select: { id: true, code: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip: offset,
      take: pageSize
    });

    const formattedRows = rows.map((t: any) => ({
      ...t,
      translationKeys: t.key,
      languages: t.language
    }));
    return res.json({ translations: rows });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load translations' });
  }
});

// GET /cms/localization/translations/:langCode
router.get('/translations/:langCode', requirePermission('localization', 'view'), async (req, res) => {
  try {
    const { langCode } = req.params;

    const langRows = await prisma.language.findFirst({
      where: { code: langCode }
    });
    if (!langRows) {
      return res.json({ translations: {} });
    }

    const rows = await prisma.translation.findMany({
      where: { 
        languageId: langRows.id,
        isApproved: true
      },
      include: {
        key: {
          select: { key: true }
        }
      }
    });

    const map: Record<string, string> = {};
    rows.forEach((row: any) => { map[row.key.key] = row.value; });

    return res.json({ translations: map });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to load translations' });
  }
});

// POST /cms/localization/translations
router.post('/translations', requirePermission('localization', 'create'), async (req, res) => {
  try {
    const { key, value, language, category, description, isActive, isApproved } = req.body || {};
    if (!key || !value || !language) {
      return res.status(400).json({ error: 'key, value, and language are required' });
    }

    // Upsert key
    const translationKey = await prisma.translationKey.upsert({
      where: { key: key },
      update: {
        category: category || 'general',
        description: description || null,
        isActive: isActive !== false
      },
      create: {
        key: key,
        category: category || 'general',
        description: description || null,
        isActive: isActive !== false,
        context: 'mobile_app'
      }
    });

    // Find language id
    const langRecord = await prisma.language.findUnique({
      where: { code: language }
    });
    if (!langRecord) {
      return res.status(400).json({ error: 'Invalid language' });
    }

    // Upsert translation
    const translation = await prisma.translation.upsert({
      where: {
        keyId_languageId: {
          keyId: translationKey.id,
          languageId: langRecord.id
        }
      },
      update: {
        value: value,
        isApproved: Boolean(isApproved)
      },
      create: {
        keyId: translationKey.id,
        languageId: langRecord.id,
        value: value,
        isApproved: Boolean(isApproved)
      }
    });

    return res.status(201).json({ translation: translation });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to create translation' });
  }
});

// PUT /cms/localization/translations/:id
router.put('/translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { value, isApproved } = req.body || {};

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (value !== undefined) { updates.push(`value = $${paramIndex++}`); params.push(value); }
    if (isApproved !== undefined) { updates.push(`is_approved = $${paramIndex++}`); params.push(isApproved); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const updateData: any = {};
    if (value !== undefined) { updateData.value = value; }
    if (isApproved !== undefined) { updateData.isApproved = isApproved; }
    updateData.updatedAt = new Date();

    const translation = await prisma.translation.update({
      where: { id: id },
      data: updateData
    });

    return res.json({ translation: translation });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to update translation' });
  }
});

// DELETE /cms/localization/translations/:id
router.delete('/translations/:id', requirePermission('localization', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.translation.delete({
      where: { id: id }
    });
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete translation' });
  }
});

export default router;
