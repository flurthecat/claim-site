import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Safe environment variable access for Vite builds
const SUPABASE_URL = browser ? import.meta.env?.VITE_PUBLIC_SUPABASE_URL || '' : '';
const SUPABASE_ANON_KEY = browser ? import.meta.env?.VITE_PUBLIC_SUPABASE_ANON_KEY || '' : '';

// Create client with safe fallbacks for build time
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key'
);

// Runtime configuration check
export function isSupabaseConfigured(): boolean {
  if (!browser) return false;
  
  const url = import.meta.env?.VITE_PUBLIC_SUPABASE_URL;
  const key = import.meta.env?.VITE_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(url && key && url.includes('supabase.co') && key !== 'placeholder-anon-key');
}