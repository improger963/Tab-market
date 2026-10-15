import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogView from '@/components/catalog/CatalogView';
import { categories } from '@/data/categories';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return {
      title: 'Կատալոգ | tab.am',
    };
  }

  return {
    title: `${category.title} | tab.am Սանտեխնիկայի Խանութ-Սրահ Երևանում`,
    description: `tab.am - ${category.title}: Պահեստում առկա է ${category.itemCount} տեսականի Մելքումովի 40/1 սրահում: Գործարանային երաշխիք և ՀԾ սինք:`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <CatalogView initialCategorySlug={slug} />
    </div>
  );
}
