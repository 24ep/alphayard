import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config as env } from '../config/env';

let supabase: SupabaseClient | null = null;

export const initializeSupabase = async (): Promise<SupabaseClient> => {
  if (supabase) return supabase;

  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Best-effort connection test (non-fatal if tables not present yet)
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Supabase connection test warning:', error.message);
    }
  } catch (e: any) {
    console.warn('⚠️ Supabase connection test error:', e?.message || e);
  }

  return supabase;
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    console.error('❌ getSupabaseClient called but supabase is null!');
    throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
  }
  return supabase;
};

export const getSupabaseAdmin = (): SupabaseClient => getSupabaseClient();

export default { initializeSupabase, getSupabaseClient, getSupabaseAdmin };
