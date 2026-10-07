import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 inline-flex items-center justify-center gap-2';
  const variants = {
    primary: 'bg-rose-700 hover:bg-rose-800 text-white shadow-md shadow-rose-950/10 focus:ring-rose-500 active:scale-[0.98]',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400 active:scale-[0.98]',
    teal: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/10 focus:ring-emerald-500 active:scale-[0.98]',
    danger: 'bg-red-650 hover:bg-red-700 text-white shadow-md focus:ring-red-500 active:scale-[0.98]',
    outline: 'border border-slate-200 hover:bg-slate-50 text-slate-650 focus:ring-slate-400 active:scale-[0.98]',
  };

  const buttonStyle = `${baseStyle} ${variants[variant] || variants.primary} ${className}`;

  return (
    <button onClick={onClick} className={buttonStyle} {...props}>
      {children}
    </button>
  );
};

export default Button;
