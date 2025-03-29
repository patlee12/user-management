'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
// import ThemeToggle from '@/components/ui/themeToggle';
import { ShieldCheck } from 'lucide-react';
// import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full min-h-[64px] border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg shadow-md">
      {/* <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          viewBox="0 0 1024 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-10 dark:opacity-20"
        >
          <circle cx="512" cy="512" r="512" fill="url(#gradient)" />
          <defs>
            <radialGradient
              id="gradient"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(512 512) rotate(90) scale(512)"
            >
              <stop stopColor="#F7931A" />
              <stop offset="1" stopColor="#F7931A" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div> */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center animate-fade-in-up">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-8 w-8 text-zinc-900 dark:text-white animate-bounce-slow" />
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            User Management
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            title="Toggle theme"
          >
            <ThemeToggle />
          </motion.div> */}

          {pathname != '/login' && (
            <Link href="/login">
              <Button className="px-6 py-2.5 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 bg-zinc-700 text-white hover:bg-zinc-600">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
