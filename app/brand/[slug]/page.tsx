/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { Metadata } from 'next';
import BrandPageClient from '@/components/brand/BrandPageClient';
import { BRANDS } from '@/components/home/BrandsCarousel';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);

  if (!brand) {
    return { title: 'Բրենդը չի գտնվել | tab.am' };
  }

  return {
    title: `${brand.name} Պաշտոնական Տեսականի | tab.am Երևան`,
    description: `Գնե՛ք ${brand.name} (${brand.country}) բրենդի պրեմիում սանտեխնիկան և ծորակները անմիջապես Մելքումովի 40/1 սրահից: 5 տարվա երաշխիք:`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  return <BrandPageClient slug={slug} />;
}
