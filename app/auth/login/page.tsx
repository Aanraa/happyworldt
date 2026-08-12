'use client';
import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function Login() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      router.push('/account');
    } catch (e: any) {
      setErr(e.message);
    }
  }
  async function google() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/account');
    } catch (e: any) {
      setErr(e.message);
    }
  }
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border p-7 dark:border-slate-800">
        <h1 className="text-3xl font-black">Тавтай морил</h1>
        {err && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {err}
          </p>
        )}
        <input
          className="mt-6 w-full rounded-xl border p-3 dark:bg-slate-900"
          placeholder="Имэйл"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-900"
          placeholder="Нууц үг"
          type="password"
          onChange={(e) => setPw(e.target.value)}
        />
        <button
          onClick={login}
          className="mt-4 w-full rounded-xl bg-blue-600 p-3 font-bold text-white"
        >
          Нэвтрэх
        </button>
        <button
          onClick={google}
          className="mt-3 w-full rounded-xl border p-3 font-bold"
        >
          Google-оор нэвтрэх
        </button>
        <p className="mt-5 text-sm">
          Account байхгүй юу?{' '}
          <Link className="font-bold text-blue-600" href="/auth/register">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </main>
  );
}
