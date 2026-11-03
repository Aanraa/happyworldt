'use client';
import { useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { db } from '@/lib/firebase';
type Message = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  createdAt?: any;
};
export default function Messages() {
  const [items, setItems] = useState<Message[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Message[]);
    });
  }, []);
  const filteredItems = useMemo(() => {
    const value = search.toLowerCase().trim();
    if (!value) return items;
    return items.filter((m) =>
      [m.name, m.email, m.phone, m.message]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value)),
    );
  }, [items, search]);
  const formatDate = (timestamp: any) => {
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
  };
  async function removeMessage(id: string) {
    const confirmed = window.confirm('Энэ мессежийг устгахдаа итгэлтэй байна уу?');
    if (!confirmed) return;
    try {
      setDeleting(id);
      await deleteDoc(doc(db, 'messages', id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } finally {
      setDeleting(null);
    }
  }
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
            <MessageSquare className="h-5 w-5 text-slate-700 dark:text-slate-300" />{' '}
          </div>{' '}
          <div>
            {' '}
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {' '}
              Messages{' '}
            </h1>{' '}
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {' '}
              Хэрэглэгчдээс ирсэн санал хүсэлт болон холбоо барих мессежүүдийг эндээс удирдана.{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        {/* Total */}{' '}
        <div className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:self-auto">
          {' '}
          <Mail className="h-4 w-4" /> Нийт {items.length} мессеж{' '}
        </div>{' '}
      </div>{' '}
      {/* Search */}{' '}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {' '}
        <div className="relative">
          {' '}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />{' '}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Нэр, email, утас эсвэл мессежээр хайх..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-slate-600 dark:focus:border-slate-400"
          />{' '}
        </div>{' '}
      </section>{' '}
      {/* Stats */}{' '}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {' '}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {' '}
          <div className="flex items-center gap-3">
            {' '}
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
              {' '}
              <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-300" />{' '}
            </div>{' '}
            <div>
              {' '}
              <p className="text-xs text-slate-500 dark:text-slate-400"> Нийт мессеж </p>{' '}
              <p className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white">
                {' '}
                {items.length}{' '}
              </p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {' '}
          <div className="flex items-center gap-3">
            {' '}
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              {' '}
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />{' '}
            </div>{' '}
            <div>
              {' '}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {' '}
                Одоогоор харагдаж буй{' '}
              </p>{' '}
              <p className="mt-0.5 text-xl font-bold text-slate-950 dark:text-white">
                {' '}
                {filteredItems.length}{' '}
              </p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
      {/* Messages */}{' '}
      <section>
        {' '}
        <div className="mb-5 flex items-end justify-between">
          {' '}
          <div>
            {' '}
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              {' '}
              Ирсэн мессежүүд{' '}
            </h2>{' '}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {' '}
              {search
                ? `${filteredItems.length} үр дүн олдлоо`
                : 'Хамгийн сүүлд ирсэн мессежүүд эхэндээ харагдана.'}{' '}
            </p>{' '}
          </div>{' '}
        </div>{' '}
        {/* Empty */}{' '}
        {filteredItems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            {' '}
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
              {' '}
              <MessageSquare className="h-6 w-6 text-slate-400 dark:text-slate-500" />{' '}
            </div>{' '}
            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {' '}
              {search
                ? 'Таны хайлтад тохирох мессеж олдсонгүй.'
                : 'Одоогоор мессеж ирээгүй байна.'}{' '}
            </p>{' '}
            <p className="mt-1 text-xs text-slate-400">
              {' '}
              {search
                ? 'Өөр түлхүүр үгээр дахин хайж үзнэ үү.'
                : 'Хэрэглэгчээс ирсэн мессежүүд энд харагдана.'}{' '}
            </p>{' '}
          </div>
        )}{' '}
        {/* List */}{' '}
        <div className="space-y-3">
          {' '}
          {filteredItems.map((m) => (
            <article
              key={m.id}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              {' '}
              {/* Top */}{' '}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {' '}
                <div className="flex min-w-0 items-start gap-3">
                  {' '}
                  {/* Avatar */}{' '}
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {' '}
                    <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />{' '}
                  </div>{' '}
                  <div className="min-w-0">
                    {' '}
                    <div className="flex flex-wrap items-center gap-2">
                      {' '}
                      <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                        {' '}
                        {m.name || 'Нэргүй хэрэглэгч'}{' '}
                      </h3>{' '}
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {' '}
                        Шинэ{' '}
                      </span>{' '}
                    </div>{' '}
                    <div className="mt-1.5 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:gap-3">
                      {' '}
                      {m.email && (
                        <span className="inline-flex items-center gap-1.5">
                          {' '}
                          <Mail className="h-3.5 w-3.5" /> {m.email}{' '}
                        </span>
                      )}{' '}
                      {m.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          {' '}
                          <Phone className="h-3.5 w-3.5" /> {m.phone}{' '}
                        </span>
                      )}{' '}
                    </div>{' '}
                  </div>{' '}
                </div>{' '}
                {/* Date */}{' '}
                <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400">
                  {' '}
                  <Clock3 className="h-3.5 w-3.5" /> {formatDate(m.createdAt)}{' '}
                </div>{' '}
              </div>{' '}
              {/* Message */}{' '}
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                {' '}
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {' '}
                  {m.message || 'Мессеж хоосон байна.'}{' '}
                </p>{' '}
              </div>{' '}
              {/* Actions */}{' '}
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                {' '}
                <button
                  onClick={() => setSelectedMessage(m)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {' '}
                  <MessageSquare className="h-3.5 w-3.5" /> Дэлгэрэнгүй харах{' '}
                </button>{' '}
                <button
                  onClick={() => removeMessage(m.id)}
                  disabled={deleting === m.id}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-950 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  {' '}
                  <Trash2 className="h-3.5 w-3.5" />{' '}
                  {deleting === m.id ? 'Устгаж байна...' : 'Устгах'}{' '}
                </button>{' '}
              </div>{' '}
            </article>
          ))}{' '}
        </div>{' '}
      </section>{' '}
      {/* Detail Modal */}{' '}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          {' '}
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {' '}
            {/* Modal header */}{' '}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              {' '}
              <div className="flex items-center gap-3">
                {' '}
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  {' '}
                  <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-300" />{' '}
                </div>{' '}
                <div>
                  {' '}
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">
                    {' '}
                    Мессежийн дэлгэрэнгүй{' '}
                  </h3>{' '}
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {' '}
                    {formatDate(selectedMessage.createdAt)}{' '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
              <button
                onClick={() => setSelectedMessage(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                {' '}
                <X className="h-4 w-4" />{' '}
              </button>{' '}
            </div>{' '}
            {/* Modal body */}{' '}
            <div className="space-y-5 p-6">
              {' '}
              <div>
                {' '}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {' '}
                  Хэрэглэгч{' '}
                </p>{' '}
                <p className="text-sm font-bold text-slate-950 dark:text-white">
                  {' '}
                  {selectedMessage.name || 'Нэргүй хэрэглэгч'}{' '}
                </p>{' '}
              </div>{' '}
              {selectedMessage.email && (
                <div>
                  {' '}
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {' '}
                    Email{' '}
                  </p>{' '}
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {' '}
                    {selectedMessage.email}{' '}
                  </p>{' '}
                </div>
              )}{' '}
              {selectedMessage.phone && (
                <div>
                  {' '}
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {' '}
                    Утас{' '}
                  </p>{' '}
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {' '}
                    {selectedMessage.phone}{' '}
                  </p>{' '}
                </div>
              )}{' '}
              <div>
                {' '}
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {' '}
                  Мессеж{' '}
                </p>{' '}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  {' '}
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {' '}
                    {selectedMessage.message || 'Мессеж хоосон байна.'}{' '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
            {/* Modal footer */}{' '}
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
              {' '}
              <button
                onClick={() => setSelectedMessage(null)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {' '}
                Хаах{' '}
              </button>{' '}
              <button
                onClick={() => removeMessage(selectedMessage.id)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 text-xs font-semibold text-white transition hover:bg-red-600"
              >
                {' '}
                <Trash2 className="h-3.5 w-3.5" /> Устгах{' '}
              </button>{' '}
            </div>{' '}
          </div>{' '}
        </div>
      )}{' '}
    </main>
  );
}
