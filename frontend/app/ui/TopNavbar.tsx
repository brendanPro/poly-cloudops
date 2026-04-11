'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TopNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: 'rgba(15, 23, 42, 0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-white font-semibold text-base hover:opacity-80 transition-opacity"
          >
            <span
              className="inline-flex items-center justify-center w-7 h-7 rounded-md text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}
            >
              P
            </span>
            Poly-CloudOps
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-md transition-colors hover:bg-white/10"
            >
              Home
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-300 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(15, 23, 42, 0.97)' }}>
          <div className="px-4 py-3">
            <Link
              href="/"
              className="block text-sm text-slate-300 hover:text-white py-2 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
