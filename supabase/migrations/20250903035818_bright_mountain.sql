/*
  # Create Admin User for Demo Access

  1. Admin User Setup
    - Creates admin user with email: admin@aitoonic.com
    - Password: admin123
    - This user will have admin access to the panel

  2. Security
    - User is created through Supabase Auth system
    - Proper authentication flow maintained

  Note: This migration documents the admin user creation.
  The actual user must be created through Supabase Dashboard or Auth API.
*/

-- This migration serves as documentation for the admin user
-- The actual user creation should be done through Supabase Dashboard:
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add user"
-- 3. Email: admin@aitoonic.com
-- 4. Password: admin123
-- 5. Email Confirm: true (skip email confirmation)

-- Create admin_roles table to track admin permissions
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_roles
CREATE POLICY "Allow authenticated users to read admin_roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin users to manage admin_roles"
  ON admin_roles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);