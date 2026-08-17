import Image from 'next/image';

type BlogImageProps = {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
};

export default function BlogImage({
  src,
  alt = '',
  className = '',
  priority = false,
}: BlogImageProps) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[#eee9e2] dark:bg-slate-800 ${className}`}
      >
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 rounded-full border border-[#cfc5b8] dark:border-slate-600" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Happy World Tour
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1200px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}
