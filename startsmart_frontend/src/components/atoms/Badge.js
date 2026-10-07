import React from 'react';

const Badge = ({ children, variant = 'green', className = '' }) => {
  const baseStyle = 'px-2.5 py-0.5 text-xs font-semibold rounded-full tracking-wide inline-flex items-center';
  const variants = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
    purple: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
    teal: 'bg-teal-650 text-white shadow-sm',
    gray: 'bg-slate-100 text-slate-600 border border-slate-200'
  };

  const badgeStyle = `${baseStyle} ${variants[variant] || variants.gray} ${className}`;

  return (
    <span className={badgeStyle}>
      {children}
    </span>
  );
};

export default Badge;
