'use client';
import Link from 'next/link';
import {ArrowRight,ShieldCheck,Globe2,HeartHandshake,Star,MapPin,CalendarDays,Sparkles,Quote} from 'lucide-react';
import {useEffect,useState} from 'react';
import {collection,onSnapshot,query,where} from 'firebase/firestore';
import {db} from '@/lib/firebase';

const tours=[
 ['Хайнань — Далайн эргийн амралт','Хятад','https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85'],
 ['Япон — Соёл ба байгаль','Ази','https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=85'],
 ['Говь — Монголын гайхамшиг','Монгол','https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85']
];

export default function Home(){
 const[posts,setPosts]=useState<any[]>([]);
 useEffect(()=>onSnapshot(query(collection(db,'articles'),where('published','==',true)),s=>setPosts(s.docs.map(d=>({id:d.id,...d.data()})).slice(0,3))),[]);
 return <main className="overflow-hidden">
  <section className="relative bg-[#172033] text-white">
   <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#b77b3b]/20 blur-3xl"/>
   <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#6e8b82]/20 blur-3xl"/>
   <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-[.9fr_1.1fr]">
    <div className="max-w-xl">
     <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-wide text-[#e8bb80]"><Sparkles size={14}/> Аяллаа аз жаргалаар эхлүүл</div>
     <h1 className="mt-7 text-5xl font-extrabold leading-[1.05] tracking-[-.05em] sm:text-6xl lg:text-[68px]">Дараагийн <span className="text-[#e8bb80]">дурсамж</span> эндээс эхэлнэ.</h1>
     <p className="mt-6 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">Танд тохирсон аяллыг сонгож, төлөвлөлтөөс эхлээд аяллын турш найдвартай хамт байна.</p>
     <div className="mt-8 flex flex-wrap gap-3"><Link href="/tours" className="rounded-2xl bg-[#b77b3b] px-6 py-3.5 font-bold shadow-lg shadow-black/20 transition hover:bg-[#c88a48]">Аяллуудаа үзэх <ArrowRight className="ml-2 inline" size={18}/></Link><Link href="/contact" className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-bold hover:bg-white/10">Зөвлөгөө авах</Link></div>
     <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-300"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#e8bb80]"/> Найдвартай үйлчилгээ</span><span className="flex items-center gap-2"><Globe2 size={16} className="text-[#e8bb80]"/> Олон улсын чиглэл</span></div>
    </div>
    <div className="relative">
      <div className="absolute -inset-3 rounded-[2.5rem] border border-white/10"/>
      <div className="relative overflow-hidden rounded-[2.25rem]"><img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1500&q=90" alt="Аялал" className="h-[440px] w-full object-cover sm:h-[520px]"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-7 pt-24"><p className="flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-[#e8bb80]"/> Дэлхийн сонирхолтой газрууд</p><p className="mt-1 text-2xl font-extrabold">Хамтдаа аялцгаая.</p></div></div>
    </div>
   </div>
  </section>

  <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4">
   <div className="grid overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-[#182234] sm:grid-cols-2 lg:grid-cols-4">
    {[['3,865+','Аз жаргалтай аялагч'],['16','Аяллын чиглэл'],['3+','Жилийн туршлага'],['4.5','Дундаж үнэлгээ']].map(([n,l],i)=><div key={l} className="flex items-center gap-4 border-b border-[#eee5d8] p-6 last:border-0 dark:border-slate-700 sm:border-r sm:last:border-r-0 lg:border-b-0"><div className="text-3xl font-extrabold tracking-tight text-[#a96f2d] dark:text-[#e8bb80]">{n}</div><div className="text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">{l}</div>{i===3&&<Star className="ml-auto fill-current text-[#c89652]" size={18}/>}</div>)}
   </div>
  </section>

  <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
   <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a96f2d]">Онцлох аяллууд</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Танд таалагдах чиглэлүүд</h2><p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">Амралт, адал явдал, гэр бүл, найз нөхөд — ямар ч аяллын зорилгод тохирох сонголтууд.</p></div><Link href="/tours" className="font-bold text-[#a96f2d]">Бүх аяллыг үзэх <ArrowRight className="ml-1 inline" size={17}/></Link></div>
   <div className="mt-9 grid gap-6 md:grid-cols-3">{tours.map(([name,region,img])=><Link href="/tours" key={name} className="group overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-[#182234]"><div className="overflow-hidden"><img src={img} alt={name} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"/></div><div className="p-5"><p className="flex items-center gap-1.5 text-xs font-bold text-[#a96f2d]"><MapPin size={13}/>{region}</p><h3 className="mt-2 text-xl font-extrabold">{name}</h3><span className="mt-5 inline-flex items-center text-sm font-bold">Дэлгэрэнгүй <ArrowRight className="ml-2" size={15}/></span></div></Link>)}</div>
  </section>

  <section className="bg-[#f5efe6] py-20 dark:bg-[#151f2e]"><div className="mx-auto max-w-7xl px-4"><div className="text-center"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a96f2d]">Яагаад Happy World Tour гэж?</p><h2 className="mt-2 text-3xl font-extrabold">Аяллаа санаа зоволтгүйгээр төлөвлө</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[[ShieldCheck,'Найдвартай үйлчилгээ','Аяллын мэдээлэл, захиалга, зөвлөгөөг нэг дороос ойлгомжтой аваарай.'],[Globe2,'Сонгогдсон чиглэлүүд','Таны цаг, төсөв, сонирхолд нийцсэн дотоодын болон гадаад аяллууд.'],[HeartHandshake,'Хүн төвтэй дэмжлэг','Асуух зүйл гарвал манай багтай хурдан холбогдож, зөвлөгөө аваарай.']].map(([I,t,d])=>{const Icon=I as any;return <div key={t as string} className="rounded-3xl border border-[#e5d8c7] bg-white p-7 dark:border-slate-700 dark:bg-[#182234]"><Icon className="text-[#b77b3b]" size={28}/><h3 className="mt-5 text-lg font-extrabold">{t as string}</h3><p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{d as string}</p></div>})}</div></div></section>

  <section className="mx-auto max-w-7xl px-4 py-20"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#a96f2d]">Аяллын тэмдэглэл</p><h2 className="mt-2 text-3xl font-extrabold">Бидний блогоос</h2></div><Link href="/blog" className="font-bold text-[#a96f2d]">Бүгдийг унших <ArrowRight className="ml-1 inline" size={17}/></Link></div>
   <div className="mt-8 grid gap-6 md:grid-cols-3">{posts.length?posts.map(a=><Link href="/blog" key={a.id} className="group overflow-hidden rounded-3xl border border-[#eadfce] bg-white dark:border-slate-700 dark:bg-[#182234]">{a.coverImage?<img src={a.coverImage} alt={a.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"/>:<div className="h-52 bg-[#e9decd] dark:bg-slate-800"/>}<div className="p-5"><p className="text-xs font-bold text-[#a96f2d]">АЯЛЛЫН БЛОГ</p><h3 className="mt-2 text-xl font-extrabold">{a.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{a.excerpt}</p><span className="mt-4 inline-block text-sm font-bold">Унших →</span></div></Link>):[1,2,3].map(i=><div key={i} className="rounded-3xl border border-dashed border-[#dccdbb] p-8 dark:border-slate-700"><CalendarDays className="text-[#b77b3b]"/><h3 className="mt-4 font-extrabold">Удахгүй шинэ нийтлэл</h3><p className="mt-2 text-sm text-slate-500">Аяллын зөвлөгөө, сонирхолтой түүхүүд удахгүй нэмэгдэнэ.</p></div>)}</div>
  </section>

  <section className="mx-auto max-w-7xl px-4 pb-24"><div className="relative overflow-hidden rounded-[2rem] bg-[#b77b3b] px-7 py-12 text-white sm:px-12"><div className="absolute -right-10 -top-24 h-72 w-72 rounded-full bg-white/10"/><div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">Таны дараагийн аялал</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Аяллын санаагаа бидэнтэй хуваалцаарай.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/80">Чиглэлээ хараахан сонгоогүй бол зүгээр. Бид танд тохирох сонголтыг хамт олъё.</p></div><Link href="/contact" className="shrink-0 rounded-2xl bg-white px-6 py-3.5 font-extrabold text-[#8f5e2a] shadow-lg hover:bg-[#fff8ef]">Холбогдох <ArrowRight className="ml-2 inline" size={17}/></Link></div></div></section>
 </main>
}
