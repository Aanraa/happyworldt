'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Nunito } from 'next/font/google';
import { db } from '@/lib/firebase';
import { ArrowLeft, CalendarDays, Clock } from 'lucide-react';
import Link from 'next/link';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export default function BlogArticlePage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [article, setArticle] = useState<any>(null);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) {
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'articles'), where('slug', '==', slug));
      const snapshot = await getDocs(q);
      let currentArticle = null;

      if (!snapshot.empty) {
        currentArticle = {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data(),
        };
      } else {
        const docRef = doc(db, 'articles', slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          currentArticle = { id: docSnap.id, ...docSnap.data() };
        }
      }

      setArticle(currentArticle);
      setLoading(false);

      if (currentArticle) {
        const recQuery = query(
          collection(db, 'articles'),
          where('published', '==', true),
        );
        const recSnapshot = await getDocs(recQuery);
        setRecommended(
          recSnapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((item) => item.id !== currentArticle.id)
            .slice(0, 3),
        );
      }
    }

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-lg font-semibold">Ачааллаж байна...</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-lg font-semibold">Нийтлэл олдсонгүй.</p>
        <Link
          href="/blog"
          className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-white"
        >
          Буцах
        </Link>
      </main>
    );
  }

  return (
    <main className={`${nunito.className} mx-auto max-w-4xl px-4 py-14`}>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#a96f2d]"
      >
        <ArrowLeft size={16} /> Буцах
      </Link>
      <article className="mt-8 rounded-[2rem] border border-[#e7dfd0] bg-white p-6 shadow-lg transition dark:border-slate-700 dark:bg-[#141925]">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-72 w-full rounded-[1.5rem] object-cover"
          />
        )}
        <div className="mt-6">
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} />{' '}
              {new Date(
                article.createdAt?.seconds
                  ? article.createdAt.seconds * 1000
                  : article.createdAt,
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
                Math.ceil((article.content || '').split(' ').length / 200),
              )}{' '}
              минут
            </span>
          </div>

          <div className="mt-8 space-y-6 text-base leading-8 tracking-normal text-slate-700 dark:text-slate-300">
            <p>{article.content}</p>
          </div>
          <div className="mt-6 rounded-3xl bg-[#f9f1e7] px-5 py-4 text-sm leading-7 text-[#6f5135] dark:bg-[#1e2937] dark:text-slate-300 w-max">
            {article.excerpt}
          </div>
        </div>
      </article>
      {recommended.length > 0 && (
        <section className="mt-12 rounded-[2rem] border border-[#eadfce] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#182234]">
          <h2 className="text-2xl font-black">Бусад нийтлэл</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {recommended.map((item) => (
              <Link
                key={item.id}
                href={`/blog/${item.slug || item.id}`}
                className="group overflow-hidden rounded-3xl border border-[#e9e1d5] bg-white p-4 transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-[#0f172a]"
              >
                {item.coverImage && (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="h-36 w-full rounded-3xl object-cover"
                  />
                )}
                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
