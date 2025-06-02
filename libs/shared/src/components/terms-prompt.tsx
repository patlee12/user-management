'use client';

import { useState } from 'react';
import { CURRENT_TERMS_VERSION } from '../constants/index';

type TermsPromptProps = {
  /**
   * Determines the behavior of the component:
   * - 'enforce' (default): Used after login/OAuth. Triggers backend PATCH to record terms acceptance.
   * - 'submit': Used during local account request and will be added to DTO.
   */
  mode?: 'enforce' | 'submit';

  /**
   * Controls whether the prompt should be displayed.
   * Set to `true` if the current user has not yet accepted the latest Terms of Use.
   */
  requiresTermsAcceptance: boolean;

  /**
   * Called when the user accepts the terms in 'enforce' mode.
   * Should handle PATCHing to `/auth/accept-terms` and refreshing user state.
   */
  onEnforceAccept?: () => Promise<void>;

  /**
   * Called when the user accepts the terms in 'submit' mode.
   * Typically used to set `acceptedTermsAt` and `termsVersion` into a parent form.
   */
  onSubmitAccept?: () => void;

  /**
   * Optional override for injecting custom Terms HTML.
   * If not provided, a default inline version is shown.
   */
  termsHtml?: React.ReactNode;

  /**
   * Optional handler for closing the modal without accepting.
   * If provided, an "X" button appears in the top-right corner.
   */
  onClose?: () => void;

  /**
   * Optional support contact email shown in the default terms under "Contact".
   */
  supportEmail?: string;
};

/**
 * A universal Terms of Use prompt component that enforces versioned acceptance
 * for both account request and post-login flows. Designed to be embedded in
 * frontend apps as a full-screen blocking modal.
 */
export function TermsPrompt({
  mode = 'enforce',
  requiresTermsAcceptance,
  onEnforceAccept,
  onSubmitAccept,
  termsHtml,
  onClose,
  supportEmail,
}: TermsPromptProps) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!requiresTermsAcceptance) return null;

  /**
   * Handles the accept button click.
   * - Validates the checkbox is checked.
   * - Triggers appropriate handler based on mode.
   * - Disables button while submitting.
   */
  const handleAccept = async () => {
    if (!accepted || submitting) return;
    setSubmitting(true);

    try {
      if (mode === 'enforce') {
        await onEnforceAccept?.();
      } else {
        onSubmitAccept?.();
      }
    } catch (err) {
      console.error('Terms acceptance failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const defaultTerms = (
    <div className="text-sm text-zinc-300 max-h-64 overflow-y-auto space-y-4 text-left px-1">
      <p>
        <strong className="text-white">1. Acceptance of Terms</strong>
        <br />
        By using this application, you agree to be bound by these Terms of Use.
      </p>
      <p>
        <strong className="text-white">2. Use of the Service</strong>
        <br />
        You agree to use this service lawfully and not infringe on others’
        rights.
      </p>
      <p>
        <strong className="text-white">3. Privacy</strong>
        <br />
        We respect your privacy and will handle your data accordingly.
      </p>
      <p>
        <strong className="text-white">4. Intellectual Property</strong>
        <br />
        Content and software are property of the provider or licensors.
      </p>
      <p>
        <strong className="text-white">5. Limitation of Liability</strong>
        <br />
        This service is provided "as is". We are not liable for damages.
      </p>
      <p>
        <strong className="text-white">6. Changes</strong>
        <br />
        Terms may change. Continued use means you accept any updates.
      </p>
      {supportEmail && (
        <p>
          <strong className="text-white">7. Contact</strong>
          <br />
          For support, contact us at{' '}
          <a
            href={`mailto:${supportEmail}`}
            className="underline hover:text-white"
          >
            {supportEmail}
          </a>
          .
        </p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="relative bg-zinc-900 text-zinc-200 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-8 pr-12 ring-1 ring-zinc-700 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <h2 id="terms-title" className="text-2xl font-bold text-white">
            Terms of Use (v{CURRENT_TERMS_VERSION})
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white focus:outline-none ml-4"
              aria-label="Close"
            >
              <span className="text-4xl leading-none">&times;</span>
            </button>
          )}
        </div>

        {termsHtml ?? defaultTerms}

        <div className="mt-6 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span>I agree to the Terms of Use (v{CURRENT_TERMS_VERSION})</span>
          </label>
        </div>

        <button
          disabled={!accepted || submitting}
          onClick={handleAccept}
          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition font-medium text-white"
        >
          {submitting ? 'Submitting...' : 'Accept and Continue'}
        </button>
      </div>
    </div>
  );
}
