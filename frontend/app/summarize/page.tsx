'use client';

import { useState } from 'react';

type SummaryLength = 'short' | 'medium' | 'detailed';

export default function SummarizePage() {
  const [text, setText] = useState('');
  const [length, setLength] = useState<SummaryLength>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  const handleSummarize = async () => {
    setError(null);
    setSummary(null);

    if (!text.trim() || wordCount < 50) {
      setError('Enter at least 50 words to summarize.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), length }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed to generate summary');
      setSummary(json.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lengthOptions: { value: SummaryLength; label: string; hint: string }[] = [
    { value: 'short', label: 'Short', hint: '2–3 sentences' },
    { value: 'medium', label: 'Medium', hint: '1 paragraph' },
    { value: 'detailed', label: 'Detailed', hint: 'Several paragraphs' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <p className="section-label mb-2">AI — OpenRouter</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          AI Text Summarizer
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Summarize long-form text using an AI language model via n8n.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input column */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Text to summarize
              </label>
              <span className="text-xs" style={{ color: wordCount < 50 ? 'var(--foreground-subtle)' : 'var(--foreground-muted)' }}>
                {wordCount} / 50 words min
              </span>
            </div>
            <textarea
              className="input"
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here — at least 50 words..."
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
              Summary length
            </p>
            <div
              className="flex gap-2 p-1 rounded-lg"
              style={{ background: 'var(--border-subtle)', border: '1px solid var(--border)' }}
            >
              {lengthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLength(opt.value)}
                  className="flex-1 py-2 px-3 rounded-md text-sm transition-all duration-150"
                  style={{
                    background: length === opt.value ? 'var(--surface)' : 'transparent',
                    color: length === opt.value ? 'var(--foreground)' : 'var(--foreground-muted)',
                    fontWeight: length === opt.value ? 500 : 400,
                    boxShadow: length === opt.value ? 'var(--shadow-sm)' : 'none',
                    border: length === opt.value ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  <div>{opt.label}</div>
                  <div className="text-xs opacity-60 mt-0.5">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSummarize}
            disabled={loading || wordCount < 50}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Summarizing...
              </>
            ) : (
              'Generate summary'
            )}
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Output column */}
        <div
          className="result-panel"
          style={{ border: '1px solid var(--border)' }}
        >
          {summary ? (
            <div className="flex flex-col h-full p-5 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Summary
                </span>
                <button
                  onClick={handleCopy}
                  className="btn btn-ghost text-xs px-3 py-1.5"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="divider" style={{ margin: '0' }} />
              <p
                className="text-sm leading-relaxed flex-grow overflow-auto"
                style={{ color: 'var(--foreground)' }}
              >
                {summary}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 p-8 text-center">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
                  Summary will appear here
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                  Enter text and click Generate
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
