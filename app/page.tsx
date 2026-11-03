'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Globe2,
  HeartHandshake,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const tours = [
  {
    title: 'Хайнань',
    subtitle: 'Далайн эргийн төгс амралт',
    region: 'Хятад',
    image:
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=90',
  },
  {
    title: 'Япон',
    subtitle: 'Соёл, хот ба байгалийн аялал',
    region: 'Ази',
    image:
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1600&q=90',
  },
  {
    title: 'Говь',
    subtitle: 'Монголын гайхамшгийг мэдрэхүй',
    region: 'Монгол',
    image:
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=90',
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    number: '01',
    title: 'Найдвартай үйлчилгээ',
    description: 'Аяллын мэдээлэл, захиалга болон зөвлөгөөг нэг дороос ойлгомжтой аваарай.',
  },
  {
    icon: Compass,
    number: '02',
    title: 'Зөв сонголт',
    description: 'Таны цаг, төсөв, сонирхолд тохирсон аяллыг хамтдаа сонгоход тусална.',
  },
  {
    icon: HeartHandshake,
    number: '03',
    title: 'Хүн төвтэй дэмжлэг',
    description: 'Аяллын өмнө болон аяллын үеэр танд хэрэгтэй мэдээллээр дэмжин ажиллана.',
  },
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'articles'), where('published', '==', true)),
      (snapshot) => {
        setPosts(
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .slice(0, 3),
        );
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
        {/* subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px)
            `,
            backgroundSize: '72px 72px',
            maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
          }}
        />

        {/* soft ambient light */}
        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#eadcc9]/30 blur-3xl dark:bg-slate-800/30" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#dfe8e5]/40 blur-3xl dark:bg-slate-900/40" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            {/* left */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                <Sparkles size={13} />
                Happy World Tour
              </div>

              <h1 className="mt-7 text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[72px]">
                Дараагийн
                <br />
                <span className="text-[#b77b3b]">дурсамж</span>
                <br />
                эндээс эхэлнэ.
              </h1>

              <p className="mt-7 max-w-lg text-[15px] leading-8 text-slate-500 dark:text-slate-400 sm:text-base">
                Танд тохирсон аяллаа сонгож, аяллын өмнөх бэлтгэлээс эхлээд аяллын турш найдвартай
                хамт байна.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/tours"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Аяллуудаа үзэх
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                >
                  Зөвлөгөө авах
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#b77b3b]" />
                  Найдвартай үйлчилгээ
                </span>

                <span className="flex items-center gap-2">
                  <Globe2 size={15} className="text-[#b77b3b]" />
                  Олон улсын чиглэл
                </span>

                <span className="flex items-center gap-2">
                  <Users size={15} className="text-[#b77b3b]" />
                  Хувь хүнд тохирсон
                </span>
              </div>
            </div>

            {/* right visual */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=92"
                  alt="Happy World Tour"
                  className="h-[480px] w-full object-cover sm:h-[560px] lg:h-[620px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                {/* image label */}
                <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-md">
                  <MapPin size={13} />
                  Discover the world
                </div>

                {/* bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/65">
                        Your next destination
                      </p>

                      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Дэлхий таныг хүлээж байна.
                      </h2>
                    </div>

                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-slate-950 sm:flex">
                      <Plane size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* floating card */}
              <div className="absolute -bottom-6 left-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-900 sm:left-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4eadc] text-[#a96f2d] dark:bg-slate-800 dark:text-[#e8bb80]">
                    <Star size={17} fill="currentColor" />
                  </div>

                  <div>
                    <p className="text-sm font-bold">4.5 / 5.0</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">Аялагчдын үнэлгээ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="-mt-1 border-b border-slate-200 py-8 dark:border-slate-800">
          <div className="grid divide-y divide-slate-200 dark:divide-slate-800 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {[
              ['3,865+', 'Аз жаргалтай аялагч'],
              ['16', 'Аяллын чиглэл'],
              ['3+', 'Жилийн туршлага'],
              ['4.5', 'Дундаж үнэлгээ'],
            ].map(([number, label]) => (
              <div key={label} className="flex items-center justify-center gap-4 px-5 py-5 sm:py-2">
                <p className="text-2xl font-bold tracking-tight sm:text-3xl">{number}</p>

                <p className="max-w-[100px] text-[11px] font-medium uppercase leading-5 tracking-[0.08em] text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED TOURS
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a96f2d]">
              Featured destinations
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Танд таалагдах аяллууд
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              Амралт, адал явдал, гэр бүл, найз нөхөд гээд таны аяллын зорилгод тохирох чиглэлүүд.
            </p>
          </div>

          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:text-[#a96f2d] dark:text-white"
          >
            Бүх аяллыг үзэх
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {tours.map((tour, index) => (
            <Link
              href="/tours"
              key={tour.title}
              className={`group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 ${
                index === 0 ? 'md:translate-y-5' : ''
              }`}
            >
              <div className="relative h-[430px] overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 backdrop-blur dark:bg-black/40 dark:text-white">
                  {tour.region}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                    <MapPin size={13} />
                    {tour.region}
                  </div>

                  <h3 className="mt-2 text-3xl font-bold tracking-tight text-white">
                    {tour.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/70">{tour.subtitle}</p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white">
                    Дэлгэрэнгүй
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          WHY HWT
      ====================================================== */}
      <section className="border-y border-slate-200 bg-[#f8f5f0] dark:border-slate-800 dark:bg-[#111927]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a96f2d]">
                Why Happy World Tour
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                Аяллаа
                <br />
                <span className="text-slate-400 dark:text-slate-500">санаа зоволтгүй төлөвлө.</span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
                Бид аяллын хамгийн чухал зүйлсийг энгийн болгож, таны цаг болон сонголтыг хүндэтгэн
                ажилладаг.
              </p>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.number}
                    className="group grid gap-5 py-7 first:pt-0 last:pb-0 sm:grid-cols-[70px_45px_1fr]"
                  >
                    <span className="text-xs font-semibold text-slate-400">{benefit.number}</span>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#a96f2d] transition group-hover:bg-[#a96f2d] group-hover:text-white dark:border-slate-700 dark:bg-slate-900">
                      <Icon size={17} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold">{benefit.title}</h3>

                      <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BLOG
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a96f2d]">
              Travel journal
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Аяллын тэмдэглэл
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#a96f2d]"
          >
            Бүгдийг унших
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {posts.length > 0
            ? posts.map((article, index) => (
                <Link
                  href="/blog"
                  key={article.id}
                  className={`group ${index === 0 ? 'md:col-span-2' : ''}`}
                >
                  <div
                    className={`relative overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 ${
                      index === 0 ? 'h-[390px]' : 'h-[300px]'
                    }`}
                  >
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#eee5d8] dark:bg-slate-800">
                        <CalendarDays size={30} className="text-[#b77b3b]" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                        АЯЛЛЫН БЛОГ
                      </p>

                      <h3
                        className={`mt-2 font-bold tracking-tight text-white ${
                          index === 0 ? 'text-2xl sm:text-3xl' : 'text-xl'
                        }`}
                      >
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-white/70">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white">
                        Унших
                        <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            : [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-dashed border-slate-300 p-7 dark:border-slate-700"
                >
                  <CalendarDays className="text-[#b77b3b]" size={22} />

                  <h3 className="mt-5 font-bold">Удахгүй шинэ нийтлэл</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Аяллын зөвлөгөө, сонирхолтой түүхүүд удахгүй нэмэгдэнэ.
                  </p>
                </div>
              ))}
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#172033] px-7 py-12 text-white sm:px-12 sm:py-14 lg:px-16">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#b77b3b]/20 blur-2xl" />

          <div className="pointer-events-none absolute bottom-[-100px] left-1/3 h-60 w-60 rounded-full bg-white/5 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                Your next journey
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Дараагийн аяллаа
                <br />
                хамтдаа төлөвлөе.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/60">
                Чиглэлээ хараахан сонгоогүй бол зүгээр. Танд тохирох аяллыг хамтдаа олъё.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-[#fff8ef]"
            >
              Холбогдох
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
