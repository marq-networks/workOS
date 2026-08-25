import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel.',
  );
}

/**
 * Shared browser client for the configured Supabase project.
 *
 * Product queries and authentication are intentionally outside this foundation module.
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    // Supabase invitations use an implicit-flow hash (inviteUserByEmail does not
    // support PKCE). Keep callback detection explicit rather than relying on a
    // library default that could change during a client upgrade.
    detectSessionInUrl: true,
    flowType: 'implicit',
  },
});
