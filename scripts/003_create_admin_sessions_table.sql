-- Create admin_sessions table for managing admin login sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading admin sessions
CREATE POLICY "Allow reading admin sessions" ON admin_sessions
FOR SELECT USING (true);

-- Create policy to allow inserting admin sessions
CREATE POLICY "Allow inserting admin sessions" ON admin_sessions
FOR INSERT WITH CHECK (true);

-- Create policy to allow deleting expired sessions
CREATE POLICY "Allow deleting admin sessions" ON admin_sessions
FOR DELETE USING (true);

-- Create index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
