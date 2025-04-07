'use client';

import { Suspense } from 'react';
import PasswordResetClient from './password-reset-client';

export default function PasswordResetPage() {
  return (
    <Suspense>
      <PasswordResetClient />
    </Suspense>
  );
}
