import { Response } from 'express';
import XLSX from 'xlsx';
import { Pool } from 'pg';
import supabaseService from '../services/supabaseService';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  is_active: boolean;
  is_default: boolean;
  flag_emoji?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TranslationKey {
  id: string;
  key: string;
  category: string;
  description?: string;
  context?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Translation {
  id: string;
  key_id: string;
  language_id: string;
  value: string;
  plural_forms?: any;
  variables?: any;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: Date;
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  key?: TranslationKey;
  language?: Language;
}

export class LocalizationController {
  // Get all languages
  async getLanguages(req: any, res: Response) {
    try {
      const { active_only } = req.query as { active_only?: string };
      const params: any[] = [];
      let sql = `SELECT * FROM languages`;
      if (active_only === 'true') {
        sql += ` WHERE is_active = true`;
      }
      sql += ` ORDER BY is_default DESC, name ASC`;
      const { rows } = await pool.query(sql, params);
      res.json({ languages: rows });
    } catch (error) {
      console.error('Error fetching languages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get language by code
  async getLanguageByCode(req: any, res: Response) {
    try {
      const { code } = req.params;
      const { rows } = await pool.query(`SELECT * FROM languages WHERE code = $1 LIMIT 1`, [code]);
      if (rows.length === 0) return res.status(404).json({ error: 'Language not found' });
      res.json({ language: rows[0] });
    } catch (error) {
      console.error('Error fetching language:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create language
  async createLanguage(req: any, res: Response) {
    try {
      const languageData = req.body;
      const fields = ['code','name','native_name','direction','is_active','is_default','flag_emoji'];
      const values = fields.map((f, i) => `$${i+1}`).join(',');
      const params = fields.map(f => languageData[f]);
      const { rows } = await pool.query(
        `INSERT INTO languages (${fields.join(',')}) VALUES (${values}) RETURNING *`,
        params
      );
      res.status(201).json({ language: rows[0] });
    } catch (error) {
      console.error('Error creating language:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update language
  async updateLanguage(req: any, res: Response) {
    try {
      const { languageId } = req.params;
      const languageData = req.body;
      const fields = Object.keys(languageData);
      const sets = fields.map((f, i) => `${f} = $${i+1}`).join(', ');
      const params = fields.map(f => languageData[f]);
      params.push(languageId);
      const { rows } = await pool.query(
        `UPDATE languages SET ${sets} WHERE id = $${fields.length+1} RETURNING *`,
        params
      );
      res.json({ language: rows[0] });
    } catch (error) {
      console.error('Error updating language:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete language
  async deleteLanguage(req: any, res: Response) {
    try {
      const { languageId } = req.params;
      await pool.query(`DELETE FROM languages WHERE id = $1`, [languageId]);
      res.json({ message: 'Language deleted successfully' });
    } catch (error) {
      console.error('Error deleting language:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get translation keys
  async getTranslationKeys(req: any, res: Response) {
    try {
      const { category, search, active_only } = req.query as any;
      const where: string[] = [];
      const params: any[] = [];
      if (category) { params.push(category); where.push(`category = $${params.length}`); }
      if (active_only === 'true') { where.push(`is_active = true`); }
      if (search) {
        params.push(`%${search}%`);
        params.push(`%${search}%`);
        where.push(`(key ILIKE $${params.length-1} OR description ILIKE $${params.length})`);
      }
      const sql = `SELECT * FROM translation_keys ${where.length? 'WHERE '+where.join(' AND '): ''} ORDER BY category, key`;
      const { rows } = await pool.query(sql, params);
      res.json({ keys: rows });
    } catch (error) {
      console.error('Error fetching translation keys:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create translation key
  async createTranslationKey(req: any, res: Response) {
    try {
      const keyData = req.body;
      const fields = ['key','category','description','context','is_active'];
      const values = fields.map((f, i) => `$${i+1}`).join(',');
      const params = fields.map(f => keyData[f]);
      const { rows } = await pool.query(
        `INSERT INTO translation_keys (${fields.join(',')}) VALUES (${values}) RETURNING *`,
        params
      );
      res.status(201).json({ key: rows[0] });
    } catch (error) {
      console.error('Error creating translation key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get translations for a language
  async getTranslationsForLanguage(req: any, res: Response) {
    try {
      const { languageCode } = req.params;
      const { category, approved_only } = req.query as any;
      const params: any[] = [languageCode];
      const where: string[] = [`l.code = $1`];
      if (category) { params.push(category); where.push(`tk.category = $${params.length}`); }
      if (approved_only === 'true') { where.push(`t.is_approved = true`); }
      const sql = `
        SELECT tk.key as tkey, t.value
        FROM translation_keys tk
        LEFT JOIN translations t ON tk.id = t.key_id
        LEFT JOIN languages l ON t.language_id = l.id
        WHERE ${where.join(' AND ')}
      `;
      const { rows } = await pool.query(sql, params);
      const translations: Record<string, string> = {};
      rows.forEach(r => { if (r.tkey) translations[r.tkey] = r.value; });
      res.json({ translations });
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all translations with filters
  async getTranslations(req: any, res: Response) {
    try {
      const { language_id, key_id, approved_only, search } = req.query as any;
      const params: any[] = [];
      const where: string[] = [];
      if (language_id) { params.push(language_id); where.push(`t.language_id = $${params.length}`); }
      if (key_id) { params.push(key_id); where.push(`t.key_id = $${params.length}`); }
      if (approved_only === 'true') { where.push(`t.is_approved = true`); }
      if (search) { params.push(`%${search}%`); params.push(`%${search}%`); where.push(`(t.value ILIKE $${params.length-1} OR tk.key ILIKE $${params.length})`); }
      const sql = `
        SELECT 
          t.*, 
          tk.key as tkey, tk.category, tk.description,
          l.code as lcode, l.name as lname
        FROM translations t
        JOIN translation_keys tk ON tk.id = t.key_id
        JOIN languages l ON l.id = t.language_id
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY t.created_at DESC
      `;
      const { rows } = await pool.query(sql, params);
      res.json({ translations: rows });
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create or update translation
  async upsertTranslation(req: any, res: Response) {
    try {
      const { keyId, languageId } = req.params;
      const translationData = req.body;
      const fields = ['value','plural_forms','variables','is_approved','approved_by','approved_at','created_by','updated_by'];
      const provided = fields.filter(f => translationData[f] !== undefined);
      const setList = provided.map((f, i) => `${f} = $${i+3}`).join(', ');
      const params = [keyId, languageId, ...provided.map(f => translationData[f])];
      const sql = `
        INSERT INTO translations (key_id, language_id${provided.length? ','+provided.join(','): ''})
        VALUES ($1, $2${provided.length? ','+provided.map((_,i)=>'$'+(i+3)).join(','): ''})
        ON CONFLICT (key_id, language_id) DO UPDATE SET ${setList || 'value = EXCLUDED.value'}
        RETURNING *
      `;
      const { rows } = await pool.query(sql, params);
      res.json({ translation: rows[0] });
    } catch (error) {
      console.error('Error upserting translation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Approve translation
  async approveTranslation(req: any, res: Response) {
    try {
      const { translationId } = req.params;
      const { approved_by } = req.body;
      const { rows } = await pool.query(
        `UPDATE translations SET is_approved = true, approved_by = $1, approved_at = NOW() WHERE id = $2 RETURNING *`,
        [approved_by, translationId]
      );
      res.json({ translation: rows[0] });
    } catch (error) {
      console.error('Error approving translation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get translation completion statistics
  async getTranslationStats(req: any, res: Response) {
    try {
      const { data, error } = await supabaseService.getSupabaseClient().rpc('get_translation_completion');

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ stats: data });
    } catch (error) {
      console.error('Error fetching translation stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get translation dashboard
  async getTranslationDashboard(req: any, res: Response) {
    try {
      // Get total counts
      const { data: keyCount } = await supabaseService.getSupabaseClient()
        .from('translation_keys')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const { data: languageCount } = await supabaseService.getSupabaseClient()
        .from('languages')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      const { data: translationCount } = await supabaseService.getSupabaseClient()
        .from('translations')
        .select('id', { count: 'exact' })
        .eq('is_approved', true);

      // Get completion stats
      const { data: completionStats } = await supabaseService.getSupabaseClient().rpc('get_translation_completion');

      // Get recent translations
      const { data: recentTranslations } = await supabaseService.getSupabaseClient()
        .from('translations')
        .select(`
          *,
          translation_keys(key, category),
          languages(code, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const dashboard = {
        total_keys: keyCount?.length || 0,
        total_languages: languageCount?.length || 0,
        total_translations: translationCount?.length || 0,
        completion_stats: completionStats || [],
        recent_translations: recentTranslations || []
      };

      res.json({ dashboard });
    } catch (error) {
      console.error('Error fetching translation dashboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export translations for a language
  async exportTranslations(req: any, res: Response) {
    try {
      const { languageCode } = req.params;
      const { format = 'json' } = req.query;
      const { rows } = await pool.query(
        `SELECT tk.key, t.value, tk.category
         FROM translation_keys tk
         LEFT JOIN translations t ON tk.id = t.key_id
         LEFT JOIN languages l ON t.language_id = l.id
         WHERE l.code = $1 AND tk.is_active = true AND (t.is_approved = true OR t.is_approved IS NULL)
         ORDER BY tk.category, tk.key`,
        [languageCode]
      );
      if (format === 'json') {
        const translations: Record<string, string> = {};
        rows?.forEach((row: any) => {
          translations[row.key] = row.value;
        });

        res.json({ translations });
      } else if (format === 'csv') {
        // Convert to CSV format
        const csv = 'Key,Value,Category\n' + 
          rows?.map((row: any) => `"${row.key}","${row.value}","${row.category}"`).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="translations-${languageCode}.csv"`);
        res.send(csv);
      } else {
        res.status(400).json({ error: 'Unsupported format' });
      }
    } catch (error) {
      console.error('Error exporting translations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Import translations
  async importTranslations(req: any, res: Response) {
    try {
      const { languageCode } = req.params;
      const { translations, overwrite = false } = req.body;
      const langRes = await pool.query(`SELECT id FROM languages WHERE code = $1`, [languageCode]);
      if (langRes.rows.length === 0) return res.status(404).json({ error: 'Language not found' });
      const languageId = langRes.rows[0].id;

      if (overwrite) {
        await pool.query(`DELETE FROM translations WHERE language_id = $1`, [languageId]);
      }

      let count = 0;
      for (const [key, value] of Object.entries(translations || {})) {
        const keyRes = await pool.query(`SELECT id FROM translation_keys WHERE key = $1`, [key]);
        if (keyRes.rows.length === 0) continue;
        const keyId = keyRes.rows[0].id;
        await pool.query(
          `INSERT INTO translations (key_id, language_id, value, is_approved)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (key_id, language_id) DO UPDATE SET value = EXCLUDED.value, is_approved = true`,
          [keyId, languageId, value]
        );
        count++;
      }

      res.json({ message: 'Translations imported successfully', count });
    } catch (error) {
      console.error('Error importing translations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Export translations as Excel (.xlsx)
  async exportTranslationsExcel(req: any, res: Response) {
    try {
      const { languageCode } = req.params;
      const { rows } = await pool.query(
        `SELECT tk.key, t.value, tk.category
         FROM translation_keys tk
         LEFT JOIN translations t ON tk.id = t.key_id
         LEFT JOIN languages l ON t.language_id = l.id
         WHERE l.code = $1 AND tk.is_active = true
         ORDER BY tk.category, tk.key`,
        [languageCode]
      );

      const json = rows?.map((r: any) => ({ Key: r.key, Value: r.value ?? '', Category: r.category })) || [];
      const worksheet = XLSX.utils.json_to_sheet(json);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `translations_${languageCode}`);

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="translations-${languageCode}.xlsx"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting translations (xlsx):', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Import translations from Excel (.xlsx)
  async importTranslationsExcel(req: any, res: Response) {
    try {
      const { languageCode } = req.params;
      const overwrite = String(req.query.overwrite || 'false') === 'true';

      const langRes = await pool.query(`SELECT id FROM languages WHERE code = $1`, [languageCode]);
      if (langRes.rows.length === 0) return res.status(404).json({ error: 'Language not found' });
      const languageId = langRes.rows[0].id;

      // Expect raw binary body (application/octet-stream) or base64 in JSON { fileBase64 }
      let workbook: XLSX.WorkBook | null = null;
      if (req.is('application/octet-stream')) {
        const chunks: Buffer[] = [];
        // @ts-ignore
        req.on('data', (c: Buffer) => chunks.push(c));
        await new Promise<void>((resolve) => req.on('end', () => resolve()));
        const buffer = Buffer.concat(chunks);
        workbook = XLSX.read(buffer, { type: 'buffer' });
      } else if (req.is('application/json') && (req.body?.fileBase64)) {
        const buffer = Buffer.from(String(req.body.fileBase64), 'base64');
        workbook = XLSX.read(buffer, { type: 'buffer' });
      } else {
        return res.status(400).json({ error: 'Provide XLSX as octet-stream body or JSON { fileBase64 }' });
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<{ Key: string; Value: string }>(worksheet, { defval: '' });

      if (overwrite) {
        await pool.query(`DELETE FROM translations WHERE language_id = $1`, [languageId]);
      }

      let count = 0;
      for (const row of rows) {
        const key = row.Key?.trim();
        const value = String(row.Value ?? '');
        if (!key) continue;
        const keyRes = await pool.query(`SELECT id FROM translation_keys WHERE key = $1`, [key]);
        if (keyRes.rows.length === 0) continue;
        const keyId = keyRes.rows[0].id;
        await pool.query(
          `INSERT INTO translations (key_id, language_id, value, is_approved)
           VALUES ($1, $2, $3, true)
           ON CONFLICT (key_id, language_id)
           DO UPDATE SET value = EXCLUDED.value, is_approved = true`,
          [keyId, languageId, value]
        );
        count++;
      }

      res.json({ message: 'XLSX imported successfully', count });
    } catch (error) {
      console.error('Error importing translations (xlsx):', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
