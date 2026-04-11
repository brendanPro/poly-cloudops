'use client';

import { useState, useRef, ChangeEvent } from 'react';

type Result = {
  filename: string;
  size: string;
  rowCount: number;
  file: string;
};

function triggerDownload(base64: string, filename: string) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function validateJSON(raw: string): { ok: true; data: any[] } | { ok: false; error: string } {
  if (!raw.trim()) return { ok: false, error: 'Input is empty.' };
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ok: false, error: 'JSON must be an array of objects.' };
    if (parsed.length === 0) return { ok: false, error: 'Array cannot be empty.' };
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${e instanceof Error ? e.message : 'parse error'}` };
  }
}

const exampleJSON = `[
  { "name": "Alice", "role": "Engineer", "team": "Backend" },
  { "name": "Bob",   "role": "Designer", "team": "Product" }
]`;

export default function JsonToExcelPage() {
  const [tab, setTab] = useState<'paste' | 'upload'>('paste');
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith('.json')) {
      setError('Please upload a .json file.');
      return;
    }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target?.result as string);
    reader.readAsText(f);
  };

  const handleConvert = async () => {
    setError(null);
    setResult(null);

    const validation = validateJSON(input);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/json-to-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: validation.data }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Conversion failed');
      setResult({ filename: json.filename, size: json.size, rowCount: json.rowCount, file: json.file });
      triggerDownload(json.file, json.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="section-label mb-2">Data</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          JSON to Excel
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Convert a JSON array into a downloadable Excel spreadsheet via n8n.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Input */}
        <div className="flex flex-col gap-4">
          {/* Tab toggle */}
          <div
            className="flex p-1 gap-1 rounded-lg"
            style={{ background: 'var(--border-subtle)', border: '1px solid var(--border)' }}
          >
            {(['paste', 'upload'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-1.5 px-3 rounded-md text-sm font-medium capitalize transition-all duration-150"
                style={{
                  background: tab === t ? 'var(--surface)' : 'transparent',
                  color: tab === t ? 'var(--foreground)' : 'var(--foreground-muted)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                  border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                {t === 'paste' ? 'Paste JSON' : 'Upload file'}
              </button>
            ))}
          </div>

          {tab === 'paste' && (
            <div>
              <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
                JSON array of objects
              </label>
              <textarea
                className="input font-mono text-sm"
                rows={12}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={exampleJSON}
              />
            </div>
          )}

          {tab === 'upload' && (
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                className="btn btn-ghost w-full py-8 border-dashed flex-col gap-2"
                style={{ borderStyle: 'dashed', height: 'auto' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--foreground-subtle)' }}>
                  <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4M12 3v13M8 7l4-4 4 4" />
                </svg>
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {file ? file.name : 'Choose a .json file'}
                </span>
              </button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

              {input && (
                <pre
                  className="mt-3 p-3 rounded-lg text-xs overflow-auto max-h-40 font-mono"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                >
                  {input.slice(0, 400)}{input.length > 400 ? '\n...' : ''}
                </pre>
              )}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Converting...
              </>
            ) : (
              'Convert to Excel'
            )}
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Result */}
        <div className="result-panel" style={{ border: '1px solid var(--border)' }}>
          {result ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-4 animate-fade-in">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgb(16 185 129 / 0.1)', border: '1px solid rgb(16 185 129 / 0.3)' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="rgb(16 185 129)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold mb-0.5" style={{ color: 'var(--foreground)' }}>Download started</p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {result.filename}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-subtle)' }}>
                  {result.rowCount} rows — {result.size}
                </p>
              </div>
              <button
                className="btn btn-ghost text-sm"
                onClick={() => triggerDownload(result.file, result.filename)}
              >
                Download again
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 p-8 text-center">
              <div>
                <svg
                  className="w-10 h-10 mx-auto mb-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  style={{ color: 'var(--border)' }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
                  Excel file will download automatically
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
