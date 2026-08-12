import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function NeuModal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neu-dark/40 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-neu-bg rounded-neu-lg neu-raised p-6 z-10 text-neu-text`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neu-muted/20 mb-4">
              {title && <h3 className="text-lg font-bold">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-neu-muted hover:text-neu-text neu-raised-sm active:neu-inset-sm transition-all ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
