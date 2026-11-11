import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/demo";
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, key);
}
