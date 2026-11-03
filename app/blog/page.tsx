'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nunito } from 'next/font/google';
import { ArrowRight, BookOpen, CalendarDays, Clock3 } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});
type Article = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  published?: boolean;
  createdAt?: any;
};
function formatDate(value: any) {
  if (!value) return '-';
  let date: Date;
  if (value?.seconds) {
    date = new Date(value.seconds * 1000);
  } else if (value?.toDate) {
    date = value.toDate();
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
function readingTime(content?: string) {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
export default function Blog() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'articles'), where('published', '==', true));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const articles = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Article)
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });
        setItems(articles);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load blog:', error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);
  const featured = items[0];
  const latest = items.slice(1);
  return (
    <main
      className={`${nunito.className} relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32] dark:opacity-[0.14]"
        style={{
          backgroundImage: ` linear-gradient( to right, rgba(15,23,42,0.04) 1px, transparent 1px ), linear-gradient( to bottom, rgba(15,23,42,0.04) 1px, transparent 1px ) `,
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 48%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 48%, transparent 100%)',
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[360px] w-[650px] -translate-x-1/2 rounded-full bg-slate-100/70 blur-3xl dark:bg-slate-900/60" />
      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
            Travel stories
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl lg:text-[54px] lg:leading-[1.06]">
            Нийтлэлүүд
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            Аяллын санаа, зөвлөгөө болон сонирхолтой түүхүүдийг бидэнтэй хамт олж мэдээрэй.
          </p>
        </section>
        {/* ===================================================== LOADING ====================================================== */}{' '}
        {loading && (
          <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 pt-10 dark:border-slate-800">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-5 pt-5">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-20 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </section>
        )}
        {/* ===================================================== EMPTY ====================================================== */}{' '}
        {!loading && !items.length && (
          <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 pt-10 dark:border-slate-800">
            <div className="border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
              <BookOpen className="mx-auto h-6 w-6 text-slate-400" />
              <h2 className="mt-5 text-lg font-bold dark:text-white">
                Одоогоор нийтлэл байхгүй байна.
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Удахгүй аяллын шинэ түүх, зөвлөгөө болон сонирхолтой нийтлэлүүд нэмэгдэнэ.
              </p>
            </div>
          </section>
        )}
        {/* ===================================================== FEATURED ====================================================== */}{' '}
        {!loading && featured && (
          <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 pt-10 dark:border-slate-800 sm:mt-20 sm:pt-12">
            <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-14">
              {' '}
              {/* Image */}{' '}
              <Link href={`/blog/${featured.slug || featured.id}`} className="group block">
                {' '}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                  {' '}
                  {featured.coverImage ? (
                    <img
                      src={featured.coverImage}
                      alt={featured.title || 'Travel story'}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-100" />
                  )}{' '}
                </div>{' '}
              </Link>{' '}
              {/* Content */}{' '}
              <div className="lg:pr-4">
                {' '}
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                  Онцлох нийтлэл
                </p>
                <Link href={`/blog/${featured.slug || featured.id}`} className="group">
                  <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] text-slate-950 transition group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300 sm:text-4xl">
                    {featured.title}
                  </h2>
                </Link>
                {featured.excerpt && (
                  <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-500 dark:text-slate-400">
                    {featured.excerpt}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  {' '}
                  <span className="inline-flex items-center gap-1.5">
                    {' '}
                    <CalendarDays size={14} /> {formatDate(featured.createdAt)}{' '}
                  </span>{' '}
                  <span className="h-1 w-1 rounded-full bg-slate-300" />{' '}
                  <span className="inline-flex items-center gap-1.5">
                    {' '}
                    <Clock3 size={14} /> {readingTime(featured.content)} мин{' '}
                  </span>{' '}
                </div>{' '}
                <Link
                  href={`/blog/${featured.slug || featured.id}`}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition-all hover:gap-3 dark:text-white"
                >
                  Нийтлэл унших <ArrowRight size={16} />
                </Link>
              </div>{' '}
            </div>{' '}
          </section>
        )}{' '}
        {/* ===================================================== LATEST ARTICLES ====================================================== */}{' '}
        {!loading && latest.length > 0 && (
          <section className="mx-auto mt-20 max-w-5xl border-t border-slate-200 pt-10 dark:border-slate-800 sm:mt-24 sm:pt-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                  Journal
                </p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-3xl">
                  Сүүлийн нийтлэлүүд
                </h2>
              </div>
              <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
                {latest.length} нийтлэл
              </span>
            </div>
            <div className="mt-8 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {' '}
              {latest.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug || article.id}`}
                  className="group block"
                >
                  {' '}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                    {' '}
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title || 'Travel story'}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-100" />
                    )}{' '}
                  </div>{' '}
                  <div className="pt-5">
                    <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      <span>{formatDate(article.createdAt)}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span>{readingTime(article.content)} min</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold leading-7 tracking-[-0.02em] text-slate-950 transition group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {article.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-950 dark:text-white">
                      Унших
                      <ArrowRight
                        size={13}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              ))}{' '}
            </div>{' '}
          </section>
        )}{' '}
        <section className="mx-auto mt-20 max-w-5xl border-t border-slate-200 pt-10 sm:mt-24 sm:pt-12">
          <div className="relative overflow-hidden rounded-2xl bg-[#f7f5f1] px-6 py-12 dark:bg-slate-900 sm:px-10 sm:py-14 lg:px-14">
            <div className="relative z-10 max-w-2xl">
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
                Дараагийн аялал хаашаа вэ?{' '}
              </h2>{' '}
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                {' '}
                Өөрт тохирох аяллаа сонгоод аяллаа эхлүүлээрэй.{' '}
              </p>{' '}
              <Link
                href="/tours"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {' '}
                Аяллууд үзэх <ArrowRight size={16} />{' '}
              </Link>{' '}
            </div>{' '}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-slate-300/60" />{' '}
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-slate-300/50" />{' '}
          </div>{' '}
        </section>
        <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 pb-8 pt-10 sm:mt-20 sm:pt-12">
          {' '}
          <div className="grid gap-6 sm:grid-cols-[0.65fr_1.35fr] sm:gap-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Тухай
              </p>
              <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Happy World Tour
              </h2>
            </div>
            <div>
              <p className="text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                Аяллын санаа, зөвлөгөө болон сонирхолтой түүхүүдийг бидэнтэй хамт олж мэдээрэй. Таны
                дараагийн аялалд хэрэг болох мэдээллийг нэг дороос хүргэхийг зорьдог.
              </p>
              <Link
                href="/tours"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition-all hover:gap-3 dark:text-white"
              >
                Аяллууд үзэх <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>{' '}
      </div>{' '}
    </main>
  );
}
