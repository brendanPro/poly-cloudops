'use client';

import { useState } from 'react';

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
];

type Result = {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  date: string;
};

export default function CurrencyPage() {
  const [amount, setAmount] = useState('100');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const handleConvert = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch('/api/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num, from, to }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Conversion failed');
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="section-label mb-2">Data — ExchangeRate-API</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Currency Converter
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Convert between currencies using live exchange rates via n8n.
        </p>
      </div>

      <div className="card p-6 max-w-lg">
        {/* Amount */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
            Amount
          </label>
          <input
            type="number"
            className="input text-2xl font-semibold"
            value={amount}
            min="0"
            step="0.01"
            onChange={(e) => { setAmount(e.target.value); setResult(null); }}
            onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
          />
        </div>

        {/* Currency selectors */}
        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1">
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
              From
            </label>
            <select
              className="input"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setResult(null); }}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            className="btn btn-ghost mb-0"
            style={{ padding: '0.625rem', flexShrink: 0 }}
            title="Swap currencies"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>

          <div className="flex-1">
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--foreground)' }}>
              To
            </label>
            <select
              className="input"
              value={to}
              onChange={(e) => { setTo(e.target.value); setResult(null); }}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleConvert}
          disabled={loading}
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
            'Convert'
          )}
        </button>

        {error && <div className="error-box mt-4">{error}</div>}

        {result && (
          <div
            className="mt-5 rounded-xl p-5 animate-fade-in"
            style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--foreground-subtle)' }}>
              {result.amount} {result.from} =
            </p>
            <p className="text-4xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
              {result.convertedAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-2xl">{result.to}</span>
            </p>
            <div className="divider" />
            <div className="flex justify-between text-sm" style={{ color: 'var(--foreground-muted)' }}>
              <span>1 {result.from} = {result.rate} {result.to}</span>
              <span>{result.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
