'use client';

import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType } from 'embla-carousel';
import { Button } from './button';

type CarouselProps = {
  options?: EmblaOptionsType;
  className?: string;
  children: ReactNode[];
};

export function Carousel({ options, className = '', children }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!emblaApi) return;
      if (
        document.activeElement &&
        !containerRef.current?.contains(document.activeElement)
      )
        return;

      if (event.key === 'ArrowLeft') emblaApi.scrollPrev();
      if (event.key === 'ArrowRight') emblaApi.scrollNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      tabIndex={0}
      aria-label="Carousel"
    >
      <div className="relative" ref={emblaRef}>
        <CarouselContent>{children}</CarouselContent>
        <CarouselPrevious onClick={scrollPrev} />
        <CarouselNext onClick={scrollNext} />
      </div>

      <div className="flex justify-center mt-6 gap-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
              index === selectedIndex
                ? 'bg-white scale-125 opacity-100'
                : 'bg-zinc-500 opacity-70 hover:scale-110 hover:bg-zinc-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function CarouselContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex transition-transform ease-in-out will-change-transform">
      {children}
    </div>
  );
}

export function CarouselItem({ children }: { children: ReactNode }) {
  return <div className="min-w-full flex-[0_0_100%]">{children}</div>;
}

export function CarouselPrevious({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
      onClick={onClick}
    >
      ‹
    </Button>
  );
}

export function CarouselNext({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
      onClick={onClick}
    >
      ›
    </Button>
  );
}
