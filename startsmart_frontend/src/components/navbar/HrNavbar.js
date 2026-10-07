import React from 'react';
import {
  FaHome,
  FaFolder,
  FaGraduationCap,
  FaGlobe,
  FaChartBar,
  FaComments,
  FaCalendarAlt,
  FaCamera,
  FaFileAlt,
  FaCog,
  FaStar
} from 'react-icons/fa';

const HrNavbar = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FaHome, iconColor: '#FFA726' },
    { id: 'global-dashboard', label: 'Global Dashboard', icon: FaGlobe, iconColor: '#42A5F5' },
    { id: 'cfl-management', label: 'My CFLs', icon: FaFolder, iconColor: '#26A69A' },
    { id: 'probation', label: 'Probation', icon: FaGraduationCap, iconColor: '#AB47BC' },
    { id: 'performance', label: 'Performance', icon: FaChartBar, iconColor: '#26C6DA' },
    { id: 'feedback', label: 'Feedback', icon: FaComments, iconColor: '#29B6F6' },
    { id: 'meetings', label: 'Meetings', icon: FaCalendarAlt, iconColor: '#AB47BC' },
    { id: 'memories', label: 'Memories', icon: FaCamera, iconColor: '#EC407A' },
    { id: 'reports', label: 'Reports', icon: FaFileAlt, iconColor: '#5C6BC0' },
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
          HR Admin Portal
        </span>
      </div>
    </aside>
  );
};

export default HrNavbar;
