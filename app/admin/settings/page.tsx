'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

type SiteSettings = {
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  description?: string;
};

export default function Settings() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState('');
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
        setCompanyName(d.companyName || '');
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
        companyName,
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
    setMsg('Мэдээлэл хадгалагдлаа.');
  }

  return (
    <main>
      <h2 className="text-2xl font-black">Сайтын холбоо барих мэдээлэл</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Энд оруулсан мэдээлэл нь public contact хэсэгт автоматаар харагдана.
      </p>
      <div className="mt-5 max-w-3xl rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <input
          className="w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Компаний нэр"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Имэйл"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Утас"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <textarea
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Хаяг"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Ажлын цаг"
          value={workingHours}
          onChange={(e) => setWorkingHours(e.target.value)}
        />
        <textarea
          className="mt-3 min-h-28 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Товч тайлбар"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={save}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Хадгалах
        </button>
        {msg && <p className="mt-3 text-sm text-green-600">{msg}</p>}
      </div>
    </main>
  );
}
