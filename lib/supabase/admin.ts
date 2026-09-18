import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase/env';

/**
 * Supabase client holding the secret key, which bypasses row-level security.
 *
 * This exists for exactly one reason: `akahu_tokens` and `akahu_oauth_state`
 * have RLS enabled with no policy, so no session-scoped key can touch them.
 * That is deliberate — see the migration. Reaching them needs the secret key,
 * and the secret key must therefore never be imported anywhere a request's
 * own identity is the thing being trusted.
 *
 * Rules for callers:
 * - Use it only in lib/akahu/token.ts and the Akahu OAuth routes.
 * - Always filter by a `user_id` you got from `supabase.auth.getUser()`, never
 *   from the request body or a query parameter. RLS is not backing you up
 *   here; the filter is the access control.
 */
export function createAdminClient() {
  const url = supabaseUrl();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !secret) {
    throw new Error(
      'SUPABASE_SECRET_KEY is not set. Akahu token storage needs it, because akahu_tokens is unreachable with the publishable key by design.',
    );
  }
  return createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isAdminConfigured(): boolean {
  const secret = process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(supabaseUrl() && secret);
}
