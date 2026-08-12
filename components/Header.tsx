'use client';
import Link from 'next/link';
import {Menu,X,Sun,Moon,UserRound,LayoutDashboard,ChevronDown} from 'lucide-react';
import {useState,useEffect} from 'react';
import {useTheme} from './ThemeProvider';
import {useAuth} from './AuthProvider';
import {isAdmin} from '@/lib/auth';

export default function Header(){
 const[open,setOpen]=useState(false);
 const[admin,setAdmin]=useState(false);
 const{theme,toggle}=useTheme();
 const{user}=useAuth();
 useEffect(()=>{let alive=true;(async()=>{if(user){const v=await isAdmin(user.uid,user.email,user.emailVerified);if(alive)setAdmin(v)}else setAdmin(false)})();return()=>{alive=false}},[user]);
 const links=[['Аяллууд','/tours'],['Дотоодын аялал','/tours?category=domestic'],['Хүүхдийн аялал','/tours?category=children'],['Бидний тухай','/about'],['Блог','/blog'],['Холбоо барих','/contact']];
 return <header className="sticky top-0 z-50 border-b border-[#eadfce]/80 bg-[#fffdf9]/90 backdrop-blur-xl dark:border-slate-800 dark:bg-[#101827]/90">
  <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4">
   <Link href="/" className="group flex items-center gap-2">
    <span className="text-xl font-extrabold tracking-[-.04em] text-[#a96f2d] dark:text-[#e8bb80]">HAPPY WORLD</span>
    <span className="text-xl font-extrabold tracking-[-.04em] text-[#172033] dark:text-white">TOUR</span>
   </Link>
   <nav className="hidden items-center gap-5 lg:flex">
    {links.map(([n,h])=><Link key={h} href={h} className="text-[13px] font-semibold text-slate-600 transition hover:text-[#a96f2d] dark:text-slate-300 dark:hover:text-[#e8bb80]">{n}</Link>)}
    {admin&&<Link href="/admin" className="flex items-center gap-1.5 rounded-xl bg-[#172033] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#26334a]"><LayoutDashboard size={15}/> Удирдлага</Link>}
    <button onClick={toggle} aria-label="Өнгөний горим" className="rounded-xl border border-[#e4d8c8] p-2 dark:border-slate-700">{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
    <Link href={user?'/account':'/auth/login'} className="flex items-center gap-2 rounded-xl bg-[#b77b3b] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#9e682f]"><UserRound size={16}/>{user?'Миний бүртгэл':'Нэвтрэх'}</Link>
   </nav>
   <div className="flex items-center gap-2 lg:hidden">
    {admin&&<Link href="/admin" aria-label="Удирдлага" className="rounded-xl bg-[#172033] p-2 text-white"><LayoutDashboard size={17}/></Link>}
    <button onClick={toggle} className="rounded-xl border border-[#e4d8c8] p-2 dark:border-slate-700">{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button>
    <button onClick={()=>setOpen(!open)} className="rounded-xl border border-[#e4d8c8] p-2 dark:border-slate-700">{open?<X/>:<Menu/>}</button>
   </div>
  </div>
  {open&&<div className="border-t border-[#eadfce] bg-[#fffdf9] px-4 py-4 dark:border-slate-800 dark:bg-[#101827] lg:hidden">
   {links.map(([n,h])=><Link onClick={()=>setOpen(false)} key={h} href={h} className="block rounded-xl px-3 py-3 font-semibold">{n}</Link>)}
   {admin&&<Link onClick={()=>setOpen(false)} href="/admin" className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#172033] px-3 py-3 font-bold text-white"><LayoutDashboard size={16}/> Удирдлагын самбар</Link>}
   <Link onClick={()=>setOpen(false)} href={user?'/account':'/auth/login'} className="mt-2 block rounded-xl bg-[#b77b3b] px-3 py-3 text-center font-bold text-white">{user?'Миний бүртгэл':'Нэвтрэх'}</Link>
  </div>}
 </header>
}
