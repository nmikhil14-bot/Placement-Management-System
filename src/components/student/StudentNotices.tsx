import React, { useState } from "react";
import { Notice } from "../../types";
import { Bell, Search, AlertCircle, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

interface StudentNoticesProps {
  notices: Notice[];
}

export function StudentNotices({ notices }: StudentNoticesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "All" || notice.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Calculate paginated slice
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = filteredNotices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border-red-100";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6" id="student-notices-view">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University Notice Board</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Stay updated with current guidelines, upcoming drive tests, and campus placement mandates.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements, exams, test lists..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Company">Company Specific</option>
            <option value="Exam">Exam & Assessments</option>
            <option value="Placement">Placement Drives</option>
            <option value="Reminder">Reminders</option>
            <option value="Announcement">Announcements</option>
          </select>
        </div>
      </div>

      {/* Notice list */}
      {currentNotices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
          <p className="text-sm text-slate-500 italic">No notice board announcements published matching the criteria.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {currentNotices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded-md border border-indigo-100">
                    {notice.type}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${getPriorityStyle(notice.priority)}`}>
                    {notice.priority} Priority
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : "Today"}
                </div>
              </div>

              <h3 className="text-md font-bold text-slate-900 mb-2 leading-tight">{notice.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                {notice.content}
              </p>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-5">
              <span className="text-xs text-slate-500 font-semibold">
                Page {currentPage} of {totalPages} ({filteredNotices.length} announcements)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  Next
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
