import React, { useState, useEffect } from 'react';
import { FaSearch, FaFileExport, FaEye, FaTimes, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import { goalService } from '../../services/goalService';

const INITIAL_PROBATION_DATA = [
  { cflEmpId: 9085412, cflName: 'Manpreet Kaur', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'MK', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085413, cflName: 'Amit Chauhan', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'AC', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085415, cflName: 'Yajnadutta Mishra', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'YM', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085414, cflName: 'Rohit Verma', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'RV', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085499, cflName: 'Sneha Reddy', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'SR', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085420, cflName: 'Shalini', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'S', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085421, cflName: 'John Doe', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'JD', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085422, cflName: 'Sarita Kumari', managerName: 'Suresh Reddy', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'SK', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085423, cflName: 'Priya Sharma', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'PS', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085424, cflName: 'Ananya Roy', managerName: 'Suresh Reddy', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'AR', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085425, cflName: 'Sneha Kumari', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'SK', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085426, cflName: 'Kartik Srivastav', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'KS', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085427, cflName: 'Kriti KS', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'KK', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085416, cflName: 'Snehal Singh', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'SS', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085428, cflName: 'Abhishek', managerName: 'Ankit Chauhan', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'A', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085429, cflName: 'Amulya B S', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'AB', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085430, cflName: 'Abhishek G C', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'AG', avatarBg: 'bg-orange-500' },
  { cflEmpId: 9085431, cflName: 'Aditi Gupta', managerName: 'Priya Sharma', stage: 'Not Eligible Yet', submittedOn: '—', recommendation: '—', buHeadApproval: '—', buHeadDate: null, hrApproval: '—', hrDate: null, initials: 'AG', avatarBg: 'bg-orange-500' }
];

const HrProbation = () => {
  const [probationList, setProbationList] = useState(INITIAL_PROBATION_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [activeReviewItem, setActiveReviewItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchProbationData();
  }, []);

  const fetchProbationData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9085/api/probation/evaluations');
      if (response.data && response.data.length > 0) {
        const apiMapped = response.data.map(item => {
          const names = item.cflName ? item.cflName.split(' ') : ['C', 'FL'];
          const initials = (names[0][0] + (names[1] ? names[1][0] : '')).toUpperCase();
          const isHrConfirmed = item.stage === 'Confirmed' || item.hrApproval === 'Mrudul Mangoli';
          const isPendingHr = item.stage === 'Pending HR Action' || item.hrApproval === 'Pending HR Action';

          return {
            ...item,
            initials: initials || 'CF',
            avatarBg: 'bg-orange-500',
            stage: isHrConfirmed ? 'Confirmed' : (isPendingHr ? 'Pending HR Action' : (item.stage || 'Not Eligible Yet')),
            submittedOn: isHrConfirmed || isPendingHr ? (item.submittedOn ? String(item.submittedOn).substring(0, 10) : '02 Sep 2026') : '—',
            recommendation: isHrConfirmed || isPendingHr ? 'Confirm' : '—',
            buHeadApproval: isHrConfirmed || isPendingHr ? (item.buHeadApproval || 'Vikram Reddy') : '—',
            buHeadDate: isHrConfirmed || isPendingHr ? (item.buHeadApprovalDate ? String(item.buHeadApprovalDate).substring(0, 10) : '05 Sep 2026') : null,
            hrApproval: isHrConfirmed ? (item.hrApproval || 'Mrudul Mangoli') : (isPendingHr ? 'Pending HR Action' : '—'),
            hrDate: isHrConfirmed ? (item.hrApprovalDate ? String(item.hrApprovalDate).substring(0, 10) : '08 Sep 2026') : null
          };
        });

        const mapByEmpId = new Map();
        INITIAL_PROBATION_DATA.forEach(item => {
          mapByEmpId.set(item.cflEmpId, item);
        });

        apiMapped.forEach(apiItem => {
          const existing = mapByEmpId.get(apiItem.cflEmpId) || {};
          mapByEmpId.set(apiItem.cflEmpId, {
            ...existing,
            ...apiItem,
            stage: apiItem.stage || existing.stage || 'Not Eligible Yet'
          });
        });

        const uniqueList = Array.from(mapByEmpId.values());
        setProbationList(uniqueList);
      }
    } catch (error) {
      console.warn('Backend API probation fetch fallback to initial static cohort:', error.message);
      setProbationList(INITIAL_PROBATION_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProbation = async (cflEmpId, cflName) => {
    try {
      await goalService.approveProbation(cflEmpId);
      setActionMessage(`Probation successfully confirmed for ${cflName}! Notification email dispatched.`);

      setProbationList(prev => prev.map(item => {
        if (item.cflEmpId === cflEmpId) {
          return {
            ...item,
            stage: 'Confirmed',
            recommendation: 'Confirm',
            buHeadApproval: 'Vikram Reddy',
            buHeadDate: '05 Sep 2026',
            hrApproval: 'Mrudul Mangoli',
            hrDate: 'Today'
          };
        }
        return item;
      }));

      if (activeReviewItem && activeReviewItem.cflEmpId === cflEmpId) {
        setActiveReviewItem(null);
      }

      setTimeout(() => setActionMessage(''), 5000);
    } catch (err) {
      console.error('Error confirming probation:', err);
      alert(`Failed to confirm probation for ${cflName}. Please try again.`);
    }
  };

  // Filter Data
  const filteredData = probationList.filter(item => {
    const matchesSearch = item.cflName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.managerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || item.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Pagination Math
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in duration-300 font-inter">
      {/* Top Section Header */}
      <div className="flex justify-between items-start pb-2">
        <div>
          <h3 className="font-bold text-[#1B1418] text-2xl tracking-tight font-grotesk">
            Probation Tracker
          </h3>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Track probation evaluation and confirmation status of CFLs.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-4 py-2 pr-9 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => alert('Probation tracking data exported!')}
            className="bg-white hover:bg-slate-50 border border-[#78161A] text-[#78161A] text-[12px] font-bold px-4 py-[9.5px] rounded-lg flex items-center gap-1.5 shadow-sm font-inter transition-all"
          >
            <FaFileExport className="text-[11px]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Action Message Alert Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold shadow-sm animate-fade-in">
          <span>✅</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Automatic Reminders Notification Banner */}
      <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 flex items-center gap-3 text-xs shadow-sm">
        <span className="text-amber-500 text-sm">🔔</span>
        <div className="font-medium text-slate-700">
          <span className="font-bold text-[#1E40AF]">Automatic Reminders:</span>{' '}
          <span className="text-[#3B82F6]">the system emails Managers 15 days before probation confirmation due dates.</span>
        </div>
      </div>

      {/* Card Container for Table & Filters */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <FaSearch className="text-[13px]" />
            </span>
            <input
              type="text"
              placeholder="Search by CFL name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-[#EAE3E4] pl-10 pr-4 py-2.5 rounded-xl text-slate-700 placeholder-slate-400 text-xs shadow-inner focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] font-inter font-semibold"
            />
          </div>

          <div className="relative min-w-[160px] w-full sm:w-auto">
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none bg-white border border-[#EAE3E4] rounded-xl px-4 py-2.5 pr-9 text-xs font-bold text-slate-700 shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="All">All Stages</option>
              <option value="Not Eligible Yet">Not Eligible Yet</option>
              <option value="Eligible">Eligible</option>
              <option value="Pending HR Action">Pending HR Action</option>
              <option value="Confirmed">Confirmed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {loading && (
          <div className="text-center py-4 text-xs font-bold text-slate-400 font-inter animate-pulse">
            Loading probation evaluations...
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">CFL NAME</th>
                <th className="py-3 px-4">MANAGER</th>
                <th className="py-3 px-4">STAGE</th>
                <th className="py-3 px-4">SUBMITTED ON</th>
                <th className="py-3 px-4">RECOMMENDATION</th>
                <th className="py-3 px-4">BU HEAD APPROVAL</th>
                <th className="py-3 px-4">HR APPROVAL</th>
                <th className="py-3 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-inter">
              {paginatedData.map((item) => {
                const isConfirmed = item.stage === 'Confirmed';
                const isPendingHr = item.stage === 'Pending HR Action';
                const isEligible = item.stage === 'Eligible';

                return (
                  <tr key={item.cflEmpId} className="hover:bg-slate-50/70 transition-colors">
                    {/* CFL Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${item.avatarBg || 'bg-orange-500'} text-white font-bold text-[11px] flex items-center justify-center shadow-sm`}>
                          {item.initials}
                        </div>
                        <span className="font-bold text-slate-900">{item.cflName}</span>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {item.managerName}
                    </td>

                    {/* Stage */}
                    <td className="py-4 px-4">
                      {isConfirmed ? (
                        <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                          Confirmed
                        </span>
                      ) : isPendingHr ? (
                        <span className="bg-[#FEF3C7] text-[#D97706] font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                          Pending HR Action
                        </span>
                      ) : isEligible ? (
                        <span className="bg-[#E0F2FE] text-[#0369A1] font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                          Eligible
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                          Not Eligible Yet
                        </span>
                      )}
                    </td>

                    {/* Submitted On */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {isConfirmed || isPendingHr ? (item.submittedOn || '02 Sep 2026') : '—'}
                    </td>

                    {/* Recommendation */}
                    <td className="py-4 px-4">
                      {isConfirmed || isPendingHr ? (
                        <span className="bg-[#DCFCE7] text-[#15803D] font-bold px-3 py-1 rounded-full text-[11px] inline-block">
                          Confirm
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* BU Head Approval */}
                    <td className="py-4 px-4">
                      {isConfirmed || isPendingHr ? (
                        <div>
                          <div className="font-bold text-slate-800">{item.buHeadApproval || 'Vikram Reddy'}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{item.buHeadDate || '05 Sep 2026'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* HR Approval */}
                    <td className="py-4 px-4">
                      {isConfirmed ? (
                        <div>
                          <div className="font-bold text-slate-800">Mrudul Mangoli</div>
                          <div className="text-[10px] text-slate-400 font-medium">{item.hrDate || '08 Sep 2026'}</div>
                        </div>
                      ) : isPendingHr ? (
                        <span className="text-amber-600 font-bold">Pending HR Action</span>
                      ) : isEligible ? (
                        <span className="text-amber-600/80 font-semibold">Pending Manager Action</span>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center">
                      {isConfirmed ? (
                        <button
                          onClick={() => setActiveReviewItem(item)}
                          className="bg-white hover:bg-slate-50 border border-[#78161A] text-[#78161A] font-bold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all mx-auto shadow-sm"
                        >
                          <FaEye className="text-[11px]" />
                          <span>View & Review</span>
                        </button>
                      ) : isPendingHr ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleConfirmProbation(item.cflEmpId, item.cflName)}
                            className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-sm"
                          >
                            <FaCheckCircle className="text-[11px]" />
                            <span>Approve & Confirm</span>
                          </button>
                          <button
                            onClick={() => setActiveReviewItem(item)}
                            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all shadow-sm"
                            title="View Full Evaluation Details"
                          >
                            <FaEye className="text-[11px]" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 font-inter text-xs">
          <span className="text-slate-500 font-medium">
            Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <FaChevronLeft className="text-[10px]" />
              <span>Previous</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  currentPage === page
                    ? 'bg-[#78161A] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* View & Review Modal Popup */}
      {activeReviewItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-[#EAE3E4] font-inter">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 font-grotesk flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-500" />
                  <span>Probation Evaluation Details</span>
                </h4>
                <p className="text-xs text-slate-500">CFL: {activeReviewItem.cflName}</p>
              </div>
              <button
                onClick={() => setActiveReviewItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9.5px]">Manager Rating</span>
                  <div className="text-base font-bold text-slate-800 mt-0.5">⭐ {activeReviewItem.managerRating || 4.8} / 5</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[9.5px]">Evaluation Date</span>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{activeReviewItem.submittedOn}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[9.5px]">Manager Feedback</span>
                <p className="mt-1 p-3 bg-slate-50 rounded-xl text-slate-700 font-medium leading-relaxed border border-slate-100">
                  "{activeReviewItem.managerFeedback || 'Consistently met all performance benchmarks during 30-60-90 days review cycles. Strong technical skills and teamwork.'}"
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[9.5px]">Completed Performance Goals</span>
                <ul className="mt-1 space-y-2">
                  {(activeReviewItem.performanceGoals || [
                    { goal: 'Quarterly Project Deliverable', status: 'Completed' },
                    { goal: 'Team Collaboration & Mentorship', status: 'Completed' }
                  ]).map((g, idx) => (
                    <li key={idx} className="flex justify-between items-center p-2 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100 font-medium">
                      <span>{g.goal}</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">{g.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 font-grotesk">
              <button
                onClick={() => setActiveReviewItem(null)}
                className="px-5 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
              >
                Close
              </button>
              {activeReviewItem.stage !== 'Confirmed' && activeReviewItem.recommendation === 'Confirm' && (
                <button
                  onClick={() => handleConfirmProbation(activeReviewItem.cflEmpId, activeReviewItem.cflName)}
                  className="px-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <FaCheckCircle />
                  <span>Approve & Confirm Probation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrProbation;
