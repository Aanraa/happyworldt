import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import BlogImage from './BlogImage';
import BlogMeta from './BlogMeta';
type Article = {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  createdAt?: any;
};
type BlogCardProps = { article: Article; featured?: boolean };
export default function BlogCard({ article, featured = false }: BlogCardProps) {
  const href = `/blog/${article.slug || article.id}`;
  /* * FEATURED CARD */ if (featured) {
    return (
      <Link
        href={href}
        className="group block overflow-hidden rounded-[1.75rem] border border-[#e7e0d7] bg-white shadow-[0_8px_40px_rgba(30,25,20,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(30,25,20,0.11)] dark:border-slate-800 dark:bg-slate-900"
      >
        {' '}
        <BlogImage
          src={article.coverImage}
          alt={article.title}
          priority
          className="h-[360px] w-full bg-[#eee9e2] sm:h-[430px]"
        />{' '}
        <div className="p-6 sm:p-8">
          {' '}
          <div className="flex items-center justify-between gap-4">
            {' '}
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a96f2d]">
              {' '}
              Онцлох нийтлэл{' '}
            </span>{' '}
            <ArrowUpRight className="h-4 w-4 text-slate-400 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#a96f2d]" />{' '}
          </div>{' '}
          <h2 className="mt-4 max-w-3xl text-2xl font-extrabold leading-[1.2] tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {' '}
            {article.title || 'Гарчиггүй нийтлэл'}{' '}
          </h2>{' '}
          {article.excerpt && (
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
              {' '}
              {article.excerpt}{' '}
            </p>
          )}{' '}
          <div className="mt-6">
            {' '}
            <BlogMeta
              createdAt={article.createdAt}
              content={article.content}
            />{' '}
          </div>{' '}
          <div className="mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">
            {' '}
            Дэлгэрэнгүй{' '}
            <ArrowUpRight className="h-3.5 w-3.5 text-[#a96f2d] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />{' '}
          </div>{' '}
        </div>{' '}
      </Link>
    );
  }
  /* * COMPACT CARD */ return (
    <Link
      href={href}
      className="group flex gap-4 border-b border-[#e9e3db] py-4 first:pt-0 last:border-b-0 dark:border-slate-800"
    >
      {' '}
      <BlogImage
        src={article.coverImage}
        alt={article.title}
        className="h-[92px] w-[118px] shrink-0 rounded-xl bg-[#eee9e2] sm:h-[105px] sm:w-[135px]"
      />{' '}
      <div className="min-w-0 flex-1 py-0.5">
        {' '}
        <div className="flex items-start justify-between gap-2">
          {' '}
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a96f2d]">
            {' '}
            Travel journal{' '}
          </span>{' '}
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#a96f2d]" />{' '}
        </div>{' '}
        <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-[#a96f2d] dark:text-white dark:group-hover:text-[#d9a86c] sm:text-[15px]">
          {' '}
          {article.title || 'Гарчиггүй нийтлэл'}{' '}
        </h3>{' '}
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {' '}
            {article.excerpt}{' '}
          </p>
        )}{' '}
        <div className="mt-2">
          {' '}
          <BlogMeta
            createdAt={article.createdAt}
            content={article.content}
            compact
          />{' '}
        </div>{' '}
      </div>{' '}
    </Link>
  );
}
