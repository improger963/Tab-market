/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryStories from '@/components/home/CategoryStories';
import TabbedProductShowcase from '@/components/home/TabbedProductShowcase';
import BespokeConfiguratorWidget from '@/components/home/BespokeConfiguratorWidget';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import ShowroomTrustSection from '@/components/home/ShowroomTrustSection';
import PlumberFaqSection from '@/components/home/PlumberFaqSection';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-16 sm:space-y-20">
      {/* Step 2: High-Converting Advertising Hero Slider */}
      <HeroBanner />

      {/* Step 3: "Instagram Stories" Category Bubble Bar */}
      <CategoryStories />

      {/* Step 4: Tabbed Product Showcase */}
      <TabbedProductShowcase />

      {/* Interactive Bespoke Bathroom Configurator */}
      <BespokeConfiguratorWidget />

      {/* Step 5: Interactive Brands Marquee / Carousel */}
      <BrandsCarousel />

      {/* Showroom Trust & Location Section */}
      <ShowroomTrustSection />

      {/* Plumber FAQ Section */}
      <PlumberFaqSection />
    </div>
  );
}
