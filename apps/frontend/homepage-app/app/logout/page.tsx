'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000); // Redirect after 3 seconds
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative h-full flex items-center justify-center overflow-hidden">
      <CanvasBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 px-6 py-10 rounded-2xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/10 text-center max-w-md mx-auto"
      >
        <h1 className="text-4xl font-extrabold mb-4 text-white tracking-tight">
          Logged Out
        </h1>
        <p className="text-base text-zinc-300 mb-2">
          You have been successfully logged out.
        </p>
        <p className="text-sm text-zinc-400 italic">
          Redirecting to the login page in 3 seconds...
        </p>
      </motion.div>
    </div>
  );
}
