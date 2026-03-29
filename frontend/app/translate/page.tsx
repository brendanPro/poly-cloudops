'use client';

import { useState } from 'react';

const languageOptions = [
  { value: 'EN', label: 'English' },
  { value: 'FR', label: 'French' },
  { value: 'ES', label: 'Spanish' },
  { value: 'DE', label: 'German' },
  { value: 'JA', label: 'Japanese' },
];

export default function TranslatePage() {
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [target, setTarget] = useState('FR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Translation failed');

      setTranslatedText(data.translatedText ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setTranslatedText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Text Translation</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Trigger the deployed n8n translation workflow through its webhook.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Target Language
          </label>
          <select
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-900"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="w-full p-4 border rounded-lg"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate..."
        />

        <button
          className="w-full py-3 px-6 rounded-xl text-white font-semibold text-center bg-primary-600 hover:bg-primary-700 disabled:opacity-60"
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? 'Translating…' : 'Translate'}
        </button>

        {error && (
          <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <textarea
          className="w-full p-4 border rounded-lg bg-gray-100"
          rows={6}
          value={translatedText}
          readOnly
          placeholder="Translation will appear here..."
        />
      </div>
    </div>
  );
}
