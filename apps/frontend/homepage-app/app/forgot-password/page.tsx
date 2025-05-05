'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/buttons/button';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { submitPasswordReset } from '../services/password-reset-service';
import { CreatePasswordResetDto } from '@user-management/types';

type RequestStatus = 'idle' | 'submitting' | 'sent' | 'error';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RequestStatus>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setStatus('submitting');
    setError('');

    try {
      const dto: CreatePasswordResetDto = { email: email };
      const res = await submitPasswordReset(dto);

      if (!res) throw new Error('Failed to send reset email');

      setStatus('sent');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log(err);
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />
      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center">Forgot Password</h2>

        {status === 'sent' ? (
          <p className="text-center text-green-400">
            Password reset email sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </form>
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
