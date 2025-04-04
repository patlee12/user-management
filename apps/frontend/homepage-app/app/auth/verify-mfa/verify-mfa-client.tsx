'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { useAuthStore } from '@/stores/authStore';
import { verifyMfa } from '@/app/services/authService';

export default function VerifyMfaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket') || '';
  const redirect = searchParams.get('redirect') || '/';
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const loadUser = useAuthStore((state) => state.loadUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await verifyMfa({ token, ticket });

      await loadUser();
      router.replace(redirect);
    } catch (err: any) {
      setError('Invalid MFA code');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ticket) {
    return (
      <div className="text-white text-center mt-32">
        <h1 className="text-2xl font-bold">Missing MFA ticket</h1>
        <p className="text-zinc-400 mt-2">Please go back and log in again.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />

      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Multi-Factor Authentication
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              Enter your 6-digit code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 text-center">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || token.length !== 6}
          >
            {submitting ? 'Verifying...' : 'Verify'}
          </Button>
        </form>
      </div>
    </div>
  );
}
