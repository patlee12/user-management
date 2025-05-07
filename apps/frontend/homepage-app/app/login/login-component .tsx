'use client';

import { useReducer, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import {
  login,
  oauthLogin, // ← import the new OAuth helper
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
 * - Regular credentials login
 * - Google OAuth login via `oauthLogin()`
 * - Enforced MFA (TOTP) or email-MFA fallback
 * - Optional MFA setup after a non-MFA login
 */
export default function LoginComponent() {
  const router = useRouter();

  // redirect target after login
  const [redirectTo, setRedirectTo] = useState('/');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) setRedirectTo(redirect);
  }, []);

  const { loadUser } = useAuthStore((s) => s);

  // form fields & MFA code
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // reducer state machine
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { status, tempToken, errorMessage, qrCodeUrl, secret } = state;
  const isLoading = status === 'loading';

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  /**
   * Shared handler for AuthResponseDto
   */
  async function handleAuthResponse(resp: AuthResponseDto) {
    if (resp.mfaRequired && resp.ticket) {
      dispatch({ type: 'MFA_REQUIRED', ticket: resp.ticket });
      return;
    }
    if (resp.emailMfaRequired) {
      dispatch({
        type: 'EMAIL_MFA_REQUIRED',
        email: resp.userId + '',
      });
      return;
    }
    // no enforced MFA so prompt optional MFA
    await loadUser();
    dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: '', secret: '' });
  }

  /**
   * handleGoogleLogin
   *
   * Kick off the OAuth by redirecting.
   */
  const handleGoogleLogin = () => {
    // optional: set loading spinner
    dispatch({ type: 'START_LOGIN' });
    oauthLogin({ redirect: redirectTo });
  };

  /**
   * handleLogin
   *
   * Regular credentials-based login flow.
   */
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

  /**
   * handleEmailMfaSubmit
   */
  const handleEmailMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      await verifyEmailMfa({ email: tempToken, token: mfaCode });
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

  /**
   * handleMfaSubmit
   */
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

  /**
   * handleBeginMfaSetup
   */
  const handleBeginMfaSetup = async () => {
    try {
      const { qrCode, secret } = await getMfaSetup();
      dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: qrCode, secret });
      dispatch({ type: 'BEGIN_MFA_SETUP' });
    } catch (error) {
      console.error('Error fetching MFA setup details:', error);
    }
  };

  /**
   * handleTransitionToConfirmMfa
   */
  const handleTransitionToConfirmMfa = () => {
    dispatch({ type: 'BEGIN_CONFIRM_MFA_SETUP' });
  };

  /**
   * handleConfirmMfaSetup
   */
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
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Email or Username
              </label>
              <input
                id="identifier"
                name="identifier"
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
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

            {/* Google OAuth button */}
            {status === 'idle' && (
              <div className="mt-4 mb-2 flex justify-center">
                <GoogleLoginButton onClick={handleGoogleLogin} />
              </div>
            )}
          </form>
        )}

        {/* Create/Forgot buttons */}
        {['mfa', 'mfa-optional', 'mfa-setup', 'confirm-mfa'].every(
          (s) => s !== status,
        ) && (
          <div className="mt-6 flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/account-requests')}
            >
              Create an account
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/forgot-password')}
            >
              Forgot password?
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
