/*
  # Setup Admin Authentication

  1. Create admin user with demo credentials
  2. Set up authentication for admin panel access

  Note: This creates a demo admin user for testing purposes.
  In production, you should create your own secure credentials.
*/

-- Insert demo admin user (this will only work if the user doesn't already exist)
-- The actual user creation should be done through Supabase Auth UI or API
-- This is just a placeholder to document the intended credentials

-- Demo credentials for admin access:
-- Email: admin@aitoonic.com  
-- Password: admin123

-- You can create this user by running the following in your Supabase SQL editor:
-- Or use the Supabase Auth API to create the user programmatically

-- Note: Supabase handles user creation through their Auth service,
-- so we don't directly insert into auth.users table here.
-- Instead, this migration serves as documentation for the demo credentials.

-- Create a simple admin_users table to track admin permissions (optional)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
CREATE POLICY "Allow authenticated users to read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to manage admin_users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);