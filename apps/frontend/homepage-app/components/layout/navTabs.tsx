'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Package } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'About Us', href: '/about', icon: Info },
  { label: 'Products', href: '/products', icon: Package },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="w-full px-4 sm:px-6 bg-black/60 backdrop-blur-md shadow-inner">
      <div className="w-full flex justify-center gap-6 sm:gap-10 py-4">
        {navLinks.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`
                flex items-center gap-2 text-sm sm:text-base font-medium transition-all pb-1 border-b-2
                ${
                  isActive
                    ? 'text-zinc-100 border-white/80'
                    : 'text-zinc-400 border-transparent hover:text-white hover:border-white/40'
                }
              `}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
