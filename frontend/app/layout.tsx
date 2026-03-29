import { Inter } from 'next/font/google';
import TopNavbar from '@/app/ui/TopNavbar';
import './ui/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Poly CloudOps - Workflow Automation Hub",
  description: "Cloud native automation with n8n workflows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <TopNavbar />
        <main className="flex-grow">{children}</main>
        <footer className="bg-gray-900 text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm opacity-75">© 2026 Polytech Angers</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
