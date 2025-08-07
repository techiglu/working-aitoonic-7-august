import { createClient } from '@supabase/supabase-js';

// Direct Supabase configuration - your actual credentials
const supabaseUrl = 'https://opmsmqtxqrivlyigpudk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbXNtcXR4cXJpdmx5aWdwdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTUzOTQsImV4cCI6MjA1OTE3MTM5NH0.H-tPEzI6f_4hhptimscHWbfw4sqeGuLe09zfEyEHlHA';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing');
  throw new Error('Supabase URL and Anon Key are required');
}

console.log('🔗 Connecting to Supabase:', supabaseUrl);

// Create Supabase client with CORS-friendly configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-client-info': 'aitoonic-web',
      'Content-Type': 'application/json',
    },
    fetch: (url, options = {}) => {
      console.log('🌐 Making request to:', url);
      return fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const { data, error, count } = await supabase
      .from('categories')
      .select('id', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Connection test successful!');
    console.log('📊 Categories table accessible, total count:', count);
    return { success: true, count };
    
  } catch (err) {
    console.error('❌ Connection test error:', err);
    return { success: false, error: err.message };
  }
}

console.log('✅ Supabase client initialized successfully');