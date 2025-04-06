'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface MfaSetupProps {
  /**
   * URL for the QR code image to be scanned by an authenticator app.
   */
  qrCodeUrl?: string;
  /**
   * The secret key to be entered into the authenticator app.
   */
  secret?: string;
  /**
   * Callback when the user clicks the "Next" button to proceed to confirmation.
   */
  onNext: () => void;
}

/**
 * MfaSetup Component
 *
 * Displays the MFA setup details including a QR code and secret.
 * The QR code image is wrapped in a responsive container to ensure it scales
 * dynamically for smaller devices while maintaining a square aspect ratio.
 * Also provides a copy button for the secret and a Next button to continue
 * to the confirmation step.
 */
export function MfaSetup({ qrCodeUrl, secret, onNext }: MfaSetupProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Setup Multi-Factor Authentication
      </h2>
      <div className="flex flex-col items-center">
        {qrCodeUrl && (
          <div
            className="relative w-full max-w-xs mx-auto mb-4"
            style={{ aspectRatio: '1 / 1' }}
          >
            <Image
              src={qrCodeUrl}
              alt="Scan this QR code with your authenticator app"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={secret || ''}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white"
          />
          <Button
            type="button"
            onClick={() => navigator.clipboard.writeText(secret || '')}
          >
            Copy
          </Button>
        </div>
      </div>
      <Button type="button" className="w-full" onClick={onNext}>
        Next
      </Button>
    </div>
  );
}
