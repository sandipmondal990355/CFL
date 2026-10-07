import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * DynamicCalendar Component
 * 
 * @param {string | Date} selectedDate - Currently selected date string (YYYY-MM-DD) or Date object
 * @param {function} onSelectDate - Handler function when a date cell is clicked (passes YYYY-MM-DD string)
 * @param {Array} meetings - Array of meeting objects. Each object should have a `date` string (YYYY-MM-DD) or `day`, `month`, `year`
 * @param {string} themeColor - Optional primary accent color (default: #78161A)
 */
const DynamicCalendar = ({
  selectedDate,
  onSelectDate,
  meetings = [],
  themeColor = '#78161A'
}) => {
  // Initialize visible month/year to selectedDate or current system date
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date();
  });

  // Sync visible month when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) {
        setCurrentMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [selectedDate]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed (0 = Jan)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

  // Navigate Previous Month
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  // Navigate Next Month
  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Jump to Today
  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    if (onSelectDate) {
      const formattedToday = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());
      onSelectDate(formattedToday, today);
    }
  };

  // Helper to format date as YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    const mm = m < 10 ? `0${m}` : m;
    const dd = d < 10 ? `0${d}` : d;
    return `${y}-${mm}-${dd}`;
  };

  // Calculate Days in current Month & starting day offset
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to check if a specific day is TODAY
  const isToday = (dayNum) => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  // Helper to check if a day matches the currently selectedDate prop
  const isSelected = (dayNum) => {
    if (!selectedDate) return false;
    const dateStr = formatDateString(year, month + 1, dayNum);
    
    if (typeof selectedDate === 'string') {
      return selectedDate === dateStr;
    } else if (selectedDate instanceof Date) {
      return (
        selectedDate.getDate() === dayNum &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year
      );
    }
    return false;
  };

  // Helper to get meetings on a specific day cell
  const getMeetingsForDay = (dayNum) => {
    const cellDateStr = formatDateString(year, month + 1, dayNum);
    const shortMonthStr = monthNames[month].substring(0, 3).toUpperCase();

    return meetings.filter((mtg) => {
      // 1. Direct date string match (YYYY-MM-DD)
      if (mtg.date && mtg.date === cellDateStr) return true;

      // 2. Day & Month properties match (e.g. day: 22, month: 'MAY')
      if (mtg.day && mtg.month) {
        const mtgMonthUpper = String(mtg.month).trim().toUpperCase();
        const mtgYear = mtg.year || year; // default to current displayed year if year not specified
        return (
          Number(mtg.day) === dayNum &&
          mtgMonthUpper === shortMonthStr &&
          Number(mtgYear) === year
        );
      }

      return false;
    });
  };

  // Helper to check if any meeting on a day cell is within 12 hours from now
  const hasMeetingWithin12Hours = (cellMeetings, dayNum) => {
    if (!cellMeetings || cellMeetings.length === 0) return false;
    const now = new Date();

    return cellMeetings.some((mtg) => {
      let mtgDate;
      if (mtg.date) {
        const [yy, mm, dd] = mtg.date.split('-').map(Number);
        let hrs = 15;
        let mins = 0;
        if (mtg.time) {
          const timeMatch = mtg.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (timeMatch) {
            hrs = parseInt(timeMatch[1], 10);
            mins = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3];
            if (ampm) {
              if (ampm.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
              if (ampm.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
            }
          }
        }
        mtgDate = new Date(yy, mm - 1, dd, hrs, mins);
      } else {
        mtgDate = new Date(year, month, dayNum, 15, 0);
      }

      const diffMs = mtgDate.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      return diffHrs >= -2 && diffHrs <= 12;
    });
  };

  // Build grid items (empty padding cells + day cells)
  const gridCells = [];
  
  // Padding cells before the 1st of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    gridCells.push({ type: 'empty', id: `empty-${i}` });
  }

  // Actual day cells
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dayMeetings = getMeetingsForDay(d);
    const meetingSoon = hasMeetingWithin12Hours(dayMeetings, d);
    gridCells.push({
      type: 'day',
      id: `day-${d}`,
      dayNum: d,
      today: isToday(d),
      selected: isSelected(d),
      meetings: dayMeetings,
      hasMeetings: dayMeetings.length > 0,
      hasMeetingsSoon: meetingSoon
    });
  }

  return (
    <div className="w-full">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-[#78161A] font-grotesk tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <button
            type="button"
            onClick={handleJumpToToday}
            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-[#78161A] border border-rose-100 hover:bg-rose-100 transition-colors"
            title="Jump to Current Month & Today"
          >
            Today
          </button>
        </div>

        {/* Prev / Next Month Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <FaChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <FaChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 mb-2 tracking-wider">
        {daysOfWeek.map((dayName) => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center text-xs gap-y-2 gap-x-1">
        {gridCells.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.id} className="h-9" />;
          }

          const { dayNum, today, selected, hasMeetings, hasMeetingsSoon, meetings: cellMeetings } = cell;
          const formattedCellDate = formatDateString(year, month + 1, dayNum);

          let cellClass = 'w-8 h-8 rounded-xl text-slate-600 font-medium hover:bg-slate-100 flex flex-col items-center justify-center transition-all cursor-pointer relative';
          
          if (hasMeetingsSoon) {
            cellClass = 'w-8 h-8 rounded-xl bg-amber-500 text-white font-bold ring-4 ring-amber-400/80 animate-pulse border-2 border-amber-600 flex flex-col items-center justify-center shadow-lg shadow-amber-500/30 cursor-pointer relative z-10';
          } else if (today) {
            cellClass = 'w-8 h-8 rounded-xl bg-[#78161A] text-white font-bold flex flex-col items-center justify-center shadow-sm cursor-pointer relative';
          } else if (selected) {
            cellClass = 'w-8 h-8 rounded-xl bg-[#78161A]/10 text-[#78161A] font-bold border-2 border-[#78161A] flex flex-col items-center justify-center cursor-pointer relative';
          } else if (hasMeetings) {
            cellClass = 'w-8 h-8 rounded-xl bg-rose-100/90 text-[#78161A] font-bold hover:bg-rose-200/80 flex flex-col items-center justify-center transition-colors cursor-pointer relative';
          }

          return (
            <div key={cell.id} className="flex items-center justify-center h-9">
              <button
                type="button"
                onClick={() => onSelectDate && onSelectDate(formattedCellDate, new Date(year, month, dayNum))}
                className={cellClass}
                title={
                  hasMeetingsSoon
                    ? `⚡ Meeting within 12 hours! (${cellMeetings.length} Meeting)`
                    : hasMeetings
                    ? `${dayNum} ${monthNames[month]} - ${cellMeetings.length} Meeting(s)`
                    : `${dayNum} ${monthNames[month]}`
                }
              >
                <span>{dayNum}</span>
                
                {/* Meeting Indicator Dot */}
                {hasMeetings && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                      hasMeetingsSoon
                        ? 'bg-white animate-ping'
                        : today
                        ? 'bg-amber-300'
                        : 'bg-[#78161A]'
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-5 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#78161A]" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-300 animate-pulse" />
          <span className="font-bold text-amber-700">Meeting within 12h</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-200" />
          <span>Upcoming Meeting</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#78161A] bg-rose-50" />
          <span>Selected Date</span>
        </div>
      </div>
    </div>
  );
};

export default DynamicCalendar;
