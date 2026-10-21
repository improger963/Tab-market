import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogView from '@/components/catalog/CatalogView';
import { categoriesWithCounts, findCategoryBySlug } from '@/server/catalog';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Կատալոգ | tab.am',
    };
  }

  return {
    title: `${category.title} | tab.am Սանտեխնիկայի Խանութ-Սրահ Երևանում`,
    description: `tab.am - ${category.title}: Պահեստում առկա է ${category.itemCount} տեսականի Մելքումովի 40/1 սրահում: Գործարանային երաշխիք և սինք:`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = findCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container-lux py-8">
      <CatalogView initialCategorySlug={slug} categories={categoriesWithCounts()} />
    </div>
  );
}
