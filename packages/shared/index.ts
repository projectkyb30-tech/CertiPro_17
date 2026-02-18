import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (url: string, key: string) => {
  return createClient(url, key, {
    auth: {
      multiTab: false,
    },
  });
};

export * from './types/index';
