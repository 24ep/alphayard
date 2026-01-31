#!/usr/bin/env node

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.argv.find(a => a.startsWith('postgres')) || '';
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is required. Provide via env or pass as first arg.');
  process.exit(1);
}

const SQL = `
-- Tables (safe to run multiple times)
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  direction VARCHAR(3) DEFAULT 'ltr' CHECK (direction IN ('ltr','rtl')),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  flag_emoji VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  context TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_id UUID REFERENCES languages(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key_id, language_id)
);

-- Languages
INSERT INTO languages (code,name,native_name,direction,is_active,is_default,flag_emoji) VALUES
('en','English','English','ltr',true,true,'🇺🇸'),
('es','Spanish','Español','ltr',true,false,'🇪🇸'),
('fr','French','Français','ltr',true,false,'🇫🇷'),
('de','German','Deutsch','ltr',true,false,'🇩🇪'),
('pt','Portuguese','Português','ltr',true,false,'🇵🇹'),
('ru','Russian','Русский','ltr',true,false,'🇷🇺'),
('zh','Chinese','中文','ltr',true,false,'🇨🇳'),
('ja','Japanese','日本語','ltr',true,false,'🇯🇵'),
('ko','Korean','한국어','ltr',true,false,'🇰🇷'),
('ar','Arabic','العربية','rtl',true,false,'🇸🇦'),
('hi','Hindi','हिन्दी','ltr',true,false,'🇮🇳'),
('th','Thai','ไทย','ltr',true,false,'🇹🇭'),
('vi','Vietnamese','Tiếng Việt','ltr',true,false,'🇻🇳'),
('id','Indonesian','Bahasa Indonesia','ltr',true,false,'🇮🇩'),
('lo','Lao','ລາວ','ltr',true,false,'🇱🇦'),
('my','Burmese','မြန်မာ','ltr',true,false,'🇲🇲')
ON CONFLICT (code) DO NOTHING;

-- Keys
INSERT INTO translation_keys (key,category,description,context,is_active) VALUES
('ui.welcome.title','ui','Welcome screen title','mobile_app',true),
('ui.welcome.subtitle','ui','Welcome screen subtitle','mobile_app',true),
('ui.button.save','ui','Save button text','mobile_app',true),
('ui.button.cancel','ui','Cancel button text','mobile_app',true),
('nav.home','navigation','Home tab','mobile_app',true),
('nav.settings','navigation','Settings tab','mobile_app',true)
ON CONFLICT (key) DO NOTHING;

-- English translations for those keys
INSERT INTO translations (key_id, language_id, value, is_approved, approved_at)
SELECT tk.id, l.id,
  CASE tk.key
    WHEN 'ui.welcome.title' THEN 'Welcome to Bondarys'
    WHEN 'ui.welcome.subtitle' THEN 'Connect with your circle safely'
    WHEN 'ui.button.save' THEN 'Save'
    WHEN 'ui.button.cancel' THEN 'Cancel'
    WHEN 'nav.home' THEN 'Home'
    WHEN 'nav.settings' THEN 'Settings'
  END,
  true, NOW()
FROM translation_keys tk
JOIN languages l ON l.code='en'
LEFT JOIN translations t ON t.key_id=tk.id AND t.language_id=l.id
WHERE t.id IS NULL;
`;

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    // Split on semicolons while preserving statements
    const statements = SQL.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await client.query(stmt);
    }
    console.log('✅ Localization seed completed');
  } catch (e) {
    console.error('❌ Seed failed:', e.message || e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}



