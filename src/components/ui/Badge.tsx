import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'discount' | 'stock' | 'outOfStock' | 'cod' | 'featured' | 'bestseller' | 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
}) => {
  const base = 'inline-flex items-center font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 text-[10px] select-none';

  const styles = {
    discount: 'bg-rose-500 text-white shadow-xs',
    stock: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    outOfStock: 'bg-rose-100 text-rose-800 border border-rose-200',
    cod: 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold',
    featured: 'bg-brand-500 text-dark-950 font-extrabold',
    bestseller: 'bg-dark-900 text-white',
    pending: 'bg-amber-100 text-amber-800 border border-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 border border-blue-200',
    delivered: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border border-rose-200',
    neutral: 'bg-dark-100 text-dark-700 border border-dark-200',
  };

  return (
    <span className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
