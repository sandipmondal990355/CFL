import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaDownload } from 'react-icons/fa';
import { cflAssignmentService } from '../../services/cflAssignmentService';

const MENTOR_EMP_CODE = 3002; // Hardcoded mentor empCode as requested

const AssignedCfls = ({ onViewMentee }) => {
  const [mentees, setMentees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchYear, setBatchYear] = useState('2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedCfls();
  }, [batchYear]);

  const fetchAssignedCfls = async () => {
    setLoading(true);
    try {
      const data = await cflAssignmentService.getByMentor(MENTOR_EMP_CODE, { year: batchYear });
      if (data && data.content) {
        // Map backend CFL assignment data
        const mapped = data.content.map((item) => ({
          cflEmpCode: item.cflEmpCode,
          cflName: item.cflName || `CFL ${item.cflEmpCode}`,
          role: item.role || item.department || 'CFL Employee',
          sessionsCompleted: item.sessionsCompleted !== undefined ? item.sessionsCompleted : 0,
          sessionsPlanned: item.sessionsPlanned !== undefined ? item.sessionsPlanned : 0
        }));
        setMentees(mapped);
      } else {
        setMentees([]);
      }
    } catch (err) {
      console.error('Error fetching assigned CFLs from backend:', err);
      setMentees([]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CFL';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredMentees = mentees.filter(m =>
    m.cflName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in duration-300">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight font-grotesk">
            Assigned CFLs
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            View the CFLs assigned to you for mentoring.
          </p>
        </div>

        {/* Right Controls (Year dropdown & Export button) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">YEAR</span>
            <div className="relative">
              <select
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:border-[#78161A] cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <button
            onClick={() => alert('Exporting Assigned CFLs report...')}
            className="bg-[#78161A] hover:bg-[#631013] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-grotesk"
          >
            <FaDownload className="w-3 h-3" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main White Card Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Search Bar */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
            <FaSearch className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by mentee name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#78161A] shadow-2xs transition-all"
          />
        </div>

        {/* Mentees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">MENTEE</th>
                <th className="pb-3">DESIGNATION</th>
                <th className="pb-3 text-center">SESSIONS COMPLETED</th>
                <th className="pb-3 text-center">SESSIONS PLANNED</th>
                <th className="pb-3 pr-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    Loading assigned CFLs...
                  </td>
                </tr>
              ) : filteredMentees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    {searchTerm ? `No assigned mentees found matching "${searchTerm}".` : 'No assigned mentees found.'}
                  </td>
                </tr>
              ) : (
                filteredMentees.map((mentee) => (
                  <tr key={mentee.cflEmpCode} className="hover:bg-slate-50/50 transition-colors">
                    {/* Mentee Name with Avatar */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EA580C]/20 text-[#EA580C] font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {getInitials(mentee.cflName)}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">
                          {mentee.cflName}
                        </span>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-4 text-slate-600 font-semibold text-xs">
                      {mentee.role}
                    </td>

                    {/* Sessions Completed */}
                    <td className="py-4 text-center">
                      <span className="inline-block bg-emerald-50 text-emerald-600 font-bold text-xs py-1 px-3 rounded-full">
                        {mentee.sessionsCompleted} Completed
                      </span>
                    </td>

                    {/* Sessions Planned */}
                    <td className="py-4 text-center">
                      <span className="inline-block bg-amber-50 text-amber-600 font-bold text-xs py-1 px-3 rounded-full">
                        {mentee.sessionsPlanned} Planned
                      </span>
                    </td>

                    {/* Action button */}
                    <td className="py-4 pr-2 text-right">
                      <button
                        onClick={() => onViewMentee && onViewMentee(mentee.cflEmpCode)}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer ml-auto"
                        title="View Mentee"
                      >
                        <FaEye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignedCfls;
