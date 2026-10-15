/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products';
import { ApiResponse } from '@/types/api';
import { Product } from '@/types';

export async function GET(req: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!q) {
    const res: ApiResponse<Product[]> = { success: true, data: [] };
    return NextResponse.json(res);
  }

  const matched = products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q)
    )
    .slice(0, 6);

  const response: ApiResponse<Product[]> = {
    success: true,
    data: matched,
  };

  return NextResponse.json(response);
}
