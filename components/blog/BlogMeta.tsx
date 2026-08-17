import { CalendarDays, Clock3 } from 'lucide-react';
type BlogMetaProps = { createdAt?: any; content?: string; compact?: boolean };
function getDate(value: any) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') {
    return value.toDate();
  }
  if (value?.seconds) {
    return new Date(value.seconds * 1000);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
export default function BlogMeta({
  createdAt,
  content = '',
  compact = false,
}: BlogMetaProps) {
  const date = getDate(createdAt);
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 ${compact ? 'text-[11px]' : 'text-xs'}`}
    >
      {' '}
      {date && (
        <span className="inline-flex items-center gap-1.5">
          {' '}
          <CalendarDays className="h-3.5 w-3.5" />{' '}
          {date.toLocaleDateString('mn-MN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}{' '}
        </span>
      )}{' '}
      <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />{' '}
      <span className="inline-flex items-center gap-1.5">
        {' '}
        <Clock3 className="h-3.5 w-3.5" /> {readingTime} минут{' '}
      </span>{' '}
    </div>
  );
}
