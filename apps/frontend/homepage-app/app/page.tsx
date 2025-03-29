'use client';

import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <CanvasBackground />

      <section className="group relative isolate overflow-hidden bg-zinc-950 text-white py-24 sm:py-32 w-screen transition-transform duration-200">
        {/* White border */}
        <div className="absolute inset-0 rounded-2xl border-[3px] border-white/25 z-0 pointer-events-none" />

        {/* Shake animation on hover */}
        <style jsx>{`
          .group:hover .shake-wrapper {
            animation: shake 0.3s ease-in-out;
          }

          @keyframes shake {
            0% {
              transform: translate(0px, 0px) rotate(0deg);
            }
            20% {
              transform: translate(-2px, 1px) rotate(-0.5deg);
            }
            40% {
              transform: translate(2px, -1px) rotate(0.5deg);
            }
            60% {
              transform: translate(-1px, 1px) rotate(0deg);
            }
            80% {
              transform: translate(1px, -1px) rotate(0.5deg);
            }
            100% {
              transform: translate(0px, 0px) rotate(0deg);
            }
          }
        `}</style>

        <div className="shake-wrapper relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
            Build Modern Web Apps With Security
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-300 max-w-2xl mx-auto">
            This is a monorepo that provides a full-stack application
            boilerplate with separate applications for the backend and frontend.
            The backend is built using Nest.js, while the frontend so far has a
            Homepage Application that is built using Next.js. This project also
            includes Docker configurations for local development and production
            environments, including Avahi for service discovery and Nginx as a
            reverse proxy.
          </p>

          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/login">
              <Button className="text-base px-6 py-3 font-medium rounded-xl shadow hover:shadow-xl transition-all transform hover:-translate-y-1">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
