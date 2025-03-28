'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const apps = [
  {
    title: 'Swagger API Docs',
    description: 'Explore the full API documentation via Swagger UI.',
    icon: '📘',
    devPath: (host: string) => `http://${host}:3000/api`,
    prodPath: (host: string) => `http://${host}/nestjs/api`,
  },
  {
    title: 'Admin Dashboard',
    description: 'Manage users and roles via AdminJS panel.',
    icon: '🛠️',
    devPath: (host: string) => `http://${host}:3000/admin`,
    prodPath: (host: string) => `http://${host}/nestjs/admin`,
  },
  {
    title: 'Adminer Database Tool',
    description: 'Lightweight database management interface for PostgreSQL.',
    icon: '🗃️',
    devPath: (host: string) => `http://${host}:8081`,
    prodPath: (host: string) => `http://${host}/adminer`,
  },
];

export default function HomePage() {
  const [host, setHost] = useState('localhost');
  const [isDev, setIsDev] = useState(true);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const hostname = window.location.hostname;
    setHost(hostname);
    setIsDev(hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname));
  }, []);

  const setCardRef =
    (idx: number) =>
    (el: HTMLAnchorElement | null): void => {
      cardRefs.current[idx] = el;
    };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto px-6 py-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {apps.map((app, idx) => {
          const href = isDev ? app.devPath(host) : app.prodPath(host);
          return (
            <motion.a
              key={idx}
              ref={setCardRef(idx)}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-2xl shadow-lg border border-border bg-background p-6 flex flex-col justify-between hover:shadow-xl transition-all overflow-hidden"
            >
              <div>
                <div className="text-5xl mb-4">{app.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{app.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {app.description}
                </p>
              </div>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'hsl(var(--accent))',
                  color: 'hsl(var(--accent-foreground))',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mt-6 w-fit self-end gap-1 inline-flex items-center border rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                Open <ArrowRight className="ml-2 w-4 h-4" />
              </motion.button>
            </motion.a>
          );
        })}
      </div>
    </ScrollArea>
  );
}
