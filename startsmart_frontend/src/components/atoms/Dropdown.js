import React from 'react';

const Dropdown = ({ value, onChange, options = [], className = '' }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`px-4 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all cursor-pointer ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
