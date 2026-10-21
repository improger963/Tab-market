'use client';

import React from 'react';
import { motion } from 'motion/react';

/**
 * Route Transition Shell (Quiet Luxury 60fps):
 * Fluid 200ms ease-out opacity/slide on every route mount.
 *
 * Scroll position is owned by the Next router and nothing else: it scrolls to
 * the top on forward navigation and restores the saved offset on Back/Forward.
 * The mount-time scrollTo(0,0) the Vite shell needed is deliberately gone —
 * this template remounts on popstate too, so keeping it would flatten every
 * Back/Forward restore to the document top.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex-1 flex flex-col"
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
    >
      {children}
    </motion.div>
  );
}
