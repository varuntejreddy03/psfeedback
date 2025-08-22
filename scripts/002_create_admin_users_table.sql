-- Create admin_users table for storing admin login credentials
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (username: admin, password: admin)
-- Note: In production, use proper password hashing
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', 'admin') 
ON CONFLICT (username) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading admin users (for login verification)
CREATE POLICY "Allow reading admin users" ON admin_users
FOR SELECT USING (true);
