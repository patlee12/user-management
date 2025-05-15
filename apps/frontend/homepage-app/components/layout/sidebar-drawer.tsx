'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { XIcon } from 'lucide-react';
import { Fragment } from 'react';

interface SidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SidebarDrawer({ open, onClose }: SidebarDrawerProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push('/logout');
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
        </TransitionChild>

        <TransitionChild
          as={Fragment}
          enter="transition-transform duration-300 ease-out"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition-transform duration-200 ease-in"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <div className="fixed glow-box border-[3px] inset-y-0 left-0 w-64 bg-zinc-900 p-6 flex flex-col space-y-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-3">
              <Link
                href="/user/account/profile"
                onClick={onClose}
                className="block text-zinc-200 hover:text-white"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-400 hover:text-red-300 mt-4"
              >
                Logout
              </button>
            </nav>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
