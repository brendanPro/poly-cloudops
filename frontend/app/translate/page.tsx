'use client';

import { useState } from 'react';

const languages = [
  { value: 'EN', label: 'English' },
  { value: 'FR', label: 'French' },
  { value: 'ES', label: 'Spanish' },
  { value: 'DE', label: 'German' },
  { value: 'IT', label: 'Italian' },
  { value: 'PT', label: 'Portuguese' },
  { value: 'NL', label: 'Dutch' },
  { value: 'PL', label: 'Polish' },
  { value: 'JA', label: 'Japanese' },
  { value: 'ZH', label: 'Chinese' },
];

export default function TranslatePage() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('FR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState('');

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Enter some text to translate.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult('');

    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Translation failed');
      setResult(json.translatedText ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="section-label mb-2">Text — DeepL</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Text Translation
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Translate text across languages using the DeepL API via n8n.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
              Source text
            </label>
            <textarea
              className="input"
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to translate..."
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
              Target language
            </label>
            <select
              className="input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Translating...
              </>
            ) : (
              'Translate'
            )}
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Output */}
        <div className="result-panel">
          {result ? (
            <div className="p-5 flex flex-col h-full gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Translation — {languages.find((l) => l.value === target)?.label}
                </span>
              </div>
              <div className="divider" style={{ margin: 0 }} />
              <p
                className="text-sm leading-relaxed flex-grow"
                style={{ color: 'var(--foreground)' }}
              >
                {result}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 p-8 text-center">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
                  Translation will appear here
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                  Enter text and click Translate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
