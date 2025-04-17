'use client';

import { Github } from 'lucide-react';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const cards = [
    {
      title: 'About Us',
      content: `We're building secure, modern web applications with a full-stack approach using Nest.js, Next.js, Docker, and Nginx. This monorepo is optimized for scalability, performance, and deployment automation across local, LAN, and public HTTPS environments.`,
    },
    {
      title: 'Our Philosophy',
      list: [
        'Security-first by design',
        'Reusable boilerplate for teams and startups',
        'Seamless deployment via LAN (Avahi) and production (Nginx)',
        'Open-source and developer-friendly',
      ],
    },
    {
      title: 'Production Automation',
      list: [
        'Automated HTTPS via Let’s Encrypt or manual certs',
        'Self-signed fallback with Nginx auto-reload',
        'Dynamic `.env` generation with secret validation',
        'One-command deploy for any environment',
        'Service discovery over LAN via Avahi',
      ],
    },
    {
      title: 'Developer Experience',
      list: [
        'One-command dev startup (backend, frontend, browser)',
        'Runtime-configurable HTTPS builds',
        'Smart prompts for Postgres reset and secrets',
        'OpenSSL-secured credential generation',
        'Scripted cert management and readiness checks',
      ],
    },
  ];

  return (
    <div className="relative w-full h-full bg-black text-white overflow-x-hidden">
      <CanvasBackground />

      <section className="relative isolate w-full py-8">
        <div className="absolute top-0 left-0 right-0 bottom-0 rounded-2xl border-[3px] border-zinc-800 bg-zinc-950/70 backdrop-blur-sm z-0 pointer-events-none h-full" />

        <div className="relative z-10 max-w-6xl mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 mb-12">
            About This Project
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map(({ title, content, list }, idx) => (
              <Card
                key={idx}
                className="bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md text-left p-4"
              >
                <CardHeader>
                  <CardTitle className="text-zinc-100 text-xl tracking-tight">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {content && (
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {content}
                    </p>
                  )}
                  {list && (
                    <ul className="list-disc pl-4 mt-2 space-y-1 text-sm text-zinc-300 leading-relaxed">
                      {list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center pt-16">
            <Card className="bg-zinc-950/80 border border-zinc-800 shadow-xl backdrop-blur-md text-center max-w-xl p-4">
              <CardHeader>
                <CardTitle className="text-white">Project Repository</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="https://github.com/patlee12/user-management"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-md text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  <Github className="w-5 h-5" />
                  <span>patlee12/user-management</span>
                </a>
                <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
                  A full-stack monorepo with NestJS, NextJS, Prisma, Docker,
                  RBAC, and production automation — built for security,
                  scalability, and fast iteration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
