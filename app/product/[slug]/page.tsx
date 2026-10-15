import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { products } from '@/data/products';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetailView from '@/components/product/ProductDetailView';
import ProductCard from '@/components/product/ProductCard';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Ապրանքը չի գտնվել | TAB.AM',
    };
  }

  return {
    title: `${product.title} (ԿՈԴ: ${product.code}) | TAB.AM`,
    description: `${product.title} - ${product.shortDesc} Առկա է Մելքումովի 40/1 սրահում (${product.stockQuantity} հատ): Գործարանային երաշխիք:`,
    openGraph: {
      title: `${product.title} (ՀԾ: ${product.code}) | tab.am`,
      description: product.shortDesc,
      images: [{ url: product.images[0] }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Related products from the same category
  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-cyan-600 transition-colors">
          Գլխավոր
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/catalog" className="hover:text-cyan-600 transition-colors">
          Կատալոգ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/catalog/${product.categorySlug}`}
          className="hover:text-cyan-600 transition-colors"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (7 cols): Gallery + Technical Specs */}
        <div className="lg:col-span-7 space-y-10">
          <ProductGallery
            images={product.images}
            blueprintImage={product.blueprintImage}
            title={product.title}
          />

          {/* Description Block */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
              Ապրանքի Նկարագրություն
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {product.shortDesc}
            </p>
            <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 text-xs text-cyan-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
              <span>
                Այս մոդելն անցել է գործարանային 10 բար հիդրավլիկ ճնշման փորձարկում և ունի պաշտոնական
                երաշխիքային կտրոն:
              </span>
            </div>
          </div>

          {/* Technical Specifications Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-600" />
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
                Տեխնիկական Բնութագիր (Specifications)
              </h2>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-600 bg-slate-50/50 w-2/5">
                        {key}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Sticky Buy Box */}
        <div className="lg:col-span-5 sticky top-24">
          <ProductDetailView product={product} />
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-200">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-700">
              Առաջարկներ
            </span>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-0.5">
              Նմանատիպ Ապրանքներ Այս Բաժնում
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
