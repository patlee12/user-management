'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * This component is a client-only effect that initializes the auth store
 * as soon as the app loads on the client. It helps prevent hydration mismatches
 * between SSR and client renders by making sure we know whether a user session
 * exists as early as possible.
 */
export default function SessionLoader() {
  const { initialize, loadUser, markMounted } = useAuthStore((state) => state);

  useEffect(() => {
    markMounted();
    const hasSessionCookie = document.cookie
      .split('; ')
      .some((cookie) => cookie.startsWith('public_session='));

    if (hasSessionCookie) {
      loadUser();
    } else {
      initialize();
    }
  }, [initialize, loadUser, markMounted]);

  return null;
}
