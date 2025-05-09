'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/buttons/button';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import {
  confirmPasswordReset,
  validatePasswordReset,
} from '@/app/services/password-reset-service';
import { ConfirmPasswordResetDto } from '@user-management/types';

export default function PasswordResetClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const userId = searchParams.get('userId') || '';

  const [status, setStatus] = useState<'loading' | 'invalid' | 'valid'>(
    'loading',
  );
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !userId) {
      setStatus('invalid');
      return;
    }

    const findRequest = async () => {
      try {
        const passwordResetReq = await validatePasswordReset({
          userId: +userId,
          token,
        });
        if (!passwordResetReq) throw new Error('Invalid or expired token');
        setStatus('valid');
      } catch {
        setStatus('invalid');
      }
    };

    findRequest();
  }, [token, userId]);

  const validatePassword = (password: string, confirmPassword: string) => {
    if (
      password.length < 12 ||
      password.length > 128 ||
      !/(?=.*\d|.*\W+)/.test(password) ||
      !/(?=.*[A-Z])/.test(password) ||
      !/(?=.*[a-z])/.test(password)
    ) {
      return 'Password must be 12–128 characters and include uppercase, lowercase, and a number or symbol';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { newPassword, confirmPassword } = formData;
    const passwordError = validatePassword(newPassword, confirmPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const dto: ConfirmPasswordResetDto = {
        userId: +userId,
        token,
        newPassword,
      };
      const confirmReset = await confirmPasswordReset(dto);
      if (!confirmReset) throw new Error('Reset failed');

      router.push('/login');
    } catch {
      setError(
        'Failed to reset password. Try again or request a new reset link.',
      );
    }
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />

      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
        {status === 'loading' && (
          <p className="text-center text-zinc-400">Validating reset link...</p>
        )}

        {status === 'invalid' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Reset Link Invalid
            </h2>
            <p className="text-center text-sm text-zinc-400 mb-4">
              The reset link is invalid or has expired.
            </p>
            <Button
              className="w-full"
              onClick={() => router.push('/forgot-password')}
            >
              Resend Reset Email
            </Button>
          </>
        )}

        {status === 'valid' && (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">
              Set a New Password
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {error && <p className="text-sm text-red-400 mt-1">{error}</p>}

              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          </>
        )}

        <div className="mt-6 text-sm text-zinc-400 text-center">
          <Link href="/login" className="hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
