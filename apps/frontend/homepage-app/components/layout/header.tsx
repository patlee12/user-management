'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, hasMounted, logout } = useAuthStore();

  const isAuthPage = pathname === '/login' || pathname === '/logout';

  const handleLogout = async () => {
    await logout();
    router.push('/logout');
  };

  return (
    <header className="sticky top-0 z-50 w-full min-h-[64px] border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center animate-fade-in-up">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-8 w-8 text-zinc-900 dark:text-white animate-bounce-slow" />
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            User Management
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {hasMounted &&
            !isAuthPage &&
            (user ? (
              <Button
                onClick={handleLogout}
                className="px-6 py-2.5 text-base font-semibold rounded-lg shadow-md transition duration-200 bg-red-600 text-white hover:bg-red-500"
              >
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button className="px-6 py-2.5 text-base font-semibold rounded-lg shadow-md transition duration-200 bg-zinc-700 text-white hover:bg-zinc-600">
                  Login
                </Button>
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}
