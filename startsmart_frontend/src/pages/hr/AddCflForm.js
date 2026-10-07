import React from 'react';

const AddCflForm = ({
  formData,
  handleInputChange,
  handleFormSubmit,
  handleCloseForm,
  managersList,
  mentorsList
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#EAE3E4] p-8 shadow-[0_4px_15px_rgba(0,0,0,0.02)] space-y-8 text-left font-inter">
      <div>
        <h4 className="text-lg font-bold text-[#1B1418] flex items-center gap-2 font-grotesk">
          <span className="text-[#8B0000] font-black text-lg font-inter">+</span> Add New CFL
        </h4>
        <p className="text-[11.5px] text-slate-400 mt-0.5">
          Fields marked <span className="text-[#EF4444] font-bold">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* 1. ASSIGN MANAGER & MENTOR */}
        <div className="border border-[#FCA5A5]/60 bg-[#FFF5F5] p-6 rounded-2xl space-y-4">
          <h5 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk">
            <span className="text-xs">🎯</span> ASSIGN MANAGER & MENTOR
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                MANAGER <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  name="managerCode"
                  value={formData.managerCode}
                  onChange={handleInputChange}
                  className="appearance-none bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#78161A] w-full cursor-pointer"
                >
                  {managersList.map(m => (
                    <option key={m.empCode} value={String(m.empCode)}>{m.name} ({m.empCode})</option>
                  ))}
                  <option value="custom">-- Add New Manager --</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                MENTOR
              </label>
              <div className="relative">
                <select
                  name="mentorCode"
                  value={formData.mentorCode}
                  onChange={handleInputChange}
                  className="appearance-none bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#78161A] w-full cursor-pointer"
                >
                  {mentorsList.map(m => (
                    <option key={m.empCode} value={String(m.empCode)}>{m.name} ({m.empCode})</option>
                  ))}
                  <option value="custom">-- Add New Mentor --</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Manager Details */}
          {formData.managerCode === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#FCA5A5]/40 animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-bold text-[#334155] uppercase">Mgr Name *</label>
                <input 
                  type="text" name="customManagerName" value={formData.customManagerName} onChange={handleInputChange} required
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white" placeholder="Name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-bold text-[#334155] uppercase">Mgr Code *</label>
                <input 
                  type="number" name="customManagerCode" value={formData.customManagerCode} onChange={handleInputChange} required
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white" placeholder="Code"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-bold text-[#334155] uppercase">Mgr Email *</label>
                <input 
                  type="email" name="customManagerEmail" value={formData.customManagerEmail} onChange={handleInputChange} required
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white" placeholder="Email"
                />
              </div>
            </div>
          )}

          {/* Custom Mentor Details */}
          {formData.mentorCode === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#FCA5A5]/40 animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-bold text-[#334155] uppercase">Mentor Name *</label>
                <input 
                  type="text" name="customMentorName" value={formData.customMentorName} onChange={handleInputChange} required
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white" placeholder="Name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-bold text-[#334155] uppercase">Mentor Code *</label>
                <input 
                  type="number" name="customMentorCode" value={formData.customMentorCode} onChange={handleInputChange} required
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white" placeholder="Code"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9.5px] font-bold text-[#334155] uppercase">Mentor Email *</label>
                <input 
                  type="email" name="customMentorEmail" value={formData.customMentorEmail} onChange={handleInputChange} required
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white" placeholder="Email"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. PERSONAL & ORGANIZATIONAL DETAILS */}
        <div className="space-y-5">
          <h5 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk">
            <span className="text-xs">👤</span> PERSONAL & ORGANIZATIONAL DETAILS
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* FIRST NAME */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                FIRST NAME <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                type="text" required name="firstName" value={formData.firstName} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* MIDDLE NAME */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                MIDDLE NAME
              </label>
              <input
                type="text" name="middleName" value={formData.middleName} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* LAST NAME */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                LAST NAME <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                type="text" required name="lastName" value={formData.lastName} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* E-MAIL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                E-MAIL <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                type="email" required name="email" value={formData.email} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* EMPLOYEE CODE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                EMPLOYEE CODE <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                type="number" required name="cflEmpCode" value={formData.cflEmpCode} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* DEPARTMENT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                DEPARTMENT <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                type="text" required name="department" value={formData.department} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* DESIGNATION */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                DESIGNATION <span className="text-[#EF4444] font-bold">*</span>
              </label>
              <input
                type="text" required name="role" value={formData.role} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* SUB DEPARTMENT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                SUB DEPARTMENT
              </label>
              <input
                type="text" name="subDepartment" value={formData.subDepartment} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* DATE OF JOINING */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                DATE OF JOINING
              </label>
              <input
                type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleInputChange}
                placeholder="dd-mm-yyyy"
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* PROJECT */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                PROJECT
              </label>
              <input
                type="text" name="project" value={formData.project} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* PROJECT CLASSIFICATION */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                PROJECT CLASSIFICATION
              </label>
              <input
                type="text" name="projectClassification" value={formData.projectClassification} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* BU HEAD */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                BU HEAD
              </label>
              <input
                type="text" name="buHead" value={formData.buHead} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* LOCATION */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                LOCATION
              </label>
              <input
                type="text" name="location" value={formData.location} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* GENDER */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                GENDER
              </label>
              <div className="relative">
                <select
                  name="gender" value={formData.gender} onChange={handleInputChange}
                  className="appearance-none bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none w-full cursor-pointer"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            {/* VERTICAL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                VERTICAL
              </label>
              <input
                type="text" name="vertical" value={formData.vertical} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* CONTACT NUMBER */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                CONTACT NUMBER
              </label>
              <input
                type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* SUB AREA */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                SUB AREA
              </label>
              <input
                type="text" name="subArea" value={formData.subArea} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* CATEGORY */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                CATEGORY
              </label>
              <input
                type="text" name="category" value={formData.category} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 3. SCHOLASTICS INFO */}
        <div className="space-y-5">
          <h5 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk">
            <span className="text-xs">📚</span> SCHOLASTICS INFO
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* SSC */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                SSC / (XTH) (%)
              </label>
              <input
                type="text" name="ssc" value={formData.ssc} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* HSC */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                HSC / (XII) (%)
              </label>
              <input
                type="text" name="hsc" value={formData.hsc} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* UG */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                UNDER GRADUATE (UG) (%)
              </label>
              <input
                type="text" name="ug" value={formData.ug} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* PG */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                POST GRADUATE (PG) (%)
              </label>
              <input
                type="text" name="pg" value={formData.pg} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* INSTITUTE NAME */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                INSTITUTE NAME
              </label>
              <input
                type="text" name="instituteName" value={formData.instituteName} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>

            {/* INSTITUTE BRANCH */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                INSTITUTE BRANCH
              </label>
              <input
                type="text" name="instituteBranch" value={formData.instituteBranch} onChange={handleInputChange}
                className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* 4. SKILLS */}
        <div className="space-y-5">
          <h5 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk">
            <span className="text-xs">💬</span> SKILLS
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                PRIMARY TECHNICAL SKILLS
              </label>
              <input
                type="text" name="primaryTechSkills" value={formData.primaryTechSkills} onChange={handleInputChange}
                placeholder="e.g., Java, Spring Boot, SQL"
                className="px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800 placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                Separate multiple skills with commas.
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#334155] font-inter">
                PRIMARY NONTECHNICAL SKILLS
              </label>
              <input
                type="text" name="primaryNonTechSkills" value={formData.primaryNonTechSkills} onChange={handleInputChange}
                placeholder="e.g., Communication, Teamwork"
                className="px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* 5. ABOUT ME */}
        <div className="space-y-5">
          <h5 className="text-[11.5px] font-bold uppercase tracking-wider text-[#78161A] flex items-center gap-1.5 font-grotesk">
            <span className="text-xs">📝</span> ABOUT ME
          </h5>
          <div className="flex flex-col gap-1.5">
            <textarea
              name="bio" value={formData.bio} onChange={handleInputChange}
              placeholder="A short bio..." rows="3"
              className="px-4 py-3 border border-[#E2E8F0] rounded-lg text-xs outline-none bg-white focus:border-[#78161A] font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Cancel & Create Buttons */}
        <div className="pt-6 flex justify-start gap-4 border-t border-slate-100 font-inter">
          <button
            type="button"
            onClick={handleCloseForm}
            className="px-6 py-2.5 rounded-lg border border-[#78161A] text-[#78161A] font-bold hover:bg-slate-50 transition-all text-xs tracking-wide"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#78161A] hover:bg-[#631013] text-white font-bold transition-all text-xs tracking-wide flex items-center gap-2 shadow-sm"
          >
            <span className="bg-[#10B981] text-white text-[9.5px] font-black w-4 h-4 rounded flex items-center justify-center">✓</span>
            <span>Create CFL</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCflForm;
