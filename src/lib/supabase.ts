import { createClient } from '@supabase/supabase-js';
import { validateSupabaseEnvironment } from '../config/deploymentEnvironment';

const supabaseEnvironment = validateSupabaseEnvironment({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
});

/**
 * Shared browser client for the configured Supabase project.
 *
 * Product queries and authentication are intentionally outside this foundation module.
 */
export const supabase = createClient(
  supabaseEnvironment.url,
  supabaseEnvironment.publishableKey,
  {
    auth: {
      // Supabase invitations use an implicit-flow hash (inviteUserByEmail does not
      // support PKCE). Keep callback detection explicit rather than relying on a
      // library default that could change during a client upgrade.
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
  },
);
