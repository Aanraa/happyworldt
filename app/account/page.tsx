'use client';

import { useEffect, useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
  Pencil,
  Plane,
  Save,
  ShieldCheck,
  Ticket,
  UserRound,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string;
  tourName?: string;
  tourSlug?: string;
  status?: string;
  departureDate?: string;
  travelers?: number;
};

type Profile = {
  name: string;
  phone: string;
  address: string;
};

type FavoriteTour = {
  id: string;
  slug: string;
  name: string;
  region?: string;
  image?: string;
};

const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: 'Хүлээгдэж байна',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900',
    icon: <Clock3 className="h-3.5 w-3.5" />,
  },

  confirmed: {
    label: 'Баталгаажсан',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },

  cancelled: {
    label: 'Цуцлагдсан',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const inputClass = `
  h-11 w-full rounded-lg border border-slate-200 bg-white px-4
  text-sm text-slate-900 outline-none transition
  placeholder:text-slate-400
  hover:border-slate-300
  focus:border-slate-900
  focus:ring-2 focus:ring-slate-900/5
  dark:border-slate-700 dark:bg-slate-950 dark:text-white
  dark:hover:border-slate-600
  dark:focus:border-slate-400
`;

function getStatus(status?: string) {
  return (
    statusConfig[status?.toLowerCase() || ''] || {
      label: status || 'Шинэ хүсэлт',
      className:
        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: <Clock3 className="h-3.5 w-3.5" />,
    }
  );
}

function formatDate(date?: string) {
  if (!date) return 'Огноо хүлээгдэж байна';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

export default function Account() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [favoriteTours, setFavoriteTours] = useState<FavoriteTour[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    name: '',
    phone: '',
    address: '',
  });

  const [profileForm, setProfileForm] = useState<Profile>({
    name: '',
    phone: '',
    address: '',
  });

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [signingOut, setSigningOut] = useState(false);

  /*
   * =========================
   * TOAST
   * =========================
   */

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  /*
   * =========================
   * LOAD PROFILE
   * =========================
   */

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const profileRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        const data = snapshot.data();

        const nextProfile: Profile = {
          name: data?.name || user.displayName || '',
          phone: data?.phone || '',
          address: data?.address || '',
        };

        setProfile(nextProfile);
        setProfileForm(nextProfile);
        setProfileLoading(false);
      },
      (error) => {
        console.error('Profile loading error:', error);
        setProfileLoading(false);

        showToast('error', 'Профайл мэдээлэл ачаалахад алдаа гарлаа.');
      },
    );

    return () => unsubscribe();
  }, [user]);

  /*
   * =========================
   * LOAD BOOKINGS
   * =========================
   */

  useEffect(() => {
    if (!user) {
      setItems([]);
      setBookingsLoading(false);
      return;
    }

    setBookingsLoading(true);

    const unsubscribe = onSnapshot(
      query(collection(db, 'bookings'), where('uid', '==', user.uid)),
      (snapshot) => {
        setItems(
          snapshot.docs.map(
            (item) =>
              ({
                id: item.id,
                ...item.data(),
              }) as Booking,
          ),
        );

        setBookingsLoading(false);
      },
      (error) => {
        console.error('Bookings loading error:', error);
        setBookingsLoading(false);

        showToast('error', 'Захиалгуудыг ачаалахад алдаа гарлаа.');
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setFavoriteTours([]);
      setFavoritesLoading(false);
      return;
    }

    setFavoritesLoading(true);

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        const ids = Array.isArray(snapshot.data()?.favoriteTours)
          ? (snapshot.data()?.favoriteTours as string[])
          : [];

        if (!ids.length) {
          setFavoriteTours([]);
          setFavoritesLoading(false);
          return;
        }

        const toursRef = collection(db, 'tours');

        const toursUnsubscribe = onSnapshot(
          toursRef,
          (tourSnapshot) => {
            const nextFavorites = tourSnapshot.docs
              .filter((tourDoc) => ids.includes(tourDoc.id))
              .map((tourDoc) => ({
                id: tourDoc.id,
                ...tourDoc.data(),
              })) as FavoriteTour[];

            setFavoriteTours(nextFavorites);
            setFavoritesLoading(false);
          },
          (error) => {
            console.error('Favorite tours loading error:', error);
            setFavoritesLoading(false);
            showToast('error', 'Таалагдсан аяллуудыг ачаалахад алдаа гарлаа.');
          },
        );

        return () => toursUnsubscribe();
      },
      (error) => {
        console.error('User favorites loading error:', error);
        setFavoritesLoading(false);
        showToast('error', 'Таалагдсан аяллуудыг ачаалахад алдаа гарлаа.');
      },
    );

    return () => unsubscribe();
  }, [user]);

  /*
   * =========================
   * PROFILE INPUT
   * =========================
   */

  function updateProfileField(field: keyof Profile, value: string) {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /*
   * =========================
   * VALIDATE PROFILE
   * =========================
   */

  function validateProfile() {
    if (!profileForm.name.trim()) {
      showToast('error', 'Нэрээ оруулна уу.');
      return false;
    }

    if (profileForm.name.trim().length < 2) {
      showToast('error', 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой.');
      return false;
    }

    if (profileForm.phone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{8,20}$/;

      if (!phoneRegex.test(profileForm.phone.trim())) {
        showToast('error', 'Утасны дугаарын формат буруу байна.');
        return false;
      }
    }

    return true;
  }

  /*
   * =========================
   * SAVE PROFILE
   * =========================
   */

  async function saveProfile() {
    if (!user) return;

    if (!validateProfile()) return;

    setSavingProfile(true);

    try {
      const cleanProfile = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
        email: user.email || '',
        uid: user.uid,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), cleanProfile, { merge: true });

      await updateProfile(user, {
        displayName: profileForm.name.trim(),
      });

      setProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      });

      setEditingProfile(false);

      showToast('success', 'Профайл мэдээлэл амжилттай шинэчлэгдлээ.');
    } catch (error) {
      console.error('Profile update error:', error);

      showToast('error', 'Профайл хадгалахад алдаа гарлаа.');
    } finally {
      setSavingProfile(false);
    }
  }

  /*
   * =========================
   * PASSWORD VALIDATION
   * =========================
   */

  function validatePassword() {
    if (!currentPassword) {
      showToast('error', 'Одоогийн нууц үгээ оруулна уу.');
      return false;
    }

    if (!newPassword) {
      showToast('error', 'Шинэ нууц үгээ оруулна уу.');
      return false;
    }

    if (newPassword.length < 8) {
      showToast('error', 'Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.');
      return false;
    }

    if (newPassword === currentPassword) {
      showToast('error', 'Шинэ нууц үг одоогийн нууц үгтэй ижил байна.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'Шинэ нууц үг давхар оруулсантай тохирохгүй байна.');
      return false;
    }

    return true;
  }

  /*
   * =========================
   * CHANGE PASSWORD
   * =========================
   */

  async function changePassword() {
    if (!user || !user.email) return;

    if (!validatePassword()) return;

    setChangingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordOpen(false);

      showToast('success', 'Нууц үг амжилттай солигдлоо.');
    } catch (error: any) {
      console.error('Password update error:', error);

      let message = 'Нууц үг солих үед алдаа гарлаа.';

      if (error?.code === 'auth/invalid-credential') {
        message = 'Одоогийн нууц үг буруу байна.';
      }

      if (error?.code === 'auth/wrong-password') {
        message = 'Одоогийн нууц үг буруу байна.';
      }

      if (error?.code === 'auth/too-many-requests') {
        message = 'Хэт олон оролдлого хийсэн байна. Түр хүлээгээд дахин оролдоно уу.';
      }

      if (error?.code === 'auth/requires-recent-login') {
        message = 'Аюулгүй байдлын үүднээс дахин нэвтэрч байж нууц үгээ солино уу.';
      }

      showToast('error', message);
    } finally {
      setChangingPassword(false);
    }
  }

  /*
   * =========================
   * SIGN OUT
   * =========================
   */

  async function handleSignOut() {
    try {
      setSigningOut(true);

      await signOut(auth);

      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);

      showToast('error', 'Гарахад алдаа гарлаа.');

      setSigningOut(false);
    }
  }

  /*
   * =========================
   * LOADING
   * =========================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-5 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-5 h-12 w-72 rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-10 h-52 rounded-2xl bg-slate-100 dark:bg-slate-900" />
        </div>
      </main>
    );
  }

  if (!user) {
    router.replace('/auth/login');
    return null;
  }

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45] dark:opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(15,23,42,0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(15,23,42,0.045) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
        }}
      />

      {/* Soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-slate-100/80 blur-3xl dark:bg-slate-900/60" />

      <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        {/* =========================
            HEADER
        ========================== */}

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
            My Account
          </p>

          <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
                Миний
                <br />
                <span className="text-slate-400 dark:text-slate-500">бүртгэл.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                Өөрийн мэдээлэл, нууцлал болон аяллын захиалгаа нэг дороос удирдаарай.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 sm:self-auto"
            >
              <LogOut className="h-4 w-4" />

              {signingOut ? 'Гарч байна...' : 'Гарах'}
            </button>
          </div>
        </section>

        {/* =========================
            PROFILE CARD
        ========================== */}

        <section className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <UserRound className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Profile
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {profile.name || user.displayName || 'Хэрэглэгч'}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>

                {!editingProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm(profile);
                      setEditingProfile(true);
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                    Засах
                  </button>
                )}
              </div>
            </div>

            {/* Profile information */}

            {!editingProfile ? (
              <div className="grid border-t border-slate-200 dark:border-slate-800 sm:grid-cols-3">
                <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:border-b-0 sm:border-r">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Нэр
                  </p>

                  <p className="mt-2 text-sm font-semibold">{profile.name || 'Оруулаагүй'}</p>
                </div>

                <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:border-b-0 sm:border-r">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Утас
                  </p>

                  <p className="mt-2 text-sm font-semibold">{profile.phone || 'Оруулаагүй'}</p>
                </div>

                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Хаяг
                  </p>

                  <p className="mt-2 text-sm font-semibold">{profile.address || 'Оруулаагүй'}</p>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-200 p-6 dark:border-slate-800 sm:p-8">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Нэр
                    </label>

                    <input
                      className={inputClass}
                      value={profileForm.name}
                      placeholder="Таны нэр"
                      onChange={(e) => updateProfileField('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Имэйл
                    </label>

                    <input
                      className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-slate-900`}
                      value={user.email || ''}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Утас
                    </label>

                    <input
                      className={inputClass}
                      value={profileForm.phone}
                      placeholder="99112233"
                      onChange={(e) => updateProfileField('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Хаяг
                    </label>

                    <input
                      className={inputClass}
                      value={profileForm.address}
                      placeholder="Улаанбаатар"
                      onChange={(e) => updateProfileField('address', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm(profile);
                      setEditingProfile(false);
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                    Болих
                  </button>

                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <Save className="h-4 w-4" />

                    {savingProfile ? 'Хадгалж байна...' : 'Хадгалах'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            SECURITY
        ========================== */}

        <section className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Security
                    </p>

                    <h2 className="mt-1 text-base font-bold">Нууц үг</h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Firebase бүртгэлийн нууц үгээ шинэчлэх.
                    </p>
                  </div>
                </div>

                {!passwordOpen && (
                  <button
                    type="button"
                    onClick={() => setPasswordOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Нууц үг солих
                  </button>
                )}
              </div>
            </div>

            {passwordOpen && (
              <div className="border-t border-slate-200 p-6 dark:border-slate-800 sm:p-8">
                <div className="max-w-xl space-y-5">
                  {/* Current */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Одоогийн нууц үг
                    </label>

                    <div className="relative">
                      <input
                        className={`${inputClass} pr-11`}
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Шинэ нууц үг
                    </label>

                    <div className="relative">
                      <input
                        className={`${inputClass} pr-11`}
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Хамгийн багадаа 8 тэмдэгт"
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Шинэ нууц үг давтах
                    </label>

                    <div className="relative">
                      <input
                        className={`${inputClass} pr-11`}
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordOpen(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                    Болих
                  </button>

                  <button
                    type="button"
                    onClick={changePassword}
                    disabled={changingPassword}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <ShieldCheck className="h-4 w-4" />

                    {changingPassword ? 'Шалгаж байна...' : 'Нууц үг шинэчлэх'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            FAVORITES
        ========================== */}

        <section className="mt-16">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Favourites
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                Миний дуртай аялалууд
              </h2>
            </div>

            <Link
              href="/tours"
              className="hidden items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-400 dark:text-slate-300 sm:inline-flex"
            >
              Бүх аялал үзэх
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {favoritesLoading ? (
              <>
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </>
            ) : favoriteTours.length > 0 ? (
              favoriteTours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative h-32 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {tour.image ? (
                      <img
                        src={tour.image}
                        alt={tour.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Зураг байхгүй
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="line-clamp-1 text-base font-bold tracking-[-0.02em]">
                        {tour.name}
                      </h3>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                          <path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.12 6.12 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.5L12 21.35Z" />
                        </svg>
                      </div>
                    </div>

                    {tour.region && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {tour.region}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900 md:col-span-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Одоогоор дуртай аялал байхгүй байна.
                </p>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Аяллуудын хэсгээс ❤ товчийг дарж хадгална уу.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* =========================
            BOOKINGS
        ========================== */}

        <section className="mt-16">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Travel history
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                Миний захиалгууд
              </h2>
            </div>

            <Link
              href="/tours"
              className="hidden items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-400 dark:text-slate-300 sm:inline-flex"
            >
              Аяллууд үзэх
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-7">
          {bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex gap-4">
                    <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800" />

                    <div className="flex-1">
                      <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />

                      <div className="mt-3 h-3 w-64 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3">
              {items.map((booking) => {
                const status = getStatus(booking.status);

                return (
                  <div
                    key={booking.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:p-6"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                          <Plane className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-bold sm:text-base">
                              {booking.tourName || 'Аяллын захиалга'}
                            </h3>

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold ${status.className}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:gap-4">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(booking.departureDate)}
                            </span>

                            <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">
                              •
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5" />
                              {booking.travelers || 1} аялагч
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 dark:border-slate-800 sm:border-0 sm:pt-0">
                        <p className="text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Booking ID
                        </p>

                        <p className="mt-1 max-w-[150px] truncate text-right text-xs text-slate-500 dark:text-slate-400">
                          {booking.id}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <MapPin className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>

              <h3 className="mt-5 text-base font-bold">Одоогоор захиалга алга</h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Дараагийн аяллаа сонгоод шинэ дурсамжаа эхлүүлээрэй.
              </p>

              <Link
                href="/tours"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Аяллууд үзэх
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        {/* =========================
            FOOTER CTA
        ========================== */}

        <section className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-800">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                Next destination
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight">Дараагийн аялал хаашаа вэ?</h2>
            </div>

            <Link
              href="/tours"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
            >
              Бүх аялал үзэх
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* =========================
          TOAST NOTIFICATION
      ========================== */}

      {toast && (
        <div className="animate-in slide-in-from-right-5 fade-in fixed bottom-5 right-5 z-[100] w-[calc(100%-40px)] max-w-sm duration-300">
          <div
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl dark:bg-slate-900 ${
              toast.type === 'success'
                ? 'border-emerald-200 dark:border-emerald-900'
                : 'border-red-200 dark:border-red-900'
            }`}
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              }`}
            >
              {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {toast.type === 'success' ? 'Амжилттай' : 'Алдаа'}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
