import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Not wired into the app's runtime persistence yet — see src/store/useAppStore.ts,
 * which currently persists locally via AsyncStorage so the app runs with zero
 * backend setup. This client, plus supabase/schema.sql and scripts/seed.ts, are
 * ready for whenever the local store's repository functions are pointed at
 * Supabase instead (single-device -> synced, multi-device).
 */
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
