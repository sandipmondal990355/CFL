import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  FaCamera, 
  FaVideo,
  FaPlus, 
  FaTimes, 
  FaArrowRight, 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt,
  FaImages,
  FaPlayCircle
} from 'react-icons/fa';

const HrMemories = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Upload Form State
  const [occasionName, setOccasionName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Lightbox Modal state (active index for slider gallery)
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMemories(selectedYear);
  }, [selectedYear]);

  const fetchMemories = async (year) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:9085/api/memories?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const isVideoFile = (file) => {
    if (!file) return false;
    const type = file.type || '';
    const name = file.name || file.filePath || file.imageUrl || '';
    return type.startsWith('video') || /\.(mp4|mov|webm|avi|mkv)$/i.test(name);
  };

  const isVideoMemory = (mem) => {
    if (!mem) return false;
    if (mem.mediaType === 'VIDEO') return true;
    const url = mem.imageUrl || mem.filePath || '';
    return /\.(mp4|mov|webm|avi|mkv)$/i.test(url);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isVideo: isVideoFile(file)
    }));
    setPreviewFiles([...previewFiles, ...newPreviews]);
  };

  const handleRemoveSelectedFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewFiles(updatedPreviews);
  };

  const handleSaveMemory = async () => {
    if (!occasionName.trim()) {
      alert('Please enter an Occasion Name.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Please select at least one photo or video to upload.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('occasionName', occasionName);
      formData.append('year', selectedYear);

      const res = await fetch('http://localhost:9085/api/memories/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setOccasionName('');
        setSelectedFiles([]);
        setPreviewFiles([]);
        setShowUploadForm(false);
        fetchMemories(selectedYear);
      } else {
        alert('Failed to upload memory. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading memory:', err);
      alert('An error occurred while saving the memory.');
    } finally {
      setUploading(false);
    }
  };

  const currentLightboxMemory = lightboxIndex !== null && memories[lightboxIndex] ? memories[lightboxIndex] : null;

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      setLightboxIndex(memories.length - 1);
    }
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < memories.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      setLightboxIndex(0);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-inter text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 font-grotesk tracking-tight flex items-center gap-2.5">
            <span>Memories</span>
            <span className="text-[11px] font-extrabold text-[#1FB6A6] bg-[#1FB6A6]/10 px-3 py-1 rounded-full uppercase tracking-wider border border-[#1FB6A6]/20">
              {selectedYear} Batch
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Relive and cherish photos & videos of the program's journey.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selection Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#78161A] shadow-sm transition-all cursor-pointer min-w-[110px]"
            >
              <option value="2026">2026 Batch</option>
              <option value="2025">2025 Batch</option>
              <option value="2024">2024 Batch</option>
              <option value="2023">2023 Batch</option>
            </select>
          </div>

          {/* Upload Memory Button */}
          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="bg-[#78161A] hover:bg-[#631013] active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#78161A]/10 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FaCamera className="text-xs" />
            <span>Upload Memory</span>
          </button>
        </div>
      </div>

      {/* Upload Memory Form Section */}
      {showUploadForm && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 animate-slide-down">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold font-grotesk text-base">
              <span className="text-lg">📸🎥</span>
              <span>Upload New Photos & Videos</span>
            </div>
            <button 
              onClick={() => setShowUploadForm(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            {/* Occasion Name */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                OCCASION NAME *
              </label>
              <input
                type="text"
                value={occasionName}
                onChange={(e) => setOccasionName(e.target.value)}
                placeholder="e.g., Tech Webinar / Annual Day Video 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#78161A] transition-all"
              />
            </div>

            {/* Photos & Videos Selector */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                PHOTOS & VIDEOS *
              </label>

              {previewFiles.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-3">
                  {previewFiles.map((item, idx) => (
                    <div key={idx} className="relative w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group bg-slate-900">
                      {item.isVideo ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} alt="Preview" className="w-full h-full object-cover" />
                      )}

                      {/* Video / Photo Indicator Badge */}
                      <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        {item.isVideo ? <FaVideo className="text-rose-400" /> : <FaCamera className="text-[#1FB6A6]" />}
                        <span>{item.isVideo ? 'Video' : 'Photo'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedFile(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] transition-all cursor-pointer"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium mb-2">No photos or videos added yet.</p>
              )}

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="border border-[#78161A] text-[#78161A] hover:bg-[#78161A]/5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer mb-1.5"
              >
                <FaPlus className="text-[10px]" />
                <span>Add Photos / Videos</span>
              </button>

              <p className="text-[11px] text-slate-400 font-medium">
                Supports images (.jpg, .png) and videos (.mp4, .mov, .webm).
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setOccasionName('');
                  setSelectedFiles([]);
                  setPreviewFiles([]);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveMemory}
                disabled={uploading}
                className="bg-[#78161A] hover:bg-[#631013] text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#78161A]/20 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                <span>{uploading ? 'Uploading...' : 'Save Memory'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Media Gallery Grid */}
      <div className="bg-white rounded-3xl border border-[#EAE3E4] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">
            Loading program memories...
          </div>
        ) : memories.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              <FaImages />
            </div>
            <p className="text-base font-bold text-slate-700 font-grotesk">No memories found for {selectedYear}</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Upload Memory" above to share the first memorable moment for this batch!
            </p>
          </div>
        ) : (
          <>
            {/* Responsive Media Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {memories.map((mem, index) => {
                const isVid = isVideoMemory(mem);
                return (
                  <div
                    key={mem.id}
                    onClick={() => setLightboxIndex(index)}
                    className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-950 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-100 hover:scale-[1.02]"
                  >
                    {/* Media Display */}
                    {isVid ? (
                      <div className="relative w-full h-full">
                        <video
                          src={mem.imageUrl}
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <FaPlayCircle className="text-white/90 text-4xl group-hover:scale-110 group-hover:text-rose-400 transition-all duration-300 drop-shadow-xl" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={mem.imageUrl}
                        alt={mem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    )}

                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
                      <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-300">
                            <FaCalendarAlt className="text-[9px] text-[#1FB6A6]" />
                            <span>{mem.formattedDate}</span>
                          </div>
                          {isVid && (
                            <span className="bg-rose-600/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <FaVideo className="text-[8px]" /> Video
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold font-grotesk tracking-wide group-hover:text-[#1FB6A6] transition-colors leading-tight">
                          {mem.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Centered Link */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => alert(`Showing all ${memories.length} saved memories.`)}
                className="text-[#78161A] hover:text-[#631013] text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer font-grotesk hover:underline"
              >
                <span>View All Memories</span>
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* FULL-SCREEN LIGHTBOX GALLERY WITH VIDEO PLAYER SUPPORT */}
      {currentLightboxMemory && createPortal(
        <div 
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center animate-fade-in select-none"
        >
          {/* Ambient Background Glow */}
          {!isVideoMemory(currentLightboxMemory) && (
            <img
              src={currentLightboxMemory.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30 scale-125 pointer-events-none -z-10"
            />
          )}

          {/* FLOATING TOP CONTROL BAR */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed top-6 left-6 right-6 z-[100000] flex items-center justify-between gap-4 pointer-events-auto"
          >
            {/* Left Pill: Title, Type & Date */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
              <div className="w-7 h-7 rounded-full bg-[#78161A] flex items-center justify-center text-xs text-white">
                {isVideoMemory(currentLightboxMemory) ? <FaVideo /> : <FaCamera />}
              </div>
              <div>
                <span className="font-extrabold text-xs font-grotesk tracking-wide block leading-none">
                  {currentLightboxMemory.title}
                </span>
                <span className="text-[10px] font-medium text-slate-300 mt-1 block leading-none">
                  {currentLightboxMemory.formattedDate} • {selectedYear} Batch {isVideoMemory(currentLightboxMemory) ? '• 🎥 Video' : '• 📸 Photo'}
                </span>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2.5">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-rose-600 active:scale-95 text-white border border-white/20 flex items-center justify-center transition-all duration-200 shadow-2xl backdrop-blur-xl cursor-pointer"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          </div>

          {/* PREVIOUS / NEXT SLIDER ARROWS */}
          {memories.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="fixed left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center backdrop-blur-xl shadow-2xl transition-all cursor-pointer z-[100000] active:scale-90"
              >
                <FaChevronLeft className="text-base" />
              </button>

              <button
                type="button"
                onClick={handleNextPhoto}
                className="fixed right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center backdrop-blur-xl shadow-2xl transition-all cursor-pointer z-[100000] active:scale-90"
              >
                <FaChevronRight className="text-base" />
              </button>
            </>
          )}

          {/* MAIN MEDIA DISPLAY (PHOTO OR VIDEO) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center p-2"
          >
            {isVideoMemory(currentLightboxMemory) ? (
              <video
                src={currentLightboxMemory.imageUrl}
                controls
                autoPlay
                className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/15"
              />
            ) : (
              <img
                src={currentLightboxMemory.imageUrl}
                alt={currentLightboxMemory.title}
                className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/15 animate-scale-up"
              />
            )}
          </div>

          {/* BOTTOM COUNTER PILL */}
          {memories.length > 1 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-2xl z-[100000]">
              {lightboxIndex + 1} of {memories.length}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default HrMemories;
