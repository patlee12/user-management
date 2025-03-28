// frontend/homepage-app/app/page.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HomePage() {
  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto px-6 py-12 text-gray-900 dark:text-gray-100">
        <Card className="bg-background border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              User Management Monorepo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-2">
                Goals of the Project
              </h2>
              <p className="mb-4">
                This monorepo is focused on providing boilerplate code for a
                full stack application that requires having a user management
                system with features such as:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  User login, account creation requests, email verification, and
                  password recovery.
                </li>
                <li>
                  JWT-based authentication, multi-factor authentication (MFA),
                  and role-based authorization.
                </li>
                <li>
                  An Admin Panel powered by Admin.js for managing users and
                  roles.
                </li>
                <li>
                  Integration with Nginx (as a reverse proxy) and Avahi (for
                  mDNS-based service discovery) to enable seamless operation in
                  local area network setups.
                </li>
              </ul>
              <p className="mt-4">
                The application is designed to be easily extendable and
                adaptable, as well as allowing you to pivot to a microservices
                architecture if needed.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-2">
                Monorepo Structure
              </h2>
              <p className="mb-4">
                This project is structured as a monorepo, where both the
                frontend and backend applications and services live in separate
                folders, but share dependencies and configurations.
              </p>
              <h3 className="text-xl font-medium mb-1">Workspaces:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <code>apps/backend</code>: Contains the backend application,
                  built with Nest.js.
                </li>
                <li>
                  <code>apps/frontend</code>: Contains the frontend application,
                  built with Next.js.
                </li>
                <li>
                  <code>docker</code>: Contains all Docker-related files and
                  configurations.
                </li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-2xl font-semibold mb-2">Setup</h2>
              <h3 className="text-xl font-medium mb-1">Prerequisites</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Node v22.13.1</li>
                <li>Yarn v1.22.22</li>
                <li>Docker</li>
              </ul>
              <h3 className="text-xl font-medium mt-4 mb-1">
                Create .env Files
              </h3>
              <p className="mb-4">
                This project uses three <code>.env</code> files. If you need a
                template, look for the <code>.env.template</code> file in each
                of the three workspaces:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Docker .env</strong>: Contains shared environment
                  variables used across the entire monorepo.
                </li>
                <li>
                  <strong>Frontend .env</strong>: Contains environment variables
                  specific to the frontend (Next.js).
                </li>
                <li>
                  <strong>Backend .env</strong>: Contains environment variables
                  specific to the backend (Nest.js).
                </li>
              </ul>
              <p className="mt-4">
                Each file has a specific role in the project, and each should be
                placed in the appropriate directory.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
