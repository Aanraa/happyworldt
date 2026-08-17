'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Nunito } from 'next/font/google';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Copy,
  Facebook,
  Link2,
} from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
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
    month: 'long',
    day: 'numeric',
  });
}
function readingTime(content?: string) {
  const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
export default function BlogArticlePage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [article, setArticle] = useState<Article | null>(null);
  const [recommended, setRecommended] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    async function loadArticle() {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        /* * 1. Find article by slug */ const slugQuery = query(
          collection(db, 'articles'),
          where('slug', '==', slug),
        );
        const snapshot = await getDocs(slugQuery);
        let currentArticle: Article | null = null;
        if (!snapshot.empty) {
          const found = snapshot.docs[0];
          currentArticle = { id: found.id, ...found.data() } as Article;
        } else {
          /* * 2. Fallback to Firebase document ID */ const articleRef = doc(
            db,
            'articles',
            slug,
          );
          const articleSnap = await getDoc(articleRef);
          if (articleSnap.exists()) {
            currentArticle = {
              id: articleSnap.id,
              ...articleSnap.data(),
            } as Article;
          }
        }
        setArticle(currentArticle);
        /* * Recommended articles */ if (currentArticle) {
          const recQuery = query(
            collection(db, 'articles'),
            where('published', '==', true),
          );
          const recSnapshot = await getDocs(recQuery);
          const related = recSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }) as Article)
            .filter((item) => item.id !== currentArticle?.id)
            .sort((a, b) => {
              const aTime = a.createdAt?.seconds || 0;
              const bTime = b.createdAt?.seconds || 0;
              return bTime - aTime;
            })
            .slice(0, 3);
          setRecommended(related);
        }
      } catch (error) {
        console.error('Failed to load article:', error);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }
  function shareFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'noopener,noreferrer',
    );
  }
  function shareMessenger() {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/dialog/send?link=${url}&app_id=`,
      '_blank',
      'noopener,noreferrer',
    );
  }
  if (loading) {
    return (
      <main
        className={`${nunito.className} min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white`}
      >
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="animate-pulse">
            <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-7 h-12 max-w-3xl rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 h-12 max-w-xl rounded bg-slate-100 dark:bg-slate-800" />
            <div className="mt-10 aspect-[16/8] rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }
  if (!article) {
    return (
      <main
        className={`${nunito.className} min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white`}
      >
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 lg:py-28">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight dark:text-white">
            Нийтлэл олдсонгүй.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Таны хайсан нийтлэл устсан эсвэл буруу холбоос ашигласан байж
            магадгүй.
          </p>
          <Link
            href="/blog"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:gap-3 dark:text-white"
          >
            <ArrowLeft size={16} /> Блог руу буцах
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main
      className={`${nunito.className} relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3] dark:opacity-[0.12]"
        style={{
          backgroundImage: ` linear-gradient( to right, rgba(15,23,42,0.04) 1px, transparent 1px ), linear-gradient( to bottom, rgba(15,23,42,0.04) 1px, transparent 1px ) `,
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10 lg:py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft size={15} /> Блог руу буцах
        </Link>
        <header className="mx-auto mt-12 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            <span>Travel story</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{formatDate(article.createdAt)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{readingTime(article.content)} min read</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl lg:text-[54px]">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 dark:text-slate-400 sm:text-lg">
              {article.excerpt}
            </p>
          )}
        </header>
        {/* ===================================================== COVER IMAGE ====================================================== */}{' '}
        {article.coverImage && (
          <div className="relative mt-12 aspect-[16/8] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 sm:mt-14">
            <img
              src={article.coverImage}
              alt={article.title || 'Travel story'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
        <article className="mx-auto mt-12 max-w-3xl sm:mt-16">
          <div className="whitespace-pre-line text-[16px] leading-[2] text-slate-700 dark:text-slate-300">
            {article.content}
          </div>
        </article>
        <section className="mx-auto mt-16 max-w-3xl border-y border-slate-200 py-7 dark:border-slate-800">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                Share
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                Энэ түүхийг хуваалцах
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={shareFacebook}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <Facebook size={15} /> Facebook
              </button>
              <button
                type="button"
                onClick={shareMessenger}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <Link2 size={15} /> Messenger
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                {copied ? (
                  <>Хуулагдлаа</>
                ) : (
                  <>
                    <Copy size={15} /> Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
        <section className="mx-auto mt-16 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-[#f7f5f1] px-6 py-11 dark:bg-slate-900 sm:px-10 sm:py-12">
            <div className="relative z-10 max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Happy World Tour
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">
                Дараагийн аялал хаашаа вэ?
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                Өөрт тохирох аяллаа сонгоод аяллаа эхлүүлээрэй.
              </p>
              <Link
                href="/tours"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Аяллууд үзэх <ArrowRight size={16} />
              </Link>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-slate-300/60 dark:border-slate-700" />
            <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full border border-slate-300/50 dark:border-slate-700" />
          </div>
        </section>
        <section className="mx-auto mt-14 max-w-3xl border-t border-slate-200 pt-9 dark:border-slate-800">
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
                Аяллын санаа, зөвлөгөө болон сонирхолтой түүхүүдийг бидэнтэй
                хамт олж мэдээрэй.
              </p>
              <Link
                href="/tours"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition-all hover:gap-3 dark:text-white"
              >
                Аяллууд үзэх <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
        {recommended.length > 0 && (
          <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 pt-10 dark:border-slate-800 sm:mt-20 sm:pt-12">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
                Санал болгох
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-3xl">
                Сонирхож болох бусад нийтлэл
              </h2>
            </div>
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug || item.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title || 'Travel story'}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800" />
                    )}
                  </div>
                  <div className="pt-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {formatDate(item.createdAt)}
                    </p>
                    <h3 className="mt-3 text-lg font-bold leading-7 tracking-[-0.02em] text-slate-950 transition group-hover:text-slate-600 dark:text-white dark:group-hover:text-slate-300">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.excerpt}
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
              ))}
            </div>
          </section>
        )}
      </div>{' '}
    </main>
  );
}
