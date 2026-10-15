'use client';

import React, { useEffect } from 'react';
import { motion } from 'motion/react';

/**
 * Route Transition Shell (Quiet Luxury 60fps):
 * Fluid 200ms ease-out opacity/slide on every route mount, plus a scroll
 * reset to eliminate white flashes and violent scroll snaps between pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Snap back to top smoothly on mount so incoming routes never inherit stale offsets.
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

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
