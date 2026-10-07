import React, { useState, useEffect, useRef } from 'react';
import {
  FaDownload,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaUpload,
  FaTimes,
  FaEye
} from 'react-icons/fa';
import { documentService } from '../../services/documentService';

const MyFiles = () => {
  const CFL_EMP_ID = 1125; // Current logged-in CFL Employee ID

  // Dynamic state for documents list from backend
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drag and drop / upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [notification, setNotification] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch document list on mount
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getByCfl(CFL_EMP_ID);
      // Sort documents by upload date descending
      const sorted = (data || []).sort((a, b) => new Date(b.uploadedAt || b.uploadedOn) - new Date(a.uploadedAt || a.uploadedOn));
      setDocuments(sorted);
    } catch (err) {
      console.error("Failed to load documents from database", err);
      showNotification("Error loading documents from database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Helper to get matching document icon
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt className="w-5 h-5 text-slate-500" />;
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return <FaFilePdf className="w-5 h-5 text-rose-500" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FaFileWord className="w-5 h-5 text-blue-500" />;
    } else if (['xls', 'xlsx'].includes(ext)) {
      return <FaFileExcel className="w-5 h-5 text-emerald-600" />;
    }
    return <FaFileAlt className="w-5 h-5 text-slate-500" />;
  };

  // Helper to format file size
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Automatically categorize based on filename
  const autoCategorize = (fileName) => {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('resume') || nameLower.includes('cv')) {
      return 'Resume';
    }
    if (nameLower.includes('logbook') || nameLower.includes('log') || nameLower.includes('journal')) {
      return 'Logbook';
    }
    return 'Certificate';
  };

  // Handle new file upload to backend
  const handleFiles = async (files) => {
    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop().toLowerCase();

      // Extension validation
      if (!validExtensions.includes(ext)) {
        showNotification(`Unsupported file type: .${ext}. Only PDF, DOC, DOCX, XLS, XLSX are allowed.`, 'error');
        continue;
      }

      // Size validation
      if (file.size > maxSizeBytes) {
        showNotification(`File too large: ${file.name}. Maximum size limit is 10MB.`, 'error');
        continue;
      }

      // Add to uploading progress tracking state
      const targetCategory = autoCategorize(file.name);
      const newUpload = {
        name: file.name,
        progress: 10,
        size: formatBytes(file.size),
        type: ext.toUpperCase()
      };

      setUploadingFiles((prev) => [...prev, newUpload]);

      // Simple progress interval animation up to 80% to show activity
      let progress = 10;
      const interval = setInterval(() => {
        if (progress < 80) {
          progress += 15;
          setUploadingFiles((prev) =>
            prev.map((item) =>
              item.name === file.name ? { ...item, progress } : item
            )
          );
        }
      }, 100);

      try {
        // Real upload REST API execution call
        await documentService.upload(file, CFL_EMP_ID, targetCategory);

        clearInterval(interval);
        // Complete upload progress
        setUploadingFiles((prev) =>
          prev.map((item) =>
            item.name === file.name ? { ...item, progress: 100 } : item
          )
        );

        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((item) => item.name !== file.name));
          showNotification(`"${file.name}" uploaded successfully!`, 'success');
          // Reload documents from database
          fetchDocuments();
        }, 300);

      } catch (err) {
        clearInterval(interval);
        setUploadingFiles((prev) => prev.filter((item) => item.name !== file.name));
        console.error("Backend upload failed", err);
        showNotification(`Upload failed for "${file.name}": ${err.message}`, 'error');
      }
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case 'Certificate':
        return 'bg-[#FFF0F0] border border-[#FFE0E0] text-[#78161A]';
      case 'Resume':
        return 'bg-[#E6F4EA] border border-[#CEECD3] text-[#137333]';
      case 'Logbook':
        return 'bg-[#FFF8E6] border border-[#FFEFC2] text-[#B06000]';
      default:
        return 'bg-slate-50 border border-slate-200 text-slate-700';
    }
  };

  // Call dynamic backend view API in new tab
  const handleView = (doc) => {
    if (!doc.id) return;
    try {
      const viewUrl = documentService.viewUrl(doc.id);
      window.open(viewUrl, '_blank');
    } catch (err) {
      console.error("View failed", err);
      showNotification("Failed to open view URL.", "error");
    }
  };

  // Call dynamic backend download API
  const handleDownload = async (doc) => {
    try {
      showNotification(`Downloading "${doc.fileName || doc.name}"...`, 'success');
      await documentService.download(doc.id, doc.fileName || doc.name);
    } catch (err) {
      console.error("Download failed", err);
      showNotification("Failed to download document from server.", "error");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in duration-300 font-inter select-none">

      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#1B1418] tracking-tight font-grotesk">
          My Files
        </h2>
        <p className="text-[13px] text-slate-500 mt-1 font-medium font-inter">
          Upload and manage your important documents.
        </p>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-3 animate-fade-in ${notification.type === 'success'
          ? 'bg-[#E6F6EE] border-[#CEECD3] text-[#1E8E5A]'
          : 'bg-[#FFF0F0] border-[#FFE0E0] text-[#78161A]'
          }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="hover:opacity-75 outline-none">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-8">

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${dragActive
            ? 'border-[#78161A] bg-[#FFF0F0]/50 scale-[1.002]'
            : 'border-[#F8D2D4] bg-[#FFF8F8] hover:bg-[#FFF0F0]/30'
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />

          {/* Cloud/Upload Graphic */}
          <div className="w-[52px] h-[52px] rounded-full bg-[#FFE5E6] flex items-center justify-center text-[#78161A] mb-3">
            <FaUpload className="w-5 h-5 animate-pulse" />
          </div>

          <p className="text-slate-600 text-sm font-semibold">
            Drag & drop files here or
          </p>

          <button
            type="button"
            className="mt-3 px-6 py-2 bg-[#78161A] hover:bg-[#631013] active:scale-95 text-white text-[12.5px] font-extrabold rounded-lg shadow-sm transition-all outline-none"
          >
            Browse Files
          </button>

          <p className="text-[#94A3B8] text-[10.5px] font-bold mt-3 uppercase tracking-wider">
            PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
          </p>
        </div>

        {/* Upload progress list */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-3 border-t border-[#EAE3E4] pt-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Uploading...</h4>
            <div className="space-y-2">
              {uploadingFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 flex-1 mr-4">
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className="bg-[#78161A] h-full transition-all duration-100" style={{ width: `${file.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{file.progress}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Documents Table Wrapper */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 tracking-tight font-grotesk">
            My Documents
          </h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold text-sm">
              Loading documents from database...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-slate-500 text-sm font-semibold">No documents uploaded yet</p>
              <p className="text-slate-400 text-xs mt-1">Upload certificates, resumes, or logs using the box above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EAE3E4] text-[9.5px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="pb-3.5 pl-2">Document Name</th>
                    <th className="pb-3.5">Category</th>
                    <th className="pb-3.5">Uploaded On</th>
                    <th className="pb-3.5">Type</th>
                    <th className="pb-3.5">Size</th>
                    <th className="pb-3.5 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EBEF]">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* File Name */}
                      <td className="py-4 pl-2 font-semibold text-[13px] text-slate-700 max-w-[280px] truncate">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.fileName)}
                          <span className="truncate" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                        </div>
                      </td>

                      {/* Category badge */}
                      <td className="py-4">
                        <span className={`inline-flex px-3 py-1 rounded-[5px] text-[10.5px] font-bold ${getCategoryBadgeStyle(doc.documentType)}`}>
                          {doc.documentType}
                        </span>
                      </td>

                      {/* Uploaded On */}
                      <td className="py-4 text-[12.5px] text-slate-650 font-bold">
                        {formatDate(doc.uploadedAt)}
                      </td>

                      {/* Type */}
                      <td className="py-4 text-[12px] text-slate-500 font-bold uppercase">
                        {(doc.fileName || '').split('.').pop().toUpperCase()}
                      </td>

                      {/* Size */}
                      <td className="py-4 text-[12px] text-slate-500 font-bold">
                        {formatBytes(doc.fileSize)}
                      </td>

                      {/* Actions (View and Download) Buttons */}
                      <td className="py-4 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleView(doc)}
                            className="p-2 text-slate-400 hover:text-[#78161A] hover:bg-[#FFF0F0] active:scale-95 rounded-lg transition-all outline-none"
                            title="View Document"
                          >
                            <FaEye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-slate-400 hover:text-[#78161A] hover:bg-[#FFF0F0] active:scale-95 rounded-lg transition-all outline-none"
                            title="Download Document"
                          >
                            <FaDownload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default MyFiles;
