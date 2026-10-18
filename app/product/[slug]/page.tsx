import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { allProducts, findProductBySlug } from '@/server/catalog';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetailView from '@/components/product/ProductDetailView';
import ProductDossierTabs from '@/components/product/ProductDossierTabs';
import ProductCard from '@/components/product/ProductCard';
import RecentlyViewed from '@/components/product/RecentlyViewed';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    return {
      title: 'Ապրանքը չի գտնվել | TAB.AM',
    };
  }

  return {
    title: `${product.title} (ԿՈԴ: ${product.code}) | TAB.AM`,
    description: `${product.title} - ${product.shortDesc} Առկա է Մելքումովի 40/1 սրահում: Գործարանային երաշխիք:`,
    openGraph: {
      title: `${product.title} (Կոդ: ${product.code}) | tab.am`,
      description: product.shortDesc,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Related products from the same category
  const relatedProducts = allProducts()
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-lux py-6 sm:py-8 space-y-8 sm:space-y-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
        <Link href="/" className="hover:text-accent transition-colors shrink-0">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
        <Link href="/catalog" className="hover:text-accent transition-colors shrink-0">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
        <Link
          href={`/category/${product.categorySlug}`}
          className="hover:text-accent transition-colors shrink-0"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
        <span className="text-ink font-bold truncate max-w-xs sm:max-w-md shrink-0">
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Layout on Desktop, Mobile-First Stacked Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
        {/* Gallery: 1st on mobile, left 7 cols on desktop */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            blueprintImage={product.blueprintImage}
            title={product.title}
          />
        </div>

        {/* Buy Box: 2nd on mobile (immediately following gallery), right 5 cols on desktop (sticky top-28 spanning gallery and specs) */}
        <div className="lg:col-span-5 lg:row-span-2 lg:sticky lg:top-28">
          <ProductDetailView product={product} />
        </div>

        {/* Description & Dossier Tabs: 3rd on mobile, underneath gallery on desktop in left 7 cols */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8">
          {/* Description Block */}
          <div className="bg-white p-5 sm:p-8 rounded-panel border border-line shadow-e1 space-y-4">
            <h2 className="text-base font-semibold text-ink">
              Ապրանքի Նկարագրություն
            </h2>
            <p className="text-xs sm:text-sm text-body leading-relaxed font-normal">
              {product.shortDesc}
            </p>
            <div className="p-4 rounded-panel bg-accent/5 border border-accent/15 text-xs text-ink flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                Այս մոդելն անցել է գործարանային 10 բար հիդրավլիկ ճնշման փորձարկում և ունի պաշտոնական
                երաշխիքային կտրոն:
              </span>
            </div>
          </div>

          {/* Interactive Technical Dossier Tabs — the ONLY full specs table on the page */}
          <ProductDossierTabs product={product} />
        </div>
      </div>


      {/* Related Products Section (2-col mobile, 4-col desktop) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-line">
          <div>
            <span className="text-xs font-semibold text-accent">
              Առաջարկներ
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight mt-0.5">
              Նմանատիպ Ապրանքներ Այս Բաժնում
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed Carousel */}
      <RecentlyViewed currentProductId={product.id} />
    </div>
  );
}
