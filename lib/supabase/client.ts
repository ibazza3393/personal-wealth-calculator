'use client';

import { createBrowserClient } from '@supabase/ssr';
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from '@/lib/supabase/env';

export { isSupabaseConfigured };

export function createClient() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}
