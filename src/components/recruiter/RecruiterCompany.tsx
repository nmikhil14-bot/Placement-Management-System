import React, { useState } from "react";
import { Company } from "../../types";
import { Building, MapPin, Globe, Mail, Phone, Save, Edit } from "lucide-react";

interface RecruiterCompanyProps {
  company: Company | null;
  onUpdateCompany: (updates: Partial<Company>) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function RecruiterCompany({ company, onUpdateCompany, showNotification }: RecruiterCompanyProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState(company?.companyName || "");
  const [industry, setIndustry] = useState(company?.industry || "Software");
  const [location, setLocation] = useState(company?.location || "");
  const [description, setDescription] = useState(company?.description || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [logo, setLogo] = useState(company?.logo || "");

  // HR Specifics
  const [hrName, setHrName] = useState(company?.hrName || "");
  const [hrEmail, setHrEmail] = useState(company?.hrEmail || "");
  const [hrPhone, setHrPhone] = useState(company?.hrPhone || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500 italic">No corporate profile configuration loaded.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdateCompany({
        companyName,
        industry,
        location,
        description,
        website,
        logo,
        hrName,
        hrEmail,
        hrPhone
      });
      setIsEditing(false);
      showNotification("Corporate partner profile updated!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to update profile.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="recruiter-company-view">
      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
            {companyName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{companyName}</h2>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{industry} Sector Partner</p>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </p>
          </div>
        </div>

        <div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5 cursor-pointer"
              id="edit-company-profile-btn"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Company Profile
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Corporate Specifics */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
                <Building className="w-4 h-4 text-indigo-600" />
                Corporate Details
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Official Company Name</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 disabled:bg-slate-50/40 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Industry Sector</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 disabled:bg-slate-50/40 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Office Headquarters</label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 disabled:bg-slate-50/40 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Corporate Website URL</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="https://company.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50 disabled:bg-slate-50/40 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Corporate Description & Values</label>
                <textarea
                  disabled={!isEditing}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold bg-slate-50 disabled:bg-slate-50/40 text-slate-600 leading-relaxed"
                />
              </div>
            </div>

            {/* Right Column: HR / Point of Contact Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1">
                <Mail className="w-4 h-4 text-indigo-600" />
                University Relations Point of Contact
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">HR Representative Name</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 disabled:bg-slate-50/40 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">HR Communications Email</label>
                <input
                  type="email"
                  required
                  disabled={!isEditing}
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50 disabled:bg-slate-50/40 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">HR Representative Phone</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={hrPhone}
                  onChange={(e) => setHrPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50 disabled:bg-slate-50/40 text-slate-600"
                />
              </div>

              {/* Company Logo Link */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company Logo Link (URL)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="https://assets.company.com/logo.png"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50 disabled:bg-slate-50/40 text-slate-600"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Corporate Profile"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
