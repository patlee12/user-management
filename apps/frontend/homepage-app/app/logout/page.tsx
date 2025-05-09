'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { logout } from '@/app/services/auth-service';

export default function LogoutPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    const runLogout = async () => {
      try {
        await logout(); // backend clears cookies
        setTimeout(() => {
          window.location.href = '/login';
        }, 3500);
      } catch (err) {
        console.error('Logout failed:', err);
        setError(true);
      }
    };

    runLogout();
  }, []);

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
          {error ? 'Logout Failed' : 'Logged Out'}
        </h1>
        <p className="text-base text-zinc-300 mb-2">
          {error
            ? 'We were unable to log you out. Please try again.'
            : 'You have been successfully logged out.'}
        </p>
        {!error && (
          <p className="text-sm text-zinc-400 italic">
            Redirecting to the login page...
          </p>
        )}
      </motion.div>
    </div>
  );
}
