import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'cyrillic-ext'],
  variable: '--font-jakarta',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={`${jakarta.variable} min-h-screen flex flex-col`}>
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
