'use client';

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Phone,
  Plane,
  ShieldCheck,
  UserRound,
  Loader2,
} from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthForm({
  initialMode = 'login',
}: {
  initialMode?: AuthMode;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = mode === 'login';
  const redirectTo = searchParams.get('next') || '/account';

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setErr('');
    setConfirmPw('');
  }

  async function submitAuth() {
    if (!isLogin) {
      if (!firstName || !lastName || !phone || !email || !pw || !confirmPw) {
        setErr(
          'Нэр, овог, утасны дугаар, имэйл болон нууц үгээ бүрэн оруулна уу.',
        );
        return;
      }
    } else if (!email || !pw) {
      setErr('Имэйл болон нууц үгээ оруулна уу.');
      return;
    }

    if (!isLogin && pw !== confirmPw) {
      setErr('Нууц үг таарахгүй байна.');
      return;
    }

    if (!isLogin && pw.length < 6) {
      setErr('Нууц үг хамгийн багадаа 6 тэмдэгттэй байна.');
      return;
    }

    try {
      setErr('');
      setLoading(true);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, pw);
      } else {
        await createUserWithEmailAndPassword(auth, email, pw);
      }

      router.push(redirectTo);
    } catch (e: any) {
      if (isLogin) {
        switch (e?.code) {
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            setErr('Имэйл эсвэл нууц үг буруу байна.');
            break;

          case 'auth/invalid-email':
            setErr('Имэйл хаяг буруу байна.');
            break;

          case 'auth/too-many-requests':
            setErr('Хэт олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.');
            break;

          default:
            setErr('Нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.');
        }
      } else {
        switch (e?.code) {
          case 'auth/email-already-in-use':
            setErr('Энэ имэйлээр бүртгэл аль хэдийн бий.');
            break;

          case 'auth/invalid-email':
            setErr('Имэйл хаяг буруу байна.');
            break;

          case 'auth/weak-password':
            setErr('Нууц үг сул байна. 6 тэмдэгтээс дээш оруулна уу.');
            break;

          default:
            setErr('Бүртгэл үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function googleAuth() {
    try {
      setErr('');
      setLoading(true);

      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push(redirectTo);
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        setErr(
          isLogin
            ? 'Google-ээр нэвтрэх үед алдаа гарлаа.'
            : 'Google-ээр бүртгүүлэх үед алдаа гарлаа.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !loading) {
      submitAuth();
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl dark:bg-slate-900" />

      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          <section className="hidden lg:block">
            <div className="max-w-lg">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                <Plane size={13} />
                Happy World Tour
              </div>

              <h1 className="text-[52px] font-bold leading-[1.04] tracking-[-0.055em]">
                Дараагийн
                <br />
                <span className="text-slate-400 dark:text-slate-500">
                  аялал чинь
                </span>
                <br />
                эндээс эхэлнэ.
              </h1>

              <p className="mt-5 max-w-md text-[14px] leading-6 text-slate-500 dark:text-slate-400">
                Бүртгэлдээ нэвтэрч аяллын мэдээлэл, захиалга болон өөрт тохирсон
                аяллуудаа нэг дороос хялбар удирдаарай.
              </p>

              <div className="mt-6 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <ShieldCheck size={15} />
                </div>

                <span>Таны бүртгэл аюулгүй хамгаалагдана</span>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-[24px] border border-slate-200 bg-white/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-none sm:p-7">
              <div>
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Plane size={18} />
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Account
                </p>

                <div className="mt-4 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    className={`h-10 rounded-lg text-[12px] font-semibold transition ${
                      isLogin
                        ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Нэвтрэх
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('register')}
                    className={`h-10 rounded-lg text-[12px] font-semibold transition ${
                      !isLogin
                        ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    Бүртгүүлэх
                  </button>
                </div>

                <h2 className="mt-5 text-[28px] font-bold tracking-[-0.04em]">
                  {isLogin ? 'Тавтай морил' : 'Бүртгэл үүсгэх'}
                </h2>

                <p className="mt-1.5 text-[13px] leading-5 text-slate-500 dark:text-slate-400">
                  {isLogin
                    ? 'Бүртгэлдээ нэвтэрч аяллаа үргэлжлүүлээрэй.'
                    : 'Шинэ бүртгэл үүсгээд аялалынхаа захиалгыг удирдаарай.'}
                </p>
              </div>

              {err && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {err}
                </div>
              )}

              <div className="mt-5 space-y-3.5">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          Нэр
                        </label>

                        <div className="relative">
                          <UserRound
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:bg-slate-950 dark:focus:ring-slate-800/50"
                            placeholder="Нэр"
                            type="text"
                            autoComplete="given-name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          Овог
                        </label>

                        <div className="relative">
                          <UserRound
                            size={16}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:bg-slate-950 dark:focus:ring-slate-800/50"
                            placeholder="Овог"
                            type="text"
                            autoComplete="family-name"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Утасны дугаар
                      </label>

                      <div className="relative">
                        <Phone
                          size={16}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:bg-slate-950 dark:focus:ring-slate-800/50"
                          placeholder="99112233"
                          type="tel"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Имэйл
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:bg-slate-950 dark:focus:ring-slate-800/50"
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Нууц үг
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:ring-slate-800/50"
                      placeholder="••••••••"
                      type="password"
                      autoComplete={
                        isLogin ? 'current-password' : 'new-password'
                      }
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Нууц үг давтан
                    </label>

                    <div className="relative">
                      <LockKeyhole
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:ring-slate-800/50"
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submitAuth}
                  disabled={loading}
                  className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {isLogin ? 'Нэвтэрч байна...' : 'Бүртгэж байна...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>
              </div>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  эсвэл
                </span>

                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              <button
                type="button"
                onClick={googleAuth}
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold dark:bg-slate-800">
                  G
                </span>
                {isLogin ? 'Google-оор нэвтрэх' : 'Google-оор бүртгүүлэх'}
              </button>

              <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                {isLogin ? 'Account байхгүй юу?' : 'Бүртгэлтэй юу?'}{' '}
                <button
                  type="button"
                  onClick={() =>
                    handleModeChange(isLogin ? 'register' : 'login')
                  }
                  className="font-semibold text-slate-950 underline-offset-4 transition hover:underline dark:text-white"
                >
                  {isLogin ? 'Бүртгүүлэх' : 'Нэвтрэх'}
                </button>
              </p>
            </div>

            <div className="mt-4 text-center lg:hidden">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Happy World Tour
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
