import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Only cache the singleton on the client (browser) side.
// On the server there is no localStorage, so we must never reuse a server-side
// instance on the client — doing so would mean the client inherits a session-less
// instance and all authenticated writes would be rejected by RLS (error 42501).
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
    return null as any;
  }

  // On the server, always create a fresh instance (no session caching needed)
  if (typeof window === 'undefined') {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-application-name': 'sgaa',
        },
      },
    });
  }

  // On the client, use a singleton so the auth session is shared across calls
  if (!clientInstance) {
    clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sgaa-auth-token',
        storage: window.localStorage,
      },
      global: {
        headers: {
          'x-application-name': 'sgaa',
        },
      },
    });
  }

  return clientInstance;
}
