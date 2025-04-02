'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmailToken } from '@/app/services/accountRequestService';
import { VerifyAccountRequestDto } from '@user-management/types';
import VerificationResultWrapper from '@/components/ui/wrappers/verification-result-wrapper';

export default function VerifyEmailClient() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  );
  const searchParams = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const verifyAccountRequestDto: VerifyAccountRequestDto = {
    email,
    providedToken: token,
  };

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    verifyEmailToken(verifyAccountRequestDto)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <VerificationResultWrapper
      email={email}
      status={status}
      successTitle="Email Verified"
      successDescription="Your email has been verified."
      errorTitle="Verification Failed"
      errorDescription="The verification link is invalid or has expired."
      verifyingMessage="Verifying your email..."
      primaryAction={{
        label: 'Go to Login',
        href: '/login',
      }}
      secondaryAction={{
        label: 'Request Again',
        href: '/account-requests',
      }}
    />
  );
}
