'use client';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
export default function Account() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (user)
      return onSnapshot(
        query(collection(db, 'bookings'), where('uid', '==', user.uid)),
        (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      );
  }, [user]);
  if (loading) return <main className="p-20 text-center">Loading...</main>;
  if (!user) {
    router.replace('/auth/login');
    return null;
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="rounded-3xl bg-slate-50 p-7 dark:bg-slate-900">
        <p className="text-sm text-slate-500">Signed in as</p>
        <h1 className="mt-1 text-3xl font-black">{user.email}</h1>
        <button
          onClick={() => signOut(auth)}
          className="mt-5 rounded-xl border px-4 py-2"
        >
          Sign out
        </button>
      </div>
      <h2 className="mt-10 text-2xl font-black">My bookings</h2>
      <div className="mt-5 space-y-3">
        {items.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border p-5 dark:border-slate-800"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <b>{b.tourName}</b>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                {b.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {b.departureDate || 'Departure date pending'} · {b.travelers}{' '}
              traveler(s)
            </p>
          </div>
        ))}
        {!items.length && <p className="text-slate-500">No bookings yet.</p>}
      </div>
    </main>
  );
}
