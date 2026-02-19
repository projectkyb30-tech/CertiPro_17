import { createSupabaseClient } from '@certipro/shared';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check .env file.');
}

type SupabaseInstance = ReturnType<typeof createSupabaseClient>;

export const supabase: SupabaseInstance = (supabaseUrl && supabaseAnonKey)
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : ({} as SupabaseInstance);

