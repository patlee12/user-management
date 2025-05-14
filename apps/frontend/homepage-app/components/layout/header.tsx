'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/buttons/button';
import { MenuIcon, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useState } from 'react';
import SidebarDrawer from './sidebar-drawer';

export default function Header() {
  const pathname = usePathname();
  const { user, hasMounted } = useAuthStore();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/logout';

  return (
    <header className="sticky glow-box top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 animate-fade-in-up overflow-hidden">
        <div className="flex items-center min-w-0">
          {hasMounted && !isAuthPage && user && (
            <>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      className="w-10 h-10 p-0 rounded-full"
                      onClick={() => setDrawerOpen(true)}
                      aria-label="Menu"
                    >
                      <MenuIcon className="w-6 h-6" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="bottom"
                      className="bg-zinc-800 text-white text-xs rounded px-2 py-1 shadow-sm z-50"
                    >
                      Menu
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>

              <SidebarDrawer
                open={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
              />
            </>
          )}
        </div>

        <div className="flex items-center justify-center flex-1 min-w-0 gap-2 truncate">
          <ShieldCheck className="h-7 w-7 text-white animate-bounce-slow shrink-0" />
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
            User Management
          </h1>
        </div>

        <div className="flex items-center justify-end min-w-0">
          {hasMounted && !isAuthPage && !user && (
            <Link href="/login">
              <Button variant="primary" className="whitespace-nowrap">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
