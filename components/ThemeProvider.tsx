'use client';
import { createContext, useContext, useEffect, useState } from 'react';
type Theme = 'light' | 'dark';
const C = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} });
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    const t = (localStorage.getItem('hwt-theme') as Theme) || 'light';
    setTheme(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);
  const toggle = () =>
    setTheme((t) => {
      const n = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('hwt-theme', n);
      document.documentElement.classList.toggle('dark', n === 'dark');
      return n;
    });
  return <C.Provider value={{ theme, toggle }}>{children}</C.Provider>;
}
export const useTheme = () => useContext(C);
