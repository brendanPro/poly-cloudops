'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function QRPage() {
  const [data, setData] = useState('https://poly-cloudops.dev');
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!data.trim()) {
      setError('Please provide text or a URL to encode.');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <header>
        <p className="text-sm uppercase font-semibold tracking-widest text-accent-500">
          Automation
        </p>
        <h1 className="text-4xl font-bold mt-2 mb-4">QR Code Generator</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Send any text or URL to the n8n workflow to get a QR code instantly.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Data to encode
          </label>
          <textarea
            className="w-full p-4 border rounded-2xl bg-white/80 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={6}
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="https://... or any text"
          />
          <button
            className="w-full py-3 px-6 rounded-2xl text-white font-semibold text-center bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 hover:opacity-90 transition disabled:opacity-60"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating…' : 'Generate QR Code'}
          </button>

          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-xl">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 bg-white/60 dark:bg-gray-900/30 min-h-[320px]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt="Generated QR code"
              width={224}
              height={224}
              className="w-56 h-56 object-contain"
            />
          ) : (
            <p className="text-gray-500 text-center">
              QR preview will appear here after you trigger the workflow.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
