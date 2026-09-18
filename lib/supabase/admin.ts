import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl } from '@/lib/supabase/env';

/**
 * Service-role client, for the one table the browser must never reach.
 *
 * `akahu_tokens` has row-level security on and no policies, so anon and
 * authenticated are denied outright. Only this client can read it, and it
 * exists solely on the server. Every caller must establish who the user is
 * from their session first and then scope the query by that id — the service
 * role bypasses RLS, so it carries the access check itself.
 */
export function createAdminClient() {
  const url = supabaseUrl();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim() ?? process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !secret) return null;
  return createSupabaseClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
