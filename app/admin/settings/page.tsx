'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock3,
  FileText,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

type SiteSettings = {
  facebook?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  description?: string;
};

export default function Settings() {
  const { user } = useAuth();

  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'settings', 'site')).then((s) => {
      if (s.exists()) {
        const d = s.data() as SiteSettings;

        setFacebook(d.facebook || '');
        setInstagram(d.instagram || '');
        setEmail(d.email || '');
        setPhone(d.phone || '');
        setAddress(d.address || '');
        setWorkingHours(d.workingHours || '');
        setDescription(d.description || '');
      }
    });
  }, []);

  async function save() {
    await setDoc(
      doc(db, 'settings', 'site'),
      {
        facebook,
        instagram,
        email,
        phone,
        address,
        workingHours,
        description,
        updatedBy: user?.uid || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    setMsg('Мэдээлэл амжилттай хадгалагдлаа.');

    setTimeout(() => {
      setMsg('');
    }, 3000);
  }

  return (
    <main className="min-h-full bg-transparent text-slate-950 dark:text-white">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Сайтын тохиргоо
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Сайтын холбоо барих болон сошиал мэдээллээ эндээс удирдана уу. Энд хадгалсан мэдээлэл
              public website дээр автоматаар шинэчлэгдэнэ.
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          SETTINGS CARD
      ========================== */}
      <div className="max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* =====================
            SOCIAL
        ====================== */}
        <section className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Instagram className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Сошиал холбоос</h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Сайтын footer болон бусад хэсэгт харагдах холбоосууд
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Facebook */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </label>

              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
                placeholder="https://facebook.com/..."
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Instagram className="h-3.5 w-3.5" />
                Instagram
              </label>

              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
                placeholder="https://instagram.com/..."
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* =====================
            CONTACT
        ====================== */}
        <section className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Phone className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                  Холбоо барих мэдээлэл
                </h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Харилцагчид тантай холбогдох үндсэн мэдээлэл
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Email */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Mail className="h-3.5 w-3.5" />
                Имэйл
              </label>

              <input
                type="email"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
                placeholder="info@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Phone className="h-3.5 w-3.5" />
                Утас
              </label>

              <input
                type="tel"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
                placeholder="9900 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MapPin className="h-3.5 w-3.5" />
                Хаяг
              </label>

              <textarea
                className="min-h-[100px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
                placeholder="Байгууллагын хаяг"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* Working hours */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Clock3 className="h-3.5 w-3.5" />
                Ажлын цаг
              </label>

              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
                placeholder="Даваа–Баасан, 09:00–18:00"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* =====================
            DESCRIPTION
        ====================== */}
        <section className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <FileText className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">Товч тайлбар</h3>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Компани болон үйлчилгээний талаар товч мэдээлэл
                </p>
              </div>
            </div>
          </div>

          <textarea
            className="min-h-[140px] w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400 dark:focus:ring-white/5"
            placeholder="Компани, аяллын үйлчилгээнийхээ талаар товч тайлбар бичнэ үү..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>

        {/* =========================
            SAVE FOOTER
        ========================== */}
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2">
            {msg ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{msg}</p>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Өөрчлөлт хийсний дараа хадгалах товчийг дарна уу.
              </p>
            )}
          </div>

          <button
            onClick={save}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Save className="h-4 w-4" />
            Хадгалах
          </button>
        </div>
      </div>
    </main>
  );
}
