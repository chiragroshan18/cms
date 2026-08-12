import React from 'react';
import { motion } from 'framer-motion';

export function NeuButton({
  children,
  onClick,
  type = 'button',
  variant = 'default', // 'default' | 'primary' | 'danger' | 'success' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  disabled = false,
  className = '',
  icon: Icon,
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-neu focus:outline-none select-none max-w-full shrink-0';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  }[size];

  const variantStyles = {
    default: 'bg-neu-bg text-neu-text neu-raised hover:shadow-neu-hover active:neu-inset',
    primary: 'bg-neu-primary text-white shadow-neu-glow hover:bg-neu-primary-hover active:scale-[0.98]',
    danger: 'bg-neu-danger text-white hover:opacity-90 active:scale-[0.98]',
    success: 'bg-neu-success text-white hover:opacity-90 active:scale-[0.98]',
    ghost: 'bg-transparent text-neu-muted hover:text-neu-text hover:neu-raised-sm active:neu-inset-sm',
  }[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -1 } : {}}
      whileTap={!disabled ? { y: 1 } : {}}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
}
