import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import ToastContainer from '@/components/ui/ToastContainer';
import '@/src/index.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'tab.am | Ջրամատակարարման և Սանտեխնիկայի Խանութ-Սրահ Երևանում',
  description:
    'tab.am - Ժամանակակից սանտեխնիկայի և ջրամատակարարման առաջատար խանութ-սրահ Երևանում (Մելքումովի 40/1): Ծորակներ, կաթսաներ, սանկերամիկա  արտիկուլներով:',
  keywords: [
    'սանտեխնիկա',
    'ծորակներ',
    'կաթսաներ',
    'խողովակներ',
    'սանկերամիկա',
    '',
    '',
    'Երևան',
    'Մելքումովի 40/1',
    'tab.am',
  ],
  authors: [{ name: 'tab.am Plumbing & Heating Store' }],
  openGraph: {
    title: 'tab.am | Ջրամատակարարման և Սանտեխնիկայի Խանութ-Սրահ Երևան',
    description:
      'tab.am - Ժամանակակից սանտեխնիկա Երևանում, Մելքումովի 40/1:  կոդերով որոնում և պահեստի առկայություն:',
    type: 'website',
    locale: 'hy_AM',
    siteName: 'tab.am',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B192C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hy" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-800 antialiased flex flex-col font-sans selection:bg-[#2563EB] selection:text-white overflow-x-hidden w-full max-w-[100vw] pb-[calc(env(safe-area-inset-bottom,16px)+72px)] md:pb-0">
        <TopBar />
        <Header />
        <main className="flex-1 w-full bg-white">{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <ToastContainer />
      </body>
    </html>
  );
}
