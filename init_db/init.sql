CREATE TABLE IF NOT EXISTS public.translations (
    id SERIAL PRIMARY KEY,
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    target_lang VARCHAR(5),
    detected_src_lang VARCHAR(5),
    created_at TIMESTAMP DEFAULT now()
);
