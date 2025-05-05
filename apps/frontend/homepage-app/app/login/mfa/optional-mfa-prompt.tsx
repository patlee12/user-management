'use client';

import { Button } from '@/components/ui/buttons/button';

export interface OptionalMfaPromptProps {
  /**
   * Callback when the user clicks the "Setup MFA" button.
   */
  onSetup: () => void;
  /**
   * Callback when the user clicks the "Skip" button.
   */
  onSkip: () => void;
}

/**
 * OptionalMfaPrompt Component
 *
 * Displays a prompt asking the user if they would like to enhance their account
 * security by setting up Multi-Factor Authentication.
 */
export function OptionalMfaPrompt({ onSetup, onSkip }: OptionalMfaPromptProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Enhance Your Account Security
      </h2>
      <p className="text-center text-sm text-zinc-400">
        Your account does not have Multi-Factor Authentication set up. We
        recommend enabling it to secure your account.
      </p>
      <div className="flex justify-center space-x-4">
        <Button type="button" onClick={onSetup}>
          Setup MFA
        </Button>
        <Button type="button" onClick={onSkip}>
          Skip
        </Button>
      </div>
    </div>
  );
}
