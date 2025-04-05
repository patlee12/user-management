'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOutIcon, ShieldCheck, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, hasMounted, logout } = useAuthStore();

  const isAuthPage = pathname === '/login' || pathname === '/logout';

  const handleLogout = async () => {
    await logout();
    router.push('/logout');
  };

  const buttons = [
    {
      label: 'Profile',
      icon: User,
      onClick: () => {
        router.push('/profile');
      },
    },
    {
      label: 'Logout',
      icon: LogOutIcon,
      onClick: handleLogout,
    },
  ];

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
          {hasMounted && !isAuthPage ? (
            user ? (
              <div className="flex items-center gap-3">
                {buttons.map((btn, index) => {
                  const IconComponent = btn.icon;
                  return (
                    <Tooltip.Provider key={index}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            onClick={btn.onClick}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition duration-200 shadow-md"
                            aria-label={btn.label}
                          >
                            <IconComponent className="w-5 h-5" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="bottom"
                            className="bg-zinc-800 text-white text-xs rounded px-2 py-1 shadow-sm z-50"
                          >
                            {btn.label}
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  );
                })}
              </div>
            ) : (
              <Link href="/login">
                <Button className="px-6 py-2.5 text-base font-semibold rounded-lg shadow-md transition duration-200 bg-zinc-700 text-white hover:bg-zinc-600">
                  Login
                </Button>
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
