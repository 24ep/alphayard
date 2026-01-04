import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'your-key';

console.log('✅ Initializing Supabase Client with URL:', supabaseUrl);
// console.log('Key:', supabaseKey); // Don't log full key for security

export const supabase = createClient(supabaseUrl, supabaseKey);
