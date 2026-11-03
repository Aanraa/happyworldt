'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Search,
  Ticket,
  Trash2,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
type Booking = {
  id: string;
  fullName?: string;
  phone?: string;
  email?: string;
  tourName?: string;
  departureDate?: string;
  travelers?: number | string;
  status?: string;
  createdAt?: any;
};
const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  new: {
    label: 'Шинэ',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    icon: Clock3,
  },
  contacted: {
    label: 'Холбогдсон',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    icon: Phone,
  },
  confirmed: {
    label: 'Баталгаажсан',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Цуцлагдсан',
    className: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
    icon: XCircle,
  },
};
export default function Bookings() {
  const [items, setItems] = useState<Booking[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Booking[]);
    });
  }, []);
  const filteredItems = useMemo(() => {
    const value = search.toLowerCase().trim();
    return items.filter((b) => {
      const matchesSearch =
        !value ||
        [b.fullName, b.phone, b.email, b.tourName, b.departureDate]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(value));
      const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, filterStatus]);
  async function changeStatus(id: string, newStatus: string) {
    try {
      setUpdating(id);
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
    } finally {
      setUpdating(null);
    }
  }
  function formatDate(timestamp: any) {
    if (!timestamp) return 'Огноо тодорхойгүй';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('mn-MN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return 'Огноо тодорхойгүй';
    }
  }
  function getStatus(status?: string) {
    return statusConfig[status || 'new'] || statusConfig.new;
  }
  const newCount = items.filter((b) => b.status === 'new').length;
  const contactedCount = items.filter((b) => b.status === 'contacted').length;
  const confirmedCount = items.filter((b) => b.status === 'confirmed').length;
  const cancelledCount = items.filter((b) => b.status === 'cancelled').length;
  return (
    <main className="min-h-full text-slate-950 dark:text-white">
      {' '}
      {/* Header */}{' '}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        {' '}
        <div className="flex items-start gap-4">
          {' '}
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {' '}
            <Ticket className="h-5 w-5 text-slate-700 dark:text-slate-300" />{' '}
          </div>{' '}
          <div>
            {' '}
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {' '}
              Bookings{' '}
            </h1>{' '}
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {' '}
              Аяллын захиалгуудыг эндээс хянаж, төлөвийг шинэчилнэ үү.{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:self-auto">
          {' '}
          <CalendarDays className="h-4 w-4" /> Нийт {items.length} захиалга{' '}
        </div>{' '}
      </div>{' '}
      {/* Stats */}{' '}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {' '}
        <StatCard icon={Ticket} label="Нийт" value={items.length} />{' '}
        <StatCard icon={Clock3} label="Шинэ" value={newCount} />{' '}
        <StatCard
          icon={CheckCircle2}
          label="Баталгаажсан"
          value={confirmedCount}
          iconClass="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/30"
        />{' '}
        <StatCard
          icon={XCircle}
          label="Цуцлагдсан"
          value={cancelledCount}
          iconClass="text-red-500 dark:text-red-400"
          iconBg="bg-red-50 dark:bg-red-950/30"
        />{' '}
      </div>{' '}
      {/* Search + Filter */}{' '}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {' '}
        <div className="flex flex-col gap-3 lg:flex-row">
          {' '}
          {/* Search */}{' '}
          <div className="relative flex-1">
            {' '}
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />{' '}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, email, утас, аялал эсвэл огноогоор хайх..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400"
            />{' '}
          </div>{' '}
          {/* Status Filter */}{' '}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            {' '}
            <option value="all">Бүх төлөв</option> <option value="new">Шинэ</option>{' '}
            <option value="contacted">Холбогдсон</option>{' '}
            <option value="confirmed">Баталгаажсан</option>{' '}
            <option value="cancelled">Цуцлагдсан</option>{' '}
          </select>{' '}
        </div>{' '}
      </section>{' '}
      {/* Result title */}{' '}
      <div className="mb-5 flex items-end justify-between">
        {' '}
        <div>
          {' '}
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
            {' '}
            Аяллын захиалгууд{' '}
          </h2>{' '}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {' '}
            {search || filterStatus !== 'all'
              ? `${filteredItems.length} захиалга олдлоо`
              : 'Хамгийн сүүлд ирсэн захиалга эхэндээ харагдана.'}{' '}
          </p>{' '}
        </div>{' '}
      </div>{' '}
      {/* Empty */}{' '}
      {filteredItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
          {' '}
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
            {' '}
            <Ticket className="h-6 w-6 text-slate-400 dark:text-slate-500" />{' '}
          </div>{' '}
          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {' '}
            {search || filterStatus !== 'all'
              ? 'Тохирох захиалга олдсонгүй.'
              : 'Одоогоор захиалга ирээгүй байна.'}{' '}
          </p>{' '}
          <p className="mt-1 text-xs text-slate-400">
            {' '}
            Хэрэглэгчийн аяллын захиалгууд энд харагдана.{' '}
          </p>{' '}
        </div>
      )}{' '}
      {/* Desktop Table */}{' '}
      {filteredItems.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
          {' '}
          <div className="overflow-x-auto">
            {' '}
            <table className="min-w-full text-left text-sm">
              {' '}
              <thead>
                {' '}
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50">
                  {' '}
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500">
                    {' '}
                    CUSTOMER{' '}
                  </th>{' '}
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500"> TOUR </th>{' '}
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500"> DEPARTURE </th>{' '}
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500"> TRAVELERS </th>{' '}
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500"> STATUS </th>{' '}
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500">
                    {' '}
                    ACTION{' '}
                  </th>{' '}
                </tr>{' '}
              </thead>{' '}
              <tbody>
                {' '}
                {filteredItems.map((b) => {
                  const status = getStatus(b.status);
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-950/50"
                    >
                      {' '}
                      {/* Customer */}{' '}
                      <td className="px-5 py-4">
                        {' '}
                        <div className="flex items-center gap-3">
                          {' '}
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            {' '}
                            <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />{' '}
                          </div>{' '}
                          <div className="min-w-0">
                            {' '}
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {' '}
                              {b.fullName || 'Нэргүй'}{' '}
                            </p>{' '}
                            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                              {' '}
                              {b.phone || '-'}{' '}
                            </p>{' '}
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {' '}
                              {b.email || '-'}{' '}
                            </p>{' '}
                          </div>{' '}
                        </div>{' '}
                      </td>{' '}
                      {/* Tour */}{' '}
                      <td className="px-5 py-4">
                        {' '}
                        <div className="max-w-[220px]">
                          {' '}
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {' '}
                            {b.tourName || 'Аялал сонгоогүй'}{' '}
                          </p>{' '}
                          <p className="mt-1 text-xs text-slate-400"> Аяллын захиалга </p>{' '}
                        </div>{' '}
                      </td>{' '}
                      {/* Date */}{' '}
                      <td className="px-5 py-4">
                        {' '}
                        <div className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                          {' '}
                          <CalendarDays className="h-4 w-4 text-slate-400" />{' '}
                          {b.departureDate || '-'}{' '}
                        </div>{' '}
                      </td>{' '}
                      {/* Travelers */}{' '}
                      <td className="px-5 py-4">
                        {' '}
                        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {' '}
                          <Users className="h-3.5 w-3.5" /> {b.travelers || 0} хүн{' '}
                        </div>{' '}
                      </td>{' '}
                      {/* Status */}{' '}
                      <td className="px-5 py-4">
                        {' '}
                        <select
                          value={b.status || 'new'}
                          disabled={updating === b.id}
                          onChange={(e) => changeStatus(b.id, e.target.value)}
                          className={`h-9 rounded-lg border-0 px-3 text-xs font-semibold outline-none ring-1 ring-inset ring-slate-200 dark:ring-slate-700 ${status.className}`}
                        >
                          {' '}
                          <option value="new">Шинэ</option>{' '}
                          <option value="contacted"> Холбогдсон </option>{' '}
                          <option value="confirmed"> Баталгаажсан </option>{' '}
                          <option value="cancelled"> Цуцлагдсан </option>{' '}
                        </select>{' '}
                      </td>{' '}
                      {/* Action */}{' '}
                      <td className="px-5 py-4 text-right">
                        {' '}
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {' '}
                          Дэлгэрэнгүй{' '}
                        </button>{' '}
                      </td>{' '}
                    </tr>
                  );
                })}{' '}
              </tbody>{' '}
            </table>{' '}
          </div>{' '}
        </div>
      )}{' '}
      {/* Mobile Cards */}{' '}
      <div className="space-y-3 lg:hidden">
        {' '}
        {filteredItems.map((b) => {
          const status = getStatus(b.status);
          const StatusIcon = status.icon;
          return (
            <article
              key={b.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {' '}
              <div className="flex items-start justify-between gap-3">
                {' '}
                <div className="flex min-w-0 items-center gap-3">
                  {' '}
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {' '}
                    <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />{' '}
                  </div>{' '}
                  <div className="min-w-0">
                    {' '}
                    <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                      {' '}
                      {b.fullName || 'Нэргүй хэрэглэгч'}{' '}
                    </h3>{' '}
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {' '}
                      {b.phone || '-'}{' '}
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold ${status.className}`}
                >
                  {' '}
                  <StatusIcon className="h-3 w-3" /> {status.label}{' '}
                </span>{' '}
              </div>{' '}
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                {' '}
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                  {' '}
                  {b.tourName || 'Аялал сонгоогүй'}{' '}
                </p>{' '}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {' '}
                  <div>
                    {' '}
                    <p className="text-[10px] text-slate-400"> Явах огноо </p>{' '}
                    <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {' '}
                      {b.departureDate || '-'}{' '}
                    </p>{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="text-[10px] text-slate-400"> Аялагчид </p>{' '}
                    <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {' '}
                      {b.travelers || 0} хүн{' '}
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              <div className="mt-4 flex gap-2">
                {' '}
                <select
                  value={b.status || 'new'}
                  disabled={updating === b.id}
                  onChange={(e) => changeStatus(b.id, e.target.value)}
                  className={`h-9 flex-1 rounded-lg border-0 px-3 text-xs font-semibold outline-none ring-1 ring-inset ring-slate-200 dark:ring-slate-700 ${status.className}`}
                >
                  {' '}
                  <option value="new">Шинэ</option> <option value="contacted">Холбогдсон</option>{' '}
                  <option value="confirmed">Баталгаажсан</option>{' '}
                  <option value="cancelled">Цуцлагдсан</option>{' '}
                </select>{' '}
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {' '}
                  Дэлгэрэнгүй{' '}
                </button>{' '}
              </div>{' '}
            </article>
          );
        })}{' '}
      </div>{' '}
      {/* Detail Modal */}{' '}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          {' '}
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {' '}
            {/* Header */}{' '}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              {' '}
              <div className="flex items-center gap-3">
                {' '}
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  {' '}
                  <Ticket className="h-5 w-5 text-slate-600 dark:text-slate-300" />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {' '}
                    Захиалгын дэлгэрэнгүй{' '}
                  </h3>{' '}
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {' '}
                    {formatDate(selectedBooking.createdAt)}{' '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <button
                onClick={() => setSelectedBooking(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {' '}
                <X className="h-4 w-4" />{' '}
              </button>{' '}
            </div>{' '}
            {/* Body */}{' '}
            <div className="space-y-5 p-6">
              {' '}
              {/* Customer */}{' '}
              <div>
                {' '}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {' '}
                  Customer{' '}
                </p>{' '}
                <div className="flex items-center gap-3">
                  {' '}
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {' '}
                    <User className="h-4 w-4 text-slate-500" />{' '}
                  </div>{' '}
                  <div>
                    {' '}
                    <p className="text-sm font-bold text-slate-950 dark:text-white">
                      {' '}
                      {selectedBooking.fullName || 'Нэргүй'}{' '}
                    </p>{' '}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {' '}
                      {selectedBooking.phone || '-'}{' '}
                    </p>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              {/* Contact */}{' '}
              <div className="grid gap-4 sm:grid-cols-2">
                {' '}
                <div>
                  {' '}
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {' '}
                    Email{' '}
                  </p>{' '}
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    {' '}
                    <Mail className="h-4 w-4 text-slate-400" /> {selectedBooking.email || '-'}{' '}
                  </div>{' '}
                </div>{' '}
                <div>
                  {' '}
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {' '}
                    Phone{' '}
                  </p>{' '}
                  <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    {' '}
                    <Phone className="h-4 w-4 text-slate-400" /> {selectedBooking.phone || '-'}{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              {/* Tour */}{' '}
              <div>
                {' '}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {' '}
                  Tour{' '}
                </p>{' '}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  {' '}
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {' '}
                    {selectedBooking.tourName || 'Аялал сонгоогүй'}{' '}
                  </p>{' '}
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    {' '}
                    <div>
                      {' '}
                      <p className="text-[10px] text-slate-400"> Явах огноо </p>{' '}
                      <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {' '}
                        {selectedBooking.departureDate || '-'}{' '}
                      </p>{' '}
                    </div>{' '}
                    <div>
                      {' '}
                      <p className="text-[10px] text-slate-400"> Аялагчид </p>{' '}
                      <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {' '}
                        {selectedBooking.travelers || 0} хүн{' '}
                      </p>{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
              </div>{' '}
              {/* Status */}{' '}
              <div>
                {' '}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {' '}
                  Status{' '}
                </p>{' '}
                <select
                  value={selectedBooking.status || 'new'}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    await changeStatus(selectedBooking.id, newStatus);
                    setSelectedBooking({
                      ...selectedBooking,
                      status: newStatus,
                    });
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  {' '}
                  <option value="new">Шинэ</option> <option value="contacted">Холбогдсон</option>{' '}
                  <option value="confirmed">Баталгаажсан</option>{' '}
                  <option value="cancelled">Цуцлагдсан</option>{' '}
                </select>{' '}
              </div>{' '}
            </div>{' '}
            {/* Footer */}{' '}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
              {' '}
              <button
                onClick={() => setSelectedBooking(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {' '}
                Хаах{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>
      )}{' '}
    </main>
  );
}
/* -------------------------------- */ /* Stat Card */ /* -------------------------------- */ function StatCard({
  icon: Icon,
  label,
  value,
  iconClass = 'text-slate-600 dark:text-slate-300',
  iconBg = 'bg-slate-100 dark:bg-slate-800',
}: {
  icon: any;
  label: string;
  value: number;
  iconClass?: string;
  iconBg?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {' '}
      <div className="flex items-center gap-3">
        {' '}
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${iconBg}`}>
          {' '}
          <Icon className={`h-4 w-4 ${iconClass}`} />{' '}
        </div>{' '}
        <div>
          {' '}
          <p className="text-xs text-slate-500 dark:text-slate-400"> {label} </p>{' '}
          <p className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white"> {value} </p>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
