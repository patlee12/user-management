'use client';
import { Suspense } from 'react';
import VerifyMfaClient from './verify-mfa-client';

export default function VerifyMfaPage() {
  return (
    <Suspense>
      <VerifyMfaClient />
    </Suspense>
  );
}
