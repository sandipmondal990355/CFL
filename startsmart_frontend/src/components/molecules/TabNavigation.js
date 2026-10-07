import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-6 border-b border-slate-200/50 pb-px overflow-x-auto select-none no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-3 px-1 font-bold text-slate-500 hover:text-slate-800 transition-all duration-200 border-b-[3px] shrink-0 text-sm ${
              isActive 
                ? 'text-rose-800' 
                : 'border-transparent'
            }`}
            style={isActive ? { borderBottomColor: '#be123c', color: '#be123c' } : {}}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
