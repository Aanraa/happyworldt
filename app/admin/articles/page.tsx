'use client';

import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { Check, FileText, Image as ImageIcon, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { db } from '@/lib/firebase';

const blank: any = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  published: false,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const inputClass = `
  h-11 w-full rounded-lg border border-slate-200 bg-white px-4
  text-sm text-slate-900 outline-none transition
  placeholder:text-slate-400 hover:border-slate-300
  focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5
  dark:border-slate-700 dark:bg-slate-950 dark:text-white
  dark:hover:border-slate-600 dark:focus:border-slate-400
  dark:focus:ring-white/5
`;

const textareaClass = `
  w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3
  text-sm leading-6 text-slate-900 outline-none transition
  placeholder:text-slate-400 hover:border-slate-300
  focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5
  dark:border-slate-700 dark:bg-slate-950 dark:text-white
  dark:hover:border-slate-600 dark:focus:border-slate-400
  dark:focus:ring-white/5
`;

function Label({ children, required = false }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

export default function Articles() {
  const [items, setItems] = useState<any[]>([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(
    () =>
      onSnapshot(collection(db, 'articles'), (s) =>
        setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    [],
  );

  async function save() {
    if (!f.title.trim()) {
      setMessage('Блогийн гарчиг заавал оруулна уу.');
      return;
    }

    const data = {
      ...f,
      title: f.title.trim(),
      slug: f.slug || slugify(f.title),
      updatedAt: serverTimestamp(),
    };

    if (editing) {
      await updateDoc(doc(db, 'articles', editing), data);
      setMessage('Блог амжилттай шинэчлэгдлээ.');
    } else {
      await addDoc(collection(db, 'articles'), {
        ...data,
        createdAt: serverTimestamp(),
      });
      setMessage('Блог амжилттай нийтлэгдлээ.');
    }

    setF(blank);
    setEditing(null);
  }

  function editArticle(a: any) {
    setEditing(a.id);
    setF({ ...blank, ...a });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setF(blank);
    setEditing(null);
    setMessage('');
  }

  async function removeArticle(id: string) {
    if (!confirm('Энэ блогийг устгахдаа итгэлтэй байна уу?')) return;

    await deleteDoc(doc(db, 'articles', id));
    setMessage('Блог устгагдлаа.');
  }

  return (
    <main className="min-h-full text-slate-950 dark:text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Блог удирдах
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Аялал, зөвлөгөө болон сонирхолтой мэдээллүүдээ эндээс нийтэлж, засварлана уу.
            </p>
          </div>
        </div>

        {editing && (
          <button
            onClick={resetForm}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Шинэ блог
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <Check className="h-4 w-4 text-emerald-500" />
          {message}
        </div>
      )}

      {/* Editor */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <FileText className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                {editing ? 'Блог засварлах' : 'Шинэ блог үүсгэх'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Нийтлэлийн үндсэн мэдээлэл болон агуулгаа оруулна уу.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            <div>
              <Label required>Гарчиг</Label>
              <input
                className={inputClass}
                placeholder="Жишээ: Хайнань аралд заавал үзэх 7 газар"
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Slug</Label>
              <input
                className={inputClass}
                placeholder="Гарчгаас автоматаар үүсгэнэ"
                value={f.slug}
                onChange={(e) => setF({ ...f, slug: e.target.value })}
              />
              <p className="mt-1.5 text-[11px] text-slate-400">Вэб хуудасны холбоосын нэр.</p>
            </div>

            <div>
              <Label>Товч агуулга</Label>
              <textarea
                className={`${textareaClass} min-h-[105px]`}
                placeholder="Блогийн гол санааг 1–3 өгүүлбэрээр товч бичнэ үү."
                value={f.excerpt}
                onChange={(e) => setF({ ...f, excerpt: e.target.value })}
              />
            </div>

            <div>
              <Label>Нийтлэлийн үндсэн зураг</Label>

              <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
                <input
                  className={inputClass}
                  placeholder="Зургийн URL оруулна уу"
                  value={f.coverImage}
                  onChange={(e) => setF({ ...f, coverImage: e.target.value })}
                />

                {f.coverImage ? (
                  <div className="relative h-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                    <img
                      src={f.coverImage}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 grid place-items-center bg-slate-950/30">
                      <span className="rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
                        Урьдчилан харах
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-32 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-5 w-5 text-slate-400" />
                      <p className="mt-2 text-[11px] text-slate-400">Зураг харагдана</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label required>Нийтлэлийн текст</Label>
              <textarea
                className={`${textareaClass} min-h-[320px]`}
                placeholder="Блогийн дэлгэрэнгүй агуулгаа энд бичнэ үү..."
                value={f.content}
                onChange={(e) => setF({ ...f, content: e.target.value })}
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Одоогийн системийн бүтэцтэй нийцүүлэн энгийн текст хэлбэрээр хадгална.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={f.published}
                  onChange={(e) => setF({ ...f, published: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Нийтэд харагдуулах
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Идэвхжүүлсэн үед блог public хэсэгт харагдана.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Save footer */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {editing
              ? 'Өөрчлөлтөө хадгалаад нийтлэлээ шинэчилнэ үү.'
              : 'Блогийн мэдээллээ шалгаад хадгална уу.'}
          </p>

          <div className="flex gap-2">
            {editing && (
              <button
                onClick={resetForm}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Болих
              </button>
            )}

            <button
              onClick={save}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Save className="h-4 w-4" />
              {editing ? 'Өөрчлөлт хадгалах' : 'Блог хадгалах'}
            </button>
          </div>
        </div>
      </section>

      {/* Articles list */}
      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Нийтлэгдсэн болон ноорог блогууд
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Нийт {items.length} блог
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <FileText className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Одоогоор блог бүртгэгдээгүй байна.
              </p>
              <p className="mt-1 text-xs text-slate-400">Дээрх хэсгээс шинэ блог үүсгэнэ үү.</p>
            </div>
          )}

          {items.map((a) => (
            <article
              key={a.id}
              className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:w-32">
                {a.coverImage ? (
                  <img
                    src={a.coverImage}
                    alt={a.title || ''}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ImageIcon className="h-5 w-5 text-slate-400" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                    {a.title || 'Гарчиггүй блог'}
                  </h3>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                      a.published
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {a.published ? 'Нийтлэгдсэн' : 'Ноорог'}
                  </span>
                </div>

                {a.excerpt && (
                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {a.excerpt}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => editArticle(a)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Засах
                </button>

                <button
                  onClick={() => removeArticle(a.id)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 dark:border-red-950 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Устгах
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
