'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Hotel,
  ImagePlus,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  type: ToastType;
  message: string;
} | null;

type FormErrors = Record<string, string>;

const blank: any = {
  name: '',
  slug: '',
  region: 'Asia',
  country: '',
  childrenPrice: 0,
  category: 'international',
  image: '',
  gallery: [],
  durationDays: 1,
  groupCount: 1,
  startingPrice: 0,
  discountPrice: 0,
  currency: 'MNT',
  summary: '',
  hotel: '',
  flight: '',
  itinerary: [{ day: 1, title: '', detail: '' }],
  included: [''],
  excluded: [''],
  departureDates: [],
  active: true,
  featured: false,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const categoryLabel: Record<string, string> = {
  international: 'Олон улсын',
  domestic: 'Дотоодын',
  children: 'Хүүхдийн',
  wellness: 'Эрүүл мэнд',
  religious: 'Тусгай аялал',
};

function FieldLabel({
  children,
  required = false,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

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

export default function AdminTours() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<any>(blank);
  const [editing, setEditing] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<ToastState>(null);

  /*
   * ========================================
   * LOAD TOURS
   * ========================================
   */

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tours'),
      (snapshot) => {
        setItems(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })),
        );
      },
      (error) => {
        console.error('Failed to load tours:', error);

        showToast('error', 'Аяллуудыг ачааллах үед алдаа гарлаа.');
      },
    );

    return () => unsubscribe();
  }, []);

  /*
   * ========================================
   * TOAST
   * ========================================
   */

  function showToast(type: ToastType, message: string) {
    setToast({
      type,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  /*
   * ========================================
   * FORM SETTER
   * ========================================
   */

  const set = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: '',
      }));
    }
  };

  /*
   * ========================================
   * FIELD ERROR HELPER
   * ========================================
   */

  function fieldError(key: string) {
    return errors[key] ? (
      <p className="mt-1.5 text-xs font-medium text-red-500">{errors[key]}</p>
    ) : null;
  }

  function hasError(key: string) {
    return Boolean(errors[key]);
  }

  /*
   * ========================================
   * URL VALIDATION
   * ========================================
   */

  function isValidUrl(value: string) {
    try {
      const url = new URL(value);

      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /*
   * ========================================
   * DATE HELPERS
   * ========================================
   */

  function isPastDate(dateString: string) {
    if (!dateString) return false;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${dateString}T00:00:00`);

    return selectedDate < today;
  }

  /*
   * ========================================
   * VALIDATION
   * ========================================
   */

  function validateForm(): FormErrors {
    const newErrors: FormErrors = {};

    /*
     * BASIC INFORMATION
     */

    if (!form.name?.trim()) {
      newErrors.name = 'Аяллын нэр оруулна уу.';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Аяллын нэр хамгийн багадаа 3 тэмдэгт байна.';
    } else if (form.name.trim().length > 100) {
      newErrors.name = 'Аяллын нэр хамгийн ихдээ 100 тэмдэгт байна.';
    }

    if (!form.country) {
      newErrors.country = 'Улсаа сонгоно уу.';
    }

    if (!form.category) {
      newErrors.category = 'Аяллын төрлөө сонгоно уу.';
    }

    /*
     * DURATION
     */

    const duration = Number(form.durationDays);

    if (
      form.durationDays === '' ||
      form.durationDays === null ||
      form.durationDays === undefined
    ) {
      newErrors.durationDays = 'Аяллын хугацаа оруулна уу.';
    } else if (!Number.isInteger(duration) || duration < 1) {
      newErrors.durationDays = 'Аяллын хугацаа 1-ээс дээш бүхэл тоо байна.';
    } else if (duration > 365) {
      newErrors.durationDays = 'Аяллын хугацаа 365 хоногоос их байж болохгүй.';
    }

    const groupCount = Number(form.groupCount);

    if (
      form.groupCount === '' ||
      form.groupCount === null ||
      form.groupCount === undefined
    ) {
      newErrors.groupCount = 'Группийн тоо оруулна уу.';
    } else if (!Number.isInteger(groupCount) || groupCount < 1) {
      newErrors.groupCount = 'Группийн тоо 1-ээс дээш бүхэл тоо байна.';
    }

    /*
     * STARTING PRICE
     */

    const startingPrice = Number(form.startingPrice);

    if (
      form.startingPrice === '' ||
      form.startingPrice === null ||
      form.startingPrice === undefined
    ) {
      newErrors.startingPrice = 'Эхлэх үнэ оруулна уу.';
    } else if (!Number.isFinite(startingPrice) || startingPrice <= 0) {
      newErrors.startingPrice = 'Эхлэх үнэ 0-ээс их байх ёстой.';
    }

    /*
     * DISCOUNT PRICE
     */

    const discountPrice = Number(form.discountPrice || 0);

    if (!Number.isFinite(discountPrice) || discountPrice < 0) {
      newErrors.discountPrice = 'Хямдарсан үнэ 0-ээс бага байж болохгүй.';
    }

    if (
      discountPrice > 0 &&
      startingPrice > 0 &&
      discountPrice >= startingPrice
    ) {
      newErrors.discountPrice = 'Хямдарсан үнэ эхлэх үнээс бага байх ёстой.';
    }

    /*
     * CHILDREN PRICE
     */

    const childrenPrice = Number(form.childrenPrice || 0);

    if (!Number.isFinite(childrenPrice) || childrenPrice < 0) {
      newErrors.childrenPrice = 'Хүүхдийн үнэ 0-ээс бага байж болохгүй.';
    }

    /*
     * IMAGE
     */

    if (!form.image?.trim()) {
      newErrors.image = 'Үндсэн зураг оруулна уу.';
    } else if (!isValidUrl(form.image.trim())) {
      newErrors.image = 'Зургийн URL буруу байна.';
    }

    /*
     * SUMMARY
     */

    if (!form.summary?.trim()) {
      newErrors.summary = 'Товч тайлбар оруулна уу.';
    } else if (form.summary.trim().length < 20) {
      newErrors.summary = 'Товч тайлбар хамгийн багадаа 20 тэмдэгт байна.';
    } else if (form.summary.trim().length > 1000) {
      newErrors.summary = 'Товч тайлбар хамгийн ихдээ 1000 тэмдэгт байна.';
    }

    /*
     * HOTEL
     */

    if (form.hotel?.trim().length > 150) {
      newErrors.hotel = 'Зочид буудлын мэдээлэл хэт урт байна.';
    }

    /*
     * FLIGHT
     */

    if (form.flight?.trim().length > 150) {
      newErrors.flight = 'Нислэгийн мэдээлэл хэт урт байна.';
    }

    /*
     * ITINERARY
     */

    const itinerary = form.itinerary || [];

    itinerary.forEach((day: any, index: number) => {
      const hasTitle = Boolean(day.title?.trim());
      const hasDetail = Boolean(day.detail?.trim());

      if (!hasTitle && hasDetail) {
        newErrors[`itinerary.${index}.title`] =
          `${index + 1}-р өдрийн гарчиг оруулна уу.`;
      }

      if (hasTitle && !hasDetail) {
        newErrors[`itinerary.${index}.detail`] =
          `${index + 1}-р өдрийн дэлгэрэнгүй мэдээлэл оруулна уу.`;
      }

      if (day.title?.trim().length > 150) {
        newErrors[`itinerary.${index}.title`] =
          'Өдрийн гарчиг хамгийн ихдээ 150 тэмдэгт байна.';
      }

      if (day.detail?.trim().length > 2000) {
        newErrors[`itinerary.${index}.detail`] =
          'Дэлгэрэнгүй мэдээлэл хамгийн ихдээ 2000 тэмдэгт байна.';
      }
    });

    /*
     * INCLUDED
     */

    const included = form.included || [];

    included.forEach((item: string, index: number) => {
      if (item?.trim().length > 200) {
        newErrors[`included.${index}`] =
          'Энэ мэдээлэл хамгийн ихдээ 200 тэмдэгт байна.';
      }
    });

    /*
     * EXCLUDED
     */

    const excluded = form.excluded || [];

    excluded.forEach((item: string, index: number) => {
      if (item?.trim().length > 200) {
        newErrors[`excluded.${index}`] =
          'Энэ мэдээлэл хамгийн ихдээ 200 тэмдэгт байна.';
      }
    });

    /*
     * DEPARTURE DATES
     */

    const departureDates = form.departureDates || [];

    departureDates.forEach((date: string, index: number) => {
      if (!date) {
        newErrors[`departureDates.${index}`] = 'Явах огноог сонгоно уу.';
      } else if (isPastDate(date)) {
        newErrors[`departureDates.${index}`] =
          'Өнгөрсөн огноо сонгох боломжгүй.';
      }
    });

    /*
     * DUPLICATE DATES
     */

    const validDates = departureDates.filter(Boolean);

    const duplicateDates = validDates.filter(
      (date: string, index: number) => validDates.indexOf(date) !== index,
    );

    if (duplicateDates.length > 0) {
      departureDates.forEach((date: string, index: number) => {
        if (duplicateDates.includes(date)) {
          newErrors[`departureDates.${index}`] =
            'Ижил огноог давхар оруулах боломжгүй.';
        }
      });
    }

    return newErrors;
  }

  /*
   * ========================================
   * IMAGE UPLOAD
   * ========================================
   */

  async function upload(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);

    try {
      const urls: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          showToast('error', `${file.name} нь зураг биш байна.`);

          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          showToast(
            'error',
            `${file.name} 10MB-аас бага хэмжээтэй байх ёстой.`,
          );

          continue;
        }

        const folderId = editing || crypto.randomUUID();

        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

        const path = `tours/${folderId}/${Date.now()}-${safeFileName}`;

        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        urls.push(url);
      }

      if (!urls.length) {
        return;
      }

      setForm((prev: any) => {
        const gallery = [...(prev.gallery || []), ...urls];

        return {
          ...prev,
          gallery,
          image: prev.image || urls[0],
        };
      });

      setErrors((prev) => ({
        ...prev,
        image: '',
      }));

      showToast('success', `${urls.length} зураг амжилттай нэмэгдлээ.`);
    } catch (error) {
      console.error('Image upload error:', error);

      showToast('error', 'Зураг оруулах үед алдаа гарлаа.');
    } finally {
      setUploading(false);
    }
  }

  /*
   * ========================================
   * ADD IMAGE URL
   * ========================================
   */

  function toSafeHttpUrl(raw: string): string | null {
    try {
      const parsed = new URL(raw.trim());

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  function addImageUrl() {
    const raw = imageUrl.trim();

    if (!raw) {
      showToast('error', 'Зургийн URL оруулна уу.');

      return;
    }

    const safeUrl = toSafeHttpUrl(raw);

    if (!safeUrl || !isValidUrl(safeUrl)) {
      showToast('error', 'Зургийн URL буруу байна.');

      return;
    }

    setForm((prev: any) => {
      const gallery = [...(prev.gallery || []), safeUrl];

      return {
        ...prev,
        gallery,
        image: prev.image || safeUrl,
      };
    });

    setImageUrl('');

    setErrors((prev) => ({
      ...prev,
      image: '',
    }));

    showToast('success', 'Галерейн зураг амжилттай нэмэгдлээ.');
  }

  /*
   * ========================================
   * ITINERARY
   * ========================================
   */

  function updateDay(index: number, key: string, value: string) {
    const itinerary = [...(form.itinerary || [])];

    itinerary[index] = {
      ...itinerary[index],
      [key]: value,
    };

    setForm((prev: any) => ({
      ...prev,
      itinerary,
    }));

    const errorKey = `itinerary.${index}.${key}`;

    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  }

  function addItineraryDay() {
    setForm((prev: any) => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        {
          day: (prev.itinerary?.length || 0) + 1,
          title: '',
          detail: '',
        },
      ],
    }));
  }

  function removeItineraryDay(index: number) {
    const itinerary = (form.itinerary || [])
      .filter((_: any, i: number) => i !== index)
      .map((item: any, i: number) => ({
        ...item,
        day: i + 1,
      }));

    setForm((prev: any) => ({
      ...prev,
      itinerary:
        itinerary.length > 0
          ? itinerary
          : [
              {
                day: 1,
                title: '',
                detail: '',
              },
            ],
    }));

    setErrors((prev) => {
      const next = { ...prev };

      Object.keys(next)
        .filter((key) => key.startsWith(`itinerary.${index}.`))
        .forEach((key) => {
          delete next[key];
        });

      return next;
    });
  }

  /*
   * ========================================
   * INCLUDED / EXCLUDED
   * ========================================
   */

  function updateArrayItem(
    field: 'included' | 'excluded',
    index: number,
    value: string,
  ) {
    const array = [...(form[field] || [])];

    array[index] = value;

    setForm((prev: any) => ({
      ...prev,
      [field]: array,
    }));

    const errorKey = `${field}.${index}`;

    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  }

  function addArrayItem(field: 'included' | 'excluded') {
    setForm((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), ''],
    }));
  }

  /*
   * ========================================
   * DEPARTURE DATE
   * ========================================
   */

  function updateDepartureDate(index: number, value: string) {
    const dates = [...(form.departureDates || [])];

    dates[index] = value;

    setForm((prev: any) => ({
      ...prev,
      departureDates: dates,
    }));

    const errorKey = `departureDates.${index}`;

    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: '',
      }));
    }
  }

  function addDepartureDate() {
    setForm((prev: any) => ({
      ...prev,
      departureDates: [...(prev.departureDates || []), ''],
    }));
  }

  function removeDepartureDate(index: number) {
    const dates = (form.departureDates || []).filter(
      (_: any, i: number) => i !== index,
    );

    setForm((prev: any) => ({
      ...prev,
      departureDates: dates,
    }));

    setErrors((prev) => {
      const next = { ...prev };

      delete next[`departureDates.${index}`];

      return next;
    });
  }

  /*
   * ========================================
   * SAVE
   * ========================================
   */

  async function save() {
    if (saving || uploading) return;

    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast(
        'error',
        `Мэдээллээ шалгана уу. ${Object.keys(validationErrors).length} алдаа байна.`,
      );

      const firstError = Object.keys(validationErrors)[0];

      setTimeout(() => {
        const element = document.querySelector(
          `[data-error-field="${firstError}"]`,
        );

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 50);

      return;
    }

    setSaving(true);

    try {
      const clean = {
        ...form,

        name: form.name.trim(),

        slug: form.slug?.trim() || slugify(form.name),

        region: form.region?.trim() || 'Asia',

        country: form.country.trim(),

        category:
          form.category ||
          (form.country === 'Mongolia' ? 'domestic' : 'international'),

        durationDays: Number(form.durationDays),

        groupCount: Number(form.groupCount),

        startingPrice: Number(form.startingPrice),

        discountPrice: Number(form.discountPrice || 0),

        childrenPrice: Number(form.childrenPrice || 0),

        summary: form.summary?.trim() || '',

        hotel: form.hotel?.trim() || '',

        flight: form.flight?.trim() || '',

        itinerary: (form.itinerary || [])
          .filter((item: any) => item.title?.trim() || item.detail?.trim())
          .map((item: any, index: number) => ({
            day: index + 1,
            title: item.title?.trim() || '',
            detail: item.detail?.trim() || '',
          })),

        included: (form.included || [])
          .map((item: string) => item.trim())
          .filter(Boolean),

        excluded: (form.excluded || [])
          .map((item: string) => item.trim())
          .filter(Boolean),

        departureDates: (form.departureDates || []).filter(Boolean).sort(),

        updatedAt: serverTimestamp(),
      };

      if (editing) {
        await updateDoc(doc(db, 'tours', editing), clean);

        showToast('success', 'Аяллын мэдээлэл амжилттай шинэчлэгдлээ.');
      } else {
        await addDoc(collection(db, 'tours'), {
          ...clean,
          createdAt: serverTimestamp(),
        });

        showToast('success', 'Шинэ аялал амжилттай үүслээ.');
      }

      setForm({
        ...blank,
        gallery: [],
        itinerary: [
          {
            day: 1,
            title: '',
            detail: '',
          },
        ],
        included: [''],
        excluded: [''],
        departureDates: [],
      });

      setEditing(null);
      setErrors({});
      setImageUrl('');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      console.error('Save tour error:', error);

      showToast(
        'error',
        editing
          ? 'Аяллыг шинэчлэх үед алдаа гарлаа.'
          : 'Аялал үүсгэх үед алдаа гарлаа.',
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ========================================
   * DELETE
   * ========================================
   */

  async function remove(id: string) {
    if (deletingId || saving) return;

    const confirmed = window.confirm('Энэ аяллыг устгахдаа итгэлтэй байна уу?');

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await deleteDoc(doc(db, 'tours', id));

      if (editing === id) {
        resetForm();
      }

      showToast('success', 'Аялал амжилттай устгагдлаа.');
    } catch (error) {
      console.error('Delete tour error:', error);

      showToast('error', 'Аялал устгах үед алдаа гарлаа.');
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * ========================================
   * EDIT
   * ========================================
   */

  function edit(t: any) {
    setEditing(t.id);

    setForm({
      ...blank,
      ...t,

      gallery: Array.isArray(t.gallery) ? t.gallery : [],

      itinerary: t.itinerary?.length
        ? t.itinerary
        : [
            {
              day: 1,
              title: '',
              detail: '',
            },
          ],

      included:
        Array.isArray(t.included) && t.included.length ? t.included : [''],

      excluded:
        Array.isArray(t.excluded) && t.excluded.length ? t.excluded : [''],

      departureDates: Array.isArray(t.departureDates) ? t.departureDates : [],
    });

    setErrors({});
    setToast(null);
    setImageUrl('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  /*
   * ========================================
   * RESET
   * ========================================
   */

  function resetForm() {
    setForm({
      ...blank,
      gallery: [],
      itinerary: [
        {
          day: 1,
          title: '',
          detail: '',
        },
      ],
      included: [''],
      excluded: [''],
      departureDates: [],
    });

    setEditing(null);
    setErrors({});
    setImageUrl('');
  }

  /*
   * ========================================
   * SORT
   * ========================================
   */

  const displayed = useMemo(
    () => [...items].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [items],
  );

  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <main className="min-h-full text-slate-950 dark:text-white">
      {/* ==================================
          TOAST
      ================================== */}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex w-[380px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border bg-white p-4 shadow-2xl dark:bg-slate-900 ${
            toast.type === 'success'
              ? 'border-emerald-200 dark:border-emerald-900'
              : toast.type === 'error'
                ? 'border-red-200 dark:border-red-900'
                : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : toast.type === 'error'
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : toast.type === 'error' ? (
              <X className="h-4 w-4" />
            ) : (
              <Clock3 className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {toast.type === 'success'
                ? 'Амжилттай'
                : toast.type === 'error'
                  ? 'Алдаа'
                  : 'Мэдэгдэл'}
            </p>

            <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 text-slate-400 transition hover:text-slate-700 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ==================================
          PAGE HEADER
      ================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <MapPin className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Аялтын удирдлага
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Аяллын мэдээлэл, зураг, хөтөлбөр, үнэ болон гарах өдрүүдээ эндээс
              удирдана уу.
            </p>
          </div>
        </div>

        {editing && (
          <button
            type="button"
            onClick={resetForm}
            disabled={saving || uploading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Шинэ аялал
          </button>
        )}
      </div>

      {/* ==================================
          EDITOR CARD
      ================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* ==================================
            BASIC INFORMATION
        ================================== */}

        <section className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <FileText className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>

            <div>
              <h2 className="text-sm font-bold">Үндсэн мэдээлэл</h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Аяллын үндсэн мэдээллийг оруулна уу.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* NAME */}

            <div data-error-field="name">
              <FieldLabel required>Аяллын нэр</FieldLabel>

              <input
                className={`${inputClass} ${
                  hasError('name')
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : ''
                }`}
                placeholder="Жишээ: Хайнань аялал"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />

              {fieldError('name')}
            </div>

            {/* SLUG */}

            <div>
              <FieldLabel>Slug</FieldLabel>

              <input
                className={inputClass}
                placeholder="Автоматаар үүсгэнэ"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
              />
            </div>

            {/* REGION */}

            <div>
              <FieldLabel>Бүс нутаг</FieldLabel>

              <input
                className={inputClass}
                placeholder="Жишээ: Asia"
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
              />
            </div>

            {/* COUNTRY */}

            <div data-error-field="country">
              <FieldLabel required>Улс</FieldLabel>

              <select
                className={`${inputClass} ${
                  hasError('country')
                    ? 'border-red-400 focus:border-red-500'
                    : ''
                }`}
                value={form.country}
                onChange={(e) => {
                  const value = e.target.value;

                  set('country', value);

                  if (value === 'Mongolia') {
                    set('category', 'domestic');
                  } else if (value) {
                    set('category', 'international');
                  }
                }}
              >
                <option value="">Сонгоно уу</option>

                <option value="Mongolia">Монгол</option>

                <option value="South Korea">БНСУ</option>

                <option value="China">Хятад</option>

                <option value="Thailand">Тайланд</option>

                <option value="Japan">Япон</option>

                <option value="USA">АНУ</option>

                <option value="Other">Бусад</option>
              </select>

              {fieldError('country')}
            </div>

            {/* CATEGORY */}

            <div data-error-field="category">
              <FieldLabel required>Аяллын төрөл</FieldLabel>

              <select
                className={`${inputClass} ${
                  hasError('category')
                    ? 'border-red-400 focus:border-red-500'
                    : ''
                }`}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                <option value="international">Олон улсын</option>

                <option value="domestic">Дотоодын</option>

                <option value="children">Хүүхдийн</option>

                <option value="wellness">Эрүүл мэнд</option>

                <option value="religious">Тусгай аялал</option>
              </select>

              {fieldError('category')}
            </div>

            {/* DURATION */}

            <div data-error-field="durationDays">
              <FieldLabel required>Аяллын хугацаа</FieldLabel>

              <input
                className={`${inputClass} ${
                  hasError('durationDays')
                    ? 'border-red-400 focus:border-red-500'
                    : ''
                }`}
                type="number"
                min="1"
                max="365"
                placeholder="Өдрийн тоо"
                value={form.durationDays}
                onChange={(e) => set('durationDays', e.target.value)}
              />

              {fieldError('durationDays')}
            </div>

            {/* CURRENCY */}

            <div>
              <FieldLabel>Валют</FieldLabel>

              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                <option value="MNT">MNT</option>

                <option value="USD">USD</option>
              </select>
            </div>

            {/* STARTING PRICE */}

            <div data-error-field="startingPrice">
              <FieldLabel required>Эхлэх үнэ</FieldLabel>

              <input
                className={`${inputClass} ${
                  hasError('startingPrice')
                    ? 'border-red-400 focus:border-red-500'
                    : ''
                }`}
                type="number"
                min="0"
                placeholder="Жишээ: 2190000"
                value={form.startingPrice}
                onChange={(e) => set('startingPrice', e.target.value)}
              />

              {fieldError('startingPrice')}
            </div>

            {/* DISCOUNT PRICE */}

            <div data-error-field="discountPrice">
              <FieldLabel>Хямдарсан үнэ</FieldLabel>

              <input
                className={`${inputClass} ${
                  hasError('discountPrice')
                    ? 'border-red-400 focus:border-red-500'
                    : ''
                }`}
                type="number"
                min="0"
                placeholder="Заавал биш"
                value={form.discountPrice}
                onChange={(e) => set('discountPrice', e.target.value)}
              />

              {fieldError('discountPrice')}
            </div>

            {/* GROUP COUNT */}

            <div data-error-field="groupCount">
              <FieldLabel required>Группийн тоо</FieldLabel>

              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  className={`${inputClass} pl-10 ${
                    hasError('groupCount') ? 'border-red-400' : ''
                  }`}
                  type="number"
                  min="1"
                  placeholder="Группийн тоо"
                  value={form.groupCount}
                  onChange={(e) => set('groupCount', e.target.value)}
                />
              </div>

              {fieldError('groupCount')}
            </div>

            {/* CHILDREN PRICE */}

            <div data-error-field="childrenPrice">
              <FieldLabel>Хүүхдийн үнэ</FieldLabel>

              <input
                className={`${inputClass} ${
                  hasError('childrenPrice')
                    ? 'border-red-400 focus:border-red-500'
                    : ''
                }`}
                type="number"
                min="0"
                placeholder="Хүүхдийн үнэ"
                value={form.childrenPrice}
                onChange={(e) => set('childrenPrice', e.target.value)}
              />

              {fieldError('childrenPrice')}
            </div>

            {/* HOTEL */}

            <div data-error-field="hotel">
              <FieldLabel>Зочид буудал</FieldLabel>

              <div className="relative">
                <Hotel className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  className={`${inputClass} pl-10 ${
                    hasError('hotel') ? 'border-red-400' : ''
                  }`}
                  placeholder="Зочид буудлын мэдээлэл"
                  value={form.hotel}
                  onChange={(e) => set('hotel', e.target.value)}
                />
              </div>

              {fieldError('hotel')}
            </div>

            {/* FLIGHT */}

            <div data-error-field="flight">
              <FieldLabel>Нислэг</FieldLabel>

              <div className="relative">
                <Plane className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  className={`${inputClass} pl-10 ${
                    hasError('flight') ? 'border-red-400' : ''
                  }`}
                  placeholder="Нислэгийн мэдээлэл"
                  value={form.flight}
                  onChange={(e) => set('flight', e.target.value)}
                />
              </div>

              {fieldError('flight')}
            </div>

            {/* SUMMARY */}

            <div className="md:col-span-2" data-error-field="summary">
              <FieldLabel required>Товч тайлбар</FieldLabel>

              <textarea
                className={`${textareaClass} min-h-[120px] ${
                  hasError('summary')
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : ''
                }`}
                placeholder="Энэ аяллын талаар товч, сонирхолтой тайлбар бичнэ үү..."
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
              />

              <div className="mt-1.5 flex items-center justify-between">
                {fieldError('summary')}

                <span className="ml-auto text-[11px] text-slate-400">
                  {form.summary?.length || 0}
                  /1000
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* ==================================
            IMAGES
        ================================== */}

        <section className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <ImagePlus className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>

            <div>
              <h2 className="text-sm font-bold">Аяллын зураг</h2>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Үндсэн зураг болон галерейн зургуудыг оруулна уу.
              </p>
            </div>
          </div>

          <div className="mb-4 grid gap-4 md:grid-cols-2">
            {/* MAIN IMAGE */}

            <div data-error-field="image">
              <FieldLabel required>Үндсэн зургийн холбоос</FieldLabel>

              <input
                className={`${inputClass} ${
                  hasError('image') ? 'border-red-400 focus:border-red-500' : ''
                }`}
                placeholder="https://..."
                value={form.image}
                onChange={(e) => set('image', e.target.value)}
              />

              {fieldError('image')}
            </div>

            {/* GALLERY URL */}

            <div>
              <FieldLabel>Галерейн зураг URL</FieldLabel>

              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />

                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={uploading}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  Нэмэх
                </button>
              </div>
            </div>
          </div>

          {/* FILE UPLOAD */}

          <label
            className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 ${
              uploading ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {uploading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white" />
                Зураг оруулж байна...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Зураг сонгох / upload хийх
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => upload(e.target.files)}
                />
              </>
            )}
          </label>

          {/* GALLERY */}

          {(form.gallery || []).length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(form.gallery || []).map((url: string, index: number) => (
                <div
                  key={`${url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {form.image === url && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-slate-950/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                      Үндсэн зураг
                    </span>
                  )}

                  <div className="absolute right-2 top-2 flex gap-1.5">
                    {form.image !== url && (
                      <button
                        type="button"
                        onClick={() => set('image', url)}
                        className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
                        title="Үндсэн зураг болгох"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const gallery = form.gallery.filter(
                          (_: string, i: number) => i !== index,
                        );

                        set('gallery', gallery);

                        if (form.image === url) {
                          set('image', gallery[0] || '');
                        }
                      }}
                      className="grid h-7 w-7 place-items-center rounded-md bg-black/70 text-white transition hover:bg-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* ==================================
            ITINERARY
        ================================== */}

        <section className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <CalendarDays className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>

              <div>
                <h2 className="text-sm font-bold">Аяллын хөтөлбөр</h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Өдөр бүрийн хөтөлбөр, дэлгэрэнгүй мэдээллийг оруулна уу.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addItineraryDay}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Plus className="h-4 w-4" />
              Өдөр нэмэх
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {(form.itinerary || []).map((day: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 min-w-7 place-items-center rounded-md bg-slate-950 px-2 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                      {index + 1}
                    </span>

                    <span className="text-sm font-bold">
                      {index + 1}-р өдөр
                    </span>
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(index)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 transition hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Устгах
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* TITLE */}

                  <div data-error-field={`itinerary.${index}.title`}>
                    <FieldLabel>Өдрийн гарчиг</FieldLabel>

                    <input
                      className={`${inputClass} ${
                        hasError(`itinerary.${index}.title`)
                          ? 'border-red-400'
                          : ''
                      }`}
                      placeholder="Жишээ: Сөүл хотын аялал"
                      value={day.title}
                      onChange={(e) =>
                        updateDay(index, 'title', e.target.value)
                      }
                    />

                    {fieldError(`itinerary.${index}.title`)}
                  </div>

                  {/* DETAIL */}

                  <div
                    className="md:row-span-2"
                    data-error-field={`itinerary.${index}.detail`}
                  >
                    <FieldLabel>Дэлгэрэнгүй хөтөлбөр</FieldLabel>

                    <textarea
                      className={`${textareaClass} min-h-[108px] ${
                        hasError(`itinerary.${index}.detail`)
                          ? 'border-red-400'
                          : ''
                      }`}
                      placeholder="Тухайн өдөр хийх аялал, үзэх газар, хоол гэх мэт..."
                      value={day.detail}
                      onChange={(e) =>
                        updateDay(index, 'detail', e.target.value)
                      }
                    />

                    {fieldError(`itinerary.${index}.detail`)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* ==================================
            INCLUDED / EXCLUDED
        ================================== */}

        <section className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-sm font-bold">Үйлчилгээний нөхцөл</h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Аяллын үнэд багтсан болон багтаагүй зүйлсийг тодорхой бичнэ үү.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* INCLUDED */}

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>

                  <h3 className="text-sm font-bold">Үнэд багтсан</h3>
                </div>

                <button
                  type="button"
                  onClick={() => addArrayItem('included')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  + Нэмэх
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {(form.included || []).map((value: string, index: number) => (
                  <div key={index} data-error-field={`included.${index}`}>
                    <input
                      className={`${inputClass} ${
                        hasError(`included.${index}`) ? 'border-red-400' : ''
                      }`}
                      value={value}
                      onChange={(e) =>
                        updateArrayItem('included', index, e.target.value)
                      }
                      placeholder="Жишээ: Зочид буудал"
                    />

                    {fieldError(`included.${index}`)}
                  </div>
                ))}
              </div>
            </div>

            {/* EXCLUDED */}

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 dark:bg-red-950/40">
                    <X className="h-4 w-4 text-red-500" />
                  </div>

                  <h3 className="text-sm font-bold">Үнэд багтаагүй</h3>
                </div>

                <button
                  type="button"
                  onClick={() => addArrayItem('excluded')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                >
                  + Нэмэх
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {(form.excluded || []).map((value: string, index: number) => (
                  <div key={index} data-error-field={`excluded.${index}`}>
                    <input
                      className={`${inputClass} ${
                        hasError(`excluded.${index}`) ? 'border-red-400' : ''
                      }`}
                      value={value}
                      onChange={(e) =>
                        updateArrayItem('excluded', index, e.target.value)
                      }
                      placeholder="Жишээ: Хувийн зардал"
                    />

                    {fieldError(`excluded.${index}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* ==================================
            DEPARTURE DATES
        ================================== */}

        <section className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Clock3 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>

              <div>
                <h2 className="text-sm font-bold">Явах огноо</h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Аялал эхлэх боломжтой өдрүүдээ сонгоно уу.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addDepartureDate}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Plus className="h-4 w-4" />
              Огноо нэмэх
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {(form.departureDates || []).map((date: string, index: number) => (
              <div
                key={index}
                data-error-field={`departureDates.${index}`}
                className="relative"
              >
                <input
                  type="date"
                  className={`${inputClass} pr-10 ${
                    hasError(`departureDates.${index}`) ? 'border-red-400' : ''
                  }`}
                  value={date}
                  onChange={(e) => updateDepartureDate(index, e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => removeDepartureDate(index)}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {fieldError(`departureDates.${index}`)}
              </div>
            ))}
          </div>

          {(!form.departureDates || form.departureDates.length === 0) && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center dark:border-slate-800">
              <CalendarDays className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600" />

              <p className="mt-2 text-xs text-slate-400">
                Одоогоор явах огноо нэмэгдээгүй байна.
              </p>
            </div>
          )}
        </section>

        {/* ==================================
            SAVE FOOTER
        ================================== */}

        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Аяллыг нийтэд харуулах тохиргоогоо сонгоно уу.
            </p>

            <div className="mt-3 flex flex-wrap gap-5">
              {/* ACTIVE */}

              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={Boolean(form.active)}
                  onChange={(e) => set('active', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                />
                Нийтэд харагдах
              </label>

              {/* FEATURED */}

              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-slate-950"
                />
                Онцлох аялал
              </label>
            </div>
          </div>

          {/* SAVE */}

          <button
            type="button"
            disabled={saving || uploading}
            onClick={save}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-300 dark:border-t-slate-950" />
                Хадгалж байна...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />

                {editing ? 'Өөрчлөлт хадгалах' : 'Аялал үүсгэх'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================
          TOUR LIST
      ================================== */}

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Бүртгэгдсэн аяллууд
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Нийт {displayed.length} аялал
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {displayed.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
              <MapPin className="mx-auto h-7 w-7 text-slate-300 dark:text-slate-600" />

              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Одоогоор аялал бүртгэгдээгүй байна.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Дээрх хэсгээс шинэ аялал үүсгэнэ үү.
              </p>
            </div>
          )}

          {displayed.map((tour) => (
            <div
              key={tour.id}
              className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex-row sm:items-center"
            >
              {/* IMAGE */}

              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-32 dark:bg-slate-800">
                {tour.image ? (
                  <img
                    src={tour.image}
                    alt={tour.name || ''}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ImagePlus className="h-5 w-5 text-slate-400" />
                  </div>
                )}

                {tour.featured && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-900 backdrop-blur">
                    <Star className="h-3 w-3 fill-current" />
                    Онцлох
                  </span>
                )}
              </div>

              {/* INFO */}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                    {tour.name}
                  </h3>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                      tour.active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {tour.active ? 'Нийтэд харагдаж байна' : 'Нуугдсан'}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {categoryLabel[tour.category] ||
                    tour.category ||
                    'Ангилалгүй'}{' '}
                  · {tour.durationDays || 0} өдөр ·{' '}
                  {Number(
                    tour.discountPrice || tour.startingPrice || 0,
                  ).toLocaleString()}{' '}
                  {tour.currency || 'MNT'}
                </p>

                {tour.country && (
                  <p className="mt-1 text-xs text-slate-400">{tour.country}</p>
                )}
              </div>

              {/* ACTIONS */}

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => edit(tour)}
                  disabled={saving || deletingId !== null}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Засах
                </button>

                <button
                  type="button"
                  onClick={() => remove(tour.id)}
                  disabled={deletingId === tour.id || saving}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 text-xs font-semibold text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-950 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  {deletingId === tour.id ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}

                  {deletingId === tour.id ? 'Устгаж байна...' : 'Устгах'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
