import React from 'react';

const MetricCard = ({ 
  title, 
  value, 
  badgeText, 
  badgeVariant = 'green' 
}) => {
  // Determine badge colors based on mockup
  // If green: bg-[#E6F6EE] text-[#1E8E5A]
  // If orange/red: bg-[#FDEEE8] text-[#C4531E]
  // If purple: bg-[#f0eefc] text-[#6366f1]
  let badgeClasses = 'bg-[#E6F6EE] text-[#1E8E5A]';
  if (badgeVariant === 'orange' || badgeVariant === 'warn' || badgeVariant === 'red') {
    badgeClasses = 'bg-[#FDEEE8] text-[#C4531E]';
  } else if (badgeVariant === 'purple') {
    badgeClasses = 'bg-[#f0eefc] text-[#6366f1]';
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#EAE3E4] py-3.5 px-5 flex flex-col justify-between w-full transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5">
      <div>
        {/* Large Value number */}
        <div className="text-[34px] font-bold text-[#1B1418] tracking-tight leading-none font-grotesk">
          {value}
        </div>
        {/* Title underneath the value */}
        <div className="text-[12px] font-semibold text-slate-500 mt-2 font-inter">
          {title}
        </div>
      </div>
      {badgeText && (
        <div className="mt-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[5px] inline-flex items-center gap-1 ${badgeClasses}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
