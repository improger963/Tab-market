/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from 'next/server';
import { categoriesWithCounts } from '@/server/catalog';
import { ApiResponse } from '@/types/api';
import { Category } from '@/types';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const response: ApiResponse<Category[]> = {
    success: true,
    data: categoriesWithCounts(),
  };

  return NextResponse.json(response);
}
