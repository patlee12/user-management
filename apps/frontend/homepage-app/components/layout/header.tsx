'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/buttons/button';
import { MenuIcon, ShieldCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useState } from 'react';
import SidebarDrawer from './sidebar-drawer';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const { user, profile, hasMounted } = useAuthStore();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const isAuthPage = pathname === '/login' || pathname === '/logout';

  return (
    <header className="sticky glow-box top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 animate-fade-in-up overflow-hidden">
        <div className="flex items-center min-w-[40px] flex-shrink-0">
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

        <div className="flex items-center justify-end min-w-[40px] flex-shrink-0">
          <div className="flex items-center justify-end">
            <Link href="/login">
              <Button
                variant="primary"
                visible={hasMounted && !isAuthPage && !user}
                className="whitespace-nowrap px-4 py-2"
              >
                Login
              </Button>
            </Link>
          </div>

          {hasMounted && profile && (
            <Link href="/user/account/profile">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="w-10 h-10 relative rounded-full overflow-hidden border border-white/20 hover:scale-105 transition-transform bg-white">
                      {profile.avatarUrl &&
                      !profile.avatarUrl.startsWith('/') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profile.avatarUrl}
                          alt="Profile"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Image
                          src={
                            profile.avatarUrl || '/images/defaultProfile.svg'
                          }
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="bottom"
                      className="bg-zinc-800 text-white text-xs rounded px-2 py-1 shadow-sm z-50"
                    >
                      Profile
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
