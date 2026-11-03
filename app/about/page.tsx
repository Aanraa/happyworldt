'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, CalendarDays, Clock3, Mail, MapPin, Phone, Plane, Users } from 'lucide-react';
import { db } from '@/lib/firebase';

type SiteSettings = {
  facebook?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  description?: string;

  companyDescription?: string;
  foundedYear?: number | string;
  teamSize?: number | string;
};

export default function About() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const snapshot = await getDoc(doc(db, 'settings', 'site'));

        if (snapshot.exists()) {
          setSettings(snapshot.data() as SiteSettings);
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const foundedYear = settings.foundedYear || '2020';
  const teamSize = settings.teamSize || 3;

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.12]"
        style={{
          backgroundImage: `             linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        }}
      />
      ```
      {/* Soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-slate-100/80 blur-3xl dark:bg-slate-900/60" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        {/* =========================
        HERO
    ========================== */}
        <section className="mx-auto max-w-4xl text-center">
          <p className="bold text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
            HWT
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-[-0.05em] text-slate-950 dark:text-white sm:text-5xl lg:text-[62px] lg:leading-[1.03]">
            Happy
            <br />
            <span className="text-slate-400 dark:text-slate-500">World Tour</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            Happy World Tour нь аялагчдад тохирсон аяллаа сонгоход нь тусалж, аяллын туршлагыг илүү
            хялбар, ойлгомжтой, найдвартай байлгахыг зорьдог аяллын компани юм.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/tours"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Аяллууд үзэх
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
            >
              Бидэнтэй холбогдох
            </Link>
          </div>
        </section>

        {/* =========================
        COMPANY STATS
    ========================== */}
        <section className="mx-auto mt-16 max-w-5xl border-y border-slate-200 py-8 dark:border-slate-800 sm:mt-20">
          <div className="grid divide-y divide-slate-200 dark:divide-slate-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-6 py-5 text-center sm:py-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CalendarDays size={17} className="text-slate-600 dark:text-slate-300" />
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight">{foundedYear}</p>

              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Үйл ажиллагаа
              </p>
            </div>

            <div className="px-6 py-5 text-center sm:py-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <Users size={17} className="text-slate-600 dark:text-slate-300" />
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight">{teamSize}</p>

              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Манай баг
              </p>
            </div>

            <div className="px-6 py-5 text-center sm:py-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <Plane size={17} className="text-slate-600 dark:text-slate-300" />
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight">Happy</p>

              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Travel first
              </p>
            </div>
          </div>
        </section>

        {/* =========================
        STORY
    ========================== */}
        <section className="mx-auto mt-20 max-w-5xl lg:mt-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Бидний тухай
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Аяллыг илүү
                <br />
                <span className="text-slate-400 dark:text-slate-500">энгийн болгоё.</span>
              </h2>
            </div>

            <div className="space-y-6 text-[15px] leading-8 text-slate-600 dark:text-slate-300">
              <p>
                {settings.companyDescription ||
                  settings.description ||
                  'Happy World Tour нь аялагч бүрт тохирсон аяллын сонголтыг хүргэж, аяллын өмнөх бэлтгэлээс эхлээд аяллын туршлагыг илүү хялбар, ойлгомжтой байлгахад анхааран ажилладаг.'}
              </p>

              <p>
                Бид аяллын мэдээллийг аль болох тодорхой хүргэж, таны хэрэгцээ болон сонирхолд
                тохирсон сонголтыг олоход тань тусална. Бидний хувьд аялал гэдэг зөвхөн нэг газраас
                нөгөө газар хүрэх биш, шинэ зүйл мэдэрч, дурсамж бүтээх боломж юм.
              </p>

              <p>
                Тиймээс бид аяллынхаа үйлчилгээг хүн бүрт ойлгомжтой, найдвартай, тухтай байлгахыг
                зорьдог.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
        CONTACT INFO
    ========================== */}
        <section className="mx-auto mt-20 max-w-5xl border-t border-slate-200 pt-12 dark:border-slate-800 lg:mt-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Холбоо барих
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em]">Бидэнтэй ярилцаарай.</h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                Аяллын талаар асуух зүйл байвал бидэнтэй холбогдоорой. Танд тохирох аяллыг хамтдаа
                сонгоход бид баяртай байх болно.
              </p>

              <Link
                href="/contact"
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-slate-500 dark:text-white"
              >
                Холбоо барих
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              {settings.phone && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <Phone size={17} className="text-slate-600 dark:text-slate-300" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Утас
                    </p>

                    <a
                      href={`tel:${settings.phone}`}
                      className="mt-1.5 block text-sm font-semibold hover:text-slate-500"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>
              )}

              {settings.email && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <Mail size={17} className="text-slate-600 dark:text-slate-300" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Имэйл
                    </p>

                    <a
                      href={`mailto:${settings.email}`}
                      className="mt-1.5 block break-all text-sm font-semibold hover:text-slate-500"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>
              )}

              {settings.address && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <MapPin size={17} className="text-slate-600 dark:text-slate-300" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Хаяг
                    </p>

                    <p className="mt-1.5 text-sm font-semibold leading-6">{settings.address}</p>
                  </div>
                </div>
              )}

              {settings.workingHours && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <Clock3 size={17} className="text-slate-600 dark:text-slate-300" />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Ажлын цаг
                    </p>

                    <p className="mt-1.5 text-sm font-semibold leading-6">
                      {settings.workingHours}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================
        FINAL CTA
    ========================== */}
        <section className="mx-auto mt-20 max-w-5xl border-t border-slate-200 pt-12 dark:border-slate-800 lg:mt-24">
          <div className="flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Next destination
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Дараагийн аялал хаашаа вэ?
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Өөрт тохирох аяллаа сонгоод аяллаа эхлүүлээрэй.
              </p>
            </div>

            <Link
              href="/tours"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Аяллууд үзэх
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Small loading state is intentionally subtle */}
        {loading && (
          <div className="mt-10 text-center text-xs text-slate-400">Мэдээлэл ачааллаж байна...</div>
        )}
      </div>
    </main>
  );
}
