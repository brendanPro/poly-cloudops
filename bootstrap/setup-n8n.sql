UPDATE "user" 
SET email = :'admin_email', 
    password = :'admin_hash', 
    "roleSlug" = 'global:owner', 
    "updatedAt" = NOW() 
WHERE "roleSlug" = 'global:owner' OR email IS NULL OR email = '';

INSERT INTO settings (key, value) 
VALUES 
    ('userManagement', '{"showSetupOnFirstLoad":false}'), 
    ('owner_setup_completed', 'true') 
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;