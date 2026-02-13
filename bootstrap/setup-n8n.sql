-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update user with hashed password (bcrypt with 10 rounds)
UPDATE "user" 
SET email = :'admin_email', 
    password = crypt(:'admin_password', gen_salt('bf', 10)),
    "roleSlug" = 'global:owner', 
    "updatedAt" = NOW() 
WHERE "roleSlug" = 'global:owner' OR email IS NULL OR email = '';

-- Insert settings for user management
INSERT INTO settings (key, value) 
VALUES 
    ('userManagement', '{"showSetupOnFirstLoad":false}'), 
    ('owner_setup_completed', 'true') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;