'use client';

import { useReducer, useState, useEffect } from 'react';
import Link from 'next/link';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import {
  login,
  verifyMfa,
  getMfaSetup,
  confirmMfaSetup,
} from '@/app/services/authService';
import { LoginDto, MfaDto } from '@user-management/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { loginReducer, initialLoginState } from './login-reducer';
import { OptionalMfaPrompt } from './mfa/optional-mfa-prompt';
import { MfaSetup } from './mfa/mfa-setup';
import { ConfirmMfa } from './mfa/confirm-mfa';
import { MfaVerify } from './mfa/mfa-verify';

/**
 * LoginComponent
 *
 * Manages the login flow including optional and required MFA flows.
 * The component uses a reducer-based state machine to transition through these states:
 *
 * - Default login
 * - MFA required (enforced by backend)
 * - Optional MFA prompt (user can choose to enable MFA)
 * - MFA setup (displaying QR code and secret)
 * - Confirm MFA (finalizing MFA setup)
 *
 * The MFA-related UI is abstracted into separate components to improve readability and reuse.
 */
export default function LoginComponent() {
  const [redirectTo, setRedirectTo] = useState('/');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) setRedirectTo(redirect);
  }, []);

  const { loadUser } = useAuthStore((state) => state);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);
  const { status, tempToken, errorMessage, qrCodeUrl, secret } = state;
  const isLoading = status === 'loading';
  const isEmail = (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  /**
   * Handles the initial login form submission.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    const buildLoginDto: LoginDto = { password };

    if (isEmail(identifier)) {
      buildLoginDto.email = identifier;
    } else {
      buildLoginDto.username = identifier;
    }

    try {
      const response = await login(buildLoginDto);

      // If MFA is required (enforced by backend), start MFA verification flow.
      if (response.mfaRequired && response.ticket) {
        dispatch({ type: 'MFA_REQUIRED', ticket: response.ticket });
        return;
      }

      // Capture the current user data from loadUser() rather than relying on a potentially stale store value.
      await loadUser();

      // If the user doesn't have MFA enabled, show the optional MFA prompt.
      if (!response.mfaRequired) {
        dispatch({ type: 'OPTIONAL_MFA_PROMPT', qrCodeUrl: '', secret: '' });
        return;
      }

      // Otherwise, complete login as normal.
      dispatch({ type: 'LOGIN_SUCCESS' });
      setTimeout(() => {
        window.location.href = redirectTo.startsWith('/') ? redirectTo : '/';
      }, 50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Login failed. Please check your credentials.';

      dispatch({
        type: 'LOGIN_ERROR',
        message: Array.isArray(message) ? message[0] : message,
      });
    }
  };

  /**
   * Handles MFA verification submission for enforced MFA login.
   */
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      const mfaDto: MfaDto = {
        token: mfaCode,
        ticket: tempToken,
      };
      await verifyMfa(mfaDto);
      await loadUser();
      dispatch({ type: 'LOGIN_SUCCESS' });
      setTimeout(() => {
        window.location.href = redirectTo.startsWith('/') ? redirectTo : '/';
      }, 100);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'Invalid MFA code',
      });
    }
  };

  /**
   * Handles when the user opts to begin MFA setup.
   * Fetches the MFA setup details and transitions to the MFA setup UI.
   */
  const handleBeginMfaSetup = async () => {
    try {
      const mfaSetup = await getMfaSetup();
      // Assume getMfaSetup returns an object with { qrCode, secret }
      dispatch({
        type: 'OPTIONAL_MFA_PROMPT',
        qrCodeUrl: mfaSetup.qrCode,
        secret: mfaSetup.secret,
      });
      // Transition to MFA setup UI.
      dispatch({ type: 'BEGIN_MFA_SETUP' });
    } catch (error) {
      console.error('Error fetching MFA setup details:', error);
    }
  };

  /**
   * Transitions from the MFA setup UI to the confirm MFA UI.
   */
  const handleTransitionToConfirmMfa = () => {
    dispatch({ type: 'BEGIN_CONFIRM_MFA_SETUP' });
  };

  /**
   * Handles the confirmation step for MFA setup.
   * Calls the confirmMfaSetup endpoint to finalize MFA setup.
   * Then calls the logout endpoint to clear tokens and forces the user to re-log in.
   */
  const handleConfirmMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    try {
      // Finalize MFA setup with the provided MFA code.
      await confirmMfaSetup({ token: mfaCode });

      // Call the logout endpoint to clear auth cookies.
      await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      dispatch({ type: 'LOGIN_SUCCESS' });

      // Redirect to the login page (or another page as desired).
      setTimeout(() => {
        window.location.href = '/login';
      }, 50);
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
        ) : (
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
          </form>
        )}
        {status !== 'mfa' &&
          status !== 'mfa-optional' &&
          status !== 'mfa-setup' &&
          status !== 'confirm-mfa' && (
            <div className="mt-6 flex justify-between text-sm text-zinc-400">
              <Link href="/account-requests" className="hover:underline">
                Create an account
              </Link>
              <Link href="/forgot-password" className="hover:underline">
                Forgot password?
              </Link>
            </div>
          )}
      </div>
    </div>
  );
}
