import React from 'react';
import type { Metadata } from 'next';
import CatalogView from '@/components/catalog/CatalogView';

export const metadata: Metadata = {
  title: 'Սանտեխնիկայի Կատալոգ | tab.am Երևան, Մելքումովի 40/1',
  description:
    'tab.am - Ջրամատակարարման, ջեռուցման և սանտեխնիկայի ամբողջ տեսականին Երևանում: ՀԾ (ArmSoft) կոդերով ճշգրիտ որոնում և առկայություն:',
};

export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <CatalogView />
    </div>
  );
}
