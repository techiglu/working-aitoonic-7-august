// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Load from .env (must be prefixed with VITE_ in Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback client if environment variables are missing
let supabase;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Disable auth for faster loading
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minute cache
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } else {
    console.warn('Supabase environment variables not found. Using fallback mode.');
    // Create a mock client that will fail gracefully
    supabase = null;
  }
} catch (error) {
  console.warn('Failed to create Supabase client:', error);
  supabase = null;
}

export { supabase };