'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'confirm' | 'reset'>('confirm');
  const [confirmData, setConfirmData] = useState({ email: '' });
  const [formData, setFormData] = useState({
    userId: '',
    token: '',
    newPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateReset = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.token.trim()) {
      newErrors.token = 'Reset token is required';
    }

    if (
      formData.newPassword.length < 12 ||
      formData.newPassword.length > 128 ||
      !/(?=.*\d|.*\W+)/.test(formData.newPassword) ||
      !/(?=.*[A-Z])/.test(formData.newPassword) ||
      !/(?=.*[a-z])/.test(formData.newPassword)
    ) {
      newErrors.newPassword =
        'Password must be 12–128 characters and include uppercase, lowercase, and a number or symbol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (step === 'confirm') {
      setConfirmData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    // Simulate API call
    const fakeUserId = '123'; // Replace this with actual lookup
    setFormData((prev) => ({ ...prev, userId: fakeUserId }));
    setErrors({});
    setStep('reset');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReset()) return;

    // Place holder for api call
    console.log('Submitted:', formData);
  };

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />

      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in">
        {step === 'confirm' ? (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">
              Confirm Account
            </h2>

            <form onSubmit={handleConfirm} className="space-y-6">
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
                  value={confirmData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.email && (
                  <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">
              Reset Your Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="token"
                  className="block text-sm font-medium text-zinc-300 mb-1"
                >
                  Reset Token
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={formData.token}
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.token && (
                  <p className="text-sm text-red-400 mt-1">{errors.token}</p>
                )}
              </div>

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
                  onChange={handleChange}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-400 mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Confirm Password Reset
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
