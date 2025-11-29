#!/usr/bin/env ts-node
import { promises as fs } from 'fs';
import path from 'path';

type Translations = Record<string, any>;

const ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'src', 'locales');
const SRC_DIR = path.join(ROOT, 'src');

function flatten(obj: any, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  Object.keys(obj || {}).forEach((key) => {
    const val = obj[key];
    const full = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(out, flatten(val, full));
    } else {
      out[full] = String(val ?? '');
    }
  });
  return out;
}

function unflatten(flat: Record<string, string>): Translations {
  const out: Translations = {};
  for (const key of Object.keys(flat)) {
    const parts = key.split('.');
    let cur: any = out;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (i === parts.length - 1) {
        cur[p] = flat[key];
      } else {
        cur[p] = cur[p] || {};
        cur = cur[p];
      }
    }
  }
  return out;
}

async function loadLocale(code: string): Promise<Translations> {
  const file = path.join(LOCALES_DIR, `${code}.json`);
  const content = await fs.readFile(file, 'utf8');
  return JSON.parse(content);
}

async function saveLocale(code: string, data: Translations) {
  const file = path.join(LOCALES_DIR, `${code}.json`);
  const content = JSON.stringify(data, null, 2) + '\n';
  await fs.writeFile(file, content, 'utf8');
}

async function listLocales(): Promise<string[]> {
  const files = await fs.readdir(LOCALES_DIR);
  return files.filter(f => f.endsWith('.json')).map(f => path.basename(f, '.json'));
}

async function extractKeys(): Promise<string[]> {
  const rgx = /t\(\s*['\"]([A-Za-z0-9_.-]+)['\"]/g; // matches t('key.path')
  const keys = new Set<string>();

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules') continue;
        await walk(p);
      } else if (p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js') || p.endsWith('.jsx')) {
        const content = await fs.readFile(p, 'utf8');
        let m: RegExpExecArray | null;
        while ((m = rgx.exec(content))) {
          keys.add(m[1]);
        }
      }
    }
  }

  await walk(SRC_DIR);
  return Array.from(keys).sort();
}

async function validate() {
  const locales = await listLocales();
  if (!locales.includes('en')) {
    console.error('Base locale en.json not found.');
    process.exit(1);
  }
  const base = await loadLocale('en');
  const baseFlat = flatten(base);
  const results: Record<string, { missing: string[]; unused: string[] }> = {};
  for (const loc of locales) {
    const data = await loadLocale(loc);
    const flat = flatten(data);
    const missing = Object.keys(baseFlat).filter(k => !(k in flat));
    const unused = Object.keys(flat).filter(k => !(k in baseFlat));
    results[loc] = { missing, unused };
  }
  console.log(JSON.stringify(results, null, 2));
}

async function sync(args: { fill?: boolean }) {
  const locales = await listLocales();
  const base = await loadLocale('en');
  const baseFlat = flatten(base);
  for (const loc of locales) {
    if (loc === 'en') continue;
    const data = await loadLocale(loc);
    const flat = flatten(data);
    let changed = false;
    for (const key of Object.keys(baseFlat)) {
      if (!(key in flat)) {
        flat[key] = args.fill ? baseFlat[key] : '';
        changed = true;
      }
    }
    // optionally remove keys not in base?
    const next = unflatten(flat);
    if (changed) {
      await saveLocale(loc, next);
      console.log(`Synced ${loc}.json`);
    }
  }
}

async function addLanguage(code: string) {
  const locales = await listLocales();
  if (locales.includes(code)) {
    console.error(`Locale ${code} already exists.`);
    process.exit(1);
  }
  await saveLocale(code, {});
  console.log(`Created ${code}.json`);
}

async function ensureDirs() {
  await fs.mkdir(LOCALES_DIR, { recursive: true });
}

async function main() {
  await ensureDirs();
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case 'validate':
      await validate();
      break;
    case 'sync': {
      const fill = rest.includes('--fill');
      await sync({ fill });
      break;
    }
    case 'extract': {
      const keys = await extractKeys();
      console.log(JSON.stringify(keys, null, 2));
      break;
    }
    case 'add': {
      const code = rest[0];
      if (!code) {
        console.error('Usage: i18n-tools add <langCode>');
        process.exit(1);
      }
      await addLanguage(code);
      break;
    }
    default:
      console.log('Usage: i18n-tools <validate|sync [--fill]|extract|add <code>>');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


