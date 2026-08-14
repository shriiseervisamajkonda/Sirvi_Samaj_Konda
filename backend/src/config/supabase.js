import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export const checkSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    console.log('ℹ️ Supabase credentials not found in .env. Running with standard configuration.');
    return false;
  }
  try {
    const { data, error } = await supabase.from('gram_units').select('count').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase Client Connected Successfully');
    }
    return true;
  } catch (err) {
    console.warn('⚠️ Supabase connect test error:', err.message);
    return false;
  }
};

export default supabase;
