import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-premium border border-slate-100/70 p-6 transition-all duration-300 ${
        onClick 
          ? 'cursor-pointer hover:shadow-premium-hover hover:-translate-y-0.5 active:scale-[0.99]' 
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
