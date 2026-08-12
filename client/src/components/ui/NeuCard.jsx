import React from 'react';
import { motion } from 'framer-motion';

export function NeuCard({
  children,
  className = '',
  inset = false,
  hoverable = false,
  onClick,
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? { y: -2 } : {}}
      className={`rounded-neu max-w-full ${inset ? 'neu-inset p-4 sm:p-5' : 'neu-raised p-4 sm:p-6'} ${
        hoverable ? 'cursor-pointer transition-shadow hover:shadow-neu-hover' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
