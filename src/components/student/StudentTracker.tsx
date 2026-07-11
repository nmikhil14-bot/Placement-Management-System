import React, { useState } from "react";
import { Application } from "../../types";
import { Search, Calendar, ChevronRight, List, Table, Filter, Tag } from "lucide-react";

interface StudentTrackerProps {
  applications: Application[];
}

export function StudentTracker({ applications }: StudentTrackerProps) {
  const [viewMode, setViewMode] = useState<"table" | "list">("table");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = applications.filter((app: any) => {
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    const company = app.jobDriveId?.companyId?.companyName || "";
    const title = app.jobDriveId?.title || "";
    const matchesSearch = company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Offer":
      case "Joined":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-100";
      case "Shortlisted":
      case "Interview":
      case "HR":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6" id="student-tracker-view">
      {/* Header with View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Application Status Tracker</h2>
          <p className="text-sm text-slate-500 mt-1">Review your real-time candidate progression across corporate recruitment rounds.</p>
        </div>

        {/* List/Table Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Table View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List Cards
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name or role title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/40">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-transparent border-0 focus:outline-none cursor-pointer"
          >
            <option value="All">All Pipelines</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">In Interview</option>
            <option value="Offer">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Primary Display */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No submitted applications match the active filters.</p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE DISPLAY */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Corporate Partner</th>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Application Date</th>
                  <th className="px-6 py-4">Current Pipeline Phase</th>
                  <th className="px-6 py-4">Recruiter Feedback Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold">
                {filtered.map((app: any) => (
                  <tr key={app._id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-4 text-slate-900">
                      {app.jobDriveId?.companyId?.companyName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {app.jobDriveId?.title}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border leading-none ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-xs truncate">
                      {app.remarks || <span className="italic text-slate-300">Screening under progress</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* LIST CARD DISPLAY */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((app: any) => (
            <div
              key={app._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{app.jobDriveId?.companyId?.companyName || "N/A"}</h4>
                  <p className="text-xs font-bold text-indigo-600 mt-1">{app.jobDriveId?.title}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border leading-none ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>

              {/* Status and dates details */}
              <div className="border-t border-slate-100 mt-4 pt-3 flex flex-wrap justify-between items-center text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : "N/A"}
                </span>
              </div>

              {/* Remarks */}
              <div className="mt-3.5 p-3 rounded-xl bg-slate-50 text-xs leading-relaxed text-slate-600 border border-slate-100">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Recruiter / Admin Comments:</p>
                {app.remarks || <span className="italic text-slate-400">Applications are currently under corporate validation. Shortlists will be published soon.</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
