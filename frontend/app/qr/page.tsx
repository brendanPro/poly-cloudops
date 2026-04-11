'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function QRPage() {
  const [data, setData] = useState('');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!data.trim()) {
      setError('Enter text or a URL to encode.');
      return;
    }
    setLoading(true);
    setError(null);
    setImageSrc('');

    try {
      const resp = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Failed to generate QR code');
      setImageSrc(json.image || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="section-label mb-2">Automation</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          QR Code Generator
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Encode any text or URL into a QR code image, generated via n8n.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Input */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
              Content to encode
            </label>
            <textarea
              className="input"
              rows={6}
              value={data}
              onChange={(e) => setData(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com or any text..."
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--foreground-subtle)' }}>
              Press Enter to generate
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || !data.trim()}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate QR code'
            )}
          </button>

          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Preview */}
        <div
          className="result-panel items-center justify-center"
          style={{ minHeight: '16rem', border: '1px solid var(--border)' }}
        >
          {imageSrc ? (
            <div className="flex flex-col items-center gap-4 p-6">
              <Image
                src={imageSrc}
                alt="Generated QR code"
                width={220}
                height={220}
                className="rounded-lg"
                style={{ imageRendering: 'pixelated' }}
              />
              <a
                href={imageSrc}
                download="qrcode.png"
                className="btn btn-ghost text-sm"
              >
                Download
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 p-8 text-center">
              <div>
                <svg
                  className="w-12 h-12 mx-auto mb-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  style={{ color: 'var(--border)' }}
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3z" />
                  <path d="M17 17h4M21 14v3M14 21h7" />
                </svg>
                <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
                  QR code preview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
