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
    <div className="space-y-6">
      <div className="space-y-4">
        <p>
          <strong className="text-white">1. Acceptance of Terms</strong>
          <br />
          By using this application, you agree to be bound by these Terms of
          Use.
        </p>
        <p>
          <strong className="text-white">2. Use of the Service</strong>
          <br />
          You agree to use this service lawfully and not infringe on others'
          rights.
        </p>
        <p>
          <strong className="text-white">3. Privacy</strong>
          <br />
          We respect your privacy. We collect and process personal information
          (e.g., registration details, usage data, cookies) only to provide and
          improve the service. We do not sell your personal data. You may
          disable cookies in your browser, but some features may not function.
        </p>
        <p>
          <strong className="text-white">4. Intellectual Property</strong>
          <br />
          All website content (text, graphics, designs, UI/UX), trademarks,
          logos, and any proprietary backend data are the sole property of{' '}
          <em>User Management</em>. You may not reproduce, distribute, or create
          derivative works of any proprietary portion of the service (including
          our UI/UX designs or branding) without prior written permission.
        </p>

        <p>
          <strong className="text-white">
            5. Open-Source Code (MIT License)
          </strong>
          <br />
          The source code we publish (front-end + back-end) is available under
          the MIT License below. You are free to use, copy, modify, and
          redistribute that code, provided you:
        </p>
        <ul className="list-disc list-inside ml-4 text-white">
          <li>
            Include the above copyright notice and permission notice in any
            copies or substantial portions of the MIT-licensed code.
          </li>
          <li>
            Give proper credit to “User Management” in your project's
            documentation or README.
          </li>
          <li>
            Do not present this software as if <em>User Management</em> endorses
            your derivative work.
          </li>
        </ul>
        <p>
          <strong className="text-white">However:</strong> You may not take our
          brand name (“User Management”) or logos and republish this service as
          “User Management” or “User Management clone.” Use our MIT-licensed
          repository as a starting point, but you must not claim to be the
          official <em>User Management</em> application.
        </p>

        <p>
          <strong className="text-white">6. Limitation of Liability</strong>
          <br />
          This service is provided “as is.” We are not liable for any damages
          arising from your use of the service.
        </p>
        <p>
          <strong className="text-white">7. Changes to Terms</strong>
          <br />
          We may update these Terms from time to time. Continued use means you
          accept any updates.
        </p>
        {supportEmail && (
          <p>
            <strong className="text-white">8. Contact</strong>
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
        <div className="max-h-60 overflow-y-auto bg-zinc-800 p-4 rounded-lg border border-zinc-700 text-sm text-white">
          <p>MIT License</p>
          <p>&nbsp;</p>
          <p>Copyright (c) 2025 Patrick Lee</p>
          <p>&nbsp;</p>
          <p>
            Permission is hereby granted, free of charge, to any person
            obtaining a copy of this software and associated documentation files
            (the “Software”), to deal in the Software without restriction,
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
            THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
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
      className="fixed inset-0 z-50 bg-black/80 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className="
            relative
            bg-zinc-900 text-zinc-200
            w-full max-w-xl
            mx-4
            max-h-[90vh]
            flex flex-col
            rounded-2xl shadow-xl ring-1 ring-zinc-700
            animate-fade-in
          "
        >
          <div className="sticky top-0 z-10 bg-zinc-900 px-8 pt-8 pb-4 border-b border-zinc-700">
            <div className="flex justify-between items-center">
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
          </div>

          <div className="flex-1 overflow-y-auto px-8 pt-4 pb-4">
            {termsHtml ?? defaultTerms}
          </div>

          <div className="sticky bottom-0 bg-zinc-900 px-8 py-6 border-t border-zinc-800">
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={() => setAccepted(!accepted)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <span>
                  I agree to the Terms of Use (v{CURRENT_TERMS_VERSION})
                </span>
              </label>
            </div>

            <button
              disabled={!accepted || submitting}
              onClick={handleAccept}
              className={`
                w-full py-2 rounded-xl font-medium transition
                ${
                  !accepted || submitting
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }
              `}
            >
              {submitting ? 'Submitting...' : 'Accept and Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
