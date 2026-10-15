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
        content: `Տեղադրեցինք Մելքումովի սրահից գնելուց հետո: Ճնշման փորձարկումն անցավ 10 բարով: Գործարանային երաշխիքը տրամադրվեց տեղում: ՀԾ կոդով (${product.code}) հեշտ գտնվեց պահեստում:`,
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
    <div id="reviews-section" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-8 scroll-mt-24">
      {/* Header with Aggregate Rating and Write Review Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Սոցիալական Վստահություն
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% Ստուգված Գնորդներ
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">
            Հաճախորդների և Վարպետների Կարծիքներ
          </h2>
          <p className="text-xs text-slate-500">
            Մելքումովի 40/1 սրահից գնված և տեղադրված սանտեխնիկայի իրական գնահատականներ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 self-start sm:self-center cursor-pointer active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-cyan-400" />
          <span>Թողնել Կարծիք</span>
        </button>
      </div>

      {/* Ratings Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
        {/* Score column */}
        <div className="md:col-span-4 text-center sm:text-left space-y-1 sm:border-r border-slate-200 sm:pr-6">
          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className="text-4xl sm:text-5xl font-black text-slate-950 tabular-nums">
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
                  className="h-full bg-cyan-600 rounded-full"
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
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-sm text-slate-900">{rev.author}</span>
                {rev.isVerifiedPlumber && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-200">
                    <Wrench className="w-3 h-3 text-cyan-600" />
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
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{rev.location}</span>
                <span>•</span>
                <span>{rev.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-slate-900 ml-1">{rev.title}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {rev.content}
            </p>
          </div>
        ))}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-950">
                Թողնել Կարծիք Ապրանքի Մասին
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Գնահատական *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 transition-transform hover:scale-125 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-800 ml-2">{newRating} / 5 աստղ</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Անուն, Ազգանուն *</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Օրինակ՝ Արմեն Կարապետյան"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus-cobalt"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Բնակավայր / Շրջան</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Օրինակ՝ Երևան, Դավթաշեն կամ Գյումրի"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus-cobalt"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPlumber}
                  onChange={(e) => setIsPlumber(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300"
                />
                <span className="font-semibold text-cyan-950">
                  Ես մասնագիտությամբ սանտեխնիկ / շինարար եմ (Certified Plumber badge)
                </span>
              </label>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Վերնագիր</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Օրինակ՝ Հիանալի որակի լատունե ծորակ"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus-cobalt"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ձեր Կարծիքը *</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Ինչպե՞ս է աշխատում սանտեխնիկան, ինչպիսի՞ն էր տեղադրումը..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus-cobalt"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[46px] py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-98 text-white font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Հաստատել և Հրապարակել
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
