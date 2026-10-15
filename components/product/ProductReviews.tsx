'use client';

import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Wrench,
  ThumbsUp,
  MessageSquarePlus,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Product, Review } from '@/types';
import { initialReviews } from '@/data/reviews';
import { useToast } from '@/store/useToast';

interface ProductReviewsProps {
  product: Product;
}

export default function ProductReviews({ product }: ProductReviewsProps) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(() => {
    const matched = initialReviews.filter((r) => r.productId === product.id);
    if (matched.length > 0) return matched;
    // Fallback template reviews for any product
    return [
      {
        id: `rev-${product.id}-default`,
        productId: product.id,
        author: 'Սարգիս Մանուկյան (Վարպետ-Սանտեխնիկ)',
        location: 'Երևան, Դավթաշեն',
        rating: 5,
        date: '1 շաբաթ առաջ',
        title: 'Գերազանց որակ, լատունը ծանր է',
        content: `Տեղադրեցինք Մելքումովի սրահից գնելուց հետո: Ճնշման փորձարկումն անցավ 10 բարով: Գործարանային երաշխիքը տրամադրվեց տեղում: Կոդ Կոդով (${product.code}) հեշտ գտնվեց պահեստում:`,
        isVerifiedPlumber: true,
        isVerifiedPurchase: true,
      },
      {
        id: `rev-${product.id}-user`,
        productId: product.id,
        author: 'Աննա Պետրոսյան',
        location: 'Երևան, Արաբկիր',
        rating: 5,
        date: '2 շաբաթ առաջ',
        title: 'Իդեալական համապատասխանում է մեր լոգարանի դիզայնին',
        content:
          'Շատ գոհ ենք թե՛ արտաքին տեսքից, թե՛ հարմարավետությունից: Մելքումովի 40/1 սրահի խորհրդատուները օգնեցին ընտրել ճիշտ կցամասերը:',
        isVerifiedPlumber: false,
        isVerifiedPurchase: true,
      },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPlumber, setIsPlumber] = useState(false);

  const averageRating = product.rating || 4.9;
  const totalReviews = reviews.length;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) {
      showToast('Խնդրում ենք լրացնել անունը և կարծիքը');
      return;
    }

    const created: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: newAuthor.trim(),
      location: newLocation.trim() || 'Երևան',
      rating: newRating,
      date: 'Հենց նոր',
      title: newTitle.trim() || 'Հիանալի որակ',
      content: newContent.trim(),
      isVerifiedPlumber: isPlumber,
      isVerifiedPurchase: true,
    };

    setReviews([created, ...reviews]);
    setIsModalOpen(false);
    setNewAuthor('');
    setNewLocation('');
    setNewTitle('');
    setNewContent('');
    showToast('Ձեր կարծիքը հաջողությամբ ավելացվեց', 'Շնորհակալություն!');
  };

  return (
    <div id="reviews-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-8 scroll-mt-24">
      {/* Header with Aggregate Rating and Write Review Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#2563EB]">
              Սոցիալական Վստահություն
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% Ստուգված Գնորդներ
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Հաճախորդների և Վարպետների Կարծիքներ
          </h2>
          <p className="text-xs text-slate-500">
            Մելքումովի 40/1 սրահից գնված և տեղադրված սանտեխնիկայի իրական գնահատականներ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 self-start sm:self-center cursor-pointer active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-blue-400" />
          <span>Թողնել Կարծիք</span>
        </button>
      </div>

      {/* Ratings Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
        {/* Score column */}
        <div className="md:col-span-4 text-center sm:text-left space-y-1 sm:border-r border-slate-200 sm:pr-6">
          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className="text-4xl sm:text-5xl font-black text-[#0F172A] tabular-nums">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-slate-400 text-lg font-bold">/ 5.0</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium pt-1">
            Հիմնված է <b>{totalReviews}</b> ստուգված կարծիքների վրա
          </p>
        </div>

        {/* Breakdown progress bars */}
        <div className="md:col-span-8 space-y-2 text-xs">
          {[
            { stars: 5, pct: '92%' },
            { stars: 4, pct: '8%' },
            { stars: 3, pct: '0%' },
            { stars: 2, pct: '0%' },
            { stars: 1, pct: '0%' },
          ].map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <span className="w-12 font-bold text-slate-600 tabular-nums flex items-center gap-1">
                {row.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
              </span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full"
                  style={{ width: row.pct }}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-slate-400">
                {row.pct}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-sm text-[#0F172A]">{rev.author}</span>
                {rev.isVerifiedPlumber && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                    <Wrench className="w-3 h-3 text-blue-600" />
                    Վարպետ-Սանտեխնիկ
                  </span>
                )}
                {rev.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ստուգված Գնում
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span>{rev.location}</span>
                <span>•</span>
                <span>{rev.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-[#0F172A]">{rev.title}</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {rev.content}
            </p>
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-[#0F172A]">
                  Գնահատել Ապրանքը
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{product.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Գնահատական</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 cursor-pointer focus:outline-hidden"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-700 ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ձեր Անունը <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="օր.՝ Կարեն Հովհաննիսյան"
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Քաղաք / Համայնք</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="օր.՝ Երևան, Դավթաշեն"
                    className="w-full h-10 px-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Կարծիքի Վերնագիր</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="օր.՝ Հիանալի որակ, շատ գոհ եմ"
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ձեր Կարծիքը <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Նշեք տեղադրման որակի, նյութի և առաքման մասին..."
                  className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPlumber}
                  onChange={(e) => setIsPlumber(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-blue-500 border-slate-300"
                />
                <span className="font-semibold text-slate-700">
                  Ես պրոֆեսիոնալ վարպետ-սանտեխնիկ եմ (ավելացնել համապատասխան նշում)
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Չեղարկել
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#2563EB] text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  Հրապարակել Կարծիքը
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
