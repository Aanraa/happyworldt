'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nunito } from 'next/font/google';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookOpen, ArrowRight, CalendarDays, Clock } from 'lucide-react';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function Blog() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'articles'), where('published', '==', true)),
        (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    [],
  );
  const featured = items[0];
  const recommended = items.slice(1);

  return (
    <main
      className={`${nunito.className} mx-auto max-w-7xl px-4 py-14 sm:py-20`}
    >
      <div className="max-w-3xl space-y-6">
        <div className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.3em] text-[#a96f2d]">
            <BookOpen size={16} /> Аяллын блог
          </p>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Аяллын түүх, туршлага, санаа
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Очих газруудын зөвлөгөө, сонирхолтой аяллын өгүүллэгүүд болон тусгай
            зөвлөмжүүдийг эндээс аваарай.
          </p>
        </div>
      </div>

      {featured && (
        <section className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
          <Link
            href={`/blog/${featured.slug || featured.id}`}
            className="group overflow-hidden rounded-[2rem] border border-[#e7dfd2] bg-white shadow-lg transition duration-200 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-700 dark:bg-[#0f172a]"
          >
            {featured.coverImage ? (
              <img
                src={featured.coverImage}
                alt={featured.title}
                className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-[420px] bg-slate-200 dark:bg-slate-800" />
            )}
            <div className="p-8">
              <span className="inline-flex rounded-full bg-[#f9ede0] px-3 py-1 text-xs font-semibold uppercase tracking-[.3em] text-[#a96f2d] dark:bg-[#1f2937] dark:text-[#f6c77d]">
                Онцлох нийтлэл
              </span>
              <h2 className="mt-6 text-4xl font-black leading-tight text-slate-900 dark:text-white">
                {featured.title}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} />{' '}
                  {new Date(
                    featured.createdAt?.seconds
                      ? featured.createdAt.seconds * 1000
                      : featured.createdAt,
                  ).toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={16} />{' '}
                  {Math.max(
                    1,
                    Math.ceil((featured.content || '').split(' ').length / 200),
                  )}{' '}
                  min
                </span>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[.2em] text-[#a96f2d] transition group-hover:translate-x-1">
                Дэлгэрэнгүй <ArrowRight size={16} className="text-[#a96f2d]" />
              </span>
            </div>
          </Link>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-[#f0e4d8] bg-[#fff9f1] p-7 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[.28em] text-[#a96f2d] dark:text-[#e8bb80]">
                Бусдад санал болгож байна
              </p>
              <h3 className="mt-4 text-3xl font-black leading-tight">
                Танд таалагдах нийтлэлүүд
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Өмнөх нийтлэлүүдээс сонгосон хамгийн сонирхолтой, хэрэглэгчид их
                уншсан агуулгууд.
              </p>
            </div>

            <div className="space-y-5">
              {recommended.map((a) => (
                <Link
                  key={a.id}
                  href={`/blog/${a.slug || a.id}`}
                  className="group block overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-[#182234]"
                >
                  <div className="grid gap-4 md:grid-cols-[110px_1fr] p-5">
                    {a.coverImage && (
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="h-28 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105 md:h-full"
                      />
                    )}
                    <div>
                      <p className="inline-flex rounded-full bg-[#f9ede0] px-3 py-1 text-[10px] font-semibold uppercase tracking-[.24em] text-[#a96f2d] dark:bg-[#1f2937] dark:text-[#e8bb80]">
                        Бусад нийтлэл
                      </p>
                      <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                        {a.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {a.excerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} />{' '}
                          {new Date(
                            a.createdAt?.seconds
                              ? a.createdAt.seconds * 1000
                              : a.createdAt,
                          ).toLocaleDateString('mn-MN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} />{' '}
                          {Math.max(
                            1,
                            Math.ceil(
                              (a.content || '').split(' ').length / 200,
                            ),
                          )}{' '}
                          min
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!items.length && (
        <div className="mt-10 rounded-3xl border border-dashed border-[#dccdbb] p-12 text-center dark:border-slate-700">
          <BookOpen className="mx-auto text-[#b77b3b]" />
          <p className="mt-4 font-bold">Одоогоор нийтлэл нэмэгдээгүй байна.</p>
          <p className="mt-2 text-sm text-slate-500">
            Удахгүй аяллын шинэ зөвлөгөө, түүхүүд нэмэгдэнэ.
          </p>
        </div>
      )}
    </main>
  );
}
