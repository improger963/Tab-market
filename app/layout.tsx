import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter, Noto_Sans_Armenian } from 'next/font/google';
import './globals.css';
import { business } from '@/config/site';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import AuthModal from '@/components/auth/AuthModal';
import ToastContainer from '@/components/ui/ToastContainer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hy = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-hy',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tab.am';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'tab.am | Ջրամատակարարման և Սանտեխնիկայի Խանութ-Սրահ Երևանում',
    template: '%s | tab.am',
  },
  description: `Ժամանակակից սանտեխնիկա և ջրամատակարարման ապրանքներ Երևանում՝ ${business.address.line}։ Ծորակներ, խողովակներ, սանկերամիկա և միացումներ՝ առկայությամբ և գներով։`,
  authors: [{ name: 'tab.am' }],
  openGraph: {
    type: 'website',
    locale: 'hy_AM',
    siteName: 'tab.am',
    url: SITE_URL,
    title: 'tab.am | Ջրամատակարարման և Սանտեխնիկայի Խանութ-Սրահ Երևանում',
    description: `Ժամանակակից սանտեխնիկա և ջրամատակարարման ապրանքներ Երևանում՝ ${business.address.line}։`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tab.am | Խանութ-Սրահ Երևանում',
    description: 'Սանտեխնիկա և ջրամատակարարում՝ առկայությամբ և գներով։',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hy" className={`${inter.variable} ${hy.variable}`}>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-body antialiased selection:bg-accent selection:text-white pb-shell">
        <TopBar />
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
        <ToastContainer />
      </body>
    </html>
  );
}
