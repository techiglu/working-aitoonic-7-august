import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://opmsmqtxqrivlyigpudk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbXNtcXR4cXJpdmx5aWdwdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTUzOTQsImV4cCI6MjA1OTE3MTM5NH0.H-tPEzI6f_4hhptimscHWbfw4sqeGuLe09zfEyEHlHA';

// Validate Supabase configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing');
  throw new Error('Supabase URL and Anon Key are required');
}

// Create Supabase client with optimized configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Faster initialization
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-client-info': 'aitoonic-web',
    },
  },
});

console.log('✅ Supabase client initialized:', supabaseUrl);