'use client';

import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
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
  const autoplay = useRef(Autoplay({ delay: 7000, stopOnInteraction: true }));
  const pauseTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMouseOver = useRef(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [autoplay.current],
  );

  const pauseAutoplayFor = (ms: number) => {
    autoplay.current.stop();
    if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    pauseTimeout.current = setTimeout(() => {
      if (!isMouseOver.current) {
        autoplay.current.play();
      }
    }, ms);
  };

  const scrollPrev = useCallback(() => {
    pauseAutoplayFor(10000);
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    pauseAutoplayFor(10000);
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const carouselContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = carouselContainerRef.current;
    if (!node) return;

    const handleMouseEnter = () => {
      isMouseOver.current = true;
      autoplay.current.stop();
      if (pauseTimeout.current) clearTimeout(pauseTimeout.current);
    };

    const handleMouseLeave = () => {
      isMouseOver.current = false;
      pauseAutoplayFor(5000);
    };

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(0);
  }, [emblaApi]);

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
            This is a monorepo that provides a full-stack application
            boilerplate with separate applications for the backend and frontend.
            The backend is built using Nest.js, while the frontend so far has a
            Homepage Application that is built using Next.js. This project also
            includes Docker configurations for local development and production
            environments, including Avahi for service discovery and Nginx as a
            reverse proxy.
          </p>

          <div className="mt-16 relative" ref={carouselContainerRef}>
            <div className="overflow-hidden sm:px-2 px-1" ref={emblaRef}>
              <div className="flex gap-6">
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] max-w-full box-border px-6 py-10 bg-black/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl transition-all duration-300 text-center"
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
