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
    <div className="text-sm text-zinc-300 space-y-6">
      <div className="max-h-60 overflow-y-auto px-1 space-y-4">
        <p>
          <strong className="text-white">1. Acceptance of Terms</strong>
          <br />
          By using this application, you agree to be bound by these Terms of
          Use.
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
          We respect your privacy and handle your data in accordance with our
          Privacy Policy.
        </p>
        <p>
          <strong className="text-white">4. Intellectual Property</strong>
          <br />
          Content and software are the property of the provider or licensors.
        </p>
        <p>
          <strong className="text-white">5. Limitation of Liability</strong>
          <br />
          This service is provided "as is". We are not liable for damages
          arising from use of the service.
        </p>
        <p>
          <strong className="text-white">6. Changes to Terms</strong>
          <br />
          We may update these Terms from time to time. Continued use means you
          accept any updates.
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

      <hr className="border-zinc-700" />

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">MIT License</h3>
        <div className="max-h-60 overflow-y-auto bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <p>MIT License</p>
          <p>&nbsp;</p>
          <p>Copyright (c) 2025 Patrick Lee</p>
          <p>&nbsp;</p>
          <p>
            Permission is hereby granted, free of charge, to any person
            obtaining a copy of this software and associated documentation files
            (the "Software"), to deal in the Software without restriction,
            including without limitation the rights to use, copy, modify, merge,
            publish, distribute, sublicense, and/or sell copies of the Software,
            and to permit persons to whom the Software is furnished to do so,
            subject to the following conditions:
          </p>
          <p>&nbsp;</p>
          <p>
            The above copyright notice and this permission notice shall be
            included in all copies or substantial portions of the Software.
          </p>
          <p>&nbsp;</p>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </p>
        </div>
      </div>
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
          className={`w-full py-2 rounded-xl font-medium transition ${
            !accepted || submitting
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {submitting ? 'Submitting...' : 'Accept and Continue'}
        </button>
      </div>
    </div>
  );
}
