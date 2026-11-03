'use client';
import AdminGuard from '@/components/admin/AdminGuard';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plane,
  Newspaper,
  ClipboardList,
  MessageSquare,
  Settings,
  ExternalLink,
} from 'lucide-react';
const navigation = [
  { icon: LayoutDashboard, name: 'Хяналтын самбар', href: '/admin' },
  { icon: Plane, name: 'Аяллууд', href: '/admin/tours' },
  { icon: Newspaper, name: 'Блог', href: '/admin/articles' },
  { icon: ClipboardList, name: 'Захиалгууд', href: '/admin/bookings' },
  { icon: MessageSquare, name: 'Мессежүүд', href: '/admin/messages' },
  { icon: Settings, name: 'Тохиргоо', href: '/admin/settings' },
];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };
  return (
    <AdminGuard>
      {' '}
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950">
        {' '}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {' '}
          {/* Header */}{' '}
          <header className="mb-6">
            {' '}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              {' '}
              <div className="flex items-start gap-4">
                {' '}
                {/* Logo */}{' '}
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 shadow-sm dark:bg-white">
                  {' '}
                  <Plane className="h-5 w-5 text-white dark:text-slate-950" />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                    {' '}
                    Happy World Tour{' '}
                  </p>{' '}
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                    {' '}
                    Удирдлагын самбар{' '}
                  </h1>{' '}
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    {' '}
                    Вэбсайтын мэдээлэл болон захиалгуудаа удирдана уу.{' '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              {/* Website button */}{' '}
              <Link
                href="/"
                target="_blank"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {' '}
                <ExternalLink className="h-4 w-4" /> Вэбсайт үзэх{' '}
              </Link>{' '}
            </div>{' '}
          </header>{' '}
          {/* Navigation */}{' '}
          <nav className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {' '}
            <div className="flex min-w-max gap-1">
              {' '}
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition ${active ? `bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950` : `text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white`} `}
                  >
                    {' '}
                    <Icon
                      className={`h-4 w-4 transition ${active ? 'text-white dark:text-slate-950' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'} `}
                    />{' '}
                    <span>{item.name}</span>{' '}
                  </Link>
                );
              })}{' '}
            </div>{' '}
          </nav>{' '}
          {/* Page */} <div>{children}</div>{' '}
        </div>{' '}
      </div>{' '}
    </AdminGuard>
  );
}
