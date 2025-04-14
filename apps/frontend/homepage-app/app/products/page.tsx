'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';

const apps = [
  {
    key: 'swagger',
    title: 'Swagger API Docs',
    description: 'Explore the full API documentation via Swagger UI.',
    icon: '📘',
    getPath: (env: string, host: string) => {
      if (env === 'lan-prod') return `http://${host}/nestjs/api`;
      if (env === 'production') return `https://swagger.${host}`;
      return `http://${host}:3001/api`;
    },
  },
  {
    key: 'adminjs',
    title: 'Admin Dashboard',
    description: 'Manage users and roles via AdminJS panel.',
    icon: '🛠️',
    getPath: (env: string, host: string) => {
      if (env === 'lan-prod') return `http://${host}/nestjs/admin`;
      if (env === 'production') return `https://admin.${host}`;
      return `http://${host}:3001/admin`;
    },
  },
  {
    key: 'adminer',
    title: 'Adminer Database Tool',
    description: 'Lightweight database management interface for PostgreSQL.',
    icon: '🗃️',
    getPath: (env: string, host: string) => {
      if (env === 'lan-prod') return `http://${host}/adminer`;
      if (env === 'production') return `http://adminer.${host}`;
      return `http://${host}:8081`;
    },
  },
];

const hiddenAppsInProd = ['adminer'];

export default function ProductsPage() {
  const [host, setHost] = useState('localhost');
  const [env, setEnv] = useState<'development' | 'lan-prod' | 'production'>(
    'development',
  );
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const hostname = window.location.hostname;
    setHost(hostname);

    const isDev =
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('192.168.');

    const isLanProd = hostname.endsWith('.local');

    if (isDev) setEnv('development');
    else if (isLanProd) setEnv('lan-prod');
    else setEnv('production');
  }, []);

  const setCardRef =
    (idx: number) =>
    (el: HTMLAnchorElement | null): void => {
      cardRefs.current[idx] = el;
    };

  const visibleApps =
    env === 'production'
      ? apps.filter((app) => !hiddenAppsInProd.includes(app.key))
      : apps;

  const gridCols =
    visibleApps.length === 1
      ? 'grid-cols-1'
      : visibleApps.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <CanvasBackground />
      <ScrollArea className="h-full w-full">
        <div className="flex items-center justify-center h-full">
          <div
            className={`grid ${gridCols} gap-8 px-6 py-16 w-full max-w-5xl justify-center`}
          >
            {visibleApps.map((app, idx) => {
              const href = app.getPath(env, host);
              return (
                <motion.a
                  key={app.key}
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
        </div>
      </ScrollArea>
    </div>
  );
}
