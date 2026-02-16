-- ================================
-- Translations Table Setup
-- ================================
-- Creates the translations table for storing translated content

CREATE TABLE IF NOT EXISTS public.translations (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    target_lang VARCHAR(5),
    detected_src_lang VARCHAR(5),
    created_at TIMESTAMP DEFAULT now()
);

-- Grant permissions to n8n app user
GRANT SELECT, INSERT, UPDATE, DELETE ON public.translations TO n8n_app_user;
GRANT USAGE, SELECT ON SEQUENCE public.translations_id_seq TO n8n_app_user;

-- Verify table was created
SELECT 'Translations table created successfully' AS status;
