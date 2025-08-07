import { createClient } from '@supabase/supabase-js';

// Your actual Supabase credentials
const supabaseUrl = 'https://opmsmqtxqrivlyigpudk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wbXNtcXR4cXJpdmx5aWdwdWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTUzOTQsImV4cCI6MjA1OTE3MTM5NH0.H-tPEzI6f_4hhptimscHWbfw4sqeGuLe09zfEyEHlHA';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing');
  throw new Error('Supabase URL and Anon Key are required');
}

console.log('🔗 Connecting to Supabase:', supabaseUrl);
console.log('🔑 Using API Key:', supabaseAnonKey.substring(0, 20) + '...');

// Create Supabase client with proper authentication headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  },
  db: {
    schema: 'public'
  }
});

// Test connection function with proper error handling
export async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase connection...');
    console.log('📡 Making request to:', `${supabaseUrl}/rest/v1/categories`);
    
    const { data, error, count } = await supabase
      .from('categories')
      .select('id, name', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase query error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error: error.message };
    }
    
    console.log('✅ Connection test successful!');
    console.log('📊 Sample data:', data);
    console.log('📊 Total categories count:', count);
    return { success: true, count, data };
    
  } catch (err) {
    console.error('❌ Connection test network error:', err);
    return { success: false, error: err.message };
  }
}

// Test the connection immediately
testSupabaseConnection().then(result => {
  if (result.success) {
    console.log('🎉 Supabase connection verified!');
  } else {
    console.error('💥 Supabase connection failed:', result.error);
  }
});

console.log('✅ Supabase client initialized');