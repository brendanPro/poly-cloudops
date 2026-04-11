import { Inter } from 'next/font/google';
import TopNavbar from '@/app/ui/TopNavbar';
import './ui/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Poly-CloudOps — Workflow Automation Hub',
  description: 'Cloud-native workflow automation with n8n on GCP.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <TopNavbar />
        <main className="flex-grow">{children}</main>
        <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between"
          >
            <span className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
              Poly-CloudOps — Polytech Angers
            </span>
            <span className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
              2026
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
