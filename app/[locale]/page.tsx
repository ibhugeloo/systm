'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/fr/login');
      } else {
        router.push('/fr/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-slate-950 dark:border-t-slate-50 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            systm.re
          </p>
        </div>
      </div>
    );
  }

  return null;
}
