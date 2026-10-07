import React from 'react';
import {
  FaHome,
  FaTasks,
  FaUser,
  FaCog,
  FaStar
} from 'react-icons/fa';

const UserNavbar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: FaHome, iconColor: '#FFA726' },
    { id: 'tasks', label: 'My Tasks', icon: FaTasks, iconColor: '#26A69A' },
    { id: 'profile', label: 'My Profile', icon: FaUser, iconColor: '#66BB6A' },
    { id: 'settings', label: 'Settings', icon: FaCog, iconColor: '#78909C' },
  ];

  return (
    <aside className="w-[260px] min-h-screen bg-[#78161A] text-white flex flex-col flex-shrink-0 select-none font-inter">
      {/* Sidebar Header logo */}
      <div className="p-6 flex items-center gap-[10px]">
        <div className="text-[20px] text-[#F3C63F] flex items-center justify-center">
          <FaStar />
        </div>
        <div className="text-[20px] font-bold tracking-tight">
          <span className="text-white">Start</span>{' '}
          <span className="text-[#F1935C]">Smart</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-[8px] mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-[18px] py-[11px] rounded-[10px] text-[13.5px] font-semibold transition-all duration-150 outline-none text-left ${
                isActive
                  ? 'bg-white text-[#78161A] shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span 
                className="text-[15px] flex items-center justify-center" 
                style={{ color: item.iconColor }}
              >
                <Icon />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role Indicator Footer */}
      <div className="p-4 border-t border-white/10 text-center">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#F1935C] bg-[#530E11] px-3 py-1 rounded-full border border-white/5">
          User Dashboard Portal
        </span>
      </div>
    </aside>
  );
};

export default UserNavbar;
