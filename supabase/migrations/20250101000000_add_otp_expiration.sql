-- Add expires_at column to logins table for OTP expiration
ALTER TABLE logins ADD COLUMN expires_at TIMESTAMPTZ;

-- Update existing records to have a default expiration (5 minutes from now)
UPDATE logins SET expires_at = (created_at + INTERVAL '5 minutes') WHERE expires_at IS NULL;

-- Add index on expires_at for better query performance
CREATE INDEX idx_logins_expires_at ON logins(expires_at);
