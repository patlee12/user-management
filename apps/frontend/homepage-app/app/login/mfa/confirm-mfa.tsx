'use client';

import { Button } from '@/components/ui/button';

export interface ConfirmMfaProps {
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
   * Callback to handle form submission for confirming MFA setup.
   */
  onSubmit: (e: React.FormEvent) => void;
  /**
   * Whether the confirmation process is currently loading.
   */
  isLoading: boolean;
}

/**
 * ConfirmMfa Component
 *
 * Displays a form for the user to enter their MFA code to finalize
 * the MFA setup process.
 */
export function ConfirmMfa({
  mfaCode,
  errorMessage,
  onChange,
  onSubmit,
  isLoading,
}: ConfirmMfaProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Confirm MFA Setup</h2>
      <p className="text-zinc-400 text-sm text-center">
        Enter the MFA code from your authenticator app to finalize setup.
      </p>
      <div>
        <label
          htmlFor="confirmMfaCode"
          className="block text-sm font-medium text-zinc-300 mb-1"
        >
          MFA Code
        </label>
        <input
          id="confirmMfaCode"
          name="confirmMfaCode"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          value={mfaCode}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      {errorMessage && (
        <div className="text-sm text-red-400 text-center">{errorMessage}</div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Confirming...' : 'Confirm'}
      </Button>
    </form>
  );
}
