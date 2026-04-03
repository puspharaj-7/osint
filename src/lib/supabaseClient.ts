import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key';

const isConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!isConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set in .env — ' +
    'app will load but auth is disabled until credentials are added.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'osiris-auth-token', // Custom key
    // Disables cross-tab lock competition which causes the timeout error:
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: true,
  },
});

/** True once .env has real Supabase credentials */
export const supabaseConfigured = isConfigured;
