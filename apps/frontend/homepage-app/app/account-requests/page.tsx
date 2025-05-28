'use client';

import { Button } from '@/components/ui/buttons/button';
import Link from 'next/link';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { useState } from 'react';
import { CreateAccountRequestDto } from '@user-management/types';
import { submitAccountRequest } from '@/app/services/account-request-service';
import { useRouter } from 'next/navigation';
import { TermsPrompt, CURRENT_TERMS_VERSION } from '@user-management/shared';
import { supportEmail } from '@/lib/config';

export default function AccountRequestsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateAccountRequestDto>({
    name: '',
    username: '',
    email: '',
    password: '',
    acceptedTermsAt: '',
    termsVersion: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (
      formData.password.length < 12 ||
      formData.password.length > 128 ||
      !/(?=.*\d|.*\W+)/.test(formData.password) ||
      !/(?=.*[A-Z])/.test(formData.password) ||
      !/(?=.*[a-z])/.test(formData.password)
    ) {
      newErrors.password =
        'Password must be 12–128 characters and include uppercase, lowercase, and a number or symbol';
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAcceptedTerms = () => {
    setAcceptedTerms(true);
    setFormData((prev) => ({
      ...prev,
      acceptedTermsAt: new Date().toISOString(),
      termsVersion: CURRENT_TERMS_VERSION,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await submitAccountRequest(formData);
      router.push('/account-requests/success');
      // eslint-disable-next-line
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const message = error.response.data?.message || '';
        const conflictErrors: { [key: string]: string } = {};

        if (message.toLowerCase().includes('email')) {
          conflictErrors.email = message;
        } else if (message.toLowerCase().includes('username')) {
          conflictErrors.username = message;
        } else {
          conflictErrors.server = message || 'A conflict occurred';
        }

        setErrors(conflictErrors);
      } else {
        setErrors({
          server: 'Something went wrong. Please try again later.',
        });
      }
    }
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />
      <TermsPrompt
        mode="submit"
        requiresTermsAcceptance={!acceptedTerms}
        supportEmail={supportEmail}
        onClose={() => router.push('/')}
        onSubmitAccept={handleAcceptedTerms}
      />
      {acceptedTerms && (
        <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Request an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Full Name (optional)
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.username && (
                <p className="text-sm text-red-400 mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email}</p>
              )}
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.password && (
                <p className="text-sm text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.server && (
              <p className="text-sm text-red-400 text-center">
                {errors.server}
              </p>
            )}

            <Button type="submit" className="w-full">
              Submit Request
            </Button>
          </form>

          <div className="mt-6 text-sm text-zinc-400 text-center">
            <Link href="/login" className="hover:underline">
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
