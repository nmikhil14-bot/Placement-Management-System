import React, { useState } from "react";
import { Company, JobDrive } from "../../types";
import { Search, MapPin, Building, Globe, Mail, Phone, ExternalLink, Filter } from "lucide-react";

interface StudentCompaniesProps {
  companies: Company[];
  jobs: JobDrive[];
}

export function StudentCompanies({ companies, jobs }: StudentCompaniesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Get unique list of industries and locations for filter select list
  const industries = ["All", ...Array.from(new Set(companies.map((c) => c.industry)))];
  const locations = ["All", ...Array.from(new Set(companies.map((c) => c.location.split(" / ")[0])))];

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = industryFilter === "All" || c.industry === industryFilter;
    const matchesLocation = locationFilter === "All" || c.location.includes(locationFilter);

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  const getJobCount = (companyId: string) => {
    return jobs.filter((j) => j.companyId === companyId || (j.companyId as any)?._id === companyId).length;
  };

  const getCompanyJobs = (companyId: string) => {
    return jobs.filter((j) => (j.companyId === companyId || (j.companyId as any)?._id === companyId) && j.status === "Published");
  };

  return (
    <div className="space-y-6" id="student-companies-view">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Corporates</h2>
        <p className="text-sm text-slate-500 mt-1">Explore top-tier corporate partners visiting our university campus for active recruitments.</p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search company names, descriptions, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
            id="company-search-input"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/40">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="text-xs font-semibold bg-transparent border-0 focus:outline-none cursor-pointer"
              id="company-industry-select"
            >
              <option value="All">All Industries</option>
              {industries.filter(ind => ind !== "All").map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/40">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs font-semibold bg-transparent border-0 focus:outline-none cursor-pointer"
              id="company-location-select"
            >
              <option value="All">All Locations</option>
              {locations.filter(loc => loc !== "All").map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Companies */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No corporate partners match the specified filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company._id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.companyName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xl flex items-center justify-center">
                      {company.companyName.charAt(0)}
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-md font-bold text-slate-900">{company.companyName}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">{company.industry}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{company.description}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-4 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {company.location}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                  {getJobCount(company._id)} Job Opening{getJobCount(company._id) !== 1 ? "s" : ""}
                </span>
                
                <button
                  onClick={() => setSelectedCompany(company)}
                  className="text-xs font-bold text-slate-800 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                  id={`company-details-btn-${company._id}`}
                >
                  View Profile
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Company Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl">
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute right-6 top-6 h-8 w-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-colors font-bold text-md cursor-pointer"
              title="Close Details"
              id="company-modal-close"
            >
              ✕
            </button>

            <div className="flex items-center gap-5 border-b border-slate-100 pb-6 mb-6">
              {selectedCompany.logo ? (
                <img
                  src={selectedCompany.logo}
                  alt={selectedCompany.companyName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-150"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-2xl flex items-center justify-center">
                  {selectedCompany.companyName.charAt(0)}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCompany.companyName}</h3>
                <p className="text-sm text-indigo-600 font-semibold">{selectedCompany.industry}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedCompany.location}
                </div>
              </div>
            </div>

            {/* Corporate Summary */}
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corporate Profile</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {selectedCompany.description}
                </p>
              </div>

              {/* Website Info */}
              {selectedCompany.website && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Corporate Website</h4>
                  <a
                    href={selectedCompany.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    {selectedCompany.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* HR Contact Panel */}
              <div className="p-4 border border-indigo-100 bg-indigo-50/15 rounded-xl">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-800 mb-3">University Relations Officer (HR Contact)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-700">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold">HR Representative</p>
                    <p className="mt-0.5">{selectedCompany.hrName || "Corporate Relations Team"}</p>
                  </div>
                  {selectedCompany.hrEmail && (
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">HR Email Desk</p>
                      <p className="mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-indigo-600" />
                        {selectedCompany.hrEmail}
                      </p>
                    </div>
                  )}
                  {selectedCompany.hrPhone && (
                    <div>
                      <p className="text-slate-400 text-[10px] uppercase font-bold">Representative Phone</p>
                      <p className="mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-indigo-600" />
                        {selectedCompany.hrPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Associated Open Placements */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Active On-Campus Recruitments</h4>
                {getCompanyJobs(selectedCompany._id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No job postings are actively accepting applications at this time.</p>
                ) : (
                  <div className="space-y-2.5">
                    {getCompanyJobs(selectedCompany._id).map((job) => (
                      <div
                        key={job._id}
                        className="p-3 border border-slate-100 hover:border-indigo-100 rounded-lg flex items-center justify-between text-xs font-medium hover:bg-slate-50/40"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{job.title}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">Package: {job.salary} LPA • Cutoff: {job.eligibility.cgpaCutoff} CGPA</p>
                        </div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 font-bold uppercase tracking-wide">
                          {job.stipend ? "Internship" : "Full-time"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
