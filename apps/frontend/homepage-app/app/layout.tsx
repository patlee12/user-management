import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import NavTabs from '@/components/layout/navTabs';
import SessionLoader from '@/components/layout/session-loader';

export const metadata = {
  title: 'User Management',
  description: 'Modern full-stack authentication and management system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-zinc-100 antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionLoader />
          <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-50 bg-black/80 backdrop-saturate-150 border-b border-zinc-800">
              <Header />
              <NavTabs />
            </div>

            <main className="flex-1 px-6 py-8 flex flex-col items-center justify-center">
              {children}
            </main>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
