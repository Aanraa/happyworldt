'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Heart,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Users,
  X,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

type TourDetailProps = {
  params: Promise<{ slug: string }>;
};

type BookingForm = {
  departureDate: string;
  adults: number;
  children: number;
};

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

export default function TourDetail({ params }: TourDetailProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<any>(null);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const [form, setForm] = useState<BookingForm>({
    departureDate: '',
    adults: 1,
    children: 0,
  });

  // ==========================================
  // GET SLUG
  // ==========================================

  useEffect(() => {
    params.then((x) => setSlug(x.slug));
  }, [params]);

  // ==========================================
  // LOAD TOUR
  // ==========================================

  useEffect(() => {
    if (!slug) return;

    async function loadTour() {
      try {
        setLoading(true);

        const snapshot = await getDocs(
          query(collection(db, 'tours'), where('slug', '==', slug)),
        );

        const matched = snapshot.docs.find((doc) => {
          const value = doc.data();
          return value.active !== false;
        });

        if (!matched) {
          setData(null);
          return;
        }

        const nextData = {
          id: matched.id,
          ...matched.data(),
        };

        setData(nextData);

        if (user && nextData?.id) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const ids = Array.isArray(userSnap.data()?.favoriteTours)
              ? (userSnap.data()?.favoriteTours as string[])
              : [];
            setIsFavorite(ids.includes(nextData.id));
          } catch (error) {
            console.warn('Could not load favorite status for tour:', error);
            setIsFavorite(false);
          }
        } else {
          setIsFavorite(false);
        }
      } catch (error) {
        console.error('Failed to load tour:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadTour();
  }, [slug, user]);

  // ==========================================
  // PRICES
  // ==========================================

  const adultPrice = Number(data?.discountPrice || data?.startingPrice || 0);

  const childrenPrice = Number(data?.childrenPrice || 0);

  const totalPrice = useMemo(() => {
    return adultPrice * form.adults + childrenPrice * form.children;
  }, [adultPrice, childrenPrice, form.adults, form.children]);

  // ==========================================
  // DEPARTURE DATES
  // ==========================================

  const departureDates: string[] = Array.isArray(data?.departureDates)
    ? data.departureDates.filter(Boolean)
    : [];

  const today = getToday();
  const validDepartureDates = departureDates.filter((date) =>
    isValidDepartureDate(date, today),
  );
  const hasDepartureDates = validDepartureDates.length > 0;
  const travelerCount = form.adults + form.children;
  const groupCount = Number(data?.groupCount);
  const groupLimitReached = groupCount > 0 && travelerCount >= groupCount;

  // ==========================================
  // FAVORITES
  // ==========================================

  async function toggleFavorite() {
    if (authLoading) return;

    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/tours/${slug}`)}`);
      return;
    }

    if (!data?.id) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const current = Array.isArray(userSnap.data()?.favoriteTours)
        ? (userSnap.data()?.favoriteTours as string[])
        : [];

      const nextFavorites = current.includes(data.id)
        ? current.filter((id) => id !== data.id)
        : [...current, data.id];

      await setDoc(
        userRef,
        {
          favoriteTours: nextFavorites,
        },
        { merge: true },
      );

      setIsFavorite((prev) => !prev);
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  }

  // ==========================================
  // OPEN BOOKING
  // ==========================================

  function openBooking() {
    if (!hasDepartureDates) return;

    setBookingError('');
    setBookingSuccess(false);

    setForm({
      departureDate: validDepartureDates[0] || '',
      adults: 1,
      children: 0,
    });

    setBookingOpen(true);
  }

  // ==========================================
  // CLOSE BOOKING
  // ==========================================

  function closeBooking() {
    if (bookingLoading) return;

    setBookingOpen(false);
    setBookingError('');
    setBookingSuccess(false);
  }

  // ==========================================
  // CREATE BOOKING
  // ==========================================

  async function createBooking() {
    setBookingError('');

    if (authLoading) {
      return;
    }

    if (!user) {
      setBookingError(
        'Захиалга үүсгэхийн тулд эхлээд өөрийн бүртгэлээр нэвтэрнэ үү.',
      );
      return;
    }

    if (!form.adults && !form.children) {
      setBookingError('Хамгийн багадаа нэг аялагч сонгоно уу.');
      return;
    }

    if (
      !isValidDepartureDate(form.departureDate, today) ||
      !validDepartureDates.includes(form.departureDate)
    ) {
      setBookingError('Аялах боломжтой огноогоо сонгоно уу.');
      return;
    }

    if (form.adults < 1) {
      setBookingError('Том хүний тоо хамгийн багадаа 1 байна.');
      return;
    }

    if (form.children < 0) {
      setBookingError('Хүүхдийн тоо буруу байна.');
      return;
    }

    if (groupLimitReached) {
      setBookingError(
        `Нийт аялагчдын тоо группийн тооноос бага байх ёстой. Дээд тал нь ${groupCount - 1} аялагч сонгоно уу.`,
      );
      return;
    }

    try {
      setBookingLoading(true);

      // Optional user profile
      let profile: any = {};

      try {
        const profileSnap = await getDoc(doc(db, 'users', user.uid));

        if (profileSnap.exists()) {
          profile = profileSnap.data();
        }
      } catch {
        // Profile байхгүй байсан ч booking үүсгэх боломжтой
      }

      await addDoc(collection(db, 'bookings'), {
        uid: user.uid,

        userEmail: user.email || '',
        userName: profile.name || profile.fullName || user.displayName || '',

        tourId: data.id,
        tourName: data.name,
        tourSlug: data.slug || slug,
        tourImage: data.image || '',

        departureDate: form.departureDate || null,

        adults: form.adults,
        children: form.children,
        travelers: form.adults + form.children,

        adultPrice,
        childrenPrice,

        totalPrice,
        currency: data.currency || 'MNT',

        status: 'pending',

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setBookingSuccess(true);
    } catch (error) {
      console.error('Booking creation failed:', error);

      setBookingError('Захиалга үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setBookingLoading(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-[360px] rounded-[2rem] bg-slate-100 dark:bg-slate-900" />

            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-900" />
                <div className="h-10 w-2/3 rounded bg-slate-100 dark:bg-slate-900" />
                <div className="h-20 rounded bg-slate-100 dark:bg-slate-900" />
              </div>

              <div className="h-52 rounded-3xl bg-slate-100 dark:bg-slate-900" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Tour not found
          </p>

          <h1 className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">
            Аялал олдсонгүй
          </h1>

          <Link
            href="/tours"
            className="mt-7 inline-flex rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
          >
            Аяллууд руу буцах
          </Link>
        </div>
      </main>
    );
  }

  const price = adultPrice;

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.12]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage:
              'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
          {/* ==========================================
              HERO IMAGE
          ========================================== */}

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <img
              src={data.image}
              alt={data.name}
              className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[480px]"
            />

            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={isFavorite ? 'Дуртайгаас хасах' : 'Дуртайд нэмэх'}
              className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200"
            >
              <Heart
                size={20}
                className={
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-slate-700 dark:text-slate-200'
                }
              />
            </button>

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                {data.region || 'Travel'}
              </p>

              <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {data.name}
              </h1>
            </div>
          </div>

          {/* ==========================================
              MAIN CONTENT
          ========================================== */}

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
            <article>
              {/* Intro */}

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  {data.country || 'Destination'}
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                  {data.name}
                </h2>

                {data.summary && (
                  <p className="mt-5 max-w-3xl text-[15px] leading-8 text-slate-600 dark:text-slate-300">
                    {data.summary}
                  </p>
                )}
              </div>

              {/* ==========================================
                  QUICK INFO
              ========================================== */}

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  icon={<CalendarDays size={17} />}
                  label="Хугацаа"
                  value={`${data.durationDays || 0} өдөр`}
                />

                <InfoCard
                  icon={<Users size={17} />}
                  label="Группийн тоо"
                  value={
                    data.groupCount
                      ? `${data.groupCount} групп`
                      : 'Мэдээлэл хараахан ороогүй'
                  }
                />

                <InfoCard
                  icon={<Hotel size={17} />}
                  label="Зочид буудал"
                  value={data.hotel || 'Мэдээлэл хараахан ороогүй'}
                />

                <InfoCard
                  icon={<Plane size={17} />}
                  label="Нислэг"
                  value={data.flight || 'Мэдээлэл хараахан ороогүй'}
                />
              </div>

              {/* ==========================================
                  ITINERARY
              ========================================== */}

              {Array.isArray(data.itinerary) && data.itinerary.length > 0 && (
                <section className="mt-16">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Itinerary
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                    Аяллын хөтөлбөр
                  </h2>

                  <div className="mt-7 space-y-3">
                    {data.itinerary.map((d: any, index: number) => (
                      <div
                        key={`${d.day}-${index}`}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                      >
                        <div className="flex gap-4">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                            {d.day || index + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-bold">
                              {d.title || `${index + 1}-р өдөр`}
                            </p>

                            {d.detail && (
                              <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">
                                {d.detail}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ==========================================
                  INCLUDED / EXCLUDED
              ========================================== */}

              {(data.included?.length || data.excluded?.length) && (
                <section className="mt-16 border-t border-slate-200 pt-12 dark:border-slate-800">
                  <div className="grid gap-10 md:grid-cols-2">
                    {data.included?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                          Included
                        </p>

                        <h3 className="mt-3 text-xl font-bold">Үнэд багтсан</h3>

                        <div className="mt-5 space-y-3">
                          {data.included.map((item: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {data.excluded?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                          Excluded
                        </p>

                        <h3 className="mt-3 text-xl font-bold">
                          Үнэд багтаагүй
                        </h3>

                        <div className="mt-5 space-y-3">
                          {data.excluded.map((item: string, i: number) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"
                            >
                              <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </article>

            {/* ==========================================
                BOOKING CARD
            ========================================== */}

            <aside className="lg:sticky lg:top-8 lg:h-fit">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Аяллын үнэ
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-bold tracking-tight">
                    {Number(price).toLocaleString()}
                  </span>

                  <span className="pb-1 text-sm font-medium text-slate-400">
                    {data.currency || 'MNT'}
                  </span>
                </div>

                {data.discountPrice > 0 &&
                  data.discountPrice < data.startingPrice && (
                    <p className="mt-1 text-sm text-slate-400 line-through">
                      {Number(data.startingPrice).toLocaleString()}{' '}
                      {data.currency || 'MNT'}
                    </p>
                  )}

                <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

                {hasDepartureDates && (
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Явах боломжтой огноо
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {validDepartureDates.length} огноо
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={openBooking}
                  disabled={!hasDepartureDates}
                  className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 dark:disabled:hover:bg-white"
                >
                  Энэ аяллыг захиалах
                </button>

                {!user && !authLoading && (
                  <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                    Захиалга үүсгэхийн өмнө нэвтрэх шаардлагатай.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ==================================================
          BOOKING MODAL
      ================================================== */}

      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-5"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !bookingLoading) {
              closeBooking();
            }
          }}
        >
          <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl dark:bg-slate-950 sm:max-w-lg sm:rounded-[2rem]">
            {/* Close */}

            <button
              type="button"
              onClick={closeBooking}
              disabled={bookingLoading}
              className="absolute right-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {bookingSuccess ? (
              /* ==========================================
                 SUCCESS
              ========================================== */

              <div className="px-7 py-12 text-center sm:px-10">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                  <Check className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>

                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Booking received
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight">
                  Захиалга амжилттай илгээгдлээ
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Таны захиалгыг хүлээн авлаа. Захиалгын төлөвийг өөрийн
                  бүртгэлээс харах боломжтой.
                </p>

                <div className="mt-7 rounded-2xl bg-slate-50 p-5 text-left dark:bg-slate-900">
                  <p className="text-sm font-bold">{data.name}</p>

                  {form.departureDate && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Явах огноо: {formatDate(form.departureDate)}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Том хүн: {form.adults} · Хүүхэд: {form.children}
                  </p>

                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Нийт үнэ</p>

                    <p className="mt-1 text-xl font-bold">
                      {totalPrice.toLocaleString()} {data.currency || 'MNT'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={closeBooking}
                    className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Хаах
                  </button>

                  <Link
                    href="/account"
                    onClick={closeBooking}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
                  >
                    Захиалга харах
                  </Link>
                </div>
              </div>
            ) : (
              /* ==========================================
                 BOOKING FORM
              ========================================== */

              <div className="px-6 pb-7 pt-8 sm:px-8">
                <div className="pr-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Tour booking
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    Аяллаа захиалах
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Доорх мэдээллийг сонгоод захиалгаа илгээнэ үү.
                  </p>
                </div>

                {/* Tour mini card */}

                <div className="mt-6 flex gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                  <img
                    src={data.image}
                    alt={data.name}
                    className="h-16 w-20 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{data.name}</p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {data.durationDays} өдөр · {data.country}
                    </p>
                  </div>
                </div>

                {/* Login warning */}

                {!user && !authLoading && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      Нэвтрэх шаардлагатай
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                      Захиалга үүсгэхийн тулд эхлээд өөрийн бүртгэлээр нэвтэрнэ
                      үү.
                    </p>

                    <Link
                      href="/auth/login"
                      className="mt-3 inline-flex text-xs font-bold text-amber-900 underline dark:text-amber-300"
                    >
                      Нэвтрэх
                    </Link>
                  </div>
                )}

                {/* Error */}

                {bookingError && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                      {bookingError}
                    </p>
                  </div>
                )}

                {/* Departure date */}

                {hasDepartureDates && (
                  <div className="mt-6">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Явах огноо
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <select
                        value={form.departureDate}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            departureDate: e.target.value,
                          }))
                        }
                        className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
                      >
                        <option value="">Огноо сонгоно уу</option>

                        {validDepartureDates.map((date) => (
                          <option key={date} value={date}>
                            {formatDate(date)}
                          </option>
                        ))}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                )}

                {/* Travelers */}

                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      Аялагчид
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Adults */}

                    <TravelerCounter
                      title="Том хүн"
                      subtitle={`${adultPrice.toLocaleString()} ${
                        data.currency || 'MNT'
                      } / хүн`}
                      value={form.adults}
                      min={1}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          adults: value,
                        }))
                      }
                    />

                    {/* Children */}

                    <TravelerCounter
                      title="Хүүхэд"
                      subtitle={
                        childrenPrice > 0
                          ? `${childrenPrice.toLocaleString()} ${
                              data.currency || 'MNT'
                            } / хүүхэд`
                          : 'Хүүхдийн үнэ оруулаагүй'
                      }
                      value={form.children}
                      min={0}
                      disabled={childrenPrice <= 0}
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          children: value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Total */}

                <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white dark:bg-white dark:text-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60 dark:text-slate-500">
                      Нийт аялагч
                    </span>

                    <span className="text-sm font-semibold">
                      {travelerCount}
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <span className="text-sm text-white/60 dark:text-slate-500">
                      Нийт үнэ
                    </span>

                    <span className="text-2xl font-bold">
                      {totalPrice.toLocaleString()}{' '}
                      <span className="text-sm font-medium opacity-60">
                        {data.currency || 'MNT'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="button"
                  onClick={createBooking}
                  disabled={bookingLoading || !user || groupLimitReached}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Захиалга үүсгэж байна...
                    </>
                  ) : (
                    'Захиалга баталгаажуулах'
                  )}
                </button>

                <button
                  type="button"
                  onClick={closeBooking}
                  disabled={bookingLoading}
                  className="mt-3 h-11 w-full rounded-xl text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  Болих
                </button>

                <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                  Захиалга илгээсний дараа манай ажилтан тантай холбогдож
                  баталгаажуулна.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ==================================================
// INFO CARD
// ==================================================

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

// ==================================================
// TRAVELER COUNTER
// ==================================================

function TravelerCounter({
  title,
  subtitle,
  value,
  min,
  disabled = false,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: number;
  min: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-4 ${
        disabled
          ? 'border-slate-100 opacity-50 dark:border-slate-900'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          −
        </button>

        <span className="w-5 text-center text-sm font-bold">{value}</span>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(value + 1)}
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ==================================================
// DATE FORMAT
// ==================================================

function formatDate(value: string) {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
