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
    .replace(/\s+/g, '-');
export default function Articles() {
  const [items, setItems] = useState<any[]>([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  useEffect(
    () =>
      onSnapshot(collection(db, 'articles'), (s) =>
        setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
      ),
    [],
  );
  async function save() {
    const data = {
      ...f,
      slug: f.slug || slugify(f.title),
      updatedAt: serverTimestamp(),
    };
    if (editing) await updateDoc(doc(db, 'articles', editing), data);
    else
      await addDoc(collection(db, 'articles'), {
        ...data,
        createdAt: serverTimestamp(),
      });
    setF(blank);
    setEditing(null);
  }
  return (
    <main>
      <h2 className="text-2xl font-black">Блог</h2>
      <div className="mt-5 rounded-3xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <input
          className="w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Гарчиг"
          value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
        />
        <textarea
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Товч утга"
          value={f.excerpt}
          onChange={(e) => setF({ ...f, excerpt: e.target.value })}
        />
        <textarea
          className="mt-3 min-h-64 w-full rounded-xl border p-3 dark:bg-slate-950"
          placeholder="Текст"
          value={f.content}
          onChange={(e) => setF({ ...f, content: e.target.value })}
        />
        <input
          className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950"
          type="text"
          placeholder="Cover image URL"
          value={f.coverImage}
          onChange={(e) => setF({ ...f, coverImage: e.target.value })}
        />
        <label className="mt-4 block text-sm">
          <input
            type="checkbox"
            checked={f.published}
            onChange={(e) => setF({ ...f, published: e.target.checked })}
          />{' '}
          Нийтлэх
        </label>
        <button
          onClick={save}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
        >
          {editing ? 'Засах' : 'Нийтлэх'}
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {items.map((a) => (
          <div
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 dark:border-slate-800"
          >
            <div>
              <b>{a.title}</b>
              <p className="text-xs text-slate-500">
                {a.published ? 'Нийтлэгдсэн' : 'Ноорог'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(a.id);
                  setF({ ...blank, ...a });
                }}
                className="rounded-xl border px-4 py-2"
              >
                Засах
              </button>
              <button
                onClick={() => deleteDoc(doc(db, 'articles', a.id))}
                className="rounded-xl border px-4 py-2 text-red-600"
              >
                Устгах
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
