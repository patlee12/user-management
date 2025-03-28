import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 text-white py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          viewBox="0 0 1024 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-20 blur-2xl"
        >
          <circle cx="512" cy="512" r="512" fill="url(#hero-gradient)" />
          <defs>
            <radialGradient
              id="hero-gradient"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(512 512) rotate(90) scale(512)"
            >
              <stop stopColor="#F7931A" />
              <stop offset="1" stopColor="#F7931A" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white animate-fade-in-up">
          Build Modern Web Apps With Security
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-300 max-w-2xl mx-auto animate-fade-in-up">
          This is a monorepo that provides a full-stack application boilerplate
          with separate applications for the backend and frontend. The backend
          is built using Nest.js, while the frontend so far has a Homepage
          Application that is built using Next.js. This project also includes
          Docker configurations for local development and production
          environments, including Avahi for service discovery and Nginx as a
          reverse proxy.
        </p>
        <div className="mt-10 flex justify-center gap-x-6 animate-fade-in-up">
          <Link href="/login">
            <Button className="text-base px-6 py-3 font-medium rounded-xl shadow hover:shadow-xl">
              Get Started
            </Button>
          </Link>
          <Link
            target="_blank"
            href="https://github.com/patlee12/user-management/blob/main/README.md"
          >
            <Button className="px-6 py-2.5 text-base font-semibold rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">
              View Documentation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
