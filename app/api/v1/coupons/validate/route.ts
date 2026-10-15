/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';

export async function POST(req: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const { code } = await req.json();
    const coupon = (code || '').toUpperCase().trim();

    if (coupon === 'TAB10') {
      return NextResponse.json({
        success: true,
        data: {
          valid: true,
          discountPercent: 10,
          message: 'Կիրառվեց 10% զեղչ (TAB10)',
        },
      } as ApiResponse<{ valid: boolean; discountPercent: number; message: string }>);
    } else if (coupon === 'VARPET') {
      return NextResponse.json({
        success: true,
        data: {
          valid: true,
          discountPercent: 15,
          message: 'Կիրառվեց վարպետի 15% զեղչ (VARPET)',
        },
      } as ApiResponse<{ valid: boolean; discountPercent: number; message: string }>);
    } else if (coupon === 'FREE') {
      return NextResponse.json({
        success: true,
        data: {
          valid: true,
          discountPercent: 0,
          message: 'Անվճար առաքում ամբողջ Հայաստանում (FREE)',
        },
      } as ApiResponse<{ valid: boolean; discountPercent: number; message: string }>);
    } else {
      return NextResponse.json(
        { success: false, message: 'Անվավեր պրոմոկոդ' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Սխալ պրոմոկոդի ստուգման ընթացքում' },
      { status: 500 }
    );
  }
}
