-- ================================
-- Custom app tables
-- ================================

CREATE TABLE IF NOT EXISTS public.translations (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    target_lang VARCHAR(5),
    detected_src_lang VARCHAR(5),
    created_at TIMESTAMP DEFAULT now()
);

-- ================================
-- n8n bootstrap (DEV ONLY)
-- ================================

-- 1. Ensure owner user exists
/* INSERT INTO "user" (
    id,
    email,
    password,
    role,
    disabled,
    created_at,
    updated_at
)
VALUES (
    'cf1fe574-a004-4082-ad32-1a351a2a7ca9',
    'admin@cloudops.com',
    '$2a$10$MvKxTl.hglqxomQeI5cQROiMUlKACxVkOuf1QkNaYlZ9GOvs9n4mu',
    'global:owner',
    false,
    now(),
    now()
)
ON CONFLICT (email)
DO NOTHING;

-- 2. Disable first-load setup screen
INSERT INTO settings (key, value)
VALUES (
    'userManagement',
    '{"showSetupOnFirstLoad":false}'
)
ON CONFLICT (key)
DO UPDATE SET value = EXCLUDED.value;*/
