import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/data/categories';

export default function CategoryGrid() {
  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-700">
            Տեսականի
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-0.5">
            Հիմնական Բաժիններ
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md">
          Մասնագիտական սանտեխնիկայի, խողովակաշարերի և ջեռուցման ամբողջ տեսականին մեկ վայրում:
        </p>
      </div>

      {/* Grid of 5 Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group relative h-72 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-5 cursor-pointer"
          >
            {/* Background Image with Zoom */}
            <img
              src={category.image}
              alt={category.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              loading="lazy"
            />

            {/* Dark Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

            {/* Content Area */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-wide">
                  {category.itemCount} տեսականի
                </span>
                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-cyan-500 text-white group-hover:text-slate-950 flex items-center justify-center transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <h3 className="text-lg font-black text-white leading-tight group-hover:text-cyan-300 transition-colors">
                {category.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
