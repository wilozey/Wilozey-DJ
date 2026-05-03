// Server-safe client accessor for environments that should avoid import-time side effects.
// TODO(install): Ensure @supabase/supabase-js is installed in your runtime environment.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function getServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
