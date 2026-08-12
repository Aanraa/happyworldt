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
  companyName?: string;
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
    <main className="mx-auto max-w-6xl px-4 py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] bg-white p-10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)]">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500">
              Холбоо барих
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">
              Send message
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Асуулт, санал, эсвэл аяллын хүсэлтээ доорх формоор бидэнд илгээнэ
              үү.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                placeholder="Нэр"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
                placeholder="Имэйл"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <input
              className="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
              placeholder="Утас"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className="min-h-[220px] w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-5 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-100"
              placeholder="Зурвас"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              onClick={send}
              className="inline-flex w-full items-center justify-center rounded-[2rem] bg-slate-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              Илгээх
            </button>
            {done && (
              <p className="text-sm text-emerald-600">
                Баярлалаа! Тантай ойрын хугацаанд холбогдоно.
              </p>
            )}
          </div>
        </section>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/95 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">
            Манай мэдээлэл
          </p>
          <h2 className="mt-4 text-3xl font-black text-white">
            Холбоо барих хаяг
          </h2>
          <div className="mt-8 space-y-4">
            {settings.phone && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-slate-950/70 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-slate-950">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Утас
                  </p>
                  <a
                    href={`tel:${settings.phone}`}
                    className="mt-2 block text-lg font-semibold text-white"
                  >
                    {settings.phone}
                  </a>
                </div>
              </div>
            )}

            {settings.email && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-slate-950/70 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-slate-950">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Имэйл
                  </p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-2 block text-lg font-semibold text-white"
                  >
                    {settings.email}
                  </a>
                </div>
              </div>
            )}

            {settings.address && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-slate-950/70 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-slate-950">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Хаяг
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {settings.address}
                  </p>
                </div>
              </div>
            )}

            {settings.workingHours && (
              <div className="flex items-start gap-4 rounded-[1.75rem] bg-slate-950/70 p-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-slate-950">
                  <Clock3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Ажлын цаг
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {settings.workingHours}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
