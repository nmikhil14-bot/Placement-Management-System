import React, { useState } from "react";
import { Company } from "../../types";
import { Search, Plus, Edit, Trash2, Building, MapPin, Globe, Mail } from "lucide-react";

interface AdminCompaniesProps {
  companies: Company[];
  onAddCompany: (company: Partial<Company>) => Promise<void>;
  onUpdateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
  onDeleteCompany: (id: string) => Promise<void>;
  showNotification: (msg: string, type: "success" | "error" | "info") => void;
}

export function AdminCompanies({ companies, onAddCompany, onUpdateCompany, onDeleteCompany, showNotification }: AdminCompaniesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("Software");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");

  const [hrName, setHrName] = useState("");
  const [hrEmail, setHrEmail] = useState("");
  const [hrPhone, setHrPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (company: Company) => {
    setEditingId(company._id);
    setCompanyName(company.companyName);
    setIndustry(company.industry);
    setLocation(company.location);
    setDescription(company.description);
    setWebsite(company.website || "");
    setLogo(company.logo || "");
    setHrName(company.hrName || "");
    setHrEmail(company.hrEmail || "");
    setHrPhone(company.hrPhone || "");
    setShowForm(true);
  };

  const handleReset = () => {
    setEditingId(null);
    setCompanyName("");
    setIndustry("Software");
    setLocation("");
    setDescription("");
    setWebsite("");
    setLogo("");
    setHrName("");
    setHrEmail("");
    setHrPhone("");
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !location || !description) {
      showNotification("Please fill in all core partner details.", "error");
      return;
    }

    const payload: Partial<Company> = {
      companyName,
      industry,
      location,
      description,
      website,
      logo,
      hrName,
      hrEmail,
      hrPhone
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await onUpdateCompany(editingId, payload);
        showNotification("Corporate partner profile updated!", "success");
      } else {
        await onAddCompany(payload);
        showNotification("New corporate partner registered successfully!", "success");
      }
      handleReset();
    } catch (err: any) {
      showNotification(err.message || "Operation failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this company profile? This will wipe their posted job drives from the portal.")) {
      try {
        await onDeleteCompany(id);
        showNotification("Company partner deleted successfully.", "info");
      } catch (err: any) {
        showNotification(err.message || "Failed to delete company.", "error");
      }
    }
  };

  const filteredCompanies = companies.filter((c) => {
    return c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6" id="admin-companies-view">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Relations Directory</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Configure corporate partnership profiles and HR communication desks.</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            id="add-company-btn"
          >
            <Plus className="w-4 h-4" />
            Register Corporate Partner
          </button>
        )}
      </div>

      {/* Expand/Create Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-md">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-6">
            {editingId ? "Edit Partner Company Credentials" : "Register a New Corporate Placement Partner"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Form: Basic details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Official Corporate Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Initech Solutions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Industry Sector Choice</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none cursor-pointer"
                    >
                      <option value="Software">Software & Tech</option>
                      <option value="Consulting">Consulting Services</option>
                      <option value="Core Engineering">Core Engineering</option>
                      <option value="Finance">Financial Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location Headquarters *</label>
                    <input
                      type="text"
                      required
                      placeholder="Chennai, TN"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Website Link URL</label>
                  <input
                    type="text"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Corporate Bio Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about corporate size, visiting year metrics, recruitment priorities, etc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Right Form: HR Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Primary Point of Contact (HR Representative)
                </h4>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">HR Officer Name</label>
                  <input
                    type="text"
                    placeholder="Jane Miller"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold bg-slate-50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">HR Email Address</label>
                  <input
                    type="email"
                    placeholder="careers@company.com"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">HR Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 91122 33445"
                    value={hrPhone}
                    onChange={(e) => setHrPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Logo Link URL</label>
                  <input
                    type="text"
                    placeholder="https://assets.company.com/logo.png"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="border-t border-slate-100 pt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer disabled:bg-slate-400"
              >
                {isSubmitting ? "Saving..." : "Save Corporate Partner"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table search toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search partners by corporate name, industry, location HQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>
      </div>

      {/* Companies listing */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No partner corporations match search query.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Corporate Identity</th>
                  <th className="px-6 py-4">HQ Location</th>
                  <th className="px-6 py-4">HR Contact Desk</th>
                  <th className="px-6 py-4">Website</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {filteredCompanies.map((comp) => (
                  <tr key={comp._id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black">
                          {comp.companyName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">{comp.companyName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{comp.industry} Industry</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {comp.location}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p className="text-slate-800 font-bold">{comp.hrName || "Corporate Officer"}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{comp.hrEmail || "No official email"}</p>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {comp.website ? (
                        <a href={comp.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          Visit site
                        </a>
                      ) : (
                        <span className="text-slate-300 italic">None</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(comp)}
                        className="h-8 w-8 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-indigo-600 hover:bg-slate-50 inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Edit partner profile"
                        id={`edit-company-btn-${comp._id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(comp._id)}
                        className="h-8 w-8 rounded-lg border border-slate-150 bg-white text-slate-400 hover:text-red-600 hover:bg-slate-50 inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Delete corporate partner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminCompanies;
