'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { useToast } from '@/store/useToast';
import { useCart } from '@/store/useCart';
import { formatAMD } from '@/lib/utils';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const { openDrawer } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div
      aria-live="polite"
      className="fixed z-50 pointer-events-none flex flex-col gap-2.5 max-w-sm w-full top-4 left-4 right-4 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto mx-auto sm:mx-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="pointer-events-auto w-full bg-[#0F172A]/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3"
          >
            {/* Left Content */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {toast.type === 'cart' && toast.product ? (
                <>
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img
                      src={toast.product.images[0]}
                      alt={toast.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
                      <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                      <span>{toast.title || 'Ավելացվել է զամբյուղ'}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate mt-0.5">
                      {toast.product.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {formatAMD(toast.product.price)}
                    </div>
                  </div>
                </>
              ) : toast.type === 'copy' ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-100">{toast.title || 'Պատճենված է'}</div>
                    <div className="text-[11px] text-blue-200 truncate">{toast.message}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {toast.title && (
                      <div className="text-xs font-bold text-slate-100">{toast.title}</div>
                    )}
                    <div className="text-xs text-slate-300">{toast.message}</div>
                  </div>
                </>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {toast.type === 'cart' && (
                <button
                  type="button"
                  onClick={() => {
                    openDrawer();
                    removeToast(toast.id);
                  }}
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Զամբյուղ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Փակել"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
