/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: number;
  code: string; // ArmSoft ERP SKU (e.g. "31297") - used by contractors & showroom staff
  title: string; // Full Armenian product title
  slug: string; // SEO friendly URL slug
  categorySlug: string;
  categoryName: string;
  brand: string; // e.g. GANZER, LEDEME, VIEIR, BRAVAT, VALTEC, BAXI, CERSANIT, GEBERIT
  price: number; // In Armenian Dram (AMD / ֏)
  oldPrice?: number; // Pre-discount price in AMD
  inStock: boolean;
  stockQuantity: number; // Inventory available at Melkumovi 40/1 showroom, Yerevan
  images: string[];
  blueprintImage?: string; // Technical dimensional CAD drawing / scheme
  shortDesc: string;
  specs: Record<string, string>; // e.g. Նյութ (Material), Միացում (Diameter), Քարթրիջ (Cartridge), Երաշխիք (Warranty)
  isFeatured?: boolean;
  rating?: number; // Customer star rating (e.g. 4.9)
  reviewsCount?: number; // Count of verified customer reviews
  finish?: 'chrome' | 'gold' | 'black' | 'gunmetal' | 'white' | 'mirror';
  isNew?: boolean;
}

export interface Review {
  id: string;
  productId: number;
  author: string;
  location: string; // e.g. "Երևան, Դավթաշեն", "Երևան, Արաբկիր"
  rating: number; // 1-5
  date: string;
  title: string;
  content: string;
  isVerifiedPlumber?: boolean; // Վարպետ / Սանտեխնիկ
  isVerifiedPurchase?: boolean; // Ստուգված Գնում Մելքումովի 40/1-ում
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  image: string;
  itemCount: number;
  icon: string; // Icon identifier or name
}

export interface CartItem {
  product: Product;
  quantity: number;
}
