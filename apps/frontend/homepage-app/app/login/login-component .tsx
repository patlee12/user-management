'use client';

import { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import {
  login,
  oauthLogin,
  verifyMfa,
  getMfaSetup,
  confirmMfaSetup,
  verifyEmailMfa,
  acceptTerms,
} from '@/app/services/auth-service';
import { LoginDto, AuthResponseDto } from '@user-management/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/buttons/button';
import { loginReducer, initialLoginState } from './login-reducer';
import { OptionalMfaPrompt } from './mfa/optional-mfa-prompt';
import { MfaSetup } from './mfa/mfa-setup';
import { ConfirmMfa } from './mfa/confirm-mfa';
import { MfaVerify } from './mfa/mfa-verify';
import { GoogleLoginButton } from '@/components/ui/buttons/google-login-button';
import { TermsPrompt } from '@user-management/shared';

/**
 * LoginComponent
 *
 * Handles login via credentials and Google OAuth, supporting MFA, email-based login codes,
 * and versioned Terms of Use enforcement.
 * Relies on secure HttpOnly cookies and MFA/terms challenge tickets stored in local state.
 *
 * Special OAuth redirect logic:
 * - After Google login, backend redirects back with `?mfaRequired=true&ticket=…`
 * - This component reads those once on mount, dispatches MFA flow, and strips them from the URL.
 */
export default function LoginComponent() {
  const router = useRouter();
  const { loadUser } = useAuthStore((s) => s);

  const [redirectTo, setRedirectTo] = useState('/');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [checkedCookies, setCheckedCookies] = useState(false);
  const [termsTicket, setTermsTicket] = useState('');
  const [completedEmailMfa, setCompletedEmailMfa] = useState(false);
  const [completedMfa, setCompletedMfa] = useState(false);

  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { status, tempToken, email, errorMessage, qrCodeUrl, secret } = state;
  const isLoading = status === 'loading';

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /**
   * On mount:
   * - Read any `redirect` query param
   * - Attempt OAuth-style MFA or Terms flow from URL params
   * - If not OAuth, fall back to cookie based flows
   * - Prevent initial render until this check completes
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) setRedirectTo(redirect);

    // OAuth redirect flow
    const mfaRequired = params.get('mfaRequired');
    const termsRequired = params.get('termsRequired');
    const ticketParam = params.get('ticket');

    if (termsRequired === 'true' && ticketParam) {
      // Handle OAuth redirect requiring Terms of Use acceptance
      setTermsTicket(ticketParam);
      dispatch({ type: 'TERMS_REQUIRED', ticket: ticketParam });

      params.delete('termsRequired');
      params.delete('ticket');
      const base = window.location.pathname;
      const newQs = params.toString();
      window.history.replaceState(null, '', base + (newQs ? `?${newQs}` : ''));
    } else if (mfaRequired === 'true' && ticketParam) {
      dispatch({ type: 'MFA_REQUIRED', ticket: ticketParam });

      params.delete('mfaRequired');
      params.delete('ticket');
      const base = window.location.pathname;
      const newQs = params.toString();
      window.history.replaceState(null, '', base + (newQs ? `?${newQs}` : ''));
    } else {
      // fallback to cookie logic for regular login/MFA
      const cookieMap = document.cookie
        .split('; ')
        .reduce<Record<string, string>>((acc, curr) => {
          const [k, v] = curr.split('=');
          acc[k] = decodeURIComponent(v);
          return acc;
        }, {});

      if (cookieMap['mfa_ticket'] && status === 'idle') {
        dispatch({ type: 'MFA_REQUIRED', ticket: cookieMap['mfa_ticket'] });
      } else if (cookieMap['public_session'] && status === 'idle') {
        loadUser().then(() => {
          dispatch({
            type: 'OPTIONAL_MFA_PROMPT',
            qrCodeUrl: '',
            secret: '',
          });
        });
      }
    }

    setCheckedCookies(true);
  }, [loadUser, status]);

  // Don’t render until we have checked URL and cookies
  if (!checkedCookies) return null;

  const handleGoogleLogin = () => {
    dispatch({ type: 'START_LOGIN' });
    oauthLogin({ redirect: redirectTo });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });

    const dto: LoginDto = { password };
    if (isEmail(identifier)) dto.email = identifier;
    else dto.username = identifier;

    try {
      const resp = await login(dto);
      await handleAuthResponse(resp);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Login failed. Please check your credentials.';
      dispatch({
        type: 'LOGIN_ERROR',
        message: Array.isArray(msg) ? msg[0] : msg,
      });
    }
  };

  async function handleAuthResponse(resp: AuthResponseDto) {
    if (resp.mfaRequired && resp.ticket) {
      dispatch({ type: 'MFA_REQUIRED', ticket: resp.ticket });
      return;
    }
    if (resp.emailMfaRequired) {
      dispatch({
        type: 'EMAIL_MFA_REQUIRED',
        email: resp.email + '',
      });
      return;
    }
    if (resp.termsRequired && resp.ticket) {
      setTermsTicket(resp.ticket);
      dispatch({ type: 'TERMS_REQUIRED', ticket: resp.ticket });
      return;
    }
    await loadUser();
  }

  const handleEmailMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      const resp = await verifyEmailMfa({ email: email, token: mfaCode });
      setCompletedEmailMfa(true);
      await handleAuthResponse(resp);
      if (resp.accessToken && !resp.termsRequired) {
        dispatch({
          type: 'OPTIONAL_MFA_PROMPT',
          qrCodeUrl: '',
          secret: '',
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'Invalid code',
      });
    } finally {
      setMfaCode('');
      setPassword('');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      const resp = await verifyMfa({ token: mfaCode, ticket: tempToken });
      setCompletedMfa(true);
      await handleAuthResponse(resp);

      if (resp.accessToken && !resp.termsRequired) {
        dispatch({ type: 'LOGIN_SUCCESS' });
        window.location.href = redirectTo.startsWith('/') ? redirectTo : '/';
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'Invalid MFA code',
      });
    } finally {
      setMfaCode('');
    }
  };

  const handleBeginMfaSetup = async () => {
    try {
      const { qrCode, secret } = await getMfaSetup();
      dispatch({
        type: 'OPTIONAL_MFA_PROMPT',
        qrCodeUrl: qrCode,
        secret,
      });
      dispatch({ type: 'BEGIN_MFA_SETUP' });
    } catch (error) {
      console.error('Error fetching MFA setup details:', error);
    }
  };

  const handleTransitionToConfirmMfa = () => {
    dispatch({ type: 'BEGIN_CONFIRM_MFA_SETUP' });
  };

  const handleConfirmMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      await confirmMfaSetup({ token: mfaCode });
      window.location.href = '/logout';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'MFA confirmation failed',
      });
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const resp = await acceptTerms({ ticket: termsTicket, accepted: true });
      await handleAuthResponse(resp);
      if (completedEmailMfa || !completedMfa) {
        dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: '', secret: '' });
        return;
      }
      dispatch({ type: 'LOGIN_SUCCESS' });
      window.location.href = redirectTo.startsWith('/') ? redirectTo : '/';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error accepting terms:', err);
    }
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />

      {status === 'terms' ? (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <TermsPrompt
              mode="enforce"
              requiresTermsAcceptance={true}
              onEnforceAccept={handleAcceptTerms}
              onClose={() => router.push('/')}
            />
          </div>
        </div>
      ) : (
        <div className="baseCard">
          {status === 'mfa-optional' ? (
            <OptionalMfaPrompt
              onSetup={handleBeginMfaSetup}
              onSkip={() =>
                (window.location.href = redirectTo.startsWith('/')
                  ? redirectTo
                  : '/')
              }
            />
          ) : status === 'mfa-setup' ? (
            <MfaSetup
              qrCodeUrl={qrCodeUrl}
              secret={secret}
              onNext={handleTransitionToConfirmMfa}
            />
          ) : status === 'confirm-mfa' ? (
            <ConfirmMfa
              mfaCode={mfaCode}
              errorMessage={errorMessage}
              onChange={setMfaCode}
              onSubmit={handleConfirmMfaSetup}
              isLoading={isLoading}
            />
          ) : status === 'mfa' ? (
            <MfaVerify
              mfaCode={mfaCode}
              errorMessage={errorMessage}
              onChange={setMfaCode}
              onSubmit={handleMfaSubmit}
              isLoading={isLoading}
            />
          ) : status === 'email-mfa' ? (
            <MfaVerify
              title="Enter Your Login Code"
              description="Enter the 6-digit code we emailed to you."
              mfaCode={mfaCode}
              errorMessage={errorMessage}
              onChange={setMfaCode}
              onSubmit={handleEmailMfaSubmit}
              isLoading={isLoading}
            />
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

              <div>
                <label className="block text-sm mb-1 text-zinc-300">
                  Email or Username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onFocus={() => dispatch({ type: 'CLEAR_ERROR' })}
                  placeholder="Enter your email or username"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => dispatch({ type: 'CLEAR_ERROR' })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {status === 'error' && (
                <div className="text-sm text-red-400 text-center">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {['mfa', 'mfa-optional', 'mfa-setup', 'confirm-mfa'].every(
                (s) => s !== status,
              ) && (
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-zinc-400">
                  <button
                    type="button"
                    onClick={() => router.push('/account-requests')}
                    className="text-left hover:text-white underline underline-offset-4 transition"
                  >
                    Create an account
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-left sm:text-right hover:text-white underline underline-offset-4 transition"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {status === 'idle' && (
                <>
                  <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-zinc-700" />
                    <span className="mx-4 text-sm text-zinc-400">
                      Or continue with
                    </span>
                    <div className="flex-grow border-t border-zinc-700" />
                  </div>
                  <div className="mb-2 flex justify-center">
                    <GoogleLoginButton onClick={handleGoogleLogin} />
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
