'use client';

import { useEffect, useState } from 'react';
import CanvasBackground from '@/components/ui/backgrounds/canvasBackground';

export default function MfaHelpPage() {
  const [supportEmail, setSupportEmail] = useState('support@example.com');

  useEffect(() => {
    setSupportEmail(
      process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',
    );
  }, []);

  return (
    <div className="relative w-full text-white h-full overflow-hidden flex items-center justify-center">
      <CanvasBackground />
      <div className="bg-zinc-900 bg-opacity-70 backdrop-blur-md border border-zinc-700 rounded-2xl shadow-xl max-w-md w-full p-8 animate-fade-in text-center space-y-6">
        <h2 className="text-3xl font-bold">Need Help with MFA?</h2>
        <p className="text-zinc-300">
          If you’ve lost access to your MFA device or are having trouble logging
          in, please contact our support team.
        </p>
        <p className="text-orange-400 font-medium break-all">{supportEmail}</p>
        <p className="text-sm text-zinc-400">
          Be sure to include your account email when you reach out.
        </p>
      </div>
    </div>
  );
}
