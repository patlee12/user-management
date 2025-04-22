'use client';

import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  TerminalSquare,
  Layers3,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

const slides = [
  {
    title: 'Secure by Design',
    icon: ShieldCheck,
    description:
      'Built with JWT, MFA, RBAC, and strong defaults — security is not an afterthought.',
  },
  {
    title: 'Dev Experience First',
    icon: TerminalSquare,
    description:
      'One-command startup. Runtime HTTPS. Preflight checks. No more fragile setup steps.',
  },
  {
    title: 'Full Stack, One Repo',
    icon: Layers3,
    description:
      'Next.js frontend. Nest.js backend. Prisma, Docker, Nginx, and more out of the box.',
  },
];

export default function HomePage() {
  const AUTOPLAY_DELAY = 5000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPaused = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleAutoplay = useCallback(() => {
    clearTimer();
    if (isPaused.current || !emblaApi) return;
    timerRef.current = setTimeout(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_DELAY);
  }, [clearTimer, emblaApi]);

  // On each settle, try to schedule the next slide
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('settle', scheduleAutoplay);
    // kick off initial autoplay
    scheduleAutoplay();
    return () => {
      emblaApi.off('settle', scheduleAutoplay);
      clearTimer();
    };
  }, [emblaApi, scheduleAutoplay, clearTimer]);

  // Pause on hover, resume on leave
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onEnter = () => {
      isPaused.current = true;
      clearTimer();
    };
    const onLeave = () => {
      isPaused.current = false;
      scheduleAutoplay();
    };
    node.addEventListener('mouseenter', onEnter);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [scheduleAutoplay, clearTimer]);

  // Arrow click handlers clear & pause
  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    isPaused.current = true;
    clearTimer();
    emblaApi.scrollPrev();
  }, [emblaApi, clearTimer]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    isPaused.current = true;
    clearTimer();
    emblaApi.scrollNext();
  }, [emblaApi, clearTimer]);

  return (
    <div className="relative w-full h-full bg-black text-white overflow-x-hidden">
      <CanvasBackground />

      <section className="relative isolate py-12 sm:py-24 md:py-32 w-full">
        <div className="absolute inset-0 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-sm z-0 pointer-events-none" />

        <div className="relative z-10 w-full sm:w-4/5 lg:w-3/5 mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100">
            Build Modern Web Apps With Security
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400 max-w-2xl mx-auto">
            This monorepo includes a full‑stack boilerplate with a Next.js
            landing‑page frontend and a Nest.js backend. It also comes
            preconfigured with Docker environments (for both development and
            production), Avahi service discovery, and an Nginx reverse‑proxy.
          </p>
          <div className="mt-16 relative" ref={containerRef}>
            <div className="overflow-hidden sm:px-2 px-1" ref={emblaRef}>
              <div className="flex gap-6">
                {slides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="flex-[0_0_100%] box-border px-6 py-10 bg-black/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl text-center"
                  >
                    <slide.icon className="w-10 h-10 mx-auto text-emerald-400 mb-4" />
                    <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100">
                      {slide.title}
                    </h2>
                    <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto">
                      {slide.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute inset-y-0 left-0 flex items-center pl-6 sm:pl-7">
              <button
                onClick={scrollPrev}
                className="p-2 sm:p-3 rounded-full bg-black/60 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-md transition-transform duration-200 hover:scale-105"
                aria-label="Previous slide"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 sm:pr-7">
              <button
                onClick={scrollNext}
                className="p-2 sm:p-3 rounded-full bg-black/60 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-md transition-transform duration-200 hover:scale-105"
                aria-label="Next slide"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/products">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
