'use client';

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDepartureDate(value: string, today: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < today) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

export default function Booking() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tours, setTours] = useState<any[]>([]);
  const [tourId, setTourId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setTourId(q.get('tour') || '');

    const unsub = onSnapshot(collection(db, 'tours'), (s) =>
      setTours(
        s.docs
          .map(
            (d) =>
              ({ id: d.id, ...d.data() }) as { id: string; active?: boolean },
          )
          .filter((t) => t.active),
      ),
    );

    return unsub;
  }, []);

  if (loading) return <main className="p-20 text-center">Loading...</main>;

  if (!user)
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-black">Login required</h1>
        <p className="mt-3 text-slate-500">
          Please sign in before registering for a tour.
        </p>
        <Link
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          href={`/auth/login?next=/booking${tourId ? `?tour=${encodeURIComponent(tourId)}` : ''}`}
        >
          Login
        </Link>
      </main>
    );

  const uid = user.uid;
  const today = getToday();
  const dateIsValid = isValidDepartureDate(date, today);

  function validate() {
    if (!tourId) {
      setMsg('Please select a tour.');
      return false;
    }
    if (!name || !phone) {
      setMsg('Fill your name and phone.');
      return false;
    }
    if (!dateIsValid) {
      setMsg(
        date && date < today
          ? 'Please choose a future departure date.'
          : 'Please choose a valid departure date.',
      );
      return false;
    }
    return true;
  }

  function submit() {
    if (!validate()) return;

    const t = tours.find((x) => x.id === tourId);
    const bookingPreview = {
      tourId,
      tourName: t?.name || '',
      departureDate: date,
      adults: Number(adults),
      children: Number(children),
      fullName: name,
      phone,
      note,
    };

    setPendingBooking(bookingPreview);
    setConfirmOpen(true);
  }

  async function confirmBooking() {
    if (!pendingBooking) return;

    try {
      await addDoc(collection(db, 'bookings'), {
        uid,
        tourId: pendingBooking.tourId,
        tourName: pendingBooking.tourName,
        departureDate: pendingBooking.departureDate,
        adults: pendingBooking.adults,
        children: pendingBooking.children,
        travelers: pendingBooking.adults + pendingBooking.children,
        fullName: pendingBooking.fullName,
        phone: pendingBooking.phone,
        note: pendingBooking.note,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setConfirmOpen(false);
      router.push('/account');
    } catch (e: any) {
      setMsg(e.message || 'Could not submit booking.');
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-black">Register for a tour</h1>
      <p className="mt-2 text-slate-500">
        Your booking will be saved to your account.
      </p>

      <div className="mt-8 rounded-3xl border p-6 dark:border-slate-800">
        <label className="block">
          <span className="text-sm font-medium">Select a tour</span>
          <select
            className="mt-2 w-full rounded-xl border p-3 dark:bg-slate-900"
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
          >
            <option value="">Select a tour</option>
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label>
            <span className="text-sm font-medium">Departure date</span>
            <input
              type="date"
              min={today}
              className="mt-2 w-full rounded-xl border p-3 dark:bg-slate-900"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <div>
            <span className="text-sm font-medium">Travelers</span>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                className="w-1/2 rounded-xl border p-3 text-center dark:bg-slate-900"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              />
              <input
                type="number"
                min={0}
                className="w-1/2 rounded-xl border p-3 text-center dark:bg-slate-900"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              />
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Left: adults | Right: children
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-medium">Full name</span>
            <input
              className="mt-2 w-full rounded-xl border p-3 dark:bg-slate-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <label>
            <span className="text-sm font-medium">Phone</span>
            <input
              className="mt-2 w-full rounded-xl border p-3 dark:bg-slate-900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <label>
            <span className="text-sm font-medium">Note (optional)</span>
            <input
              className="mt-2 w-full rounded-xl border p-3 dark:bg-slate-900"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>

        {msg && <div className="mt-4 text-sm text-red-500">{msg}</div>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={submit}
            disabled={!dateIsValid}
            className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Review booking
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && pendingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900">
            <button
              className="absolute right-3 top-3 text-slate-500"
              onClick={() => setConfirmOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold">Confirm your booking</h3>

            <div className="mt-4 space-y-2">
              <div>
                <strong>Tour:</strong> {pendingBooking.tourName}
              </div>
              <div>
                <strong>Date:</strong> {pendingBooking.departureDate}
              </div>
              <div>
                <strong>Adults:</strong> {pendingBooking.adults}
              </div>
              <div>
                <strong>Children:</strong> {pendingBooking.children}
              </div>
              <div>
                <strong>Name:</strong> {pendingBooking.fullName}
              </div>
              <div>
                <strong>Phone:</strong> {pendingBooking.phone}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={confirmBooking}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
              >
                Confirm booking
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
