import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with clsx conditionals without class collisions.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount into Armenian Dram (֏ / AMD) with tabular digits,
 * thousand separators, and non-breaking space (\u00A0).
 * e.g., 3500 -> "3,500 ֏"
 */
export function formatAMD(price: number): string {
  if (isNaN(price)) return '0\u00A0֏';
  return `${new Intl.NumberFormat('en-US').format(Math.round(price))}\u00A0֏`;
}
