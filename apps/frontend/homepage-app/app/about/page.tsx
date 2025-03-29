'use client';

import { Github } from 'lucide-react';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';

export default function AboutPage() {
  return (
    <div className="relative w-full text-white overflow-x-hidden overflow-y-hidden">
      <CanvasBackground />
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold mb-6">About Us</h2>
          <p className="text-lg text-zinc-300 mb-4">
            We're building secure, modern web applications with a full-stack
            approach that integrates industry-standard tools like Nest.js,
            Next.js, and Docker. This monorepo is built for scale, speed, and
            flexibility in modern dev environments.
          </p>
        </div>

        <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold mb-2">Our Philosophy</h3>
          <ul className="list-disc list-inside text-zinc-400 space-y-2">
            <li>Security-first by design</li>
            <li>Reusable boilerplate for real-world teams</li>
            <li>
              Optimized for local and LAN deployments with Avahi and Nginx
            </li>
            <li>Open source and developer-friendly</li>
          </ul>
        </div>

        <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Github className="w-6 h-6 text-white" />
                <div>
                  <h4 className="text-xl font-semibold">
                    patlee12/user-management
                  </h4>
                  <p className="text-zinc-400 text-sm">
                    A full-stack monorepo for modern user management
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/patlee12/user-management"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
              >
                View on GitHub
              </a>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              This boilerplate includes NestJS, Prisma, Docker, and more for
              building scalable, secure full-stack apps. It’s designed for
              real-world deployment with authentication, RBAC, Swagger, and
              modular structure.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
