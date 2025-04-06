'use client';

import { useReducer, useState, useEffect } from 'react';
import Link from 'next/link';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { login, verifyMfa } from '@/app/services/authService';
import { LoginDto, MfaDto } from '@user-management/types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  loginReducer,
  initialLoginState,
  LoginState,
  AuthStatus,
} from './login-reducer';

export default function LoginComponent() {
  const [redirectTo, setRedirectTo] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    if (redirect) setRedirectTo(redirect);
  }, []);

  const loadUser = useAuthStore((state) => state.loadUser);

  const [identifier, setIdentifier] = useState('');
  const isEmail = (input: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  };

  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [state, dispatch] = useReducer(loginReducer, initialLoginState);

  const { status, tempToken, errorMessage } = state;
  const isLoading = status === 'loading';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'START_LOGIN' });
    let buildLoginDto: LoginDto = {
      password: password,
    };
    if (isEmail(identifier)) {
      buildLoginDto.email = identifier;
    } else {
      buildLoginDto.username = identifier;
    }

    try {
      const response = await login(buildLoginDto);

      if (response.mfaRequired && response.ticket) {
        dispatch({ type: 'MFA_REQUIRED', ticket: response.ticket });
        return;
      }

      await loadUser();
      dispatch({ type: 'LOGIN_SUCCESS' });

      setTimeout(() => {
        window.location.href = redirectTo.startsWith('/') ? redirectTo : '/';
      }, 50);
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.message || 'Login failed',
      });
    }
  };

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
    } catch (err: any) {
      dispatch({
        type: 'LOGIN_ERROR',
        message: err.response?.data?.message || 'Invalid MFA code',
      });
    }
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />

      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {status === 'mfa' ? 'Multi-Factor Authentication' : 'Login'}
        </h2>

        {status !== 'mfa' ? (
          <form onSubmit={handleLogin} className="space-y-6">
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
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-6">
            <p className="text-zinc-400 text-sm text-center">
              Enter the 6-digit code from your authenticator app.
            </p>

            <div>
              <label
                htmlFor="mfaCode"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                MFA Code
              </label>
              <input
                id="mfaCode"
                name="mfaCode"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                onFocus={() => dispatch({ type: 'CLEAR_ERROR' })}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {errorMessage && (
              <div className="text-sm text-red-400 text-center">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        )}

        {status !== 'mfa' && (
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
