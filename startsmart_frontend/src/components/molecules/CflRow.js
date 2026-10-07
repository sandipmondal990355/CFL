import React from 'react';
import Badge from '../atoms/Badge';

const CflRow = ({ employeeId, name, email, department, mentor }) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  const isEven = parseInt(employeeId) % 2 === 0;
  const status = isEven ? 'Active' : 'Probation';
  const statusVariant = isEven ? 'green' : 'orange';

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center bg-white border border-slate-100/80 p-6 rounded-2xl transition-all duration-300 gap-6 w-full shadow-sm hover:shadow-md">
      
      {/* Avatar & Employee Basic Info */}
      <div className="flex items-center gap-4 min-w-[245px] shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-rose-700 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0" style={{ backgroundColor: '#991b1b' }}>
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-800 text-base leading-snug">{name}</h4>
            <div className={`w-2 h-2 rounded-full ${isEven ? 'bg-emerald-500' : 'bg-amber-500'} shrink-0`} />
          </div>
          <span className="text-[10px] text-slate-400 font-bold block mt-1.5 tracking-wider uppercase leading-none">Employee ID</span>
          <span className="text-sm font-semibold text-slate-500 mt-1.5 block">{employeeId}</span>
        </div>
      </div>

      {/* Email column */}
      <div className="min-w-[240px] flex-grow text-left">
        <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase leading-none">Email</span>
        <span className="text-sm font-semibold text-slate-650 mt-2 block hover:text-rose-700 transition-colors cursor-pointer">{email}</span>
      </div>

      {/* Department column */}
      <div className="min-w-[140px] flex-grow text-left">
        <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase leading-none">Department</span>
        <span className="text-sm font-semibold text-slate-650 mt-2 block">{department}</span>
      </div>

      {/* Mentor column */}
      <div className="min-w-[160px] flex-grow text-left">
        <span className="text-[10px] text-slate-400 font-bold block tracking-wider uppercase leading-none">Mentor</span>
        <span className="text-sm font-semibold text-slate-800 mt-2 block">{mentor}</span>
      </div>

      {/* Badge or Hover Actions */}
      <div className="shrink-0 flex items-center justify-end min-w-[150px] ml-auto font-semibold">
        <Badge variant={statusVariant} className="font-bold shadow-sm">
          {status}
        </Badge>
      </div>

    </div>
  );
};

export default CflRow;
