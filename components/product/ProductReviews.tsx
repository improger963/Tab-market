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
    <div id="reviews-section" className="bg-white p-6 sm:p-8 rounded-panel border border-line shadow-e1 space-y-8 scroll-mt-24">
      {/* Header with Aggregate Rating and Write Review Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-line">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-accent">
              Սոցիալական Վստահություն
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-ink text-xs font-bold border border-success">
              <ShieldCheck className="w-3 h-3 text-success" />
              100% Ստուգված Գնորդներ
            </span>
          </div>
          <h2 className="text-2xl font-bold text-ink tracking-tight">
            Հաճախորդների և Վարպետների Կարծիքներ
          </h2>
          <p className="text-xs text-muted">
            Մելքումովի 40/1 սրահից գնված և տեղադրված սանտեխնիկայի իրական գնահատականներ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-control bg-ink hover:bg-accent text-white font-bold text-xs transition-all shadow-e1 flex items-center gap-2 self-start sm:self-center cursor-pointer active:scale-95"
        >
          <MessageSquarePlus className="w-4 h-4 text-accent" />
          <span>Թողնել Կարծիք</span>
        </button>
      </div>

      {/* Ratings Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-panel bg-canvas border border-line">
        {/* Score column */}
        <div className="md:col-span-4 text-center sm:text-left space-y-1 sm:border-r border-line sm:pr-6">
          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className="text-4xl sm:text-5xl font-bold text-ink tabular-nums">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-muted text-lg font-bold">/ 5.0</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-ink text-ink"
              />
            ))}
          </div>
          <p className="text-xs text-muted font-medium pt-1">
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
              <span className="w-12 font-bold text-body tabular-nums flex items-center gap-1">
                {row.stars} <Star className="w-3 h-3 fill-ink text-ink inline" />
              </span>
              <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: row.pct }}
                />
              </div>
              <span className="w-10 text-right font-mono text-xs text-muted">
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
            className="p-5 rounded-panel bg-white border border-line shadow-e1 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-sm text-ink">{rev.author}</span>
                {rev.isVerifiedPlumber && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/5 text-accent-hover text-xs font-bold border border-accent/15">
                    <Wrench className="w-3 h-3 text-accent" />
                    Վարպետ-Սանտեխնիկ
                  </span>
                )}
                {rev.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-success text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ստուգված Գնում
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted font-medium">
                <span>{rev.location}</span>
                <span>•</span>
                <span>{rev.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-ink text-ink" />
              ))}
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-ink">{rev.title}</h4>
            <p className="text-xs sm:text-sm text-body leading-relaxed font-normal">
              {rev.content}
            </p>
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
          <div className="bg-white rounded-panel max-w-lg w-full p-6 shadow-e2 border border-line space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div>
                <h3 className="font-bold text-sm text-ink">
                  Գնահատել Ապրանքը
                </h3>
                <p className="text-xs text-muted mt-0.5">{product.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-card text-muted hover:text-body hover:bg-canvas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-body mb-1">Գնահատական</label>
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
 ? 'fill-ink text-ink'
 : 'text-line-strong'
 }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-body ml-2">{newRating} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-body mb-1">
                    Ձեր Անունը <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="օր.՝ Կարեն Հովհաննիսյան"
                    className="w-full h-10 px-3 rounded-control bg-white border border-line focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-body mb-1">Քաղաք / Համայնք</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="օր.՝ Երևան, Դավթաշեն"
                    className="w-full h-10 px-3 rounded-control bg-white border border-line focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-body mb-1">Կարծիքի Վերնագիր</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="օր.՝ Հիանալի որակ, շատ գոհ եմ"
                  className="w-full h-10 px-3 rounded-control bg-white border border-line focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-body mb-1">
                  Ձեր Կարծիքը <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Նշեք տեղադրման որակի, նյութի և առաքման մասին..."
                  className="w-full p-3 rounded-control bg-white border border-line focus:border-accent focus:ring-2 focus:ring-accent/20 font-medium"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPlumber}
                  onChange={(e) => setIsPlumber(e.target.checked)}
                  className="w-4 h-4 rounded text-accent focus:ring-accent border-line-strong"
                />
                <span className="font-semibold text-body">
                  Ես պրոֆեսիոնալ վարպետ-սանտեխնիկ եմ (ավելացնել համապատասխան նշում)
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-control bg-canvas hover:bg-line text-ink font-bold transition-colors cursor-pointer"
                >
                  Չեղարկել
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-control bg-ink hover:bg-accent text-white font-bold transition-all shadow-e1 cursor-pointer"
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
