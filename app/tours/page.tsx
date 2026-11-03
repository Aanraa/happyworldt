'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Heart, MapPin } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

type Tour = {
  id: string;
  slug: string;
  name: string;
  image?: string;
  region?: string;
  category?: string;
  durationDays?: number | string;
  startingPrice?: number | string;
  discountPrice?: number | string;
  currency?: string;
  active?: boolean;
};

const categories = [
  { value: 'all', label: 'Бүх аялал' },
  { value: 'international', label: 'Гадаад аялал' },
  { value: 'domestic', label: 'Дотоод аялал' },
];

export default function Tours() {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Tour[]>([]);
  const [cat, setCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tours'),
      (snapshot) => {
        const tours = snapshot.docs
          .map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Tour,
          )
          .filter((tour) => tour.active !== false);

        setItems(tours);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load tours:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const favorited = Array.isArray(snapshot.data()?.favoriteTours)
        ? (snapshot.data()?.favoriteTours as string[])
        : [];

      setFavoriteIds(favorited);
    });

    return () => unsubscribe();
  }, [user]);

  async function toggleFavorite(
    event: React.MouseEvent<HTMLButtonElement>,
    tourId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent('/tours')}`);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const current = new Set(favoriteIds);

    if (current.has(tourId)) {
      current.delete(tourId);
    } else {
      current.add(tourId);
    }

    await setDoc(
      userRef,
      {
        favoriteTours: Array.from(current),
      },
      { merge: true },
    );
  }

  const filteredTours =
    cat === 'all' ? items : items.filter((tour) => tour.category === cat);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(15,23,42,0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15,23,42,0.045) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        }}
      />

      {/* Soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-slate-100/80 blur-3xl dark:bg-slate-900/60" />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        {/* HERO */}
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
            HWT COOL
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] sm:text-5xl lg:text-[62px] lg:leading-[1.03]">
            Аяллаа
            <br />
            <span className="text-slate-400 dark:text-slate-500">
              сонгоорой.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            Өөрт тохирох аяллаа сонгон, шинэ газар орон, шинэ дурсамжийг Happy
            World Tour-той хамт бүтээгээрэй.
          </p>
        </section>

        {/* CATEGORY */}
        <section className="mx-auto mt-14 max-w-5xl sm:mt-16">
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {categories.map((category) => {
                const active = cat === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setCat(category.value)}
                    className={`
                      rounded-xl px-4 py-2.5 text-sm font-semibold
                      transition-all duration-300
                      sm:px-6
                      ${
                        active
                          ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                      }
                    `}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* DIVIDER */}
        <section className="mx-auto mt-12 max-w-5xl border-t border-slate-200 pt-8 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Our journeys
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {cat === 'all'
                  ? 'Бүх аялал'
                  : cat === 'international'
                    ? 'Гадаад аялал'
                    : 'Дотоод аялал'}
              </h2>
            </div>

            <p className="hidden text-sm text-slate-400 sm:block">
              {filteredTours.length} аялал
            </p>
          </div>
        </section>

        {/* TOUR GRID */}
        <section className="mx-auto mt-8 max-w-5xl">
          {loading ? (
            <div className="grid gap-7 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-800"
                >
                  <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-900" />

                  <div className="space-y-3 p-6">
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTours.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2">
              {filteredTours.map((tour) => {
                const price = tour.discountPrice || tour.startingPrice || 0;
                const isFavorite = favoriteIds.includes(tour.id);

                return (
                  <div
                    key={tour.id}
                    className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={(event) => toggleFavorite(event, tour.id)}
                      aria-label={
                        isFavorite
                          ? 'Favorites-аас устгах'
                          : 'Favorites-д нэмэх'
                      }
                      className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-700 shadow-md backdrop-blur-sm transition hover:scale-105 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                    >
                      <Heart
                        size={18}
                        className={
                          isFavorite
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-700 dark:text-slate-200'
                        }
                      />
                    </button>

                    <Link href={`/tours/${tour.slug}`} className="block">
                      {/* IMAGE */}
                      <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800 sm:h-72">
                        {tour.image ? (
                          <img
                            src={tour.image}
                            alt={tour.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            Зураг байхгүй
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70" />

                        {/* Region */}
                        {tour.region && (
                          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 backdrop-blur-md">
                            <MapPin size={12} />
                            {tour.region}
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-xl font-bold tracking-[-0.025em] text-slate-950 transition group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300 sm:text-2xl">
                              {tour.name}
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                              {tour.durationDays && (
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays size={14} />
                                  {tour.durationDays} өдөр
                                </span>
                              )}

                              {tour.category && (
                                <span className="capitalize">
                                  {tour.category === 'international'
                                    ? 'Гадаад'
                                    : tour.category === 'domestic'
                                      ? 'Дотоод'
                                      : tour.category}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 transition group-hover:bg-slate-950 group-hover:text-white dark:border-slate-700 dark:group-hover:bg-white dark:group-hover:text-slate-950">
                            <ArrowRight
                              size={15}
                              className="transition-transform duration-300 group-hover:translate-x-0.5"
                            />
                          </div>
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Эхлэх үнэ
                          </p>

                          <p className="mt-1.5 text-lg font-bold tracking-tight">
                            {Number(price).toLocaleString()} {tour.currency}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-slate-200 px-6 py-20 text-center dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Одоогоор аялал нэмэгдээгүй байна.
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Удахгүй шинэ аяллууд нэмэгдэх болно.
              </p>
            </div>
          )}
        </section>

        {/* BOTTOM CTA */}
        <section className="mx-auto mt-20 max-w-5xl border-t border-slate-200 pt-12 dark:border-slate-800 lg:mt-24">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Your next destination
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Дараагийн аялал хаашаа вэ?
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Танд тохирох аяллыг хамтдаа олъё.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Бидэнтэй холбогдох
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
