'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmailToken } from '@/app/services/account-request-service';
import VerificationResultWrapper from '@/components/ui/wrappers/verification-result-wrapper';
import { VerifyAccountRequestDto } from '@user-management/types';

export default function VerifyEmailClient() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  );
  const searchParams = useSearchParams();

  const tokenId = searchParams.get('tokenId') || '';
  const providedToken = searchParams.get('token') || '';

  useEffect(() => {
    if (!tokenId || !providedToken) {
      setStatus('error');
      return;
    }

    const verifyAccountRequestDto: VerifyAccountRequestDto = {
      tokenId,
      providedToken,
    };

    verifyEmailToken(verifyAccountRequestDto)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [tokenId, providedToken]);

  return (
    <VerificationResultWrapper
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
