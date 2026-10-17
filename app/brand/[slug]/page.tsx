/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { Metadata } from 'next';
import BrandPageClient from '@/components/brand/BrandPageClient';
import { brandBySlug } from '@/data/brands';
import { SHOWROOM_INFO } from '@/lib/config';
import { HY } from '@/lib/copy/hy';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandBySlug.get(slug);

  if (!brand) {
    return { title: 'Բրենդը չի գտնվել | tab.am' };
  }

  return {
    title: `${brand.name} ${HY.ASSORTMENT} | tab.am Երևան`,
    description: `${brand.name} \u2014 ${brand.count} ${HY.APRANQ}. ${HY.OUR_SHOWROOM}: ${SHOWROOM_INFO.address}.`,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  return <BrandPageClient slug={slug} />;
}
