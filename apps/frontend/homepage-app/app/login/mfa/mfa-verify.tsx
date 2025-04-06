'use client';

import { Button } from '@/components/ui/button';

export interface MfaVerifyProps {
  /**
   * The current MFA code input value.
   */
  mfaCode: string;
  /**
   * Any error message to be displayed.
   */
  errorMessage?: string;
  /**
   * Callback to update the MFA code as the user types.
   */
  onChange: (value: string) => void;
  /**
   * Callback to handle form submission for MFA verification.
   */
  onSubmit: (e: React.FormEvent) => void;
  /**
   * Indicates whether the verification process is currently loading.
   */
  isLoading: boolean;
}

/**
 * MfaVerify Component
 *
 * Displays a form for the user to enter their MFA code when MFA verification is required
 * (for example, on login when the backend enforces MFA).
 */
export function MfaVerify({
  mfaCode,
  errorMessage,
  onChange,
  onSubmit,
  isLoading,
}: MfaVerifyProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Multi-Factor Authentication
      </h2>
      <p className="text-zinc-400 text-sm text-center">
        Enter the 6-digit code from your authenticator app.
      </p>
      <div>
        <label
          htmlFor="mfaVerifyCode"
          className="block text-sm font-medium text-zinc-300 mb-1"
        >
          MFA Code
        </label>
        <input
          id="mfaVerifyCode"
          name="mfaVerifyCode"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          value={mfaCode}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {}}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      {errorMessage && (
        <div className="text-sm text-red-400 text-center">{errorMessage}</div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify'}
      </Button>
    </form>
  );
}
