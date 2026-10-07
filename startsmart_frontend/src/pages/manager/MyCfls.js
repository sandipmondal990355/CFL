import React, { useState, useEffect } from 'react';
import { FaFileDownload, FaSearch } from 'react-icons/fa';
import cflAssignmentService from '../../services/cflAssignmentService';
import goalService from '../../services/goalService';

const MyCfls = () => {
  const managerEmpCode = 2002;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Dynamic datasets from API
  const [cflList, setCflList] = useState([]);
  const [cflMetricsMap, setCflMetricsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedYear]);

  // Fetch CFL Assignments from backend for manager 2002
  useEffect(() => {
    let active = true;

    const fetchMyCfls = async () => {
      try {
        setLoading(true);
        const data = await cflAssignmentService.getByManager(managerEmpCode, {
          search: searchQuery,
          year: selectedYear,
          page: page,
          size: pageSize
        });

        const list = data.content || [];

        // Fetch workflows in parallel to derive actual cycle statuses without hardcoded lists
        const metricsMap = {};
        await Promise.all(
          list.map(async (cfl) => {
            const empCode = cfl.cflEmpCode || cfl.id;
            let workflows = [];
            try {
              workflows = await goalService.getWorkflowByCfl(empCode);
            } catch (err) {
              console.warn(`Could not load workflows for CFL ${empCode}`, err);
            }

            const getStageStatus = (stageCode) => {
              const wf = (workflows || []).find(w => {
                const sCode = w.stageCode || '';
                const sName = w.stageName || '';
                const sId = w.stageId || w.stage_id;
                if (stageCode === 'G30') return sCode === 'G30' || sId === 1 || (sName.includes('30') && !sCode);
                if (stageCode === 'G60') return sCode === 'G60' || sId === 2 || sName.includes('60');
                if (stageCode === 'G90') return sCode === 'G90' || sId === 3 || sName.includes('90');
                if (stageCode === 'G100') return sCode === 'G100' || sId === 4 || sName.includes('Final');
                return false;
              });

              if (stageCode === 'G100') {
                const storedAnnualRaw = localStorage.getItem(`annual_review_G100_${empCode}`) || localStorage.getItem(`annual_review_remarks_${empCode}`);
                if (storedAnnualRaw) {
                  return 'Completed';
                }
              }

              if (!wf) return 'Not Started';
              const st = wf.status || '';
              if (st === 'CYCLE_COMPLETED' || st === 'CONFIRMED' || st === 'COMPLETED' || st === 'SUBMITTED_TO_HR' || st === 'COMPLETED_SUBMITTED_HR' || wf.selfAcceptanceStatus) {
                return 'Completed';
              }
              if (st === 'GOALS_SUBMITTED' || st === 'SELF_REVIEW_COMPLETED' || st === 'REASSESSMENT_REQUESTED' || st === 'Submitted' || st === 'SUBMITTED') {
                return 'Pending Manager Approval';
              }
              if (st === 'GOAL_ENABLED' || st === 'DRAFT' || st === 'APPROVED' || st === 'GOALS_APPROVED') {
                return 'Draft';
              }
              return 'Not Started';
            };

            const tDays = getStageStatus('G30');
            const sDays = getStageStatus('G60');
            const nDays = getStageStatus('G90');
            const fReview = getStageStatus('G100');

            let actionStatus = 'Awaiting Final Review';
            if (cfl.status === 'Confirm' || (tDays === 'Completed' && sDays === 'Completed' && nDays === 'Completed' && fReview === 'Completed')) {
              actionStatus = '✓ Confirmed';
            } else if (tDays === 'Pending Manager Approval' || sDays === 'Pending Manager Approval' || nDays === 'Pending Manager Approval' || fReview === 'Pending Manager Approval') {
              actionStatus = 'Pending Manager Action';
            }

            metricsMap[empCode] = {
              employmentStatus: cfl.status || 'Probation',
              thirtyDays: tDays,
              sixtyDays: sDays,
              ninetyDays: nDays,
              finalReview: fReview,
              action: actionStatus,
              avatarColor: 'bg-[#E06A3C]'
            };
          })
        );

        if (active) {
          setCflList(list);
          setCflMetricsMap(metricsMap);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.error(`Error fetching CFLs for manager ${managerEmpCode}:`, err);
          setError('Could not connect to StartSmart server backend.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMyCfls();

    return () => {
      active = false;
    };
  }, [searchQuery, selectedYear, page, managerEmpCode]);

  // Status Badge Style Helper
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Probation':
        return 'bg-[#FFF7ED] text-[#C2410C] border border-[#FDBA74]';
      case 'Confirm':
      case 'Completed':
      case '✓ Confirmed':
        return 'bg-[#E6F6EE] text-[#1E8E5A] border border-[#A7F3D0]';
      case 'Pending Manager Approval':
      case 'Pending Manager Action':
        return 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]';
      case 'Draft':
        return 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]';
      case 'Not Started':
      case 'Awaiting Final Review':
      default:
        return 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'CF';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter text-left">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
            My CFLs (Manager ID: {managerEmpCode})
          </h2>
          <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
            Complete tracking of each CFL's employment status and review cycle progress.
          </p>
        </div>

        {/* Global Year controls and Export CTA */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px] font-black uppercase tracking-wider font-inter">
              Year
            </span>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white border border-[#EAE3E4] rounded-lg px-4 py-2 pr-9 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] cursor-pointer"
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
          </div>
          <button
            onClick={() => alert('Exporting CFL summary...')}
            className="bg-[#78161A] hover:bg-[#631013] active:scale-95 transition-all text-white text-[12px] font-bold px-4 py-[9.5px] rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <FaFileDownload className="text-[12px]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Table Container Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-6">
        {/* Search Bar Input */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
            <FaSearch className="text-[13px]" />
          </span>
          <input
            type="text"
            placeholder="Search by CFL name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#EAE3E4] pl-10 pr-4 py-3 rounded-xl text-slate-700 placeholder-slate-400 text-[13.5px] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#78161A]/10 focus:border-[#78161A] font-inter font-semibold"
          />
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100 min-w-[200px]">
                  CFL
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100">
                  Employment Status
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100">
                  Thirty Days
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100">
                  Sixty Days
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100">
                  Ninety Days
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100">
                  Final Review
                </th>
                <th className="text-slate-400 font-extrabold tracking-wider text-[11px] uppercase pb-[15px] border-b border-slate-100">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-sm text-slate-400 font-medium font-inter animate-pulse">
                    Loading CFL assignments for Manager {managerEmpCode}...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-sm text-rose-500 font-bold font-inter">
                    {error}
                  </td>
                </tr>
              ) : cflList.length > 0 ? (
                cflList.map((cfl) => {
                  const empCode = cfl.cflEmpCode || cfl.id;
                  const metrics = cflMetricsMap[empCode] || {
                    employmentStatus: cfl.status || 'Probation',
                    thirtyDays: 'Not Started',
                    sixtyDays: 'Not Started',
                    ninetyDays: 'Not Started',
                    finalReview: 'Not Started',
                    action: 'Awaiting Final Review',
                    avatarColor: 'bg-[#E06A3C]'
                  };

                  return (
                    <tr key={cfl.id || empCode} className="hover:bg-slate-50 transition-colors">
                      {/* CFL Name & Avatar */}
                      <td className="py-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${metrics.avatarColor} text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm flex-shrink-0 font-inter`}>
                          {getInitials(cfl.cflName)}
                        </div>
                        <span className="text-[13.5px] font-bold text-slate-800 font-inter">
                          {cfl.cflName}
                        </span>
                      </td>

                      {/* Employment Status */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.employmentStatus)}`}>
                          {metrics.employmentStatus}
                        </span>
                      </td>

                      {/* Thirty Days */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.thirtyDays)}`}>
                          {metrics.thirtyDays}
                        </span>
                      </td>

                      {/* Sixty Days */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.sixtyDays)}`}>
                          {metrics.sixtyDays}
                        </span>
                      </td>

                      {/* Ninety Days */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.ninetyDays)}`}>
                          {metrics.ninetyDays}
                        </span>
                      </td>

                      {/* Final Review */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.finalReview)}`}>
                          {metrics.finalReview}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="py-4">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold ${getBadgeStyle(metrics.action)}`}>
                          {metrics.action}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-sm text-slate-400 font-medium font-inter">
                    No CFL matches your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-[#EAE3E4] rounded-2xl p-4 shadow-sm font-inter mt-4">
            <div className="text-[12px] font-semibold text-slate-500">
              Showing Page {page + 1} of {totalPages} ({totalElements} total CFLs)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-[#EAE3E4] rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${page === i
                      ? 'bg-[#78161A] text-white shadow-sm'
                      : 'bg-white border border-[#EAE3E4] text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-[#EAE3E4] rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCfls;
