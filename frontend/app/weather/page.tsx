'use client';

import { useState } from 'react';

const weatherDescriptions: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

type WeatherData = {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  weatherCode: number;
  unit: string;
  timezone: string;
};

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);

  const handleFetch = async () => {
    if (!city.trim()) {
      setError('Enter a city name.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resp = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Weather fetch failed');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <p className="section-label mb-2">Automation — Open-Meteo</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Weather Forecast
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Get current weather for any city using Open-Meteo via n8n.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          placeholder="City name — e.g. Paris, Tokyo, New York"
        />
        <button
          className="btn btn-primary"
          onClick={handleFetch}
          disabled={loading || !city.trim()}
          style={{ flexShrink: 0 }}
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {error && <div className="error-box mb-6">{error}</div>}

      {data && (
        <div className="animate-fade-in card p-6">
          {/* City header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {data.city}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {data.country} — {data.timezone}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
                {data.temperature}{data.unit}
              </p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                {weatherDescriptions[data.weatherCode] ?? data.description}
              </p>
            </div>
          </div>

          <div className="divider" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-lg p-4"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--foreground-subtle)' }}>
                Humidity
              </p>
              <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                {data.humidity}%
              </p>
            </div>
            <div
              className="rounded-lg p-4"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--foreground-subtle)' }}>
                Wind
              </p>
              <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                {data.windSpeed} km/h
              </p>
            </div>
          </div>

          <p className="text-xs mt-4" style={{ color: 'var(--foreground-subtle)' }}>
            Source: Open-Meteo
          </p>
        </div>
      )}
    </div>
  );
}
