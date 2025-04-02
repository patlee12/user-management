// components/ui/wrappers/VerificationResultWrapper.tsx
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface VerificationResultWrapperProps {
  email?: string;
  status: 'verifying' | 'success' | 'error';
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
  verifyingMessage: string;
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export default function VerificationResultWrapper({
  email,
  status,
  successTitle,
  successDescription,
  errorTitle,
  errorDescription,
  verifyingMessage,
  primaryAction,
  secondaryAction,
}: VerificationResultWrapperProps) {
  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />
      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in text-center space-y-6">
        {status === 'verifying' && (
          <>
            <Loader2 className="animate-spin w-10 h-10 mx-auto text-orange-400" />
            <h2 className="text-3xl font-bold">{verifyingMessage}</h2>
            <p className="text-zinc-300">
              Please wait while we verify your request.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="text-green-500 w-10 h-10 mx-auto" />
            <h2 className="text-3xl font-bold">{successTitle}</h2>
            <p className="text-zinc-300">
              {successDescription}{' '}
              {email && <span className="font-medium text-white">{email}</span>}
            </p>
            <Link href={primaryAction.href} className="block">
              <Button className="w-full mt-4">{primaryAction.label}</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="text-red-500 w-10 h-10 mx-auto" />
            <h2 className="text-3xl font-bold">{errorTitle}</h2>
            <p className="text-zinc-300">{errorDescription}</p>
            {secondaryAction && (
              <Link href={secondaryAction.href} className="block">
                <Button variant="secondary" className="w-full mt-4">
                  {secondaryAction.label}
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
