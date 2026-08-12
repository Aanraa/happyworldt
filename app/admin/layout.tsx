import AdminGuard from '@/components/admin/AdminGuard';
import Link from 'next/link';
import {
  Layout,
  Plane,
  Newspaper,
  ClipboardList,
  MessageSquare,
  Settings,
} from 'lucide-react';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Happy World Tour
              </p>
              <h1 className="text-3xl font-black">Удирдлагын самбар</h1>
            </div>
            <Link
              href="/"
              className="rounded-xl border px-4 py-2 text-sm font-semibold dark:border-slate-800"
            >
              Вэбсайт үзэх
            </Link>
          </div>
          <nav className="mb-7 flex gap-2 overflow-x-auto rounded-2xl border bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            {[
              [Layout, 'Хяналтын самбар', '/admin'],
              [Plane, 'Аяллууд', '/admin/tours'],
              [Newspaper, 'Блог', '/admin/articles'],
              [ClipboardList, 'Захиалгууд', '/admin/bookings'],
              [MessageSquare, 'Мессежүүд', '/admin/messages'],
              [Settings, 'Тохиргоо', '/admin/settings'],
            ].map(([I, n, h]) => {
              const Icon = I as any;
              return (
                <Link
                  key={h as string}
                  href={h as string}
                  className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Icon size={16} />
                  {n as string}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
