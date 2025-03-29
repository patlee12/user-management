import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import NavTabs from '@/components/layout/navTabs';

export const metadata = {
  title: 'User Management',
  description: 'Modern full-stack authentication and management system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex flex-col min-h-screen">
            <div className="sticky top-0 z-50 bg-background/90 backdrop-saturate-150 border-b border-border">
              <Header />
              <NavTabs />
            </div>

            {/* Center page content with padding */}
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
