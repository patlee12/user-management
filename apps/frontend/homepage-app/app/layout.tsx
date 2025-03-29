import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/layout/header';
import HeroSection from '@/components/layout/heroSection';
import Footer from '@/components/layout/footer';

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
            <Header />

            <HeroSection />
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
