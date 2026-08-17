'use client';

import Link from 'next/link';
import {
  Menu,
  X,
  Sun,
  Moon,
  UserRound,
  LayoutDashboard,
  ArrowUpRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { isAdmin } from '@/lib/auth';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState(false);

  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    let alive = true;

    (async () => {
      if (user) {
        const value = await isAdmin(user.uid, user.email, user.emailVerified);

        if (alive) {
          setAdmin(value);
        }
      } else {
        setAdmin(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    ['Аялал', '/tours'],
    ['Бидний тухай', '/about'],
    ['Блог', '/blog'],
    ['Холбоо барих', '/contact'],
  ];

  function closeMobile() {
    setOpen(false);
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* =====================================================
              LOGO
          ====================================================== */}
          <Link
            href="/"
            onClick={closeMobile}
            className="group flex items-center"
          >
            <div className="leading-none">
              <div className="flex items-baseline">
                <span className="text-[17px] font-extrabold tracking-[-0.055em] text-slate-950 dark:text-white sm:text-[18px]">
                  HAPPY
                </span>

                <span className="ml-1.5 text-[17px] font-extrabold tracking-[-0.055em] text-[#b77b3b] sm:text-[18px]">
                  WORLD
                </span>
              </div>

              <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.34em] text-slate-400 transition group-hover:text-slate-500">
                TOUR
              </div>
            </div>
          </Link>

          {/* =====================================================
              DESKTOP NAV
          ====================================================== */}
          <nav className="hidden items-center lg:flex">
            <div className="flex items-center gap-8">
              {links.map(([label, href]) => {
                const active = isActive(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative py-2 text-[13px] font-semibold transition ${
                      active
                        ? 'text-slate-950 dark:text-white'
                        : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {label}

                    <span
                      className={`absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-[#b77b3b] transition-all duration-300 ${
                        active ? 'w-full' : 'w-0'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* divider */}
            <div className="mx-7 h-7 w-px bg-slate-200 dark:bg-slate-800" />

            {/* =====================================================
                ACTIONS
            ====================================================== */}
            <div className="flex items-center gap-2">
              {admin && (
                <Link
                  href="/admin"
                  className="group flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <LayoutDashboard size={14} />

                  <span>Удирдлага</span>

                  <ArrowUpRight
                    size={12}
                    className="opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              )}

              {/* theme */}
              <button
                onClick={toggle}
                aria-label="Өнгөний горим солих"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* account */}
              <Link
                href={user ? '/account' : '/auth/login'}
                className="ml-1 flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-4 text-[12px] font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <UserRound size={14} />

                {user ? 'Миний бүртгэл' : 'Нэвтрэх'}
              </Link>
            </div>
          </nav>

          {/* =====================================================
              MOBILE ACTIONS
          ====================================================== */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {admin && (
              <Link
                href="/admin"
                aria-label="Удирдлага"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <LayoutDashboard size={16} />
              </Link>
            )}

            <button
              onClick={toggle}
              aria-label="Өнгөний горим"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setOpen((prev) => !prev)}
              aria-label="Цэс"
              className={`ml-1 flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                open
                  ? 'border-slate-300 bg-slate-950 text-white dark:border-slate-700 dark:bg-white dark:text-slate-950'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}
        <div
          className={`overflow-hidden border-t border-slate-200/80 bg-white transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950 lg:hidden ${
            open
              ? 'max-h-[520px] opacity-100'
              : 'max-h-0 border-transparent opacity-0'
          }`}
        >
          <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
            <nav className="space-y-1">
              {links.map(([label, href], index) => {
                const active = isActive(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobile}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3.5 transition ${
                      active
                        ? 'bg-[#f6f0e8] text-slate-950 dark:bg-slate-900 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold ${
                          active
                            ? 'text-[#b77b3b]'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        0{index + 1}
                      </span>

                      <span className="text-sm font-semibold">{label}</span>
                    </div>

                    <ArrowUpRight
                      size={15}
                      className={`transition ${
                        active
                          ? 'text-[#b77b3b]'
                          : 'text-slate-300 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                {admin && (
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:text-white dark:hover:bg-slate-900"
                  >
                    <LayoutDashboard size={15} />
                    Удирдлага
                  </Link>
                )}

                <Link
                  href={user ? '/account' : '/auth/login'}
                  onClick={closeMobile}
                  className={`flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 ${
                    admin ? '' : 'col-span-2'
                  }`}
                >
                  <UserRound size={15} />
                  {user ? 'Миний бүртгэл' : 'Нэвтрэх'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
