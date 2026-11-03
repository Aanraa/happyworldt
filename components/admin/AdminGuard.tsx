'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { isAdmin } from '@/lib/auth';
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [ok, setOk] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      isAdmin(user.uid, user.email, user.emailVerified)
        .then((v) => {
          if (v) setOk(true);
          else router.replace('/account');
        })
        .catch(() => router.replace('/account'));
    }
  }, [user, loading, router]);
  if (loading || !ok) return <main className="p-20 text-center">Checking admin access...</main>;
  return <>{children}</>;
}
