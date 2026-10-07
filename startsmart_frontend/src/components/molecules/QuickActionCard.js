import React from 'react';

const QuickActionCard = ({ 
  icon: Icon, 
  iconBgColor = 'bg-[#FBEAEA]', 
  iconColor = 'text-[#C41E24]', 
  text, 
  onClick 
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#EAE3E4] rounded-[14px] p-[18px_10px] text-center flex flex-col items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer select-none group w-full hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)] hover:border-transparent hover:bg-gradient-to-br hover:from-[#1FB6A6] hover:to-[#0F8C7F]"
    >
      <div className={`w-[44px] h-[44px] rounded-[12px] ${iconBgColor} ${iconColor} flex items-center justify-center text-[20px] transition-all duration-150 group-hover:bg-white/22 group-hover:text-white shrink-0`}>
        {typeof Icon === 'string' ? Icon : <Icon className="w-5 h-5" />}
      </div>
      <span className="text-[11px] font-bold text-[#1B1418] tracking-wide mt-1 block transition-colors duration-150 group-hover:text-white">
        {text}
      </span>
    </div>
  );
};

export default QuickActionCard;
