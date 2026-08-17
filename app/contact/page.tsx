'use client';

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { db } from '@/lib/firebase';

type SiteSettings = {
  facebook?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  description?: string;
};

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site')).then((s) => {
      if (s.exists()) {
        setSettings(s.data() as SiteSettings);
      }
    });
  }, []);

  async function send() {
    if (!name || !message) return;

    await addDoc(collection(db, 'messages'), {
      name,
      email,
      phone,
      message,
      createdAt: serverTimestamp(),
    });

    setDone(true);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-slate-100/70 blur-3xl dark:bg-slate-900/60" />

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
            Холбоо барих
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Бидэнтэй холбогдох
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
            Асуулт, санал, эсвэл аяллын хүсэлтээ бидэнд илгээнэ үү. Таны аяллын
            төлөвлөгөөг хамтдаа бодит болгоход бид үргэлж туслахад бэлэн.
          </p>
        </section>

        {/* =========================
            MAIN CONTENT
        ========================== */}
        <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 pt-10 dark:border-slate-800 sm:mt-20 sm:pt-12">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Зурвас илгээх
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Танд хэрэгтэй мэдээллээ үлдээгээрэй. Бид тантай удахгүй
                  холбогдох болно.
                </p>
              </div>

              <div className="space-y-5">
                {/* Name + Email */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Нэр
                    </label>

                    <input
                      type="text"
                      placeholder="Таны нэр"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-slate-900
                        focus:ring-2
                        focus:ring-slate-900/5
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-white
                        dark:placeholder:text-slate-500
                        dark:hover:border-slate-600
                        dark:focus:border-slate-400
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Имэйл
                    </label>

                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        text-slate-900
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-slate-900
                        focus:ring-2
                        focus:ring-slate-900/5
                        dark:border-slate-700
                        dark:bg-slate-900
                        dark:text-white
                        dark:placeholder:text-slate-500
                        dark:hover:border-slate-600
                        dark:focus:border-slate-400
                      "
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Утас
                  </label>

                  <input
                    type="tel"
                    placeholder="Утасны дугаар"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-900/5
                      dark:border-slate-700
                      dark:bg-slate-900
                      dark:text-white
                      dark:placeholder:text-slate-500
                      dark:hover:border-slate-600
                      dark:focus:border-slate-400
                    "
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Зурвас
                  </label>

                  <textarea
                    placeholder="Та юуны талаар асуухыг хүсэж байна вэ?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="
                      min-h-[180px]
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3.5
                      text-sm
                      leading-6
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-900/5
                      dark:border-slate-700
                      dark:bg-slate-900
                      dark:text-white
                      dark:placeholder:text-slate-500
                      dark:hover:border-slate-600
                      dark:focus:border-slate-400
                    "
                  />
                </div>

                {/* Submit */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={send}
                    className="
                      inline-flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      rounded-lg
                      bg-slate-950
                      px-6
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition
                      hover:bg-slate-800
                      active:scale-[0.99]
                      sm:w-auto
                      sm:min-w-[180px]
                    "
                  >
                    Илгээх
                  </button>
                </div>

                {done && (
                  <div className="border-l-2 border-emerald-500 bg-emerald-50 px-4 py-3">
                    <p className="text-sm font-medium text-emerald-700">
                      Баярлалаа! Тантай ойрын хугацаанд холбогдоно.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* =====================
                CONTACT INFORMATION
            ====================== */}
            <aside className="lg:border-l lg:border-slate-200 lg:pl-12">
              <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight text-slate-950">
                  Манай мэдээлэл
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Аялалтай холбоотой мэдээлэл авах бол бидэнтэй шууд
                  холбогдоорой.
                </p>
              </div>

              <div className="space-y-7">
                {/* Phone */}
                {settings.phone && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <Phone className="h-[17px] w-[17px] text-slate-700" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Утас
                      </p>

                      <a
                        href={`tel:${settings.phone}`}
                        className="mt-1.5 block text-sm font-semibold text-slate-950 transition hover:text-slate-500"
                      >
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {settings.email && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <Mail className="h-[17px] w-[17px] text-slate-700" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Имэйл
                      </p>

                      <a
                        href={`mailto:${settings.email}`}
                        className="mt-1.5 block break-all text-sm font-semibold text-slate-950 transition hover:text-slate-500"
                      >
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {settings.address && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <MapPin className="h-[17px] w-[17px] text-slate-700" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Хаяг
                      </p>

                      <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-950">
                        {settings.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {settings.workingHours && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <Clock3 className="h-[17px] w-[17px] text-slate-700" />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Ажлын цаг
                      </p>

                      <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-950">
                        {settings.workingHours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Socials */}
                {(settings.facebook || settings.instagram) && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-[17px] w-[17px] text-slate-700"
                        fill="currentColor"
                      >
                        <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8.9v-3h1.6V9.1c0-1.6 1-2.5 2.4-2.5.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1 0-1 1v1.3h1.7l-.3 3h-1.4v7A10 10 0 0 0 22 12z" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Social
                      </p>

                      <div className="mt-1.5 flex gap-4">
                        {settings.facebook && (
                          <a
                            href={settings.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-slate-950 transition hover:text-slate-500"
                          >
                            Facebook
                          </a>
                        )}

                        {settings.instagram && (
                          <a
                            href={settings.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-slate-950 transition hover:text-slate-500"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom divider / small note */}
              <div className="mt-12 border-t border-slate-200 pt-6">
                <p className="text-xs leading-5 text-slate-400">
                  Аяллын талаар нэмэлт мэдээлэл авах шаардлагатай бол бидэнтэй
                  хүссэн үедээ холбогдоорой.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
