'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/buttons/button';
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
      onClick: () => router.push('/profile'),
    },
    {
      label: 'Logout',
      icon: LogOutIcon,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full min-h-[64px] border-b border-white/10 bg-black/60 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center animate-fade-in-up">
        <div className="flex items-center gap-4">
          <ShieldCheck className="h-8 w-8 text-white animate-bounce-slow" />
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            User Management
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {hasMounted && !isAuthPage ? (
            user ? (
              <div className="flex items-center gap-3">
                {buttons.map((btn, index) => {
                  const Icon = btn.icon;
                  return (
                    <Tooltip.Provider key={index}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <Button
                            onClick={btn.onClick}
                            variant="ghost"
                            className="w-10 h-10 p-0 rounded-full"
                            aria-label={btn.label}
                          >
                            <Icon className="w-5 h-5" />
                          </Button>
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
                <Button variant="primary">Login</Button>
              </Link>
            )
          ) : null}
        </div>
      </div>
    </header>
  );
}
