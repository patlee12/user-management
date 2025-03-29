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
    <nav className="w-full flex justify-center gap-8 py-4 border-t border-border">
      {navLinks.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={`flex items-center gap-2 text-sm sm:text-base font-medium transition-colors border-b-2 pb-1 hover:border-accent hover:text-accent-foreground ${
            pathname === href
              ? 'text-accent-foreground border-accent'
              : 'text-muted-foreground border-transparent'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
