'use client';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardList,
  FileText,
  MessageSquare,
  Plane,
  Settings,
} from 'lucide-react';
const cards = [
  {
    title: 'Аяллууд',
    description: 'Аяллын мэдээлэл, үнэ болон багцуудыг удирдах',
    href: '/admin/tours',
    icon: Plane,
    label: 'Tours',
  },
  {
    title: 'Блог',
    description: 'Блог нийтлэл үүсгэх, засах болон нийтлэх',
    href: '/admin/articles',
    icon: FileText,
    label: 'Articles',
  },
  {
    title: 'Захиалгууд',
    description: 'Хэрэглэгчдийн аяллын захиалгыг хянах',
    href: '/admin/bookings',
    icon: ClipboardList,
    label: 'Bookings',
  },
  {
    title: 'Мессежүүд',
    description: 'Хэрэглэгчдээс ирсэн мессежүүдийг харах',
    href: '/admin/messages',
    icon: MessageSquare,
    label: 'Messages',
  },
  {
    title: 'Тохиргоо',
    description: 'Вэбсайтын үндсэн тохиргоог удирдах',
    href: '/admin/settings',
    icon: Settings,
    label: 'Settings',
  },
];
export default function Admin() {
  return (
    <main className="min-h-full">
      {' '}
      {/* Welcome */}{' '}
      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {' '}
        <div className="relative p-6 sm:p-8">
          {' '}
          {/* Decorative background */}{' '}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />{' '}
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {' '}
            <div>
              {' '}
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                {' '}
                Dashboard Overview{' '}
              </p>{' '}
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {' '}
                Тавтай морилно уу 👋{' '}
              </h2>{' '}
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                {' '}
                Happy World Tour вэбсайтын бүх мэдээлэл, аялал, захиалга болон
                хэрэглэгчдийн мессежийг эндээс удирдана.{' '}
              </p>{' '}
            </div>{' '}
            <div className="hidden shrink-0 sm:block">
              {' '}
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 shadow-sm dark:bg-white">
                {' '}
                <Plane className="h-7 w-7 text-white dark:text-slate-950" />{' '}
              </div>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </section>{' '}
      {/* Section title */}{' '}
      <div className="mb-5">
        {' '}
        <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
          {' '}
          Удирдлага{' '}
        </h2>{' '}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {' '}
          Системийн хэсгээс сонгон удирдана уу.{' '}
        </p>{' '}
      </div>{' '}
      {/* Cards */}{' '}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {' '}
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className=" group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 "
            >
              {' '}
              {/* Top */}{' '}
              <div className="flex items-start justify-between">
                {' '}
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 transition-colors group-hover:bg-slate-950 dark:bg-slate-800 dark:group-hover:bg-white">
                  {' '}
                  <Icon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-white dark:text-slate-300 dark:group-hover:text-slate-950" />{' '}
                </div>{' '}
                <div className="grid h-8 w-8 place-items-center rounded-lg text-slate-300 transition-all group-hover:bg-slate-100 group-hover:text-slate-700 dark:text-slate-600 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-200">
                  {' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />{' '}
                </div>{' '}
              </div>{' '}
              {/* Content */}{' '}
              <div className="mt-5">
                {' '}
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {' '}
                  {card.label}{' '}
                </p>{' '}
                <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  {' '}
                  {card.title}{' '}
                </h3>{' '}
                <p className="mt-2 min-h-[42px] text-sm leading-5 text-slate-500 dark:text-slate-400">
                  {' '}
                  {card.description}{' '}
                </p>{' '}
              </div>{' '}
              {/* Bottom */}{' '}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                {' '}
                <span className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-950 dark:text-slate-400 dark:group-hover:text-white">
                  {' '}
                  Удирдах{' '}
                </span>{' '}
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {' '}
                  Нээх{' '}
                </span>{' '}
              </div>{' '}
            </Link>
          );
        })}{' '}
      </section>{' '}
      {/* Quick actions */}{' '}
      <section className="mt-8">
        {' '}
        <div className="mb-4">
          {' '}
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            {' '}
            Шуурхай үйлдэл{' '}
          </h2>{' '}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {' '}
            Түгээмэл ашиглах хэсгүүд рүү шууд очих{' '}
          </p>{' '}
        </div>{' '}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {' '}
          <Link
            href="/admin/bookings"
            className=" group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 "
          >
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                {' '}
                <ClipboardList className="h-4 w-4 text-slate-600 dark:text-slate-300" />{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {' '}
                  Захиалга шалгах{' '}
                </p>{' '}
                <p className="mt-0.5 text-xs text-slate-400">
                  {' '}
                  Сүүлийн захиалгууд{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />{' '}
          </Link>{' '}
          <Link
            href="/admin/messages"
            className=" group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 "
          >
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                {' '}
                <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-300" />{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {' '}
                  Мессеж шалгах{' '}
                </p>{' '}
                <p className="mt-0.5 text-xs text-slate-400">
                  {' '}
                  Хэрэглэгчдийн мессеж{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />{' '}
          </Link>{' '}
          <Link
            href="/admin/articles"
            className=" group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 "
          >
            {' '}
            <div className="flex items-center gap-3">
              {' '}
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                {' '}
                <FileText className="h-4 w-4 text-slate-600 dark:text-slate-300" />{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {' '}
                  Блог нэмэх{' '}
                </p>{' '}
                <p className="mt-0.5 text-xs text-slate-400">
                  {' '}
                  Шинэ нийтлэл үүсгэх{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
            <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />{' '}
          </Link>{' '}
        </div>{' '}
      </section>{' '}
    </main>
  );
}
