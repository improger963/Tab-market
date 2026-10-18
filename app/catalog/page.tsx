import React from 'react';
import type { Metadata } from 'next';
import CatalogView from '@/components/catalog/CatalogView';
import { categoriesWithCounts } from '@/server/catalog';

export const metadata: Metadata = {
  title: 'Սանտեխնիկայի Կատալոգ | tab.am Երևան, Մելքումովի 40/1',
  description:
    'tab.am - Ջրամատակարարման, ջեռուցման և սանտեխնիկայի ամբողջ տեսականին Երևանում: կոդերով ճշգրիտ որոնում և առկայություն:',
};

export default function CatalogPage() {
  return (
    <div className="container-lux py-8">
      <CatalogView categories={categoriesWithCounts()} />
    </div>
  );
}
