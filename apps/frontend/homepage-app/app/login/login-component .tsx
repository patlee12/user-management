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

/**
 * LoginComponent
 *
 * Handles login via credentials and Google OAuth, supporting MFA and email-based login codes.
 * Relies on secure HttpOnly cookies and MFA ticket cookies.
 */
export default function LoginComponent() {
  const router = useRouter();
  const { loadUser } = useAuthStore((s) => s);

  const [redirectTo, setRedirectTo] = useState('/');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // reducer state machine
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { status, tempToken, email, errorMessage, qrCodeUrl, secret } = state;
  const isLoading = status === 'loading';

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) setRedirectTo(redirect);

    // Check for mfa_ticket cookie issued on OAuth login if MFA is required
    const cookieMap = document.cookie
      .split('; ')
      .reduce<Record<string, string>>((cookieObject, cookieString) => {
        const [cookieName, cookieValue] = cookieString.split('=');
        cookieObject[cookieName] = cookieValue;
        return cookieObject;
      }, {});

    if (cookieMap['mfa_ticket']) {
      dispatch({ type: 'MFA_REQUIRED', ticket: cookieMap['mfa_ticket'] });
    } else if (document.cookie.includes('public_session')) {
      loadUser().then(() => {
        dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: '', secret: '' });
      });
    }
  }, [loadUser]);

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

    await loadUser();
    dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: '', secret: '' });
  }

  const handleEmailMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      await verifyEmailMfa({ email: email, token: mfaCode });
      await loadUser();
      dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: '', secret: '' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'Invalid code',
      });
    } finally {
      setMfaCode('');
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      await verifyMfa({ token: mfaCode, ticket: tempToken });
      await loadUser();
      dispatch({ type: 'LOGIN_SUCCESS' });
      setTimeout(() => {
        window.location.href = redirectTo.startsWith('/') ? redirectTo : '/';
      }, 50);
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
      dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: qrCode, secret });
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
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' });
      dispatch({ type: 'LOGIN_SUCCESS' });
      setTimeout(() => (window.location.href = '/login'), 50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'MFA confirmation failed',
      });
    }
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />
      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
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
          /* Regular login form */
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

            <Button type="submit" className="w-full" disabled={isLoading}>
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
    </div>
  );
}
