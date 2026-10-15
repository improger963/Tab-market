/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products';
import { ApiResponse } from '@/types/api';
import { Product } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const resolvedParams = await params;
  const slugOrCode = resolvedParams.slug;

  const product = products.find(
    (p) => p.slug === slugOrCode || p.code === slugOrCode
  );

  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Ապրանքը չի գտնվել' },
      { status: 404 }
    );
  }

  const response: ApiResponse<Product> = {
    success: true,
    data: product,
  };

  return NextResponse.json(response);
}
