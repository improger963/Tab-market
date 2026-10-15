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
    'tab.am - Ժամանակակից սանտեխնիկայի և ջրամատակարարման առաջատար խանութ-սրահ Երևանում (Մելքումովի 40/1): Ծորակներ, կաթսաներ, սանկերամիկա ՀԾ (ArmSoft) արտիկուլներով:',
  keywords: [
    'սանտեխնիկա',
    'ծորակներ',
    'կաթսաներ',
    'խողովակներ',
    'սանկերամիկա',
    'ArmSoft',
    'ՀԾ',
    'Երևան',
    'Մելքումովի 40/1',
    'tab.am',
  ],
  authors: [{ name: 'tab.am Plumbing & Heating Store' }],
  openGraph: {
    title: 'tab.am | Ջրամատակարարման և Սանտեխնիկայի Խանութ-Սրահ Երևան',
    description:
      'tab.am - Ժամանակակից սանտեխնիկա Երևանում, Մելքումովի 40/1: ՀԾ կոդերով որոնում և պահեստի առկայություն:',
    type: 'website',
    locale: 'hy_AM',
    siteName: 'tab.am',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#020617', // slate-950
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hy" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        <TopBar />
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <ToastContainer />
      </body>
    </html>
  );
}
