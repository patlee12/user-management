'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const loadUser = useAuthStore((state) => state.loadUser);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      await loadUser();
      setLoading(false);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!loading && user === null) {
      router.replace('/login');
    }
  }, [loading, user]);

  if (loading || user === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm text-zinc-400">Verifying your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
