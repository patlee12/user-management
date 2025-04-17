'use client';

import { Carousel, CarouselItem } from '@/components/ui/carousel';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { Github } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="relative w-full text-white overflow-x-hidden overflow-y-hidden">
      <CanvasBackground />

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <Carousel>
          <CarouselItem>
            <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-8 h-full">
              <h2 className="text-3xl font-bold mb-6">About Us</h2>
              <p className="text-lg text-zinc-300">
                We're building secure, modern web applications with a full-stack
                approach that integrates Nest.js, Next.js, Docker, and Nginx.
                This monorepo is engineered for scalability, performance, and
                automation across local, LAN, and public HTTPS deployments.
              </p>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-8 h-full">
              <h3 className="text-2xl font-semibold mb-2">Our Philosophy</h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>Security-first by design</li>
                <li>
                  Reusable boilerplate for any team or business looking to start
                  a secure web application quickly
                </li>
                <li>
                  Seamless deployment to LAN with Avahi and production
                  environments using reverse proxying via Nginx
                </li>
                <li>Open-source and developer friendly</li>
              </ul>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-8 h-full">
              <h3 className="text-2xl font-semibold mb-2">
                Production Automation
              </h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>
                  Automated HTTPS with Let's Encrypt or manual certificate
                  support
                </li>
                <li>
                  Self-signed fallback with automatic Nginx reload after cert
                  issuance
                </li>
                <li>
                  Dynamic environment generation with full variable
                  interpolation and secret validation
                </li>
                <li>
                  One-command deploy for LAN, staging, or domain environments
                </li>
                <li>Service discovery via Avahi for local networks</li>
              </ul>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-8 h-full">
              <h3 className="text-2xl font-semibold mb-2">
                Developer Experience
              </h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>
                  One command dev startup with backend, frontend, and automatic
                  browser launch
                </li>
                <li>Runtime configurable HTTPS builds in all environments</li>
                <li>
                  Smart prompts for resetting Postgres and managing secrets
                </li>
                <li>OpenSSL based secure password and secret generation</li>
                <li>
                  Script-driven certificate management supporting Let's Encrypt,
                  self-signed fallback, or manual certs
                </li>
                <li>
                  Automated readiness checks and modular preflight validation
                </li>
              </ul>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="bg-zinc-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-xl p-6 h-full flex flex-col justify-center">
              <div className="text-center bg-zinc-900 p-6 rounded-xl border border-zinc-700 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <a
                    href="https://github.com/patlee12/user-management"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                  >
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
                  </a>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Includes Nest.js, Next.js, Prisma, Docker, JWT auth, RBAC,
                  Swagger, and smart deployment scripts. Designed for real-world
                  teams who need a rapid launch with long-term maintainability.
                </p>
              </div>
            </div>
          </CarouselItem>
        </Carousel>
      </section>
    </div>
  );
}
