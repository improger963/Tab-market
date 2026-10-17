/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/data/products';
import { Product } from '@/types';
import { PaginatedResponse } from '@/types/api';

export async function GET(req: NextRequest) {
  // Simulate 150ms network latency matching live Laravel API
  await new Promise((resolve) => setTimeout(resolve, 150));

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const finish = searchParams.get('finish');
  const search = searchParams.get('search');
  const inStockOnly = searchParams.get('inStockOnly') === 'true';
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : Infinity;
  const sortBy = searchParams.get('sortBy') || 'popular';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 12;

  let filtered: Product[] = [...products];

  // Category filter
  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.categorySlug === category);
  }

  // Brand filter
  if (brand && brand !== 'all') {
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  // Finish filter
  if (finish && finish !== 'all') {
    filtered = filtered.filter((p) => p.finish === finish);
  }

  // Showroom availability. The price list marks a line as available or not; it
  // never publishes unit counts, so no quantity may be filtered on or shown.
  if (inStockOnly) {
    filtered = filtered.filter((p) => p.inStock);
  }

  // Price range
  filtered = filtered.filter((p) => p.price >= minPrice && p.price <= maxPrice);

  // Search query (matches title or  code)
  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'newest') {
    filtered.sort((a, b) => b.id - a.id);
  } else {
    // Default ordering: the price list's own SKU order. It carries no rating or
    // popularity data, so nothing else could be honestly ranked here.
    filtered.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  const total = filtered.length;
  const lastPage = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  const response: PaginatedResponse<Product> = {
    success: true,
    data: paginatedData,
    pagination: {
      currentPage: page,
      lastPage,
      perPage: limit,
      total,
    },
  };

  return NextResponse.json(response);
}
