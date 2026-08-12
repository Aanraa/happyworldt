import Link from 'next/link';
import {Facebook,Instagram,Send,MapPin,Phone,Mail,ArrowUpRight} from 'lucide-react';

export default function Footer(){
 return <footer className="mt-20 bg-[#172033] text-white">
  <div className="mx-auto max-w-7xl px-4 py-14">
   <div className="grid gap-10 md:grid-cols-[1.4fr_.8fr_1fr]">
    <div>
     <div className="text-2xl font-extrabold tracking-[-.04em]"><span className="text-[#e8bb80]">HAPPY WORLD</span> TOUR</div>
     <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Дурсамж үлдээх аяллыг бид тантай хамт төлөвлөж, илүү хялбар, илүү итгэлтэй аялахад тань тусална.</p>
     <div className="mt-6 flex gap-2"><a href="#" aria-label="Facebook" className="rounded-xl border border-white/10 p-2.5 hover:bg-white/10"><Facebook size={17}/></a><a href="#" aria-label="Instagram" className="rounded-xl border border-white/10 p-2.5 hover:bg-white/10"><Instagram size={17}/></a><a href="#" aria-label="Messenger" className="rounded-xl border border-white/10 p-2.5 hover:bg-white/10"><Send size={17}/></a></div>
    </div>
    <div><h3 className="font-bold">Хурдан холбоос</h3><div className="mt-4 space-y-3 text-sm text-slate-300"><Link className="block hover:text-[#e8bb80]" href="/tours">Аяллууд</Link><Link className="block hover:text-[#e8bb80]" href="/about">Бидний тухай</Link><Link className="block hover:text-[#e8bb80]" href="/blog">Аяллын блог</Link><Link className="block hover:text-[#e8bb80]" href="/contact">Холбоо барих</Link></div></div>
    <div><h3 className="font-bold">Бидэнтэй холбогдох</h3><div className="mt-4 space-y-4 text-sm text-slate-300"><p className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-[#e8bb80]"/>Улаанбаатар, Монгол</p><p className="flex gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-[#e8bb80]"/>+976 0000-0000</p><p className="flex gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-[#e8bb80]"/>info@happyworldtour.mn</p></div></div>
   </div>
   <div className="mt-12 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row"><span>© 2026 Happy World Tour. Бүх эрх хуулиар хамгаалагдсан.</span><span>Таны дараагийн дурсамж эндээс эхэлнэ.</span></div>
  </div>
 </footer>
}
